const express = require("express");
const router = express.Router(); // router instance
const registerController = require("../controllers/registerController.js");

// we have many way to write it
// one file handler
/*
router
  .route("/")
  .get((req, res) => {})
  .post((req, res) => {})
  .put((req, res) => {})
  .delete((req, res) => {});
*/

// mvc model
router.post("/", registerController.registerUser);

module.exports = router;
