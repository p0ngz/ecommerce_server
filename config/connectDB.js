const mongoose = require("mongoose");
const { startCronJobs } = require("../utils/cronJobs.js");

const connectDB = async (DATABASE_URL) => {
  try {
    const connectDB = await mongoose.connect(DATABASE_URL, {});
    startCronJobs();
    console.log("Connected to MongoDB");
    return connectDB;
  } catch (err) {
    console.log("connectDB error: ", err);
    throw err;
  }
};

module.exports = { connectDB };
