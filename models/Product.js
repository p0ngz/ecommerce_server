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
    enum: [
      "earring",
      "necklace",
      "ring",
      "bracelet",
      "gold jewels",
      "pendants",
    ],
    required: [true, "typeProduct is required"],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  description: {
    type: String,
    required: [true, "description is required"],
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  price: {
    type: Number,
    required: [true, "price is required"],
    min: 0,
  },
  variants: [
    {
      color: {
        type: String,
        required: [true, "variants color is required"],
        set: (v) => v.toLowerCase(),
      },
      size: {
        type: String,
        enum: ["S", "M", "L", "XL"],
        required: [true, "variants size is required"],
        set: (v) => v.toUpperCase(),
      },
      inStock: {
        type: Number,
        default: 1,
      },
      sellingAmount: {
        type: Number,
        default: 0,
      },
    },
  ],
  inStock: {
    type: Number,
    default: function () {
      return this.variants.reduce(
        (acc, variant) => Number(acc) + Number(variant.inStock),
        0
      );
    },
  },
  sellingAmountTotal: {
    type: Number,
    default: function () {
      return this.variants.reduce(
        (acc, variant) => Number(acc) + Number(variant.sellingAmount),
        0
      );
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically update inStock when variants change
productSchema.pre("save", function (next) {
  if (this.variants && this.variants.length > 0) {
    this.inStock = this.variants.reduce(
      (acc, variant) => Number(acc) + Number(variant.inStock || 0),
      0
    );
    this.sellingAmountTotal = this.variants.reduce(
      (acc, variant) => Number(acc) + Number(variant.sellingAmount || 0),
      0
    );
  }
  next();
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

// check stock handler
productSchema.statics.checkStock = async function (
  productId,
  color,
  size,
  quantity
) {
  const product = await this.findById(productId);
  if (!product) {
    throw new Error(`Product id ${productId} not found`);
  }
  const variant = product.variants.find(
    (variant) => variant.color === color && variant.size === size
  );
  if (!variant) {
    throw new Error(`Variant ${color}/${size} not found`);
  }
  return variant && variant.inStock >= quantity;
};
// update Stock and sellingAmount product
productSchema.statics.updateProductStock = async function (
  productId,
  color,
  size,
  quantity
) {
  const product = await this.findById(productId);
  if (!product) {
    throw new Error(`Product id ${productId} not found`);
  }

  const variant = product.variants.find(
    (variant) => variant.color === color && variant.size === size
  );
  if (!variant) {
    throw new Error(`Variant ${color}/${size} not found`);
  }
  variant.inStock -= quantity;
  variant.sellingAmount += quantity;
  await product.save();

  return product;
};

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };
