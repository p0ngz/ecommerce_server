const bcrypt = require("bcrypt");
const { User } = require("../models/User.js");
const {
  usernameRegex,
  emailRegex,
  passwordRegex,
} = require("../utils/validation.js");
const registerUser = async (req, res, next) => {
  const { firstName, lastName, username, email, password } = req.body;
  console.log("Registering user:", req.body);
  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({
      message: "firstName, lastName, username, email and password are required",
    });
  }

  if (!username.match(usernameRegex)) {
    return res.status(400).json({
      message: "Username must contain only letters, numbers, and underscores",
    });
  }

  if (!email.match(emailRegex)) {
    return res.status(400).json({
      message: "Please enter a valid email address (example@example.com)",
    });
  }

  if (!password.match(passwordRegex)) {
    return res.status(400).json({ message: "Password must be 5-8 characters" });
  }

  const duplicateUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  }).exec();
  if (duplicateUser) {
    return res
      .status(409)
      .json({ message: "Username or Email already exists" });
  }
  try {
    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPwd,
      information: { firstName, lastName },
    });
    const result = await newUser.save();
    console.log("result: ", result);
    res.status(201).json({ message: `created user successfully:`, username });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser };
