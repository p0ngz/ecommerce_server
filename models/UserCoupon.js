const mongoose = require("mongoose");

const userCouponSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  couponID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    required: true,
  },
  status: {
    type: String,
    enum: ["claimed", "used", "expired"],
    default: "claimed",
  },
  claimedAt: {
    type: Date,
    default: Date.now,
  },
  // usedAt
  used: [
    {
      usedAt: {
        type: Date,
        default: null,
      },
      orderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        require: true,
        default: null,
      },
    },
  ],
  usageCount: {
    // how many times this user has used this specific coupon
    type: Number,
    default: 0,
  },
  userUsageLimit: {
    // max times this user can use this coupon (null means use coupon's global limit)
    type: Number,
    default: null,
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: {
    type: Date,
    default: null,
  },
});
                    
// virtual field is field that is not stored in MongoDB, but is calculated on the fly
userCouponSchema.virtual("isExpired").get(function () {
  if (this.couponID && this.couponID.validUntil) {
    return new Date() > new Date(this.couponID.validUntil);
  }
  return false;
});

// method is instance method function for each document => ex. userCoupon.methodName
userCouponSchema.methods.checkAndUpdateExpiry = async function () {
  if (this.status !== "used" && this.couponID) {
    if (!this.couponID.validUntil) {
      await this.populate("couponID");
    }

    const now = new Date();
    const validUntil = new Date(this.couponID.validUntil);

    if (now > validUntil && this.status === "claimed") {
      this.status = "expired";
      await this.save();
      return true;
    }
  }
  return false;
};

// static method is for the entire model => ex. UserCoupon.methodName
userCouponSchema.statics.updateExpiredCoupons = async function () {
  // Find all claimed user coupons with their coupon details
  const userCoupons = await this.find({ status: "claimed" }).populate(
    "couponID"
  );

  const now = new Date();
  const expiredIds = [];

  userCoupons.forEach((uc) => {
    if (uc.couponID && new Date(uc.couponID.validUntil) < now) {
      expiredIds.push(uc._id);
    }
  });

  if (expiredIds.length > 0) {
    await this.updateMany(
      { _id: { $in: expiredIds } },
      { $set: { status: "expired" } }
    );
  }

  return {
    count: expiredIds.length,
    updatedIds: expiredIds,
  };
};

userCouponSchema.set("toJSON", { virtuals: true });
userCouponSchema.set("toObject", { virtuals: true });

const UserCoupon = mongoose.model("UserCoupon", userCouponSchema);

module.exports = { UserCoupon };
