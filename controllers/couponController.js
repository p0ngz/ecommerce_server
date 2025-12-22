const { Coupon } = require("../models/Coupon");
const { User } = require("../models/User");
const mongoose = require("mongoose");
// !ไม่ควรให้ controller คุยกับ Mongoose ตรง ๆ ควรแยก logic ไปที่ service แทน

const getAllCoupons = async (req, res, next) => {
  try {
    const {
      from,
      to,
      validFrom,
      validUntil,
      search,
      discountType,
      isActive,
      sort,
      page,
      limit,
    } = req.query;

    let query = {};
    // from, to
    if (from || to) {
      query["createdBy.createdAt"] = {};
      if (from) {
        query["createdBy.createdAt"].$gte = new Date(from);
      }
      if (to) {
        query["createdBy.createdAt"].$lte = new Date(to);
      }
    }

    // validFrom, validUntil
    if (validFrom || validUntil) {
      if (validFrom) {
        query.validFrom = { $gte: new Date(validFrom) };
      }
      if (validUntil) {
        query.validUntil = { $lte: new Date(validUntil) };
      }
    }

    // search
    if (search) {
      query.couponName = { $regex: search, $options: "i" };
    }

    // discountType
    if (
      discountType &&
      ["percentage", "fixed"].includes(discountType.toLowerCase())
    ) {
      query.discountType = discountType.toLowerCase();
    }

    // isActive
    if (isActive) {
      query.isActive = isActive;
    }

    const pageRaw = typeof page === "string" ? page.trim() : page;
    const limitRaw = typeof limit === "string" ? limit.trim() : limit;
    const pageParsed = Number(pageRaw);
    const limitParsed = Number(limitRaw);
    const pageNum =
      Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;
    const limitNum =
      Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : 10;

    const skip = (pageNum - 1) * limitNum;
    const sortSpec =
      typeof sort === "string" && sort.trim() !== ""
        ? sort.trim()
        : "-createdBy.createdAt"; //"-createdAt" "-usageCount" "-usageLimit"

    const [coupons, total] = await Promise.all([
      Coupon.find(query).skip(skip).sort(sortSpec).limit(limitNum).exec(),
      Coupon.countDocuments(query).exec(),
    ]);
    if (!coupons || coupons.length === 0) {
      const err = new Error("No coupons found");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      count: coupons.length,
      total,
      page: pageNum,
      limit: limitNum,
      coupons,
    });
  } catch (err) {
    next(err);
  }
};

const getCouponByCouponId = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("coupon id is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid coupon id");
      err.statusCode = 400;
      return next(err);
    }

    const foundCouponById = await Coupon.findById(id).exec();

    if (!foundCouponById) {
      const err = new Error("No coupon found with id: " + id);
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json(foundCouponById);
  } catch (err) {
    next(err);
  }
};

const createNewCoupon = async (req, res, next) => {
  try {
    const {
      couponName,
      discountType,
      discountValue,
      description,
      minimumPrice,
      maximumPrice,
      minDiscountAmount,
      maxDiscountAmount,
      usageLimit,
      validFrom,
      validUntil,
      isActive,
      createdBy,
    } = req.body;

    // Required fields validation
    if (
      !couponName ||
      !discountType ||
      !discountValue ||
      !validFrom ||
      !validUntil ||
      !createdBy
    ) {
      const err = new Error(
        "couponName, discountType, discountValue, validFrom, validUntil, and createdBy are required"
      );
      err.statusCode = 400;
      return next(err);
    }
    // Validate couponName
    const couponNameStr = String(couponName).trim();
    if (couponNameStr.length < 3) {
      const err = new Error("couponName must be at least 3 characters long");
      err.statusCode = 400;
      return next(err);
    }

    // Validate discountType
    const discountTypeStr = String(discountType).trim().toLowerCase();
    if (!["percentage", "fixed"].includes(discountTypeStr)) {
      const err = new Error("discountType must be 'percentage' or 'fixed'");
      err.statusCode = 400;
      return next(err);
    }

    // Validate discountValue
    const discountValueNum = Number(discountValue);
    if (!Number.isFinite(discountValueNum) || discountValueNum < 0) {
      const err = new Error("discountValue must be a positive number");
      err.statusCode = 400;
      return next(err);
    }

    // Additional validation for percentage discount
    if (discountTypeStr === "percentage" && discountValueNum > 100) {
      const err = new Error("Percentage discount cannot exceed 100%");
      err.statusCode = 400;
      return next(err);
    }

    // Validate minimumPrice
    let minimumPriceNum = 0;
    if (minimumPrice !== undefined && minimumPrice !== null) {
      minimumPriceNum = Number(minimumPrice);
      if (!Number.isFinite(minimumPriceNum) || minimumPriceNum < 0) {
        const err = new Error("minimumPrice must be a non-negative number");
        err.statusCode = 400;
        return next(err);
      }
    }

    // Validate maximumPrice
    let maximumPriceNum = Infinity;
    if (maximumPrice !== undefined && maximumPrice !== null) {
      maximumPriceNum = Number(maximumPrice);
      if (!Number.isFinite(maximumPriceNum) || maximumPriceNum <= 0) {
        const err = new Error("maximumPrice must be a positive number");
        err.statusCode = 400;
        return next(err);
      }
    }

    // Validate minimumPrice <= maximumPrice
    if (Number.isFinite(maximumPriceNum) && minimumPriceNum > maximumPriceNum) {
      const err = new Error("minimumPrice cannot be greater than maximumPrice");
      err.statusCode = 400;
      return next(err);
    }

    // Validate minDiscountAmount
    let minDiscountAmountNum = 0;
    if (minDiscountAmount !== undefined && minDiscountAmount !== null) {
      minDiscountAmountNum = Number(minDiscountAmount);
      if (!Number.isFinite(minDiscountAmountNum) || minDiscountAmountNum < 0) {
        const err = new Error(
          "minDiscountAmount must be a non-negative number"
        );
        err.statusCode = 400;
        return next(err);
      }
    }

    // Validate maxDiscountAmount
    let maxDiscountAmountNum = Infinity;
    if (maxDiscountAmount !== undefined && maxDiscountAmount !== null) {
      maxDiscountAmountNum = Number(maxDiscountAmount);
      if (!Number.isFinite(maxDiscountAmountNum) || maxDiscountAmountNum <= 0) {
        const err = new Error("maxDiscountAmount must be a positive number");
        err.statusCode = 400;
        return next(err);
      }
    }

    // Validate minDiscountAmount <= maxDiscountAmount
    if (
      Number.isFinite(maxDiscountAmountNum) &&
      minDiscountAmountNum > maxDiscountAmountNum
    ) {
      const err = new Error(
        "minDiscountAmount cannot be greater than maxDiscountAmount"
      );
      err.statusCode = 400;
      return next(err);
    }

    // Validate usageLimit
    let usageLimitNum = 1;
    if (usageLimit !== undefined && usageLimit !== null) {
      usageLimitNum = Number(usageLimit);
      if (!Number.isFinite(usageLimitNum) || usageLimitNum < 1) {
        const err = new Error("usageLimit must be at least 1");
        err.statusCode = 400;
        return next(err);
      }
    }

    // Validate dates
    const validFromDate = new Date(validFrom);
    const validUntilDate = new Date(validUntil);

    if (isNaN(validFromDate.getTime())) {
      const err = new Error("validFrom must be a valid date");
      err.statusCode = 400;
      return next(err);
    }

    if (isNaN(validUntilDate.getTime())) {
      const err = new Error("validUntil must be a valid date");
      err.statusCode = 400;
      return next(err);
    }

    if (validUntilDate <= validFromDate) {
      const err = new Error("validUntil must be after validFrom");
      err.statusCode = 400;
      return next(err);
    }

    // Validate createdBy.userId
    if (!createdBy || !createdBy.userId) {
      const err = new Error("createdBy.userId is required");
      err.statusCode = 400;
      return next(err);
    }

    if (!mongoose.Types.ObjectId.isValid(createdBy.userId)) {
      const err = new Error("Invalid createdBy.userId format");
      err.statusCode = 400;
      return next(err);
    }

    // Create new coupon object
    const newCoupon = new Coupon({
      couponName: couponNameStr,
      discountType: discountTypeStr,
      discountValue: discountValueNum,
      description: description ? String(description).trim() : undefined,
      minimumPrice: minimumPriceNum,
      maximumPrice: maximumPriceNum,
      minDiscountAmount: minDiscountAmountNum,
      maxDiscountAmount: maxDiscountAmountNum,
      usageLimit: usageLimitNum,
      usageCount: 0,
      validFrom: validFromDate,
      validUntil: validUntilDate,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdBy: {
        userId: createdBy.userId,
        createdAt: createdBy.createdAt
          ? new Date(createdBy.createdAt)
          : new Date(),
      },
    });

    const savedCoupon = await newCoupon.save();

    if (!savedCoupon) {
      const err = new Error("Failed to create coupon");
      err.statusCode = 500;
      return next(err);
    }
    // const result = await Coupon.findOne({ "createdBy.userId": "6926117b612b66f266bffa46" })
    //   .populate("createdBy.userId")
    //   .exec();
    res.status(201).json({
      message: "Coupon created successfully",
      coupon: savedCoupon,
    });
  } catch (err) {
    next(err);
  }
};

const updateCouponById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      couponName,
      discountType,
      discountValue,
      description,
      minimumPrice,
      maximumPrice,
      minDiscountAmount,
      maxDiscountAmount,
      usageLimit,
      validFrom,
      validUntil,
      isActive,
      createdBy,
    } = req.body;
    if (!id || id === ":id") {
      const err = new Error("coupon id is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid coupon id");
      err.statusCode = 400;
      return next(err);
    }
    // if (!discountValue) {
    //   const err = new Error("discountValue is required");
    //   err.statusCode = 400;
    //   return next(err);
    // }
    // if (!couponName) {
    //   const err = new Error("couponName is required");
    //   err.statusCode = 400;
    //   return next(err);
    // }
    // if (!validFrom) {
    //   const err = new Error("validFrom is required");
    //   err.statusCode = 400;
    //   return next(err);
    // }
    // if (!validUntil) {
    //   const err = new Error("validUntil is required");
    //   err.statusCode = 400;
    //   return next(err);
    // }
    // if (!createdBy.userId) {
    //   const err = new Error("createdBy.userId is required");
    //   err.statusCode = 400;
    //   return next(err);
    // }
    if (!mongoose.Types.ObjectId.isValid(createdBy.userId)) {
      const err = new Error("Invalid createdBy.userId format");
      err.statusCode = 400;
      return next(err);
    }

    // format
    const couponNameFormat = String(couponName).trim();
    const discountTypeFormat = ["percentage", "fixed"].includes(
      discountType.toLowerCase()
    )
      ? discountType.toLowerCase()
      : "percentage";
    const discountValueFormat = Number(discountValue);
    const descriptionFormat = description ? String(description).trim() : "";
    const minimumPriceFormat = minimumPrice ? Number(minimumPrice) : 0;
    const maximumPriceFormat = maximumPrice ? Number(maximumPrice) : Infinity;
    const minDiscountAmountFormat = minDiscountAmount
      ? Number(minDiscountAmount)
      : 0;
    const maxDiscountAmountFormat = maxDiscountAmount
      ? Number(maxDiscountAmount)
      : Infinity;
    const usageLimitFormat = usageLimit ? Number(usageLimit) : 1;
    const validFromFormat = new Date(validFrom);
    const validUntilFormat = new Date(validUntil);
    const isActiveFormat = isActive !== undefined ? Boolean(isActive) : true;
    const createdByFormat = { userId: createdBy.userId, createdAt: new Date() };

    const updateCoupon = {
      couponName: couponNameFormat,
      discountType: discountTypeFormat,
      discountValue: discountValueFormat,
      description: descriptionFormat,
      minimumPrice: minimumPriceFormat,
      maximumPrice: maximumPriceFormat,
      minDiscountAmount: minDiscountAmountFormat,
      maxDiscountAmount: maxDiscountAmountFormat,
      usageLimit: usageLimitFormat,
      validFrom: validFromFormat,
      validUntil: validUntilFormat,
      isActive: isActiveFormat,
      createdBy: createdByFormat,
    };

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, {
      $set: updateCoupon,
    });

    if (!updatedCoupon) {
      console.log("updatedCoupon", updatedCoupon);
      const err = new Error("Failed to update coupon with id: " + id);
      err.statusCode = 500;
      return next(err);
    }

    res.status(200).json(updatedCoupon);
  } catch (err) {
    next(err);
  }
};

const softDeleteCouponById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!id || id === ":id") {
      const err = new Error("coupon id is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid coupon id");
      err.statusCode = 400;
      return next(err);
    }
    const idUserDeleteCoupon = await User.findById(userId, { _id: 1 }).exec();
    console.log("idUserDeleteCoupon", idUserDeleteCoupon);
    if (!idUserDeleteCoupon) {
      const err = new Error("User not found to delete coupon");
      err.statusCode = 404;
      return next(err);
    }
    const updateDeleteStatusCoupon = {
      isDeleted: true,
      deletedBy: idUserDeleteCoupon,
      deletedAt: new Date(),
    };
    const updatedDeleteCoupon = await Coupon.findByIdAndUpdate(id, {
      $set: updateDeleteStatusCoupon,
    });
    if (!updatedDeleteCoupon) {
      const err = new Error("Failed to delete coupon with id: " + id);
      err.statusCode = 500;
      return next(err);
    }

    res
      .status(200)
      .json({ message: `Coupon id ${id} is soft deleted successfully` });
  } catch (err) {
    next(err);
  }
};

const hardDeleteCouponById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("coupon id is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid coupon id");
      err.statusCode = 400;
      return next(err);
    }

    const hardDeletedCoupon = await Coupon.findByIdAndDelete(id).exec();

    if (!hardDeletedCoupon) {
      const err = new Error("Failed to hard delete coupon with id: " + id);
      err.statusCode = 500;
      return next(err);
    }

    res
      .status(200)
      .json({ message: `Coupon id ${id} is hard deleted successfully` });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getAllCoupons,
  getCouponByCouponId,
  createNewCoupon,
  updateCouponById,
  softDeleteCouponById,
  hardDeleteCouponById,
};
