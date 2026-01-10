const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController.js");
const { checkExpireCoupon } = require("../middleware/checkExpireCoupon.js");
router
  .route("/")
  .get(checkExpireCoupon, couponController.getAllCoupons)
  .post(couponController.createNewCoupon);

router
  .route("/:id")
  .get(checkExpireCoupon, couponController.getCouponByCouponId)
  .put(checkExpireCoupon, couponController.updateCouponById)
  .delete(couponController.softDeleteCouponById);

router.route("/:id/hard").delete(couponController.hardDeleteCouponById);
module.exports = router;
