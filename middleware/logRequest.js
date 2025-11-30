const { logEvent } = require("../utils/logEvent.js");

const logRequest = async (req, res, next) => {
  const message = `${req.method}\t${req.headers.origin}\t${req.url}`;
  const logRequestFile = "requestLog.txt";
  await logEvent(message, "logs", logRequestFile);
  next();
};

module.exports = { logRequest };
