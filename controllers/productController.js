const { Product } = require("../models/Product.js");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// get all products
const getAllProducts = async (req, res) => {
  /*
    - typeProduct
    - available
    - price
      - priceMin
      - priceMax
    - color
    - search
    - from
    - to
    - page: 1
    - limit: 10
    - sort : -createdAt 
   */
  try {
    const {
      typeProduct,
      available,
      priceMin = 0,
      priceMax,
      color,
      search,
      from = new Date("2025-11-26"), // createdAt from (ISO date)
      to = new Date(), // createdAt to (ISO date)
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const query = {};
    if (typeProduct) {
      query.typeProduct = typeProduct.toLowerCase();
    }
    if (available) {
      query.inStock = { $gt: 0 };
    }
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }
    if (Array.isArray(color) && color.length > 0) {
      query.color = { $in: color.map((color) => color.toLowerCase()) };
    }
    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

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

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortSpec).skip(skip).limit(limitNum).exec(),
      Product.countDocuments(query).exec(),
    ]);

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
const getProductById = async (req, res) => {
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
const createNewProduct = async (req, res) => {
  try {
    const {
      productName,
      typeProduct,
      rating,
      color,
      description,
      inStock,
      discount,
      size,
      price,
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

    if (
      !productName ||
      !typeProduct ||
      !color ||
      !description ||
      !price ||
      !size
    ) {
      const err = new Error(
        "productName, productImage, typeProduct, color, description, price and size are required"
      );
      err.statusCode = 400;
      return next(err);
    }
    const formatColor = color.map((color) => {
      return color.toLowerCase();
    });
    const formatSize = size.map((size) => {
      return size.toUpperCase();
    });
    if (req.file) {
      productImagePath = "/uploads/products/" + req.file.filename;
    }
    const newProduct = new Product({
      productName,
      productImg: productImagePath,
      typeProduct,
      rating,
      color: formatColor,
      description,
      inStock,
      discount,
      size: formatSize,
      price,
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
const updateProductById = async (req, res) => {
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
    const {
      productName,
      typeProduct,
      rating,
      color,
      description,
      inStock,
      discount,
      size,
      price,
    } = req.body;
    const formatColor = color.map((color) => {
      return color.toLowerCase();
    });
    const formatSize = size.map((size) => {
      return size.toUpperCase();
    });
    if (req.file) {
      productImagePath = "uploads/products/" + req.file.filename;
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          productName: productName || foundProduct.productName,
          productImg: productImagePath || foundProduct.productImg,
          typeProduct: typeProduct || foundProduct.typeProduct,
          rating: rating || foundProduct.rating,
          color: formatColor || foundProduct.color,
          description: description || foundProduct.description,
          inStock: inStock || foundProduct.inStock,
          discount: discount || foundProduct.discount,
          size: formatSize || foundProduct.size,
          price: price || foundProduct.price,
        },
      },
      { new: true, runValidator: true }
    );
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

// delete product
const deleteProductById = async (req, res) => {
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
      .json({ message: "Deleted product successfully", deletedProduct });
  } catch (err) {
    next(err);
  }
};

// get product by types
// earring, necklace, ring, bracelet
const getProductByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!type || type === ":type") {
      const err = new Error("type parameter is required");
      err.statusCode = 400;
      return next(err);
    }
    const formatType = type.toLowerCase();
    const productFromType = await Product.find({ typeProduct: formatType });
    if (!productFromType || productFromType.length === 0) {
      const err = new Error("No products found for type: " + type);
      err.statusCode = 404;
      return next(err);
    }
    return res.status(200).json(productFromType);
  } catch (err) {
    next(err);
  }
};
const getNewestProduct = async (req, res) => {
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
const getTopProduct = async (req, res) => {
  try {
    const { limit } = req.query;
    const limitNum = parseInt(limit);
    if (!limitNum) {
      // query all products
      const topProduct = await Product.find({})
        .sort({ sellingAmount: -1 })
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

const getTopRatingProduct = async (req, res) => {
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
const updateProductImageById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }
    const productById = await Product.findById(id, {
      productName: 1,
      productImg: 1,
    }).exec();
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
  getProductByType,
  getNewestProduct,
  getTopProduct,
  getTopRatingProduct,
  updateProductImageById,
};
