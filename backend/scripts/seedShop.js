require('dotenv').config();
// If .env doesn't exist or DATABASE_URL/MONGO_URI not set, try loading from .env.example
if (!process.env.DATABASE_URL && !process.env.MONGO_URI) {
    require("dotenv").config({ path: '.env.example' });
}
const mongoose = require('mongoose');
const dns = require('dns');
const Shop = require('../src/models/Shop.model');

// Match the same logic as backend server.js to ensure we connect to same MongoDB
const MONGO_URI = process.env.DATABASE_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/barber_booking';

// Redact credentials for logging
const redactedUri = MONGO_URI.replace(/([^:\/]+):([^@]+)@/, 'REDACTED:REDACTED@');
console.log(`Connecting to MongoDB: ${redactedUri}`);
const MONGO_DNS_SERVERS = process.env.MONGO_DNS_SERVERS || '';
const parsedDnsServers = MONGO_DNS_SERVERS ? MONGO_DNS_SERVERS.split(',').map(s => s.trim()).filter(Boolean) : null;

// If using SRV with custom DNS servers, set them before connecting
if (parsedDnsServers && MONGO_URI.startsWith('mongodb+srv')) {
    try {
        console.log(`Using custom DNS servers for SRV resolution: ${parsedDnsServers.join(', ')}`);
        dns.setServers(parsedDnsServers);
    } catch (e) {
        console.warn('Failed to set custom DNS servers:', e && e.message ? e.message : e);
    }
}

const shops = [{
        name: 'Elite Barber Shop',
        type: 'MALE',
        phone: '9876543210',
        address: '123 Main Street, Downtown',
        services: [
            { name: 'Haircut', price: 250, duration: 30, category: 'haircut' },
            { name: 'Beard Trim', price: 150, duration: 20, category: 'beard' },
            { name: 'Face Massage', price: 200, duration: 25, category: 'massage' },
            { name: 'Head Massage', price: 180, duration: 20, category: 'massage' }
        ],
        openingTime: '09:00',
        closingTime: '21:00',
        slotBuffer: 5,
        chairs: 3,
        acceptCOD: true,
        rating: 4.7,
        active: true
    },
    {
        name: 'Beauty Haven Salon',
        type: 'FEMALE',
        phone: '9876543211',
        address: '456 Fashion Street, Mall Road',
        services: [
            { name: 'Hair Cut', price: 300, duration: 45, category: 'haircut' },
            { name: 'Hair Coloring', price: 500, duration: 60, category: 'coloring' },
            { name: 'Facial', price: 400, duration: 50, category: 'facial' },
            { name: 'Makeup', price: 600, duration: 60, category: 'makeup' }
        ],
        openingTime: '10:00',
        closingTime: '20:00',
        slotBuffer: 10,
        chairs: 4,
        acceptCOD: true,
        rating: 4.8,
        active: true
    },
    {
        name: 'Unisex Styling Studio',
        type: 'UNISEX',
        phone: '9876543212',
        address: '789 Central Avenue',
        services: [
            { name: 'Haircut', price: 200, duration: 30, category: 'haircut' },
            { name: 'Hair Wash', price: 100, duration: 15, category: 'wash' },
            { name: 'Styling', price: 150, duration: 20, category: 'styling' },
            { name: 'Treatment', price: 350, duration: 40, category: 'treatment' }
        ],
        openingTime: '09:30',
        closingTime: '21:30',
        slotBuffer: 5,
        chairs: 5,
        acceptCOD: true,
        rating: 4.6,
        active: true
    },
    {
        name: 'Premium Barbershop',
        type: 'MALE',
        phone: '9876543213',
        address: '321 Business Park',
        services: [
            { name: 'Classic Haircut', price: 300, duration: 35, category: 'haircut' },
            { name: 'Beard Shaping', price: 200, duration: 25, category: 'beard' },
            { name: 'Head & Neck Massage', price: 250, duration: 30, category: 'massage' }
        ],
        openingTime: '08:00',
        closingTime: '22:00',
        slotBuffer: 5,
        chairs: 2,
        acceptCOD: true,
        rating: 4.9,
        active: true
    },
    {
        name: 'Glamour Salon',
        type: 'FEMALE',
        phone: '9876543214',
        address: '654 Shopping Complex',
        services: [
            { name: 'Bridal Makeup', price: 800, duration: 90, category: 'makeup' },
            { name: 'Hair Rebond', price: 1200, duration: 120, category: 'treatment' },
            { name: 'Nail Art', price: 250, duration: 40, category: 'nails' },
            { name: 'Waxing', price: 300, duration: 30, category: 'waxing' }
        ],
        openingTime: '11:00',
        closingTime: '19:00',
        slotBuffer: 15,
        chairs: 3,
        acceptCOD: false,
        rating: 4.7,
        active: true
    }
];

async function run() {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    try {
        // Clear existing shops
        const existingCount = await Shop.countDocuments();
        if (existingCount > 0) {
            console.log(`Found ${existingCount} existing shops. Clearing for fresh seed...`);
            await Shop.deleteMany({});
        }

        // Insert new shops
        const result = await Shop.insertMany(shops);
        console.log(`Successfully seeded ${result.length} shops:`);
        result.forEach(shop => {
            console.log(`  - ${shop.name} (${shop.type})`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

run();