/**
 * One-Time Local Firebase Admin SDK User Provisioning Script
 * -------------------------------------------------------------
 * This script creates a new Firebase Authentication admin user with a securely
 * generated temporary password and initializes their corresponding Firestore
 * administrator documents and custom auth claims.
 *
 * Requirements:
 * - Run locally with Google Application Default Credentials (ADC) or set
 *   GOOGLE_APPLICATION_CREDENTIALS path to your service account JSON file:
 *   export GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json"
 *
 * Usage:
 *   node scripts/create-admin-user.js [CLIENT_DOMAIN]
 *
 * Example:
 *   node scripts/create-admin-user.js client-domain.com
 */

import crypto from "crypto";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// 1. Parse client domain from CLI argument or default to placeholder
const clientDomain = process.argv[2] || "client-domain.com";
const adminEmail = `admin@${clientDomain}`;

// 2. Generate a cryptographically secure 16-character temporary password
function generateStrongPassword(length = 16) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~";
  const randomBytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charset.length;
    password += charset[randomIndex];
  }
  return password;
}

const temporaryPassword = generateStrongPassword(16);

// 3. Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp();
  } catch (err) {
    console.error(
      "❌ Failed to initialize Firebase Admin SDK. Please ensure GOOGLE_APPLICATION_CREDENTIALS is set.",
      err.message
    );
    process.exit(1);
  }
}

const auth = getAuth();
const db = getFirestore();

async function provisionAdminUser() {
  console.log("=========================================================");
  console.log("🔐 Provisioning Firebase Administrator Account");
  console.log("=========================================================");
  console.log(`Email Target: ${adminEmail}`);
  console.log(`Email Verified: false`);
  console.log("---------------------------------------------------------");

  try {
    // 4. Create the Firebase Authentication user
    const userRecord = await auth.createUser({
      email: adminEmail,
      password: temporaryPassword,
      emailVerified: false,
      displayName: "System Administrator",
    });

    const uid = userRecord.uid;
    console.log(`✅ User successfully created in Firebase Auth. UID: ${uid}`);

    // 5. Set custom authentication claims for immediate token-level verification
    await auth.setCustomUserClaims(uid, {
      admin: true,
      role: "admin",
    });
    console.log("✅ Set custom Auth claims: { admin: true, role: 'admin' }");

    // 6. Create corresponding Firestore document in the 'admins' collection
    const adminDocRef = db.collection("admins").doc(uid);
    await adminDocRef.set({
      uid: uid,
      email: adminEmail,
      isAdmin: true,
      mustChangePassword: true,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`✅ Created Firestore record in 'admins' collection (ID: ${uid})`);

    // 7. Mirror in 'users' collection so Firestore security rules lookup succeeds
    const userDocRef = db.collection("users").doc(uid);
    await userDocRef.set(
      {
        uid: uid,
        email: adminEmail,
        name: "System Administrator",
        role: "admin",
        isAdmin: true,
        mustChangePassword: true,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`✅ Mirrored administrator status in 'users' collection (ID: ${uid})`);

    // 8. Log credentials to console ONLY — never written to disk or database
    console.log("\n=========================================================");
    console.log("🎉 SUCCESS! SECURE TEMPORARY CREDENTIALS GENERATED");
    console.log("=========================================================");
    console.log(`  UID             : ${uid}`);
    console.log(`  Email           : ${adminEmail}`);
    console.log(`  Temp Password   : ${temporaryPassword}`);
    console.log("=========================================================");
    console.log("⚠️  IMPORTANT: Please copy this password immediately.");
    console.log("    It has NOT been saved anywhere and cannot be retrieved.");
    console.log("    The user must change this password upon first login.");
    console.log("=========================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error provisioning administrator account:", error.message);
    process.exit(1);
  }
}

provisionAdminUser();
