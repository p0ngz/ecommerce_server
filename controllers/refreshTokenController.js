const { User } = require("../models/userModel");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error(
    "Access token secret or refresh token secret is not defined in environment variables"
  );
}

const handleRefreshToken = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.lwt) {
      const err = new Error("Unauthorized");
      err.status = 401;
      return next(err);
    }

    const refreshToken = cookies.jwt;
    const foundUser = await User.find({ refreshToken }).exec();

    if (!foundUser) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }

    // verify
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || foundUser.username !== decoded.username)
          return res.sendStatus(403);
        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign(
          {
            UserInfo: {
              username: decoded.username,
              roles: roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "30s" }
        );

        res.status(200).json({ accessToken });
      }
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { handleRefreshToken };
