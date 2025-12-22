const { Order } = require("../models/Order");
const { Product } = require("../models/Product");
const { Coupon } = require("../models/Coupon");
const { UserCoupon } = require("../models/UserCoupon");
const mongoose = require("mongoose");

// get all orders with dynamic filters
const getAllOrders = async (req, res, next) => {
  try {
    const {
      userID,
      status, // filter by any current status value
      cancel, // true/false
      productID, // any detail.productID in order
      search, // regex on detail.productName
      minTotal, // totalPrice >=
      maxTotal, // totalPrice <=
      from = new Date("2025-11-26"), // createdAt from (ISO date)
      to = new Date(), // createdAt to (ISO date)
      page = 1,
      limit = 10,
      sort = "-createdAt", // default newest first
    } = req.query;
    // so careful for when we request in postman type of value is string when we want to use this to filter
    // we need to convert type of it correctly
    const query = {}; // filter

    if (userID) {
      query.userID = userID;
    }
    if (status) {
      if (status.pass) {
        query["status.pass"] = {
          $in: Array.isArray(status.pass) ? status.pass : [status.pass],
        };
      }
      if (status.current) {
        query["status.current"] = {
          $in: Array.isArray(status.current)
            ? status.current
            : [status.current],
        };
      }
    }
    if (typeof cancel !== "undefined") {
      if (cancel === "true" || cancel === true) query.cancel = true;
      else if (cancel === "false" || cancel === false) query.cancel = false;
    }
    if (productID) {
      query["detail.productID"] = productID;
    }
    if (search) {
      query["detail.productName"] = { $regex: search, $options: "i" }; // search in productName field ignore lowercase or lowercase
    }
    if (minTotal || maxTotal) {
      query.totalPrice = {};
      if (minTotal) query.totalPrice.$gte = Number(minTotal);
      if (maxTotal) query.totalPrice.$lte = Number(maxTotal);
    }
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // sanitize pagination params: treat blank or invalid as defaults
    const pageRaw = typeof page === "string" ? page.trim() : page;
    const limitRaw = typeof limit === "string" ? limit.trim() : limit;
    const pageParsed = Number(pageRaw);
    const limitParsed = Number(limitRaw);
    const pageNum =
      Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;
    const limitNum = Number.isFinite(limitParsed)
      ? Math.min(Math.max(limitParsed, 1), 100)
      : 20;
    const skip = (pageNum - 1) * limitNum;

    // sanitize sort: if blank, default to -createdAt
    const sortSpec =
      typeof sort === "string" && sort.trim() !== ""
        ? sort.trim()
        : "-createdAt";

    const [orders, total] = await Promise.all([
      Order.find(query).sort(sortSpec).skip(skip).limit(limitNum).exec(),
      Order.countDocuments(query).exec(),
    ]);
    if (!orders || orders.length === 0) {
      const err = new Error("No Orders found");
      err.statusCode = 204;
      return next(err);
    }
    return res.status(200).json({
      count: orders.length,
      total,
      page: pageNum,
      limit: limitNum,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

// get order by order id
const getOrderByOrderId = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid order id format");
      err.statusCode = 400;
      return next(err);
    }

    const foundOrder = await Order.findById(id).exec();
    if (!foundOrder) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    return res.status(200).json(foundOrder);
  } catch (err) {
    next(err);
  }
};

// create Order
const createOrder = async (req, res, next) => {
  try {
    const {
      userID,
      totalItem,
      detail,
      deliverAddress,
      subTotal,
      shippingPrice,
      taxPrice,
      discount,
      totalPrice,
      coupon,
    } = req.body;
    if (!userID || !totalItem || !detail || !deliverAddress) {
      const err = new Error(
        "userID, totalItem, detail and deliverAddress are required"
      );
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      const err = new Error("Invalid userID format");
      err.statusCode = 400;
      return next(err);
    }

    if (!Array.isArray(detail) || detail.length === 0) {
      return res
        .status(400)
        .json({ message: "detail must be a non-empty array" });
    }
    const detailFormat = await Promise.all(
      detail.map(async (item, idx) => {
        if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
          throw new Error(`detail[${idx}].product must be a valid ObjectId`);
        }
        const quantity = Number(item.quantity);
        const size = String(item.size.toUpperCase());
        const color = String(item.color);

        // Fetch product details from DB
        const product = await Product.findById(item.product)
          .select("price discount")
          .exec();
        if (!product) {
          throw new Error(`detail[${idx}].product not found in database`);
        }

        const unitPrice = product.price;
        const discountProduct = product.discount || 0;

        // Calculate price before discount (unitPrice * quantity)
        const priceBeforeDiscount = Number((unitPrice * quantity).toFixed(2));

        // Calculate total price after discount applied
        const totalPrice = Number(
          (unitPrice * (1 - discountProduct / 100) * quantity).toFixed(2)
        );

        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error(`detail[${idx}].quantity must be a positive number`);
        }
        if (!Number.isFinite(totalPrice) || totalPrice < 0) {
          throw new Error(`detail[${idx}].price must be a non-negative number`);
        }
        return {
          product: item.product,
          quantity,
          size,
          color,
          discountProduct,
          price: priceBeforeDiscount,
          totalPrice,
        };
      })
    );
    const totalItemNum = Number(totalItem);
    const deliverAddressStr = String(deliverAddress);

    // subTotal should be sum of all totalPrice (after product discounts applied)
    const subTotalNum = subTotal
      ? Number(subTotal)
      : Number(
          detailFormat
            .reduce((acc, item) => acc + item.totalPrice, 0)
            .toFixed(2)
        );

    const shippingPriceNum = Number(shippingPrice ?? 0);
    const taxPriceNum = Number(taxPrice ?? 0);

    // Handle discount object
    const discountObj = discount || { percent: 0, amount: 0 };
    const discountPercent = Number(discountObj.percent ?? 0);
    const discountAmount = Number(discountObj.amount ?? 0);

    // Calculate totalPrice
    let totalPriceNum;
    if (totalPrice) {
      totalPriceNum = Number(totalPrice);
    } else {
      // Calculate based on discount type
      if (discountPercent > 0) {
        const discountValue = (discountPercent / 100) * subTotalNum;
        totalPriceNum = Number(
          (
            subTotalNum -
            discountValue +
            shippingPriceNum +
            taxPriceNum
          ).toFixed(2)
        );
      } else if (discountAmount > 0) {
        totalPriceNum = Number(
          (
            subTotalNum -
            discountAmount +
            shippingPriceNum +
            taxPriceNum
          ).toFixed(2)
        );
      } else {
        totalPriceNum = Number(
          (subTotalNum + shippingPriceNum + taxPriceNum).toFixed(2)
        );
      }
    }

    let couponId;
    if (coupon) {
      if (!mongoose.Types.ObjectId.isValid(coupon)) {
        const err = new Error("Invalid coupon format");
        err.statusCode = 400;
        return next(err);
      }
      couponId = coupon;

      // update Coupon, UserCoupon when create order with coupon
      // this way better than update it from field like  foundCoupon.usageLimit = foundCoupon.usageLimit -1
      // const foundCoupon = await Coupon.findByIdAndUpdate(
      //   { _id: couponId },
      //   { $inc: { usageCount: 1, usageLimit: -1 } }, //$inc increment
      //   { new: true } // new true return document value after update
      // ).exec();
      // update Coupon
      const foundCoupon = await Coupon.findById({ _id: couponId }).exec();
      foundCoupon.usageLimit = foundCoupon.usageLimit - 1;
      foundCoupon.usageCount = foundCoupon.usageCount + 1;
      if (foundCoupon.usageLimit <= 0) {
        foundCoupon.isActive = false;
      }
      await foundCoupon.save();

      // update UserCoupon
      const foundUserCoupon = await UserCoupon.find({
        userID,
        couponID: couponId,
      }).exec();

      if (foundUserCoupon && foundUserCoupon.length > 0) {
        for (const uc of foundUserCoupon) {
          uc.status = "used";
          uc.usedAt = new Date();
          await uc.save();
        }
      }
    }
    const newOrder = new Order({
      userID,
      totalItem: totalItemNum,
      detail: detailFormat,
      deliverAddress: deliverAddressStr,
      subTotal: subTotalNum,
      shippingPrice: shippingPriceNum,
      taxPrice: taxPriceNum,
      discount: {
        percent: discountPercent,
        amount: discountAmount,
      },
      coupon: couponId,
      totalPrice: totalPriceNum,
    });
    const savedOrder = await newOrder.save();
    if (!savedOrder) {
      const err = new Error("Failed to create order");
      err.statusCode = 500;
      return next(err);
    }

    // update product quantity when have order
    for (const item of detailFormat) {
      await Product.findOneAndUpdate(
        { _id: item.product },
        {
          $inc: {
            "variants.$[v].inStock": -item.quantity,
            "variants.$[v].sellingAmount": item.quantity,
          },
        },
        {
          arrayFilters: [{ "v.color": item.color, "v.size": item.size }],
        }
      );
    }
    res.status(201).json(savedOrder);
  } catch (err) {
    next(err);
  }
};

// update order by order id
const updateOrderByOrderId = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid order id format");
      err.statusCode = 400;
      return next(err);
    }

    const {
      totalItem,
      detail,
      deliverAddress,
      subTotal,
      shippingPrice,
      taxPrice,
      discount,
      totalPrice,
      coupon,
    } = req.body;

    const foundOrder = await Order.findById({ _id: id }).exec();
    if (!foundOrder) {
      const err = new Error("Not found Order with order id " + id);
      err.statusCode = 404;
      return next(err);
    }

    const detailFormat = await Promise.all(
      detail.map(async (item, idx) => {
        if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
          throw new Error(`detail[${idx}].product must be a valid ObjectId`);
        }
        const quantity = Number(item.quantity);
        const size = String(item.size.toUpperCase());
        const color = String(item.color);
        const priceProduct = item.price
          ? Number(item.price)
          : (
              await Product.findById(item.product)
                .select("price discount")
                .exec()
            ).price;
        const priceTotal = Number(
          priceProduct * (1 - discount / 100) * quantity
        );
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error(`detail[${idx}].quantity must be a positive number`);
        }
        if (!Number.isFinite(discount) || discount < 0) {
          throw new Error(
            `detail[${idx}].discount must be a non-negative number`
          );
        }
        if (!Number.isFinite(priceTotal) || priceTotal < 0) {
          throw new Error(`detail[${idx}].price must be a non-negative number`);
        }
        return {
          ...item,
          quantity,
          size,
          color,
          price: priceTotal,
        };
      })
    );

    const totalItemNum = Number(totalItem);
    const deliverAddressStr = String(deliverAddress);
    const subTotalNum = Number(subTotal);
    const shippingPriceNum = Number(shippingPrice);
    const taxPriceNum = Number(taxPrice);
    const discountNum = Number(discount);
    const totalPriceNum = Number(totalPrice);

    if (!Number.isFinite(totalItemNum || totalItemNum < 0)) {
      throw new Error("totalItem must be a non-negative and finite number");
    }
    if (!Number.isFinite(subTotalNum) || subTotalNum < 0) {
      throw new Error("subTotal must be a non-negative and finite number");
    }
    if (!Number.isFinite(shippingPriceNum) || shippingPriceNum < 0) {
      throw new Error("shippingPrice must be a non-negative and finite number");
    }
    if (!Number.isFinite(taxPriceNum) || taxPriceNum < 0) {
      throw new Error("taxPrice must be a non-negative and finite number");
    }
    if (!Number.isFinite(totalPriceNum) || totalPriceNum < 0) {
      throw new Error("totalPrice must be a non-negative and finite number");
    }
    let couponId;
    if (coupon) {
      if (!mongoose.Types.ObjectId.isValid(coupon)) {
        const err = new Error("Invalid coupon format");
        err.statusCode = 400;
        return next(err);
      }
      couponId = coupon;
    }
    const updatedOrder = {
      totalItem: totalItemNum,
      detail: detailFormat,
      deliverAddress: deliverAddressStr,
      subTotal: subTotalNum,
      shippingPrice: shippingPriceNum,
      taxPrice: taxPriceNum,
      discount: discountNum,
      coupon: couponId,
      totalPrice: totalPriceNum,
    };
    const foundAndUpdateOrder = await Order.findByIdAndUpdate(
      { _id: id },
      { $set: updatedOrder },
      { new: true, runValidators: true }
    );

    if (!foundAndUpdateOrder) {
      const err = new Error("Failed to update order with id " + id);
      err.statusCode = 500;
      return next(err);
    }

    return res.status(200).json(foundAndUpdateOrder);
  } catch (err) {
    next(err);
  }
};

// delete order by order id
const deleteOrderByOrderId = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid order id format");
      err.statusCode = 400;
      return next(err);
    }

    const foundAndDeleteOrder = await Order.findByIdAndDelete(id);
    if (!foundAndDeleteOrder) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }
    return res.status(200).json({
      message: "Deleted order successfully",
      order: foundAndDeleteOrder,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllOrders,
  getOrderByOrderId,
  createOrder,
  updateOrderByOrderId,
  deleteOrderByOrderId,
};
