const { logEvent } = require("../utils/logEvent.js");

const logError = async (err, req, res, next) => {
  try {
    const message = `${err.name}: ${err.message}`;
    const errorFile = "errorLog.txt";
    await logEvent(message, "logs", errorFile);
    console.log("err.stack: ", err.stack);

    res.status(500).send(err.message);
  } catch (err) {
    console.log("errorHandler middleware error: ", err);
  }
};

module.exports = { logError };

