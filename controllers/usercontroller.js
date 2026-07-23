const otp = require("../models/otp");
const Blogger = require("../models/User");
const authService = require("../services/user.service");
const generateOTP = require("../utils/generateOTP");
const { sendEmailToPassword, sendEmailToEmail } = require("../utils/mail");
const { generateToken } = require("../utils/token");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate the request body
    if (!name || !email || !password) {
      return res.status(400).json({
        error:
          " name, email, password are required",
      });
    }
    const newUser = await authService.registerUser(name, email, password);

    res.status(201).json({
      message: "register successful. please loging now ",
      newUser,
    });
  } catch (error) {
    if (error.message === "The email is already in use.") {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred during user registration." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate the request body
    if (!email || !password) {
      return res.status(400).json({
        error: "email or password are required",
      });
    }

    const user = await authService.loginUser(email, password);
    const username = user.name;
    const adminId = user._id;
    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      username,
      adminId,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.sendmailemail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "User email is required" });
  }
  const user = await Blogger.findOne({ email: email });

  try {
    const existingOTP = await otp.findOne({ userId: user._id });

    if (existingOTP) {
      await otp.deleteOne({ userId: user._id });
    }
    const OTP = generateOTP();
    const hashedOTP = await bcrypt.hash(OTP, 8);

    await otp.create({
      userId: user._id,
      token: hashedOTP,
    });

    const firstName = user.name;

    try {
      sendEmailToEmail(user._id, OTP, firstName, email);
    } catch (err) {
      console.log(err);
    }

    res.status(200).json({
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while sending the OTP email." });
  }
};

exports.changePassword = async (req, res) => {
  const { userId, OTP } = req.params;
  const { newPassword } = req.body; // Get user ID, OTP, and new password from the request body

  if (!userId || !OTP || !newPassword) {
    return res
      .status(400)
      .json({ message: "User ID, OTP, and new password are required" });
  }

  try {
    // Find the OTP by user ID
    const otpRecord = await otp.findOne({ userId });
    if (!otpRecord) {
      return res.status(404).json({ message: "OTP not found" });
    }

    // Check if the OTP is expired (if OTP age is greater than 10 minutes or 600 seconds)
    const currentTime = Date.now();
    const otpAge =
      (currentTime - new Date(otpRecord.createdAt).getTime()) / 1000;

    if (otpAge > 600) {
      await otp.deleteOne({ userId: userId }); // Delete expired OTP
      return res.status(403).json({ message: "OTP expired" });
    }

    // Compare the provided OTP with the stored hashed OTP
    const isOTPValid = await bcrypt.compare(OTP, otpRecord.token);
    if (!isOTPValid) {
      return res.status(403).json({ message: "Invalid OTP" });
    }

    // Find the user by ID
    const user = await Blogger.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Delete the OTP record after successful password change
    await otp.deleteOne({ userId });

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while changing the password" });
  }
};

exports.sendmailpassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "User email is required" });
  }
  const user = await Blogger.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "No user found with this email." });
  }
  try {
    const existingOTP = await otp.findOne({ userId: user.id });

    if (existingOTP) {
      await otp.deleteOne({ userId: user.id });
    }
    const OTP = generateOTP();
    const hashedOTP = await bcrypt.hash(OTP, 8);

    await otp.create({
      userId: user.id,
      token: hashedOTP,
    });

    const firstName = user.name;

    try {
      sendEmailToPassword(user.id, OTP, firstName, email);
    } catch (err) {
      console.log(err);
    }

    res.status(200).json({
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while sending the OTP email." });
  }
};
