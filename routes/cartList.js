const express = require("express");
const router = express.Router();
const cartListController = require("../controllers/cartListController.js");

router.route("/").get(cartListController.getAllCartLists);
router
  .route("/:id")
  .get(cartListController.getCartListByICartListId)
  .delete(cartListController.deleteCartListByCartListId);

router
  .route("/user/:userId")
  .get(cartListController.getCartListByUserId)
  .post(cartListController.createOrUpdateCartListByUserId)
  .delete(cartListController.deleteCartListByUserId);

// router
//   .route("/cartList/:id")
//   .delete(cartListController.deleteCartListByCartListId);
module.exports = router;
