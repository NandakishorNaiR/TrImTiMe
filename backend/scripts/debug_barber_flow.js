const axios = require('axios');
const base = process.env.BASE || 'http://localhost:40001/api';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async() => {
    try {
        console.log('Using base', base);
        // 1) login/create barber
        const barRes = await axios.post(`${base}/auth/login`, { phone: '+919900000001', role: 'BARBER' });
        const barberToken = barRes.data.token;
        console.log('Barber token obtained');

        // 2) create shop
        const shopRes = await axios.post(`${base}/barber/shop`, { name: 'Test Shop', type: 'Mens', openingTime: '09:00', closingTime: '20:00', acceptCOD: true, slotBuffer: 5 }, { headers: { Authorization: `Bearer ${barberToken}` } });
        const shop = shopRes.data.shop;
        const barberToken2 = shopRes.data.token || barberToken;
        console.log('Created shop', shop._id);

        // wait a bit
        await sleep(400);

        // 3) login/create customer
        const custRes = await axios.post(`${base}/auth/login`, { phone: '+919900000002', role: 'CUSTOMER' });
        const custToken = custRes.data.token;
        console.log('Customer token obtained');

        // 4) create booking for tomorrow 10:00
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().slice(0, 10);
        const slotStart = `${dateStr}T10:00:00`;
        const slotEnd = `${dateStr}T10:15:00`;

        const bookingRes = await axios.post(`${base}/bookings`, {
            shopId: shop._id,
            services: [{ name: 'Mens groom', price: 50, duration: 15 }],
            slotStart,
            slotEnd,
            paymentMode: 'COD'
        }, { headers: { Authorization: `Bearer ${custToken}` } });

        console.log('Booking created:', bookingRes.data.bookingId);

        await sleep(400);

        // 5) fetch barber today bookings
        const todayRes = await axios.get(`${base}/bookings/shop/today`, { headers: { Authorization: `Bearer ${barberToken2}` } });
        console.log('Barber today bookings:', JSON.stringify(todayRes.data, null, 2));

    } catch (err) {
        if (err.response) {
            console.error('HTTP error', err.response.status, err.response.data);
        } else {
            console.error(err.message);
        }
        process.exit(1);
    }
})();