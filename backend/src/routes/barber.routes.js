const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth.middleware");
const barberController = require("../controllers/barber.controller");
const barberShopController = require("../controllers/barber.shop.controller");

// protect all barber routes
router.use(requireAuth(["BARBER"]));

router.get("/shop", barberController.getMyShop);
router.post("/shop", barberShopController.createShop);
router.put("/shop", barberController.updateMyShop);

router.post("/services", barberController.addService);
router.put("/services/:index", barberController.updateService);
router.delete("/services/:index", barberController.deleteService);
router.post('/close-day', barberController.closeShopForDay);
router.get('/closure-impact', barberController.getClosureImpact);

module.exports = router;