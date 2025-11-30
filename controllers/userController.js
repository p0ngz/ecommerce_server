const { User } = require("../model/User.js");
const bcrypt = require("bcrypt");
const path = require("path");
const {
  usernameRegex,
  emailRegex,
  passwordRegex,
} = require("../utils/validation.js");

// get all users
const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) {
    return res.status(404).json({ message: "No Users" });
  }
  return res.status(200).json(users);
};

// get user by id
const getUSerById = async (req, res) => {
  const userId = req.params.id;
  const foundUser = await User.findOne({ _id: userId }).exec();

  if (!foundUser) {
    return res
      .status(404)
      .json({ message: "No User found with id: " + userId });
  }
  return res.status(200).json(foundUser);
};

// create new user
const createUser = async (req, res) => {
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

  const duplicateUser = await User.findOne({ username: username }).exec();
  if (duplicateUser) {
    return res.status(409).json({ message: "Username is already exists" });
  }
  try {
    const hashedPwd = await bcrypt.hash(password, 10); // hashed password for 10 rounds
    // 1st way
    const newUser = new User({
      username,
      email,
      password: hashedPwd,
    });
    await newUser.save();
    // 2nd way
    // const userCreate = {
    //   username,
    //   email,
    //   password: hashedPwd,
    // };
    // await User.insertOne(userCreate);

    return res
      .status(200)
      .json({ message: "created user successfully", username });
  } catch (err) {
    console.error("Error during user creation: ", err);
  }
};

// update user
const updateUser = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "id parameter is required" });

  const { username, email, password, information } = req.body;
  // handle form-data
  console.log("information: ", information)
  let newInformation = {};
  if (information) {
    Object.keys(information).forEach((key) => {
      newInformation[key] = information[key];
    });
  }
  console.log("newInformation: ", newInformation);

  const foundUser = await User.findById({ _id: id }).exec();
  if (!foundUser) {
    return res.status(404).json({ message: "No User found with id: " + id });
  }
  // 1st way
  if (username) foundUser.username = username;
  if (email) foundUser.email = email;
  if (password) {
    const hashedPwd = await bcrypt.hash(password, 10);
    foundUser.password = hashedPwd;
  }
  // handle upload file
  if (req.file) {
    // Store as URL path, not filesystem path => ex. imagePath = path.join(__dirname, "..", ....)
    const imagePath = `/uploads/users/${req.file.filename}`;
    newInformation.userImage = imagePath;
  }
  if (Object.keys(newInformation).length > 0) {
    foundUser.information = {
      ...foundUser.information,
      ...newInformation,
    };
  }

  await foundUser.save();
  return res.status(200).json({ 
    message: "User updated successfully",
    user: {
      id: foundUser._id,
      username: foundUser.username,
      information: foundUser.information
    }
  });
};
const deleteUserById= async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "id parameter is required" });

  const foundUserAndDelete = await User.findByIdAndDelete({ _id: id });
  if (!foundUserAndDelete)
    return res
      .status(404)
      .json({ message: "No user found to delete with id: " + id });

  return res.status(200).json({ message: "User deleted successfully" });
};

module.exports = {
  getAllUsers,
  getUSerById,
  createUser,
  updateUser,
  deleteUserById,
};
