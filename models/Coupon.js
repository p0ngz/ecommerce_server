const mongoose = require("mongoose");
const { generateID } = require("../utils/generateID");
const couponSchema = new mongoose.Schema({
  couponID: {
    type: String,
    unique: true,
  },
  couponName: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    default: function () {
      return `CPN-${this.couponName}${this.discountValue}`;
    },
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage",
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
  },
  minimumPrice: {
    type: Number,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
    default: 0,
  },
  usageLimit: {
    // maximum number of times the coupon can be used
    type: Number,
    default: 1,
  },
  usageCount: {
    // to track how many times the coupon has been used
    type: Number,
  },
  maxUserLimit: {
    type: Number,
    default: 1,
  },
  validFrom: {
    type: Date,
    require: true,
  },
  validUntil: {
    type: Date,
    require: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

couponSchema.pre("save", async function (next) {
  if (!this.couponID) {
    try {
      const Coupon = this.constructor;
      const lastCoupon = await Coupon.findOne({}, { couponID: 1 })
        .sort({ couponID: -1 })
        .lean();
      if (lastCoupon && lastCoupon.couponID) {
        this.couponID = generateID("CPN", lastCoupon.couponID, 3);
      } else {
        this.couponID = "CPN-001";
      }
    } catch (err) {
      return next(err);
    }
  }
});
const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = { Coupon };
