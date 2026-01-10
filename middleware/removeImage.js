const fs = require("fs");

const removeImageOnError = (err, req, res, next) => {
  // Remove uploaded file if there's an error
  if (req.file && req.file.path) {
    // console.log("req.file: ", req.file)
    fs.unlink(req.file.path, (unlinkErr) => {
      if (unlinkErr) console.error("Error removing file on error:", unlinkErr);
    });
  }
  // Pass error to next error handler
  next(err);
};

module.exports = { removeImageOnError };
