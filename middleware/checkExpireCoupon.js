const { UserCoupon } = require("../models/UserCoupon");
const { Coupon } = require("../models/Coupon");
const checkExpireCoupon = async (req, res, next) => {
  try {
    await UserCoupon.updateExpiredCoupons();
    await Coupon.updateExpiredCoupons();
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkExpireCoupon };
