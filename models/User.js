const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Required fields - User must provide
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    match: [
      /^[A-Za-z0-9_]+$/,
      "Username must contain only letters, numbers, and underscores",
    ],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    min: [5, "Password must be at least 5 characters"],
    max: [100, "Password must be at most 100 characters"], // Allow for hashed passwords
  },

  // System fields - With defaults
  role: {
    type: [String],
    enum: ["customer", "admin", "seller"],
    default: ["customer"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Optional profile information - No defaults
  information: {
    userImage: {
      type: String,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    nickName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    birthDate: {
      type: Date,
    },
    phone: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
  },

  refreshToken: {
    type: String,
    default: null,
  },
  expiredAt: {
    type: Date,
    default: null,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
