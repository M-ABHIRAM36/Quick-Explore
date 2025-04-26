
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
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
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver"
    },
    place: { type: String, required: true },
    pickupDate: { type: Date, required: true },
    dropoffDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending"
    },
    vehicleStatus: {
        type: String,
        enum: ["Booked", "Ongoing", "Completed", "Cancelled","Available"],
        default: "Available"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
