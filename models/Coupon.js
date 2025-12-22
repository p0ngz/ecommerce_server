const mongoose = require("mongoose");
const { generateID } = require("../utils/generateID");
const couponSchema = new mongoose.Schema({
  couponID: {
    type: String,
    unique: true,
  },
  couponName: {
    type: String,
    required: true, // make sure to provide a name
  },
  code: {
    type: String,
    set: function () {
      return `CPN-${this.couponName}${this.discountValue}`;
    },
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage",
    required: true,
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
  maximumPrice: {
    type: Number,
    default: Infinity,
  },
  minDiscountAmount: {
    type: Number,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
    default: Infinity,
  },
  distributionLimit: {
    // maximum number of users who can receive this coupon
    type: Number,
    default: null, // null means unlimited distribution
  },
  distributionCount: {
    // how many users have received/claimed this coupon
    type: Number,
    default: 0,
  },
  usageLimit: {
    // maximum times this coupon can be used (applied at checkout)
    type: Number,
    default: 1,
  },
  usageCount: {
    // how many times the coupon has been actually used
    type: Number,
    default: 0,
  },

  validFrom: {
    // can start use coupon
    type: Date,
    required: true,
  },
  validUntil: {
    // can no longer use coupon after this date
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  deletedAt: {
    type: Date,
    default: new Date(),
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

couponSchema.virtual("isExpired").get(function () {
  // use function for use this.xxx
  if (this.validUntil) {
    return new Date() > new Date(this.validUntil);
  }
  return false;
});

couponSchema.statics.updateExpiredCoupons = async function () {
  const now = new Date();
  const expiredIds = [];

  const coupons = await this.find({}).exec();

  coupons.forEach((coupon) => {
    if (
      coupon.isActive &&
      coupon.validUntil &&
      new Date(coupon.validUntil) < now
    ) {
      expiredIds.push(coupon._id);
    }
  });

  if (expiredIds.length > 0) {
    await this.updateMany(
      {
        _id: { $in: expiredIds },
      },
      { $set: { isActive: false } }
    );
  }
  return {
    count: expiredIds.length,
    updatedIds: expiredIds,
  };
};

couponSchema.set("toJSON", { virtuals: true }); //includes virtual when return like response. if want it when query use .lean(virtual: true)
couponSchema.set("toObject", { virtuals: true });
const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = { Coupon };
