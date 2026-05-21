const Booking = require('../models/Booking.model');

const toMinFromHM = (t) => {
    const [h, m] = String(t).split(":").map(Number);
    return h * 60 + m;
};

const minutesToHM = (m) => {
    const hh = Math.floor(m / 60).toString().padStart(2, '0');
    const mm = (m % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
};

exports.calculateTotalDuration = (services = [], slotBuffer = 5) => {
    const sum = (services || []).reduce((s, x) => s + (x.duration || 0), 0);
    return sum + (slotBuffer || 0);
};

// services: [{ duration }]
// shop: shop object with openingTime, closingTime, slotBuffer
// date: 'YYYY-MM-DD'
// interval: minutes step (default 5)
exports.calculateAvailableSlots = async({ shop, services = [], date, interval = 5 }) => {
    if (!shop) return [];

    console.log('calculateAvailableSlots called', { shopId: shop._id, date, servicesCount: (services || []).length });

    // check basic timings
    if (!shop.openingTime || !shop.closingTime) return [];

    const totalDuration = exports.calculateTotalDuration(services, shop.slotBuffer || 5);
    console.log('totalDuration, slotBuffer', { totalDuration, slotBuffer: shop.slotBuffer });

    const dayStart = toMinFromHM(shop.openingTime);
    const dayEndLimit = toMinFromHM(shop.closingTime);
    const lastStart = dayEndLimit - totalDuration;
    console.log('dayStart/dayEnd/lastStart', { dayStart, dayEndLimit, lastStart });
    if (lastStart < dayStart) return [];

    // check for approved closure for the date
    const ShopClosure = require('../models/ShopClosure');
    const closed = await ShopClosure.findOne({ shop: shop._id, date, status: 'APPROVED' }).lean();
    if (closed) return [];

    // fetch bookings for the shop on that date
    const startDate = new Date(`${date}T00:00:00`);
    const endDate = new Date(`${date}T23:59:59.999`);

    // include 'CONFIRMED', 'CHECKED_IN', 'COMPLETED' bookings (active reservations)
    const bookings = await Booking.find({
        shopId: shop._id,
        slotStart: { $gte: startDate, $lte: endDate },
        status: { $in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] }
    }).lean();
    console.log('existing bookings found', bookings && bookings.length);

    const blocks = (bookings || []).map(b => {
        const s = new Date(b.slotStart);
        const e = new Date(b.slotEnd);
        return {
            start: s.getHours() * 60 + s.getMinutes(),
            end: e.getHours() * 60 + e.getMinutes()
        };
    });

    const slots = [];

    // today check (use local date to avoid UTC offset issues)
    const nowLocal = new Date();
    const todayStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
    const isToday = date === todayStr;
    let nowMin = null;
    if (isToday) {
        const now = new Date();
        nowMin = now.getHours() * 60 + now.getMinutes();
    }
    console.log('isToday/nowMin', { isToday, nowMin });

    for (let t = dayStart; t <= lastStart; t += (interval || 5)) {
        const slotStart = t;
        const slotEnd = t + totalDuration;

        // skip past times for today
        if (isToday && nowMin !== null) {
            if (slotStart < (nowMin + (shop.slotBuffer || 5))) continue;
        }

        // Check capacity-based availability
        // Count existing confirmed/pending bookings in this time window
        const overlappingBookings = bookings.filter(b => {
            const bStart = b.slotStart.getHours() * 60 + b.slotStart.getMinutes();
            const bEnd = b.slotEnd.getHours() * 60 + b.slotEnd.getMinutes();
            return slotStart < bEnd && slotEnd > bStart;
        });

        // Check if slot is at full capacity
        const shopCapacity = shop.chairs || 1;
        const spotsAvailable = shopCapacity - overlappingBookings.length;

        // Only add slot if there are remaining spots
        if (spotsAvailable > 0) {
            slots.push({
                start: minutesToHM(slotStart),
                end: minutesToHM(slotEnd),
                capacity: shopCapacity,
                booked: overlappingBookings.length,
                available: spotsAvailable
            });
        }
    }

    return slots;
};

// Create booking safely using MongoDB transactions: atomic slot check + creation.
// Throws { code: 'SLOT_BOOKED' } on capacity conflict.
exports.createBookingSafely = async(bookingData) => {
    if (!bookingData || !bookingData.shopId || !bookingData.slotStart || !bookingData.slotEnd) {
        throw new Error('Invalid booking data');
    }

    const mongoose = require('mongoose');
    const Shop = require('../models/Shop.model');
    const start = new Date(bookingData.slotStart);
    const end = new Date(bookingData.slotEnd);

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get shop within transaction (lock it)
        const shop = await Shop.findById(bookingData.shopId).session(session);
        if (!shop) {
            throw new Error('Shop not found');
        }

        const shopCapacity = shop.chairs || 1;

        // Count overlapping active/pending bookings (include CONFIRMED and CHECKED_IN)
        // within the transaction to ensure consistency
        const overlappingCount = await Booking.countDocuments({
            shopId: bookingData.shopId,
            slotStart: { $lt: end },
            slotEnd: { $gt: start },
            status: { $in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] }
        }).session(session);

        // Check if capacity is full
        if (overlappingCount >= shopCapacity) {
            await session.abortTransaction();
            const err = new Error('Slot at full capacity');
            err.code = 'SLOT_BOOKED';
            throw err;
        }

        // Capacity available — create booking atomically within transaction
        const created = await Booking.create([bookingData], { session });

        await session.commitTransaction();
        return created[0];

    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
};