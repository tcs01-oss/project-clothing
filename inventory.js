import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp as initClientApp, getApps as getClientApps } from "firebase/app";
import { getFirestore as getClientFirestore, collection, doc as clientDoc, getDocs, getDoc, setDoc, deleteDoc, query, limit } from "firebase/firestore";
import fs from "fs";
import path from "path";

let db = null;

/**
 * Allows external sharing/injection of working DB adapter/connection.
 */
export function setFirestoreDB(workingDb) {
  db = workingDb;
  console.log("[inventory.js] Working database set via external setter.");
}

/**
 * A ClientFirestoreAdapter class to allow the client SDK to mimic the admin SDK's fluent API perfectly in inventory.js
 */
class ClientFirestoreAdapter {
  constructor(clientDb, projectId, databaseId) {
    this.clientDb = clientDb;
    this.projectId = projectId;
    this.databaseId = databaseId;
  }

  collection(collectionName) {
    const db = this.clientDb;
    return {
      limit: (n) => {
        return {
          get: async () => {
            const q = query(collection(db, collectionName), limit(n));
            const snap = await getDocs(q);
            return {
              empty: snap.empty,
              forEach: (callback) => {
                snap.forEach((d) => {
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
      doc: (docId) => {
        const docRef = clientDoc(db, collectionName, docId);
        return {
          docRef: docRef,
          set: async (data, options = {}) => {
            await setDoc(docRef, data, options);
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
        const docsList = [];
        snap.forEach((d) => {
          docsList.push({
            id: d.id,
            data: () => d.data()
          });
        });
        return {
          empty: snap.empty,
          forEach: (callback) => {
            docsList.forEach(callback);
          }
        };
      }
    };
  }
}

/**
 * Initializes and returns the Firestore connection using the firebase-applet-config.json properties.
 * If matching service account credentials are not found, falls back gracefully to the Client SDK.
 */
export function getFirestoreDB() {
  if (db) return db;

  let projectId = "gen-lang-client-0698331065";
  let databaseId = "ai-studio-637b298e-349e-4ebf-bf72-ccb0e3af5e9c";

  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  let clientConfig = null;
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      clientConfig = config;
      if (config.projectId) projectId = config.projectId;
      if (config.firestoreDatabaseId) databaseId = config.firestoreDatabaseId;
    } catch (err) {
      console.error("[inventory.js] Failed reading config:", err);
    }
  }

  // Check if we have matching service account credentials
  const saPath = path.join(process.cwd(), "firebase-service-account.json");
  let hasServiceAccount = false;
  if (fs.existsSync(saPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf-8"));
      if (serviceAccount.project_id) {
        hasServiceAccount = true;
      }
    } catch (e) {}
  }
  if (!hasServiceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      if (serviceAccount.project_id) {
        hasServiceAccount = true;
      }
    } catch (e) {}
  }

  // Fallback to client-side SDK if Admin SDK is likely to fail due to lack of credentials
  if (!hasServiceAccount && clientConfig) {
    try {
      let clientApp;
      const clientApps = getClientApps();
      if (clientApps.length > 0) {
        clientApp = clientApps[0];
      } else {
        clientApp = initClientApp({
          apiKey: clientConfig.apiKey,
          authDomain: clientConfig.authDomain,
          projectId: clientConfig.projectId,
          storageBucket: clientConfig.storageBucket,
          messagingSenderId: clientConfig.messagingSenderId,
          appId: clientConfig.appId
        });
      }
      const rawClientDb = getClientFirestore(clientApp, databaseId || "(default)");
      db = new ClientFirestoreAdapter(rawClientDb, projectId, databaseId || "(default)");
      console.log("[inventory.js] Running via Client SDK adapter fallback.");
      return db;
    } catch (err) {
      console.error("[inventory.js] Failed fallback Client SDK initialization:", err);
    }
  }

  let app;
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    const appOptions = { projectId };
    if (hasServiceAccount) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf-8"));
        appOptions.credential = cert(serviceAccount);
      } catch (err) {
        console.error("[inventory.js] Failed parsing service account:", err);
      }
    }
    app = initializeApp(appOptions, "inventory-app");
  }

  db = getFirestore(app, databaseId);
  return db;
}

/**
 * Empty no-op DB connection function to preserve compatibility if referenced elsewhere.
 */
export async function connectDB() {
  getFirestoreDB();
  return true;
}

/**
 * Normalizes all catalog parameters to ensure they strictly feature:
 * ID, Name, Category, Colour, Price, Sizes, Gender Preference, and the new Zara attributes.
 */
export function ensureStructuredCatalogRowFields(product) {
  if (!product) return product;

  // Determine Gender Preference
  let genderPref = product.genderPreference || product["Gender Preference"] || "Unisex";
  const catLower = (product.category || "").toLowerCase();
  const idLower = (product.id || "").toLowerCase();
  const tagsString = (product.tags || []).join(" ").toLowerCase();

  if (catLower.includes("women") || idLower.includes("women") || tagsString.includes("women")) {
    genderPref = "Women";
  } else if (catLower.includes("men") || idLower.includes("men") || tagsString.includes("men")) {
    genderPref = "Men";
  }

  // Determine Colour
  const colour = (product.colors && product.colors.length > 0) ? product.colors[0] : (product.colors || product.Colour || "Default");

  // Determine Brand
  const brand = product.brand || product.Brand || "Tirupati Merchandise Heritage";

  // Determine Design/Pattern
  const nameLower = (product.name || "").toLowerCase();
  const designPattern = product.designPattern || product.DesignPattern || (
    nameLower.includes("striped") ? "Striped" :
    nameLower.includes("graphic") ? "Graphic" :
    nameLower.includes("floral") ? "Floral" :
    nameLower.includes("check") || nameLower.includes("plaid") ? "Checkered" :
    nameLower.includes("linen") || nameLower.includes("slub") || nameLower.includes("loomed") ? "Textured" : "Solid"
  );

  // Determine Fit/Style
  const fitStyle = product.fitStyle || product.FitStyle || product.fitAndStyle || "Regular Fit";

  // Determine Color Name & Hex
  const colorName = product.colorName || (typeof colour === 'string' ? colour : "Desert Beige");
  const knownHexMap = {
    "beige": "#E8D8C8",
    "desert beige": "#E8D8C8",
    "white": "#FDFDFD",
    "linen white": "#FDFDFD",
    "classic white": "#FDFDFD",
    "olive": "#556B2F",
    "olive green": "#556B2F",
    "charcoal": "#36454F",
    "charcoal gray": "#36454F",
    "sage": "#77815C",
    "sand": "#C2B280",
    "earthy sand": "#C2B280",
    "blue": "#4682B4",
    "indigo blue": "#4682B4",
    "stone grey": "#8A8D8F",
    "crimson red": "#990000",
    "midnight black": "#1A1A1A",
    "black": "#1A1A1A",
    "navy": "#1B2A4A",
    "navy blue": "#1B2A4A"
  };
  const colorHex = product.colorHex || knownHexMap[colorName.toLowerCase()] || "#C2B280";
  const rating = typeof product.rating === "number" ? product.rating : (product.ratingAvg || 4.8);

  return {
    ...product,
    id: product.id,
    ID: product.id,
    Name: product.name || product.Name || "",
    Category: product.category || product.Category || "",
    Colour: colour,
    Price: typeof product.price === "number" ? product.price : parseFloat(product.price) || 0,
    Sizes: product.sizes || product.Sizes || [],
    "Gender Preference": genderPref,
    genderPreference: genderPref,
    referenceNumber: product.referenceNumber || "",
    fitAndStyle: product.fitAndStyle || fitStyle,
    compositionAndCare: product.compositionAndCare || "",
    originAndTraceability: product.originAndTraceability || "",
    completeYourLook: product.completeYourLook || [],
    brand,
    Brand: brand,
    designPattern,
    DesignPattern: designPattern,
    fitStyle,
    FitStyle: fitStyle,
    colorName,
    colorHex,
    rating,
    ratingAvg: rating
  };
}

/**
 * Retrieves image URLs strictly using structured catalog parameters.
 */
export function getProductImageUrls(product) {
  const p = ensureStructuredCatalogRowFields(product);

  let productImages = p.images;
  if ((!productImages || productImages.length === 0) && p.variants && p.variants.length > 0) {
    productImages = [];
    for (const variant of p.variants) {
      if (variant.images && variant.images.length > 0) {
        productImages.push(...variant.images);
      }
    }
  }

  if (productImages && productImages.length > 0 && productImages[0]) {
    return productImages;
  }

  const id = p.ID || "unknown";
  const name = (p.Name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const category = (p.Category || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const color = String(p.Colour || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const price = p.Price;
  const sizes = (p.Sizes || []).join("-").toLowerCase() || "all";
  const gender = (p["Gender Preference"] || "").toLowerCase();

  const structuredImageName = `${id}_${name}_${category}_${color}_${price}_${sizes}_${gender}.jpg`;
  return [`/assets/catalog/${category}/${structuredImageName}`];
}

let cachedProducts = [];
let lastFetchTime = 0;
const CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour cache duration to reduce Firestore reads

function loadProductsFromLocalDbJson() {
  try {
    const dbJsonPath = path.join(process.cwd(), "db.json");
    if (fs.existsSync(dbJsonPath)) {
      const fileData = JSON.parse(fs.readFileSync(dbJsonPath, "utf-8"));
      const fallbackList = (fileData.products || []).map(p => ensureStructuredCatalogRowFields(p));
      fallbackList.sort((a, b) => {
        const orderA = typeof a.displayOrder === "number" ? a.displayOrder : (typeof a.sortOrder === "number" ? a.sortOrder : 999999);
        const orderB = typeof b.displayOrder === "number" ? b.displayOrder : (typeof b.sortOrder === "number" ? b.sortOrder : 999999);
        return orderA - orderB;
      });
      return fallbackList;
    }
  } catch (err) {
    console.warn("[inventory.js] Failed reading local db.json fallback:", err);
  }
  return [];
}

function saveProductsToLocalDbJson(productsList) {
  try {
    const dbJsonPath = path.join(process.cwd(), "db.json");
    let fileData = {};
    if (fs.existsSync(dbJsonPath)) {
      fileData = JSON.parse(fs.readFileSync(dbJsonPath, "utf-8"));
    }
    fileData.products = productsList;
    fs.writeFileSync(dbJsonPath, JSON.stringify(fileData, null, 2), "utf-8");
  } catch (err) {
    console.warn("[inventory.js] Failed updating local db.json:", err);
  }
}

export function invalidateProductsCache() {
  cachedProducts = [];
  lastFetchTime = 0;
}

/**
 * Fetches all products from Firestore database with in-memory cache and local db.json fallback.
 */
export async function fetchProductsFromDb() {
  const now = Date.now();
  const localList = loadProductsFromLocalDbJson();
  if (localList && localList.length > 0) {
    cachedProducts = localList;
    lastFetchTime = now;
    return cachedProducts;
  }

  try {
    const db = getFirestoreDB();
    const productsCol = db.collection("products");
    const snapshot = await productsCol.get();

    const list = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      list.push(ensureStructuredCatalogRowFields({
        ...data,
        id: doc.id
      }));
    });

    // Sort list by displayOrder / sortOrder ascending
    list.sort((a, b) => {
      const orderA = typeof a.displayOrder === "number" ? a.displayOrder : (typeof a.sortOrder === "number" ? a.sortOrder : 999999);
      const orderB = typeof b.displayOrder === "number" ? b.displayOrder : (typeof b.sortOrder === "number" ? b.sortOrder : 999999);
      return orderA - orderB;
    });

    if (list.length > 0) {
      cachedProducts = list;
      lastFetchTime = now;
      return list;
    }
  } catch (error) {
    console.warn("[inventory.js] Notice: Firestore query unavailable or quota reached. Using local catalog snapshot.");
  }

  return cachedProducts;
}

/**
 * Fetches a single product by ID from Firestore database.
 */
export async function fetchProductByIdFromDb(id) {
  try {
    const db = getFirestoreDB();
    const docRef = db.collection("products").doc(id);
    const docSnap = await docRef.get();
    if (docSnap && docSnap.exists) {
      return ensureStructuredCatalogRowFields({
        ...docSnap.data(),
        id: docSnap.id
      });
    }
  } catch (error) {
    console.warn(`[inventory.js] Firestore read for product ${id} unavailable. Checking local cache.`);
  }

  const all = cachedProducts.length > 0 ? cachedProducts : loadProductsFromLocalDbJson();
  return all.find(p => p.id === id) || null;
}

/**
 * Creates a new product in Firestore database.
 */
export async function createProductInDb(productData) {
  const id = productData.id || `prod-${Date.now()}`;
  const normalized = ensureStructuredCatalogRowFields({
    ...productData,
    id
  });

  // Always update in-memory cache and db.json
  if (cachedProducts.length === 0) {
    cachedProducts = loadProductsFromLocalDbJson();
  }
  cachedProducts = [normalized, ...cachedProducts];
  saveProductsToLocalDbJson(cachedProducts);
  lastFetchTime = Date.now();

  try {
    const db = getFirestoreDB();
    const docRef = db.collection("products").doc(id);
    await docRef.set(normalized);
  } catch (error) {
    console.warn("[inventory.js] Product created locally (Firestore offline/quota reached).");
  }
  return normalized;
}

/**
 * Updates a product in Firestore database.
 */
export async function updateProductInDb(id, productData) {
  const normalized = ensureStructuredCatalogRowFields({
    ...productData,
    id
  });

  // Always update in-memory cache and db.json
  if (cachedProducts.length === 0) {
    cachedProducts = loadProductsFromLocalDbJson();
  }
  cachedProducts = cachedProducts.map(p => p.id === id ? { ...p, ...normalized } : p);
  saveProductsToLocalDbJson(cachedProducts);
  lastFetchTime = Date.now();

  try {
    const db = getFirestoreDB();
    const docRef = db.collection("products").doc(id);
    await docRef.set(normalized, { merge: true });
  } catch (error) {
    console.warn(`[inventory.js] Product ${id} updated locally (Firestore offline/quota reached).`);
  }
  return normalized;
}

/**
 * Deletes a product from Firestore database.
 */
export async function deleteProductFromDb(id) {
  if (cachedProducts.length === 0) {
    cachedProducts = loadProductsFromLocalDbJson();
  }
  cachedProducts = cachedProducts.filter(p => p.id !== id);
  saveProductsToLocalDbJson(cachedProducts);
  lastFetchTime = Date.now();

  try {
    const db = getFirestoreDB();
    const docRef = db.collection("products").doc(id);
    await docRef.delete();
  } catch (error) {
    console.warn(`[inventory.js] Product ${id} deleted locally (Firestore offline/quota reached).`);
  }
  return true;
}

/**
 * Batch updates product display orders in Firestore database.
 */
export async function reorderProductsInDb(orders) {
  // Update in-memory cachedProducts & db.json
  if (cachedProducts.length === 0) {
    cachedProducts = loadProductsFromLocalDbJson();
  }

  cachedProducts = cachedProducts.map(p => {
    const found = orders.find(o => o.id === p.id);
    if (found) {
      const val = typeof found.displayOrder === "number" ? found.displayOrder : (typeof found.sortOrder === "number" ? found.sortOrder : 0);
      return { ...p, displayOrder: val, sortOrder: val };
    }
    return p;
  });

  cachedProducts.sort((a, b) => {
    const orderA = typeof a.displayOrder === "number" ? a.displayOrder : 999999;
    const orderB = typeof b.displayOrder === "number" ? b.displayOrder : 999999;
    return orderA - orderB;
  });

  saveProductsToLocalDbJson(cachedProducts);
  lastFetchTime = Date.now();

  try {
    const db = getFirestoreDB();
    if (!db) {
      return true;
    }

    if (typeof db.batch === "function") {
      const batch = db.batch();
      for (const item of orders) {
        if (!item.id) continue;
        const ref = db.collection("products").doc(item.id);
        const val = typeof item.displayOrder === "number" ? item.displayOrder : (typeof item.sortOrder === "number" ? item.sortOrder : 0);
        batch.set(ref, {
          displayOrder: val,
          sortOrder: val,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      await Promise.race([
        batch.commit(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore sync timeout")), 1000))
      ]);
    } else {
      const promises = orders.map(item => {
        if (!item.id) return Promise.resolve();
        const docObj = db.collection("products").doc(item.id);
        const val = typeof item.displayOrder === "number" ? item.displayOrder : (typeof item.sortOrder === "number" ? item.sortOrder : 0);
        return docObj.set({
          displayOrder: val,
          sortOrder: val,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      await Promise.race([
        Promise.all(promises),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore sync timeout")), 1000))
      ]);
    }
  } catch (error) {
    console.warn("[inventory.js] Product sequence saved locally (Firestore offline/quota limit).");
  }
  return true;
}

/**
 * Fetch products directly from Firestore filtering dynamically on category, color, size, and gender.
 */
export async function fetchFilteredInventory(filters = {}) {
  try {
    const products = await fetchProductsFromDb();
    let list = products;

    if (filters.category) {
      const cat = String(filters.category).toLowerCase().trim();
      list = list.filter(p => (p.category || "").toLowerCase() === cat);
    }

    if (filters.color) {
      const col = String(filters.color).toLowerCase().trim();
      list = list.filter(p => {
        const colors = (p.colors || [p.Colour]).filter(Boolean).map(c => c.toLowerCase());
        const hasColor = colors.some(c => c.includes(col) || col.includes(c));
        const hasVariantColor = p.variants && p.variants.some(v => v.color && v.color.toLowerCase().includes(col));
        return hasColor || hasVariantColor;
      });
    }

    if (filters.size) {
      const sz = String(filters.size).toLowerCase().trim();
      list = list.filter(p => {
        const sizes = (p.sizes || []).map(s => s.toLowerCase());
        return sizes.includes(sz);
      });
    }

    if (filters.gender) {
      const gen = String(filters.gender).toLowerCase().trim();
      if (gen === "men") {
        list = list.filter(p =>
          (p.category || "").toLowerCase().includes("men") ||
          (p.tags || []).includes("men") ||
          p.genderPreference === "Men" || p.genderPreference === "Unisex"
        );
      } else if (gen === "women") {
        list = list.filter(p =>
          (p.category || "").toLowerCase().includes("women") ||
          (p.tags || []).includes("women") ||
          p.genderPreference === "Women" || p.genderPreference === "Unisex"
        );
      }
    }

    if (filters.brand) {
      const brands = String(filters.brand).toLowerCase().split(",").map(b => b.trim()).filter(Boolean);
      list = list.filter(p => {
        const pBrand = (p.brand || p.Brand || "").toLowerCase();
        return brands.some(b => pBrand.includes(b) || b.includes(pBrand));
      });
    }

    if (filters.designPattern) {
      const designs = String(filters.designPattern).toLowerCase().split(",").map(d => d.trim()).filter(Boolean);
      list = list.filter(p => {
        const pDesign = (p.designPattern || p.DesignPattern || "").toLowerCase();
        return designs.some(d => pDesign.includes(d) || d.includes(pDesign));
      });
    }

    if (filters.fitStyle) {
      const fits = String(filters.fitStyle).toLowerCase().split(",").map(f => f.trim()).filter(Boolean);
      list = list.filter(p => {
        const pFit = (p.fitStyle || p.FitStyle || p.fitAndStyle || "").toLowerCase();
        return fits.some(f => pFit.includes(f) || f.includes(pFit));
      });
    }

    if (filters.minRating || filters.rating) {
      const minR = parseFloat((filters.minRating || filters.rating));
      if (!isNaN(minR)) {
        list = list.filter(p => (p.rating || p.ratingAvg || 0) >= minR);
      }
    }

    return list;
  } catch (error) {
    console.error("[inventory.js] Error filtering inventory:", error);
    return [];
  }
}
