/**
 * Migration: backfill `acceptCOD` on Shop documents.
 * Run with: node backend/scripts/migrations/20260327-backfill-accept-cod.js --run
 * Dry-run by default; use --run to apply updates.
 */

const mongoose = require('mongoose');
const Shop = require('../../src/models/Shop.model');

const MONGO_URL = process.env.DATABASE_URL || process.env.MONGO_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/barber_booking';

async function run({ apply = false } = {}) {
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const query = { $or: [{ acceptCOD: { $exists: false } }, { acceptCOD: null }] };
    const cursor = Shop.find(query).cursor();
    let count = 0;
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        count++;
        console.log('Found shop missing acceptCOD:', doc._id, doc.name);
        if (apply) {
            await Shop.updateOne({ _id: doc._id }, { $set: { acceptCOD: true } });
            console.log('Updated shop to acceptCOD=true:', doc._id);
        }
    }

    console.log(`Scanned shops; candidates: ${count}. apply=${apply}`);
    await mongoose.disconnect();
}

if (require.main === module) {
    const apply = process.argv.includes('--run');
    run({ apply }).catch((e) => {
        console.error(e);
        process.exit(1);
    });
}