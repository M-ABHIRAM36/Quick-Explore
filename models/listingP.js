const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true, // Each place should have a unique title
        trim: true,
    },
    images: {
        type: [String], // Array of image URLs
        default: ["../public/images/golconda.jpg"],
        validate: {
            validator: function (v) {
                return v.every(url => /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/.test(url));
            },
            message: "Invalid image URL format.",
        },
    },
    location: {
        type: String,
        required: true,
    },
    pincode: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        // enum: ["Monument", "Waterfall", "Temple", "Famous City", "Trekking","Festival"],
        enum:
        [
            "Monument",
            "Waterfall",
            "Temple",
            "Famous City",
            "Trekking",
            "Festival",
            "Museum",
            "Wildlife",
            "Park & Garden",
            "Lake & Dam",
            "Heritage Site",
            "Adventure",
            "Shopping",
            "Cultural Site",
            "Beach & Coast",
            "Local Cuisine"
          ],          
        required: true,
    },
    bestTimeToVisit: {
        type: String,
        default: "Year-round", // Example: "October - March"
    },
    entryFee: {
        type: String, // Some places may have free entry or variable fees
        default: "Free",
    },
    contact: {
        type: String,
        validate: {
            validator: function (v) {
                return v ? /^\d{10}$/.test(v) : true; // Contact is optional
            },
            message: "Contact number must be a valid 10-digit number.",
        },
    },
    website: {
        type: String,
        validate: {
            validator: function (v) {
                return v ? /^(https?:\/\/[^\s]+)$/.test(v) : true; // Website is optional
            },
            message: "Invalid website URL format.",
        },
    },
    nearbyAttractions: {
        type: [String], // List of nearby places
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ListingP = mongoose.model("ListingP", listingSchema); // in data base listingps will come note always one s will add to the end of the word
module.exports = ListingP;

