const { Product } = require("../models/Product.js");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// get all products
const getAllProducts = async (req, res, next) => {
  try {
    const {
      typeProduct,
      priceMin = 0,
      priceMax,
      color,
      size,
      inStock,
      search,
      from, // createdAt from (ISO date) - no default
      to, // createdAt to (ISO date) - no default
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const query = {};
    if (typeProduct) {
      query.typeProduct = typeProduct.toLowerCase();
    }

    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    if (Array.isArray(color) && color.length > 0) {
      query["variants.color"] = {
        $in: color.map((color) => color.toLowerCase()),
      };
    }
    const colors =
      Array.isArray(color) && color.length > 0
        ? color.map((c) => c.toLowerCase())
        : color
        ? [color.toLowerCase()]
        : null;
    const sizes =
      Array.isArray(size) && size.length > 0
        ? size.map((s) => s.toUpperCase())
        : size
        ? [size.toUpperCase()]
        : null;

    if (inStock) {
      query["variants.inStock"] = { $gte: 0 };
    }
    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    const inStockNum = inStock !== undefined ? Number(inStock) : null;
    const pageRaw = typeof page === "string" ? page.trim() : page;
    const limitRaw = typeof limit === "string" ? limit.trim() : limit;
    const pageParsed = Number(pageRaw);
    const limitParsed = Number(limitRaw);

    const pageNum =
      Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;
    const limitNum =
      Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : 10;
    const skip = pageNum > 0 ? (pageNum - 1) * limitNum : 0;
    const sortSpec =
      typeof sort === "string" && sort.trim() !== ""
        ? sort.trim()
        : "-createdAt";
    const matchStage = { $match: query };
    const projectStage = {
      $project: {
        productID: 1,
        productName: 1,
        productImg: 1,
        typeProduct: 1,
        rating: 1,
        price: 1,
        discount: 1,
        createdAt: 1,

        variants: {
          $filter: {
            input: "$variants",
            as: "v",
            cond: {
              $and: [
                ...(colors ? [{ $in: ["$$v.color", colors] }] : []),
                ...(sizes ? [{ $in: ["$$v.size", sizes] }] : []),
                ...(inStockNum !== null
                  ? [{ $gte: ["$$v.inStock", inStockNum] }]
                  : []),
              ],
            },
          },
        },
      },
    };
    const sortStage = {
      $sort: sortSpec.startsWith("-")
        ? { [sortSpec.slice(1)]: -1 }
        : { [sortSpec]: 1 },
    };

    const skipStage = { $skip: skip };
    const limitStage = { $limit: limitNum };
    const pipeline = [
      matchStage,
      projectStage,
      sortStage,
      skipStage,
      limitStage,
    ];
    const [products, totalResult] = await Promise.all([
      Product.aggregate(pipeline),
      Product.aggregate([matchStage, { $count: "total" }]),
    ]);
    console.log("products: ", products);
    console.log("totalResult: ", totalResult);
    const total = totalResult[0]?.total || 0;
    if (!products || products.length === 0) {
      const err = new Error("No Products found");
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({
      count: products.length,
      total,
      page: pageNum,
      limit: limitNum,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// get product by id
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid product id format");
      err.statusCode = 400;
      return next(err);
    }
    const foundProduct = await Product.findById({ _id: id }).exec();
    if (!foundProduct) {
      const err = new Error("No product found with id: " + id);
      err.statusCode = 404;
      return next(err);
    }

    return res.status(200).json(foundProduct);
  } catch (err) {
    next(err);
  }
};

// create new product
const createNewProduct = async (req, res, next) => {
  try {
    const {
      productName,
      typeProduct,
      rating,
      description,
      discount,
      price,
      variants: variantsParse,
    } = req.body;
    let productImagePath;
    const duplicateProduct = await Product.findOne({
      productName: productName,
    }).exec();
    if (duplicateProduct) {
      const err = new Error("Product name already exists");
      err.statusCode = 409;
      return next(err);
    }

    if (!productName || !typeProduct || !description || !price) {
      const err = new Error(
        "productName, productImage, typeProduct,  description, and price  are required"
      );
      err.statusCode = 400;
      return next(err);
    }
    const variants = JSON.parse(variantsParse);
    const variantsFormat = variants.map((variant) => {
      if (!variant.color || !variant.size) {
        const err = new Error("variants color and variants size are required");
        err.statusCode = 400;
        throw err;
      }
      if (variant.inStock < 0) {
        const err = new Error(
          "variants inStock must be greater than or equal to 0"
        );
        err.statusCode = 400;
        throw err;
      }
      return variant;
    });
    if (req.file) {
      productImagePath = "/uploads/products/" + req.file.filename;
    }
    const newProduct = new Product({
      productName,
      productImg: productImagePath,
      typeProduct,
      rating,
      description,
      discount,
      price,
      variants: variantsFormat,
    });
    const savedProduct = await newProduct.save();
    if (!savedProduct) {
      const err = new Error("Failed to create new product");
      err.statusCode = 500;
      return next(err);
    }
    res
      .status(200)
      .json({ message: "Created new product successfully", newProduct });
  } catch (err) {
    next(err);
  }
};

// update product
const updateProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let productImagePath;
    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid product id format");
      err.statusCode = 400;
      return next(err);
    }
    const foundProduct = await Product.findById({ _id: id }).exec();
    if (!foundProduct) {
      const err = new Error("Not found product with id: " + id);
      err.statusCode = 404;
      return next(err);
    }
    const {
      productName,
      typeProduct,
      rating,
      description,
      discount,
      price,
      variants: variantsParse,
    } = req.body;
    if (req.file) {
      productImagePath = "uploads/products/" + req.file.filename;
    }
    const variants = JSON.parse(variantsParse);
    const variantsFormat = variants.map((variant) => {
      if (!variant.color || !variant.size) {
        const err = new Error("variants color and variants size are required");
        err.statusCode = 400;
        throw err;
      }
      if (variant.inStock < 0) {
        const err = new Error(
          "variants inStock must be greater than or equal to 0"
        );
        err.statusCode = 400;
        throw err;
      }
      return variant;
    });

    // update field like this better than use set if we have some field in model that automatic change when save
    if (productName) foundProduct.productName = productName;
    if (productImagePath) foundProduct.productImg = productImagePath;
    if (typeProduct) foundProduct.typeProduct = typeProduct;
    if (rating !== undefined) foundProduct.rating = rating;
    if (description) foundProduct.description = description;
    if (discount !== undefined) foundProduct.discount = discount;
    if (price !== undefined) foundProduct.price = price;
    if (variantsFormat) foundProduct.variants = variantsFormat;

    // Save (this triggers the pre-save hook that calculates inStock)
    const updatedProduct = await foundProduct.save();
    if (!updatedProduct) {
      const err = new Error("Not found product with id: " + id);
      err.statusCode = 404;
      return next(err);
    }
    res
      .status(200)
      .json({ message: "Updated product successfully", updatedProduct });
  } catch (err) {
    next(err);
  }
};
// soft delete product
const deleteProductById = async (req, res, next) => {
  try {
    const { id } = req?.params;
    const { userId } = req.body;

    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid product id format");
      err.statusCode = 400;
      return next(err);
    }
    const idUserDeleteProduct = await User.findById(userId, { _id: 1 }).exec();
    if (!idUserDeleteProduct) {
      const err = new Error("User not found to delete product");
      err.statusCode = 404;
      return next(err);
    }
    const updateDeleteProduct = {
      isDeleted: true,
      deletedBy: idUserDeleteProduct._id,
      deletedAt: new Date(),
    };
    const updatedDeleteProduct = await Product.findByIdAndUpdate(
      { _id: id },
      updateDeleteProduct,
      { new: true }
    ).exec();
    if (!updatedDeleteProduct) {
      const err = new Error("Not found product with id: " + id);
      err.statusCode = 404;
      return next(err);
    }
    res
      .status(200)
      .json({ message: `Product id ${id} is soft deleted successfully` });
  } catch (err) {
    next(err);
  }
};
// hard delete product
const hardDeleteProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }

    const deletedProduct = await Product.findByIdAndDelete({ _id: id });
    if (!deletedProduct) {
      const err = new Error("Not found product with id: " + id);
      err.statusCode = 404;
      return next(err);
    }

    res
      .status(200)
      .json({ message: "Deleted(hard) product successfully", deletedProduct });
  } catch (err) {
    next(err);
  }
};

// get product by types
// earring, necklace, ring, bracelet
// const getProductByType = async (req, res, next) => {
//   try {
//     const { type } = req.params;
//     if (!type || type === ":type") {
//       const err = new Error("type parameter is required");
//       err.statusCode = 400;
//       return next(err);
//     }
//     const formatType = type.toLowerCase();
//     const productFromType = await Product.find({ typeProduct: formatType });
//     if (!productFromType || productFromType.length === 0) {
//       const err = new Error("No products found for type: " + type);
//       err.statusCode = 404;
//       return next(err);
//     }
//     return res.status(200).json(productFromType);
//   } catch (err) {
//     next(err);
//   }
// };
const getNewestProduct = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const limitNum = parseInt(limit);
    if (!limitNum) {
      // query all products
      const newestProduct = await Product.find({})
        .sort({ createdAt: -1 })
        .exec();
      if (!newestProduct || newestProduct.length === 0) {
        const err = new Error("No products found");
        err.statusCode = 404;
        return next(err);
      }

      return res
        .status(200)
        .json({ limit: newestProduct.length, data: newestProduct });
    } else {
      // query from limit
      const newestProduct = await Product.find({})
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .exec();

      if (!newestProduct || newestProduct.length === 0) {
        const err = new Error("No products found");
        err.statusCode = 404;
        return next(err);
      }

      return res.status(200).json({ limit, data: newestProduct });
    }
  } catch (err) {
    next(err);
  }
};
const getTopProduct = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const limitNum = parseInt(limit);
    if (!limitNum) {
      // query all products
      const topProduct = await Product.find({})
        .sort({ sellingAmountTotal: -1 })
        .exec();

      if (!topProduct || topProduct.length === 0) {
        const err = new Error("No products found");
        err.statusCode = 404;
        return next(err);
      }

      return res
        .status(200)
        .json({ limit: topProduct.length, data: topProduct });
    } else {
      // query from limit
      const topProduct = await Product.find({})
        .sort({ sellingAMount: -1 })
        .limit(limitNum)
        .exec();

      if (!topProduct || topProduct.length === 0) {
        const err = new Error("No products found");
        err.statusCode = 404;
        return next(err);
      }

      return res.status(200).json(topProduct);
    }
  } catch (err) {
    next(err);
  }
};

const getTopRatingProduct = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const limitNum = parseInt(limit);
    if (!limitNum) {
      const ratingProduct = await Product.find({}).sort({ rating: -1 }).exec();
      if (!ratingProduct || ratingProduct.length === 0) {
        const err = new Error("No products found");
        err.statusCode = 404;
        return next(err);
      }
      return res
        .status(200)
        .json({ limit: ratingProduct.length, data: ratingProduct });
    } else {
      const ratingProduct = await Product.find({})
        .sort({ rating: -1 })
        .limit(limitNum)
        .exec();
      if (!ratingProduct || ratingProduct.length === 0) {
        const err = new Error("No products found");
        err.statusCode = 404;
        return next(err);
      }
      return res.status(200).json({ limit, data: ratingProduct });
    }
  } catch (err) {
    next(err);
  }
};
const updateProductImageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }
    const productById = await Product.findById(id).exec();
    if (!productById) {
      const err = new Error("No product found with id: " + id);
      err.statusCode = 404;
      return next(err);
    }
    if (!req.file) {
      const err = new Error("productImg file is required");
      err.statusCode = 400;
      return next(err);
    }
    const oldImagePath = path.join(
      __dirname,
      "..",
      "public",
      productById.productImg
    );
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
    const newProductImagePath = "/uploads/products/" + req.file.filename;
    productById.productImg = newProductImagePath;
    await productById.save();

    return res.status(200).json({
      message: "Product image updated successfully",
      product: {
        id: productById._id,
        productName: productById.productName,
        productImg: productById.productImg,
      },
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getAllProducts,
  getProductById,
  createNewProduct,
  updateProductById,
  deleteProductById,
  // getProductByType,
  getNewestProduct,
  getTopProduct,
  getTopRatingProduct,
  updateProductImageById,
  hardDeleteProductById,
};
