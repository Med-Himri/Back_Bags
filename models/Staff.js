const mongoose = require("mongoose");

const internSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    nowprice: {
      type: Number,
      required: false,
      default: 0,
    },
    getmoney: {
      type: Number,
      required: false,
      default: 0,
    },
    phone: {
      type: Number,
      required: false,
    },
    Subscribes: {
      type: Array,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Staff = mongoose.model("Staff", internSchema);

module.exports = Staff;
