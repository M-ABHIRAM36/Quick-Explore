const mongoose = require("mongoose");
const User = require("../models/User.js");
const VehicleRequest = require("../models/vehicleRequest");
const Booking = require("../models/bookingVehicle");
require('dotenv').config({ path: '../.env' });

const MONGO_URL = process.env.MONGO_ATLAS_URL;

mongoose.connect(MONGO_URL)
  .then(async () => {
    console.log("MongoDB Connected");

    try {

      const user = new User({
        username: "apurupa",
        email: "appu@gmail.com",
        password: "Appuabhi@9",
        phone: "8099145227"
      });

      await user.save();
      console.log("✅ User Created:", user.username);

      // Create a vehicle
      const vehicle = new VehicleRequest({
        ownerName: "RahulSharma",
        contact: "9876543210",
        email: "rahul@gmail.com",
        vehicleType: "4-Wheeler",
        brand: "Toyota",
        model: "Innova",
        registrationNumber: "KA01AB1234",
        location: "Bangalore",
        pincode: 560001,
        images: ["url1", "url2"],
        adminStatus: "Approved",
        bookingStatus: "Available",
        rentalPricePerDay: 2500,
        availableFrom: new Date("2025-04-01"),
        availableTo: new Date("2025-04-30"),
        place: "Bangalore"
      });

      await vehicle.save();
      console.log("✅ Vehicle Created:", vehicle.registrationNumber);

      // Create a booking
      const booking = new Booking({
        userId: user._id,
        vehicleId: vehicle._id,
        place: "Charminar",
        pickupDate: new Date("2025-04-18"),
        dropoffDate: new Date("2025-04-22"),
        totalAmount: 5000,
        paymentStatus: "Pending",
        vehicleStatus: "Booked"
      });

      await booking.save();
      console.log("✅ Booking Created between", user.username, "and", vehicle.registrationNumber);
    } catch (err) {
      console.error("❌ Error during seed:", err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error("❌ DB connection failed", err);
  });

  