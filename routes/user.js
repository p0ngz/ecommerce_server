const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
// const uploadUser = require("../middleware/uploadUser.js");
const { createUploader } = require("../middleware/createUploader.js")
const userUploader = createUploader("users", /jpeg|jpg|png|/, 5);
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUSerById)
  .put(userUploader.single("information[userImage]"), userController.updateUser)
  .delete(userController.deleteUserById);

module.exports = router;
