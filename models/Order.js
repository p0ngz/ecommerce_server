const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const { generateID } = require("../utils/generateID.js");

const orderSchema = new mongoose.Schema({
  orderID: { type: String, unique: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  trackingNumber: {
    type: String,
    unique: true,
  },
  totalItem: { type: Number, required: true, min: 1 },
  detail: [
    // in mongoose always generate _id for subDocument array
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productID: { type: String, required: true },
      productName: { type: String, required: true },
      productImg: { type: String },
      typeProduct: {
        type: String,
        enum: ["earring", "necklace", "ring", "bracelet"],
      },
      quantity: { type: Number, required: true, min: 1 },
      discount: {
        type: Number,
        default: 0,
      },
      size: { type: String, enum: ["S", "M", "L", "XL"] },
      color: { type: String },
      price: { type: Number, required: true, min: 0 },
    },
  ],
  deliverAddress: { type: String, required: true },
  status: {
    pass: {
      type: [String],
      enum: ["orderPlaced", "processing", "shipped", "delivered"],
      default: ["orderPlaced"],
    },
    current: {
      type: [String],
      enum: ["orderPlaced", "processing", "shipped", "delivered"],
    },
  },
  cancel: { type: Boolean, default: false },
  subTotal: { type: Number, required: true, min: 0 },
  shippingPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
  taxPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
  discount: {
    percent: { type: Number, default: 0, min: 0, max: 100 },
    amount: { type: Number, default: 0, min: 0 },
  },
  totalPrice: { type: Number, required: true, min: 0 },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

orderSchema.pre("save", async function (next) {
  if (!this.trackingNumber) {
    this.trackingNumber = nanoid(10);
  }
  if (!this.orderID) {
    try {
      const Order = this.constructor;
      const lastOrder = await Order.findOne({}, { orderID: 1 })
        .sort({ orderID: -1 })
        .lean();
      if (lastOrder && lastOrder.orderID) {
        this.orderID = generateID("ORD", lastOrder.orderID, 5);
      } else {
        this.orderID = "ORD-00001";
      }
    } catch (err) {
      return next(err);
    }
  }
});
const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };
