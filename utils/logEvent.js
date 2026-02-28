const { format } = require("date-fns");
const { v4: uuid } = require("uuid");

const fs = require("fs"); // for file system
const fsPromises = require("fs").promises; // for working with async await
const path = require("path");

const logEvent = async (message, dirName, fileName) => {
  const dateTime = `${format(new Date(), "yyyy-MM-dd\tHH:mm:ss")}`;
  const logText = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    const dirPath = path.join(__dirname, "..", dirName);


    if (!fs.existsSync(dirPath)) {
      console.log("Directory does not exist, creating it...");
      await fsPromises.mkdir(dirPath);
    }

    const filePath = path.join(dirPath, fileName);
    console.log("Logging to file: ", filePath);
    await fsPromises.appendFile(filePath, logText);
  } catch (err) {
    console.log("logEvent middleware error: ", err);
  }
};

module.exports = { logEvent };
