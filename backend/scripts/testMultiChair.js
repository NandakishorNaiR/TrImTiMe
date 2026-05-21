require('dotenv').config();
if (!process.env.DATABASE_URL && !process.env.MONGO_URI) {
    require("dotenv").config({ path: '.env.example' });
}

const http = require('http');

function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4000,
            path: `/api${path}`,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        body: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        body: data
                    });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function test() {
    console.log('=== Testing Multi-Chair Slot System ===\n');

    // Step 1: Get a shop with multiple chairs
    const shopsRes = await makeRequest('GET', '/shops');
    const shops = shopsRes.body;

    if (!Array.isArray(shops) || shops.length === 0) {
        console.log('❌ No shops found');
        process.exit(1);
    }

    const shopWith5Chairs = shops.find(s => s.chairs >= 4);
    if (!shopWith5Chairs) {
        console.log('❌ No shop with 4+ chairs found');
        process.exit(1);
    }

    console.log(`✓ Found shop: "${shopWith5Chairs.name}" with ${shopWith5Chairs.chairs} chairs\n`);

    // Step 2: Get slots for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    console.log(`2. Fetching slots for ${dateStr}...`);
    const slotsRes = await makeRequest('GET', `/shops/${shopWith5Chairs._id}/slots?date=${dateStr}`);

    if (!Array.isArray(slotsRes.body)) {
        console.log('❌ No slots returned');
        process.exit(1);
    }

    const slots = slotsRes.body;
    console.log(`✓ Got ${slots.length} slots\n`);

    // Check if capacity info is present
    const firstSlot = slots[0];
    console.log('3. First slot details:');
    console.log(`   Start: ${firstSlot.start}`);
    console.log(`   Capacity: ${firstSlot.capacity || 'MISSING'}`);
    console.log(`   Booked: ${firstSlot.booked || 'MISSING'}`);
    console.log(`   Available: ${firstSlot.available || 'MISSING'}`);

    if (firstSlot.capacity === undefined) {
        console.log('\n❌ ISSUE: Capacity info is missing!');
        console.log('   Backend should return: { start, end, capacity, booked, available }');
    } else {
        console.log('\n✅ FIXED: Capacity info is now being returned!');

        // Show slot status
        slots.slice(0, 5).forEach(s => {
            const status = s.available > 0 ? `${s.available}/${s.capacity} available` : 'FULL';
            console.log(`   ${s.start} - ${status}`);
        });
    }

    process.exit(0);
}

test().catch(console.error);