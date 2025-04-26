const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rentalBookingSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the user who booked the rental
        required: true
    },
    rentalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RentalRequest", // Reference to the rental property
        required: true
    },
    place: {
        type: String,
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending"
    },
    status: {
        type: String,
        enum: ["Booked", "Ongoing", "Completed", "Cancelled","Available"],
        default: "Available"
    },
    cancellationFee: {
        type: Number,
        default: 0
      },      
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RentalBooking = mongoose.model("RentalBooking", rentalBookingSchema);
module.exports = RentalBooking;
