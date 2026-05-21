/**
 * Migration: Normalize shop type enums to uppercase
 * Converts: "men" → "MALE", "ladies" → "FEMALE", "unisex" → "UNISEX"
 * Date: 2026-05-14
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/barber_booking';
const Shop = require('../../src/models/Shop.model');

const typeMap = {
    'men': 'MALE',
    'ladies': 'FEMALE',
    'unisex': 'UNISEX'
};

async function run({ apply = false } = {}) {
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    // Find shops with lowercase types
    const query = {
        type: { $in: ['men', 'ladies', 'unisex'] }
    };

    const shops = await Shop.find(query);
    console.log(`Found ${shops.length} shops to normalize`);

    for (const shop of shops) {
        const oldType = shop.type;
        const newType = typeMap[oldType];
        console.log(`  ${shop._id}: "${oldType}" → "${newType}" (${shop.name})`);

        if (apply) {
            await Shop.updateOne({ _id: shop._id }, { $set: { type: newType } });
            console.log(`    ✓ Updated`);
        }
    }

    console.log(`\nTotal shops normalized: ${shops.length}`);
    if (!apply) {
        console.log('DRY RUN: No changes applied. Run with apply=true to apply changes.');
    }

    await mongoose.disconnect();
}

// Parse command line arguments
const apply = process.argv.includes('--apply');
run({ apply }).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});