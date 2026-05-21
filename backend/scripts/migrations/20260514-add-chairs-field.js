/**
 * Migration: Add chairs field to Shop collection
 * Date: 2026-05-14
 * 
 * Purpose: Add capacity-based booking system
 * - Adds 'chairs' field to all shops with default value of 1
 * - This enables multi-chair salon support
 */

const mongoose = require("mongoose");
const path = require("path");

// Load environment
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const Shop = require("../../src/models/Shop.model");

async function migrate() {
    try {
        console.log("🔄 Starting migration: add-chairs-field");

        // Connect to database with fallback
        let mongoUri = process.env.DATABASE_URL || process.env.MONGO_URI;

        try {
            if (mongoUri) {
                await mongoose.connect(mongoUri);
                console.log("✅ Connected to cloud database");
            } else {
                throw new Error("No cloud URI");
            }
        } catch (cloudErr) {
            console.log("⚠️  Cloud connection failed, trying local...");
            const localUri = "mongodb://127.0.0.1:27017/barber_booking";
            await mongoose.connect(localUri);
            console.log("✅ Connected to local database");
        }

        // Update all shops that don't have chairs field
        const result = await Shop.updateMany({ chairs: { $exists: false } }, { $set: { chairs: 1 } });

        console.log(`✅ Migration completed`);
        console.log(`   - Shops updated: ${result.modifiedCount}`);
        console.log(`   - Shops already had chairs: ${result.matchedCount - result.modifiedCount}`);

        // Verify
        const shopsWithChairs = await Shop.countDocuments({ chairs: { $exists: true } });
        const totalShops = await Shop.countDocuments();
        console.log(`✅ Verification: ${shopsWithChairs}/${totalShops} shops have chairs field`);

        await mongoose.disconnect();
        console.log("✅ Database disconnected");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrate();