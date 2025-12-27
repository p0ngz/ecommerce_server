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
const { noRouteHandler } = require("./middleware/noRoutesHandler.js");
const { startCronJobs } = require("./utils/cronJobs.js");
const { verifyApiKey } = require("./middleware/verifyApiKey.js");
const { verifyJwt } = require("./middleware/verifyJwt.js");
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
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

app.use("/uploads", express.static("public/uploads")); // when frontend want to use <img src={`http://localhost:3000/uploads/users/${user.userImage}`} />
app.use(express.urlencoded({ extended: false })); // for form data (Content-Type: application/x-www-form-urlencoded)
app.use(express.json()); // for json data (Content-Type: application/json)
app.use(cookieParser()); // for cookie data

// API routes
const apiRouterV1 = express.Router();
// const apiRouterV2 = express.Router();
apiRouterV1.use("/register", verifyApiKey, require("./routes/register.js"));
apiRouterV1.use("/auth", verifyApiKey, require("./routes/auth.js"));
apiRouterV1.use("/logout", verifyApiKey, require("./routes/logout.js"));

apiRouterV1.use(verifyJwt);
apiRouterV1.use("/user", require("./routes/user.js"));
apiRouterV1.use("/product", require("./routes/product.js"));
apiRouterV1.use("/order", require("./routes/order.js"));
apiRouterV1.use("/wishlist", require("./routes/wishlist.js"));
apiRouterV1.use("/cartList", require("./routes/cartList.js"));
apiRouterV1.use("/blog", require("./routes/blog.js"));
apiRouterV1.use("/coupon", require("./routes/coupon.js"));
apiRouterV1.use("/userCoupon", require("./routes/userCoupon.js"));

// Mount all API routes under /api prefix
app.use("/api", apiRouterV1);
// app.use("/api/v2", apiRouterV2);

// error handler
app.use(noRouteHandler);
app.use(errorHandler);
app.use(logError);

// end of middleware here
// server running and database connect
connectDB(DATABASE_URL).then(() => {
  startCronJobs();
  startServer(app, PORT);
});
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
