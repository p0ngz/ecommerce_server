const { Order } = require("../models/Order");
const mongoose = require("mongoose");

// get all orders with dynamic filters
const getAllOrders = async (req, res) => {
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
    const [items, total] = await Promise.all([
      Order.find(query).sort(sortSpec).skip(skip).limit(limitNum).exec(),
      Order.countDocuments(query).exec(),
    ]);

    if (!items || items.length === 0) {
      const err = new Error("No Orders found");
      err.statusCode = 204;
      return next(err);
    }

    return res.status(200).json({
      count: items.length,
      total,
      page: pageNum,
      limit: limitNum,
      orders: items,
    });
  } catch (err) {
    next(err);
  }
};

// get order by order id
const getOrderByOrderId = async (req, res) => {
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
const createOrder = async (req, res) => {
  try {
    /*
    generate in backend => 
        orderID, 
        trackingNumber,
        status
  */
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
    } = req.body;
    if (
      !userID ||
      !totalItem ||
      !detail ||
      !deliverAddress ||
      !subTotal ||
      !totalPrice
    ) {
      const err = new Error(
        "userID, totalItem, detail, deliverAddress, subTotal and totalPrice are required"
      );
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      const err = new Error("Invalid userID format");
      err.statusCode = 400;
      return next(err);
    }
    const totalItemNum = Number(totalItem);
    const subTotalNum = Number(subTotal);
    const shippingPriceNum = Number(shippingPrice ?? 0);
    const taxPriceNum = Number(taxPrice ?? 0);
    const totalPriceNum = Number(totalPrice);

    if (!Array.isArray(detail) || detail.length === 0) {
      return res
        .status(400)
        .json({ message: "detail must be a non-empty array" });
    }
    const detailFormat = detail.map((item, idx) => {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        throw new Error(`detail[${idx}].product must be a valid ObjectId`);
      }
      const productID = String(item.productID);
      const productName = String(item.productName);
      const productImg = String(item.productImg);
      const typeProduct = String(item.typeProduct);
      const quantity = Number(item.quantity);
      const discount = Number(item.discount ?? 0);
      const size = String(item.size.toUpperCase());
      const color = String(item.color);
      const price = Number(item.price);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(`detail[${idx}].quantity must be a positive number`);
      }
      if (!Number.isFinite(discount) || discount < 0) {
        throw new Error(
          `detail[${idx}].discount must be a non-negative number`
        );
      }
      if (!Number.isFinite(price) || price < 0) {
        throw new Error(`detail[${idx}].price must be a non-negative number`);
      }
      return {
        ...item,
        productID,
        productName,
        productImg,
        typeProduct,
        quantity,
        discount,
        size,
        color,
        price,
      };
    });

    const newOrder = new Order({
      userID,
      totalItem: totalItemNum,
      detail: detailFormat,
      deliverAddress,
      subTotal: subTotalNum,
      shippingPrice: shippingPriceNum,
      taxPrice: taxPriceNum,
      discount,
      totalPrice: totalPriceNum,
    });
    const savedOrder = await newOrder.save();
    if (!savedOrder) {
      const err = new Error("Failed to create order");
      err.statusCode = 500;
      return next(err);
    }
    res.status(201).json(savedOrder);
  } catch (err) {
    next(err);
  }
};

// update order by order id
const updateOrderByOrderId = async (req, res) => {
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
    } = req.body;

    const foundOrder = await Order.findById({ _id: id }).exec();
    if (!foundOrder) {
      const err = new Error("Not found Order with order id " + id);
      err.statusCode = 404;
      return next(err);
    }

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

    const detailFormat = detail.map((item, idx) => {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        throw new Error(`detail[${idx}].product must be a valid ObjectId`);
      }
      const productID = String(item.productID);
      const productName = String(item.productName);
      const productImg = String(item.productImg);
      const typeProduct = String(item.typeProduct);
      const quantity = Number(item.quantity);
      const discount = Number(item.discount ?? 0);
      const size = String(item.size.toUpperCase());
      const color = String(item.color);
      const price = Number(item.price);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(`detail[${idx}].quantity must be a positive number`);
      }
      if (!Number.isFinite(discount) || discount < 0) {
        throw new Error(
          `detail[${idx}].discount must be a non-negative number`
        );
      }
      if (!Number.isFinite(price) || price < 0) {
        throw new Error(`detail[${idx}].price must be a non-negative number`);
      }
      return {
        ...item,
        productID,
        productName,
        productImg,
        typeProduct,
        quantity,
        discount,
        size,
        color,
        price,
      };
    });
    const updatedOrder = {
      totalItem: totalItemNum,
      detail: detailFormat,
      deliverAddress: deliverAddressStr,
      subTotal: subTotalNum,
      shippingPrice: shippingPriceNum,
      taxPrice: taxPriceNum,
      discount: discountNum,
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
const deleteOrderByOrderId = async (req, res) => {
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
