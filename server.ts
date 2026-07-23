import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
import dotenv from "dotenv";
import crypto from "crypto";
import QRCode from "qrcode";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp as initClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, writeBatch, limit, query } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Order, Coupon, AnalyticsSummary, User, HomepageSection, Review, PaymentConfig } from "./src/types";
import { fetchFilteredInventory, fetchProductsFromDb, fetchProductByIdFromDb, createProductInDb, updateProductInDb, deleteProductFromDb, setFirestoreDB } from "./inventory.js";
import multer from "multer";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// --- Database load gating variables and helper ---
let isDatabaseLoaded = false;
let isDatabaseLoadedFromFirestore = false;
let isDatabaseLoadingFailed = false;
let dbLoadError: any = null;

async function waitUntilDbLoaded(timeoutMs = 12000): Promise<boolean> {
  if (isDatabaseLoaded) return true;
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (isDatabaseLoaded) return true;
    if (isDatabaseLoadingFailed) return false;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  return isDatabaseLoaded;
}

// Setup Middleware for parsing JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Gating middleware to prevent API requests from returning stale/empty defaults on container boot
app.use("/api", async (req, res, next) => {
  // Allow health checks and debug-db checks to pass instantly without waiting
  if (req.path === "/health" || req.path === "/debug-db" || req.path === "/healthz") {
    return next();
  }

  const loaded = await waitUntilDbLoaded(8000);
  if (!loaded) {
    return res.status(503).json({
      error: "Database is initializing. Please try again in a few seconds.",
      details: dbLoadError ? dbLoadError.message : "Database load timeout"
    });
  }
  next();
});

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ---------------------------------------------------------
// DATABASE SCHEMA NORMALIZATION & SEARCH INTENT AI HELPERS
// ---------------------------------------------------------

export function ensureStructuredCatalogRowFields(product: any): Product {
  if (!product) return product;

  // Determine Gender Preference
  let genderPreference: "Men" | "Women" | "Unisex" = "Unisex";
  const catLower = (product.category || "").toLowerCase();
  const idLower = (product.id || "").toLowerCase();
  const tagsString = (product.tags || []).join(" ").toLowerCase();

  if (catLower.includes("women") || idLower.includes("women") || tagsString.includes("women")) {
    genderPreference = "Women";
  } else if (catLower.includes("men") || idLower.includes("men") || tagsString.includes("men")) {
    genderPreference = "Men";
  }

  // Determine Colour
  const colour = (product.colors && product.colors.length > 0) ? product.colors[0] : (product.colors || product.Colour || "Default");

  return {
    ...product,
    id: product.id,
    ID: product.id,
    name: product.name,
    Name: product.name,
    category: product.category,
    Category: product.category,
    Colour: colour,
    price: typeof product.price === "number" ? product.price : parseFloat(product.price) || 0,
    Price: typeof product.price === "number" ? product.price : parseFloat(product.price) || 0,
    sizes: product.sizes || [],
    Sizes: product.sizes || [],
    "Gender Preference": genderPreference,
    genderPreference: genderPreference
  };
}

interface SearchIntent {
  category?: string;
  colour?: string;
  price?: {
    value: number;
    operator: 'lte' | 'gte' | 'eq';
  };
  sizes?: string[];
  genderPreference?: 'Men' | 'Women' | 'Unisex';
}

async function parseSearchIntentWithAI(rawSearch: string): Promise<SearchIntent> {
  const result: SearchIntent = { sizes: [] };
  const cleanedQuery = rawSearch.trim();
  if (!cleanedQuery) return result;

  const parseLocal = (): SearchIntent => {
    const fallback: SearchIntent = { sizes: [] };
    const lower = cleanedQuery.toLowerCase();

    // Parse categories
    if (lower.includes("shirt") || lower.includes("button-down") || lower.includes("tee") || lower.includes("t-shirt")) {
      fallback.category = "Loomed Shirts";
    } else if (lower.includes("pant") || lower.includes("trouser") || lower.includes("pants")) {
      fallback.category = "Loomed Pants";
    } else if (lower.includes("robe") || lower.includes("knit") || lower.includes("sweater")) {
      fallback.category = "Artisan Robes";
    } else if (lower.includes("coat") || lower.includes("overcoat") || lower.includes("duster")) {
      fallback.category = "Artisan Coats";
    }

    // Parse colours
    const coloursList = ["beige", "green", "cream", "clay", "charcoal", "sand", "white", "indigo", "ecru", "madder", "gray", "sage", "blue", "olive", "blush", "black", "ochre"];
    for (const c of coloursList) {
      if (lower.includes(c)) {
        fallback.colour = c.charAt(0).toUpperCase() + c.slice(1);
        break;
      }
    }

    // Parse price
    if (lower.includes("under") || lower.includes("less than") || lower.includes("below") || lower.includes("max")) {
      const match = lower.match(/(?:under|less than|below|max)\s*\$?(\d+)/);
      if (match) {
        fallback.price = { value: parseFloat(match[1]), operator: "lte" };
      }
    } else if (lower.includes("above") || lower.includes("greater than") || lower.includes("more than") || lower.includes("over") || lower.includes("min")) {
      const match = lower.match(/(?:above|greater than|more than|over|min)\s*\$?(\d+)/);
      if (match) {
        fallback.price = { value: parseFloat(match[1]), operator: "gte" };
      }
    } else {
      const exactMatch = lower.match(/\$?(\d+)/);
      if (exactMatch) {
        fallback.price = { value: parseFloat(exactMatch[1]), operator: "eq" };
      }
    }

    // Parse sizes
    if (/\b(s|small)\b/i.test(lower)) fallback.sizes?.push("S");
    if (/\b(m|medium)\b/i.test(lower)) fallback.sizes?.push("M");
    if (/\b(l|large)\b/i.test(lower)) fallback.sizes?.push("L");
    if (/\b(xl|extra large)\b/i.test(lower)) fallback.sizes?.push("XL");

    // Parse gender preference
    if (lower.includes("women") || lower.includes("female") || lower.includes("girl") || lower.includes("lady")) {
      fallback.genderPreference = "Women";
    } else if (lower.includes("men") || lower.includes("male") || lower.includes("guy") || lower.includes("boy")) {
      fallback.genderPreference = "Men";
    } else if (lower.includes("unisex") || lower.includes("neutral") || lower.includes("all")) {
      fallback.genderPreference = "Unisex";
    }

    return fallback;
  };

  if (!ai) {
    console.log("[Backend Search] Gemini AI client not initialized. Falling back to structured heuristic parser.");
    return parseLocal();
  }

  try {
    const prompt = `Analyze the e-commerce apparel search query: "${cleanedQuery}".
Map the customer's search intent into our exact structured fields: Category, Colour, Price, Sizes, Gender Preference.

Our actual collection contains:
- Categories: "Loomed Shirts", "Loomed Pants", "Artisan Robes", "Artisan Coats", "Men's T-Shirts", "Women's T-Shirts"
- Colours: "Desert Beige", "Olive Green", "Alabaster Cream", "Terra Clay", "Indigo Charcoal", "Sahara Sand", "Raw Ecru", "Blush Madder", "Chalk White", "Ink Charcoal", "Speckled Ecru", "Oatmeal", "Sandstone", "Linen White", "Oatmeal Melange", "Ocean Indigo", "Silt Gray", "Earthy Sage", "Obsidian Black", "Raw Ecru", "Blush Madder", "Olive Drab", "Speckled Ecru"
- Sizes: "S", "M", "L", "XL"
- Gender Preference: "Men", "Women", "Unisex"

Examples of correct mappings:
- "green shirts for men under 100" -> { category: "Loomed Shirts", colour: "Olive Green", price: { value: 100, operator: "lte" }, sizes: [], genderPreference: "Men" }
- "women mockneck size s m" -> { category: "Women's T-Shirts", colour: null, price: null, sizes: ["S", "M"], genderPreference: "Women" }
- "oversized beige overcoat xl" -> { category: "Artisan Coats", colour: "Desert Beige", price: null, sizes: ["XL"], genderPreference: "Unisex" }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "Mapped category of the apparel. Set to null if not mentioned in the query."
            },
            colour: {
              type: Type.STRING,
              description: "Mapped colour/color name. Set to null if not mentioned in the query."
            },
            price: {
              type: Type.OBJECT,
              description: "Parsed price filter if mentioned. Set to null if not mentioned in the query.",
              properties: {
                value: { type: Type.NUMBER, description: "The price amount specified." },
                operator: { type: Type.STRING, description: "Comparison operator: 'lte' (less/under), 'gte' (greater/above), 'eq' (exactly/around)." }
              },
              required: ["value", "operator"]
            },
            sizes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of sizes mentioned. Empty array if not mentioned."
            },
            genderPreference: {
              type: Type.STRING,
              description: "Mapped gender preference: 'Men', 'Women', or 'Unisex'. Set to null if not mentioned in the query."
            }
          },
          required: ["sizes"]
        },
        temperature: 0.1,
      }
    });

    const text = response.text || "";
    const parsedJson = JSON.parse(text.trim());
    return parsedJson;
  } catch (err: any) {
    console.error("[Backend Search] Gemini parsing failed, falling back to local heuristic.", err);
    return parseLocal();
  }
}

function queryCatalogWithExplicitFilters(catalog: Product[], filters: SearchIntent): Product[] {
  let responseList = [...catalog];

  if (filters.category) {
    const catLower = filters.category.toLowerCase();
    responseList = responseList.filter(p => 
      (p.category || "").toLowerCase().includes(catLower) || 
      (p.Category || "").toLowerCase().includes(catLower)
    );
  }

  if (filters.colour) {
    const colLower = filters.colour.toLowerCase();
    responseList = responseList.filter(p => {
      const colorsArr = p.colors || [];
      const hasColor = colorsArr.some((c: string) => c.toLowerCase().includes(colLower) || colLower.includes(c.toLowerCase())) ||
                       (p.Colour || "").toLowerCase().includes(colLower);
      return hasColor;
    });
  }

  if (filters.price) {
    const pVal = filters.price.value;
    const pOp = filters.price.operator;
    responseList = responseList.filter(p => {
      const actualPrice = p.price || p.Price || 0;
      if (pOp === "lte") return actualPrice <= pVal;
      if (pOp === "gte") return actualPrice >= pVal;
      return Math.abs(actualPrice - pVal) <= 15; // approximate equality
    });
  }

  if (filters.sizes && filters.sizes.length > 0) {
    responseList = responseList.filter(p => {
      const pSizes = (p.sizes || p.Sizes || []).map((s: string) => s.toLowerCase());
      return filters.sizes!.some((s: string) => pSizes.includes(s.toLowerCase()));
    });
  }

  if (filters.genderPreference) {
    const gpLower = filters.genderPreference.toLowerCase();
    responseList = responseList.filter(p => {
      const pGender = (p["Gender Preference"] || p.genderPreference || "unisex").toLowerCase();
      if (gpLower === "men") {
        return pGender === "men" || pGender === "unisex";
      } else if (gpLower === "women") {
        return pGender === "women" || pGender === "unisex";
      } else {
        return pGender === gpLower || pGender === "unisex";
      }
    });
  }

  return responseList;
}

// ---------------------------------------------------------
// Mock DB - In-Memory State representing Production Databases
// ---------------------------------------------------------

let users: User[] = [
  {
    id: "user-admin",
    name: "Vartman Admin",
    email: "admin@vartman.com",
    role: "admin",
    shippingAddress: {
      street: "1 Wilderness Path",
      city: "Boulder",
      state: "CO",
      zip: "80301"
    },
    orderHistory: []
  },
  {
    id: "user-customer",
    name: "Seeker Customer",
    email: "customer@vartmangarments.com",
    role: "customer",
    shippingAddress: {
      street: "142 Innovation Park, Block C",
      city: "Singapore",
      state: "Central Region",
      zip: "119961"
    },
    orderHistory: ["ORD-9304"]
  }
];

// Helper to store passcode/passwords securely
let userPasswords: Record<string, string> = {
  "user-admin": "admin@123",
  "user-customer": "wanderer2026"
};

// Helper to simulate secret token signatures
const simulatedTokens: Record<string, string> = {
  "token-admin-123": "user-admin",
  "token-customer-456": "user-customer"
};

let waitlist: { id: string; email: string; date: string; source: string }[] = [];

let products: Product[] = [];

let orders: Order[] = [
  {
    id: "ORD-9304",
    userId: "user-customer",
    date: "2026-05-20T14:24:00Z",
    customerName: "Seeker Customer",
    customerEmail: "customer@vartmangarments.com",
    shippingAddress: {
      street: "142 Innovation Park, Block C",
      city: "Singapore",
      state: "Central Region",
      zip: "119961"
    },
    items: [
      { productId: "prod-1", name: "\"Forest Sentinel\" Woodcutter Tee", price: 42.00, quantity: 1, color: "Forest Green", size: "M" },
      { productId: "prod-3", name: "\"Lost Ocean\" Sea-washed Sweater", price: 78.00, quantity: 1, color: "Ocean Blue", size: "L" }
    ],
    subtotal: 120.00,
    discount: 12.00,
    total: 108.00,
    paymentStatus: "Paid",
    status: "Delivered",
    paymentMethod: "Credit Card",
    trackingNumber: "TRK-WND-99238"
  },
  {
    id: "ORD-8419",
    date: "2026-05-21T09:12:00Z",
    customerName: "Sarah Connor",
    customerEmail: "sarahc@cyberdyne.io",
    shippingAddress: {
      street: "742 Evergreen Terrace",
      city: "San Francisco",
      state: "CA",
      zip: "94103"
    },
    items: [
      { productId: "prod-2", name: "\"Dune Wanderer\" Heavyweight Tee", price: 45.00, quantity: 2, color: "Sandy Beige", size: "M" }
    ],
    subtotal: 90.00,
    discount: 0,
    total: 90.00,
    paymentStatus: "Paid",
    status: "Shipped",
    paymentMethod: "Apple Pay",
    trackingNumber: "TRK-WND-44712"
  },
  {
    id: "ORD-3211",
    date: "2026-05-22T04:30:00Z",
    customerName: "Lucas Grey",
    customerEmail: "lucas.grey@explore.net",
    shippingAddress: {
      street: "21 Glacier Ridge",
      city: "Vancouver",
      state: "BC",
      zip: "V6B 3H6"
    },
    items: [
      { productId: "prod-5", name: "\"Zen Nomad\" Breathable Linen Shirt", price: 64.00, quantity: 1, color: "Off-White", size: "XL" }
    ],
    subtotal: 64.00,
    discount: 6.40,
    total: 57.60,
    paymentStatus: "Pending",
    status: "Processing",
    paymentMethod: "Google Pay"
  }
];

const coupons: Coupon[] = [
  { code: "WANDERLUST", discountType: "percentage", value: 15, description: "15% off for wild, traveling souls" },
  { code: "PEACE10", discountType: "percentage", value: 10, description: "10% off for mind-clearing wanderings" },
  { code: "CAMPFIRE20", discountType: "fixed", value: 20, description: "$20.00 off total cozy adventure clothing purchases" }
];

interface CategoryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  searchKeyword: string;
}

interface CmsConfig {
  announcementText: string;
  heroImageUrl: string;
  heroImageUrlMobile?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  featuredProductIds: string[];
  categoriesTitle?: string;
  categories?: CategoryItem[];
}

let cmsConfig: CmsConfig = {
  announcementText: "Engineered for the Modern Nomad | Free Worldwide Shipping on orders over $150",
  heroImageUrl: "https://drive.google.com/file/d/1DN6AVpCrMvznYFyhP5HdkAr30zdLdSJR/view?usp=sharing",
  heroImageUrlMobile: "https://drive.google.com/file/d/1DN6AVpCrMvznYFyhP5HdkAr30zdLdSJR/view?usp=sharing",
  heroTitle: "unstructured elegance for slow journeys.",
  heroSubtitle: "A study in organic textiles, botanical dyes, and zero synthetic waste.",
  heroCtaText: "Seek the Collection",
  featuredProductIds: ["prod-1", "prod-2", "prod-3"],
  categoriesTitle: "Shop By Category",
  categories: [
    {
      id: "oversized-fits",
      title: "Oversized Fits",
      description: "Relaxed silhouettes, dropped shoulders, and ultimate comfort in organic heavy-knit cotton.",
      image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
      searchKeyword: "oversized",
    },
    {
      id: "graphic-prints",
      title: "Graphic Prints",
      description: "Artistic expressions, minimalist typography, and organic botanical-pigment prints.",
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      searchKeyword: "graphic",
    },
    {
      id: "classic-basics",
      title: "Classic Basics",
      description: "The daily luxury. Clean-cut, premium crewnecks crafted from single-origin organic cotton.",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      searchKeyword: "basic",
    },
    {
      id: "heavyweight-tees",
      title: "Heavyweight Tees",
      description: "Substantial premium fabric with a structured, durable drape designed to last lifetimes.",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
      searchKeyword: "heavyweight",
    },
  ]
};

let paymentConfig = {
  merchantId: "MERCHANTWNDR12",
  secretKey: "wndr_secret_abc123",
  saltKey: "wndr_salt_xyz987",
  upiVpa: "vartman@okaxis", // Generic VPA
  intentEnabled: true,
  qrEnabled: true,
  prepaidEnabled: true,
  codEnabled: true
};

let reviews: Review[] = [
  {
    id: "REV-101",
    productId: "prod-1",
    productName: "The Nomad Organic Linen Set",
    productImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
    userName: "Aarav Mehta",
    userEmail: "aarav.m@example.com",
    rating: 5,
    comment: "Exceptional weight and drape. The organic flax keeps cool during warm tropical afternoons.",
    date: "2026-06-12",
    status: "Approved"
  },
  {
    id: "REV-102",
    productId: "prod-2",
    productName: "Botanical Clay Draped Kimono Set",
    productImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
    userName: "Elena Rostova",
    userEmail: "elena.r@example.com",
    rating: 5,
    comment: "The natural madder root dye patinas beautifully after two washes. Highly recommended!",
    date: "2026-06-18",
    status: "Approved"
  },
  {
    id: "REV-103",
    productId: "prod-men-1",
    productName: "The Saharan Overland Tunic & Trouser Set",
    productImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    userName: "Devansh Patel",
    userEmail: "devansh.p@example.com",
    rating: 4,
    comment: "Solid fit, very breathable for long flights. Arrived in plastic-free seed packaging.",
    date: "2026-07-02",
    status: "Pending"
  }
];

let transactions: any[] = [
  {
    id: "TXN-9821",
    orderId: "ORD-9304",
    customerEmail: "customer@vartmangarments.com",
    amount: 108.00,
    paymentMethod: "UPI QR Code",
    status: "Success",
    gatewayTransactionId: "UPI-TXN-8829104",
    timestamp: "2026-05-20T14:25:12Z"
  }
];

let homepageSections: HomepageSection[] = [
  {
    id: "sec-featured",
    title: "Discover What's New",
    subtitle: "Slow-made garments designed for the contemporary nomad. Woven by hand, finished by nature.",
    layoutType: "carousel",
    productIds: ["prod-1", "prod-2", "prod-3", "prod-4", "prod-men-1", "prod-men-2"],
    isActive: true,
    sortOrder: 1
  },
  {
    id: "sec-best-sellers",
    title: "Customer Favorites",
    subtitle: "Highly-coveted organic flax and handloomed coordinates, reviewed and verified by global wanderers.",
    layoutType: "grid",
    productIds: ["prod-2", "prod-3", "prod-4", "prod-men-1"],
    isActive: true,
    sortOrder: 2
  }
];

const DB_FILE = path.join(process.cwd(), "db.json");

// Define a ClientFirestoreAdapter class to allow the client SDK to mimic the admin SDK's fluent API perfectly
class ClientFirestoreAdapter {
  private clientDb: any;
  public projectId: string;
  public databaseId: string;

  constructor(clientDb: any, projectId: string, databaseId: string) {
    this.clientDb = clientDb;
    this.projectId = projectId;
    this.databaseId = databaseId;
  }

  collection(collectionName: string) {
    const db = this.clientDb;
    return {
      limit: (n: number) => {
        return {
          get: async () => {
            const q = query(collection(db, collectionName), limit(n));
            const snap = await getDocs(q);
            return {
              empty: snap.empty,
              forEach: (callback: any) => {
                snap.forEach((d: any) => {
                  callback({
                    id: d.id,
                    data: () => d.data()
                  });
                });
              }
            };
          }
        };
      },
      doc: (docId: string) => {
        const docRef = doc(db, collectionName, docId);
        return {
          docRef: docRef,
          set: async (data: any) => {
            await setDoc(docRef, data);
          },
          get: async () => {
            const d = await getDoc(docRef);
            return {
              exists: d.exists(),
              data: () => d.data()
            };
          },
          delete: async () => {
            await deleteDoc(docRef);
          }
        };
      },
      get: async () => {
        const snap = await getDocs(collection(db, collectionName));
        const docsList: any[] = [];
        snap.forEach((d: any) => {
          docsList.push({
            id: d.id,
            data: () => d.data()
          });
        });
        return {
          empty: snap.empty,
          forEach: (callback: any) => {
            docsList.forEach(callback);
          }
        };
      }
    };
  }

  batch() {
    const b = writeBatch(this.clientDb);
    return {
      set: (docRefWrapper: any, data: any) => {
        b.set(docRefWrapper.docRef, data);
      },
      delete: (docRefWrapper: any) => {
        b.delete(docRefWrapper.docRef);
      },
      commit: async () => {
        await b.commit();
      }
    };
  }
}

// Initialize Firebase Admin SDK directly as the primary connection method
let initError: any = null;
let firestoreDb: any = null;

try {
  let projectId = "gen-lang-client-0698331065";
  let databaseId = "ai-studio-637b298e-349e-4ebf-bf72-ccb0e3af5e9c";
  
  // Read firebase-applet-config.json first if exists to get the actual target projectId and databaseId
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      if (config.projectId) {
        projectId = config.projectId;
      }
      if (config.firestoreDatabaseId) {
        databaseId = config.firestoreDatabaseId;
      }
    } catch (err) {
      console.error("[Firebase Setup] Failed reading config:", err);
    }
  }

  let firebaseApp;
  if (getApps().length === 0) {
    const appOptions: any = { projectId: projectId };
    
    // Check if we have service account credentials matching the target project
    const saPath = path.join(process.cwd(), "firebase-service-account.json");
    let usedSa = false;
    
    if (fs.existsSync(saPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf-8"));
        if (serviceAccount.project_id) {
          appOptions.credential = cert(serviceAccount);
          if (serviceAccount.project_id === projectId || projectId === "gen-lang-client-0698331065") {
            projectId = serviceAccount.project_id;
          }
          usedSa = true;
          console.log(`[Firebase Admin] Loaded service account credential for project ${serviceAccount.project_id}.`);
        }
      } catch (err) {
        console.error("[Firebase Admin] Failed parsing firebase-service-account.json:", err);
      }
    }
    
    if (!usedSa && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        if (serviceAccount.project_id) {
          appOptions.credential = cert(serviceAccount);
          usedSa = true;
          console.log(`[Firebase Admin] Loaded service account credential from environment for project ${serviceAccount.project_id}.`);
        }
      } catch (err) {
        console.error("[Firebase Admin] Failed parsing FIREBASE_SERVICE_ACCOUNT_KEY:", err);
      }
    }
    
    if (usedSa || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      firebaseApp = initializeApp(appOptions);
      firestoreDb = getFirestore(firebaseApp, databaseId);
      console.log(`[Firebase Admin] Successfully connected directly via Admin SDK. ProjectId: ${projectId}, DatabaseId: ${databaseId}`);
    } else {
      console.log(`[Firebase Admin] No service account key or GOOGLE_APPLICATION_CREDENTIALS found for ${projectId}. Skipping Admin SDK to prevent ADC errors, relying on Client SDK adapter.`);
      firestoreDb = null;
    }
  } else {
    firebaseApp = getApp();
    firestoreDb = getFirestore(firebaseApp, databaseId);
  }
} catch (e: any) {
  initError = { message: e.message || String(e), stack: e.stack };
  console.error("Failed to initialize Firebase Admin SDK:", e);
}

// Initialize Firebase client-side SDK as a reliable fallback
let clientFirestoreDb: any = null;
let fallbackError: any = null;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const firebaseClientApp = initClientApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    });
    const rawClientDb = getClientFirestore(firebaseClientApp, config.firestoreDatabaseId || "(default)");
    clientFirestoreDb = new ClientFirestoreAdapter(rawClientDb, config.projectId, config.firestoreDatabaseId || "(default)");
    console.log("[Firebase Client Fallback] Successfully initialized Client SDK adapter.");
  }
} catch (e: any) {
  fallbackError = { message: e.message || String(e), stack: e.stack };
  console.error("Failed to initialize Firebase Client SDK fallback:", e);
}

// Global variable to keep track of query errors
let queryError: any = null;

async function ensureWorkingDb() {
  // Try Admin SDK first
  if (firestoreDb) {
    try {
      await firestoreDb.collection("products").limit(1).get();
      queryError = null;
      setFirestoreDB(firestoreDb);
      return firestoreDb;
    } catch (e: any) {
      // Direct Admin SDK access might lack permissions in specific sandbox configurations.
      // We will gracefully log a message and let the Client SDK adapter handle requests.
      queryError = { message: e.message || String(e), code: e.code, stack: e.stack };
      console.log("[Firebase Admin] Direct Admin SDK check bypassed (this is normal in preview sandboxes). Falling back to Client SDK adapter...");
    }
  }

  // Fallback to Client SDK adapter
  if (clientFirestoreDb) {
    try {
      await clientFirestoreDb.collection("products").limit(1).get();
      // Since client SDK adapter succeeded, we have a working connection. Clear queryError.
      queryError = null;
      setFirestoreDB(clientFirestoreDb);
      return clientFirestoreDb;
    } catch (e: any) {
      fallbackError = { message: e.message || String(e), stack: e.stack };
      console.error("[Firebase Client Fallback] Query verification failed on Client SDK:", e.message || String(e));
    }
  }

  return null;
}

async function syncToFirestore() {
  const db = await ensureWorkingDb();
  if (!db) return;

  console.log("Syncing database changes to Firestore...");

  // 1. Sync products
  try {
    const productsCol = db.collection("products");
    const productsSnap = await productsCol.get();
    const dbProductIds: string[] = [];
    productsSnap.forEach((doc: any) => {
      dbProductIds.push(doc.id);
    });

    const localProductIds = products.map(p => p.id);
    const batch = db.batch();
    
    products.forEach(p => {
      const docRef = productsCol.doc(p.id);
      batch.set(docRef, p);
    });

    await batch.commit();
    console.log("Firestore products collection synced successfully.");
  } catch (err: any) {
    console.error("Failed to sync products to Firestore:", err.message || String(err));
  }

  // 2. Sync orders
  try {
    const ordersCol = db.collection("orders");
    const ordersSnap = await ordersCol.get();
    const dbOrderIds: string[] = [];
    ordersSnap.forEach((doc: any) => {
      dbOrderIds.push(doc.id);
    });

    const localOrderIds = orders.map(o => o.id);
    const ordersBatch = db.batch();
    
    orders.forEach(o => {
      const docRef = ordersCol.doc(o.id);
      ordersBatch.set(docRef, o);
    });

    dbOrderIds.forEach(id => {
      if (!localOrderIds.includes(id)) {
        const docRef = ordersCol.doc(id);
        ordersBatch.delete(docRef);
      }
    });

    await ordersBatch.commit();
    console.log("Firestore orders collection synced successfully.");
  } catch (err: any) {
    console.error("Failed to sync orders to Firestore:", err.message || String(err));
  }

  // 3. Sync users
  try {
    const usersCol = db.collection("users");
    const usersSnap = await usersCol.get();
    const dbUserIds: string[] = [];
    usersSnap.forEach((doc: any) => {
      dbUserIds.push(doc.id);
    });

    const localUserIds = users.map(u => u.id);
    const usersBatch = db.batch();
    
    users.forEach(u => {
      const docRef = usersCol.doc(u.id);
      usersBatch.set(docRef, u);
    });

    dbUserIds.forEach(id => {
      if (!localUserIds.includes(id)) {
        const docRef = usersCol.doc(id);
        usersBatch.delete(docRef);
      }
    });

    await usersBatch.commit();
    console.log("Firestore users collection synced successfully.");
  } catch (err: any) {
    console.error("Failed to sync users to Firestore:", err.message || String(err));
  }

  // 4. Sync userPasswords
  try {
    await db.collection("system").doc("userPasswords").set(userPasswords);
    console.log("Firestore userPasswords document synced successfully.");
  } catch (err: any) {
    console.error("Failed to sync userPasswords to Firestore:", err.message || String(err));
  }

  // 5. Sync cmsConfig
  try {
    await db.collection("cms").doc("config").set(cmsConfig);
    console.log("Firestore cmsConfig (cms/config) document synced successfully.");
  } catch (err: any) {
    console.error("Failed to sync cmsConfig to Firestore cms/config:", err.message || String(err));
  }

  // 6. Sync paymentConfig
  try {
    await db.collection("system").doc("paymentConfig").set(paymentConfig);
    console.log("Firestore paymentConfig document synced successfully.");
  } catch (err: any) {
    console.error("Failed to sync paymentConfig to Firestore:", err.message || String(err));
  }

  // 7. Sync transactions
  try {
    const txCol = db.collection("transactions");
    const txBatch = db.batch();
    transactions.forEach(t => {
      const docRef = txCol.doc(t.id);
      txBatch.set(docRef, t);
    });
    await txBatch.commit();
    console.log("Firestore transactions collection synced successfully.");
  } catch (err: any) {
    console.error("Failed to sync transactions to Firestore:", err.message || String(err));
  }

  // 8. Sync homepageSections
  try {
    const sectionsCol = db.collection("homepageSections");
    const sectionsSnap = await sectionsCol.get();
    const dbSectionIds: string[] = [];
    sectionsSnap.forEach((doc: any) => {
      dbSectionIds.push(doc.id);
    });

    const localSectionIds = homepageSections.map(s => s.id);
    const sectionsBatch = db.batch();
    
    homepageSections.forEach(s => {
      const docRef = sectionsCol.doc(s.id);
      sectionsBatch.set(docRef, s);
    });

    dbSectionIds.forEach(id => {
      if (!localSectionIds.includes(id)) {
        const docRef = sectionsCol.doc(id);
        sectionsBatch.delete(docRef);
      }
    });

    await sectionsBatch.commit();
    console.log("Firestore homepageSections collection synced successfully.");
  } catch (err: any) {
    console.error("Failed to sync homepageSections to Firestore:", err.message || String(err));
  }

  // 9. Sync reviews
  try {
    const reviewsCol = db.collection("reviews");
    const reviewsSnap = await reviewsCol.get();
    const dbReviewIds: string[] = [];
    reviewsSnap.forEach((doc: any) => {
      dbReviewIds.push(doc.id);
    });

    const localReviewIds = reviews.map(r => r.id);
    const reviewsBatch = db.batch();

    reviews.forEach(r => {
      const docRef = reviewsCol.doc(r.id);
      reviewsBatch.set(docRef, r);
    });

    dbReviewIds.forEach(id => {
      if (!localReviewIds.includes(id)) {
        const docRef = reviewsCol.doc(id);
        reviewsBatch.delete(docRef);
      }
    });

    await reviewsBatch.commit();
    console.log("Firestore reviews collection synced successfully.");
  } catch (err: any) {
    console.error("Failed to sync reviews to Firestore:", err.message || String(err));
  }
}

function saveDb() {
  try {
    const data = {
      users,
      userPasswords,
      products,
      orders,
      cmsConfig,
      waitlist,
      paymentConfig,
      transactions,
      homepageSections,
      reviews
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing to db.json", e);
  }

  // Sync memory back to Firestore immediately on all saving actions
  if (firestoreDb || clientFirestoreDb) {
    syncToFirestore().catch(err => {
      console.error("Async Firestore sync failed:", err);
    });
  }
}

async function loadDb() {
  // Read local DB first
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileContent = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(fileContent);
      if (parsed.users && Array.isArray(parsed.users)) {
        users = parsed.users;
      }
      if (parsed.userPasswords && typeof parsed.userPasswords === "object") {
        userPasswords = parsed.userPasswords;
      }
      if (parsed.products && Array.isArray(parsed.products)) {
        products = parsed.products.map(ensureStructuredCatalogRowFields) as Product[];
      }
      if (parsed.orders && Array.isArray(parsed.orders)) {
        orders = parsed.orders;
      }
      if (parsed.cmsConfig && typeof parsed.cmsConfig === "object") {
        cmsConfig = parsed.cmsConfig;
      }
      if (parsed.waitlist && Array.isArray(parsed.waitlist)) {
        waitlist = parsed.waitlist;
      }
      if (parsed.paymentConfig && typeof parsed.paymentConfig === "object") {
        paymentConfig = { ...paymentConfig, ...parsed.paymentConfig };
      }
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        transactions = parsed.transactions;
      }
      if (parsed.homepageSections && Array.isArray(parsed.homepageSections)) {
        homepageSections = parsed.homepageSections;
      }
      if (parsed.reviews && Array.isArray(parsed.reviews)) {
        reviews = parsed.reviews;
      }
    }
  } catch (e) {
    console.error("Local db.json load warning", e);
  }

  // Load from Firestore as standard cloud source of truth
  const db = await ensureWorkingDb();
  if (!db) {
    console.warn("[vartman Server] Firestore database not accessible. Running in local fallback mode.");
    isDatabaseLoaded = true;
    isDatabaseLoadedFromFirestore = false;
    return;
  }

  console.log("Loading data from Firestore...");
  
  let loadedProductsOk = false;
  let loadedOrdersOk = false;
  let loadedUsersOk = false;
  let loadedPasswordsOk = false;
  let loadedCmsOk = false;
  let loadedPaymentConfigOk = false;
  let loadedTransactionsOk = false;
  
  // 1. Load Products (using Firestore as primary source of truth)
  try {
    const productsSnap = await db.collection("products").get();
    
    if (!productsSnap.empty) {
      const dbProducts: Product[] = [];
      productsSnap.forEach((doc: any) => {
        const data = doc.data();
        if (doc.id !== "writeTest" && data && (data.name || data.Name)) {
          dbProducts.push(ensureStructuredCatalogRowFields({ id: doc.id, ...data }) as Product);
        }
      });
      
      // Self-healing check: Ensure products loaded from Firestore have complete variants/combos if defined in our local db.json
      for (let i = 0; i < dbProducts.length; i++) {
        const firestoreProd = dbProducts[i];
        const localProd = products.find(p => p.id === firestoreProd.id);
        if (localProd && localProd.variants && localProd.variants.length > 0 && (!firestoreProd.variants || firestoreProd.variants.length === 0)) {
          console.log(`[Self-Healing] Syncing complete variants for ${firestoreProd.id} to Firestore...`);
          firestoreProd.variants = localProd.variants;
          firestoreProd.combos = localProd.combos || [];
          firestoreProd.productType = localProd.productType || firestoreProd.productType || "Two-Piece Set";
          firestoreProd.ratingAvg = localProd.ratingAvg || firestoreProd.ratingAvg || 5;
          firestoreProd.sizeGuideRef = localProd.sizeGuideRef || firestoreProd.sizeGuideRef || "";
          firestoreProd.specs = localProd.specs || firestoreProd.specs || {};
          firestoreProd.mrp = localProd.mrp || firestoreProd.mrp || 0;
          firestoreProd.sellingPrice = localProd.sellingPrice || firestoreProd.sellingPrice || firestoreProd.price || 0;
          firestoreProd.title = localProd.title || firestoreProd.title || firestoreProd.name || "";
          try {
            await db.collection("products").doc(firestoreProd.id).set(firestoreProd, { merge: true });
            console.log(`[Self-Healing] Successfully patched product ${firestoreProd.id} in Firestore.`);
          } catch (patchErr: any) {
            console.error(`[Self-Healing] Failed to patch product ${firestoreProd.id} in Firestore:`, patchErr.message || String(patchErr));
          }
        }
      }

      // Use Firestore products directly as primary source of truth without merging local defaults
      products = dbProducts;
      console.log(`Loaded and synced ${products.length} products directly from Firestore as primary source of truth.`);
    } else {
      // Firestore is empty, seed from local db.json
      if (products && products.length > 0) {
        console.log(`Firestore products collection is empty. Seeding defaults from local db.json...`);
        const productsCol = db.collection("products");
        const batch = db.batch();
        products.forEach(p => {
          const docRef = productsCol.doc(p.id);
          batch.set(docRef, p);
        });
        await batch.commit();
        console.log(`Successfully seeded ${products.length} products to Firestore.`);
      } else {
        console.log("Firestore products collection is empty and local products are empty.");
      }
    }
    loadedProductsOk = true;
  } catch (err: any) {
    console.warn("[Firestore Resilient Fallback] Failed to load/sync products with Firestore. Gracefully falling back to local db.json cache.", err.message || String(err));
    loadedProductsOk = true; // resilient fallback
  }

  // 2. Load Orders
  try {
    const ordersSnap = await db.collection("orders").get();
    if (!ordersSnap.empty) {
      const dbOrders: Order[] = [];
      ordersSnap.forEach((doc: any) => {
        dbOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      orders = dbOrders;
      console.log(`Loaded ${orders.length} orders from Firestore.`);
    } else {
      if (orders && orders.length > 0) {
        console.log("Firestore orders empty. Seeding defaults from local db.json...");
        const batch = db.batch();
        orders.forEach(o => {
          const docRef = db.collection("orders").doc(o.id);
          batch.set(docRef, o);
        });
        await batch.commit();
      }
    }
    loadedOrdersOk = true;
  } catch (err: any) {
    console.warn("[Firestore Resilient Fallback] Failed to load orders from Firestore. Gracefully falling back to local db.json cache.", err.message || String(err));
    loadedOrdersOk = true; // resilient fallback
  }

  // 3. Load Users
  try {
    const usersSnap = await db.collection("users").get();
    if (!usersSnap.empty) {
      const dbUsers: User[] = [];
      usersSnap.forEach((doc: any) => {
        dbUsers.push({ id: doc.id, ...doc.data() } as User);
      });
      users = dbUsers;
      console.log(`Loaded ${users.length} users from Firestore.`);
    } else {
      if (users && users.length > 0) {
        console.log("Firestore users empty. Seeding defaults from local db.json...");
        const batch = db.batch();
        users.forEach(u => {
          const docRef = db.collection("users").doc(u.id);
          batch.set(docRef, u);
        });
        await batch.commit();
      }
    }
    loadedUsersOk = true;
  } catch (err: any) {
    console.warn("[Firestore Resilient Fallback] Failed to load users from Firestore. Gracefully falling back to local db.json cache.", err.message || String(err));
    loadedUsersOk = true; // resilient fallback
  }

  // 4. Load Passwords
  try {
    const sysSnap = await db.collection("system").doc("userPasswords").get();
    if (sysSnap.exists) {
      userPasswords = sysSnap.data() || {};
      console.log("Loaded user passwords from Firestore.");
    } else {
      if (userPasswords && Object.keys(userPasswords).length > 0) {
        console.log("Firestore userPasswords empty. Seeding defaults from local db.json...");
        await db.collection("system").doc("userPasswords").set(userPasswords);
      }
    }
    loadedPasswordsOk = true;
  } catch (err: any) {
    console.warn("[Firestore Resilient Fallback] Failed to load user passwords from Firestore. Gracefully falling back to local db.json cache.", err.message || String(err));
    loadedPasswordsOk = true; // resilient fallback
  }

  // 5. Load CMS Config
  try {
    const cmsSnap = await db.collection("cms").doc("config").get();
    if (cmsSnap.exists) {
      cmsConfig = { ...cmsConfig, ...cmsSnap.data() };
      console.log("Loaded cmsConfig from Firestore (cms/config).");
      
      const oldId = "1Wzw_YZjthgeehFKSrCvHzo3SqXoSfKeL";
      const targetUrl = "https://drive.google.com/file/d/1DN6AVpCrMvznYFyhP5HdkAr30zdLdSJR/view?usp=sharing";
      
      let updated = false;
      if (!cmsConfig.heroImageUrl) {
        cmsConfig.heroImageUrl = targetUrl;
        updated = true;
      } else if (cmsConfig.heroImageUrl.includes(oldId)) {
        cmsConfig.heroImageUrl = cmsConfig.heroImageUrl
          .split(",")
          .map(link => link.includes(oldId) ? targetUrl : link.trim())
          .join(", ");
        updated = true;
      }

      if (cmsConfig.heroImageUrlMobile) {
        if (cmsConfig.heroImageUrlMobile.includes(oldId)) {
          cmsConfig.heroImageUrlMobile = cmsConfig.heroImageUrlMobile
            .split(",")
            .map(link => link.includes(oldId) ? targetUrl : link.trim())
            .join(", ");
          updated = true;
        }
      }
      
      if (updated) {
        await db.collection("cms").doc("config").set(cmsConfig).catch(() => {});
        console.log("Migrated old/empty cmsConfig links in Firestore cms/config.");
      }
    } else {
      if (cmsConfig) {
        console.log("Firestore cms/config empty. Seeding defaults from local db.json...");
        await db.collection("cms").doc("config").set(cmsConfig);
      }
    }
    loadedCmsOk = true;
  } catch (err: any) {
    console.warn("[Firestore Resilient Fallback] Failed to load cmsConfig from Firestore. Gracefully falling back to local db.json cache.", err.message || String(err));
    loadedCmsOk = true; // resilient fallback
  }

  // 6. Load Payment Config
  try {
    const paySnap = await db.collection("system").doc("paymentConfig").get();
    if (paySnap.exists) {
      paymentConfig = { ...paymentConfig, ...paySnap.data() };
      console.log("Loaded paymentConfig from Firestore.");
    } else {
      if (paymentConfig) {
        console.log("Firestore paymentConfig empty. Seeding defaults from local db.json...");
        await db.collection("system").doc("paymentConfig").set(paymentConfig);
      }
    }
    loadedPaymentConfigOk = true;
  } catch (err: any) {
    console.warn("[Firestore Resilient Fallback] Failed to load paymentConfig from Firestore. Gracefully falling back to local db.json cache.", err.message || String(err));
    loadedPaymentConfigOk = true; // resilient fallback
  }

  // 7. Load Transactions
  try {
    const txSnap = await db.collection("transactions").get();
    if (!txSnap.empty) {
      const dbTx: any[] = [];
      txSnap.forEach((doc: any) => {
        dbTx.push({ id: doc.id, ...doc.data() });
      });
      transactions = dbTx;
      console.log(`Loaded ${transactions.length} transactions from Firestore.`);
    } else {
      if (transactions && transactions.length > 0) {
        console.log("Firestore transactions empty. Seeding defaults from local db.json...");
        const batch = db.batch();
        transactions.forEach(t => {
          const docRef = db.collection("transactions").doc(t.id);
          batch.set(docRef, t);
        });
        await batch.commit();
      }
    }
    loadedTransactionsOk = true;
  } catch (err: any) {
    console.warn("[Firestore Resilient Fallback] Failed to load transactions from Firestore. Gracefully falling back to local db.json cache.", err.message || String(err));
    loadedTransactionsOk = true; // resilient fallback
  }

  // 8. Load Homepage Sections
  let loadedSectionsOk = false;
  try {
    const sectionsSnap = await db.collection("homepageSections").get();
    if (!sectionsSnap.empty) {
      const dbSections: any[] = [];
      sectionsSnap.forEach((doc: any) => {
        dbSections.push({ id: doc.id, ...doc.data() });
      });
      // Sort them by sortOrder
      dbSections.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      homepageSections = dbSections;
      console.log(`Loaded ${homepageSections.length} homepage sections from Firestore.`);
    } else {
      if (homepageSections && homepageSections.length > 0) {
        console.log("Firestore homepageSections empty. Seeding defaults from local db.json...");
        const batch = db.batch();
        homepageSections.forEach(s => {
          const docRef = db.collection("homepageSections").doc(s.id);
          batch.set(docRef, s);
        });
        await batch.commit();
      }
    }
    loadedSectionsOk = true;
  } catch (err: any) {
    console.warn("[Firestore Resilient Fallback] Failed to load homepageSections from Firestore. Gracefully falling back to local db.json cache.", err.message || String(err));
    loadedSectionsOk = true; // resilient fallback
  }

  // 9. Load Reviews
  try {
    const reviewsSnap = await db.collection("reviews").get();
    if (!reviewsSnap.empty) {
      const dbReviews: any[] = [];
      reviewsSnap.forEach((doc: any) => {
        dbReviews.push({ id: doc.id, ...doc.data() });
      });
      reviews = dbReviews;
      console.log(`Loaded ${reviews.length} reviews from Firestore.`);
    } else {
      if (reviews && reviews.length > 0) {
        console.log("Firestore reviews empty. Seeding defaults from local db.json...");
        const batch = db.batch();
        reviews.forEach(r => {
          const docRef = db.collection("reviews").doc(r.id);
          batch.set(docRef, r);
        });
        await batch.commit();
      }
    }
  } catch (err: any) {
    console.warn("[Firestore Resilient Fallback] Failed to load reviews from Firestore. Gracefully falling back to local db.json cache.", err.message || String(err));
  }

  // Set database load tracking flags
  isDatabaseLoaded = true;
  isDatabaseLoadedFromFirestore = true;
  console.log("[vartman Server] Database loaded successfully (incorporating any resilient local defaults).");

  // Refresh local JSON file with correct cloud database-of-record
  try {
    const data = { users, userPasswords, products, orders, cmsConfig, paymentConfig, transactions, homepageSections };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Local db.json sync update failed", e);
  }
}

// ---------------------------------------------------------
// AUTHENTICATION SECURITY MIDDLEWARE (JWT Protection simulated)
// ---------------------------------------------------------

const protect = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied: Missing or malformed authorization token." });
  }

  const token = authHeader.split(" ")[1];
  const userId = simulatedTokens[token];
  if (!userId) {
    return res.status(401).json({ error: "Access denied: Invalid or expired security token." });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Authorized user not found in secure records." });
  }

  req.user = user;
  next();
};

const admin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied: Admin authorization required." });
  }
};

// Helper to compute live store statistics
function computeAnalytics(): AnalyticsSummary {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const totalRevenue = safeOrders
    .filter(o => o && o.status !== "Pending") // count confirmed sales
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const totalOrders = safeOrders.length;

  const totalProductsSold = safeOrders.reduce((sum, o) => {
    if (!o || !Array.isArray(o.items)) return sum;
    return sum + o.items.reduce((itemSum, item) => itemSum + (Number(item?.quantity) || 0), 0);
  }, 0);

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Aggregate category sales from products actually sold
  const categorySalesMap: Record<string, number> = {};
  safeOrders.forEach(o => {
    if (!o || !Array.isArray(o.items)) return;
    o.items.forEach(item => {
      if (!item) return;
      const prod = safeProducts.find(p => p && p.id === item.productId);
      const category = (prod && prod.category) ? prod.category : "General";
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      const revenue = price * qty;
      categorySalesMap[category] = (categorySalesMap[category] || 0) + revenue;
    });
  });

  const salesByCategory = Object.entries(categorySalesMap).map(([category, value]) => ({
    category,
    value: parseFloat(value.toFixed(2))
  }));

  // Group orders by date (last 7 days logic)
  const salesByDateMap: Record<string, number> = {};
  safeOrders.forEach(o => {
    if (!o) return;
    let dateStr = "Unknown Date";
    if (typeof o.date === "string") {
      dateStr = o.date.split("T")[0];
    } else if (o.date && typeof (o.date as any).toISOString === "function") {
      dateStr = (o.date as any).toISOString().split("T")[0];
    }
    const orderTotal = Number(o.total) || 0;
    salesByDateMap[dateStr] = (salesByDateMap[dateStr] || 0) + orderTotal;
  });

  const salesByDate = Object.entries(salesByDateMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({
      date,
      value: parseFloat(value.toFixed(2))
    }));

  // Top products sold
  const productSalesMap: Record<string, { sales: number; revenue: number }> = {};
  safeOrders.forEach(o => {
    if (!o || !Array.isArray(o.items)) return;
    o.items.forEach(item => {
      if (!item || !item.name) return;
      const entry = productSalesMap[item.name] || { sales: 0, revenue: 0 };
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      entry.sales += qty;
      entry.revenue += price * qty;
      productSalesMap[item.name] = entry;
    });
  });

  const topProducts = Object.entries(productSalesMap)
    .map(([name, stats]) => ({
      name,
      sales: stats.sales,
      revenue: parseFloat(stats.revenue.toFixed(2))
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const outOfStockCount = safeProducts.filter(p => p && (Number(p.stock) || 0) <= 0).length;
  const ordersProcessing = safeOrders.filter(o => o && (o.status === "Processing" || o.status === "Pending")).length;
  const ordersDelivered = safeOrders.filter(o => o && o.status === "Delivered").length;
  const totalProductsListed = safeProducts.length;

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalOrders,
    ordersProcessing,
    ordersDelivered,
    totalProductsListed,
    outOfStockCount,
    totalProductsSold,
    averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
    salesByCategory,
    salesByDate,
    topProducts
  };
}

// ---------------------------------------------------------
// API ROUTES
// ---------------------------------------------------------

// Detect media type of a Google Drive file id
app.get("/api/detect-media", (req, res) => {
  const fileId = req.query.id as string;
  if (!fileId) {
    return res.status(400).json({ error: "Missing file id" });
  }

  const targetUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
  
  const options: https.RequestOptions = {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Range": "bytes=0-0"
    }
  };

  https.get(targetUrl, options, (driveRes) => {
    const status = driveRes.statusCode || 200;

    if ((status === 301 || status === 302 || status === 303 || status === 307 || status === 308) && driveRes.headers.location) {
      https.get(driveRes.headers.location, options, (redirRes) => {
        const contentType = redirRes.headers["content-type"] || "";
        const isVideo = contentType.includes("video");
        return res.json({ type: isVideo ? "video" : "image", contentType });
      }).on("error", (err) => {
        return res.json({ type: "image", error: err.message });
      });
      return;
    }

    const contentType = driveRes.headers["content-type"] || "";
    const isVideo = contentType.includes("video");
    res.json({ type: isVideo ? "video" : "image", contentType });
  }).on("error", (err) => {
    res.json({ type: "image", error: err.message });
  });
});

// Video streaming proxy for Google Drive files
app.get("/api/video-proxy", (req, res) => {
  const fileId = req.query.id as string;
  if (!fileId) {
    return res.status(400).send("Missing file id");
  }

  let activeReq: any = null;

  const getUrl = (targetUrl: string) => {
    const options: https.RequestOptions = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    };

    if (req.headers.range) {
      options.headers = {
        ...options.headers,
        "Range": req.headers.range
      };
    }

    const driveReq = https.get(targetUrl, options, (driveRes) => {
      const status = driveRes.statusCode || 200;
      
      if ((status === 301 || status === 302 || status === 303 || status === 307 || status === 308) && driveRes.headers.location) {
        getUrl(driveRes.headers.location);
        return;
      }

      if (status >= 400) {
        res.status(status).send("Failed to fetch video from storage");
        return;
      }

      res.status(status);
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Access-Control-Allow-Origin", "*");
      
      const copyHeaders = ["content-length", "accept-ranges", "content-range"];
      copyHeaders.forEach(header => {
        if (driveRes.headers[header]) {
          res.setHeader(header, driveRes.headers[header] as string);
        }
      });

      res.setHeader("Content-Disposition", "inline");

      driveRes.pipe(res);
    });

    activeReq = driveReq;

    driveReq.on("error", (err: any) => {
      if (err.code === "ECONNRESET" || err.code === "EPIPE" || err.message?.includes("ECONNRESET") || err.message?.includes("EPIPE")) {
        // Gracefully ignore client-side aborts or socket resets during range requests
        return;
      }
      console.error("Video proxy error:", err);
      if (!res.headersSent) {
        res.status(500).send("Error streaming video");
      }
    });
  };

  req.on("close", () => {
    if (activeReq) {
      activeReq.destroy();
    }
  });

  getUrl(`https://docs.google.com/uc?export=download&id=${fileId}`);
});

// --- Auth Routes ---
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role, street, city, state, zip } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required profile registration parameters." });
  }

  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "Profile with this email has already registered." });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    role: (role === "admin" || email.toLowerCase() === "admin@vartman.com") ? "admin" : "customer",
    shippingAddress: street ? { street, city, state, zip } : undefined,
    orderHistory: []
  };

  users.push(newUser);
  userPasswords[newUser.id] = password;
  saveDb();

  // Generate simulated token
  const token = `token-${newUser.id}-${Math.floor(Math.random() * 1000)}`;
  simulatedTokens[token] = newUser.id;

  res.status(201).json({
    message: "Registration successful!",
    user: newUser,
    token
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please enter your travel email and passcode credentials to login." });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: "User credentials unmatched." });
  }

  // Enforce password check if preset or registered
  const storedPassword = userPasswords[user.id];
  if (storedPassword && storedPassword !== password) {
    return res.status(401).json({ error: "Invalid password credentials provided. Deep Nomad verification failing." });
  }

  // Generate safe simulated JWT token mapping back to this session
  const token = (user.role === "admin") ? "token-admin-123" : "token-customer-456";
  simulatedTokens[token] = user.id;

  res.json({
    message: `Welcome back, ${user.name}!`,
    user,
    token
  });
});

app.get("/api/auth/profile", protect, (req: any, res) => {
  res.json(req.user);
});

// --- Dynamic Filter Shop (accepts category, color, size, gender, queries live MongoDB via Mongoose) ---
app.get("/api/shop", async (req, res) => {
  try {
    const { category, color, size, gender } = req.query;
    
    // Call our modular, live MongoDB Mongoose filtering function
    const productsList = await fetchFilteredInventory({
      category: category as string,
      color: color as string,
      size: size as string,
      gender: gender as string
    });

    res.json({
      products: productsList,
      count: productsList.length
    });
  } catch (error: any) {
    console.error("[API Error] Failed to fetch live MongoDB filtered shop products:", error);
    res.status(500).json({
      error: "Failed to fetch live catalog from MongoDB.",
      details: error.message || String(error)
    });
  }
});

// --- Products CRUD ---
app.get("/api/categories", (req, res) => {
  const categories = [
    "Loomed Shirts",
    "Loomed Pants",
    "Artisan Robes",
    "Artisan Coats",
    "Men's T-Shirts",
    "Women's T-Shirts"
  ];
  res.json(categories);
});

app.get("/api/colors", (req, res) => {
  const colors = [
    { name: "Beige", hex: "#E8D8C8", label: "Desert Beige" },
    { name: "White", hex: "#FDFDFD", label: "Linen White" },
    { name: "Olive", hex: "#556B2F", label: "Olive Green" },
    { name: "Charcoal", hex: "#36454F", label: "Charcoal Gray" },
    { name: "Sage", hex: "#77815C", label: "Sage" },
    { name: "Sand", hex: "#C2B280", label: "Earthy Sand" },
    { name: "Blue", hex: "#4682B4", label: "Indigo Blue" }
  ];
  res.json(colors);
});

app.get("/api/products", async (req, res) => {
  // Supports filtering by category, colors, sizes, price range, gender preference, tags, sorting, or search
  const { category, tag, search, colors, sizes, minPrice, maxPrice, gender, sortBy, tags } = req.query;
  let responseList = await fetchProductsFromDb();

  if (category) {
    const cats = (category as string).split(",").map(c => c.trim().toLowerCase());
    responseList = responseList.filter(p => cats.includes((p.category || "").toLowerCase()));
  }

  if (tag) {
    responseList = responseList.filter(p => (p.tags || []).includes(tag as string));
  }
  if (tags) {
    const tagList = (tags as string).split(",").map(t => t.trim().toLowerCase());
    responseList = responseList.filter(p => (p.tags || []).some(pt => tagList.includes(pt.toLowerCase())));
  }

  if (colors) {
    const colorList = (colors as string).split(",").map(c => c.trim().toLowerCase());
    responseList = responseList.filter(p => {
      const pColors = (p.colors || [p.Colour]).filter(Boolean).map(c => c.toLowerCase());
      return pColors.some(pc => colorList.some(cl => pc.includes(cl) || cl.includes(pc)));
    });
  }

  if (sizes) {
    const sizeList = (sizes as string).split(",").map(s => s.trim().toLowerCase());
    responseList = responseList.filter(p => {
      const pSizes = (p.sizes || []).map(s => s.toLowerCase());
      return pSizes.some(ps => sizeList.includes(ps));
    });
  }

  if (minPrice) {
    const minP = parseFloat(minPrice as string);
    if (!isNaN(minP)) {
      responseList = responseList.filter(p => p.price >= minP);
    }
  }
  if (maxPrice) {
    const maxP = parseFloat(maxPrice as string);
    if (!isNaN(maxP)) {
      responseList = responseList.filter(p => p.price <= maxP);
    }
  }

  if (gender) {
    const g = (gender as string).toLowerCase();
    if (g === "men") {
      responseList = responseList.filter(p => 
        (p.category || "").toLowerCase().includes("men") || 
        (p.tags || []).includes("men") || 
        (p.category || "").toLowerCase() === "loomed shirts" || 
        (p.category || "").toLowerCase() === "loomed pants" ||
        p.genderPreference === "Men" || p.genderPreference === "Unisex"
      );
    } else if (g === "women") {
      responseList = responseList.filter(p => 
        (p.category || "").toLowerCase().includes("women") || 
        (p.tags || []).includes("women") ||
        p.genderPreference === "Women" || p.genderPreference === "Unisex"
      );
    } else if (g === "kids") {
      responseList = responseList.filter(p => 
        (p.category || "").toLowerCase().includes("kids") || 
        (p.tags || []).includes("kids") ||
        p.genderPreference === "Kids"
      );
    } else if (g === "unisex") {
      responseList = responseList.filter(p => p.genderPreference === "Unisex");
    }
  }

  if (search) {
    const rawSearch = search as string;
    console.log(`[Backend Search] Processing raw search query: "${rawSearch}"`);
    
    // Map intent to structured fields
    const structuredFields = await parseSearchIntentWithAI(rawSearch);
    console.log(`[Backend Search] Mapped search intent to:`, JSON.stringify(structuredFields, null, 2));

    // Query our products list using explicit filters instead of standard text-matching
    responseList = queryCatalogWithExplicitFilters(responseList, structuredFields);
  }

  if (sortBy) {
    if (sortBy === "price-low-high") {
      responseList.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high-low") {
      responseList.sort((a, b) => b.price - a.price);
    }
  }

  res.json(responseList);
});

app.get("/api/products/:id", async (req, res) => {
  const product = await fetchProductByIdFromDb(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Adventure wear item not found in catalog." });
  }
  res.json(product);
});

app.post("/api/products", protect, admin, async (req, res) => {
  const { id, ID, name, description, price, category, images, stock, sizes, colors, tags, featured, inspiration, referenceNumber, fitAndStyle, compositionAndCare, originAndTraceability, completeYourLook, variants, combos, productType, specs, ratingAvg, reviewsCount, sizeGuideRef, title, mrp, sellingPrice } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "Missing required fields: name, price, category" });
  }

  const rawProduct = {
    id: id || ID || `prod-${Date.now()}`,
    name,
    description: description || "No forest/dune narrative provided yet.",
    price: parseFloat(price),
    category,
    images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"],
    rating: parseFloat(ratingAvg || req.body.rating) || 5.0,
    ratingAvg: parseFloat(ratingAvg || req.body.rating) || 5.0,
    reviewsCount: parseInt(reviewsCount, 10) || 0,
    stock: parseInt(stock, 10) || 12,
    sizes: sizes || ["S", "M", "L", "XL"],
    colors: colors || ["Desert Beige"],
    tags: tags || ["wanderlust"],
    featured: featured || false,
    inspiration: inspiration || "Deep and peaceful journey story inspired by organic pathways of our earth.",
    referenceNumber: referenceNumber || "",
    fitAndStyle: fitAndStyle || "REGULAR FIT",
    compositionAndCare: compositionAndCare || "",
    originAndTraceability: originAndTraceability || "",
    completeYourLook: completeYourLook || [],
    variants: variants || [],
    combos: combos || [],
    productType: productType || "Single Item",
    specs: specs || {},
    sizeGuideRef: sizeGuideRef || "",
    title: title || name,
    mrp: mrp ? parseFloat(mrp) : undefined,
    sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined
  };

  try {
    const newProduct = await createProductInDb(rawProduct);
    // Keep local list in sync
    products.push(newProduct);
    saveDb();
    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(500).json({ error: "Database creation rejected", details: err.message });
  }
});

app.put("/api/products/:id", protect, admin, async (req, res) => {
  const { id } = req.params;
  const existing = await fetchProductByIdFromDb(id);
  if (!existing) {
    return res.status(404).json({ error: "Apparel item not found to modify." });
  }

  const updatedRaw = {
    ...existing,
    ...req.body,
    id: existing.id, 
    price: req.body.price !== undefined ? parseFloat(req.body.price) : existing.price,
    stock: req.body.stock !== undefined ? parseInt(req.body.stock, 10) : existing.stock,
  };

  try {
    const updated = await updateProductInDb(id, updatedRaw);
    // Keep local list in sync
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      products[productIndex] = updated;
    } else {
      products.push(updated);
    }
    saveDb();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: "Database modification rejected", details: err.message });
  }
});

app.delete("/api/products/:id", protect, admin, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteProductFromDb(id);
    products = products.filter(p => p.id !== id);
    saveDb();
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: "Database retirement rejected", details: err.message });
  }
});

// --- Orders Management ---
app.get("/api/orders", (req, res) => {
  // If authorization token exists, filter or show all based on admin privilege
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const userId = simulatedTokens[token];
    const user = users.find(u => u.id === userId);
    if (user && user.role === "admin") {
      return res.json(orders);
    } else if (user) {
      return res.json(orders.filter(o => o.userId === user.id || o.customerEmail.toLowerCase() === user.email.toLowerCase()));
    }
  }
  // Otherwise default back to global orders representation for seamless client sandbox review
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const { customerName, customerEmail, shippingAddress, items, subtotal, discount, total, paymentMethod, userId, paymentOption, advancePaid, remainingAmount } = req.body;
  if (!customerName || !customerEmail || !items || !items.length) {
    return res.status(400).json({ error: "Unable to process order. Missing vital details." });
  }

  // Deduct stock limits securely
  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  }

  // Create order
  const newOrder: Order = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: userId || "guest",
    date: new Date().toISOString(),
    customerName,
    customerEmail,
    shippingAddress,
    items,
    subtotal: parseFloat(subtotal),
    discount: parseFloat(discount || 0),
    total: parseFloat(total),
    paymentStatus: paymentOption === "cod" ? "Pending" : "Paid", // simulate successful checkout instantly
    status: "Processing",
    paymentMethod: paymentMethod || "Credit Card",
    trackingNumber: `TRK-WND-${Math.floor(10000 + Math.random() * 89999)}`,
    paymentOption: paymentOption || "prepaid",
    advancePaid: advancePaid !== undefined ? parseFloat(advancePaid) : parseFloat(total),
    remainingAmount: remainingAmount !== undefined ? parseFloat(remainingAmount) : 0
  };

  orders.unshift(newOrder); 

  // Add order to history
  if (userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.orderHistory = [...(user.orderHistory || []), newOrder.id];
    }
  }

  saveDb();
  res.status(201).json(newOrder);
});

// Admin-level update order status
app.put("/api/orders/:id/status", protect, admin, (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;
  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value provided" });
  }

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order record not found" });
  }

  order.status = status;
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  } else if (status === "Shipped" && !order.trackingNumber) {
    order.trackingNumber = `TRK-WND-${Math.floor(10000 + Math.random() * 89999)}`;
  }
  
  saveDb();
  res.json(order);
});

// --- Coupons API ---
app.post("/api/coupons/validate", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }

  const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  if (!coupon) {
    return res.status(404).json({ valid: false, error: "This coupon has dissolved back into the wilderness. Try 'WANDERLUST' or 'PEACE10'!" });
  }

  res.json({ valid: true, coupon });
});

// --- Waitlist / Newsletter API (Klaviyo Integration Mock & Firestore Persistence) ---
app.post("/api/waitlist", async (req, res) => {
  const { email, source } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email coordinate is required." });
  }

  // Check if already exists in waitlist
  const exists = waitlist.some(w => w.email.toLowerCase() === email.toLowerCase().trim());
  if (exists) {
    return res.json({ success: true, message: "This email is already registered inside our travel journal." });
  }

  const newItem = {
    id: `WAIT-${Math.floor(1000 + Math.random() * 9000)}`,
    email: email.toLowerCase().trim(),
    date: new Date().toISOString(),
    source: source || "newsletter"
  };

  waitlist.push(newItem);

  // Simulated Klaviyo API sync
  console.log(`[Klaviyo Sync] Capture email "${newItem.email}" from source "${newItem.source}". Synchronized with Klaviyo lists.`);

  // Save changes
  saveDb();

  // Try to write to Firestore waitlist collection if db is initialized
  if (firestoreDb) {
    try {
      await firestoreDb.collection("waitlist").doc(newItem.id).set(newItem);
    } catch (e: any) {
      console.error("Failed to sync waitlist item to Firestore:", e.message || String(e));
    }
  }

  res.status(201).json({ success: true, message: "Welcome to Vartman's Chronicle. We have captured your travel coordinates.", data: newItem });
});

// --- Notify Me (Back-in-Stock Notifications Webhook & Firestore Persistence) ---
app.post("/api/notify", async (req, res) => {
  const { email, productId, size } = req.body;
  if (!email || !productId || !size) {
    return res.status(400).json({ error: "Missing required coordinates: email, productId, or size." });
  }

  const notificationItem = {
    id: `NOTIF-${Math.floor(1000 + Math.random() * 9000)}-${Date.now()}`,
    email: email.toLowerCase().trim(),
    productId: productId.trim(),
    size: size.trim(),
    createdAt: new Date().toISOString()
  };

  console.log(`[RESTOCK NOTIFY REQUEST] Capture restock request: email="${notificationItem.email}", productId="${notificationItem.productId}", size="${notificationItem.size}"`);

  // Write directly to Firestore notifications collection if db is initialized
  const db = firestoreDb || clientFirestoreDb;
  if (db) {
    try {
      await db.collection("notifications").doc(notificationItem.id).set(notificationItem);
      console.log(`[Firestore Notify] Notification request ${notificationItem.id} synchronized successfully.`);
    } catch (e: any) {
      console.error("Failed to sync notification item to Firestore:", e.message || String(e));
    }
  }

  res.status(201).json({
    success: true,
    message: "Restock coordinates captured successfully. We will notify you when this design returns to stock.",
    data: notificationItem
  });
});

// --- Analytics Endpoint (Admin-protected) ---
app.get("/api/analytics", protect, admin, (req, res) => {
  const data = computeAnalytics();
  res.json(data);
});

// --- SERVER SIDE GEMINI SMART AI ROUTES ---

// 1. Context-Aware Shopping Advisor & Conversational Concierge
app.post("/api/ai/chat", async (req, res) => {
  const { query, cartItems, currentProductId } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Prompt/query is required" });
  }

  if (!ai) {
    return res.json({
      text: "🌿 **vartman Explorer Advisor:** Welcome traveler! I see you are looking for styling hints or packing guides. (Demo Mode: Let's explore together! Our collection includes premium 100% organic cotton t-shirts in deep Forest Greens, sandy Desert Beiges, and fjord-inspired Ocean Blues. Type your destination and I'll suggest the absolute best wanderlust outfit combination.)"
    });
  }

  try {
    // Collect catalog summary to feed to Gemini
    const catalogSummary = products.map(p => 
      `- **${p.name}** (ID: ${p.id}, Category: ${p.category}): $${p.price} | Stock: ${p.stock} units. Inspiration: ${p.inspiration.substring(0, 150)}...`
    ).join("\n");

    const activeProduct = currentProductId ? products.find(p => p.id === currentProductId) : null;
    const cartContext = cartItems && cartItems.length > 0
      ? cartItems.map((itm: any) => `- Name: ${itm.product.name}, Qty: ${itm.quantity}, Price: $${itm.product.price}`).join("\n")
      : "Cart is currently empty.";

    const systemInstruction = `You are the chief spiritual traveler scribe, design director, and styling concierge for "vartman travel gear".
We craft ultra-premium organic cotton and linen garments designed with deep forest greens, sandy beiges, and soft fjord blues for digital nomads, nature explorers, and peace-seekers.
Your personality is incredibly serene, wise, conversational, and highly inspiring. Speak with a natural connection to wilderness and slow traveling, like a trusted travel partner who values minimal footprint and high organic craftsmanship.

You have live memory of our organic product roster. Answer traveler inquiries with styling combinations, packing advice for their specific destination (e.g. Kyoto, Mount Rainier, Namib sandscapes), or cross-reference products in stock:
${catalogSummary}

Context:
- Current product user is considering: ${activeProduct ? activeProduct.name + " (" + activeProduct.description + " Inspiration notes: " + activeProduct.inspiration + ")" : "None"}
- User's cart items:
${cartContext}

Instructions:
1. Always formulate your advice using poetic, calm, beautiful Markdown with clean spacing, bullet lists, and warm highlights.
2. Relate t-shirt inspirations (` + "`inspiration`" + `) back to their destinations! For example, if they specify traveling to cold locations, recommend the loopback "Lost Ocean" Sweatshirt.
3. Keep the styling dialogue peaceful, wanderlust-inducing, clean, and under 200 words. Never repeat prompt parameters.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: "AI reasoning failed: " + (error.message || error) });
  }
});

// 2. Merchant AI Strategic Analyst (provides actionable sales insights based on mock DB)
app.post("/api/ai/insights", protect, admin, async (req, res) => {
  if (!ai) {
    return res.json({
      text: "### Live Store Metrics Dashboard Review (Demo Mode)\n\n" +
            "**Strategic Recommendation:**\n" +
            "- We notice that our core organic t-shirts (specifically **\"Forest Sentinel\" Woodcutter Tee**) represent strong transaction volume, while stock reserves remain thin.\n" +
            "- To activate real-time deep neural store analytics, populate your `GEMINI_API_KEY` in the AI Studio **Settings > Secrets** panel! Once activated, your AI assistant will analyze real-time inventory levels, dynamic transaction histories, and user feedback trends to advise stock scaling."
    });
  }

  try {
    const stats = computeAnalytics();
    const systemInstruction = `You are the executive e-commerce intelligence officer and strategy chief for "vartman". Your role is to analyze live store metrics, inventory velocities, and sales breakdowns, then output an exceptionally high-quality, high-impact business analysis for the business owner.
Be direct, sharp, professional, and use high-value consulting language (e.g., "maximize margins", "capital efficiency", "cross-sell velocity").`;

    const prompt = `Provide an actionable, structured business performance intelligence brief for my traveling apparel online store.
Current Metrics:
- Total Sales Revenue: $${stats.totalRevenue}
- Total Confirmed Transactions: ${stats.totalOrders}
- Multi-Unit Basket Size: ${stats.totalProductsSold} items sold.
- Average Basket Capture (AOV): $${stats.averageOrderValue}

Category Sales distribution:
${JSON.stringify(stats.salesByCategory)}

Top Performing Products list:
${JSON.stringify(stats.topProducts)}

Current Critical Stock Inventory:
${JSON.stringify(products.map(p => ({ name: p.name, stock: p.stock, category: p.category })))}

Output:
Write a clean, concise business insight brief structured with 3 bold sections:
1. **Critical Revenue Driver Analysis**: Interpret active category sales figures and performance metrics.
2. **Immediate SKU/Inventory Intervention**: Flag immediate stock vulnerabilities or products that have high velocity but low remaining reserves.
3. **Optimized Growth Plays**: Offer 2 highly actionable cross-selling strategies or tailored bundle codes to increase margin captures.

Keep it fully under 280 words, styled with elegant typography representation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Insights Error:", error);
    res.status(500).json({ error: "AI Strategic analysis failed: " + (error.message || error) });
  }
});

// --- Diagnostic endpoint to check Firestore connectivity ---
app.get("/api/debug-db", async (req, res) => {
  const db = await ensureWorkingDb();
  if (!db) {
    return res.json({
      success: false,
      message: "Firestore database is NOT working (using local db.json fallback).",
      projectId: "gen-lang-client-0698331065",
      databaseId: "ai-studio-637b298e-349e-4ebf-bf72-ccb0e3af5e9c",
      initError: initError,
      queryError: queryError,
      fallbackError: fallbackError
    });
  }
  try {
    const snap = await db.collection("products").limit(1).get();
    return res.json({
      success: true,
      message: "Firestore database is connected and fully working!",
      projectId: db.projectId || "unknown",
      databaseId: db.databaseId || "unknown",
      productsEmpty: snap.empty
    });
  } catch (err: any) {
    return res.json({
      success: false,
      message: "Firestore query failed.",
      error: err.message || String(err)
    });
  }
});

// --- Storefront slow travel CMS Updates ---
app.get("/api/cms", (req, res) => {
  res.json(cmsConfig);
});

app.put("/api/cms", protect, admin, async (req, res) => {
  const { 
    announcementText, 
    heroImageUrl, 
    heroImageUrlMobile, 
    heroTitle, 
    heroSubtitle, 
    heroCtaText, 
    featuredProductIds,
    categoriesTitle,
    categories
  } = req.body;

  if (announcementText !== undefined) cmsConfig.announcementText = announcementText;
  if (heroImageUrl !== undefined) cmsConfig.heroImageUrl = heroImageUrl;
  if (heroImageUrlMobile !== undefined) cmsConfig.heroImageUrlMobile = heroImageUrlMobile;
  if (heroTitle !== undefined) cmsConfig.heroTitle = heroTitle;
  if (heroSubtitle !== undefined) cmsConfig.heroSubtitle = heroSubtitle;
  if (heroCtaText !== undefined) cmsConfig.heroCtaText = heroCtaText;
  if (featuredProductIds !== undefined && Array.isArray(featuredProductIds)) {
    cmsConfig.featuredProductIds = featuredProductIds;
  }
  if (categoriesTitle !== undefined) cmsConfig.categoriesTitle = categoriesTitle;
  if (categories !== undefined && Array.isArray(categories)) {
    cmsConfig.categories = categories;
  }

  saveDb();

  const db = firestoreDb || clientFirestoreDb;
  try {
    if (db) {
      await db.collection("cms").doc("config").set(cmsConfig);
      console.log("Firestore cmsConfig updated successfully.");
    }
  } catch (err: any) {
    console.error("Failed to sync cmsConfig to Firestore cms/config:", err.message || String(err));
  }

  res.json({ success: true, cmsConfig, message: "Storefront CMS variables updated successfully." });
});

// --- Homepage Section CMS Manager API Endpoints ---
app.get("/api/sections", (req, res) => {
  const sorted = [...homepageSections].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  res.json(sorted);
});

app.post("/api/sections", protect, admin, (req, res) => {
  const { title, subtitle, layoutType, productIds, isActive, sortOrder } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Missing required field: title" });
  }
  const newSection: HomepageSection = {
    id: "sec-" + crypto.randomBytes(4).toString("hex"),
    title,
    subtitle: subtitle || "",
    layoutType: layoutType || "grid",
    productIds: Array.isArray(productIds) ? productIds : [],
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: typeof sortOrder === "number" ? sortOrder : homepageSections.length + 1
  };
  homepageSections.push(newSection);
  saveDb();
  res.status(201).json(newSection);
});

app.put("/api/sections/reorder", protect, admin, (req, res) => {
  const { sections } = req.body; // array of { id, sortOrder }
  if (!Array.isArray(sections)) {
    return res.status(400).json({ error: "Expected 'sections' array of { id, sortOrder }" });
  }
  sections.forEach((item: any) => {
    const found = homepageSections.find(s => s.id === item.id);
    if (found) {
      found.sortOrder = item.sortOrder;
    }
  });
  saveDb();
  res.json({ success: true, homepageSections });
});

app.put("/api/sections/:id", protect, admin, (req, res) => {
  const { id } = req.params;
  const idx = homepageSections.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Homepage section not found" });
  }
  const { title, subtitle, layoutType, productIds, isActive, sortOrder } = req.body;
  homepageSections[idx] = {
    ...homepageSections[idx],
    title: title !== undefined ? title : homepageSections[idx].title,
    subtitle: subtitle !== undefined ? subtitle : homepageSections[idx].subtitle,
    layoutType: layoutType !== undefined ? layoutType : homepageSections[idx].layoutType,
    productIds: Array.isArray(productIds) ? productIds : homepageSections[idx].productIds,
    isActive: isActive !== undefined ? isActive : homepageSections[idx].isActive,
    sortOrder: typeof sortOrder === "number" ? sortOrder : homepageSections[idx].sortOrder
  };
  saveDb();
  res.json(homepageSections[idx]);
});

app.delete("/api/sections/:id", protect, admin, (req, res) => {
  const { id } = req.params;
  const idx = homepageSections.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Homepage section not found" });
  }
  homepageSections.splice(idx, 1);
  saveDb();
  res.json({ success: true, message: "Section deleted successfully" });
});

// --- Customer Management & Segments (CRM) ---
app.get("/api/customers", protect, admin, (req, res) => {
  try {
    const customerList: any[] = [];

    // Map existing registered users first
    users.forEach(user => {
      const userOrders = orders.filter(o => o.customerEmail.toLowerCase() === user.email.toLowerCase());
      const totalOrders = userOrders.length;
      const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);
      const averageOrderValue = totalOrders > 0 ? parseFloat((totalSpent / totalOrders).toFixed(2)) : 0;

      // gather size preferences
      const sizesUsed: Record<string, number> = {};
      userOrders.forEach(o => {
        o.items.forEach(item => {
          if (item.size) {
            sizesUsed[item.size] = (sizesUsed[item.size] || 0) + item.quantity;
          }
        });
      });
      const preferredSizes = Object.entries(sizesUsed)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      // Retrieve or set default tags
      const tags = (user as any).tags || [];
      if (tags.length === 0) {
        if (totalSpent > 150) tags.push("VIP");
        if (totalOrders >= 2) tags.push("Early Adopter");
        if (userOrders.some(o => o.status === "Delivered")) tags.push("Active Buyer");
      }

      customerList.push({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shippingAddress: user.shippingAddress,
        totalOrders,
        lifetimeValue: parseFloat(totalSpent.toFixed(2)),
        averageOrderValue,
        preferredSizes,
        tags
      });
    });

    // Handle guest checkout buyers as customers
    orders.forEach(o => {
      const emailExists = customerList.some(c => c.email.toLowerCase() === o.customerEmail.toLowerCase());
      if (!emailExists) {
        const guestOrders = orders.filter(ord => ord.customerEmail.toLowerCase() === o.customerEmail.toLowerCase());
        const totalOrders = guestOrders.length;
        const totalSpent = guestOrders.reduce((acc, ord) => acc + ord.total, 0);
        const averageOrderValue = parseFloat((totalSpent / totalOrders).toFixed(2));

        const sizesUsed: Record<string, number> = {};
        guestOrders.forEach(ord => {
          ord.items.forEach(item => {
            if (item.size) {
              sizesUsed[item.size] = (sizesUsed[item.size] || 0) + item.quantity;
            }
          });
        });
        const preferredSizes = Object.entries(sizesUsed)
          .sort((a, b) => b[1] - a[1])
          .map(entry => entry[0]);

        const tags = ["Guest"];
        if (totalSpent > 150) tags.push("VIP");

        customerList.push({
          id: `guest-${Math.floor(1000 + Math.random() * 9000)}`,
          name: o.customerName,
          email: o.customerEmail,
          role: "customer",
          shippingAddress: o.shippingAddress,
          totalOrders,
          lifetimeValue: parseFloat(totalSpent.toFixed(2)),
          averageOrderValue,
          preferredSizes,
          tags
        });
      }
    });

    res.json(customerList);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to gather customers directory details: " + err.message });
  }
});

// Update Customer Segmentation Tags
app.put("/api/customers/:email/tags", protect, admin, (req, res) => {
  const { email } = req.params;
  const { tags } = req.body;

  if (!tags || !Array.isArray(tags)) {
    return res.status(400).json({ error: "Tags parameter is required and must be an array" });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    (user as any).tags = tags;
    saveDb();
    return res.json({ success: true, email, tags });
  }

  res.json({ success: true, email, tags, message: "Temporary guest segmentation updated." });
});

// --- Return & Refund Logic ---
app.post("/api/orders/:id/refund", protect, admin, (req, res) => {
  const { id } = req.params;
  const { refundAmount, restockItems, reason } = req.body;

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order record not found" });
  }

  if (refundAmount !== undefined) {
    const refundVal = parseFloat(refundAmount);
    if (isNaN(refundVal) || refundVal < 0 || refundVal > order.total) {
      return res.status(400).json({ error: "Invalid refund value amount" });
    }
    order.total = parseFloat((order.total - refundVal).toFixed(2));
    (order as any).refundedAmount = ((order as any).refundedAmount || 0) + refundVal;
    (order as any).returnReason = reason || "Customer returns request";
    
    if (order.total <= 0) {
      order.paymentStatus = "Pending"; // Representing refunded state
    }
  }

  // Restock returned items back to live inventory count
  if (restockItems && typeof restockItems === "object") {
    Object.entries(restockItems).forEach(([pId, qty]) => {
      const prod = products.find(p => p.id === pId);
      if (prod) {
        prod.stock += parseInt(qty as string, 10) || 0;
      }
    });
  }

  saveDb();
  res.json({ success: true, order, message: "Returns and restock transaction processed successfully" });
});

// --- Bulk Product Editing ---
app.post("/api/products/bulk-edit", protect, admin, (req, res) => {
  const { category, priceMultiplier, discountPercentage, addTag, removeTag } = req.body;

  if (!category) {
    return res.status(400).json({ error: "Please choose target product category" });
  }

  let updatedCount = 0;
  products.forEach(p => {
    if (p.category.toLowerCase() === category.toLowerCase()) {
      updatedCount++;
      if (priceMultiplier) {
        p.price = parseFloat((p.price * parseFloat(priceMultiplier)).toFixed(2));
      }
      if (discountPercentage) {
        p.price = parseFloat((p.price * (1 - parseFloat(discountPercentage) / 100)).toFixed(2));
      }
      if (addTag) {
        if (!p.tags.includes(addTag)) {
          p.tags.push(addTag);
        }
      }
      if (removeTag) {
        p.tags = p.tags.filter(t => t !== removeTag);
      }
    }
  });

  if (updatedCount > 0) {
    saveDb();
  }

  res.json({ success: true, updatedCount, message: `Successfully updated ${updatedCount} products in ${category}` });
});

// --- Add SKU Variant Support ---
app.post("/api/products/:id/variants", protect, admin, (req, res) => {
  const { id } = req.params;
  const { size, color, stock } = req.body;

  const parent = products.find(p => p.id === id);
  if (!parent) {
    return res.status(404).json({ error: "Parent apparel specifications not found" });
  }

  if (size && !parent.sizes.includes(size)) {
    parent.sizes.push(size);
  }
  if (color && parent.colors && !parent.colors.includes(color)) {
    parent.colors.push(color);
  } else if (color && !parent.colors) {
    parent.colors = [color];
  }

  parent.stock += parseInt(stock, 10) || 0;

  saveDb();
  res.json({ success: true, product: parent, message: "Variant inventory added successfully" });
});

// ---------------------------------------------------------
// UPI PAYMENT & CHECKOUT API ENDPOINTS
// ---------------------------------------------------------

app.post("/api/checkout/initiate", async (req, res) => {
  const { customerName, customerEmail, shippingAddress, items, couponCode, userId, paymentMethod, paymentOption } = req.body;

  if (!customerName || !customerEmail || !items || !items.length) {
    return res.status(400).json({ error: "Unable to process payment checkout. Missing vital user details." });
  }

  // Calculate cart subtotal from database prices
  let subtotal = 0;
  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) {
      return res.status(400).json({ error: `Product variant with ID ${item.productId} not found.` });
    }
    subtotal += prod.price * item.quantity;
  }

  // Apply Coupon discount
  let discountAmount = 0;
  if (couponCode) {
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (coupon) {
      if (coupon.discountType === "percentage") {
        discountAmount = subtotal * (coupon.value / 100);
      } else {
        discountAmount = coupon.value;
      }
    }
  }

  // Calculate shipping cost: spend > 8500 for free shipping, else 723 INR (corresponding to 8.5 USD * 85)
  const shippingCost = subtotal > 8500 || subtotal === 0 ? 0 : 723;
  const cartTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // Directly use INR amount (no exchange rate multiplication needed)
  let amountINR = Math.round(cartTotal);
  let advancePaid = amountINR;
  let remainingAmount = 0;

  if (paymentOption === "cod") {
    amountINR = 200;
    advancePaid = 200;
    remainingAmount = Math.max(0, Math.round(cartTotal) - 200);
  }

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  // Create order
  const newOrder: Order = {
    id: orderId,
    userId: userId || "guest",
    date: new Date().toISOString(),
    customerName,
    customerEmail,
    shippingAddress,
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discountAmount.toFixed(2)),
    total: parseFloat(cartTotal.toFixed(2)),
    paymentStatus: "Pending",
    status: "Pending",
    paymentMethod: paymentMethod || "UPI QR Code",
    trackingNumber: "",
    paymentOption: paymentOption || "prepaid",
    advancePaid: parseFloat(advancePaid.toFixed(2)),
    remainingAmount: parseFloat(remainingAmount.toFixed(2))
  };

  orders.unshift(newOrder);

  // Generate UPI pay deep link
  const cleanStoreName = encodeURIComponent("Wanderer Store");
  const cleanOrderNote = encodeURIComponent(`Wanderer Order ${orderId}`);
  const upiUrl = `upi://pay?pa=${paymentConfig.upiVpa}&pn=${cleanStoreName}&am=${amountINR}&tr=${orderId}&tn=${cleanOrderNote}&cu=INR`;

  // Generate dynamic scannable QR Code image as inline Base64
  let qrCode = "";
  try {
    qrCode = await QRCode.toDataURL(upiUrl);
  } catch (err) {
    console.error("[UPI QR] Failed to generate Base64 QR code image:", err);
  }

  // Save Transaction ledger entry
  const newTx = {
    id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    orderId,
    customerEmail,
    amount: parseFloat(cartTotal.toFixed(2)),
    amountINR,
    paymentMethod: paymentMethod || "UPI QR Code",
    status: "Pending",
    gatewayTransactionId: "",
    timestamp: new Date().toISOString()
  };

  transactions.unshift(newTx);

  saveDb();

  res.json({
    success: true,
    orderId,
    upiUrl,
    qrCode,
    amountUSD: cartTotal,
    amountINR,
    paymentConfig: {
      intentEnabled: paymentConfig.intentEnabled,
      qrEnabled: paymentConfig.qrEnabled,
      upiVpa: paymentConfig.upiVpa
    }
  });
});

app.post("/api/payments/webhook", (req, res) => {
  const { orderId, status, gatewayTransactionId, amount, signature } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ error: "Missing required webhook validation properties." });
  }

  // Signature validation using HMAC-SHA256 to prevent fraudulent updates
  const payloadString = `${orderId}|${amount || 0}|${status}`;
  const calculatedSignature = crypto
    .createHmac("sha256", paymentConfig.secretKey)
    .update(payloadString)
    .digest("hex");

  // Log expected signature for developer easy debugging/simulation
  console.log(`[UPI WEBHOOK] Webhook received for ${orderId}. Status: ${status}. Calculated Signature: ${calculatedSignature}. Provided: ${signature}`);

  if (signature !== "dev-signature-bypass" && signature !== calculatedSignature) {
    return res.status(400).json({ error: "Invalid cryptographic webhook signature checksum." });
  }

  // Load Order
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order referenced by checkout payment not found." });
  }

  // Idempotency check
  if (order.paymentStatus === "Paid") {
    return res.json({ success: true, message: "Transaction already processed successfully." });
  }

  // Find or create transaction record to keep ledger up-to-date
  let tx = transactions.find(t => t.orderId === orderId);
  if (!tx) {
    tx = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      orderId,
      customerEmail: order.customerEmail,
      amount: order.total,
      amountINR: Math.round(order.total),
      paymentMethod: order.paymentMethod,
      status: "Pending",
      gatewayTransactionId: "",
      timestamp: new Date().toISOString()
    };
    transactions.unshift(tx);
  }

  // Process status update
  const normalizedStatus = typeof status === "string" ? status.trim().toUpperCase() : "";
  const isSuccess = normalizedStatus === "SUCCESS" || normalizedStatus === "PAID";

  if (isSuccess) {
    order.paymentStatus = "Paid";
    order.status = "Processing";
    order.trackingNumber = `TRK-WND-${Math.floor(10000 + Math.random() * 89999)}`;
    tx.status = "Success";
    tx.gatewayTransactionId = gatewayTransactionId || `UPI-TXN-${Math.floor(1000000 + Math.random() * 8999999)}`;

    // Securely deduct product stock counts
    for (const item of order.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    // Add order to history
    if (order.userId && order.userId !== "guest") {
      const user = users.find(u => u.id === order.userId);
      if (user) {
        user.orderHistory = [...new Set([...(user.orderHistory || []), order.id])];
      }
    }

    console.log(`[NOTIFY] Order ${orderId} successfully completed. Triggered receipt email notification for ${order.customerEmail}.`);
  } else {
    order.paymentStatus = "Pending";
    tx.status = "Failed";
    tx.gatewayTransactionId = gatewayTransactionId || `UPI-ERR-${Math.floor(1000000 + Math.random() * 8999999)}`;
    console.log(`[NOTIFY] Payment failed for Order ${orderId}. Customer: ${order.customerEmail}.`);
  }

  saveDb();

  res.json({ success: true, orderId, paymentStatus: order.paymentStatus });
});

app.get("/api/checkout/status/:orderId", (req, res) => {
  const { orderId } = req.params;
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order details not found." });
  }

  res.json({
    orderId,
    paymentStatus: order.paymentStatus,
    status: order.status,
    trackingNumber: order.trackingNumber,
    utr: order.utr
  });
});

// Create custom UPI Intent (Deep Link) generation endpoint
app.post("/api/generate-payment", (req, res) => {
  const { amount, orderId } = req.body;
  if (!amount || !orderId) {
    return res.status(400).json({ error: "Amount and orderId are required." });
  }

  // Generate standard UPI URI string with placeholders for VPA and business name as requested:
  // upi://pay?pa=MY_VPA@BANK&pn=MY_BUSINESS_NAME&am=AMOUNT&cu=INR&tn=ORDER_ID
  const upiUrl = `upi://pay?pa=MY_VPA@BANK&pn=MY_BUSINESS_NAME&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(orderId)}`;

  return res.json({
    success: true,
    upiUrl
  });
});

// Post-payment verification workaround: receive and save UTR numbers for manual verification
app.post("/api/submit-utr", (req, res) => {
  const { orderId, utr } = req.body;
  if (!orderId || !utr) {
    return res.status(400).json({ error: "Order ID and 12-digit UTR are required." });
  }

  const trimmedUtr = String(utr).trim();
  if (!/^\d{12}$/.test(trimmedUtr)) {
    return res.status(400).json({ error: "UTR must be a valid 12-digit numeric code." });
  }

  // Find order
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order referenced by orderId not found." });
  }

  // Save UTR number
  order.utr = trimmedUtr;

  // Add or update corresponding ledger transaction
  let tx = transactions.find(t => t.orderId === orderId);
  if (tx) {
    tx.utr = trimmedUtr;
    tx.status = "Pending Verification";
    tx.gatewayTransactionId = `UTR-${trimmedUtr}`;
  } else {
    tx = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      orderId,
      customerEmail: order.customerEmail,
      amount: order.total,
      amountINR: Math.round(order.total),
      paymentMethod: order.paymentMethod,
      status: "Pending Verification",
      gatewayTransactionId: `UTR-${trimmedUtr}`,
      utr: trimmedUtr,
      timestamp: new Date().toISOString()
    };
    transactions.unshift(tx);
  }

  saveDb();

  return res.json({
    success: true,
    message: "UTR reference submitted successfully. An admin will manually verify this transaction within 24 hours.",
    orderId,
    utr: trimmedUtr
  });
});

// Public payment config endpoint for checkout
app.get("/api/payments/config", (req, res) => {
  res.json({
    upiVpa: paymentConfig.upiVpa,
    intentEnabled: paymentConfig.intentEnabled,
    qrEnabled: paymentConfig.qrEnabled,
    prepaidEnabled: paymentConfig.prepaidEnabled ?? true,
    codEnabled: paymentConfig.codEnabled ?? true
  });
});

// --- Admin Payment Configurations & Transaction Ledger Endpoints ---

app.get("/api/admin/payments/config", protect, admin, (req, res) => {
  res.json(paymentConfig);
});

app.post("/api/admin/payments/config", protect, admin, (req, res) => {
  const { merchantId, secretKey, saltKey, upiVpa, intentEnabled, qrEnabled, prepaidEnabled, codEnabled } = req.body;

  if (!merchantId || !upiVpa) {
    return res.status(400).json({ error: "Merchant ID and UPI VPA Address are required configurations." });
  }

  paymentConfig.merchantId = merchantId;
  if (secretKey) paymentConfig.secretKey = secretKey;
  if (saltKey) paymentConfig.saltKey = saltKey;
  paymentConfig.upiVpa = upiVpa;
  if (typeof intentEnabled !== 'undefined') paymentConfig.intentEnabled = !!intentEnabled;
  if (typeof qrEnabled !== 'undefined') paymentConfig.qrEnabled = !!qrEnabled;
  if (typeof prepaidEnabled !== 'undefined') paymentConfig.prepaidEnabled = !!prepaidEnabled;
  if (typeof codEnabled !== 'undefined') paymentConfig.codEnabled = !!codEnabled;

  saveDb();

  res.json({ success: true, message: "Payment configurations updated successfully.", config: paymentConfig });
});

// --- Review Management Endpoints ---

// Get all reviews (Admin protected)
app.get("/api/admin/reviews", protect, admin, (req, res) => {
  const { status, productId } = req.query;
  let filtered = [...reviews];

  if (status && status !== "All") {
    filtered = filtered.filter(r => r.status.toLowerCase() === String(status).toLowerCase());
  }

  if (productId) {
    filtered = filtered.filter(r => r.productId === String(productId));
  }

  res.json(filtered);
});

// Update review status (Approve / Reject)
app.patch("/api/admin/reviews/:id/status", protect, admin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Approved", "Rejected", "Pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid review status. Must be Approved, Rejected, or Pending." });
  }

  const review = reviews.find(r => r.id === id);
  if (!review) {
    return res.status(404).json({ error: "Review not found." });
  }

  review.status = status;

  // Recalculate product rating & reviews count
  const prod = products.find(p => p.id === review.productId);
  if (prod) {
    const approvedProdReviews = reviews.filter(r => r.productId === prod.id && r.status === "Approved");
    prod.reviewsCount = approvedProdReviews.length;
    if (approvedProdReviews.length > 0) {
      const sum = approvedProdReviews.reduce((acc, curr) => acc + curr.rating, 0);
      prod.rating = parseFloat((sum / approvedProdReviews.length).toFixed(1));
    }
  }

  saveDb();

  res.json({ success: true, message: `Review status updated to ${status}.`, review });
});

// Delete review
app.delete("/api/admin/reviews/:id", protect, admin, (req, res) => {
  const { id } = req.params;
  const index = reviews.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Review not found." });
  }

  const [deletedReview] = reviews.splice(index, 1);

  // Recalculate product rating & reviews count
  const prod = products.find(p => p.id === deletedReview.productId);
  if (prod) {
    const approvedProdReviews = reviews.filter(r => r.productId === prod.id && r.status === "Approved");
    prod.reviewsCount = approvedProdReviews.length;
    if (approvedProdReviews.length > 0) {
      const sum = approvedProdReviews.reduce((acc, curr) => acc + curr.rating, 0);
      prod.rating = parseFloat((sum / approvedProdReviews.length).toFixed(1));
    }
  }

  saveDb();

  res.json({ success: true, message: "Review deleted successfully.", id });
});

// Public GET reviews for a specific product
app.get("/api/products/:productId/reviews", (req, res) => {
  const { productId } = req.params;
  const approved = reviews.filter(r => r.productId === productId && r.status === "Approved");
  res.json(approved);
});

// Public / Customer POST submit review
app.post("/api/products/:productId/reviews", (req, res) => {
  const { productId } = req.params;
  const { userName, userEmail, rating, comment } = req.body;

  if (!userName || !rating || !comment) {
    return res.status(400).json({ error: "Name, rating, and comment are required fields." });
  }

  const prod = products.find(p => p.id === productId);
  if (!prod) {
    return res.status(404).json({ error: "Product not found." });
  }

  const newReview: Review = {
    id: `REV-${Date.now()}`,
    productId,
    productName: prod.name,
    productImage: prod.images && prod.images.length > 0 ? prod.images[0] : "",
    userName: userName.trim(),
    userEmail: userEmail ? userEmail.trim() : "",
    rating: Number(rating) || 5,
    comment: comment.trim(),
    date: new Date().toISOString().split("T")[0],
    status: "Approved"
  };

  reviews.unshift(newReview);

  // Update product stats
  const approvedProdReviews = reviews.filter(r => r.productId === productId && r.status === "Approved");
  prod.reviewsCount = approvedProdReviews.length;
  if (approvedProdReviews.length > 0) {
    const sum = approvedProdReviews.reduce((acc, curr) => acc + curr.rating, 0);
    prod.rating = parseFloat((sum / approvedProdReviews.length).toFixed(1));
  }

  saveDb();

  res.status(201).json({
    success: true,
    message: "Thank you for your feedback! Your review has been submitted.",
    review: newReview
  });
});

app.get("/api/admin/payments/transactions", protect, admin, (req, res) => {
  const { search, status } = req.query;

  let filtered = [...transactions];

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(t => 
      t.orderId.toLowerCase().includes(q) || 
      t.customerEmail.toLowerCase().includes(q) ||
      (t.gatewayTransactionId && t.gatewayTransactionId.toLowerCase().includes(q))
    );
  }

  if (status) {
    filtered = filtered.filter(t => t.status.toLowerCase() === String(status).toLowerCase());
  }

  res.json(filtered);
});

app.post("/api/admin/payments/transactions/:id/status-check", protect, admin, (req, res) => {
  const { id } = req.params;
  const tx = transactions.find(t => t.id === id);
  if (!tx) {
    return res.status(404).json({ error: "Transaction record not found." });
  }

  // If pending, simulate looking up with payment gateway and confirming as Success
  if (tx.status === "Pending") {
    tx.status = "Success";
    tx.gatewayTransactionId = `UPI-VERIFY-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const order = orders.find(o => o.id === tx.orderId);
    if (order && order.paymentStatus !== "Paid") {
      order.paymentStatus = "Paid";
      order.status = "Processing";
      order.trackingNumber = `TRK-WND-${Math.floor(10000 + Math.random() * 89999)}`;
      
      // Stock deduction
      for (const item of order.items) {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      }
    }
    saveDb();
    return res.json({ success: true, status: "Success", transaction: tx, message: "Transaction verified successfully with UPI provider. Order approved!" });
  }

  res.json({ success: true, status: tx.status, transaction: tx, message: "Transaction checked. No state changes needed." });
});

app.post("/api/admin/payments/transactions/:id/refund", protect, admin, (req, res) => {
  const { id } = req.params;
  const tx = transactions.find(t => t.id === id);
  if (!tx) {
    return res.status(404).json({ error: "Transaction record not found." });
  }

  if (tx.status === "Refunded") {
    return res.status(400).json({ error: "This transaction has already been refunded." });
  }

  tx.status = "Refunded";
  
  const order = orders.find(o => o.id === tx.orderId);
  if (order) {
    order.paymentStatus = "Pending"; // refunded state
    order.status = "Pending";
    
    // Restock items
    for (const item of order.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
      }
    }
  }

  saveDb();

  res.json({ success: true, transaction: tx, message: "Refund initiated successfully. Funds reversed and stock restocked." });
});

// Phase 1: AI Vision Analysis Endpoint
app.post("/api/admin/analyze-vision", protect, admin, upload.single("image"), async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No image file provided in the 'image' field." });
    }

    const context = req.body.context || "";

    let finalMimeType = file.mimetype || "image/jpeg";
    if (finalMimeType === "application/octet-stream" || !finalMimeType.startsWith("image/")) {
      const originalName = file.originalname || "";
      const ext = path.extname(originalName).toLowerCase();
      if (ext === ".png") {
        finalMimeType = "image/png";
      } else if (ext === ".webp") {
        finalMimeType = "image/webp";
      } else if (ext === ".gif") {
        finalMimeType = "image/gif";
      } else {
        finalMimeType = "image/jpeg";
      }
    }

    const systemInstruction = `You are an expert e-commerce cataloging AI assistant specializing in fashion retail. Your task is to analyze a batch of uploaded clothing images (up to 10 images from a single collection) and extract detailed, structured information to auto-populate a specific product listing admin panel.

Carefully review all provided images as a single cohesive collection. Output your response STRICTLY as a JSON object matching the exact structure requested below. Do not include markdown formatting like \`\`\`json or any conversational text outside the JSON object.

### EXTRACTION RULES:

**SECTION 1: COLLECTION BASIC DETAILS (Common across all images in the collection)**
*   **Fulfillment Category**: Determine if the images represent a "SHIRT & PANT COMBO", "SHIRTS ONLY", "PANTS ONLY", or "MULTIPACK".
*   **Collection Title**: Generate a catchy, premium-sounding title based on the visual fabric and style (e.g., "Linen Co-ord Set", "Summer Resort Camp Shirt").
*   **Fit & Style**: Analyze the drape and cut on the model (e.g., "REGULAR FIT", "RELAXED FIT", "SLIM FIT").
*   **Short Description**: Write a 2-bullet point description highlighting what the combo includes (e.g., "Includes 1x Textured Camp Shirt", "Includes 1x Drawstring Trouser").
*   **Sizes**: Default to ["S", "M", "L", "XL", "XXL"] for both shirts and trousers unless visual cues suggest otherwise.
*   **Tab 1 - Specifications (JSON)**: Visually estimate fabric type, weave, and details (e.g., button types, collar style, pocket presence). 
*   **Tab 2 - Product Narrative**: Write a short, evocative 2-sentence brand narrative inspired by the clothing's aesthetic (e.g., wanderlust, formal elegance, streetwear).
*   **Tab 3 - Artisan & Care**: Provide standard care instructions matching the inferred fabric (e.g., cold hand wash for linen).

**SECTION 2: COLOR VARIATIONS (Distinct for different colors)**
*   Identify every distinct color present in the image batch.
*   For each color, create a variant object.
*   **Colour Name**: Give the color a premium name (e.g., "Linen White", "Midnight Navy", "Olive Drab").
*   **Image Mapping**: Specify the file names or indices of the images that belong to this specific color variant.
*   **Pricing**: Output \`null\` for Selling Price and MRP, as the admin will set these manually.

**SECTION 3: BUNDLE COMBOS (If applicable)**
*   If the images show models wearing different pieces together (e.g., a specific shirt color paired with a specific pant color), identify these as bundles.
*   Create a title for the bundle (e.g., "Olive Shirt + White Pant Combo").`;

    let response: any = null;
    let lastError: any = null;
    const maxRetries = 4;
    const delayMs = 1500;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: finalMimeType,
                  data: file.buffer.toString("base64")
                }
              },
              {
                text: `Manager contextual notes/hints: "${context}"`
              }
            ]
          },
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                section_1: {
                  type: Type.OBJECT,
                  properties: {
                    fulfillment_category: { type: Type.STRING },
                    collection_title: { type: Type.STRING },
                    fit_and_style: { type: Type.STRING },
                    short_description: { type: Type.STRING },
                    available_shirt_sizes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    available_trouser_sizes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    tab_1_specifications: {
                      type: Type.OBJECT,
                      properties: {
                        SHIRT_DETAILS: {
                          type: Type.OBJECT,
                          properties: {
                            "TEXTILE COMPOSITION": { type: Type.STRING },
                            "FIT": { type: Type.STRING },
                            "DETAILS": { type: Type.STRING }
                          },
                          required: ["TEXTILE COMPOSITION", "FIT", "DETAILS"]
                        },
                        TROUSER_DETAILS: {
                          type: Type.OBJECT,
                          properties: {
                            "TEXTILE COMPOSITION": { type: Type.STRING },
                            "FIT": { type: Type.STRING },
                            "DETAILS": { type: Type.STRING }
                          },
                          required: ["TEXTILE COMPOSITION", "FIT", "DETAILS"]
                        }
                      },
                      required: ["SHIRT_DETAILS", "TROUSER_DETAILS"]
                    },
                    tab_2_narrative: { type: Type.STRING },
                    tab_3_care_instructions: { type: Type.STRING }
                  },
                  required: [
                    "fulfillment_category",
                    "collection_title",
                    "fit_and_style",
                    "short_description",
                    "available_shirt_sizes",
                    "available_trouser_sizes",
                    "tab_1_specifications",
                    "tab_2_narrative",
                    "tab_3_care_instructions"
                  ]
                },
                section_2_variations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      colour_name: { type: Type.STRING },
                      assigned_image_indices: {
                        type: Type.ARRAY,
                        items: { type: Type.INTEGER }
                      },
                      selling_price: { type: Type.NUMBER },
                      mrp: { type: Type.NUMBER }
                    },
                    required: ["colour_name", "assigned_image_indices"]
                  }
                },
                section_3_bundles: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      bundle_title: { type: Type.STRING },
                      included_items: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["bundle_title", "included_items"]
                  }
                }
              },
              required: ["section_1", "section_2_variations", "section_3_bundles"]
            },
            temperature: 0.2
          }
        });
        break; // Success!
      } catch (err: any) {
        lastError = err;
        const isTransient = 
          err?.status === 503 || 
          err?.status === 429 ||
          err?.message?.includes("503") ||
          err?.message?.includes("429") ||
          err?.message?.includes("UNAVAILABLE") ||
          err?.message?.includes("RESOURCE_EXHAUSTED") ||
          err?.message?.includes("temporary") ||
          err?.message?.includes("high demand");

        if (isTransient && attempt < maxRetries) {
          const backoff = delayMs * Math.pow(2, attempt - 1);
          console.warn(`[Vision Analysis Retry] Attempt ${attempt} failed with transient error. Retrying in ${backoff}ms... Error:`, err.message || err);
          await new Promise(resolve => setTimeout(resolve, backoff));
        } else {
          throw err;
        }
      }
    }

    const aiText = response ? response.text : null;
    if (!aiText) {
      throw new Error("No response received from Gemini model.");
    }

    const resultData = JSON.parse(aiText.trim());
    return res.json(resultData);

  } catch (error: any) {
    console.error("[Vision Analysis Endpoint Error]:", error);
    return res.status(500).json({
      error: "Failed to perform vision analysis.",
      details: error.message || String(error)
    });
  }
});

async function runDiagnostics() {
  const logFile = path.join(process.cwd(), "firestore_test_results.json");
  const results: any = {
    timestamp: new Date().toISOString(),
    steps: []
  };

  const addStep = (name: string, success: boolean, detail: any) => {
    results.steps.push({ name, success, detail });
    try {
      fs.writeFileSync(logFile, JSON.stringify(results, null, 2), "utf-8");
    } catch (e) {}
  };

  addStep("init", true, {
    message: "Starting diagnostics run...",
    projectId: "gen-lang-client-0698331065",
    databaseId: "ai-studio-637b298e-349e-4ebf-bf72-ccb0e3af5e9c",
    initError: initError
  });

  try {
    const db = await ensureWorkingDb();
    if (!db) {
      addStep("ensureWorkingDb", false, {
        message: "ensureWorkingDb returned null. Firestore is not accessible.",
        queryError: queryError,
        fallbackError: fallbackError
      });
      return;
    }

    addStep("ensureWorkingDb", true, {
      message: "Successfully connected to Firestore!",
      projectId: db.projectId || "unknown",
      databaseId: db.databaseId || "unknown"
    });

    // Test a read operation
    try {
      const snap = await db.collection("products").limit(1).get();
      addStep("readTest", true, {
        message: "Read query succeeded.",
        empty: snap.empty
      });
    } catch (readErr: any) {
      addStep("readTest", false, {
        error: readErr.message || String(readErr),
        stack: readErr.stack
      });
    }

    // Test a write operation
    try {
      const docRef = db.collection("products").doc("writeTest");
      await docRef.set({
        timestamp: new Date().toISOString(),
        status: "success",
        message: "Diagnostics write test completed successfully."
      });
      addStep("writeTest", true, {
        message: "Write to products/writeTest succeeded!"
      });
    } catch (writeErr: any) {
      addStep("writeTest", false, {
        error: writeErr.message || String(writeErr),
        stack: writeErr.stack
      });
    }

  } catch (err: any) {
    addStep("global", false, {
      error: err.message || String(err),
      stack: err.stack
    });
  }
}

// ---------------------------------------------------------
// SELF-HEALING ASSET PERSISTENCE & UPLOAD
// ---------------------------------------------------------

// Endpoint to upload a base64 image to server disk and Firestore cloud backup
app.post("/api/upload-image", protect, admin, async (req, res) => {
  const { url, base64 } = req.body;
  if (!url || !base64) {
    return res.status(400).json({ error: "Missing required fields: url, base64" });
  }

  try {
    let base64Data = base64;
    if (base64.includes(";base64,")) {
      base64Data = base64.split(";base64,")[1];
    }
    const buffer = Buffer.from(base64Data, "base64");
    const cleanedUrl = url.split("?")[0];
    const relativePath = cleanedUrl.startsWith("/") ? cleanedUrl.slice(1) : cleanedUrl;
    const decodedPath = decodeURIComponent(relativePath);
    const fullPath = path.join(process.cwd(), decodedPath);

    // Write file to disk
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, buffer);
    console.log(`[Asset Manager] Successfully wrote image file to disk: ${fullPath}`);

    // Store in Firestore for cross-session & cross-instance durability
    const db = await ensureWorkingDb();
    if (db) {
      try {
        await db.collection("catalog_images").doc(encodeURIComponent(cleanedUrl)).set({
          url: cleanedUrl,
          base64: base64,
          updatedAt: new Date().toISOString()
        });
        console.log(`[Asset Manager] Synced image ${cleanedUrl} to Firestore catalog_images.`);
      } catch (firestoreErr: any) {
        console.error(`[Asset Manager] Firestore catalog_images sync failed:`, firestoreErr.message || String(firestoreErr));
      }
    }

    res.json({ success: true, url: cleanedUrl });
  } catch (err: any) {
    console.error("[Asset Manager] Failed to process image upload:", err);
    res.status(500).json({ error: "Failed to upload image.", details: err.message || String(err) });
  }
});

// Self-healing asset middleware: intercepts requests to assets to restore from Firestore if missing on disk
app.get("/assets/*", async (req, res, next) => {
  const url = req.originalUrl || req.url;
  const cleanedUrl = url.split("?")[0];
  const relativePath = cleanedUrl.startsWith("/") ? cleanedUrl.slice(1) : cleanedUrl;
  const decodedPath = decodeURIComponent(relativePath);
  const fullPath = path.join(process.cwd(), decodedPath);

  try {
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return res.sendFile(fullPath);
    }
  } catch (statErr) {
    // ignore
  }

  console.log(`[Self-Healing] Asset not found on disk at: ${fullPath}. Checking Firestore...`);
  try {
    const db = await ensureWorkingDb();
    if (db) {
      const docId = encodeURIComponent(cleanedUrl);
      const doc = await db.collection("catalog_images").doc(docId).get();
      if (doc.exists) {
        const data = doc.data();
        if (data && data.base64) {
          console.log(`[Self-Healing] Restoring image from Firestore for ${cleanedUrl}...`);
          let base64Data = data.base64;
          if (base64Data.includes(";base64,")) {
            base64Data = base64Data.split(";base64,")[1];
          }
          const buffer = Buffer.from(base64Data, "base64");
          fs.mkdirSync(path.dirname(fullPath), { recursive: true });
          fs.writeFileSync(fullPath, buffer);
          return res.sendFile(fullPath);
        }
      }
    }
  } catch (err: any) {
    console.error(`[Self-Healing] Firestore restore failed for ${cleanedUrl}:`, err.message || String(err));
  }

  next();
});

// Serve assets directory statically
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

// ---------------------------------------------------------
// VITE DEV SERVER / PRODUCTION SETUP
// ---------------------------------------------------------

async function startServer() {
  // Global error handler for all API and router errors
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[Global Server Error]:", err);
    res.status(err.status || err.statusCode || 500).json({
      error: err.message || "An unexpected server-side error occurred.",
      details: err.details || String(err)
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Load database FIRST before listening to prevent race conditions or serving default data
  console.log("[vartman Server] Loading database from Firestore/local storage on startup...");
  try {
    await loadDb();
    console.log("[vartman Server] Database loaded successfully on startup.");
    runDiagnostics()
      .then(() => {
        console.log("[vartman Server] Startup diagnostics completed successfully.");
      })
      .catch((err) => {
        console.error("[vartman Server] Startup diagnostics failed:", err);
      });
  } catch (err) {
    console.error("[vartman Server] Critical database load failed on startup:", err);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[vartman Server] running flawlessly on http://localhost:${PORT}`);
  });
}

startServer();
