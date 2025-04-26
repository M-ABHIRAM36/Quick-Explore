// seedUsers.js
const mongoose = require("mongoose");
const User = require("../models/User");
require('dotenv').config({ path: '../.env' });


const MONGO_URL = process.env.MONGO_ATLAS_URL;

const seedUsers = async () => {
  await mongoose.connect(MONGO_URL);
  await User.deleteMany();

  const users = [];

  const nameList = ["a","b","c","d","e","f","g","h","i","j"];

  for (let i = 0; i < 10; i++) {
    users.push({
      username: `user-${nameList[i]}`,  // 👈 ensures uniqueness, no numbers
      email: `user${i + 1}@gmail.com`,
      phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      password: process.env.USERS_PASS
    });
  }
  

  await User.insertMany(users);
  console.log("✅ Seeded 10 users with hashed passwords");
  mongoose.disconnect();
};

seedUsers();
