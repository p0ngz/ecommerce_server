const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController.js");
const { createUploader } = require("../middleware/createUploader.js");
const { removeImageOnError } = require("../middleware/removeImage.js");
const blogUploader = createUploader("blogs", /jpeg|jpg|png|webp/, 10);
router
  .route("/")
  .get(blogController.getAllBlogs)
  .post(blogUploader.single("blogImg"), blogController.createBlog);

router
  .route("/:id")
  .get(blogController.getBlogById)
  .put(blogUploader.single("blogImg"), blogController.updateBlogById)
  .delete(blogController.deleteBlogById);

router.use(removeImageOnError);

module.exports = router;
