const errorHandler = (err, req, res, next) => {
  console.log("ERROR HANDLER CALLED: ", err.message);

  const status = err.statusCode || 500;

  res.status(status).json({ message: err.message || "Internal server error" });
};

module.exports = { errorHandler };


