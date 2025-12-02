const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  totalItem: {
    type: Number,
    require: true,
    default: 0,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = { Wishlist };
