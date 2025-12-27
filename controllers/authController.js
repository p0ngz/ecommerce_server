const { User } = require("../models/User");
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
      err.statusCode = 400;
      throw err;
    }

    const foundUser = await User.findOne({ username }).exec();
    if (!foundUser) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }

    const matchPwd = await bcrypt.compare(password, foundUser.password);

    if (matchPwd) {
      console.log("Password match for user:", username);
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
      const expiredInMils = 7 * 24 * 60 * 60 * 1000; // 7 days to milliseconds
      foundUser.refreshToken = refreshToken;
      foundUser.expiredAt = new Date(Date.now() + expiredInMils);
      await foundUser.save();
      res.cookie("jwt", refreshToken, {
        httpOnly: true, // secure against xss (cross site scripting)
        sameSite: "None", // for different domain (frontend + backend)
        secure: false, // cookies send only over https
        maxAge: expiredInMils,
      });
      console.log("roles:  ", roles);
      console.log("accessToken:  ", accessToken);
      res.status(200).json({
        username: foundUser?.username,
        roles,
        accessToken,
      });
    } else {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

const handleRefreshToken = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.lwt) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    const refreshToken = cookies.jwt;
    const foundUser = await User.find({ refreshToken }).exec();

    if (!foundUser) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
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

module.exports = { handleLogin, handleRefreshToken };
