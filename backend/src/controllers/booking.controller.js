const Booking = require("../models/Booking.model");
const Shop = require("../models/Shop.model");
const User = require('../models/User.model');
const { calculateTotalDuration, createBookingSafely } = require("../services/slot.service");
const { verifyPayment } = require("../services/payment.service");
const { adjustPriority } = require("../services/priority.service");

exports.createBooking = async(req, res) => {
    try {
        const userId = req.user && req.user.id;
        const {
            shopId,
            services,
            slotStart,
            memberName,
            paymentMethod
        } = req.body;

        const effectiveMemberName = memberName || 'Self';

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        // Basic runtime validation
        const errors = [];
        if (!shopId) errors.push("shopId is required");
        if (!slotStart) errors.push("slotStart is required");
        if (!Array.isArray(services) || services.length === 0) errors.push("services must be a non-empty array");

        // Payment method: UPI or CASH
        const chosenPaymentMethod = paymentMethod || "UPI";
        if (!["UPI", "CASH"].includes(chosenPaymentMethod)) {
            errors.push("paymentMethod must be UPI or CASH");
        }

        if (errors.length) return res.status(422).json({ message: "Invalid input", errors });

        const shop = await Shop.findById(shopId);
        if (!shop || !shop.active) {
            return res.status(404).json({ message: "Shop not available" });
        }

        // 1️⃣ Calculate duration
        const totalDuration = calculateTotalDuration(services, shop.slotBuffer);

        const startTime = new Date(slotStart);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + totalDuration);

        // Prevent booking into the past
        const now = new Date();
        if (startTime <= now) {
            return res.status(400).json({ message: 'Cannot book a slot in the past' });
        }

        // compute amounts
        const servicesTotal = (services || []).reduce((sum, s) => sum + (s.price || 0), 0);
        const PLATFORM_FEE = 7;

        // 2️⃣ NO PAYMENT VERIFICATION NEEDED
        // Payment happens AFTER service completion
        // Barber will mark as PAID after customer pays

        // 3️⃣ CREATE BOOKING SAFELY
        const bookingData = {
            userId,
            shopId,
            memberName: effectiveMemberName,
            services: (Array.isArray(services) ? services : []).map(s => ({
                name: s.name || "Service",
                price: Number(s.price) || 0,
                duration: Number(s.duration) || 0
            })),
            slotStart: startTime,
            slotEnd: endTime,
            // new fields for settlement/accounting
            paymentMethod: chosenPaymentMethod,
            platformFee: PLATFORM_FEE,
            totalAmount: servicesTotal + PLATFORM_FEE,
            status: "CONFIRMED", // Immediately confirmed
            paymentStatus: "PENDING" // Payment pending until barber marks PAID
        };

        try {
            const booking = await createBookingSafely(bookingData);

            // Give priority reward for booking
            try { await adjustPriority(userId, +1); } catch (e) { /* non-fatal */ }

            return res.status(201).json({
                message: "Booking confirmed",
                bookingId: booking._id,
                slot: { start: booking.slotStart, end: booking.slotEnd },
                paymentMethod: chosenPaymentMethod,
                totalAmount: servicesTotal + PLATFORM_FEE
            });
        } catch (err) {
            if (err && err.code === "SLOT_BOOKED") {
                return res.status(409).json({ message: "Slot already booked" });
            }
            throw err;
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.cancelBooking = async(req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user && req.user.id;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.userId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Allow cancellation only of CONFIRMED bookings
        // Once CHECKED_IN or COMPLETED, cancellation not allowed
        if (booking.status !== "CONFIRMED") {
            return res.status(400).json({ message: "Cannot cancel this booking" });
        }

        const cancelledAt = new Date();

        // Mark booking cancelled
        booking.status = "CANCELLED";
        booking.cancellation = {
            cancelledAt,
            refundPercent: 0 // No payment taken yet, so no refund
        };

        await booking.save();

        // Notify customer about cancellation
        try {
            const Notification = require('../models/Notification');
            await Notification.create({
                user: booking.userId,
                title: 'Booking Cancelled',
                message: `Your booking on ${booking.slotStart.toISOString().slice(0,10)} has been cancelled.`,
                type: 'CANCEL'
            });
        } catch (e) { console.error('notify customer cancel failed', e); }

        // Priority downgrade for cancellation
        try { await adjustPriority(booking.userId, -2); } catch (e) { /* non-fatal */ }

        return res.json({
            message: "Booking cancelled",
            refundAmount: 0,
            refundPercent: 0
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getCustomerBookings = async(req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const bookings = await Booking.find({ userId })
            .populate("shopId", "name address")
            .sort({ slotStart: -1 })
            .lean();
        // Normalize bookings to frontend-friendly shape
        const normalized = bookings.map((b) => {
            const shop = b.shopId ? { _id: b.shopId._id, name: b.shopId.name, address: b.shopId.address } : null;

            const slotStart = b.slotStart ? new Date(b.slotStart) : null;
            const slotEnd = b.slotEnd ? new Date(b.slotEnd) : null;

            const toHM = (d) => {
                if (!d) return null;
                const hh = d.getHours().toString().padStart(2, '0');
                const mm = d.getMinutes().toString().padStart(2, '0');
                return `${hh}:${mm}`;
            };

            // Map status to frontend keys
            const statusMap = {
                CONFIRMED: 'CONFIRMED',
                CHECKED_IN: 'IN_PROGRESS',
                COMPLETED: 'COMPLETED',
                CANCELLED: 'CANCELLED',
                NO_SHOW: 'NO_SHOW',
                CANCELLED_BY_SHOP: 'CANCELLED',
                CANCELLED_BY_ADMIN: 'CANCELLED'
            };

            return {
                _id: b._id,
                shop,
                date: slotStart ? slotStart.toISOString().slice(0, 10) : null,
                slot: { start: toHM(slotStart), end: toHM(slotEnd) },
                services: (b.services || []).map(s => ({ name: s.name, price: s.price, duration: s.duration })),
                status: statusMap[b.status] || (b.status || 'CONFIRMED'),
                totalAmount: b.totalAmount || ((b.payment && b.payment.amountPaid) || 0)
            };
        });

        return res.json(normalized);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getShopTodayBookings = async(req, res) => {
    try {
        const shopId = req.user && req.user.shopId;
        console.log('BARBER getShopTodayBookings REQ.USER:', req.user && { id: req.user.id, role: req.user.role, shopId: req.user.shopId });
        if (!shopId) return res.status(401).json({ message: "Unauthorized" });

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const shopQuery = { $or: [{ shopId }, { shop: shopId }] };
        const bookings = await Booking.find({
            ...shopQuery,
            slotStart: { $gte: start, $lte: end },
            status: { $in: ["CONFIRMED", "CHECKED_IN"] }
        }).sort({ slotStart: 1 }).populate('userId', 'name').lean();

        console.log('BARBER today bookings count for shop', shopId, bookings.length, 'using shopQuery');

        return res.json(
            bookings.map(b => ({
                bookingId: b._id,
                customerName: (b.userId && b.userId.name) ? ((b.memberName && b.memberName !== 'Self') ? `${b.userId.name} • ${b.memberName}` : b.userId.name) : ((b.memberName && b.memberName !== 'Self') ? b.memberName : 'Customer'),
                services: (b.services || []).map(s => s.name).join(", "),
                slotStart: b.slotStart,
                slotEnd: b.slotEnd,
                paymentMode: b.paymentMode,
                codReceived: !!b.codReceived,
                amount: b.totalAmount || (b.payment && b.payment.amountPaid) || 0
            }))
        );

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getShopUpcomingBookings = async(req, res) => {
    try {
        const shopId = req.user && req.user.shopId;
        if (!shopId) return res.status(401).json({ message: "Unauthorized" });

        const now = new Date();

        console.log('BARBER getShopUpcomingBookings REQ.USER:', req.user && { id: req.user.id, role: req.user.role, shopId: req.user.shopId });


        const shopQuery = { $or: [{ shopId }, { shop: shopId }] };
        const bookings = await Booking.find({
                ...shopQuery,
                slotStart: { $gt: now },
                status: { $in: ["CONFIRMED", "CHECKED_IN"] }
            })
            .sort({ slotStart: 1 })
            .limit(20)
            .populate('userId', 'name')
            .lean();

        console.log('BARBER upcoming bookings count for shop', shopId, bookings.length);

        return res.json(
            bookings.map(b => ({
                bookingId: b._id,
                customerName: (b.userId && b.userId.name) ? ((b.memberName && b.memberName !== 'Self') ? `${b.userId.name} • ${b.memberName}` : b.userId.name) : ((b.memberName && b.memberName !== 'Self') ? b.memberName : 'Customer'),
                services: (b.services || []).map(s => s.name),
                slotStart: b.slotStart,
                slotEnd: b.slotEnd
            }))
        );

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.markBookingCompleted = async(req, res) => {
    try {
        const bookingId = req.params.id;
        const shopId = req.user && req.user.shopId;
        if (!shopId) return res.status(401).json({ message: "Unauthorized" });

        const booking = await Booking.findOne({ _id: bookingId, shopId, status: "CHECKED_IN" });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found or invalid (must be checked in)" });
        }

        booking.status = "COMPLETED";
        booking.completedAt = new Date();
        await booking.save();

        // Increase priority for completion
        try { await adjustPriority(booking.userId, +2); } catch (e) { /* non-fatal */ }

        // Bonus: if last 3 bookings for user are completed, award +5
        try {
            const recent = await Booking.find({ userId: booking.userId }).sort({ slotStart: -1 }).limit(3).lean();
            if (recent.length === 3 && recent.every(b => b.status === 'COMPLETED')) {
                await adjustPriority(booking.userId, +5);
            }
        } catch (e) { /* non-fatal */ }

        return res.json({ message: "Booking marked as completed" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.markCodReceived = async(req, res) => {
    try {
        const bookingId = req.params.id;
        const shopId = req.user && req.user.shopId;
        if (!shopId) return res.status(401).json({ message: 'Unauthorized' });

        const booking = await Booking.findOne({ _id: bookingId, shopId });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.paymentMode !== 'COD') return res.status(400).json({ message: 'Not a COD booking' });
        if (booking.codReceived) return res.status(400).json({ message: 'COD already marked' });

        booking.codReceived = true;
        booking.codReceivedAt = new Date();
        await booking.save();

        return res.json({ message: 'COD marked as received', bookingId: booking._id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getShopDashboard = async(req, res) => {
    try {
        const shopId = req.user && req.user.shopId;
        if (!shopId) return res.status(401).json({ message: 'Unauthorized' });

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const shopQuery = { $or: [{ shopId }, { shop: shopId }] };
        // Include 'CONFIRMED', 'CHECKED_IN', and 'COMPLETED' statuses for today to show earnings and service history
        const todayBookings = await Booking.find({...shopQuery, slotStart: { $gte: start, $lte: end }, status: { $in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] } }).populate('userId', 'name').lean();
        // Upcoming bookings should only include 'CONFIRMED' status (confirmed future appointments)
        const upcomingBookings = await Booking.find({...shopQuery, slotStart: { $gt: new Date() }, status: 'CONFIRMED' }).sort({ slotStart: 1 }).limit(20).populate('userId', 'name').lean();

        console.log('BARBER getShopDashboard REQ.USER:', req.user && { id: req.user.id, role: req.user.role, shopId: req.user.shopId });
        console.log('BARBER dashboard today/upcoming counts', (todayBookings || []).length, (upcomingBookings || []).length);

        // Count only 'CONFIRMED' and 'CHECKED_IN' for pending count
        const pendingCount = todayBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length;
        // Calculate earnings from COMPLETED bookings with PAID paymentStatus
        const upiTotal = todayBookings.reduce((s, b) => s + ((b.paymentMethod === 'UPI' && b.paymentStatus === 'PAID' && b.status === 'COMPLETED') ? ((b.totalAmount || 0) - (b.platformFee || 0)) : 0), 0);
        const cashPending = todayBookings.reduce((s, b) => s + ((b.paymentMethod === 'CASH' && b.paymentStatus === 'PENDING' && (b.status === 'CHECKED_IN' || b.status === 'COMPLETED')) ? ((b.totalAmount || 0)) : 0), 0);

        const formatSlot = (d) => {
            if (!d) return { start: null, end: null };
            const dt = new Date(d);
            const hh = dt.getHours().toString().padStart(2, '0');
            const mm = dt.getMinutes().toString().padStart(2, '0');
            return { start: `${hh}:${mm}`, end: null };
        };

        const mapBookingForBarber = (b) => ({
            _id: b._id,
            customerName: (b.userId && b.userId.name) ? ((b.memberName && b.memberName !== 'Self') ? `${b.userId.name} • ${b.memberName}` : b.userId.name) : ((b.memberName && b.memberName !== 'Self') ? b.memberName : 'Customer'),
            slot: formatSlot(b.slotStart),
            services: (b.services || []).map(s => ({ name: s.name, price: s.price, duration: s.duration })),
            paymentMethod: b.paymentMethod,
            paymentStatus: b.paymentStatus,
            status: b.status,
            checkedIn: !!b.checkedIn,
            // show barber-visible amount (exclude platform fee for UPI)
            amount: (b.paymentMethod === 'UPI') ? ((b.totalAmount || 0) - (b.platformFee || 0)) : (b.totalAmount || 0)
        });

        return res.json({
            todayCount: todayBookings.length,
            pendingCount: pendingCount,
            onlineTotal: upiTotal,
            codPending: cashPending,
            todayBookings: todayBookings.map(mapBookingForBarber),
            upcomingBookings: upcomingBookings.map(mapBookingForBarber),
            todaySettlement: {
                online: upiTotal,
                cod: cashPending
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Barber marks customer arrived / check-in
exports.checkInBooking = async(req, res) => {
    try {
        const bookingId = req.params.id;
        const shopId = req.user && req.user.shopId;
        if (!shopId) return res.status(401).json({ message: 'Unauthorized' });

        const booking = await Booking.findOne({ _id: bookingId, shopId, status: 'CONFIRMED' });
        if (!booking) return res.status(404).json({ message: 'Booking not found or not in confirmable state' });

        booking.checkedIn = true;
        booking.checkedInAt = new Date();
        booking.status = 'CHECKED_IN';
        await booking.save();

        return res.json({ message: 'Customer checked in', bookingId: booking._id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Reserve a slot (creates a PENDING booking that expires after 5 minutes)
exports.reserveBooking = async(req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { shopId, services, slotStart, memberName } = req.body;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        const errors = [];
        if (!shopId) errors.push('shopId is required');
        if (!slotStart) errors.push('slotStart is required');
        if (!Array.isArray(services) || services.length === 0) errors.push('services must be a non-empty array');
        if (errors.length) return res.status(422).json({ message: 'Invalid input', errors });

        const shop = await Shop.findById(shopId);
        if (!shop || !shop.active) return res.status(404).json({ message: 'Shop not available' });

        const totalDuration = calculateTotalDuration(services, shop.slotBuffer);
        const startTime = new Date(slotStart);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + totalDuration);

        const servicesTotal = (services || []).reduce((sum, s) => sum + (s.price || 0), 0);
        const PLATFORM_FEE = 7;

        const bookingData = {
            userId,
            shopId,
            memberName: memberName || 'Self',
            services: (Array.isArray(services) ? services : []).map(s => ({ name: s.name || 'Service', price: Number(s.price) || 0, duration: Number(s.duration) || 0 })),
            slotStart: startTime,
            slotEnd: endTime,
            paymentMode: 'PENDING',
            paymentMethod: 'PENDING',
            platformFee: PLATFORM_FEE,
            totalAmount: servicesTotal + PLATFORM_FEE,
            status: 'pending'
        };

        try {
            const booking = await createBookingSafely(bookingData);
            return res.status(201).json({ message: 'Slot reserved', bookingId: booking._id, expiresInMinutes: 5 });
        } catch (err) {
            if (err && err.code === 'SLOT_BOOKED') return res.status(409).json({ message: 'Slot already booked' });
            throw err;
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Confirm a pending_payment or pending reservation (attach payment info for ONLINE or confirm COD)
exports.confirmBooking = async(req, res) => {
    try {
        // This endpoint is DEPRECATED in the new "Book Now, Pay After" model
        // Bookings are now immediately created as CONFIRMED
        // No separate confirmation step is needed
        return res.status(400).json({
            message: 'confirmBooking is deprecated. Bookings are automatically confirmed when created.'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * BARBER: Create offline/walk-in booking
 * Used when customer books directly at salon (not via app)
 */
exports.createOfflineBooking = async(req, res) => {
    try {
        const barberUserId = req.user && req.user.id;
        if (!barberUserId) return res.status(401).json({ message: 'Unauthorized' });

        const {
            customerName,
            customerPhone,
            serviceId, // service ID from shop services
            serviceName, // service name fallback for old services without IDs
            date, // YYYY-MM-DD
            startTime, // HH:MM
            paymentMethod // ONLINE or COD
        } = req.body;

        // Validate input
        const errors = [];
        if (!customerName) errors.push("Customer name required");
        if (!customerPhone) errors.push("Customer phone required");
        if (!serviceId) errors.push("Service ID required");
        if (!date) errors.push("Date required");
        if (!startTime) errors.push("Start time required");
        if (!paymentMethod || !["ONLINE", "COD"].includes(paymentMethod)) errors.push("Valid payment method required");
        if (errors.length) return res.status(422).json({ message: "Invalid input", errors });

        // Get barber's shop
        const barber = await User.findById(barberUserId);
        if (!barber || barber.role !== "BARBER") {
            return res.status(403).json({ message: "Only barbers can create offline bookings" });
        }

        const shopId = barber.shopId || barber.shop;
        if (!shopId) {
            return res.status(404).json({ message: "Barber has no shop" });
        }

        const shop = await Shop.findById(shopId);
        if (!shop || !shop.active) {
            return res.status(404).json({ message: "Shop not available" });
        }

        // Find the service in shop (match by ID first, then by name for backward compatibility)

        let service = null;

        if (shop.services) {
            service = shop.services.find(function(s) {
                return s._id && s._id.toString() === serviceId;
            });
        }

        if (!service && serviceName && shop.services) {
            // Try matching by service name for old services without IDs or if ID lookup failed
            service = shop.services.find(function(s) {
                return s.name === serviceName;
            });
        }

        if (!service) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        // Parse date and time
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = startTime.split(':').map(Number);
        const slotStart = new Date(year, month - 1, day, hours, minutes);

        // Check if booking is in the past
        if (slotStart <= new Date()) {
            return res.status(400).json({ message: 'Cannot create booking in the past' });
        }

        // Calculate end time
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + (service.duration || 30) + (shop.slotBuffer || 5));

        // Check capacity using same logic as app bookings
        const overlappingCount = await Booking.countDocuments({
            shopId: shopId,
            slotStart: { $lt: slotEnd },
            slotEnd: { $gt: slotStart },
            $or: [
                { status: 'booked' },
                { status: 'pending' }
            ]
        });

        const shopCapacity = shop.chairs || 1;
        if (overlappingCount >= shopCapacity) {
            return res.status(409).json({ message: 'Slot at full capacity' });
        }

        // Create offline booking
        const booking = await Booking.create({
            userId: null, // no user for offline bookings
            shopId: shopId,
            source: 'OFFLINE',
            customerPhone: customerPhone,
            memberName: customerName,
            services: [{
                name: service.name,
                price: service.price,
                duration: service.duration
            }],
            slotStart: slotStart,
            slotEnd: slotEnd,
            paymentMethod: paymentMethod,
            paymentMode: paymentMethod,
            totalAmount: service.price,
            platformFee: 0, // no platform fee for offline bookings
            status: 'booked'
        });

        return res.status(201).json({
            message: 'Offline booking created',
            bookingId: booking._id,
            booking: {
                id: booking._id,
                customerName: booking.memberName,
                customerPhone: booking.customerPhone,
                service: service.name,
                time: `${startTime}`,
                date: date,
                source: 'OFFLINE'
            }
        });
    } catch (err) {
        console.error('Create offline booking error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// BARBER: Mark payment as PAID
// Called after customer pays barber (UPI or CASH)
exports.markPaymentAsPaid = async(req, res) => {
    try {
        const bookingId = req.params.id;
        const shopId = req.user && req.user.shopId;
        const { paymentMethod } = req.body;

        if (!shopId) return res.status(401).json({ message: "Unauthorized" });
        if (!paymentMethod || !["UPI", "CASH"].includes(paymentMethod)) {
            return res.status(422).json({ message: "Payment method must be UPI or CASH" });
        }

        const booking = await Booking.findOne({ _id: bookingId, shopId });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Can mark as paid if booking is COMPLETED (service is done)
        if (booking.status !== "COMPLETED") {
            return res.status(400).json({ message: "Booking must be completed before marking payment as paid" });
        }

        // Can't mark as paid twice
        if (booking.paymentStatus === "PAID") {
            return res.status(400).json({ message: "Payment already marked as paid" });
        }

        // Update payment status
        booking.paymentStatus = "PAID";
        booking.paymentMethod = paymentMethod;
        booking.paidAt = new Date();
        await booking.save();

        return res.json({
            message: "Payment marked as paid",
            bookingId: booking._id,
            paymentMethod: paymentMethod,
            totalAmount: booking.totalAmount
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};