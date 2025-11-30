const { Product } = require("../model/Product.js");
const path = require("path");
const fs = require("fs");

// get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().exec();
    if (!products)
      return res.status(404).json({ message: "No products found" });

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// get product by id
const getProductById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id)
      return res.status(400).json({ message: "id parameter is required" });
    const product = await Product.findById({ _id: id }).exec();
    if (!product)
      return res
        .status(404)
        .json({ message: "No product found with id: " + id });

    return res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product by id:", err);
    return res.status(500).json({ message: "Internal server error" });
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
    if (duplicateProduct)
      return res.status(409).json({ message: "Product name already exists" });

    if (
      !productName ||
      !typeProduct ||
      !color ||
      !description ||
      !price ||
      !size
    ) {
      return res.status(400).json({
        message:
          "productName, productImage, typeProduct, color, description, price and size are required",
      });
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
      return res.status(500).json({ message: "Failed to create new product" });
    }
    res
      .status(200)
      .json({ message: "Created new product successfully", newProduct });
  } catch (err) {
    console.error("Error creating new product: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// update product
const updateProductById = async (req, res) => {
  try {
    const id = req.params.id;
    let productImagePath;
    if (!id)
      return res.status(400).json({ message: "id parameter is required" });

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
      }
    );
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Not found product with id: " + id });
    }
    res
      .status(200)
      .json({ message: "Updated product successfully", updatedProduct });
  } catch (err) {
    console.error("Error updating product with od: ", id);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// delete product
const deleteProductById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "id parameter is required" });
    }

    const deletedProduct = await Product.findByIdAndDelete({ _id: id });
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ message: "Not found product with id: " + id });
    }

    res
      .status(200)
      .json({ message: "Deleted product successfully", deletedProduct });
  } catch (err) {
    console.error("Error deleting product by id:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// get product by types
// earring, necklace, ring, bracelet
const getProductByType = async (req, res) => {
  try {
    const type = req.params.type;
    if (!type) {
      return res.status(400).json({ message: "type product is required" });
    }
    const formatType = type.toLowerCase();
    const productFromType = await Product.find({ typeProduct: formatType });
    if (!productFromType || productFromType.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for type: " + type });
    }
    return res.status(200).json(productFromType);
  } catch (err) {
    console.error("Error get product by type:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getNewestProduct = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    if (!limit) {
      // query all products
      const newestProduct = await Product.find({})
        .sort({ createdAt: -1 })
        .exec();
      if (!newestProduct || newestProduct.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }

      return res
        .status(200)
        .json({ limit: newestProduct.length, data: newestProduct });
    } else {
      // query from limit
      const newestProduct = await Product.find({})
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .exec();

      if (!newestProduct || newestProduct.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }

      return res.status(200).json({ limit, data: newestProduct });
    }
  } catch (err) {
    console.error("Error get newest product:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getTopProduct = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    if (!limit) {
      // query all products
      const topProduct = await Product.find({})
        .sort({ sellingAmount: -1 })
        .exec();

      if (!topProduct || topProduct.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }

      return res
        .status(200)
        .json({ limit: topProduct.length, data: topProduct });
    } else {
      // query from limit
      const topProduct = await Product.find({})
        .sort({ sellingAMount: -1 })
        .limit(parseInt(limit))
        .exec();

      if (!topProduct || topProduct.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }

      return res.status(200).json(topProduct);
    }
  } catch (err) {
    console.error("Error get top product:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTopRatingProduct = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    if (!limit) {
      const ratingProduct = await Product.find({}).sort({ rating: -1 }).exec();
      if (!ratingProduct || ratingProduct.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }
      return res
        .status(200)
        .json({ limit: ratingProduct.length, data: ratingProduct });
    } else {
      const ratingProduct = await Product.find({})
        .sort({ rating: -1 })
        .limit(parseInt(limit))
        .exec();
      if (!ratingProduct || ratingProduct.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }
      return res.status(200).json({ limit, data: ratingProduct });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const updateProductImageById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "id parameter is required" });
    }
    const productById = await Product.findById(
      { _id: id },
      { productName: 1, productImg: 1 }
    ).exec();
    if (!productById) {
      return res
        .status(404)
        .json({ message: "No product found with id: " + id });
    }
    if (!req.file) {
      return res.status(400).json({ message: "productImg file is required" });
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
    console.error("Error updating product image by id:", err);
    return res.status(500).json({ message: "Internal server error" });
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
