const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController.js");
router
  .route("/")
  .get(wishlistController.getAllWishList)
  .post(wishlistController.createWishList);

// 1user -> 1 wishlist -> many products

router
  .route("/user/:userId")
  .get(wishlistController.getWishListByUserId)
  // .put(wishlistController.updateWishListByWishlistId)
  .delete(wishlistController.deleteWishlistByUserId);
router
  .route("/user/:userId/product/:productId")
  .delete(wishlistController.deleteWishlistByUserIdAndProductId);
module.exports = router;
