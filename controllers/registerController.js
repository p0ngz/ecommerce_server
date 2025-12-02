const bcrypt = require("bcrypt");
const { User } = require("../models/User.js");
const {
  usernameRegex,
  emailRegex,
  passwordRegex,
} = require("../utils/validation.js");
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "username, email and password are required" });
  }

  if (!username.match(usernameRegex)) {
    return res.status(400).json({
      message:
        "Username must be 5-10 characters, contain at least one uppercase letter, and only letters and digits",
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
    });
    await newUser.save();
    res.status(201).json({ message: `created user successfully:`, username });
  } catch (err) {
    console.error("Error during user registration:", err);
  }
};

module.exports = { registerUser };

// res.send: to send message to client
// res.json: to send json data to client
// res.status: to set status code of response
// res.sendStatus: to set status code and send its string representation
