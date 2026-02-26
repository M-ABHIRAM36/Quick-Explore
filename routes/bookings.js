const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { requireLogin } = require("../middleware/auth");

// ========================= PLACES =========================

router.get("/places2", bookingController.getPlaces);
router.get("/listings/:id/viewP", requireLogin, bookingController.viewPlace);

// ========================= VEHICLE BOOKINGS =========================

/// 📌 Fetch available vehicles for a place
router.get("/book-vehicle", requireLogin, bookingController.getAvailableVehicles);

// 🚗 Booking a vehicle
router.post("/book-vehicle", bookingController.bookVehicle);

// 📌 View User Bookings 
router.get("/my-bookings", requireLogin, bookingController.getMyBookings);

// 🔁 Renew vehicle booking
router.post("/renew-booking/:bookingId", bookingController.renewBooking);

// ❌ Cancel booking
router.post("/cancel-booking/:bookingId", bookingController.cancelBooking);

// GET my vehicle charges
router.get("/my-charges", requireLogin, bookingController.getMyCharges);

// ========================= RENTAL BOOKINGS =========================

/// 📌 Get available rooms near a place
router.get("/book-rooms", requireLogin, bookingController.getAvailableRooms);

// POST book a rental
router.post("/bookRental/:rentalId", requireLogin, bookingController.bookRental);

// GET my rental bookings
router.get("/my-Rbookings", requireLogin, bookingController.getMyRentalBookings);

// // 📌 Rental Renewal
router.post("/renew-rental/:rentalBookingId", requireLogin, bookingController.renewRental);

// Cancel rental booking
router.post("/cancel-rental/:bookingId", bookingController.cancelRental);

// GET my rental charges
router.get("/my-rentalcharges", requireLogin, bookingController.getMyRentalCharges);

module.exports = router;
