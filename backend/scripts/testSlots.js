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
    console.log('=== Testing Slot Capacity Info ===\n');

    // Get a shop
    const shopsRes = await makeRequest('GET', '/shops');
    const shop = shopsRes.body[0];
    console.log(`Shop: ${shop.name}, Chairs: ${shop.chairs}`);

    // Get slots - try with different date formats
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    const path = `/shops/${shop._id}/slots?date=${dateStr}&duration=30`;
    console.log(`\nRequesting: ${path}`);

    const res = await makeRequest('GET', path);
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(res.body, null, 2));

    process.exit(0);
}

test().catch(console.error);