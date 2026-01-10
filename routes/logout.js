const express = require("express");
const router = express.Router();

const logOutController = require("../controllers/logOutController");

router.post("/", logOutController.handleLogout);

module.exports = router;
