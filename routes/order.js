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
  .delete(orderController.deleteOrderByOrderId);

module.exports = router;
