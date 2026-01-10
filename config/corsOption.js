const { logEvent } = require("../utils/logEvent.js");
const allowedList = require("./allowedOrigin.js");

// origin is protocol + domain + port
const corsOption = {
  origin: (origin, callback) => {
    console.log(origin, callback);
    if (allowedList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      logEvent(`Blocked by CORS: ${origin}`, "logs", "corsError.txt");
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOption;
