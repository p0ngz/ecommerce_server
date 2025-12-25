const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// node + require('crypto').randomBytes(64).toString('hex')

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error(
    "Access token secret or refresh token secret is not defined in environment variables"
  );
}

const handleLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const err = new Error("Username and password are required");
      err.status = 400;
      throw err;
    }

    const foundUser = await User.findOne({ username }).exec();
    if (!foundUser) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }

    const matchPwd = await bcrypt.compare(password, foundUser.password);

    if (matchPwd) {
      const roles = Object.values(foundUser.role);

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles,
          },
        },
        ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
        }
      );
      const refreshToken = jwt.sign(
        { username: foundUser.username },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      foundUser.refreshToken = refreshToken;
      await foundUser.save();
      res.cookie("jwt", refreshToken, {
        httpOnly: true, // secure against xss (cross site scripting)
        sameSite: "None", // for different domain (frontend + backend)
        secure: false, // cookies send only over https
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days to milliseconds
      });

      res.status(200).json({ roles, accessToken });
    }
  } catch (error) {
    next(err);
  }
};

module.exports = { handleLogin };
