const mongoose = require("mongoose");

async function connectDB() {
  const MONGO_URL = process.env.MONGO_ATLAS_URL;
  await mongoose.connect(MONGO_URL);
}

module.exports = connectDB;
