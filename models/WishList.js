const mongoose = require("mongoose");
const { Product } = require("./Product.js");
const wishlistSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  totalItem: {
    type: Number,
    required: true,
    default: 0,
  },
  detail: {
    type: {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      // productName: { type: String, required: true },
      // productImg: { type: String },
      // typeProduct: {
      //   type: String,
      //   enum: ["earring", "necklace", "ring", "bracelet"],
      // },
      // discount: {
      //   type: Number,
      //   default: 0,
      // },
      // inStock: {
      //   type: Boolean,
      //   required: true,
      // },
      // quantity: { type: Number, required: true, min: 1 },
      // size: { type: String, enum: ["S", "M", "L", "XL"], required: true },
      // color: { type: String, required: true },
      // price: { type: Number, required: true, min: 0 },
      // total: { type: Number, required: true, min: 0 },
    },

    required: true,
  },
  // totalPrice just all price of (product *quantity) - discount of product only not additional discount coupon or code
  // totalPrice: {
  //   type: Number,
  //   min: 0,
  //   required: true,
  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = { Wishlist };
