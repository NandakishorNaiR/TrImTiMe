const router = require("express").Router();
const requireAuth = require("../middlewares/auth.middleware");
const requireBarber = require("../middlewares/requireBarber");
const controller = require("../controllers/barber.shop.controller");

router.post("/shop", requireAuth, requireBarber, controller.createShop);
router.get("/shop", requireAuth, requireBarber, controller.getMyShop);
router.put("/shop", requireAuth, requireBarber, controller.updateMyShop);
router.get("/shop/stats", requireAuth, requireBarber, controller.getMyShopStats);

module.exports = router;