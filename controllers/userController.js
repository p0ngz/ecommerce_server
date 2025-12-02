const { User } = require("../models/User.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
const {
  usernameRegex,
  emailRegex,
  passwordRegex,
} = require("../utils/validation.js");

// get all users
const getAllUsers = async (req, res) => {
  try {
    /* 
    user filter
    - find all users
    - from
    - to
    - sort -createdAt
    - page
    - limit

  */
    const {
      from = new Date("2025-11-26"),
      to = new Date(),
      search,
      sort = "-createdAt",
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (search) {
      query.username = { $regex: search, $options: "i" };
    }

    const pageRaw = typeof page === "string" ? page.trim() : page;
    const limitRaw = typeof limit === "string" ? limit.trim() : limit;
    const pageParsed = Number(pageRaw);
    const limitParsed = Number(limitRaw);

    const pageNum =
      Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;
    const limitNum =
      Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : 10;
    const skip = (pageNum - 1) * limitNum;

    const sortSpec = typeof sort === "string" ? sort.trim() : "-createdAt";

    const [users, total] = await Promise.all([
      User.find(query).sort(sortSpec).skip(skip).limit(limitNum).exec(),
      User.countDocuments(query).exec(),
    ]);
    if (!users) {
      const err = new Error("No Users found");
      err.statusCode = 404;
      return next(err);
    }
    return res.status(200).json({
      count: users.length,
      total,
      page: pageNum,
      limit: limitNum,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// get user by id
const getUSerById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundUser = await User.findById(id).exec();

    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid user id: " + id);
      err.statusCode = 400;
      return next(err);
    }
    if (!foundUser) {
      const err = new Error("No User found with id: " + userId);
      err.statusCode = 404;
      return next(err);
    }
    return res.status(200).json(foundUser);
  } catch (err) {
    next(err);
  }
};

// create new user
const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      const err = new Error("username, email and password are required");
      err.statusCode = 400;
      return next(err);
    }

    if (!username.match(usernameRegex)) {
      const err = new Error(
        "Username must be 5-10 characters, contain at least one uppercase letter, and only letters and digits"
      );
      err.statusCode = 400;
      return next(err);
    }

    if (!email.match(emailRegex)) {
      const err = new Error(
        "Please enter a valid email address (example@example.com)"
      );
      err.statusCode = 400;
      return next(err);
    }

    if (!password.match(passwordRegex)) {
      const err = new Error("Password must be 5-8 characters");
      err.statusCode = 400;
      return next(err);
    }

    const duplicateUser = await User.findOne({ username: username }).exec();
    if (duplicateUser) {
      const err = new Error("Username is already exists");
      err.statusCode = 409;
      return next(err);
    }
    const hashedPwd = await bcrypt.hash(password, 10); // hashed password for 10 rounds
    // 1st way
    const newUser = new User({
      username,
      email,
      password: hashedPwd,
    });
    await newUser.save();

    return res
      .status(200)
      .json({ message: "created user successfully", username });
  } catch (err) {
    next(err);
  }
};

// update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid user id: " + id);
      err.statusCode = 400;
      return next(err);
    }

    const { username, email, password, information } = req.body;
    // handle form-data
    let newInformation = {};
    if (information) {
      Object.keys(information).forEach((key) => {
        newInformation[key] = information[key];
      });
    }

    const foundUser = await User.findById({ _id: id }).exec();
    if (!foundUser) {
      const err = new Error("No User found with id: " + id);
      err.statusCode = 404;
      return next(err);
    }
    // 1st way
    if (username) foundUser.username = username;
    if (email) foundUser.email = email;
    if (password) {
      const hashedPwd = await bcrypt.hash(password, 10);
      foundUser.password = hashedPwd;
    }
    // handle upload file
    if (req.file) {
      // Store as URL path, not filesystem path => ex. imagePath = path.join(__dirname, "..", ....)
      const imagePath = `/uploads/users/${req.file.filename}`;
      newInformation.userImage = imagePath;
    }
    if (Object.keys(newInformation).length > 0) {
      foundUser.information = {
        ...foundUser.information,
        ...newInformation,
      };
    }

    await foundUser.save();
    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: foundUser._id,
        username: foundUser.username,
        information: foundUser.information,
      },
    });
  } catch (err) {
    next(err);
  }
};
const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === ":id") {
      const err = new Error("id parameter is required");
      err.statusCode = 400;
      return next(err);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error("Invalid user id: " + id);
      err.statusCode = 400;
      return next(err);
    }
    const foundUserAndDelete = await User.findByIdAndDelete({ _id: id });
    if (!foundUserAndDelete) {
      const err = new Error("No user found to delete with id: " + id);
      err.statusCode = 404;
      return next(err);
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUSerById,
  createUser,
  updateUser,
  deleteUserById,
};
