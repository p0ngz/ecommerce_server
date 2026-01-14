const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController.js");

router
  .route("/")
  .get(orderController.getAllOrders)
  .post(orderController.createOrder);

router
  .route("/:id")
  .get(orderController.getOrderByOrderId)
  .put(orderController.updateOrderByOrderId)
  .delete(orderController.softDeleteOrderByOrderId); //soft

router.route("/:id/hard").delete(orderController.hardDeleteOrderByOrderId); // ahrd delete

router.route("/:id/status").put(orderController.updateOrderStatus);
module.exports = router;
