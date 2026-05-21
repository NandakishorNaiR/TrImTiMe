require("dotenv").config();
// If .env doesn't exist or DATABASE_URL/MONGO_URI not set, try loading from .env.example
if (!process.env.DATABASE_URL && !process.env.MONGO_URI) {
    require("dotenv").config({ path: '.env.example' });
}
const mongoose = require("mongoose");
const db = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 4000;
// prefer explicit DATABASE_URL, fall back to MONGO_URI, default to local DB named `barber_booking`
const MONGO_URI = process.env.DATABASE_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/barber_booking";

// connect to MongoDB first
db.connect()
    .then(() => {
        console.log("Connected to MongoDB");

        // Schedule no-show job
        const cron = require("node-cron");
        const { runNoShowJob } = require("./jobs/noShow.job");
        const { runDailySettlementJob } = require("./jobs/dailySettlement.job");

        // Run every 5 minutes to check for no-show bookings
        cron.schedule("*/5 * * * *", async() => {
            console.log("Running no-show cron job...");
            try { await runNoShowJob(); } catch (e) { console.error(e); }
        });

        // Run daily settlement at 10:00 PM
        cron.schedule("0 22 * * *", async() => {
            console.log("Running daily settlement job...");
            try { await runDailySettlementJob(); } catch (e) { console.error(e); }
        });

        // Listen on configured port. Fail fast if port is already in use to avoid client/backend mismatches.
        const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        server.on('error', (err) => {
            if (err && err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Set a different PORT env var or free the port and try again.`);
            } else {
                console.error('Server failed to start', err);
            }
            process.exit(1);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    });