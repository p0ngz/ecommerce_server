const mongoose = require("mongoose");
const { generateID } = require("../utils/generateID");
const productSchema = new mongoose.Schema({
  productID: {
    type: String,
    unique: true,
  },
  productName: {
    type: String,
    required: [true, "productName is required"],
  },
  productImg: {
    type: String,
    required: [true, "productImage is required"],
  },
  typeProduct: {
    type: String,
    enum: ["earring", "necklace", "ring", "bracelet"],
    required: [true, "typeProduct is required"],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  color: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    required: [true, "description is required"],
  },
  inStock: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  size: {
    type: [String],
    enum: ["S", "M", "L", "XL"],
  },
  price: {
    type: Number,
    required: [true, "price is required"],
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// auto-generate productID function
productSchema.pre("save", async function (next) {
  if (!this.productID) {
    try {
      const Product = this.constructor;
      // find one document bo filter and just show productID field and sort from max to min and lean to not create mongoose document object just plain javascript object
      const lastProduct = await Product.findOne({}, { productID: 1 })
        .sort({ productID: -1 })
        .lean();
      console.log("lastProduct: ", lastProduct);
      if (lastProduct && lastProduct.productID) {
        this.productID = generateID("PROD", lastProduct.productID, 3);
      } else {
        this.productID = "PROD-001";
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };
