const express = require("express");
const router = express.Router();
const admin = require("../middlewares/admin.middleware");
const adminController = require("../controllers/admin.controller");
const dashboardController = require("../controllers/admin.dashboard.controller");
const Booking = require("../models/Booking.model");

// Mark COD received for a booking
router.post("/bookings/:id/cod-received", admin, async(req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.paymentMode !== "COD") return res.status(400).json({ message: "Not a COD booking" });
        if (booking.codReceived) return res.status(400).json({ message: "COD already marked" });

        booking.codReceived = true;
        booking.codReceivedAt = new Date();
        await booking.save();

        return res.json({ message: "COD marked as received", bookingId: booking._id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to mark COD received" });
    }
});

// SHOPS
router.get("/shops", admin, adminController.getAllShops);
router.patch("/shops/:id/status", admin, adminController.toggleShopStatus);
// Toggle acceptCOD for a shop
router.patch("/shops/:id/accept-cod", admin, adminController.toggleShopAcceptCOD);

// CLOSURES (admin override)
router.get('/closures', admin, adminController.getAllClosures);
router.post('/closures/:id/approve', admin, adminController.approveClosure);
router.post('/closures/:id/reject', admin, adminController.rejectClosure);

// AUDIT LOGS
router.get('/audit-logs', admin, adminController.getAuditLogs);

// PLATFORM REVENUE
router.get('/platform/revenue', admin, adminController.getPlatformRevenue);
router.get('/platform/revenue/series', admin, adminController.getPlatformRevenueSeries);

// BOOKINGS
router.get("/bookings", admin, adminController.getAllBookings);

// Dashboard stats (counts)
router.get("/dashboard", admin, dashboardController.getDashboardStats);

// SETTLEMENTS
router.get("/settlements", admin, adminController.getSettlements);
router.post("/settlements/:id/mark-paid", admin, adminController.markSettlementPaid);

// USERS
router.patch("/users/:id/priority", admin, adminController.adjustUserPriority);
router.patch("/users/:id/block", admin, adminController.blockUser);
// Toggle / set COD restriction for a user
router.patch('/users/:id/cod-restrict', admin, adminController.setUserCODRestriction);
// DELETE user
router.delete('/users/:id', admin, adminController.deleteUser);

// DELETE shop
router.delete('/shops/:id', admin, adminController.deleteShop);

// Cancel booking (admin)
// Cancel booking (admin)
router.post('/bookings/:id/cancel', admin, adminController.cancelBooking);
router.patch('/bookings/:id/cancel', admin, adminController.cancelBooking);

// Refund booking (admin)
router.patch('/bookings/:id/refund', admin, adminController.refundBooking);

// Flag booking (admin)
router.patch('/bookings/:id/flag', admin, adminController.flagBooking);

// Shops revenue stats
router.get('/shops/stats', admin, adminController.getShopStats);

module.exports = router;