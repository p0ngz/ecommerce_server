const express = require("express");
const router = express.Router(); // router instance
const registerController = require("../controllers/registerController.js");

// mvc model
router.post("/", registerController.registerUser);

module.exports = router;
