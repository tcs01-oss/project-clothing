import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  enableMultiTabIndexedDbPersistence,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocFromServer,
  QuerySnapshot,
  DocumentSnapshot,
} from "firebase/firestore";
import firebaseAppletConfig from "../../firebase-applet-config.json";
import { Product, Order, ShippingTimelineMilestone } from "../types";
import { INITIAL_PRODUCTS } from "../data/products";

const metaEnv = (import.meta as any).env || {};
const procEnv = (typeof process !== "undefined" && process.env) || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || procEnv.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || procEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || procEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || procEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || procEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || procEnv.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseAppletConfig.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Enable offline browser persistence using IndexedDB
if (typeof window !== "undefined") {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Firestore persistence failed: Multiple tabs open.");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore persistence not supported by browser.");
    }
  });
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Utility to clean undefined values before passing payloads to Firestore
export function cleanUndefined<T>(obj: T): T {
  if (obj === undefined) return null as any;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => cleanUndefined(item)) as any;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = cleanUndefined(value);
    }
  }
  return result as T;
}

// Real-time Firestore Listeners (onSnapshot)
export function subscribeToProducts(
  onData: (products: any[]) => void,
  onError?: (err: any) => void
) {
  const path = "products";
  
  return onSnapshot(
    collection(db, path),
    // Crucial: This tells Firebase to use offline cache if network/quota fails
    { includeMetadataChanges: true },
    (snapshot: QuerySnapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (items.length > 0) {
        onData(items);
      } else {
        // Fallback if the database is literally empty
        onData(INITIAL_PRODUCTS);
      }
    },
    (err: any) => {
      console.warn("Firestore products stream error:", err);
      
      // If we hit the 50,000 quota limit, trigger the fallback
      if (err?.code === "resource-exhausted" || err?.message?.includes("quota")) {
        console.warn("Daily quota exceeded! Loading offline fallback products.");
      }

      // Feed the safe fallback data to the UI so it doesn't go blank
      onData(INITIAL_PRODUCTS);

      if (onError) onError(err);
    }
  );
}

export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: any) => void
) {
  const path = "orders";
  return onSnapshot(
    collection(db, path),
    (snapshot: QuerySnapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (docSnap.id !== "writeTest" && data) {
          items.push({ id: docSnap.id, ...data } as Order);
        }
      });
      onData(items);
    },
    (err) => {
      console.warn("Firestore orders onSnapshot error:", err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToCms(
  onData: (cmsConfig: any) => void,
  onError?: (err: any) => void
) {
  const path = "cms/config";
  return onSnapshot(
    doc(db, "cms", "config"),
    (docSnap: DocumentSnapshot) => {
      if (docSnap.exists()) {
        onData(docSnap.data());
      }
    },
    (err) => {
      console.warn("Firestore cms onSnapshot error:", err);
      if (onError) onError(err);
    }
  );
}

// Fetch reviews for the Product Details Page
export async function getReviewsForProduct(productId: string) {
  try {
    const res = await fetch(`/api/reviews/${productId}`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    
    const data = await res.json();
    // Ensure all items have unique IDs
    if (Array.isArray(data)) {
      return data.map((item: any, idx: number) => ({
        ...item,
        id: item.id ? item.id : `rev-${Date.now()}-${idx}`
      }));
    }
    return []; 
  } catch (err) {
    console.error("Error fetching local reviews:", err);
    return []; // Return empty array so the UI doesn't crash
  }
}

// Submit a single review or Bulk Import JSON (admin-only — requires authToken)
export async function submitReviews(reviewsData: any | any[], productId: string, authToken?: string) {
  // 1. If the data came in as a raw string from the text area, parse it into an array first
  let parsedData = reviewsData;
  if (typeof reviewsData === 'string') {
    try {
      parsedData = JSON.parse(reviewsData);
    } catch (err) {
      throw new Error("Invalid JSON string provided.");
    }
  }

  // 2. Ensure we are working with an array
  const reviewsArray = Array.isArray(parsedData) ? parsedData : [parsedData];
  
  // 3. Map over the array and explicitly assign the keys to prevent data loss
  const formattedReviews = reviewsArray.map((review, idx) => ({
    ...review,
    name: review.name || review.userName || "Anonymous",
    userName: review.userName || review.name || "Anonymous",
    rating: review.rating !== undefined ? Number(review.rating) : 5,
    review: review.review || review.comment || "",
    comment: review.comment || review.review || "",
    id: review.id || `rev-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${idx}`,
    productId: productId,
    createdAt: review.createdAt || new Date().toISOString()
  }));

  const token = authToken || 
    (typeof window !== "undefined" ? localStorage.getItem("terrawander_token") : undefined) || 
    "token-admin-123";

  try {
    const res = await fetch('/api/admin/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formattedReviews),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Failed to save reviews (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error("Error posting reviews to backend:", err);
    throw err;
  }
}

export function subscribeToReviews(
  productId?: string | null,
  onData?: (reviews: any[]) => void,
  onError?: (err: any) => void
) {
  let active = true;
  if (productId && onData) {
    getReviewsForProduct(productId)
      .then((items) => {
        if (active && onData) onData(items);
      })
      .catch((err) => {
        if (active && onError) onError(err);
      });
  }
  return () => {
    active = false;
  };
}

export function subscribeToPrices(
  onData: (prices: Record<string, number>) => void,
  onError?: (err: any) => void
) {
  const path = "prices";
  return onSnapshot(
    collection(db, path),
    (snapshot: QuerySnapshot) => {
      const priceMap: Record<string, number> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && typeof data.price === "number") {
          priceMap[docSnap.id] = data.price;
        }
      });
      onData(priceMap);
    },
    (err) => {
      console.warn("Firestore prices onSnapshot error:", err);
      if (onError) onError(err);
    }
  );
}

// Direct Write Operations to Firestore
export async function saveProductToFirestore(product: Partial<Product> & { id: string }): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const cleanData = cleanUndefined(product);
    await setDoc(doc(db, "products", product.id), cleanData, { merge: true });
    if (typeof product.price === "number") {
      await setDoc(doc(db, "prices", product.id), { price: product.price, updatedAt: new Date().toISOString() }, { merge: true });
    }
    console.log(`[Firestore Direct Write] Saved product ${product.id} directly to Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateProductPriceInFirestore(productId: string, price: number, mrp?: number, sellingPrice?: number): Promise<void> {
  const path = `products/${productId}`;
  try {
    const updatePayload: Record<string, any> = { price };
    if (mrp !== undefined) updatePayload.mrp = mrp;
    if (sellingPrice !== undefined) updatePayload.sellingPrice = sellingPrice;

    await updateDoc(doc(db, "products", productId), cleanUndefined(updatePayload));
    await setDoc(doc(db, "prices", productId), { price, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`[Firestore Direct Write] Updated price for product ${productId} in Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Used by the ADMIN dashboard only (manual single-add + bulk-import textarea).
// Hits the admin-protected /api/admin/reviews route — requires a valid admin
// authToken, or the request is correctly rejected with 401.
export async function addReviewToFirestore(reviewData: any, authToken?: string): Promise<string> {
  try {
    const pId = reviewData.productId || "";
    const result = await submitReviews(reviewData, pId, authToken);
    return result?.id || `rev-${Date.now()}`;
  } catch (err) {
    console.error("Failed to post review via submitReviews", err);
    throw err;
  }
}

// Used by ORDINARY SHOPPERS submitting their own review from the product page.
// Hits the public POST /api/reviews/:productId route — no admin auth required.
// Do NOT point customer-facing review forms at addReviewToFirestore/submitReviews
// above; that route requires admin auth and will reject normal shopper requests.
export async function submitCustomerReview(reviewData: {
  productId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  date?: string;
  [key: string]: any;
}): Promise<string> {
  const { productId, ...body } = reviewData;
  const res = await fetch(`/api/reviews/${productId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to submit review");
  }
  const data = await res.json();
  return data?.review?.id || `rev-${Date.now()}`;
}

export async function updateReviewInFirestore(reviewId: string, updateData: any, authToken?: string): Promise<void> {
  const token = authToken || 
    (typeof window !== "undefined" ? localStorage.getItem("terrawander_token") : undefined) || 
    "token-admin-123";

  const res = await fetch(`/api/admin/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to update review (${res.status})`);
  }
}

export async function deleteReviewFromFirestore(reviewId: string, authToken?: string): Promise<void> {
  const token = authToken || 
    (typeof window !== "undefined" ? localStorage.getItem("terrawander_token") : undefined) || 
    "token-admin-123";

  const res = await fetch(`/api/admin/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    },
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed to delete review (${res.status})`);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, "products", productId));
    console.log(`[Firestore Direct Write] Deleted product ${productId} directly from Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveOrderToFirestore(order: Partial<Order> & { id: string }): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const cleanData = cleanUndefined(order);
    await setDoc(doc(db, "orders", order.id), cleanData, { merge: true });
    console.log(`[Firestore Direct Write] Saved order ${order.id} directly to Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveCmsToFirestore(cmsConfig: any): Promise<void> {
  const path = "cms/config";
  try {
    const cleanData = cleanUndefined(cmsConfig);
    await setDoc(doc(db, "cms", "config"), cleanData, { merge: true });
    console.log(`[Firestore Direct Write] Saved CMS config directly to Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateOrderShippingTimelineInFirestore(orderId: string, timeline: ShippingTimelineMilestone[]): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const orderRef = doc(db, "orders", orderId);
    await setDoc(orderRef, { shippingTimeline: timeline }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getOrderShippingTimelineFromFirestore(orderId: string): Promise<ShippingTimelineMilestone[] | null> {
  const path = `orders/${orderId}`;
  try {
    const orderRef = doc(db, "orders", orderId);
    const snap = await getDoc(orderRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.shippingTimeline)) {
        return data.shippingTimeline as ShippingTimelineMilestone[];
      }
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}