const { Coupon } = require("../models/Coupon");
const { UserCoupon } = require("../models/UserCoupon");
const mongoose = require("mongoose");
// !ไม่ควรให้ controller คุยกับ Mongoose ตรง ๆ ควรแยก logic ไปที่ service แทน
const getAllUserCoupons = async (req, res, next) => {
  try {
    const {
      from,
      to,
      claimFrom,
      claimTo,
      usedFrom,
      usedTo,
      page,
      limit,
      sort, // createdAt. claimAt, useAt
    } = req.query;
    let query = {};

    if (from || to) {
      query.createdAt = {};
      if (from)
        query.createdAt.$gte = from ? new Date(from) : new Date("2025-11-25");
      if (to) query.createdAt.$lte = to ? new Date(to) : new Date();
    }

    if (claimFrom || claimTo) {
      query.claimedAt = {};
      if (claimFrom)
        query.claimedAt.$gte = claimFrom
          ? new Date(claimFrom)
          : new Date("2025-11-25");
      if (claimTo)
        query.claimedAt.$lte = claimTo ? new Date(claimTo) : new Date();
    }

    if (usedFrom || usedTo) {
      query.used = {};
      if (usedFrom)
        query.used.usedAt.$gte = usedFrom
          ? new Date(usedFrom)
          : new Date("2025-11-25");
      if (usedTo)
        query.used.usedAt.$lte = usedTo ? new Date(usedTo) : new Date();
    }
    // CPN-FREESHIP15
    const pageRaw = typeof page === "string" ? page.trim() : page;
    const limitRaw = typeof limit === "string" ? limit.trim() : limit;
    const pageParsed = parseInt(pageRaw);
    const limitParsed = parseInt(limitRaw);
    const pageNum =
      Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;
    const limitNum =
      Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : 10;
    const skip = (pageNum - 1) * limitNum;
    const sortSpec =
      typeof sort === "string" && sort.trim() !== "" ? sort : "-createdAt";

    const [userCoupons, totalCoupon] = await Promise.all([
      UserCoupon.find(query)
        .skip(skip)
        .sort(sortSpec)
        .limit(limitNum)
        .lean({ virtual: true })
        .exec(),
      UserCoupon.countDocuments(query).exec(),
    ]);

    if (userCoupons.length === 0) {
      const err = new Error("No userCoupons found");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      message: "Get all user coupons successfully",
      count: userCoupons.length,
      total: totalCoupon,
      page: pageNum,
      limit: limitNum,
      userCoupons,
    });
  } catch (err) {
    next(err);
  }
};

const getUserCouponByUserCouponId = async (req, res, next) => {
  try {
    const { id } = req.params; // userCoupon id
    if (!id || id === ":id") {
      const error = new Error("userCoupon id is required");
      error.statusCode = 400;
      return next(error);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid userCoupon ID format");
      error.statusCode = 400;
      return next(error);
    }
    const foundUserCoupon = await UserCoupon.findById(id)
      .lean({ virtuals: true })
      .exec();
    console.log("foundUserCoupon: ", foundUserCoupon);
    if (!foundUserCoupon) {
      const err = new Error("UserCoupon not found");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      message: "Get user coupon successfully",
      userCoupon: foundUserCoupon,
    });
  } catch (err) {
    next(err);
  }
};

const getUserCouponByUserId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === ":id") {
      const error = new Error("user id is required");
      error.statusCode = 400;
      return next(error);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid user ID format");
      error.statusCode = 400;
      return next(error);
    }

    const userCouponByUserId = await UserCoupon.aggregate([
      { $match: { userID: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "coupons",
          localField: "couponID",
          foreignField: "_id",
          as: "couponDetails",
        },
      },
      {
        $unwind: "$couponDetails",
      },
      {
        $group: {
          _id: "$user._id",
          userDetails: {
            $first: {
              _id: "$user._id",
              username: "$user.username",
              email: "$user.email",
            },
          },
          coupons: {
            $push: {
              _id: "$_id",
              coupon: "$couponDetails",
              status: "$status",
              claimedAt: "$claimedAt",
              usageCount: "$usageCount",
              userUsageLimit: "$userUsageLimit",
              used: "$used",
              orderID: "$orderID",
              createdAt: "$createdAt",
            },
          },
        },
      },
    ]);

    if (!userCouponByUserId || userCouponByUserId.length === 0) {
      const err = new Error("No userCoupons found for this user ID");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      message: "Get user coupons by user ID successfully",
      userCouponByUserId,
    });
  } catch (err) {
    next(err);
  }
};

const getUserCouponByCouponId = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const error = new Error("coupon id is required");
      error.statusCode = 400;
      return next(error);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid userCoupon ID format");
      error.statusCode = 400;
      return next(error);
    }

    const foundUserCouponByCouponId = await UserCoupon.find({
      couponID: id,
    }).exec();

    if (!foundUserCouponByCouponId || foundUserCouponByCouponId.length === 0) {
      const err = new Error("No userCoupons found for this coupon ID");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      message: "Get user coupons by coupon ID successfully",
      count: foundUserCouponByCouponId.length,
      userCoupons: foundUserCouponByCouponId,
    });
  } catch (err) {
    next(err);
  }
};

// when user receive coupon
const createMapCouponWithUser = async (req, res, next) => {
  try {
    const { userID, couponID } = req.body;
    if (!userID || !couponID) {
      const error = new Error("userID and couponID are required");
      error.statusCode = 400;
      return next(error);
    }
    if (
      !mongoose.Types.ObjectId.isValid(userID) ||
      !mongoose.Types.ObjectId.isValid(couponID)
    ) {
      const error = new Error("Invalid userID or couponID format");
      error.statusCode = 400;
      return next(error);
    }

    // Find the coupon to get its usageLimit and update distributionCount
    const foundCoupon = await Coupon.findById(couponID).exec();
    if (!foundCoupon) {
      const err = new Error("Coupon not found");
      err.statusCode = 404;
      return next(err);
    }

    // Check if this user-coupon mapping already exists
    const existingMapping = await UserCoupon.findOne({
      userID,
      couponID,
    }).exec();

    if (existingMapping) {
      const err = new Error("User already has this coupon");
      err.statusCode = 400;
      return next(err);
    }

    const createMapCouponWithUser = new UserCoupon({
      userID,
      couponID,
      userUsageLimit: foundCoupon.usageLimitPerUser,
    });

    const savedCouponWithUser = await createMapCouponWithUser.save();

    if (!savedCouponWithUser) {
      const err = new Error("Failed to create userCoupon mapping");
      err.statusCode = 500;
      return next(err);
    }
    // update coupon
    foundCoupon.distributionCount = foundCoupon.distributionCount + 1;

    await foundCoupon.save();
    res.status(201).json({
      message: "Created user coupon successfully",
      userCoupon: savedCouponWithUser,
    });
  } catch (err) {
    next(err);
  }
};

const updateUserCouponByUserIdAndCouponId = async (req, res, next) => {
  try {
    // when do we update => use coupon(status, usedAt, orderID)
    const { id, userId } = req.params;
    const { orderID } = req.body;
    if (!id || id === ":id") {
      const error = new Error("userCoupon id is required");
      error.statusCode = 400;
      return next(error);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid userCoupon ID format");
      error.statusCode = 400;
      return next(error);
    }
    if (!userId || userId === ":userId") {
      const error = new Error("user id is required");
      error.statusCode = 400;
      return next(error);
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error("Invalid user ID format");
      error.statusCode = 400;
      return next(error);
    }
    if (!orderID) {
      const error = new Error("orderID is required to update userCoupon");
      error.statusCode = 400;
      return next(error);
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error("Invalid order ID format");
      error.statusCode = 400;
      return next(error);
    }
    const foundUserCoupon = await UserCoupon.findOne({
      $and: [{ userID: userId }, { couponID: id }],
    }).exec();
    const foundCoupon = await Coupon.findById(id).exec();

    if (!foundUserCoupon) {
      const err = new Error("UserCoupon mapping not found");
      err.statusCode = 404;
      return next(err);
    }
    if (!foundCoupon) {
      const err = new Error("Coupon not found");
      err.statusCode = 404;
      return next(err);
    }

    // Check if user has reached their usage limit for this coupon
    const effectiveLimit =
      foundUserCoupon.userUsageLimit || foundCoupon.usageLimit;
    if (foundUserCoupon.usageCount >= effectiveLimit) {
      const err = new Error("User has reached the usage limit for this coupon");
      err.statusCode = 400;
      return next(err);
    }

    // Check if coupon has reached global usage limit
    if (foundCoupon.usageCount >= foundCoupon.usageLimit) {
      const err = new Error("Coupon has reached its global usage limit");
      err.statusCode = 400;
      return next(err);
    }

    // Update in UserCoupon collection => status, usedAt, usageCount
    foundUserCoupon.usageCount += 1;
    foundUserCoupon.used = {
      usedAt: new Date(),
      orderID: orderID,
    };

    // Only mark as "used" if user has reached their limit
    if (foundUserCoupon.usageCount >= effectiveLimit) {
      foundUserCoupon.status = "used";
    }

    // Update in Coupon collection => usageCount, isActive
    foundCoupon.usageCount += 1;
    if (foundCoupon.usageCount >= foundCoupon.usageLimit) {
      foundCoupon.isActive = false;
    }

    await foundUserCoupon.save();
    await foundCoupon.save();

    return res.status(200).json({
      message: "Updated user coupon successfully",
      userCoupon: foundUserCoupon,
      coupon: foundCoupon,
    });
  } catch (err) {
    next(err);
  }
};
// CPN-WELCOME10
// CPN-HOLIDAY1515

const softDeleteUserCouponByUserCouponId = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const error = new Error("userCoupon id is required");
      error.statusCode = 400;
      return next(error);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid userCoupon ID format");
      error.statusCode = 400;
      return next(error);
    }
    const softDeletedUseCoupon = await UserCoupon.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    ).exec();

    if (!softDeletedUseCoupon) {
      const error = new Error("userCoupon not found");
      error.statusCode = 404;
      return next(error);
    }
    return res.status(200).json({
      message: "User coupon soft deleted successfully",
      userCoupon: softDeletedUseCoupon,
    });
  } catch (err) {
    next(err);
  }
};

const hardDeleteUserCouponByUserCouponId = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const error = new Error("userCoupon id is required");
      error.statusCode = 400;
      return next(error);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid userCoupon ID format");
      error.statusCode = 400;
      return next(error);
    }
    const hardDeletedUserCoupon = await UserCoupon.findByIdAndDelete(id).exec();

    if (!hardDeletedUserCoupon) {
      const error = new Error("userCoupon not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({
      message: "User coupon hard deleted successfully",
      userCoupon: hardDeletedUserCoupon,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getAllUserCoupons,
  getUserCouponByUserCouponId,
  getUserCouponByUserId,
  getUserCouponByCouponId,
  createMapCouponWithUser,
  updateUserCouponByUserIdAndCouponId,
  softDeleteUserCouponByUserCouponId,
  hardDeleteUserCouponByUserCouponId,
};
