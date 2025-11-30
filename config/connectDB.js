const mongoose = require("mongoose");

const connectDB = async (DATABASE_URL) => {
  try {
    const connectDB = await mongoose.connect(DATABASE_URL, {});
    console.log("Connected to MongoDB");
    return connectDB;
  } catch (err) {
    console.log("connectDB error: ", err);
    throw err;
  }
};

module.exports = { connectDB };
