const verifyJwt = async (req, res, next) => {
  const authHeader = req.headers["Authorization"];
  if (!authHeader.startsWith("Bearer ")) {
    const err = new Error("Unauthorized Missing Bearer Token");
    err.statusCode = 401;
    return next(err);
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      const err = new Error("Forbidden invalid token");
      err.statusCode = 401;
      return next(err);
    }
    console.log("decoded from verifyJwt: ", decoded);
    req.user = decoded;
    console.log("req.user: ", req.user);

    next();
  });
};

module.exports = { verifyJwt };
