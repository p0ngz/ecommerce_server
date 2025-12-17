const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController.js");

router
  .route("/")
  .get(couponController.getAllCoupons)
  .post(couponController.createNewCoupon);

router
  .route("/:id")
  .get(couponController.getCouponByCouponId)
  .put(couponController.updateCouponById)
  .delete(couponController.softDeleteCouponById);

router.route("/:id/hard").delete(couponController.hardDeleteCouponById);
module.exports = router;
