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
      query.usedAt = {};
      if (usedFrom)
        query.usedAt.$gte = usedFrom
          ? new Date(usedFrom)
          : new Date("2025-11-25");
      if (usedTo) query.usedAt.$lte = usedTo ? new Date(usedTo) : new Date();
    }

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
      return res.status(200).json({ message: "No userCoupons found" });
    }

    res.status(200).json({
      count: userCoupons.length,
      totalCoupon,
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
      return res.status(200).json({ message: "userCoupon not found" });
    }

    res
      .status(200)
      .json({ count: foundUserCoupon.length, userCoupon: foundUserCoupon });
  } catch (err) {
    next(err);
  }
};

const getUserCouponByUserId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { populate } = req.query; // "true"/"all", "false", "coupon", "order"

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

    // Build query
    let query = UserCoupon.find({ userID: id });

    // Handle population based on query param
    if (populate === "true" || populate === "all") {
      // Populate all related fields with selected data
      query = query
        .populate(
          "userID",
          "username email information.firstName information.lastName"
        )
        .populate(
          "couponID"
          // "couponID couponName code discountType discountValue validFrom validUntil isActive"
        )
        .populate("orderID", "orderID totalAmount orderStatus");
    } else if (populate === "coupon") {
      query = query.populate("couponID");
    } else if (populate === "order") {
      query = query.populate("orderID");
    }

    const foundUserCouponByUserId = await query.lean().exec();

    if (!foundUserCouponByUserId || foundUserCouponByUserId.length === 0) {
      return res
        .status(200)
        .json({ message: "No userCoupons found for this user ID" });
    }

    res.status(200).json({
      count: foundUserCouponByUserId.length,
      userCoupons: foundUserCouponByUserId,
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
      return res
        .status(200)
        .json({ message: "No userCoupons found for this coupon ID" });
    }

    res.status(200).json({
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

    const createMapCouponWithUser = new UserCoupon({
      userID,
      couponID,
    });

    const savedCouponWithUser = await createMapCouponWithUser.save();

    if (!savedCouponWithUser) {
      const err = new Error("Failed to create userCoupon mapping");
      err.statusCode = 500;
      return next(err);
    }
    // update distributedCount in Coupon model
    const foundCoupon = await Coupon.findById(couponID).exec();
    if (!foundCoupon) {
      const err = new Error("Coupon not found to update distributedCount");
      err.statusCode = 404;
      return next(err);
    }
    foundCoupon.distributionCount = foundCoupon.distributionCount + 1;

    await foundCoupon.save();
    res
      .status(201)
      .json({ message: "userCoupon created", data: savedCouponWithUser });
  } catch (err) {
    next(err);
  }
};

const updateUserCouponByUserIdAndCouponId = async (req, res, next) => {
  try {
    // when do we update => use coupon(status, usedAt, orderID)
    const { id, userId } = req.params;
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

    const foundUserCoupon = await UserCoupon.findOne({
      $and: [{ userID: userId }, { couponID: id }],
    }).exec();
    const foundCoupon = await Coupon.findById(id).exec();
    
    if (!foundUserCoupon) {
      return res.status(200).json({ message: "userCoupon mapping not found" });
    }
    if (!foundCoupon) {
      return res.status(200).json({ message: "Coupon not found" });
    }

    // update in UserCoupon collection => status, usedAt
    foundUserCoupon.status = "used";
    foundUserCoupon.usedAt = new Date();

    // update in Coupon collection => usageCount, isActive
    foundCoupon.usageCount += 1;
    if (foundCoupon.usageCount === foundCoupon.usageLimit) {
      foundCoupon.isActive = false;
    }

    await foundUserCoupon.save();
    await foundCoupon.save();

    return res.status(200).json({
      message: "userCoupon and coupon updated successfully",
      userCoupon: foundUserCoupon,
      coupon: foundCoupon,
    });
  } catch (err) {
    next(err);
  }
};

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
    const softDeletedUseCoupon = await UserCoupon.findByIdAndUpdate(id, {
      $set: { isDeleted: true, deletedAt: new Date() },
    }).exec();

    if (!softDeletedUseCoupon) {
      const error = new Error("userCoupon not found");
      error.statusCode = 404;
      return next(error);
    }
    return res
      .status(200)
      .json({ message: `userCoupon id ${id} soft deleted successfully` });
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

    return res
      .status(200)
      .json({ message: `userCoupon id ${id} hard deleted successfully` });
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
