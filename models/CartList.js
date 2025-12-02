const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  cartName: {
    type: String,
  },
  detail: [
    {
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
      inStock: {
        type: Boolean,
        required: true,
      },
      size: { type: String },
      color: { type: String },
      price: { type: Number, required: true, min: 0 },
    },
  ],
  subTotal: {
    type: Number,
    require: true,
  },
  shippingPrice: {
    type: Number,
    min: 0,
  },
  taxPrice: {
    type: Number,
    min: 0
  },
  totalPrice: {
    type: Number,
    min: 0,
    require: true
  }
});

const CartList = mongoose.model("CartList", cartSchema);

module.exports = { CartList };
