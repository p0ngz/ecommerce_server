// credentials for sending cookie, authorization header , session between frontend and backend
const allowedList = require("../config/allowedOrigin.js");

// origin is protocol + domain + port
const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedList.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};

module.exports = credentials;
