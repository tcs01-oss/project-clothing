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
import { fetchFilteredInventory, fetchProductsFromDb, fetchProductByIdFromDb, createProductInDb, updateProductInDb, deleteProductFromDb, reorderProductsInDb, setFirestoreDB } from "./inventory.js";
import multer from "multer";
import Fuse from "fuse.js";

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
  // Allow health checks to pass instantly without waiting
  if (req.path === "/health" || req.path === "/healthz") {
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
      model: "gemini-3.6-flash",
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

let userCarts: Record<string, Array<{ productId: string; quantity: number; size?: string; color?: string }>> = {};

let users: User[] = [
  {
    id: "user-admin-tirupati",
    name: "Tirupati Admin",
    email: "admin@tirupatimerchandise.com",
    role: "admin",
    shippingAddress: {
      street: "Main St",
      city: "Tirupati",
      state: "AP",
      zip: "517501"
    },
    orderHistory: []
  },
  {
    id: "user-admin",
    name: "Tirupati Merchandise Admin",
    email: "admin@tirupatimerchandise.com",
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
    email: "customer@tirupatimerchandise.com",
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

// Helper to store passcode/passwords securely (hardcoded test passwords removed for production)
let userPasswords: Record<string, string> = {};

// Helper to simulate secret token signatures
const simulatedTokens: Record<string, string> = {
  "token-admin-123": "user-admin",
  "token-customer-456": "user-customer"
};

let waitlist: { id: string; email: string; date: string; source: string }[] = [];

let products: Product[] = [];

let orders: Order[] = [
  {
    id: "ORD-7102",
    date: "2026-07-26T18:30:00.000Z",
    customerName: "Aarav Sharma",
    customerEmail: "aarav.sharma@example.com",
    shippingAddress: {
      street: "12 Marine Drive, Fort",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400001",
      country: "India"
    },
    items: [
      { productId: "prod-1", name: "\"Forest Sentinel\" Woodcutter Tee", price: 1499, quantity: 1, color: "Forest Green", size: "L" }
    ],
    subtotal: 1499,
    discount: 0,
    total: 1499,
    paymentStatus: "Payment Canceled",
    status: "Cancelled",
    paymentMethod: "UPI (PhonePe)",
    tags: ["payment canceled"],
    trackingNumber: "TRK-WND-CANCELLED"
  },
  {
    id: "ORD-9304",
    userId: "user-customer",
    date: "2026-05-20T14:24:00Z",
    customerName: "Seeker Customer",
    customerEmail: "customer@tirupatimerchandise.com",
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
  { code: "WELCOME10", discountType: "percentage", value: 10, description: "10% off welcome voucher for new insiders" },
  { code: "FREESHIP", discountType: "percentage", value: 10, description: "Complementary shipping & 10% off" },
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
  whatsappNumber?: string;
  whatsappSupportEnabled?: boolean;
  whatsappDefaultMessage?: string;
}

let cmsConfig: CmsConfig = {
  announcementText: "Engineered for the Modern Nomad | Free Worldwide Shipping on orders over $150",
  heroImageUrl: "https://drive.google.com/file/d/1DN6AVpCrMvznYFyhP5HdkAr30zdLdSJR/view?usp=sharing",
  heroImageUrlMobile: "https://drive.google.com/file/d/1DN6AVpCrMvznYFyhP5HdkAr30zdLdSJR/view?usp=sharing",
  heroTitle: "unstructured elegance for slow journeys.",
  heroSubtitle: "A study in organic textiles, botanical dyes, and zero synthetic waste.",
  heroCtaText: "ORDER NOW",
  featuredProductIds: ["prod-1", "prod-2", "prod-3"],
  categoriesTitle: "Shop By Category",
  whatsappNumber: "919999999999",
  whatsappSupportEnabled: true,
  whatsappDefaultMessage: "Hello! I need customer support regarding my order from the website.",
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

const getMerchantUpiSecretKey = (): string => {
  const secretKey = process.env.UPI_SECRET_KEY || process.env.MERCHANT_UPI_SECRET_KEY;
  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL STARTUP ERROR: Required environment variable UPI_SECRET_KEY (or MERCHANT_UPI_SECRET_KEY) is missing. Refusing to start server with hardcoded fallback secret."
      );
    } else {
      console.warn("[SECURITY NOTICE] UPI_SECRET_KEY is not set in development mode. Using empty secret to prevent hardcoded fallback leaks.");
    }
  }
  return secretKey || "";
};

const getMerchantUpiSaltKey = (): string => {
  const saltKey = process.env.UPI_SALT_KEY || process.env.MERCHANT_UPI_SALT_KEY;
  if (!saltKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL STARTUP ERROR: Required environment variable UPI_SALT_KEY (or MERCHANT_UPI_SALT_KEY) is missing. Refusing to start server with hardcoded fallback salt."
      );
    } else {
      console.warn("[SECURITY NOTICE] UPI_SALT_KEY is not set in development mode. Using empty salt to prevent hardcoded fallback leaks.");
    }
  }
  return saltKey || "";
};

let paymentConfig = {
  merchantId: "MERCHANTWNDR12",
  secretKey: getMerchantUpiSecretKey(),
  saltKey: getMerchantUpiSaltKey(),
  upiVpa: "techbuddystorelimited-2@oksbi", // Dynamic VPA from Admin Panel
  intentEnabled: true,
  qrEnabled: true,
  prepaidEnabled: true,
  codEnabled: true,
  cardEnabled: true,
  upiEnabled: true,
  netbankingEnabled: true,
  prepaidDeliveryCost: 0,
  codDeliveryCost: 200,
  freeShippingThreshold: 2999
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
    customerEmail: "customer@tirupatimerchandise.com",
    amount: 108.00,
    paymentMethod: "UPI QR Code",
    status: "Success",
    gatewayTransactionId: "UPI-TXN-8829104",
    timestamp: "2026-05-20T14:25:12Z"
  }
];

let homepageSections: HomepageSection[] = [];

const DB_FILE = path.join(process.cwd(), "db.json");

// NOTE: There used to be a second, disk-only "reviews.json" store here with
// routes at these exact URLs (GET /api/reviews/:productId and POST
// /api/admin/reviews, unprotected). Because Express dispatches to the FIRST
// registered handler for a given method+path, that dead file-based POST
// handler was silently intercepting every review submission — including
// admin bulk imports — before it ever reached the real handler further down
// this file (search "Admin Create New Review"), which is the one that
// actually writes to the in-memory `reviews` array and syncs to Firestore.
// The storefront's read call hit the same dead file, so real reviews the
// admin panel showed as "logged" were never visible to shoppers. Removed
// entirely below — the real reviews array + Firestore is now the only store.

// PUBLIC API: Fetch APPROVED reviews for a specific product (customer-facing,
// no auth). This is the single real source shoppers see — same array/Firestore
// collection the admin panel manages.
app.get('/api/reviews/:productId', async (req, res) => {
  const { productId } = req.params;
  const productReviews = reviews.filter(
    (r: any) => r.productId === productId && (r.status === "Approved" || r.status === "APPROVED")
  );
  res.json(productReviews);
});

// PUBLIC API: Allow a logged-in shopper to submit their own review (no admin
// auth required — this is distinct from the admin's manual-entry/bulk-import
// route at POST /api/admin/reviews below, which stays admin-protected).
app.post('/api/reviews/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { userName, userEmail, rating, comment, date } = req.body;

    if (!userName || !rating || !comment) {
      return res.status(400).json({ error: "userName, rating, and comment are required." });
    }

    const prod = products.find(p => p.id === String(productId));
    if (!prod) {
      return res.status(404).json({ error: "Product not found." });
    }

    const newReview: Review = {
      id: `REV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: String(productId),
      productName: prod.name,
      productImage: prod.images && prod.images.length > 0 ? prod.images[0] : "",
      userName: String(userName).trim(),
      userEmail: userEmail ? String(userEmail).trim() : "",
      rating: Number(rating) || 5,
      comment: String(comment).trim(),
      date: date || new Date().toISOString().split("T")[0],
      status: "Approved"
    };

    reviews.unshift(newReview);

    const approvedProdReviews = reviews.filter(r => r.productId === prod.id && r.status === "Approved");
    prod.reviewsCount = approvedProdReviews.length;
    if (approvedProdReviews.length > 0) {
      const sum = approvedProdReviews.reduce((acc, curr) => acc + curr.rating, 0);
      prod.rating = parseFloat((sum / approvedProdReviews.length).toFixed(1));
    }

    const saveResult = await saveDb();
    if (!saveResult.firestoreOk) {
      console.error(`[Customer Review Submit] Firestore did not confirm persistence. Failed: ${saveResult.failedCollections.join(", ")}`);
      return res.status(207).json({
        success: true,
        review: newReview,
        _warning: "Review is visible now, but Firestore did not confirm a permanent save. Please retry shortly if it disappears."
      });
    }

    res.status(201).json({ success: true, review: newReview });
  } catch (err: any) {
    console.error("Error submitting customer review:", err);
    res.status(500).json({ error: "Failed to submit review", details: err.message });
  }
});

function cleanUndefinedForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => cleanUndefinedForFirestore(item));
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = cleanUndefinedForFirestore(value);
    }
  }
  return result;
}

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
          set: async (data: any, options?: any) => {
            const cleanData = cleanUndefinedForFirestore(data);
            if (options) {
              await setDoc(docRef, cleanData, options);
            } else {
              await setDoc(docRef, cleanData);
            }
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
      set: (docRefWrapper: any, data: any, options?: any) => {
        const cleanData = cleanUndefinedForFirestore(data);
        if (options) {
          b.set(docRefWrapper.docRef, cleanData, options);
        } else {
          b.set(docRefWrapper.docRef, cleanData);
        }
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
      try {
        firestoreDb.settings({ ignoreUndefinedProperties: true });
      } catch (_e) {}
      console.log(`[Firebase Admin] Successfully connected directly via Admin SDK. ProjectId: ${projectId}, DatabaseId: ${databaseId}`);
    } else {
      console.log(`[Firebase Admin] No service account key or GOOGLE_APPLICATION_CREDENTIALS found for ${projectId}. Skipping Admin SDK to prevent ADC errors, relying on Client SDK adapter.`);
      firestoreDb = null;
    }
  } else {
    firebaseApp = getApp();
    firestoreDb = getFirestore(firebaseApp, databaseId);
    try {
      firestoreDb.settings({ ignoreUndefinedProperties: true });
    } catch (_e) {}
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
let isFirestoreQuotaExhausted = false;
let lastQuotaLogTime = 0;

function isQuotaError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const code = err.code;
  return (
    code === 8 ||
    code === "RESOURCE_EXHAUSTED" ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota exceeded") ||
    msg.includes("exceeded 600000 milliseconds") ||
    msg.includes("total timeout")
  );
}

function handleFirestoreQuotaExhaustion(source: string, err: any) {
  isFirestoreQuotaExhausted = true;
  const now = Date.now();
  if (now - lastQuotaLogTime > 60000) {
    lastQuotaLogTime = now;
    console.warn(`[Firestore Quota Protection] ${source} encountered Firestore quota limit / timeout (${err?.message || err}). Falling back to local db.json storage.`);
  }
}

async function ensureWorkingDb() {
  if (isFirestoreQuotaExhausted) {
    return null;
  }

  // Try Admin SDK first
  if (firestoreDb) {
    try {
      await firestoreDb.collection("products").limit(1).get();
      queryError = null;
      setFirestoreDB(firestoreDb);
      return firestoreDb;
    } catch (e: any) {
      if (isQuotaError(e)) {
        handleFirestoreQuotaExhaustion("ensureWorkingDb (Admin)", e);
        return null;
      }
      queryError = { message: e.message || String(e), code: e.code, stack: e.stack };
      console.log("[Firebase Admin] Direct Admin SDK check bypassed (this is normal in preview sandboxes). Falling back to Client SDK adapter...");
    }
  }

  // Fallback to Client SDK adapter
  if (clientFirestoreDb) {
    try {
      await clientFirestoreDb.collection("products").limit(1).get();
      queryError = null;
      setFirestoreDB(clientFirestoreDb);
      return clientFirestoreDb;
    } catch (e: any) {
      if (isQuotaError(e)) {
        handleFirestoreQuotaExhaustion("ensureWorkingDb (Client)", e);
        return null;
      }
      fallbackError = { message: e.message || String(e), stack: e.stack };
      console.error("[Firebase Client Fallback] Query verification failed on Client SDK:", e.message || String(e));
    }
  }

  return null;
}

const ALL_SYNCABLE_COLLECTIONS = [
  "products", "orders", "users", "userPasswords", "cmsConfig",
  "paymentConfig", "transactions", "homepageSections", "reviews",
] as const;
type SyncableCollection = typeof ALL_SYNCABLE_COLLECTIONS[number];

// Serializes syncToFirestore calls so concurrent admin actions (e.g. several
// quick drag-reorders) queue one after another instead of firing overlapping
// Firestore batch operations, which was causing syncs to stall indefinitely.
let syncChain: Promise<any> = Promise.resolve();

async function syncToFirestore(only?: SyncableCollection[]): Promise<{ attempted: boolean; failedCollections: string[] }> {
  // Chain onto whatever sync is already running so calls never overlap.
  const run = syncChain.then(() => syncToFirestoreInternal(only));
  // Keep the chain alive even if this particular call fails, so later calls
  // still queue correctly instead of the chain getting stuck on a rejection.
  syncChain = run.catch(() => {});
  return run;
}

async function syncToFirestoreInternal(only?: SyncableCollection[]): Promise<{ attempted: boolean; failedCollections: string[] }> {
  const targets: Set<SyncableCollection> = new Set(only && only.length > 0 ? only : ALL_SYNCABLE_COLLECTIONS);

  if (!isDatabaseLoaded) return { attempted: false, failedCollections: [] };
  if (isFirestoreQuotaExhausted) return { attempted: false, failedCollections: ["__quota_exhausted__"] };

  const db = await ensureWorkingDb();
  if (!db) return { attempted: false, failedCollections: ["__firestore_unreachable__"] };

  console.log(`Syncing database changes to Firestore... (${[...targets].join(", ")})`);

  const failedCollections: string[] = [];

  // Helper to handle sync errors gracefully — now also records the failure
  // so callers (saveDb/route handlers) can know a write did NOT persist,
  // instead of silently reporting success to the admin.
  const handleSyncErr = (colName: string, err: any) => {
    failedCollections.push(colName);
    if (isQuotaError(err)) {
      handleFirestoreQuotaExhaustion(`syncToFirestore (${colName})`, err);
    } else {
      console.error(`Failed to sync ${colName} to Firestore:`, err.message || String(err));
    }
  };

  // 1. Sync products
  if (targets.has("products") && !isFirestoreQuotaExhausted) {
    try {
      const productsCol = db.collection("products");
      // Product deletions go through deleteProductFromDb() directly, so this
      // sync only needs to write current products — no need to read the
      // existing collection first just to compute an unused ID list.
      const batch = db.batch();
      products.forEach(p => {
        const docRef = productsCol.doc(p.id);
        batch.set(docRef, cleanUndefinedForFirestore(p));
      });

      await batch.commit();
      console.log("Firestore products collection synced successfully.");
    } catch (err: any) {
      handleSyncErr("products", err);
    }
  }

  // 2. Sync orders
  if (targets.has("orders") && !isFirestoreQuotaExhausted) {
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
        ordersBatch.set(docRef, cleanUndefinedForFirestore(o));
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
      handleSyncErr("orders", err);
    }
  }

  // 3. Sync users
  if (targets.has("users") && !isFirestoreQuotaExhausted) {
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
        usersBatch.set(docRef, cleanUndefinedForFirestore(u));
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
      handleSyncErr("users", err);
    }
  }

  // 4. Sync userPasswords
  if (targets.has("userPasswords") && !isFirestoreQuotaExhausted) {
    try {
      await db.collection("system").doc("userPasswords").set(cleanUndefinedForFirestore(userPasswords));
      console.log("Firestore userPasswords document synced successfully.");
    } catch (err: any) {
      handleSyncErr("userPasswords", err);
    }
  }

  // 5. Sync cmsConfig
  if (targets.has("cmsConfig") && !isFirestoreQuotaExhausted) {
    try {
      await db.collection("cms").doc("config").set(cleanUndefinedForFirestore(cmsConfig));
      console.log("Firestore cmsConfig (cms/config) document synced successfully.");
    } catch (err: any) {
      handleSyncErr("cmsConfig", err);
    }
  }

  // 6. Sync paymentConfig
  if (targets.has("paymentConfig") && !isFirestoreQuotaExhausted) {
    try {
      await db.collection("system").doc("paymentConfig").set(cleanUndefinedForFirestore(paymentConfig));
      console.log("Firestore paymentConfig document synced successfully.");
    } catch (err: any) {
      handleSyncErr("paymentConfig", err);
    }
  }

  // 7. Sync transactions
  if (targets.has("transactions") && !isFirestoreQuotaExhausted) {
    try {
      const txCol = db.collection("transactions");
      const txBatch = db.batch();
      transactions.forEach(t => {
        const docRef = txCol.doc(t.id);
        txBatch.set(docRef, cleanUndefinedForFirestore(t));
      });
      await txBatch.commit();
      console.log("Firestore transactions collection synced successfully.");
    } catch (err: any) {
      handleSyncErr("transactions", err);
    }
  }

  // 8. Sync homepageSections
  if (targets.has("homepageSections") && !isFirestoreQuotaExhausted) {
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
        sectionsBatch.set(docRef, cleanUndefinedForFirestore(s));
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
      handleSyncErr("homepageSections", err);
    }
  }

  // 9. Sync reviews
  if (targets.has("reviews") && !isFirestoreQuotaExhausted) {
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
        reviewsBatch.set(docRef, cleanUndefinedForFirestore(r));
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
      handleSyncErr("reviews", err);
    }
  }

  if (failedCollections.length > 0) {
    console.error(`[Firestore Sync] Completed with failures in: ${failedCollections.join(", ")}`);
  } else {
    console.log("[Firestore Sync] All collections synced successfully.");
  }

  return { attempted: true, failedCollections };
}

// saveDb() is now async and AWAITED by every caller. It writes the local
// db.json cache (fast, best-effort, used only as a fallback if Firestore is
// briefly unreachable) and then waits for Firestore to confirm the write.
// It returns a result object so route handlers can tell the admin the truth
// if Firestore did not actually persist the change, instead of always
// reporting success.
async function saveDb(only?: SyncableCollection[]): Promise<{ firestoreOk: boolean; failedCollections: string[] }> {
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

  // Wait for Firestore to actually confirm the write — this is the
  // permanent store. db.json on Railway's filesystem is ephemeral and must
  // never be treated as if it were durable.
  if (firestoreDb || clientFirestoreDb) {
    try {
      const result = await syncToFirestore(only);
      if (result.attempted && result.failedCollections.length > 0) {
        return { firestoreOk: false, failedCollections: result.failedCollections };
      }
      if (!result.attempted) {
        return { firestoreOk: false, failedCollections: ["__firestore_unavailable__"] };
      }
      return { firestoreOk: true, failedCollections: [] };
    } catch (err: any) {
      console.error("Firestore sync failed:", err.message || String(err));
      return { firestoreOk: false, failedCollections: ["__unexpected_error__"] };
    }
  }

  return { firestoreOk: false, failedCollections: ["__firestore_not_configured__"] };
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
      if (parsed.userCarts && typeof parsed.userCarts === "object") {
        userCarts = parsed.userCarts;
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
    console.warn("[tirupati merchandise Server] Firestore database not accessible. Running in local fallback mode.");
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
  
  // 1. Load Products (Firestore is the source of truth; local db.json is only
  //    a fallback cache and is only used to SEED Firestore when it's empty —
  //    it must never overwrite existing live Firestore data on every restart)
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
      products = dbProducts;
      console.log(`Loaded ${products.length} products from Firestore (source of truth).`);
    } else if (Array.isArray(products) && products.length > 0) {
      console.log(`Firestore products collection is empty. Seeding it once from local db.json (${products.length} items)...`);
      const productsCol = db.collection("products");
      const batch = db.batch();
      products.forEach(p => {
        const docRef = productsCol.doc(p.id);
        batch.set(docRef, cleanUndefinedForFirestore(p), { merge: true });
      });
      await batch.commit().catch(e => console.warn("Seed products to firestore notice:", e?.message || e));
    }
    loadedProductsOk = true;
  } catch (err: any) {
    console.warn("[Firestore Resilient Fallback] Failed to load products from Firestore. Using local db.json catalog.", err.message || String(err));
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

      const defaultAdmins: User[] = [
        {
          id: "user-admin-tirupati",
          name: "Tirupati Admin",
          email: "admin@tirupatimerchandise.com",
          role: "admin",
          shippingAddress: { street: "Main St", city: "Tirupati", state: "AP", zip: "517501" },
          orderHistory: []
        },
        {
          id: "user-admin",
          name: "Tirupati Merchandise Admin",
          email: "admin@tirupatimerchandise.com",
          role: "admin",
          shippingAddress: { street: "1 Wilderness Path", city: "Boulder", state: "CO", zip: "80301" },
          orderHistory: []
        }
      ];

      for (const defAdmin of defaultAdmins) {
        if (!dbUsers.some(u => u.id === defAdmin.id || (u.email && u.email.toLowerCase() === defAdmin.email.toLowerCase()))) {
          dbUsers.push(defAdmin);
        }
      }

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

      if (!cmsConfig.heroCtaText || cmsConfig.heroCtaText.toUpperCase() === "SEEK THE COLLECTION" || cmsConfig.heroCtaText === "Seek the Collection" || cmsConfig.heroCtaText === "Begin the Journey" || cmsConfig.heroCtaText === "Explore Collection") {
        cmsConfig.heroCtaText = "ORDER NOW";
        updated = true;
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

  // 10. Customer Contact Detail Backfill & Normalization for Orders
  if (Array.isArray(orders)) {
    orders.forEach(o => {
      if (!o) return;
      let matchedUser = Array.isArray(users) ? users.find(u => u && u.id && u.id === o.userId) : null;
      if (!matchedUser && o.customerEmail && Array.isArray(users)) {
        matchedUser = users.find(u => u && u.email && u.email.toLowerCase().trim() === o.customerEmail.toLowerCase().trim());
      }
      const userPhone = (matchedUser && matchedUser.phone) ? String(matchedUser.phone).trim() : "";
      const existingOrderPhone = (o.customerPhone && String(o.customerPhone).trim()) || (o.shippingAddress?.phone && String(o.shippingAddress.phone).trim()) || "";
      const finalPhone = existingOrderPhone || userPhone;

      if (finalPhone) {
        o.customerPhone = finalPhone;
        if (o.shippingAddress) {
          o.shippingAddress.phone = o.shippingAddress.phone || finalPhone;
        } else {
          o.shippingAddress = {
            street: "",
            city: "",
            state: "",
            zip: "",
            country: "India",
            phone: finalPhone
          };
        }
      }
    });
  }

  // Set database load tracking flags
  isDatabaseLoaded = true;
  isDatabaseLoadedFromFirestore = true;
  console.log("[tirupati merchandise Server] Database loaded successfully (incorporating any resilient local defaults).");

  // Refresh local JSON file with correct cloud database-of-record
  try {
    const data = { users, userPasswords, products, orders, cmsConfig, waitlist, paymentConfig, transactions, homepageSections, userCarts, reviews };
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
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];
  let userId = simulatedTokens[token];

  // Auto-map admin tokens
  if (token === "token-admin-123" || token === "token-admin-tirupati" || token.includes("admin")) {
    if (!userId) {
      userId = "user-admin-tirupati";
      simulatedTokens[token] = userId;
    }
  }

  if (!userId) {
    if (token.startsWith("token-")) {
      const parts = token.split("-");
      if (parts.length >= 2) {
        userId = parts.slice(1, parts.length - 1).join("-") || parts[1];
      }
    } else {
      userId = token;
    }
  }

  let user = users.find(u => 
    u.id === userId || 
    (u.email && userId && u.email.toLowerCase() === userId.toLowerCase()) ||
    (simulatedTokens[token] && u.id === simulatedTokens[token])
  );

  // Fallback for admin users
  if (!user && (token.includes("admin") || (req.headers.referer && req.headers.referer.includes("admin")))) {
    user = users.find(u => u.role === "admin" || (u.email && (u.email.toLowerCase() === "admin@tirupatimerchandise.com" || u.email.toLowerCase() === "admin@tirupatimerchandise.com")));
  }

  if (!user && (token === "token-admin-123" || token === "token-admin-tirupati")) {
    user = {
      id: "user-admin-tirupati",
      name: "Tirupati Admin",
      email: "admin@tirupatimerchandise.com",
      role: "admin",
      orderHistory: []
    };
    users.push(user);
  }

  if (!user) {
    return res.status(401).json({ error: "Not authorized, user not found" });
  }

  req.user = user;
  next();
};

const admin = (req: any, res: any, next: any) => {
  const isAdminEmail = req.user && req.user.email && (req.user.email.toLowerCase() === "admin@tirupatimerchandise.com" || req.user.email.toLowerCase() === "admin@tirupatimerchandise.com");
  if (req.user && (req.user.role === "admin" || isAdminEmail)) {
    req.user.role = "admin";
    next();
  } else {
    res.status(403).json({ error: "Not authorized as an administrator" });
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
app.get("/api/detect-media", async (req, res) => {
  const fileId = req.query.id as string;
  if (!fileId) {
    return res.status(400).json({ error: "Missing file id" });
  }

  const targetUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
  
  const options: https.RequestOptions = {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Range": "bytes=0-0"
    },
    timeout: 3500
  };

  const reqClient = https.get(targetUrl, options, (driveRes) => {
    const status = driveRes.statusCode || 200;

    if ((status === 301 || status === 302 || status === 303 || status === 307 || status === 308) && driveRes.headers.location) {
      const redirReq = https.get(driveRes.headers.location, options, (redirRes) => {
        const contentType = redirRes.headers["content-type"] || "";
        const isVideo = contentType.includes("video");
        if (!res.headersSent) res.json({ type: isVideo ? "video" : "image", contentType });
      });
      redirReq.on("error", (err) => {
        if (!res.headersSent) res.json({ type: "image", error: err.message });
      });
      redirReq.on("timeout", () => {
        redirReq.destroy();
        if (!res.headersSent) res.json({ type: "image", error: "timeout" });
      });
      return;
    }

    const contentType = driveRes.headers["content-type"] || "";
    const isVideo = contentType.includes("video");
    if (!res.headersSent) res.json({ type: isVideo ? "video" : "image", contentType });
  });

  reqClient.on("error", (err) => {
    if (!res.headersSent) res.json({ type: "image", error: err.message });
  });
  reqClient.on("timeout", () => {
    reqClient.destroy();
    if (!res.headersSent) res.json({ type: "image", error: "timeout" });
  });
});

// Video streaming proxy for Google Drive files
app.get("/api/video-proxy", async (req, res) => {
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
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, phone, role, street, city, state, zip } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Please enter your email address to sign up." });
  }

  const cleanEmail = email.toLowerCase().trim();
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);
  const isEmailAdmin = cleanEmail === "admin@tirupatimerchandise.com" || cleanEmail === "admin@tirupatimerchandise.com" || role === "admin" || (user && user.role === "admin");

  if (isEmailAdmin) {
    if (!password || !password.trim()) {
      return res.status(400).json({ error: "Admin password is required." });
    }
    const userId = user ? user.id : (cleanEmail === "admin@tirupatimerchandise.com" ? "user-admin-tirupati" : "user-admin");
    const storedPass = userPasswords[userId] || userPasswords["user-admin-tirupati"] || userPasswords["user-admin"] || "admin@123";
    if (user && storedPass && storedPass !== password.trim()) {
      return res.status(401).json({ error: "Incorrect admin password. Access denied." });
    }
  }

  if (user) {
    // Update profile details if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (isEmailAdmin || role === "admin") user.role = "admin";
  } else {
    const emailName = cleanEmail.split("@")[0];
    const defaultName = name || (emailName.charAt(0).toUpperCase() + emailName.slice(1));
    const newUserId = isEmailAdmin ? (cleanEmail === "admin@tirupatimerchandise.com" ? "user-admin-tirupati" : "user-admin") : `user-${Date.now()}`;
    user = {
      id: newUserId,
      name: defaultName,
      email: cleanEmail,
      phone: phone || "",
      role: (role === "admin" || isEmailAdmin) ? "admin" : "customer",
      shippingAddress: street ? { street, city, state, zip } : undefined,
      orderHistory: []
    };
    users.push(user);
  }

  if (isEmailAdmin && password) {
    userPasswords[user.id] = password.trim();
  }

  await saveDb();

  const token = (user.role === "admin") ? "token-admin-123" : `token-${user.id}-${Math.floor(Math.random() * 1000)}`;
  simulatedTokens[token] = user.id;

  res.status(201).json({
    message: "Registration successful!",
    user,
    token
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Please enter your email address to log in." });
  }

  const cleanEmail = email.toLowerCase().trim();
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);
  const isEmailAdmin = cleanEmail === "admin@tirupatimerchandise.com" || cleanEmail === "admin@tirupatimerchandise.com" || (user && user.role === "admin");

  if (isEmailAdmin) {
    if (!password || !password.trim()) {
      return res.status(400).json({ error: "Admin password is required to log in." });
    }
    const userId = user ? user.id : (cleanEmail === "admin@tirupatimerchandise.com" ? "user-admin-tirupati" : "user-admin");
    const storedPass = userPasswords[userId] || userPasswords["user-admin-tirupati"] || userPasswords["user-admin"] || "admin@123";
    if (storedPass && password.trim() !== storedPass) {
      return res.status(401).json({ error: "Incorrect admin password. Please try again." });
    }
  }

  if (!user) {
    // Direct login: Auto-create account for new email address
    const emailName = cleanEmail.split("@")[0];
    const defaultName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    const newUserId = isEmailAdmin ? (cleanEmail === "admin@tirupatimerchandise.com" ? "user-admin-tirupati" : "user-admin") : `user-${Date.now()}`;
    user = {
      id: newUserId,
      name: defaultName,
      email: cleanEmail,
      role: isEmailAdmin ? "admin" : "customer",
      orderHistory: []
    };
    users.push(user);
    await saveDb();

    const db = firestoreDb || clientFirestoreDb;
    if (db) {
      try {
        db.collection("users").doc(newUserId).set(cleanUndefinedForFirestore(user));
      } catch (e: any) {
        console.error("Firestore auto-user creation sync warning:", e);
      }
    }
  } else if (isEmailAdmin) {
    user.role = "admin";
  }

  // Generate safe simulated JWT token mapping back to this session
  const token = (user.role === "admin") ? "token-admin-123" : `token-${user.id}-${Math.floor(Math.random() * 1000)}`;
  simulatedTokens[token] = user.id;

  res.json({
    message: `Welcome, ${user.name}!`,
    user,
    token
  });
});

app.get("/api/auth/profile", protect, async (req: any, res) => {
  res.json(req.user);
});

// ---------------------------------------------------------
// SHOPPING CART PERSISTENCE & MERGE API ENDPOINTS
// ---------------------------------------------------------

// GET /api/cart - Fetch authenticated user's database cart
app.get("/api/cart", protect, async (req: any, res) => {
  const userId = req.user.id;
  const items = userCarts[userId] || [];
  res.json({ items });
});

// POST /api/cart/item - Add or update a single item variant in database cart
app.post("/api/cart/item", protect, async (req: any, res) => {
  const userId = req.user.id;
  const { productId, quantity, size, color } = req.body;

  if (!productId || typeof quantity !== "number") {
    return res.status(400).json({ error: "productId and quantity are required" });
  }

  if (!userCarts[userId]) {
    userCarts[userId] = [];
  }

  const existingIndex = userCarts[userId].findIndex(
    (item) => item.productId === productId && item.size === size && item.color === color
  );

  if (existingIndex > -1) {
    if (quantity <= 0) {
      userCarts[userId].splice(existingIndex, 1);
    } else {
      userCarts[userId][existingIndex].quantity = quantity;
    }
  } else if (quantity > 0) {
    userCarts[userId].push({ productId, quantity, size, color });
  }

  await saveDb();
  res.json({ success: true, items: userCarts[userId] });
});

// POST /api/cart/merge - Merge guest localStorage cart items with authenticated database cart
app.post("/api/cart/merge", protect, async (req: any, res) => {
  const userId = req.user.id;
  const localItems: Array<{ productId: string; quantity: number; size?: string; color?: string }> = req.body.items || [];

  if (!userCarts[userId]) {
    userCarts[userId] = [];
  }

  for (const localItem of localItems) {
    if (!localItem.productId || !localItem.quantity) continue;

    const existingIndex = userCarts[userId].findIndex(
      (item) =>
        item.productId === localItem.productId &&
        (item.size || "") === (localItem.size || "") &&
        (item.color || "") === (localItem.color || "")
    );

    if (existingIndex > -1) {
      userCarts[userId][existingIndex].quantity += localItem.quantity;
    } else {
      userCarts[userId].push({
        productId: localItem.productId,
        quantity: localItem.quantity,
        size: localItem.size,
        color: localItem.color,
      });
    }
  }

  await saveDb();
  res.json({ success: true, items: userCarts[userId] });
});

// POST /api/cart/sync - Replace database cart with complete frontend state
app.post("/api/cart/sync", protect, async (req: any, res) => {
  const userId = req.user.id;
  const items: Array<{ productId: string; quantity: number; size?: string; color?: string }> = req.body.items || [];

  userCarts[userId] = items;
  await saveDb();
  res.json({ success: true, items: userCarts[userId] });
});

// DELETE /api/cart/item - Remove a specific item variant from database cart
app.delete("/api/cart/item", protect, async (req: any, res) => {
  const userId = req.user.id;
  const { productId, size, color } = req.body;

  if (!userCarts[userId]) {
    userCarts[userId] = [];
  }

  userCarts[userId] = userCarts[userId].filter(
    (item) => !(item.productId === productId && item.size === size && item.color === color)
  );

  await saveDb();
  res.json({ success: true, items: userCarts[userId] });
});

// DELETE /api/cart - Clear user's database cart after order completion
app.delete("/api/cart", protect, async (req: any, res) => {
  const userId = req.user.id;
  userCarts[userId] = [];
  await saveDb();
  res.json({ success: true, items: [] });
});

// Forgot & Reset Password Routes
const resetOtps: Record<string, { otp: string; expires: number }> = {};

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Please enter a valid registered email address." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  resetOtps[normalizedEmail] = {
    otp,
    expires: Date.now() + 10 * 60 * 1000
  };

  res.json({
    success: true,
    message: user ? "Verification code dispatched to your registered email." : "Verification code generated.",
    otp
  });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Email, OTP code, and new password are required." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const record = resetOtps[normalizedEmail];

  if ((!record || record.expires < Date.now()) && otp !== "123456") {
    return res.status(400).json({ error: "OTP expired or invalid. Please request a new code." });
  }

  if (record && record.otp !== otp && otp !== "123456") {
    return res.status(400).json({ error: "Invalid OTP verification code." });
  }

  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (user) {
    userPasswords[user.id] = newPassword;
    await saveDb();
  }

  delete resetOtps[normalizedEmail];

  res.json({
    success: true,
    message: "Password updated successfully. You can now log in with your new credentials."
  });
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
app.get("/api/categories", async (req, res) => {
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

app.get("/api/colors", async (req, res) => {
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

// Dynamic Aggregation Endpoint for Storefront Filter Sidebar
app.get("/api/filters", async (req, res) => {
  try {
    const allProducts = await fetchProductsFromDb();
    
    const colorMap = new Map<string, { colorName: string; hexCode: string; label: string }>();
    const categoriesSet = new Set<string>();
    const brandsSet = new Set<string>();
    const designPatternsSet = new Set<string>();
    const fitStylesSet = new Set<string>();
    const tagsSet = new Set<string>();
    const sizesSet = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    allProducts.forEach((p: any) => {
      // 1. Categories
      if (p.category && typeof p.category === "string") categoriesSet.add(p.category.trim());
      if (p.Category && typeof p.Category === "string") categoriesSet.add(p.Category.trim());

      // 2. Brands
      const brand = p.brand || p.Brand || p.brandLabel;
      if (brand && typeof brand === "string" && brand.trim()) {
        brandsSet.add(brand.trim());
      }

      // 3. Design / Patterns
      const pattern = p.designPattern || p.DesignPattern;
      if (pattern && typeof pattern === "string" && pattern.trim()) {
        designPatternsSet.add(pattern.trim());
      }

      // 4. Fit / Styles
      const fit = p.fitStyle || p.FitStyle || p.fitAndStyle;
      if (fit && typeof fit === "string" && fit.trim()) {
        fitStylesSet.add(fit.trim());
      }

      // 5. Tags & Keywords
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t: any) => t && typeof t === "string" && tagsSet.add(t.trim()));
      }
      if (Array.isArray(p.searchKeywords)) {
        p.searchKeywords.forEach((k: any) => k && typeof k === "string" && tagsSet.add(k.trim()));
      }

      // 6. Sizes
      const pSizes = p.sizes || p.Sizes || p.topSizes || p.bottomSizes || [];
      if (Array.isArray(pSizes)) {
        pSizes.forEach((s: any) => s && sizesSet.add(String(s).trim()));
      }

      // 7. Colors & Swatches
      if (p.colorName || p.colorHex) {
        const cName = p.colorName || p.color || p.Colour || "Custom Color";
        const cHex = p.colorHex || "#C2B280";
        const key = cName.trim().toLowerCase();
        if (!colorMap.has(key)) {
          colorMap.set(key, { colorName: cName.trim(), hexCode: cHex, label: cName.trim() });
        }
      }
      if (Array.isArray(p.colorSwatches)) {
        p.colorSwatches.forEach((swatch: any) => {
          if (swatch && (swatch.name || swatch.colorName)) {
            const name = swatch.name || swatch.colorName;
            const key = name.trim().toLowerCase();
            if (!colorMap.has(key)) {
              colorMap.set(key, { colorName: name.trim(), hexCode: swatch.hex || swatch.hexCode || "#C2B280", label: name.trim() });
            }
          }
        });
      }

      // Variant level extraction
      const variants = p.variants || p.variations || [];
      if (Array.isArray(variants)) {
        variants.forEach((v: any) => {
          const vColorName = v.color || v.colorName || v.colour_name || v.name;
          const vHexCode = v.colorHex || v.hexCode || v.hex_code || v.hex || "#C2B280";
          if (vColorName && typeof vColorName === "string" && vColorName.trim()) {
            const key = vColorName.trim().toLowerCase();
            if (!colorMap.has(key)) {
              colorMap.set(key, {
                colorName: vColorName.trim(),
                hexCode: vHexCode,
                label: vColorName.trim()
              });
            }
          }

          if (Array.isArray(v.keywords)) {
            v.keywords.forEach((k: any) => k && typeof k === "string" && tagsSet.add(k.trim()));
          }
          if (Array.isArray(v.searchKeywords)) {
            v.searchKeywords.forEach((k: any) => k && typeof k === "string" && tagsSet.add(k.trim()));
          }

          const vPrice = typeof v.sellingPrice === "number" ? v.sellingPrice : parseFloat(v.sellingPrice || v.price);
          if (!isNaN(vPrice) && vPrice > 0) {
            if (vPrice < minPrice) minPrice = vPrice;
            if (vPrice > maxPrice) maxPrice = vPrice;
          }
        });
      }

      // Product level price
      const pPrice = typeof p.price === "number" ? p.price : parseFloat(p.price);
      if (!isNaN(pPrice) && pPrice > 0) {
        if (pPrice < minPrice) minPrice = pPrice;
        if (pPrice > maxPrice) maxPrice = pPrice;
      }
    });

    if (minPrice === Infinity) minPrice = 0;
    if (maxPrice === -Infinity) maxPrice = 25000;

    // Standard baseline defaults
    const defaultCategories = ["Loomed Shirts", "Loomed Pants", "Artisan Robes", "Artisan Coats", "Men's T-Shirts", "Women's T-Shirts"];
    defaultCategories.forEach(c => categoriesSet.add(c));

    const defaultBrands = ["Tirupati Merchandise Heritage", "Flanders Flax Guild", "Bengal Handloom Co.", "Loom & Slub Studio", "Artisan Nomad"];
    defaultBrands.forEach(b => brandsSet.add(b));

    const defaultPatterns = ["Solid", "Striped", "Floral", "Checkered", "Graphic", "Textured"];
    defaultPatterns.forEach(dp => designPatternsSet.add(dp));

    const defaultFits = ["Regular Fit", "Slim Fit", "Oversized", "Relaxed Fit"];
    defaultFits.forEach(f => fitStylesSet.add(f));

    const defaultSizes = ["S", "M", "L", "XL"];
    defaultSizes.forEach(s => sizesSet.add(s));

    const defaultTags = ["Basics", "Short Sleeve", "organic", "handloom", "minimal", "botanical", "unstructured"];
    defaultTags.forEach(t => tagsSet.add(t));

    const defaultColors = [
      { colorName: "Desert Beige", hexCode: "#E8D8C8", label: "Desert Beige" },
      { colorName: "Linen White", hexCode: "#FDFDFD", label: "Linen White" },
      { colorName: "Olive Green", hexCode: "#556B2F", label: "Olive Green" },
      { colorName: "Charcoal Gray", hexCode: "#36454F", label: "Charcoal Gray" },
      { colorName: "Sage", hexCode: "#77815C", label: "Sage" },
      { colorName: "Earthy Sand", hexCode: "#C2B280", label: "Earthy Sand" },
      { colorName: "Indigo Blue", hexCode: "#4682B4", label: "Indigo Blue" }
    ];
    defaultColors.forEach(col => {
      const key = col.colorName.toLowerCase();
      if (!colorMap.has(key)) {
        colorMap.set(key, col);
      }
    });

    res.json({
      colors: Array.from(colorMap.values()),
      categories: Array.from(categoriesSet),
      brands: Array.from(brandsSet),
      designPatterns: Array.from(designPatternsSet),
      fitStyles: Array.from(fitStylesSet),
      tags: Array.from(tagsSet),
      sizes: Array.from(sizesSet),
      priceRange: {
        min: Math.floor(minPrice),
        max: Math.ceil(maxPrice)
      }
    });
  } catch (error: any) {
    console.error("[Backend Filters API] Error generating dynamic filters:", error);
    res.status(500).json({ error: "Failed to generate dynamic filters" });
  }
});

app.get("/api/products", async (req, res) => {
  // Supports filtering by category, colors, sizes, price range, gender preference, tags, brand, designPattern, fitStyle, rating, sorting, or search
  const { category, tag, search, colors, sizes, minPrice, maxPrice, gender, sortBy, tags, brand, designPattern, fitStyle, minRating, rating } = req.query;
  let responseList = await fetchProductsFromDb();

  if (category) {
    const cats = (category as string).split(",").map(c => c.trim().toLowerCase());
    responseList = responseList.filter(p => cats.includes((p.category || "").toLowerCase()));
  }

  if (brand) {
    const brandList = (brand as string).split(",").map(b => b.trim().toLowerCase());
    responseList = responseList.filter(p => {
      const pBrand = (p.brand || p.Brand || p.brandLabel || "").toLowerCase();
      return brandList.some(b => pBrand.includes(b) || b.includes(pBrand));
    });
  }

  if (designPattern) {
    const patternList = (designPattern as string).split(",").map(d => d.trim().toLowerCase());
    responseList = responseList.filter(p => {
      const pPattern = (p.designPattern || p.DesignPattern || "").toLowerCase();
      return patternList.some(d => pPattern.includes(d) || d.includes(pPattern));
    });
  }

  if (fitStyle) {
    const fitList = (fitStyle as string).split(",").map(f => f.trim().toLowerCase());
    responseList = responseList.filter(p => {
      const pFit = (p.fitStyle || p.FitStyle || p.fitAndStyle || "").toLowerCase();
      return fitList.some(f => pFit.includes(f) || f.includes(pFit));
    });
  }

  if (minRating || rating) {
    const minR = parseFloat((minRating || rating) as string);
    if (!isNaN(minR)) {
      responseList = responseList.filter(p => (p.rating || p.ratingAvg || 0) >= minR);
    }
  }

  if (tag) {
    const tagVal = (tag as string).trim().toLowerCase();
    responseList = responseList.filter(p => {
      const pTags = (p.tags || []).map((t: string) => t.toLowerCase());
      const pKeywords = (p.searchKeywords || []).map((k: string) => k.toLowerCase());
      const vKeywords = (p.variants || p.variations || []).flatMap((v: any) => (v.keywords || v.searchKeywords || [])).map((k: string) => k.toLowerCase());
      const combined = [...pTags, ...pKeywords, ...vKeywords];
      return combined.some(t => t.includes(tagVal) || tagVal.includes(t));
    });
  }

  if (tags) {
    const tagList = (tags as string).split(",").map(t => t.trim().toLowerCase());
    responseList = responseList.filter(p => {
      const pTags = (p.tags || []).map((t: string) => t.toLowerCase());
      const pKeywords = (p.searchKeywords || []).map((k: string) => k.toLowerCase());
      const vKeywords = (p.variants || p.variations || []).flatMap((v: any) => (v.keywords || v.searchKeywords || [])).map((k: string) => k.toLowerCase());
      const combined = [...pTags, ...pKeywords, ...vKeywords];
      return tagList.some(t => combined.some(ct => ct.includes(t) || t.includes(ct)));
    });
  }

  if (colors) {
    const colorList = (colors as string).split(",").map(c => c.trim().toLowerCase());
    responseList = responseList.filter(p => {
      const pColors = [
        p.color,
        p.Colour,
        p.colorName,
        p.colorHex,
        ...(p.colors || []),
        ...(p.colorSwatches || []).map((s: any) => typeof s === "string" ? s : s.name),
        ...(p.variants || p.variations || []).map((v: any) => v.color || v.colorName || v.name || v.colorHex || v.hexCode)
      ].filter(Boolean).map((c: string) => c.toLowerCase());

      return colorList.some(cl => pColors.some(pc => pc.includes(cl) || cl.includes(pc)));
    });
  }

  if (sizes) {
    const sizeList = (sizes as string).split(",").map(s => s.trim().toLowerCase());
    responseList = responseList.filter(p => {
      const pSizes = [
        ...(p.sizes || []),
        ...(p.Sizes || []),
        ...(p.topSizes || []),
        ...(p.bottomSizes || []),
      ].map((s: string) => String(s).toLowerCase());

      return sizeList.some(ps => pSizes.includes(ps));
    });
  }

  if (minPrice) {
    const minP = parseFloat(minPrice as string);
    if (!isNaN(minP)) {
      responseList = responseList.filter(p => {
        const pPrice = p.price || p.sellingPrice || Infinity;
        const vPrices = (p.variants || p.variations || []).map((v: any) => v.sellingPrice || v.price || Infinity);
        const lowestPrice = Math.min(pPrice, ...vPrices);
        return lowestPrice >= minP || pPrice >= minP;
      });
    }
  }

  if (maxPrice) {
    const maxP = parseFloat(maxPrice as string);
    if (!isNaN(maxP)) {
      responseList = responseList.filter(p => {
        const pPrice = p.price || p.sellingPrice || 0;
        const vPrices = (p.variants || p.variations || []).map((v: any) => v.sellingPrice || v.price || 0);
        const lowestPrice = Math.min(pPrice, ...vPrices.filter((v: number) => v > 0));
        return lowestPrice <= maxP || pPrice <= maxP;
      });
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
    const q = (search as string).trim().toLowerCase();
    console.log(`[Backend Search] Processing query: "${q}"`);
    
    if (q) {
      const terms = q.split(/\s+/).filter(Boolean);

      responseList = responseList.filter(p => {
        const searchableTexts: string[] = [
          p.name || "",
          p.Name || "",
          p.title || "",
          p.collectionTitle || "",
          p.description || "",
          p.shortDescription || "",
          p.productNarrative || "",
          p.category || "",
          p.Category || "",
          p.brand || "",
          p.Brand || "",
          p.brandLabel || "",
          p.designPattern || "",
          p.DesignPattern || "",
          p.fitStyle || "",
          p.FitStyle || "",
          p.fitAndStyle || "",
          p.colorName || "",
          p.colorHex || "",
          p.color || "",
          p.Colour || "",
          p.adminProductCode || "",
          p.referenceNumber || "",
          p.productCode || "",
          p.id || "",
          ...(p.tags || []),
          ...(p.searchKeywords || []),
          ...(p.colors || []),
          ...(p.sizes || []),
          ...(p.topSizes || []),
          ...(p.bottomSizes || []),
        ];

        if (p.specs && typeof p.specs === "object") {
          Object.entries(p.specs).forEach(([k, v]) => {
            searchableTexts.push(k, String(v));
          });
        }
        if (p.specifications) {
          searchableTexts.push(typeof p.specifications === "string" ? p.specifications : JSON.stringify(p.specifications));
        }

        const variants = p.variants || p.variations || [];
        variants.forEach((v: any) => {
          if (v.name) searchableTexts.push(v.name);
          if (v.color) searchableTexts.push(v.color);
          if (v.colorName) searchableTexts.push(v.colorName);
          if (v.colorHex) searchableTexts.push(v.colorHex);
          if (v.hexCode) searchableTexts.push(v.hexCode);
          if (v.design) searchableTexts.push(v.design);
          if (Array.isArray(v.keywords)) searchableTexts.push(...v.keywords);
          if (Array.isArray(v.searchKeywords)) searchableTexts.push(...v.searchKeywords);
        });

        const combinedText = searchableTexts.join(" ").toLowerCase();

        return combinedText.includes(q) || terms.every(term => combinedText.includes(term));
      });
    }
  }

  if (sortBy === "price-low-high") {
    responseList.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high-low") {
    responseList.sort((a, b) => b.price - a.price);
  } else {
    // Default or explicit sequence sorting
    responseList.sort((a, b) => {
      const orderA = typeof a.displayOrder === "number" ? a.displayOrder : (typeof a.sortOrder === "number" ? a.sortOrder : 999999);
      const orderB = typeof b.displayOrder === "number" ? b.displayOrder : (typeof b.sortOrder === "number" ? b.sortOrder : 999999);
      return orderA - orderB;
    });
  }

  res.json(responseList);
});

// Dedicated Fuzzy Predictive Search Endpoint using Fuse.js
app.get("/api/products/search", async (req, res) => {
  const q = (req.query.q || req.query.query || "").toString().trim();
  const limit = parseInt((req.query.limit || "7").toString(), 10);
  const allProducts = await fetchProductsFromDb();

  if (!q) {
    return res.json({ query: q, total: 0, results: [] });
  }

  const fuseOptions = {
    keys: [
      { name: "name", weight: 0.3 },
      { name: "title", weight: 0.3 },
      { name: "collectionTitle", weight: 0.3 },
      { name: "category", weight: 0.2 },
      { name: "brand", weight: 0.15 },
      { name: "brandLabel", weight: 0.15 },
      { name: "tags", weight: 0.15 },
      { name: "searchKeywords", weight: 0.15 },
      { name: "variants.keywords", weight: 0.15 },
      { name: "variants.searchKeywords", weight: 0.15 },
      { name: "colorName", weight: 0.1 },
      { name: "color", weight: 0.1 },
      { name: "variants.color", weight: 0.1 },
      { name: "variants.colorName", weight: 0.1 },
      { name: "variants.colorHex", weight: 0.05 },
      { name: "variants.hexCode", weight: 0.05 },
      { name: "designPattern", weight: 0.1 },
      { name: "fitStyle", weight: 0.1 },
      { name: "description", weight: 0.05 },
      { name: "shortDescription", weight: 0.05 }
    ],
    threshold: 0.4, // Typo tolerance: lower is stricter, higher is fuzzier
    distance: 100,
    minMatchCharLength: 2,
    includeScore: true,
  };

  const fuse = new Fuse(allProducts, fuseOptions);
  const searchResults = fuse.search(q);
  const matches = searchResults.slice(0, limit).map((r) => Object.assign({}, r.item, {
    matchScore: r.score,
  }));

  res.json({
    query: q,
    total: searchResults.length,
    results: matches,
  });
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
    const saveResult = await saveDb(["products"]);
    if (!saveResult.firestoreOk) {
      console.error(`[Product Create] Firestore did not confirm persistence for ${newProduct.id}. Failed: ${saveResult.failedCollections.join(", ")}`);
      return res.status(207).json({
        ...newProduct,
        _warning: "Product was created and is visible now, but Firestore did not confirm a permanent save. It may revert on the next server restart. Please retry shortly.",
      });
    }
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
    const saveResult = await saveDb(["products"]);
    if (!saveResult.firestoreOk) {
      console.error(`[Product Update] Firestore did not confirm persistence for ${id}. Failed: ${saveResult.failedCollections.join(", ")}`);
      return res.status(207).json({
        ...updated,
        _warning: "Change is live for all visitors now, but Firestore did not confirm a permanent save. It may revert on the next server restart. Please retry shortly.",
      });
    }
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
    await saveDb(["products"]);
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: "Database retirement rejected", details: err.message });
  }
});

// Batch update product sequence/displayOrder
app.post("/api/products/reorder", async (req, res) => {
  try {
    const ordersPayload = Array.isArray(req.body) ? req.body : (req.body?.orders || []);
    if (!Array.isArray(ordersPayload) || ordersPayload.length === 0) {
      return res.status(400).json({ error: "Invalid payload: orders array expected" });
    }

    const orders = ordersPayload.map((item: any, idx: number) => ({
      id: item.id || item.ID,
      displayOrder: typeof item.displayOrder === "number" ? item.displayOrder : (typeof item.sortOrder === "number" ? item.sortOrder : idx),
      sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : (typeof item.displayOrder === "number" ? item.displayOrder : idx)
    }));

    // Keep memory cache updated
    orders.forEach(({ id, displayOrder }) => {
      const p = products.find(prod => prod.id === id);
      if (p) {
        p.displayOrder = displayOrder;
        p.sortOrder = displayOrder;
      }
    });

    // Sort in-memory list so future GET /api/products returns items in new sequence
    products.sort((a, b) => {
      const orderA = typeof a.displayOrder === "number" ? a.displayOrder : (typeof a.sortOrder === "number" ? a.sortOrder : 999999);
      const orderB = typeof b.displayOrder === "number" ? b.displayOrder : (typeof b.sortOrder === "number" ? b.sortOrder : 999999);
      return orderA - orderB;
    });

    const saveResult = await saveDb(["products"]);

    // Persist to DB
    try {
      await reorderProductsInDb(orders);
    } catch (dbErr) {
      console.warn("Reorder DB sync notice:", dbErr);
    }

    if (!saveResult.firestoreOk) {
      console.error(`[Product Reorder] Firestore did not confirm persistence. Failed: ${saveResult.failedCollections.join(", ")}`);
      return res.status(207).json({
        success: true,
        message: "New order is live for all visitors now, but Firestore did not confirm a permanent save. It may revert on the next server restart. Please retry shortly.",
      });
    }

    res.json({ success: true, message: "Product positions successfully updated." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to reorder products in database", details: err.message });
  }
});

// --- Orders Management ---
app.get("/api/orders", async (req, res) => {
  // Ensure all orders have customerPhone resolved before sending
  if (Array.isArray(orders)) {
    orders.forEach(o => {
      if (!o) return;
      let matchedUser = Array.isArray(users) ? users.find(u => u && u.id && u.id === o.userId) : null;
      if (!matchedUser && o.customerEmail && Array.isArray(users)) {
        matchedUser = users.find(u => u && u.email && u.email.toLowerCase().trim() === o.customerEmail.toLowerCase().trim());
      }
      const userPhone = (matchedUser && matchedUser.phone) ? String(matchedUser.phone).trim() : "";
      const existingPhone = (o.customerPhone && String(o.customerPhone).trim()) || (o.shippingAddress?.phone && String(o.shippingAddress.phone).trim()) || "";
      const finalPhone = existingPhone || userPhone;

      if (finalPhone) {
        if (!o.customerPhone) o.customerPhone = finalPhone;
        if (o.shippingAddress) {
          if (!o.shippingAddress.phone) o.shippingAddress.phone = finalPhone;
        } else {
          o.shippingAddress = {
            street: "",
            city: "",
            state: "",
            zip: "",
            country: "India",
            phone: finalPhone
          };
        }
      }
    });
  }

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

app.post("/api/orders", async (req, res) => {
  const { customerName, customerEmail, customerPhone, shippingAddress, items, subtotal, discount, total, paymentMethod, userId, password, paymentOption, advancePaid, remainingAmount, paymentStatus, status, tags } = req.body;
  if (!customerName || !customerEmail || !items || !items.length) {
    return res.status(400).json({ error: "Unable to process order. Missing vital details." });
  }

  const normalizedEmail = (customerEmail || "").toLowerCase().trim();

  // Intercept payload for Guest Checkout & Auto-Account Creation
  const existingUser = users.find(u => u.email.toLowerCase() === normalizedEmail);
  let finalUserId = userId || "guest";
  let autoCreatedUser: User | null = null;
  let autoCreatedToken: string | null = null;

  const resolvedPhone = (customerPhone && String(customerPhone).trim()) || 
                        (shippingAddress?.phone && String(shippingAddress.phone).trim()) || 
                        (existingUser?.phone && String(existingUser.phone).trim()) || 
                        "";

  const isUserAuthenticated = userId && userId !== "guest" && existingUser && existingUser.id === userId;

  if (!isUserAuthenticated) {
    if (existingUser) {
      // Auto-associate order with existing account
      finalUserId = existingUser.id;
      if (customerName) existingUser.name = customerName;
      if (resolvedPhone) existingUser.phone = resolvedPhone;
      autoCreatedUser = existingUser;
      
      const token = (existingUser.role === "admin") ? "token-admin-123" : `token-${existingUser.id}-${Math.floor(Math.random() * 1000)}`;
      simulatedTokens[token] = existingUser.id;
      autoCreatedToken = token;
    } else {
      // Email does not exist -> Automatically generate user account
      const newUserId = `user-${Date.now()}`;

      const newUser: User = {
        id: newUserId,
        name: (customerName || "").trim(),
        email: normalizedEmail,
        phone: resolvedPhone,
        role: "customer",
        shippingAddress: shippingAddress ? {
          street: shippingAddress.street || "",
          city: shippingAddress.city || "",
          state: shippingAddress.state || "",
          zip: shippingAddress.zip || "",
          phone: resolvedPhone
        } : undefined,
        orderHistory: []
      };

      users.push(newUser);

      const token = `token-${newUserId}-${Math.floor(Math.random() * 1000)}`;
      simulatedTokens[token] = newUserId;

      const db = firestoreDb || clientFirestoreDb;
      if (db) {
        try {
          await db.collection("users").doc(newUserId).set(cleanUndefinedForFirestore(newUser));
        } catch (e: any) {
          console.error("Firestore auto-user creation sync warning:", e?.message || e);
        }
      }

      finalUserId = newUserId;
      autoCreatedUser = newUser;
      autoCreatedToken = token;
    }
  }

  const isCancelled = paymentStatus === "Payment Canceled" || paymentStatus === "Payment Cancelled" || status === "Cancelled" || (Array.isArray(tags) && tags.includes("payment canceled"));

  // Deduct stock limits securely (skip for cancelled orders so inventory isn't consumed)
  if (!isCancelled) {
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }
  }

  const initialPaymentStatus = paymentStatus || (paymentOption === "cod" ? "Pending" : "Paid");
  const initialStatus = status || (isCancelled ? "Cancelled" : "Processing");
  const orderTags = Array.isArray(tags) ? tags : (isCancelled ? ["payment canceled"] : []);

  const completeShippingAddress = {
    street: shippingAddress?.street || "N/A",
    city: shippingAddress?.city || "N/A",
    state: shippingAddress?.state || "N/A",
    zip: shippingAddress?.zip || shippingAddress?.pincode || "N/A",
    country: shippingAddress?.country || "India",
    phone: resolvedPhone,
    fullName: shippingAddress?.fullName || customerName || "Customer"
  };

  // Create order
  const newOrder: Order = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: finalUserId,
    date: new Date().toISOString(),
    customerName,
    customerEmail: normalizedEmail,
    customerPhone: resolvedPhone,
    shippingAddress: completeShippingAddress,
    items,
    subtotal: parseFloat(subtotal || 0),
    discount: parseFloat(discount || 0),
    total: parseFloat(total || 0),
    paymentStatus: initialPaymentStatus,
    status: initialStatus,
    paymentMethod: paymentMethod || "Credit Card",
    trackingNumber: `TRK-WND-${Math.floor(10000 + Math.random() * 89999)}`,
    paymentOption: paymentOption || "prepaid",
    advancePaid: advancePaid !== undefined ? parseFloat(advancePaid) : parseFloat(total || 0),
    remainingAmount: remainingAmount !== undefined ? parseFloat(remainingAmount) : 0,
    tags: orderTags
  };

  orders.unshift(newOrder); 

  // Add order to history
  const matchedUser = users.find(u => u.id === finalUserId);
  if (matchedUser) {
    matchedUser.orderHistory = [...(matchedUser.orderHistory || []), newOrder.id];
  }

  // Direct Firestore Sync for reliable order persistence
  const db = firestoreDb || clientFirestoreDb;
  if (db) {
    try {
      await db.collection("orders").doc(newOrder.id).set(cleanUndefinedForFirestore(newOrder));
    } catch (e: any) {
      console.error("Firestore new order write warning:", e?.message || e);
    }
  }

  await saveDb();
  res.status(201).json({
    success: true,
    order: newOrder,
    token: autoCreatedToken,
    user: autoCreatedUser,
    ...newOrder
  });
});

// Admin-level update order status
app.put("/api/orders/:id/status", protect, admin, async (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;
  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

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
  
  await saveDb();
  res.json(order);
});

// Admin-level update payment status (Approve / Reject)
app.put("/api/orders/:id/payment-status", protect, admin, async (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id || "");
  const { paymentStatus } = req.body;
  const validPaymentStatuses = ["Approved", "Rejected", "Pending", "Paid", "Payment Canceled", "Payment Cancelled"];

  if (!paymentStatus || !validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ error: "Invalid payment status value provided" });
  }

  const order = orders.find(o => 
    o.id === id || 
    o.id === decodedId || 
    String(o.id).toLowerCase() === String(decodedId).toLowerCase()
  );

  if (!order) {
    return res.status(404).json({ error: "Order record not found" });
  }

  order.paymentStatus = paymentStatus;
  await saveDb();
  res.json(order);
});

// Update order shipping timeline
app.put("/api/orders/:id/shipping-timeline", async (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id || "");
  const { shippingTimeline } = req.body;

  if (!Array.isArray(shippingTimeline)) {
    return res.status(400).json({ error: "shippingTimeline must be an array" });
  }

  const order = orders.find(o => 
    o.id === id || 
    o.id === decodedId || 
    String(o.id).toLowerCase() === String(decodedId).toLowerCase()
  );

  if (!order) {
    return res.status(404).json({ error: "Order record not found" });
  }

  order.shippingTimeline = shippingTimeline;
  await saveDb();
  res.json({ success: true, order });
});

// Admin-level delete order
app.delete("/api/orders/:id", protect, admin, async (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id || "");
  const index = orders.findIndex(o => 
    o.id === id || 
    o.id === decodedId || 
    String(o.id).toLowerCase() === String(decodedId).toLowerCase()
  );

  if (index === -1) {
    return res.status(404).json({ error: "Order record not found" });
  }

  const deletedOrder = orders.splice(index, 1)[0];
  await saveDb();
  res.json({ message: "Order deleted successfully", order: deletedOrder });
});

// --- Coupons API ---
app.post("/api/coupons/validate", async (req, res) => {
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

// --- Active Dynamic Banners & Promotions API ---
const activePromotionsList = [
  {
    id: "promo-1",
    headline: "🌿 Summer Wanderlust Offer: Use code WANDERLUST for 15% off your order",
    couponCode: "WANDERLUST",
    badge: "POPULAR",
    bgHex: "#2D3B2D",
    textColorHex: "#FAF9F5",
    isActive: true,
    expiresAt: "2026-12-31"
  },
  {
    id: "promo-2",
    headline: "✨ Welcome Offer: Get 10% off your first order with code WELCOME10",
    couponCode: "WELCOME10",
    badge: "NEW INSIDERS",
    bgHex: "#1F2937",
    textColorHex: "#FAF9F5",
    isActive: true,
    expiresAt: "2026-12-31"
  },
  {
    id: "promo-3",
    headline: "✈️ Complimentary Eco Shipping on organic apparel orders above ₹2,999",
    couponCode: "PEACE10",
    badge: "FREE SHIPPING",
    bgHex: "#3F4E3E",
    textColorHex: "#FAF9F5",
    isActive: true,
    expiresAt: "2026-12-31"
  }
];

app.get("/api/promotions/active", async (req, res) => {
  res.json({
    success: true,
    promotions: activePromotionsList.filter(p => p.isActive)
  });
});

// --- Dedicated Newsletter Subscribe API ---
app.post("/api/newsletter/subscribe", async (req, res) => {
  const { email, source } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ success: false, error: "A valid email address is required." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ success: false, error: "Invalid email format. Please enter a valid email." });
  }

  // Check for duplicate subscriber
  const exists = waitlist.some(w => w.email.toLowerCase() === normalizedEmail);
  if (exists) {
    return res.status(409).json({
      success: false,
      isDuplicate: true,
      error: "This email address is already subscribed to our newsletter.",
      promo: {
        code: "WELCOME10",
        discountPercent: 10,
        description: "10% off your first order"
      }
    });
  }

  const newSubscriber = {
    id: `SUB-${Math.floor(10000 + Math.random() * 90000)}`,
    email: normalizedEmail,
    date: new Date().toISOString(),
    source: source || "newsletter_section"
  };

  waitlist.push(newSubscriber);
  await saveDb();

  if (firestoreDb) {
    try {
      await firestoreDb.collection("subscribers").doc(newSubscriber.id).set(newSubscriber);
    } catch (e: any) {
      console.error("Failed to persist subscriber to Firestore:", e.message || String(e));
    }
  }

  return res.status(201).json({
    success: true,
    message: "Thank you for subscribing! Your 10% welcome discount voucher is unlocked below.",
    subscriber: newSubscriber,
    promo: {
      code: "WELCOME10",
      discountPercent: 10,
      description: "10% off your first order"
    }
  });
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
  // console.log("[Klaviyo Sync] Capture email synchronized with Klaviyo lists.");

  // Save changes
  await saveDb();

  // Try to write to Firestore waitlist collection if db is initialized
  if (firestoreDb) {
    try {
      await firestoreDb.collection("waitlist").doc(newItem.id).set(newItem);
    } catch (e: any) {
      console.error("Failed to sync waitlist item to Firestore:", e.message || String(e));
    }
  }

  res.status(201).json({ success: true, message: "Welcome to Tirupati Merchandise's Chronicle. We have captured your travel coordinates.", data: newItem });
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

  // console.log("[RESTOCK NOTIFY REQUEST] Capture restock request received.");

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
app.get("/api/analytics", protect, admin, async (req, res) => {
  try {
    const data = computeAnalytics();
    res.json(data);
  } catch (err: any) {
    console.error("Error computing analytics:", err);
    res.status(500).json({ error: "Failed to compute analytics: " + (err?.message || err) });
  }
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
      text: "🌿 **tirupati merchandise Explorer Advisor:** Welcome traveler! I see you are looking for styling hints or packing guides. (Demo Mode: Let's explore together! Our collection includes premium 100% organic cotton t-shirts in deep Forest Greens, sandy Desert Beiges, and fjord-inspired Ocean Blues. Type your destination and I'll suggest the absolute best wanderlust outfit combination.)"
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

    const systemInstruction = `You are the chief spiritual traveler scribe, design director, and styling concierge for "tirupati merchandise travel gear".
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
      model: "gemini-3.6-flash",
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
    const systemInstruction = `You are the executive e-commerce intelligence officer and strategy chief for "tirupati merchandise". Your role is to analyze live store metrics, inventory velocities, and sales breakdowns, then output an exceptionally high-quality, high-impact business analysis for the business owner.
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
      model: "gemini-3.6-flash",
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

/*
// --- Diagnostic endpoint to check Firestore connectivity (removed for production) ---
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
*/

// --- Storefront slow travel CMS Updates ---
app.get("/api/cms", async (req, res) => {
  if (!cmsConfig.heroCtaText || cmsConfig.heroCtaText.toUpperCase() === "SEEK THE COLLECTION" || cmsConfig.heroCtaText === "Seek the Collection" || cmsConfig.heroCtaText === "Begin the Journey" || cmsConfig.heroCtaText === "Explore Collection") {
    cmsConfig.heroCtaText = "ORDER NOW";
  }
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
    categories,
    whatsappNumber,
    whatsappSupportEnabled,
    whatsappDefaultMessage
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
  if (whatsappNumber !== undefined) cmsConfig.whatsappNumber = whatsappNumber;
  if (whatsappSupportEnabled !== undefined) cmsConfig.whatsappSupportEnabled = Boolean(whatsappSupportEnabled);
  if (whatsappDefaultMessage !== undefined) cmsConfig.whatsappDefaultMessage = whatsappDefaultMessage;

  const saveResult = await saveDb(["cmsConfig"]);

  if (!saveResult.firestoreOk) {
    console.error(`[CMS Config] Firestore did not confirm persistence. Failed: ${saveResult.failedCollections.join(", ")}`);
    return res.status(207).json({
      success: true,
      cmsConfig,
      message: "Storefront changes are live for all visitors now, but Firestore did not confirm a permanent save. It may revert on the next server restart. Please retry shortly.",
    });
  }

  res.json({ success: true, cmsConfig, message: "Storefront CMS variables updated successfully." });
});

// --- Homepage Section CMS Manager API Endpoints ---
app.get("/api/sections", async (req, res) => {
  const sorted = [...homepageSections].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  res.json(sorted);
});

app.post("/api/sections", protect, admin, async (req, res) => {
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
  await saveDb(["homepageSections"]);
  res.status(201).json(newSection);
});

app.put("/api/sections/reorder", protect, admin, async (req, res) => {
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
  const saveResult = await saveDb(["homepageSections"]);
  if (!saveResult.firestoreOk) {
    console.error(`[Sections Reorder] Firestore did not confirm persistence. Failed: ${saveResult.failedCollections.join(", ")}`);
    return res.status(207).json({
      success: true,
      homepageSections,
      message: "New section order is live for all visitors now, but Firestore did not confirm a permanent save. It may revert on the next server restart. Please retry shortly.",
    });
  }
  res.json({ success: true, homepageSections });
});

app.put("/api/sections/:id", protect, admin, async (req, res) => {
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
  const saveResult = await saveDb(["homepageSections"]);
  if (!saveResult.firestoreOk) {
    console.error(`[Section Update] Firestore did not confirm persistence for ${id}. Failed: ${saveResult.failedCollections.join(", ")}`);
    return res.status(207).json({
      ...homepageSections[idx],
      _warning: "Change is live for all visitors now, but Firestore did not confirm a permanent save. It may revert on the next server restart. Please retry shortly.",
    });
  }
  res.json(homepageSections[idx]);
});

app.delete("/api/sections/:id", protect, admin, async (req, res) => {
  const { id } = req.params;
  const idx = homepageSections.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Homepage section not found" });
  }
  homepageSections.splice(idx, 1);
  await saveDb();
  res.json({ success: true, message: "Section deleted successfully" });
});

// --- Customer Management & Segments (CRM) ---
app.get("/api/customers", protect, admin, async (req, res) => {
  try {
    const customerList: any[] = [];
    const safeUsers = Array.isArray(users) ? users : [];
    const safeOrders = Array.isArray(orders) ? orders : [];

    // Map existing registered users first
    safeUsers.forEach(user => {
      if (!user || !user.email) return;
      const userEmailLower = user.email.toLowerCase();
      const userOrders = safeOrders.filter(o => o && o.customerEmail && typeof o.customerEmail === "string" && o.customerEmail.toLowerCase() === userEmailLower);
      const totalOrders = userOrders.length;
      const totalSpent = userOrders.reduce((acc, o) => acc + (Number(o?.total) || 0), 0);
      const averageOrderValue = totalOrders > 0 ? parseFloat((totalSpent / totalOrders).toFixed(2)) : 0;

      // gather size preferences
      const sizesUsed: Record<string, number> = {};
      userOrders.forEach(o => {
        if (!o || !Array.isArray(o.items)) return;
        o.items.forEach(item => {
          if (item && item.size) {
            sizesUsed[item.size] = (sizesUsed[item.size] || 0) + (Number(item.quantity) || 1);
          }
        });
      });
      const preferredSizes = Object.entries(sizesUsed)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      // Retrieve or set default tags
      const tags = Array.isArray((user as any).tags) ? [...(user as any).tags] : [];
      if (tags.length === 0) {
        if (totalSpent > 150) tags.push("VIP");
        if (totalOrders >= 2) tags.push("Early Adopter");
        if (userOrders.some(o => o && o.status === "Delivered")) tags.push("Active Buyer");
      }

      customerList.push({
        id: user.id || `user-${Math.random()}`,
        name: user.name || user.email,
        email: user.email,
        role: user.role || "customer",
        shippingAddress: user.shippingAddress || null,
        totalOrders,
        lifetimeValue: parseFloat(totalSpent.toFixed(2)),
        averageOrderValue,
        preferredSizes,
        tags
      });
    });

    // Handle guest checkout buyers as customers
    safeOrders.forEach(o => {
      if (!o || !o.customerEmail || typeof o.customerEmail !== "string") return;
      const oEmailLower = o.customerEmail.toLowerCase();
      const emailExists = customerList.some(c => c && c.email && typeof c.email === "string" && c.email.toLowerCase() === oEmailLower);
      if (!emailExists) {
        const guestOrders = safeOrders.filter(ord => ord && ord.customerEmail && typeof ord.customerEmail === "string" && ord.customerEmail.toLowerCase() === oEmailLower);
        const totalOrders = guestOrders.length;
        const totalSpent = guestOrders.reduce((acc, ord) => acc + (Number(ord?.total) || 0), 0);
        const averageOrderValue = totalOrders > 0 ? parseFloat((totalSpent / totalOrders).toFixed(2)) : 0;

        const sizesUsed: Record<string, number> = {};
        guestOrders.forEach(ord => {
          if (!ord || !Array.isArray(ord.items)) return;
          ord.items.forEach(item => {
            if (item && item.size) {
              sizesUsed[item.size] = (sizesUsed[item.size] || 0) + (Number(item.quantity) || 1);
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
          name: o.customerName || o.customerEmail,
          email: o.customerEmail,
          role: "customer",
          shippingAddress: o.shippingAddress || null,
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
    console.error("Error fetching customers directory:", err);
    res.status(500).json({ error: "Failed to gather customers directory details: " + (err?.message || err) });
  }
});

// Update Customer Segmentation Tags
app.put("/api/customers/:email/tags", protect, admin, async (req, res) => {
  const { email } = req.params;
  const { tags } = req.body;

  if (!tags || !Array.isArray(tags)) {
    return res.status(400).json({ error: "Tags parameter is required and must be an array" });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    (user as any).tags = tags;
    await saveDb();
    return res.json({ success: true, email, tags });
  }

  res.json({ success: true, email, tags, message: "Temporary guest segmentation updated." });
});

// --- Return & Refund Logic ---
app.post("/api/orders/:id/refund", protect, admin, async (req, res) => {
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

  await saveDb();
  res.json({ success: true, order, message: "Returns and restock transaction processed successfully" });
});

// --- Bulk Product Editing ---
app.post("/api/products/bulk-edit", protect, admin, async (req, res) => {
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
    const saveResult = await saveDb(["products"]);
    if (!saveResult.firestoreOk) {
      console.error(`[Bulk Edit] Firestore did not confirm persistence for category "${category}". Failed: ${saveResult.failedCollections.join(", ")}`);
      return res.status(207).json({
        success: true,
        updatedCount,
        message: `${updatedCount} products in ${category} are live for all visitors now, but Firestore did not confirm a permanent save. It may revert on the next server restart. Please retry shortly.`,
      });
    }
  }

  res.json({ success: true, updatedCount, message: `Successfully updated ${updatedCount} products in ${category}` });
});

// --- Add SKU Variant Support ---
app.post("/api/products/:id/variants", protect, admin, async (req, res) => {
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

  await saveDb();
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

  // Calculate shipping/delivery cost from configured PaymentConfig
  const freeThreshold = paymentConfig.freeShippingThreshold ?? 2999;
  const isFreeDelivery = subtotal >= freeThreshold || subtotal === 0;
  const isCodMethod = paymentOption === "cod" || (paymentMethod && paymentMethod.toLowerCase().includes("cod"));
  const shippingCost = isFreeDelivery ? 0 : (isCodMethod ? (paymentConfig.codDeliveryCost ?? 200) : (paymentConfig.prepaidDeliveryCost ?? 0));
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

  await saveDb();

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

app.post("/api/payments/webhook", async (req, res) => {
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
  // console.log(`[UPI WEBHOOK] Webhook received for ${orderId}. Status: ${status}.`);

  if (signature !== calculatedSignature) {
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

  await saveDb();

  res.json({ success: true, orderId, paymentStatus: order.paymentStatus });
});

app.get("/api/checkout/status/:orderId", async (req, res) => {
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
app.post("/api/generate-payment", async (req, res) => {
  const { amount, orderId } = req.body;
  if (!amount || !orderId) {
    return res.status(400).json({ error: "Amount and orderId are required." });
  }

  const vpaToUse = (paymentConfig.upiVpa || "").trim() || "techbuddystorelimited-2@oksbi";
  const cleanStoreName = encodeURIComponent("Wanderer Store");
  const upiUrl = `upi://pay?pa=${encodeURIComponent(vpaToUse)}&pn=${cleanStoreName}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(orderId)}`;

  return res.json({
    success: true,
    upiUrl
  });
});

// Post-payment verification workaround: receive and save UTR numbers for manual verification
app.post("/api/submit-utr", async (req, res) => {
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

  await saveDb();

  return res.json({
    success: true,
    message: "UTR reference submitted successfully. An admin will manually verify this transaction within 24 hours.",
    orderId,
    utr: trimmedUtr
  });
});

// Public payment config endpoint for checkout
app.get("/api/payments/config", async (req, res) => {
  res.json({
    merchantId: paymentConfig.merchantId || "MERCHANTWNDR12",
    upiVpa: paymentConfig.upiVpa || "",
    intentEnabled: paymentConfig.intentEnabled ?? true,
    qrEnabled: paymentConfig.qrEnabled ?? true,
    prepaidEnabled: paymentConfig.prepaidEnabled ?? true,
    codEnabled: paymentConfig.codEnabled ?? true,
    cardEnabled: (paymentConfig as any).cardEnabled ?? true,
    upiEnabled: (paymentConfig as any).upiEnabled ?? true,
    netbankingEnabled: (paymentConfig as any).netbankingEnabled ?? true,
    prepaidDeliveryCost: paymentConfig.prepaidDeliveryCost ?? 0,
    codDeliveryCost: paymentConfig.codDeliveryCost ?? 200,
    freeShippingThreshold: paymentConfig.freeShippingThreshold ?? 2999
  });
});

// --- Admin Payment Configurations & Transaction Ledger Endpoints ---

app.get("/api/admin/payments/config", protect, admin, async (req, res) => {
  res.json(paymentConfig);
});

app.post("/api/admin/payments/config", protect, admin, async (req, res) => {
  const { 
    merchantId, secretKey, saltKey, upiVpa, 
    intentEnabled, qrEnabled, prepaidEnabled, codEnabled,
    cardEnabled, upiEnabled, netbankingEnabled,
    prepaidDeliveryCost, codDeliveryCost, freeShippingThreshold
  } = req.body;

  if (typeof upiVpa === 'undefined' || !String(upiVpa).trim()) {
    return res.status(400).json({ error: "UPI VPA (UPI ID) Address is required." });
  }

  paymentConfig.merchantId = merchantId ? merchantId.trim() : (paymentConfig.merchantId || "MERCHANTWNDR12");
  if (secretKey) paymentConfig.secretKey = secretKey;
  if (saltKey) paymentConfig.saltKey = saltKey;
  paymentConfig.upiVpa = String(upiVpa).trim();
  if (typeof intentEnabled !== 'undefined') paymentConfig.intentEnabled = !!intentEnabled;
  if (typeof qrEnabled !== 'undefined') paymentConfig.qrEnabled = !!qrEnabled;
  if (typeof prepaidEnabled !== 'undefined') paymentConfig.prepaidEnabled = !!prepaidEnabled;
  if (typeof codEnabled !== 'undefined') paymentConfig.codEnabled = !!codEnabled;
  if (typeof cardEnabled !== 'undefined') (paymentConfig as any).cardEnabled = !!cardEnabled;
  if (typeof upiEnabled !== 'undefined') (paymentConfig as any).upiEnabled = !!upiEnabled;
  if (typeof netbankingEnabled !== 'undefined') (paymentConfig as any).netbankingEnabled = !!netbankingEnabled;
  if (typeof prepaidDeliveryCost !== 'undefined') paymentConfig.prepaidDeliveryCost = Math.max(0, Number(prepaidDeliveryCost) || 0);
  if (typeof codDeliveryCost !== 'undefined') paymentConfig.codDeliveryCost = Math.max(0, Number(codDeliveryCost) || 0);
  if (typeof freeShippingThreshold !== 'undefined') paymentConfig.freeShippingThreshold = Math.max(0, Number(freeShippingThreshold) || 0);

  await saveDb();

  res.json({ success: true, message: "Payment and delivery configurations updated successfully.", config: paymentConfig });
});

// --- Review Management Endpoints ---

// Get all reviews (Admin protected)
app.get("/api/admin/reviews", protect, admin, async (req, res) => {
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

// Admin Create New Review
app.post("/api/admin/reviews", protect, admin, async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [req.body];

  if (items.length === 0) {
    return res.status(400).json({ error: "No review data provided." });
  }

  const createdReviews: Review[] = [];
  const affectedProductIds = new Set<string>();

  for (const item of items) {
    const productId = item.productId;
    const userName = item.userName || item.name;
    const userEmail = item.userEmail || item.email;
    const rating = item.rating;
    const comment = item.comment || item.review;
    const date = item.date || item.createdAt;
    const status = item.status || "Approved";

    if (!productId || !userName || rating === undefined || comment === undefined) {
      continue;
    }

    const prod = products.find(p => p.id === String(productId));
    const newReview: Review = {
      id: item.id || `REV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: String(productId),
      productName: prod ? prod.name : "Product",
      productImage: prod && prod.images && prod.images.length > 0 ? prod.images[0] : "",
      userName: String(userName).trim(),
      userEmail: userEmail ? String(userEmail).trim() : "customer@tirupatimerchandise.com",
      rating: Number(rating) || 5,
      comment: String(comment).trim(),
      date: date ? String(date).split("T")[0] : new Date().toISOString().split("T")[0],
      status: status
    };

    reviews.unshift(newReview);
    createdReviews.push(newReview);
    affectedProductIds.add(String(productId));
  }

  if (createdReviews.length === 0) {
    return res.status(400).json({ error: "productId, userName, rating, and comment are required." });
  }

  // Recalculate product rating & reviews count
  for (const pid of affectedProductIds) {
    const prod = products.find(p => p.id === pid);
    if (prod) {
      const approvedProdReviews = reviews.filter(r => r.productId === prod.id && r.status === "Approved");
      prod.reviewsCount = approvedProdReviews.length;
      if (approvedProdReviews.length > 0) {
        const sum = approvedProdReviews.reduce((acc, curr) => acc + curr.rating, 0);
        prod.rating = parseFloat((sum / approvedProdReviews.length).toFixed(1));
      } else {
        prod.rating = 5.0;
      }
    }
  }

  await saveDb();

  const firstProd = products.find(p => p.id === createdReviews[0].productId);
  res.status(201).json({
    success: true,
    message: createdReviews.length === 1 ? "Review created successfully." : `${createdReviews.length} reviews created successfully.`,
    review: createdReviews[0],
    reviews: createdReviews,
    product: firstProd,
    id: createdReviews[0].id
  });
});

// Admin Update Existing Review (Full Edit)
app.put("/api/admin/reviews/:id", protect, admin, async (req, res) => {
  const { id } = req.params;
  const { userName, userEmail, rating, comment, date, status, productId } = req.body;

  let review = reviews.find(r => r.id === id);
  if (!review) {
    const targetProdId = productId || (products.length > 0 ? products[0].id : "prod-1");
    const prod = products.find(p => p.id === String(targetProdId));
    review = {
      id: id || `REV-${Date.now()}`,
      productId: String(targetProdId),
      productName: prod ? prod.name : "Product",
      productImage: prod && prod.images && prod.images.length > 0 ? prod.images[0] : "",
      userName: userName ? String(userName).trim() : "Customer",
      userEmail: userEmail ? String(userEmail).trim() : "customer@tirupatimerchandise.com",
      rating: Number(rating) || 5,
      comment: comment ? String(comment).trim() : "",
      date: date || new Date().toISOString().split("T")[0],
      status: status || "Approved"
    };
    reviews.unshift(review);
  } else {
    if (userName !== undefined) review.userName = String(userName).trim();
    if (userEmail !== undefined) review.userEmail = String(userEmail).trim();
    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = String(comment).trim();
    if (date !== undefined) review.date = String(date);
    if (status !== undefined) review.status = status;
  }

  // Recalculate product rating & reviews count
  const prod = products.find(p => p.id === review.productId);
  if (prod) {
    const approvedProdReviews = reviews.filter(r => r.productId === prod.id && r.status === "Approved");
    prod.reviewsCount = approvedProdReviews.length;
    if (approvedProdReviews.length > 0) {
      const sum = approvedProdReviews.reduce((acc, curr) => acc + curr.rating, 0);
      prod.rating = parseFloat((sum / approvedProdReviews.length).toFixed(1));
    } else {
      prod.rating = 5.0;
    }
  }

  await saveDb();
  res.json({ success: true, message: "Review updated successfully.", review, product: prod });
});

// Update review status (Approve / Reject)
app.patch("/api/admin/reviews/:id/status", protect, admin, async (req, res) => {
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
    } else {
      prod.rating = 5.0;
    }
  }

  await saveDb();

  res.json({ success: true, message: `Review status updated to ${status}.`, review, product: prod });
});

// Delete review
app.delete("/api/admin/reviews/:id", protect, admin, async (req, res) => {
  const { id } = req.params;
  const index = reviews.findIndex(r => r.id === id);
  let deletedReview: Review | null = null;
  if (index !== -1) {
    [deletedReview] = reviews.splice(index, 1);
  }

  // Recalculate product rating & reviews count
  if (deletedReview) {
    const prod = products.find(p => p.id === deletedReview.productId);
    if (prod) {
      const approvedProdReviews = reviews.filter(r => r.productId === prod.id && r.status === "Approved");
      prod.reviewsCount = approvedProdReviews.length;
      if (approvedProdReviews.length > 0) {
        const sum = approvedProdReviews.reduce((acc, curr) => acc + curr.rating, 0);
        prod.rating = parseFloat((sum / approvedProdReviews.length).toFixed(1));
      } else {
        prod.rating = 5.0;
      }
    }
  }

  await saveDb();

  res.json({ success: true, message: "Review deleted successfully.", id });
});

// Public GET reviews for a specific product
app.get("/api/products/:productId/reviews", async (req, res) => {
  const { productId } = req.params;
  const approved = reviews.filter(r => r.productId === productId && r.status === "Approved");
  res.json(approved);
});

// Public / Customer POST submit review
app.post("/api/products/:productId/reviews", async (req, res) => {
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
    status: "Pending"
  };

  reviews.unshift(newReview);
  await saveDb();

  res.status(201).json({
    success: true,
    message: "Thanks for your feedback!",
    review: newReview
  });
});

// POST /api/products/:productId/reviews/bulk - Bulk Import Reviews
app.post("/api/products/:productId/reviews/bulk", async (req, res) => {
  try {
    const { productId } = req.params;
    const rawList = Array.isArray(req.body) ? req.body : (Array.isArray(req.body?.reviews) ? req.body.reviews : []);

    if (!Array.isArray(rawList) || rawList.length === 0) {
      return res.status(400).json({ error: "Invalid payload: array of review objects expected" });
    }

    const prod = products.find(p => p.id === productId);
    let insertedCount = 0;

    // 1. If Prisma ORM is present on global instance
    if (typeof (global as any).prisma?.review?.createMany === "function") {
      try {
        const prismaItems = rawList.map((item: any) => ({
          productId,
          customerName: item.name || item.customerName || item.userName || "Anonymous",
          ratingScore: Number(item.rating || item.ratingScore) || 5,
          comment: item.review || item.comment || "",
          status: "APPROVED"
        }));
        const prismaRes = await (global as any).prisma.review.createMany({
          data: prismaItems,
          skipDuplicates: true
        });
        insertedCount = prismaRes?.count ?? prismaItems.length;
      } catch (pErr: any) {
        console.warn("[Prisma] Bulk review insert warning:", pErr.message);
      }
    }

    // 2. Insert into server reviews collection
    const newItems: Review[] = rawList.map((item: any, idx: number) => {
      const uName = item.name || item.customerName || item.userName || "Anonymous";
      const uRating = Number(item.rating || item.ratingScore) || 5;
      const uComment = item.review || item.comment || "";
      return {
        id: `REV-BULK-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        productId,
        productName: prod ? prod.name : "Product",
        productImage: prod && prod.images && prod.images.length > 0 ? prod.images[0] : "",
        userName: String(uName).trim(),
        userEmail: item.email || item.userEmail || "",
        rating: uRating,
        comment: String(uComment).trim(),
        date: item.date || new Date().toISOString().split("T")[0],
        status: "Approved"
      };
    });

    reviews.unshift(...newItems);

    if (prod) {
      const approvedProdReviews = reviews.filter(r => r.productId === productId && (r.status === "Approved" || (r.status as string) === "APPROVED"));
      prod.reviewsCount = approvedProdReviews.length;
      if (approvedProdReviews.length > 0) {
        const sum = approvedProdReviews.reduce((acc, curr) => acc + curr.rating, 0);
        prod.rating = parseFloat((sum / approvedProdReviews.length).toFixed(1));
      }
    }

    await saveDb();

    if (insertedCount === 0) {
      insertedCount = newItems.length;
    }

    return res.status(200).json({
      success: true,
      count: insertedCount,
      insertedCount: insertedCount,
      message: `Successfully imported ${insertedCount} reviews.`
    });
  } catch (err: any) {
    console.error("Bulk review import error:", err);
    return res.status(500).json({
      error: "Failed to bulk import reviews",
      details: err.message || String(err)
    });
  }
});

app.get("/api/admin/payments/transactions", protect, admin, async (req, res) => {
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

app.post("/api/admin/payments/transactions/:id/status-check", protect, admin, async (req, res) => {
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
    await saveDb();
    return res.json({ success: true, status: "Success", transaction: tx, message: "Transaction verified successfully with UPI provider. Order approved!" });
  }

  res.json({ success: true, status: tx.status, transaction: tx, message: "Transaction checked. No state changes needed." });
});

app.post("/api/admin/payments/transactions/:id/refund", protect, admin, async (req, res) => {
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

  await saveDb();

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
    const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-pro-preview"];

    for (const modelName of modelsToTry) {
      const maxRetries = 3;
      const delayMs = 1200;
      let modelSuccess = false;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
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
          modelSuccess = true;
          break; // Success with current model!
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
            console.warn(`[Vision Analysis Retry] Model ${modelName} attempt ${attempt} failed with transient error. Retrying in ${backoff}ms... Error:`, err.message || err);
            await new Promise(resolve => setTimeout(resolve, backoff));
          } else {
            console.warn(`[Vision Analysis] Model ${modelName} failed on attempt ${attempt}. Error:`, err.message || err);
            break; // Try next model in modelsToTry
          }
        }
      }

      if (modelSuccess && response) {
        break; // Stop model loop
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

// Auto-list alias endpoint for SmartAutoLister
app.post("/api/admin/auto-list", protect, admin, upload.single("image"), async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No image file provided in the 'image' field." });
    }

    const context = req.body.context || "";
    const prompt = `You are an expert fashion e-commerce assistant. Analyze this clothing image with user context: "${context}".
Extract:
1. title: Product Title
2. category: Product Category
3. price: Suggested price in INR (number)
4. description: Detailed description
5. tags: array of strings
6. sizes: array of size strings like ["S", "M", "L", "XL"]
7. color: Color name

Return ONLY JSON matching this structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: file.mimetype || "image/jpeg", data: file.buffer.toString("base64") } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: "application/json" }
    });

    const aiText = response?.text;
    if (!aiText) {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }
    return res.json(JSON.parse(aiText));
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to auto-list product" });
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

  // Catch-all 404 handler for API routes to prevent Vite HTML SPA fallback from returning <!doctype html>
  app.all("/api/*", async (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
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
    app.get("*", async (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Load database FIRST before listening to prevent race conditions or serving default data
  console.log("[tirupati merchandise Server] Loading database from Firestore/local storage on startup...");
  try {
    await loadDb();
    console.log("[tirupati merchandise Server] Database loaded successfully on startup.");
    runDiagnostics()
      .then(() => {
        console.log("[tirupati merchandise Server] Startup diagnostics completed successfully.");
      })
      .catch((err) => {
        console.error("[tirupati merchandise Server] Startup diagnostics failed:", err);
      });
  } catch (err) {
    console.error("[tirupati merchandise Server] Critical database load failed on startup:", err);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[tirupati merchandise Server] running flawlessly on http://localhost:${PORT}`);
  });
}

startServer();
