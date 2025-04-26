const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vehicleRequestSchema = new Schema({
    ownerName: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    vehicleType: {
        type: String,
        enum: ["2-Wheeler", "4-Wheeler", "3-Wheeler","Bus-ac","Bus-non ac"],
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    images: {
        type: [String], // Array of image URLs
        default: []
    },
    rentalPricePerDay: { type: Number, required: true },
    availableFrom: { type: Date, required: true },
    availableTo: { type: Date, required: true },
    place: { type: String, required: true }, // Add place
    adminStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Flagged",],
        default: "Pending",
      },
      bookingStatus: {
        type: String,
        enum: ["Available", "Booked", "Ongoing", "Completed", "Cancelled"],
        default: "Available",
      },     
    createdAt: {
        type: Date,
        default: Date.now
    },
    currentDriver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Driver" // Reference to the Driver model
    }
});

const vehicleRequest = mongoose.model("vehicleRequest", vehicleRequestSchema);
module.exports = vehicleRequest;
