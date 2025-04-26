const mongoose = require("mongoose");

const userRentalChargesHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rentalId: { type: mongoose.Schema.Types.ObjectId, ref: "RentalRequest" },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "RentalBooking" },
  destination: String,
  fromDate: Date,
  toDate: Date,
  cancellationFee: Number,
  cancelledAt: Date
});

module.exports = mongoose.model("UserRentalChargesHistory", userRentalChargesHistorySchema);
