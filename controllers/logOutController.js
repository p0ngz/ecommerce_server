const { User } = require("../models/User");
const jwt = require("jsonwebtoken");

const handleLogout = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      const err = new Error("No content");
      err.status = 204;
      return next(err);
    }

    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
      const err = new Error("Forbidden");
      err.status = 403;
      res.clearCookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return next(err);
    }

    foundUser.refreshToken = ""; //clear refreshToken in db
    await foundUser.save();

    res.clearCookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: false,
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { handleLogout };
