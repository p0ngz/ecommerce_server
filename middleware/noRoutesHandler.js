const noRouteHandler = (req, res, next) => {
  const error = new Error("Cannot find " + req.originalUrl + " on this server");

  err.statusCode = 404;
  next(error);
};

module.exports = { noRouteHandler };
