/**
 * Concurrent Booking Stress Test
 * 
 * Tests the booking system's ability to handle multiple simultaneous booking attempts
 * for the same slot, verifying that overbooking doesn't occur.
 * 
 * Usage:
 *   node testConcurrentBookings.js
 * 
 * The test will:
 * 1. Create a test shop with 3 chairs
 * 2. Create multiple test users
 * 3. Attempt 10 concurrent bookings for the same time slot
 * 4. Verify that only 3 bookings succeed (matching chair capacity)
 * 5. Verify other bookings get SLOT_BOOKED error
 */

const mongoose = require('mongoose');
const axios = require('axios');
const db = require('../config/db');

// Models
const User = require('../models/User.model');
const Shop = require('../models/Shop.model');
const Booking = require('../models/Booking.model');

const API_URL = process.env.API_URL || 'http://localhost:4000/api';

let testUsers = [];
let testShop = null;
let authTokens = [];

/**
 * Create test users and get auth tokens
 */
async function setupTestUsers(count = 10) {
    console.log(`\n📝 Creating ${count} test users...`);

    for (let i = 0; i < count; i++) {
        const email = `stresstest_${Date.now()}_${i}@example.com`;
        const phone = `555${String(i).padStart(7, '0')}`;

        try {
            // Register user
            const registerRes = await axios.post(`${API_URL}/auth/register`, {
                email,
                phone,
                password: 'TestPass123!',
                confirmPassword: 'TestPass123!',
                role: 'CUSTOMER'
            });

            console.log(`✓ User ${i + 1} registered: ${email}`);

            // Get auth token (login)
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email,
                password: 'TestPass123!'
            });

            authTokens.push(loginRes.data.token);
            testUsers.push({ email, phone, token: loginRes.data.token });

        } catch (err) {
            console.error(`✗ Failed to create user ${i + 1}:`, err.response ? .data || err.message);
        }
    }

    console.log(`✅ Created ${testUsers.length} test users`);
    return testUsers;
}

/**
 * Create a test shop with specified chair capacity
 */
async function setupTestShop(chairs = 3) {
    console.log(`\n🏪 Creating test shop with ${chairs} chairs...`);

    // Use first test user's token for shop creation (as barber)
    const token = authTokens[0];

    try {
        const shopRes = await axios.post(`${API_URL}/barber/shop`, {
            name: `Stress Test Shop ${Date.now()}`,
            type: 'UNISEX',
            address: '123 Test Street',
            phone: '555-0000',
            openingTime: '10:00',
            closingTime: '20:00',
            slotBuffer: 5,
            chairs,
            acceptCOD: true,
            payoutDetails: {
                upiId: 'test@upi'
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        testShop = shopRes.data.shop;
        console.log(`✅ Shop created with ID: ${testShop._id}, Chairs: ${chairs}`);
        return testShop;
    } catch (err) {
        console.error('✗ Failed to create shop:', err.response ? .data || err.message);
        throw err;
    }
}

/**
 * Attempt a single booking
 */
async function attemptBooking(userIndex, shopId, slotStart) {
    const token = testUsers[userIndex].token;
    const email = testUsers[userIndex].email;

    try {
        const res = await axios.post(`${API_URL}/bookings`, {
            shopId,
            services: [{
                name: 'Haircut',
                price: 500,
                duration: 30
            }],
            slotStart,
            memberName: `Member ${userIndex}`,
            paymentMethod: 'COD',
            amountPaid: 0
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return {
            success: true,
            bookingId: res.data.bookingId,
            userIndex,
            email,
            status: res.data.message
        };
    } catch (err) {
        const code = err.response ? .status;
        const message = err.response ? .data ? .message;

        return {
            success: false,
            error: message,
            code,
            userIndex,
            email
        };
    }
}

/**
 * Run concurrent bookings test
 */
async function runConcurrentBookingsTest(concurrentCount = 10) {
    console.log(`\n⚡ Running concurrent bookings test (${concurrentCount} users)...`);

    // Calculate slot time (30 minutes from now)
    const slotStart = new Date();
    slotStart.setMinutes(slotStart.getMinutes() + 30);
    slotStart.setSeconds(0);
    slotStart.setMilliseconds(0);

    console.log(`📅 Target slot: ${slotStart.toISOString()}`);

    // Prepare all booking promises
    const bookingPromises = [];
    for (let i = 0; i < Math.min(concurrentCount, testUsers.length); i++) {
        bookingPromises.push(
            attemptBooking(i, testShop._id, slotStart)
        );
    }

    console.log(`🚀 Launching ${bookingPromises.length} concurrent booking requests...`);

    // Execute all bookings simultaneously
    const startTime = Date.now();
    const results = await Promise.all(bookingPromises);
    const executionTime = Date.now() - startTime;

    console.log(`\n✅ All requests completed in ${executionTime}ms\n`);

    return { results, executionTime };
}

/**
 * Analyze results
 */
function analyzeResults(results, expectedCapacity = 3) {
    console.log('\n📊 RESULTS ANALYSIS');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ Successful bookings: ${successful.length}`);
    successful.forEach((r, i) => {
        console.log(`   ${i + 1}. User: ${r.email} | Booking ID: ${r.bookingId.substring(0, 8)}...`);
    });

    console.log(`\n❌ Failed bookings: ${failed.length}`);
    failed.forEach((r, i) => {
        console.log(`   ${i + 1}. User: ${r.email} | Error: ${r.error} (${r.code})`);
    });

    console.log(`\n🎯 Analysis:`);
    console.log(`   Shop capacity: ${expectedCapacity} chairs`);
    console.log(`   Concurrent requests: ${results.length}`);
    console.log(`   Bookings accepted: ${successful.length}`);
    console.log(`   Bookings rejected: ${failed.length}`);

    // Check if results match expected behavior
    const isCorrect = successful.length === expectedCapacity &&
        failed.length === results.length - expectedCapacity &&
        failed.every(r => r.error.includes('Slot') || r.error.includes('capacity'));

    if (isCorrect) {
        console.log(`\n✅ TEST PASSED: Overbooking prevented correctly!`);
        console.log(`   - Only ${expectedCapacity} bookings succeeded (matching capacity)`);
        console.log(`   - Remaining requests properly rejected`);
    } else {
        console.log(`\n⚠️  TEST FAILED: Unexpected behavior detected!`);
        console.log(`   - Expected ${expectedCapacity} successful, got ${successful.length}`);
        if (successful.length > expectedCapacity) {
            console.log(`   - ⚠️  CRITICAL: OVERBOOKING DETECTED!`);
        }
    }

    return isCorrect;
}

/**
 * Main test execution
 */
async function runTests() {
    try {
        console.log('\n🧪 CONCURRENT BOOKING STRESS TEST');
        console.log('='.repeat(60));

        // Connect to DB
        console.log('\n📡 Connecting to MongoDB...');
        await db.connect();
        console.log('✅ Connected');

        // Setup
        await setupTestUsers(10);
        const shop = await setupTestShop(3); // 3 chair capacity

        // Run test
        const { results, executionTime } = await runConcurrentBookingsTest(10);

        // Analyze
        const testPassed = analyzeResults(results, shop.chairs);

        // Verify in database
        console.log(`\n🔍 Verifying bookings in database...`);
        const bookedCount = await Booking.countDocuments({
            shopId: shop._id,
            slotStart: new Date(results[0].slotStart || Date.now() + 30 * 60 * 1000),
            status: { $in: ['pending_payment', 'booked'] }
        });

        console.log(`   Bookings in DB for this slot: ${bookedCount}`);

        console.log('\n' + '='.repeat(60));
        console.log(testPassed ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED');
        console.log('='.repeat(60));

        // Cleanup
        console.log('\n🧹 Cleaning up test data...');
        if (shop) {
            await Shop.deleteOne({ _id: shop._id });
        }
        await User.deleteMany({ email: /^stresstest_/ });
        await Booking.deleteMany({ shopId: shop._id });
        console.log('✅ Cleanup complete');

        process.exit(testPassed ? 0 : 1);

    } catch (err) {
        console.error('\n❌ Test execution error:', err);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runConcurrentBookingsTest, setupTestShop, setupTestUsers };