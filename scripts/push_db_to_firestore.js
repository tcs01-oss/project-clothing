import { getFirestoreDB } from "../inventory.js";
import fs from "fs";
import path from "path";

function cleanUndefinedForFirestore(obj) {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefinedForFirestore(item));
  }
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

async function runPush() {
  console.log("Reading db.json...");
  const dbPath = path.join(process.cwd(), "db.json");
  if (!fs.existsSync(dbPath)) {
    console.error("db.json file not found.");
    process.exit(1);
  }

  const rawData = fs.readFileSync(dbPath, "utf-8");
  const data = JSON.parse(rawData);

  const db = getFirestoreDB();
  if (!db) {
    console.error("Could not obtain Firestore DB connection.");
    process.exit(1);
  }

  console.log("Firestore connection initialized. Starting batch pushes...");

  // 1. Push Products
  const products = data.products || [];
  console.log(`Pushing ${products.length} products to Firestore 'products' collection...`);
  const productsCol = db.collection("products");
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p && p.id) {
      await productsCol.doc(p.id).set(cleanUndefinedForFirestore(p));
      if ((i + 1) % 10 === 0 || i === products.length - 1) {
        console.log(`Pushed product ${i + 1}/${products.length}: ${p.id} (${p.title || p.name})`);
      }
    }
  }

  // 2. Push CMS Config
  if (data.cmsConfig) {
    console.log("Pushing CMS configuration to 'cms/config'...");
    await db.collection("cms").doc("config").set(cleanUndefinedForFirestore(data.cmsConfig));
    console.log("CMS configuration pushed successfully.");
  }

  // 3. Push Homepage Sections
  if (data.homepageSections && Array.isArray(data.homepageSections)) {
    console.log(`Pushing ${data.homepageSections.length} homepage sections...`);
    const sectionsCol = db.collection("homepageSections");
    for (const sec of data.homepageSections) {
      if (sec && sec.id) {
        await sectionsCol.doc(sec.id).set(cleanUndefinedForFirestore(sec));
      }
    }
    console.log("Homepage sections pushed successfully.");
  }

  // 4. Push Payment Config
  if (data.paymentConfig) {
    console.log("Pushing payment configuration...");
    await db.collection("system").doc("paymentConfig").set(cleanUndefinedForFirestore(data.paymentConfig));
    console.log("Payment configuration pushed successfully.");
  }

  // 5. Push Orders
  if (data.orders && Array.isArray(data.orders)) {
    console.log(`Pushing ${data.orders.length} orders...`);
    const ordersCol = db.collection("orders");
    for (const order of data.orders) {
      if (order && order.id) {
        await ordersCol.doc(order.id).set(cleanUndefinedForFirestore(order));
      }
    }
    console.log("Orders pushed successfully.");
  }

  // 6. Push Users
  if (data.users && Array.isArray(data.users)) {
    console.log(`Pushing ${data.users.length} users...`);
    const usersCol = db.collection("users");
    for (const user of data.users) {
      if (user && user.id) {
        await usersCol.doc(user.id).set(cleanUndefinedForFirestore(user));
      }
    }
    console.log("Users pushed successfully.");
  }

  // 7. Push User Passwords
  if (data.userPasswords) {
    console.log("Pushing user passwords system document...");
    await db.collection("system").doc("userPasswords").set(cleanUndefinedForFirestore(data.userPasswords));
    console.log("User passwords pushed successfully.");
  }

  // 8. Push Transactions
  if (data.transactions && Array.isArray(data.transactions)) {
    console.log(`Pushing ${data.transactions.length} transactions...`);
    const txCol = db.collection("transactions");
    for (const tx of data.transactions) {
      if (tx && tx.id) {
        await txCol.doc(tx.id).set(cleanUndefinedForFirestore(tx));
      }
    }
    console.log("Transactions pushed successfully.");
  }

  // 9. Push Reviews
  if (data.reviews && Array.isArray(data.reviews)) {
    console.log(`Pushing ${data.reviews.length} reviews...`);
    const reviewsCol = db.collection("reviews");
    for (const rev of data.reviews) {
      if (rev && rev.id) {
        await reviewsCol.doc(rev.id).set(cleanUndefinedForFirestore(rev));
      }
    }
    console.log("Reviews pushed successfully.");
  }

  console.log("=== ALL PRODUCTS AND CHANGES SUCCESSFULLY PUSHED TO FIRESTORE DATABASE ===");
  process.exit(0);
}

runPush().catch(err => {
  console.error("Error pushing to Firestore database:", err);
  process.exit(1);
});
