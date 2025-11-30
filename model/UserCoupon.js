const mongoose = require("mongoose");
const { use } = require("react");

const userCouponSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  couponID: {
    type: mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String,
    enum: ["claimed", "used", "expired"],
  },
  claimedAt: {
    type: Date,
    default: Date.now,
  },
  usedAt: {
    type: Date,
  },
  orderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
});

const UserCoupon = mongoose.model("UserCoupon", userCouponSchema);

module.exports = { UserCoupon };
