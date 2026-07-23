const bcrypt = require("bcrypt");
const Blogger = require("../models/User");

const registerUser = async (name, email, password) => {
  const existingUser = await Blogger.findOne({ email });
  if (existingUser) {
    throw new Error("The email is already in use.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new Blogger({
    name,
    email,
    password: hashedPassword,
  });
  await newUser.save();
  return newUser;
};

const loginUser = async (email, password) => {
  const user = await Blogger.findOne({ email });
  if (!user) {
    throw new Error("The email or password is incorrect.");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("The email or password is incorrect.");
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
};
