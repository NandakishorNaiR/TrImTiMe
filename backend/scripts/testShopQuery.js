require('dotenv').config();
if (!process.env.DATABASE_URL && !process.env.MONGO_URI) {
    require("dotenv").config({ path: '.env.example' });
}
const mongoose = require('mongoose');
const dns = require('dns');

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/barber_booking';
const MONGO_DNS_SERVERS = process.env.MONGO_DNS_SERVERS || '';
const parsedDnsServers = MONGO_DNS_SERVERS ? MONGO_DNS_SERVERS.split(',').map(s => s.trim()).filter(Boolean) : null;

if (parsedDnsServers && MONGO_URI.startsWith('mongodb+srv')) {
    dns.setServers(parsedDnsServers);
}

const shopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ["MALE", "FEMALE", "UNISEX"], default: "UNISEX" },
    phone: String,
    address: String,
    services: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: Number, required: true },
        category: { type: String }
    }],
    openingTime: String,
    closingTime: String,
    slotBuffer: { type: Number, default: 5 },
    depositRequired: { type: Boolean, default: false },
    depositAmount: { type: Number, default: 0 },
    acceptCOD: { type: Boolean, default: true },
    chairs: { type: Number, default: 1, min: 1 },
    payoutDetails: {
        upiId: String,
        bankAccount: String
    },
    rating: { type: Number, default: 4.5 },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Shop = mongoose.model("Shop", shopSchema);

async function test() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // Test different queries
        const all = await Shop.find({ active: true });
        console.log('\nShop.find({ active: true }): ' + all.length + ' shops');

        const allLean = await Shop.find({ active: true }).lean();
        console.log('Shop.find({ active: true }).lean(): ' + allLean.length + ' shops');

        const allNoSort = await Shop.find({ active: true });
        console.log('Shop.find({ active: true }) [no sort]: ' + allNoSort.length + ' shops');

        all.forEach(s => console.log('  - ' + s.name));

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err && err.message ? err.message : err);
        process.exit(1);
    }
}

test();