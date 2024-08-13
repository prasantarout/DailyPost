// src/config/db.js
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { mongoURI } = require("./index"); // Correct import

const connectDB = async () => {
  try {
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined");
    }
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("Database Connected successfully");
  } catch (err) {
    logger.error(`Database connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;