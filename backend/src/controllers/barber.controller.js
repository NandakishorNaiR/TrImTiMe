const Shop = require("../models/Shop.model");
const Booking = require("../models/Booking.model");
const ShopClosure = require("../models/ShopClosure");

exports.getMyShop = async(req, res) => {
    try {
        const shop = await Shop.findById(req.user.shopId).lean();
        if (!shop) return res.status(404).json({ message: "Shop not found" });
        return res.json(shop);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.updateMyShop = async(req, res) => {
    try {
        const allowed = [
            "name",
            "type",
            "phone",
            "address",
            "openingTime",
            "closingTime",
            "depositRequired",
            "depositAmount",
            "acceptCOD",
            "slotBuffer",
            "chairs",
        ];

        const updates = {};
        allowed.forEach((k) => {
            if (req.body[k] !== undefined) updates[k] = req.body[k];
        });

        const shop = await Shop.findByIdAndUpdate(req.user.shopId, updates, { new: true }).lean();
        if (!shop) return res.status(404).json({ message: "Shop not found" });
        return res.json(shop);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.addService = async(req, res) => {
    try {
        const { name, price, duration } = req.body;
        if (!name || price === undefined || duration === undefined) return res.status(400).json({ message: "Invalid service data" });
        if (price <= 0 || duration < 10) return res.status(400).json({ message: "Invalid service values" });

        const shop = await Shop.findById(req.user.shopId);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        shop.services.push({ name, price, duration });
        await shop.save();

        return res.json(shop.services);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.updateService = async(req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const { name, price, duration } = req.body;

        const shop = await Shop.findById(req.user.shopId);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        if (!shop.services || !shop.services[index]) return res.status(404).json({ message: "Service not found" });

        const oldService = shop.services[index];

        if (!name || price === undefined || duration === undefined) return res.status(400).json({ message: "Invalid service data" });
        if (price <= 0 || duration < 10) return res.status(400).json({ message: "Invalid values" });

        // Safety: prevent editing a service if there are future bookings that reference it
        const now = new Date();
        const futureBookingsCount = await Booking.countDocuments({
            shopId: req.user.shopId,
            status: { $in: ["booked"] },
            slotStart: { $gte: now },
            "services.name": oldService.name
        });

        if (futureBookingsCount > 0) {
            return res.status(400).json({ message: "Cannot edit service with upcoming bookings" });
        }

        shop.services[index] = { name, price, duration };
        await shop.save();

        return res.json(shop.services);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.deleteService = async(req, res) => {
    try {
        const index = parseInt(req.params.index, 10);

        const shop = await Shop.findById(req.user.shopId);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        if (!shop.services || !shop.services[index]) return res.status(404).json({ message: "Service not found" });

        const serviceToDelete = shop.services[index];

        // Safety: prevent deleting a service if there are future bookings that reference it
        const now = new Date();
        const futureBookingsCount = await Booking.countDocuments({
            shopId: req.user.shopId,
            status: { $in: ["booked"] },
            slotStart: { $gte: now },
            "services.name": serviceToDelete.name
        });

        if (futureBookingsCount > 0) {
            return res.status(400).json({ message: "Cannot delete service with upcoming bookings" });
        }

        shop.services.splice(index, 1);
        await shop.save();

        return res.json(shop.services);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Close shop for a specific date and cancel+refund bookings for that day
exports.closeShopForDay = async(req, res) => {
    try {
        const { date, reason } = req.body; // date: 'YYYY-MM-DD'
        if (!date) return res.status(400).json({ message: 'Date required' });

        // save closure as PENDING — admin must approve
        const closure = await ShopClosure.create({ shop: req.user.shopId, date, reason, status: 'PENDING' });

        return res.json({ message: 'Closure request submitted and is PENDING admin approval', closureId: closure._id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Impact preview for a closure date
exports.getClosureImpact = async(req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: 'Date required' });

        const start = new Date(`${date}T00:00:00.000Z`);
        const end = new Date(`${date}T23:59:59.999Z`);

        const bookings = await Booking.find({
            shopId: req.user.shopId,
            slotStart: { $gte: start, $lte: end },
            status: { $in: ['booked', 'completed'] }
        }).lean();

        let online = 0;
        let cod = 0;
        let codCount = 0;

        bookings.forEach(b => {
            const paymentMode = b.paymentMode || (b.payment && b.payment.mode) || null;
            const paidAmount = (b.payment && b.payment.amountPaid) || 0;

            if (paymentMode === 'ONLINE') {
                online += paidAmount || (b.totalAmount || 0);
            } else if (paymentMode === 'COD') {
                cod += b.totalAmount || paidAmount || 0;
                codCount += 1;
            }
        });

        const earningsLost = online + cod;

        return res.json({
            totalBookings: bookings.length,
            onlineCollected: online,
            codBookings: codCount,
            codValue: cod,
            earningsLost
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};