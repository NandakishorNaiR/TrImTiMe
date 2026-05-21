const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

// CUSTOMER routes
router.post("/reserve", requireAuth(["CUSTOMER"]), bookingController.reserveBooking);
router.post("/", requireAuth(["CUSTOMER"]), bookingController.createBooking);
router.post("/:id/confirm", requireAuth(["CUSTOMER"]), bookingController.confirmBooking);
router.post("/:id/cancel", requireAuth(["CUSTOMER"]), bookingController.cancelBooking);
router.get("/my", requireAuth(["CUSTOMER"]), bookingController.getCustomerBookings);

// BARBER routes
router.get("/shop/today", requireAuth(["BARBER"]), bookingController.getShopTodayBookings);
router.get("/shop/upcoming", requireAuth(["BARBER"]), bookingController.getShopUpcomingBookings);
router.get("/shop/dashboard", requireAuth(["BARBER"]), bookingController.getShopDashboard);

// BARBER: Create offline/walk-in booking
router.post("/offline/create", requireAuth(["BARBER"]), bookingController.createOfflineBooking);

// BARBER ACTION
router.post("/:id/complete", requireAuth(["BARBER"]), bookingController.markBookingCompleted);
// BARBER: check-in (customer arrived)
router.post("/:id/checkin", requireAuth(["BARBER"]), bookingController.checkInBooking);
// BARBER: mark payment as paid (after customer pays)
router.post("/:id/mark-paid", requireAuth(["BARBER"]), bookingController.markPaymentAsPaid);
// BARBER: mark COD received
router.post("/:id/cod-received", requireAuth(["BARBER"]), bookingController.markCodReceived);

module.exports = router;