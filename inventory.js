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
    fitAndStyle: product.fitAndStyle || "REGULAR FIT",
    compositionAndCare: product.compositionAndCare || "",
    originAndTraceability: product.originAndTraceability || "",
    completeYourLook: product.completeYourLook || []
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

/**
 * Fetches all products from Firestore database.
 */
export async function fetchProductsFromDb() {
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
    return list;
  } catch (error) {
    console.error("[inventory.js] Error fetching products from Firestore:", error);
    return [];
  }
}

/**
 * Fetches a single product by ID from Firestore database.
 */
export async function fetchProductByIdFromDb(id) {
  try {
    const db = getFirestoreDB();
    const docRef = db.collection("products").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return null;
    }
    return ensureStructuredCatalogRowFields({
      ...docSnap.data(),
      id: docSnap.id
    });
  } catch (error) {
    console.error(`[inventory.js] Error fetching product ${id} from Firestore:`, error);
    return null;
  }
}

/**
 * Creates a new product in Firestore database.
 */
export async function createProductInDb(productData) {
  try {
    const db = getFirestoreDB();
    const id = productData.id || `prod-${Date.now()}`;
    const normalized = ensureStructuredCatalogRowFields({
      ...productData,
      id
    });
    const docRef = db.collection("products").doc(id);
    await docRef.set(normalized);
    return normalized;
  } catch (error) {
    console.error("[inventory.js] Error creating product in Firestore:", error);
    throw error;
  }
}

/**
 * Updates a product in Firestore database.
 */
export async function updateProductInDb(id, productData) {
  try {
    const db = getFirestoreDB();
    const normalized = ensureStructuredCatalogRowFields({
      ...productData,
      id
    });
    const docRef = db.collection("products").doc(id);
    await docRef.set(normalized, { merge: true });
    return normalized;
  } catch (error) {
    console.error(`[inventory.js] Error updating product ${id} in Firestore:`, error);
    throw error;
  }
}

/**
 * Deletes a product from Firestore database.
 */
export async function deleteProductFromDb(id) {
  try {
    const db = getFirestoreDB();
    const docRef = db.collection("products").doc(id);
    await docRef.delete();
    return true;
  } catch (error) {
    console.error(`[inventory.js] Error deleting product ${id} from Firestore:`, error);
    throw error;
  }
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

    return list;
  } catch (error) {
    console.error("[inventory.js] Error filtering inventory:", error);
    return [];
  }
}
