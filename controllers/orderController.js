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
      currentStatus, // filter by currentStatus
      cancel, // true/false
      productID, // any detail.product in order
      search, // regex on detail.productName (if you add this field)
      minTotal, // totalPrice >=
      maxTotal, // totalPrice <=
      from = new Date("2025-11-26"), // createdAt from (ISO date)
      to = new Date(), // createdAt to (ISO date)
      page = 1,
      limit = 10,
      sort = "-createdAt", // default newest first
    } = req.query;

    const query = {}; // filter

    if (userID) {
      query.userID = userID;
    }

    // Filter by currentStatus instead of old status.pass/current
    if (currentStatus) {
      query["status.currentStatus"] = {
        $in: Array.isArray(currentStatus) ? currentStatus : [currentStatus],
      };
    }

    if (typeof cancel !== "undefined") {
      if (cancel === "true" || cancel === true) query.cancel = true;
      else if (cancel === "false" || cancel === false) query.cancel = false;
    }

    if (productID) {
      query["detail.product"] = productID;
    }

    if (search) {
      query["detail.productName"] = { $regex: search, $options: "i" };
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
      Order.find(query)
        .populate({
          path: "detail.product",
        })
        .populate({
          path: "userID",
          select: "email information.firstName information.lastName", // optional: populate user info
        })
        .populate({
          path: "coupon",
          select: "code discountType discountValue", // optional: populate coupon info
        })
        .sort(sortSpec)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Order.countDocuments(query).exec(),
    ]);

    if (!orders || orders.length === 0) {
      const err = new Error("No Orders found");
      err.statusCode = 204;
      return next(err);
    }

    return res.status(200).json({
      message: "Get all orders successfully",
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

    return res.status(200).json({
      message: "Get order successfully",
      order: foundOrder,
    });
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
      paymentMethod,
      detail,
      deliverAddress,
      subTotal,
      shippingPrice,
      taxPrice,
      discount,
      totalPrice,
      coupon,
    } = req.body;
    if (!userID || !totalItem || !paymentMethod || !detail || !deliverAddress) {
      const err = new Error(
        "userID, totalItem, paymentMethod, detail and deliverAddress are required"
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
        console.log("item: ", item);
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
        // check inStock
        await Product.checkStock(item.product, color, size, quantity);

        // Calculate total price after discount applied
        const unitPrice = product.price;
        const discountProduct = product?.discount || 0;
        const priceBeforeDiscount = Number((unitPrice * quantity).toFixed(2));
        // check inStock with productID color size and quantity if out of stock return error => createOrder decrease stock

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
    if (deliverAddress) {
      if (
        !deliverAddress.address ||
        !deliverAddress.zipCode ||
        !deliverAddress.tel ||
        !deliverAddress.email
      ) {
        const err = new Error(
          "deliverAddress.address, deliverAddress.zipCode, deliverAddress.tel and deliverAddress.email are required"
        );
        err.statusCode = 400;
        return next(err);
      }
    }

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

    // update coupon
    let couponId;
    if (coupon) {
      if (!mongoose.Types.ObjectId.isValid(coupon)) {
        const err = new Error("Invalid coupon format");
        err.statusCode = 400;
        return next(err);
      }
      couponId = coupon;

      const foundCoupon = await Coupon.findById(couponId).exec();
      foundCoupon.usageCount = foundCoupon.usageCount + 1;
      if (foundCoupon.usageLimit <= foundCoupon.usageCount) {
        foundCoupon.isActive = false;
      }
      await foundCoupon.save();
    }

    // Calculate totalPrice
    let totalPriceNum;
    if (totalPrice) {
      totalPriceNum = Number(totalPrice);
    } else {
      if (coupon) {
        const foundCoupon = await Coupon.findById(coupon).exec();
        if (foundCoupon.discountType === "percentage") {
          const discountValue =
            (foundCoupon.discountValue / 100) * this.subTotal;
          return Number(
            (
              subTotalNum -
              discountValue +
              shippingPriceNum +
              taxPriceNum
            ).toFixed(2)
          );
        } else if (foundCoupon.discountType === "fixed") {
          const discountValue = foundCoupon.discountValue;
          return Number(
            (
              subTotalNum -
              discountValue +
              shippingPriceNum +
              taxPriceNum
            ).toFixed(2)
          );
        }
      } else {
        return Number(
          (subTotalNum + shippingPriceNum + taxPriceNum).toFixed(2)
        );
      }
    }

    const newOrder = new Order({
      userID,
      totalItem: totalItemNum,
      detail: detailFormat,
      deliverAddress,
      status: {
        statusHistory: [
          {
            status: "OrderPlaced",
            date: new Date(),
            description: "Order confirmed and payment processed",
          },
        ],
        currentStatus: "OrderPlaced",
      },
      subTotal: subTotalNum,
      shippingPrice: shippingPriceNum,
      taxPrice: taxPriceNum,
      discount,
      coupon: couponId,
      totalPrice: totalPriceNum,
    });
    const savedOrder = await newOrder.save();
    if (!savedOrder) {
      const err = new Error("Failed to create order");
      err.statusCode = 500;
      return next(err);
    }

    // update product
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

    // update UserCoupon
    const foundUserCoupon = await UserCoupon.findOne({
      userID,
      couponID: couponId,
    }).exec();

    if (foundUserCoupon) {
      foundUserCoupon.usageCount += 1;
      foundUserCoupon.used.push({
        usedAt: new Date(),
        orderID: savedOrder._id,
      });
      if (foundUserCoupon.usageCount >= foundUserCoupon.userUsageLimit) {
        foundUserCoupon.status = "used";
      }
      await foundUserCoupon.save();
    }

    res.status(201).json({
      message: "Created order successfully",
      order: savedOrder,
    });
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

    return res.status(200).json({
      message: "Updated order successfully",
      order: foundAndUpdateOrder,
    });
  } catch (err) {
    next(err);
  }
};

// update order status by order id
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;

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
    if (!status) {
      const err = new Error("status is required");
      err.statusCode = 400;
      return next(err);
    }

    const validStatuses = ["OrderPlaced", "Processing", "Shipped", "Delivered"];
    if (!validStatuses.includes(status)) {
      const err = new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
      err.statusCode = 400;
      return next(err);
    }

    const foundOrder = await Order.findById(id).exec();
    if (!foundOrder) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    // Check if status is actually changing
    if (foundOrder.status.currentStatus === status) {
      return res.status(200).json({
        message: "Order status unchanged",
        order: foundOrder,
      });
    }

    // Add new entry to statusHistory
    foundOrder.status.statusHistory.push({
      status,
      date: new Date(),
      description: description || `Order status updated to ${status}`,
    });

    // Update currentStatus
    foundOrder.status.currentStatus = status;

    const savedOrder = await foundOrder.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order: savedOrder,
    });
  } catch (err) {
    next(err);
  }
};

const softDeleteOrderByOrderId = async (req, res, next) => {
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

    const softDeletedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          cancel: true,
        },
      },
      { new: true }
    );
    if (!softDeletedOrder) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }
    return res.status(200).json({
      message: "Soft deleted order successfully",
      order: softDeletedOrder,
    });
  } catch (err) {
    next(err);
  }
};

const hardDeleteOrderByOrderId = async (req, res, next) => {
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
  updateOrderStatus,
  softDeleteOrderByOrderId,
  hardDeleteOrderByOrderId,
};
