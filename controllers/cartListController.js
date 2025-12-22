const { CartList } = require("../models/CartList.js");
const { Product } = require("../models/Product.js");
const mongoose = require("mongoose");

const getAllCartLists = async (req, res, next) => {
  try {
    const { from, to, page, limit, sort } = req.query;
    console.log(typeof from, typeof to);
    let query = {};
    if (from || to) {
      query.createdAt = {};
      if (from)
        query.createdAt.$gte = from ? new Date(from) : new Date("2025-11-26");
      if (to) query.createdAt.$lte = to ? new Date(to) : new Date();
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
        : "-createdAt";

    const [cartLists, total] = await Promise.all([
      CartList.find(query)
        .populate("productId")
        .skip(skip)
        .sort(sortSpec)
        .limit(limitNum),
      CartList.countDocuments(query),
    ]);

    if (!cartLists || cartLists.length === 0) {
      const err = new Error("No cart lists found");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      count: cartLists.length,
      total,
      page: pageNum,
      limit: limitNum,
      cartLists,
    });
  } catch (err) {
    next(err);
  }
};

const getCartListByICartListId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user = "false" } = req.query;

    if (!id || id === ":id") {
      const err = new Error("CartList id is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid CartList id");
      err.statusCode = 400;
      return next(err);
    }
    const foundCartList =
      Boolean(user) !== true
        ? await CartList.findById(id).populate("productId").exec()
        : await CartList.findById(id)
            .populate("productId")
            .populate("userID")
            .exec();
    if (!foundCartList || foundCartList.length === 0) {
      const err = new Error("CartList not found");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json(foundCartList);
  } catch (err) {
    next(err);
  }
};

const getCartListByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === ":userId") {
      const err = new Error("User id is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const err = new Error("Invalid user id");
      err.statusCode = 400;
      return next(err);
    }

    const foundCartListByUserId = await CartList.find({
      userID: userId,
    })
      // select from populate doest not auto hide nested object
      .populate({
        path: "userID",
        select: "-password -role -information -isActive -createdAt -__v",
      })
      .populate("productId")
      .exec();

    if (!foundCartListByUserId || foundCartListByUserId.length === 0) {
      const err = new Error("CartList for this user not found");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json(foundCartListByUserId);
  } catch (err) {
    next(err);
  }
};

const createOrUpdateCartListByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    let newCartList = {};
    if (!userId || userId === ":userId") {
      const err = new Error("User id is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const err = new Error("Invalid user id");
      err.statusCode = 400;
      return next(err);
    }

    const { productId, quantity, size, color, total } = req.body;
    if (!productId || !quantity || !size || !color) {
      const err = new Error("productId, quantity, size and color are required");
      err.statusCode = 400;
      return next(err);
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const err = new Error("Invalid productId format in detail");
      err.statusCode = 400;
      return next(err);
    }

    const quantityNum = Number(quantity);
    if (!quantityNum || quantityNum <= 0) {
      const err = new Error("quantity must be a positive number in detail");
      err.statusCode = 400;
      return next(err);
    }

    if (!size) {
      const err = new Error("size is required in detail");
      err.statusCode = 400;
      return next(err);
    }

    if (!["S", "M", "L", "XL"].includes(size.toUpperCase())) {
      const err = new Error(
        "size must be one of S/s, M/m, L/l, XL/xl in detail"
      );
      err.statusCode = 400;
      return next(err);
    }

    if (!color) {
      const err = new Error("color is required in detail");
      err.statusCode = 400;
      return next(err);
    }

    const foundProductById = await Product.findById(productId).exec();
    if (!foundProductById) {
      const err = new Error("No Product found with id: " + productId);
      err.statusCode = 404;
      return next(err);
    }
    const totalNum = total
      ? Number(total)
      : quantityNum *
        foundProductById.price *
        (1 - foundProductById.discount / 100);
    if (totalNum < 0) {
      console.log(totalNum);
      const err = new Error("total must be a positive number in detail");
      err.statusCode = 400;
      return next(err);
    }

    const duplicateCartList = await CartList.findOne({
      userID: userId,
      productId,
      size,
      color,
    }).exec();
    if (duplicateCartList) {
      duplicateCartList.quantity += quantityNum;
      duplicateCartList.total += totalNum;
      await duplicateCartList.save();

      return res.status(200).json({
        message: "CartList updated from duplicated",
        duplicateCartList,
      });
    }
    newCartList.userID = userId;
    newCartList.productId = productId;
    newCartList.quantity = quantityNum;
    newCartList.size = size.toUpperCase();
    newCartList.color = color;
    newCartList.total = totalNum;

    const createdCartList = new CartList(newCartList);
    await createdCartList.save();

    res.status(201).json({
      message: "CartList created successfully",
      createdCartList,
    });
  } catch (err) {
    next(err);
  }
};

const updateCartListByCartListId = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("CartList id is required");
      err.statusCode = 400;
      return next(err);
    }
  } catch (err) {
    next(err);
  }
};
const deleteCartListByCartListId = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("CartList id is required");
      err.statusCode = 400;
      return next(err);
    }

    const foundAndDeletedCartList = await CartList.findByIdAndDelete(id).exec();

    if (!foundAndDeletedCartList) {
      const err = new Error("CartList not found with id: " + id);
      err.statusCode = 404;
      return next(err);
    }
    res
      .status(200)
      .json({
        message: "CartList deleted successfully",
        foundAndDeletedCartList,
      });
  } catch (err) {
    next(err);
  }
};
const deleteCartListByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === ":userId") {
      const err = new Error("User id is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const err = new Error("Invalid user id");
      err.statusCode = 400;
      return next(err);
    }

    const deletedCartList = await CartList.deleteMany({
      userID: userId,
    }).exec();

    if (!deletedCartList) {
      const err = new Error("No cart lists found for this user id: " + userId);
      err.statusCode = 404;
      return next(err);
    }

    res
      .status(200)
      .json({ message: "Cart lists deleted successfully", deletedCartList });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getAllCartLists,
  getCartListByICartListId,
  getCartListByUserId,
  createOrUpdateCartListByUserId,
  updateCartListByCartListId,
  deleteCartListByCartListId,
  deleteCartListByUserId,
};
