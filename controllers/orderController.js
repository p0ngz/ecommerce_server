const { Order } = require("../models/Order");

// get all orders
const getAllOrders = async (req, res) => {
  const orders = await Order.find();
  if (!orders) return res.status(204).json({ message: "Order not found" });

  res.status(200).json(orders);
};

// get order by order id
const getOrderByOrderId = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res.status(400).json({ message: "id parameter is required" });

    const foundOrder = await Order.findById({ _id: id }).exec();
    if (!foundOrder) {
      return res
        .status(204)
        .json({ message: "Not found Order with order id" + id });
    }

    return res.status(200).json(foundOrder);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
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
      return res.status(400).json({
        message:
          "userID, totalItem, detail, deliverAddress, subTotal and totalPrice are required",
      });
    }

    const newOrder = new Order({
      userID,
      totalItem,
      detail,
      deliverAddress,
      subTotal,
      shippingPrice,
      taxPrice,
      discount,
      totalPrice,
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// update order by order id
const updateOrderByOrderId = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "id parameter is required" });
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
    if (!foundOrder)
      return res
        .status(204)
        .json({ message: "Not found Order with order id " + id });
    const updatedOrder = {
      totalItem,
      detail,
      deliverAddress,
      subTotal,
      shippingPrice,
      taxPrice,
      discount,
      totalPrice,
    };
    
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// delete order by order id
const deleteOrderByOrderId = async (req, res) => {};

module.exports = {
  getAllOrders,
  getOrderByOrderId,
  createOrder,
  updateOrderByOrderId,
  deleteOrderByOrderId,
};
