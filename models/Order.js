const mongoose = require("mongoose");
const { User } = require("./User.js");
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
  paymentMethod: {
    type: String,
    enum: ["credit card", "paypal", "bank transfer", "cash"],
    required: true,
    set: function (value) {
      const allowed = ["credit card", "paypal", "bank transfer", "cash"];
      if (!allowed.includes(value)) {
        throw new Error("Invalid payment method");
      }
      return value;
    },
    default: "cash",
  },
  detail: [
    // in mongoose always generate _id for subDocument array
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      color: {
        type: String,
        required: [true, "color when chosen product is required"],
      },
      size: {
        type: String,
        enum: ["S", "M", "L", "XL"],
        required: [true, "size when chosen product is required"],
      },
      quantity: { type: Number, required: true, min: 1 },
      discountProduct: { type: Number, default: 0, min: 0, max: 100 }, // discount of product at the time of order
      price: { type: Number, required: true, min: 0 }, //price * quantity
      totalPrice: { type: Number, required: true, min: 0 }, // price after discountProduct applied
    },
  ],
  deliverAddress: {
    address: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    tel: {
      type: String,
      required: true,
      default: async function () {
        const userTel = await User.findById(this.userID)
          .select("information.phone")
          .lean();
        console.log("userTel:", userTel);
        return userTel;
      },
    },
    email: {
      type: String,
      required: true,
      default: async function () {
        const userEmail = await User.findById(this.userID)
          .select("email")
          .lean();
        console.log("userEmail:", userEmail);
        return userEmail;
      },
    },
  },
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
  subTotal: {
    type: Number,
    required: true,
    min: 0,
    default: function () {
      return this.detail.reduce((acc, item) => acc + item.price, 0);
    },
  },
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
    discountValue: {
      type: Number,
      default: function () {
        if (this.discount.percent > 0) {
          return Number((this.subTotal * this.discount.percent) / 100).toFixed(
            2
          );
        }
        if (this.discount.amount > 0) {
          return Number(this.discount.amount).toFixed(2);
        }
        return 0;
      },
    },
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
    default: function () {
      if (this.discount.percentage > 0) {
        const discountAmount = (this.subTotal * this.discount.percent) / 100;
        return Number(
          this.subTotal - discountAmount + this.shippingPrice + this.taxPrice
        ).toFixed(2);
      }
      if (this.discount.amount > 0) {
        return Number(
          this.subTotal -
            this.discount.amount +
            this.shippingPrice +
            this.taxPrice
        ).toFixed(2);
      }
    },
  },
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
