const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, enum: ["S", "M", "L", "XL"], required: true },
  color: { type: String, required: true },
  total: { type: Number, required: true, min: 0 }, // (price - discount) * quantity
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CartList = mongoose.model("CartList", cartSchema);

module.exports = { CartList };
