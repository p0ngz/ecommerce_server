const mongoose = require("mongoose");
const dns = require("dns");
const { startCronJobs } = require("../utils/cronJobs.js");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async (DATABASE_URL) => {
  try {
    const connectDB = await mongoose.connect(DATABASE_URL, { family: 4 });
    startCronJobs();
    console.log("Connected to MongoDB");
    return connectDB;
  } catch (err) {
    console.log("connectDB error: ", err);
    throw err;
  }
};

module.exports = { connectDB };
