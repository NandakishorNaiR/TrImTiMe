require('dotenv').config();
if (!process.env.DATABASE_URL && !process.env.MONGO_URI) {
    require("dotenv").config({ path: '.env.example' });
}

const http = require('http');

function makeRequest(method, path, body, headers = {}) {
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
                        headers: res.headers,
                        body: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
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
    console.log('=== Testing Shop Creation API ===\n');

    // Step 1: Login as barber
    console.log('1. Login as barber...');
    const loginRes = await makeRequest('POST', '/auth/login', {
        phone: '9999999999',
        name: 'TestBarberSetup',
        role: 'BARBER'
    });
    console.log('Status:', loginRes.status);
    console.log('Response:', JSON.stringify(loginRes.body, null, 2));

    if (loginRes.status !== 200 && !loginRes.body.token) {
        console.log('\n❌ Login failed, cannot proceed');
        process.exit(1);
    }

    const token = loginRes.body.token;
    console.log('✓ Got token:', token.substring(0, 20) + '...\n');

    // Step 2: Try to create shop WITHOUT name
    console.log('2. Try creating shop WITHOUT name (should fail)...');
    const shopRes1 = await makeRequest('POST', '/barber/shop', {
        type: 'UNISEX',
        phone: '1234567890',
        address: 'Test Address',
        openingTime: '10:00',
        closingTime: '20:00',
        chairs: 1
    }, { 'Authorization': `Bearer ${token}` });
    console.log('Status:', shopRes1.status);
    console.log('Response:', JSON.stringify(shopRes1.body, null, 2), '\n');

    // Step 3: Create shop WITH name
    console.log('3. Create shop WITH name (should succeed)...');
    const shopRes2 = await makeRequest('POST', '/barber/shop', {
        name: 'Test Shop',
        type: 'UNISEX',
        phone: '1234567890',
        address: 'Test Address',
        openingTime: '10:00',
        closingTime: '20:00',
        chairs: 1
    }, { 'Authorization': `Bearer ${token}` });
    console.log('Status:', shopRes2.status);
    console.log('Response:', JSON.stringify(shopRes2.body, null, 2));

    process.exit(0);
}

test().catch(console.error);