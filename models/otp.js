const mongoose = require("mongoose");
const applyToJSONTransform = require("../utils/applyToJSONTransform");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 600,
    },
  },
  {
    timestamps: false,
  }
);
applyToJSONTransform(otpSchema);
module.exports = mongoose.model("Otp", otpSchema);
