const { Blog } = require("../models/Blog.js");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const getAllBlogs = async (req, res) => {
  try {
    const {
      from = new Date("2025-11-26"),
      to = new Date(),
      search,
      sort = "-createdAt",
      page = 1,
      limit = 5,
    } = req.query;

    let query = {};
    if (from || to) {
      query.createdAt = {};
      //db.blogs.find({createdAt: {$gte: from, $lte: to}})
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (search) {
      //db.blogs.find({blogName: {$regex: search, $options: "i"}})
      query.blogName = { $regex: search, $options: "i" };
    }
    const sortSpec = typeof sort === "string" ? sort.trim() : sort; // default -createdAt
    const pageRaw = typeof page === "string" ? page.trim() : page;
    const limitRaw = typeof limit === "string" ? limit.trim() : limit;
    const pageParsed = Number(pageRaw);
    const limitParsed = Number(limitRaw);

    const pageNum =
      Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : page; // default 1
    const limitNum =
      Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : limit; // default 5

    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find(query).sort(sortSpec).skip(skip).limit(limitNum).exec(),
      Blog.countDocuments(query).exec(),
    ]);
    if (!blogs || blogs.length === 0) {
      const err = new Error("No Blogs found");
      err.statusCode = 404;
      return next(err);
    }

    return res.status(200).json({
      count: blogs.length,
      total,
      page: pageNum,
      limit: limitNum,
      blogs,
    });
  } catch (err) {
    next(err);
  }
};
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("Blog id is required");
      err.statusCode = 400;
      return next(err);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid blog id");
      err.statusCode = 400;
      return next(err);
    }
    const foundBlog = await Blog.findById(id);

    return res.status(200).json(foundBlog);
  } catch (err) {
    next(err);
  }
};

const createBlog = async (req, res, next) => {
  try {
    const { blogName, blogTitle, blogType, description } = req.body;
    if (!blogName || !blogTitle || !blogType || !description) {
      const err = new Error(
        "blogName, blogTitle, blogType and description are required"
      );
      err.statusCode = 400;
      return next(err);
    }
    const duplicateBlog = await Blog.findOne({ blogName: blogName }).exec();
    if (duplicateBlog) {
      const err = new Error("Blog with this name already exists");
      err.statusCode = 409;
      return next(err);
    }

    const blogNameStr = String(blogName).trim();
    const blogTitleStr = String(blogTitle).trim().toLowerCase();
    const blogTypeStr = String(blogType).trim().toLowerCase();
    const descriptionStr = String(description).trim();

    const blogTypeValid = ["accessory", "bling chronicle", "jewelry", "news"];
    const isValidBlogType = blogTypeValid.includes(blogTypeStr);
    if (!isValidBlogType) {
      const err = new Error("Invalid blog type");
      err.statusCode = 400;
      return next(err);
    }
    if (!req.file) {
      const err = new Error("Blog image file is required");
      err.statusCode = 400;
      return next(err);
    }
    const blogImgPath = "/public/uploads/blogs/" + req.file.filename;
    const newBlog = new Blog({
      blogName: blogNameStr,
      blogImg: blogImgPath,
      blogTitle: blogTitleStr,
      blogType: blogTypeStr,
      description: descriptionStr,
    });

    const savedBlog = await newBlog.save();
    if (!savedBlog) {
      const err = new Error("Failed to create new blog");
      err.statusCode = 500;
      return next(err);
    }
    return res.status(201).json(savedBlog);
  } catch (err) {
    next(err);
  }
};

const updateBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { blogName, blogTitle, blogType, description } = req.body;

    if (!id || id === ":id") {
      const err = new Error("Blog id is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid blog id");
      err.statusCode = 400;
      return next(err);
    }

    const foundBlog = await Blog.findById(id).exec();
    if (!foundBlog) {
      const err = new Error("No blog found with id: " + id);
      err.statusCode = 404;
      return next(err);
    }
    if (req.file) {
      const oldImagePath = path.join(__dirname, "..", foundBlog.blogImg);
      const newImagePath = "/public/uploads/" + req.file.filename;
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        foundBlog.blogImg = newImagePath;
      }
    }
    if (blogName) {
      const blogNameStr = String(blogName).trim();
      foundBlog.blogName = blogNameStr;
    }
    if (blogTitle) {
      const blogTitleStr = String(blogTitle).trim().toLowerCase();
      foundBlog.blogTitle = blogTitleStr;
    }
    if (blogType) {
      const blogTypeStr = String(blogType).trim().toLowerCase();
      const blogTypeValid = ["accessory", "bling chronicle", "jewelry", "news"];
      const isValidBlogType = blogTypeValid.includes(blogTypeStr);
      if (!isValidBlogType) {
        const err = new Error("Invalid blog type");
        err.statusCode = 400;
        return next(err);
      }
      foundBlog.blogType = blogTypeStr;
    }
    if (description) {
      const descriptionStr = String(description).trim();
      foundBlog.description = descriptionStr;
    }

    const updatedBlog = await foundBlog.save();
    if (!updatedBlog) {
      const err = new Error("Failed to update blog");
      err.statusCode = 500;
      return next(err);
    }
    return res.status(200).json(updatedBlog);
  } catch (err) {
    next(err);
  }
};

const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === ":id") {
      return res.status(400).json({ message: "id parameter is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const deletedBlog = await Blog.findByIdAndDelete(id).exec();
    if (!deletedBlog) {
      return res.status(404).json({ message: "No blog found with id: " + id });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlogById,
  deleteBlogById,
};
