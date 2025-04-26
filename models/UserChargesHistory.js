// models/UserChargesHistory.js

const mongoose = require("mongoose");

const userChargesHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleRequest",
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  cancellationFee: {
    type: Number,
    required: true
  },
  cancelledAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("UserChargesHistory", userChargesHistorySchema);
