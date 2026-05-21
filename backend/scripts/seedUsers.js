require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Shop = require('../src/models/Shop.model');

const MONGO_URI = process.env.DATABASE_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/barber-booking';

async function run() {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for user seeding');

    const shop = await Shop.findOne();

    const users = [
        { phone: '9999990001', name: 'Demo Customer', role: 'CUSTOMER' },
        { phone: '9999990002', name: 'Demo ShopOwner', role: 'BARBER', shopId: shop ? shop._id : null, shop: shop ? shop._id : null },
        { phone: '9999990003', name: 'Demo Admin', role: 'ADMIN' }
    ];

    for (const u of users) {
        const existing = await User.findOne({ phone: u.phone });
        if (existing) {
            console.log('User exists, skipping:', u.phone, existing._id.toString());
            continue;
        }
        const doc = new User(u);
        await doc.save();
        console.log('Created user', u.phone, doc._id.toString());
    }

    await mongoose.disconnect();
}

run().catch((err) => {
    console.error('User seeding failed', err);
    process.exit(1);
});