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

    const cartList = await CartList.aggregate([
      // 1️⃣ เลือก cart ของ user คนนี้
      {
        $match: {
          userID: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$user._id",
          userID: {
            $first: {
              _id: "$user._id",
              username: "$user.username",
              email: "$user.email",
            },
          },
          cartLists: {
            $push: {
              _id: "$_id",
              product: "$product",
              quantity: "$quantity",
              size: "$size",
              color: "$color",
              total: "$total",
              createdAt: "$createdAt",
            },
          },
        },
      },
    ]);
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

    res.status(200).json(cartList);
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

    const { productId, color, size, quantity, total } = req.body;
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
        cartList: duplicateCartList,
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
      cartList: createdCartList,
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

    const { quantity, total } = req.body;

    if (!quantity && !total) {
      const err = new Error(
        "At least one of quantity or total is required to update"
      );
      err.statusCode = 400;
      return next(err);
    }
    const quantityNum = Number(quantity);
    if (quantity && (!quantityNum || quantityNum <= 0)) {
      const err = new Error("quantity must be a positive number");
      err.statusCode = 400;
      return next(err);
    }
    let totalNum;
    if (!total) {
      const productId = await CartList.findById(id).select("productId").exec();
      if (!productId) {
        const err = new Error("CartList not found with id: " + id);
        err.statusCode = 404;
        return next(err);
      }

      const productPrice = await Product.findById(productId.productId)
        .select("price discount")
        .exec();
      if (!productPrice) {
        const err = new Error(
          "Product not found with id: " + productId.productId
        );
        err.statusCode = 404;
        return next(err);
      }

      const total = quantityNum
        ? quantityNum * productPrice.price * (1 - productPrice.discount / 100)
        : null;
      totalNum = total;
    }
    console.log(quantity, quantityNum);
    console.log(total, totalNum);
    console.log("---------------------------");
    const updatedCartList = await CartList.findByIdAndUpdate(
      id,
      {
        $set: {
          quantity: quantityNum,
          total: totalNum,
        },
      },
      { new: true }
    ).exec();
    console.log("updatedCartList: ", updatedCartList);
    if (!updatedCartList) {
      const err = new Error("CartList not found with id: " + id);
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({
      message: "CartList updated successfully",
      cartList: updatedCartList,
    });
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
    res.status(200).json({
      message: "CartList deleted successfully",
      deletedCartList: foundAndDeletedCartList,
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
