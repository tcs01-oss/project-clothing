/**
 * Seed Firestore Script
 * 
 * Run this script to populate a new Firestore database with all default products,
 * CMS configurations, payment config, homepage sections, and initial records from db.json.
 * 
 * Usage:
 * node scripts/seed-firestore.js
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function seedFirestore() {
  console.log('🚀 Starting Firestore Database Seeding...');

  // 1. Check for Service Account or Config
  const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
  const appletConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');

  let app;
  let db;

  if (fs.existsSync(serviceAccountPath)) {
    console.log('📦 Found firebase-service-account.json. Initializing Firebase Admin SDK...');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
  } else if (fs.existsSync(appletConfigPath)) {
    console.log('📦 Found firebase-applet-config.json. Initializing using Web Config credentials...');
    const config = JSON.parse(fs.readFileSync(appletConfigPath, 'utf-8'));
    if (getApps().length === 0) {
      app = initializeApp({
        projectId: config.projectId
      });
    } else {
      app = getApps()[0];
    }
    const databaseId = config.firestoreDatabaseId || '(default)';
    db = getFirestore(app, databaseId);
  } else {
    console.error('❌ Error: Neither firebase-service-account.json nor firebase-applet-config.json was found.');
    process.exit(1);
  }

  // 2. Load local db.json
  const dbJsonPath = path.join(process.cwd(), 'db.json');
  if (!fs.existsSync(dbJsonPath)) {
    console.error('❌ Error: db.json not found in root directory.');
    process.exit(1);
  }

  const rawData = fs.readFileSync(dbJsonPath, 'utf-8');
  const seedData = JSON.parse(rawData);

  // 3. Seed Products
  if (seedData.products && Array.isArray(seedData.products)) {
    console.log(`\n👕 Seeding ${seedData.products.length} Products to 'products' collection...`);
    const batchSize = 400;
    let batch = db.batch();
    let count = 0;

    for (const product of seedData.products) {
      const docId = product.id || `prod-${Date.now()}-${count}`;
      const docRef = db.collection('products').doc(docId);
      batch.set(docRef, product, { merge: true });
      count++;

      if (count % batchSize === 0) {
        await batch.commit();
        batch = db.batch();
        console.log(`   Processed ${count} products...`);
      }
    }
    if (count % batchSize !== 0) {
      await batch.commit();
    }
    console.log(`✅ Successfully seeded ${count} products.`);
  }

  // 4. Seed Users
  if (seedData.users && Array.isArray(seedData.users)) {
    console.log(`\n👤 Seeding ${seedData.users.length} Users to 'users' collection...`);
    for (const user of seedData.users) {
      const docId = user.id || user.email;
      await db.collection('users').doc(docId).set(user, { merge: true });
    }
    console.log(`✅ Successfully seeded ${seedData.users.length} user records.`);
  }

  // 5. Seed CMS Config
  if (seedData.cmsConfig) {
    console.log(`\n🎨 Seeding CMS Configuration to 'cms/config'...`);
    await db.collection('cms').doc('config').set(seedData.cmsConfig, { merge: true });
    console.log(`✅ Successfully seeded CMS configuration.`);
  }

  // 6. Seed Payment Config
  if (seedData.paymentConfig) {
    console.log(`\n💳 Seeding Payment Gateway Config to 'system/paymentConfig'...`);
    await db.collection('system').doc('paymentConfig').set(seedData.paymentConfig, { merge: true });
    console.log(`✅ Successfully seeded Payment settings.`);
  }

  // 7. Seed Homepage Sections
  if (seedData.homepageSections && Array.isArray(seedData.homepageSections)) {
    console.log(`\n🖼️ Seeding ${seedData.homepageSections.length} Homepage Sections to 'homepageSections'...`);
    for (const section of seedData.homepageSections) {
      const docId = section.id || `sec-${Date.now()}`;
      await db.collection('homepageSections').doc(docId).set(section, { merge: true });
    }
    console.log(`✅ Successfully seeded Homepage sections.`);
  }

  console.log('\n🎉 All collections seeded successfully to your new Firestore Database account!');
}

seedFirestore().catch(err => {
  console.error('❌ Seeding failed with error:', err);
  process.exit(1);
});
