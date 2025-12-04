require("dotenv").config(); // using dotenv

// importing modules
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

// importing custom modules
const { logRequest } = require("./middleware/logRequest.js");
const { logError } = require("./middleware/logError.js");
const { errorHandler } = require("./middleware/errorHandler.js");
const { connectDB } = require("./config/connectDB.js");
const { startServer } = require("./utils/startServer.js");
const credentials = require("./middleware/credentials.js");
const corsOption = require("./config/corsOption.js");
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

connectDB(DATABASE_URL);
// start middleware
/* 
    app.get: for routing handler for GET requests
    app.post: for routing handler for POST requests
    app.put: for routing handler for PUT requests
    app.delete: for routing handler for DELETE requests

    app.use: for middleware
*/
// custom middleware
// log request
app.use(logRequest);

// credentials
app.use(credentials);

// cors
app.use(cors(corsOption));

// built in middleware static files
app.use("/uploads", express.static("public/uploads")); // when frontend want to use <img src={`http://localhost:3000/uploads/users/${user.userImage}`} />
app.use(express.urlencoded({ extended: false })); // for form data (Content-Type: application/x-www-form-urlencoded)
app.use(express.json()); // for json data (Content-Type: application/json)
app.use(cookieParser()); // for cookie data

// api middleware
app.use("/register", require("./routes/register.js"));
app.use("/user", require("./routes/user.js"));
app.use("/product", require("./routes/product.js"));
app.use("/order", require("./routes/order.js"));
app.use("/wishlist", require("./routes/wishlist.js"));
app.use("/cartList", require("./routes/cartList.js"));
app.use("/blog", require("./routes/blog.js"));

// error handler
app.use(errorHandler);
app.use(logError);
// end of middleware here
// server running and database connect

startServer(app, PORT);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception: ", err);
  console.log("Server will restart automatically");
  process.exit(1); // exit to restart the server
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection: ", err);
  console.log("Server will restart automatically");
  process.exit(1); // exit to restart the server
});
