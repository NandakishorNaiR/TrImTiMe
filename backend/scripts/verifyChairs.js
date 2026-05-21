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

async function verifyChairs() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        const Shop = mongoose.model('Shop', new mongoose.Schema());
        const shop = await Shop.collection.findOne({ name: 'Agumentikk authencity Salon' });

        console.log(`\n✓ Shop found: "${shop.name}"`);
        console.log(`✓ Chairs in database: ${shop.chairs}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

verifyChairs();