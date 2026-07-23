const mongoose = require("mongoose");

require("dotenv").config();
//mongodb://localhost:27017
const dbURI = "mongodb+srv://contactzackluxury_db_user:eRs3LzB65YE28N0p@zackluxury.angfsw0.mongodb.net";

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;