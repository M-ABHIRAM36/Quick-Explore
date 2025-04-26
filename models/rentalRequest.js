const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const rentalRequestSchema = new Schema({
    ownerName: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true,
        unique:true
    },
    email: {
        type: String,
        unique:true,
    },
    propertyType: {
        type: String,
        enum: ["House", "Apartment", "PG", "Room", "Villa"],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    distFromPlace: {
        type: Number,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 1000
    },
    images: {
        type: [String], // Array of image URLs
        default: []
    },
    description: {
        type: String
    },
    adminStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Flagged"],
        default: "Pending"
    },
    bookingStatus: {
        type: String,
        enum: ["Available", "Booked", "Ongoing", "Completed", "Cancelled"],
        default: "Available"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        required: true
    }
});


// Compare method for login
rentalRequestSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
  };

const rentalRequest = mongoose.model("rentalRequest", rentalRequestSchema);
module.exports = rentalRequest;
