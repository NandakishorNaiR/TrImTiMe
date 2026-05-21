require('dotenv').config();
if (!process.env.DATABASE_URL && !process.env.MONGO_URI) {
    require("dotenv").config({ path: '.env.example' });
}
const mongoose = require('mongoose');
const dns = require('dns');

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/barber_booking';
const MONGO_DNS_SERVERS = process.env.MONGO_DNS_SERVERS || '';
const parsedDnsServers = MONGO_DNS_SERVERS ? MONGO_DNS_SERVERS.split(',').map(s => s.trim()).filter(Boolean) : null;

const redactedUri = MONGO_URI.replace(/([^:\/]+):([^@]+)@/, 'REDACTED:REDACTED@');
console.log(`Connecting to: ${redactedUri}`);

if (parsedDnsServers && MONGO_URI.startsWith('mongodb+srv')) {
    try {
        console.log(`Using DNS servers: ${parsedDnsServers.join(', ')}`);
        dns.setServers(parsedDnsServers);
    } catch (e) {
        console.warn('Failed to set DNS:', e && e.message ? e.message : e);
    }
}

async function check() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const shops = await db.collection('shops').find({}).toArray();
        console.log(`\nTotal shops in collection: ${shops.length}`);
        shops.forEach(shop => {
            console.log(`  - ${shop.name} (active: ${shop.active}, type: ${shop.type})`);
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err && err.message ? err.message : err);
        process.exit(1);
    }
}

check();