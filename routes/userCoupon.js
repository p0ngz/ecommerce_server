const express = require("express");
const router = express.Router();
const userCouponController = require("../controllers/userCouponController.js");
const { checkExpireCoupon } = require("../middleware/checkExpireCoupon.js");
router
  .route("/")
  .get(checkExpireCoupon, userCouponController.getAllUserCoupons)
  .post(userCouponController.createMapCouponWithUser);

router
  .route("/:id")
  .get(checkExpireCoupon, userCouponController.getUserCouponByUserCouponId) // userCouponId(params)
  .delete(
    checkExpireCoupon,
    userCouponController.softDeleteUserCouponByUserCouponId
  ); // userId(params) body (couponId)

router
  .route("/:id/hard")
  .delete(userCouponController.hardDeleteUserCouponByUserCouponId); // userCouponId(params)
router
  .route("/:id/:userId")
  .put(
    checkExpireCoupon,
    userCouponController.updateUserCouponByUserIdAndCouponId
  ); // id: couponID, userId: userID
router
  .route("/userId/:id")
  .get(checkExpireCoupon, userCouponController.getUserCouponByUserId);
router
  .route("/couponId/:id")
  .get(checkExpireCoupon, userCouponController.getUserCouponByCouponId);
module.exports = router;
