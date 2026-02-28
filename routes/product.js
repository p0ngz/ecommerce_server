const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { createUploader } = require("../middleware/createUploader.js");
const productUploader = createUploader("products", /jpeg|jpg|png|webp/, 5);
router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    productUploader.single("productImg"),
    productController.createNewProduct
  );

// router.get("/type/:type", productController.getProductByType);
router.get("/type", productController.getTypeProduct);
router.get("/newest", productController.getNewestProduct);
router.get("/top", productController.getTopProduct);
router.get("/rating", productController.getTopRatingProduct);
router.put(
  "/:id/image",
  productUploader.single("productImg"),
  productController.updateProductImageById
);

router
  .route("/:id")
  .get(productController.getProductById)
  .put(
    productUploader.single("productImg"),
    productController.updateProductById
  )
  .delete(productController.deleteProductById);

router.delete("/:id/hard", productController.hardDeleteProductById);


module.exports = router;
