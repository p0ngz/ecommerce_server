const mongoose = require("mongoose");
const { generateID } = require("../utils/generateID");
const blogSchema = new mongoose.Schema({
  blogID: {
    type: Number,
    unique: true,
  },
  blogName: {
    type: String,
    required: true,
  },
  blogImg: {
    type: String,
    required: true,
  },
  blogTitle: {
    type: String,
    required: true,
  },
  blogType: {
    type: String,
    enum: ["accessory", "bling chronicle", "jewelry", "news"],
    require: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
  },
});

// auto generate blog ID
blogSchema.pre("save", async function (next) {
  if (!this.blogID) {
    const Blog = this.constructor;
    const lastBlog = await Blog.findOne({}, { blogID: 1 })
      .sort({ blogID: -1 })
      .lean();

    if (lastBlog && lastBlog.blogID) {
      this.blogID = generateID("BLOG", lastBlog.blogID, 4);
    } else {
      this.blogID = `BLOG-0001`;
    }
    try {
    } catch (err) {
      return next(err);
    }
  }
});
const Blog = mongoose.model("Blog", blogSchema);

module.exports = { Blog };
