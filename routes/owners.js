const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");
const { requireOwnerLogin } = require("../middleware/auth");

// ========================= OWNER AUTH =========================

// GET: Owner Login Page
router.get("/login", ownerController.renderLoginForm);

// POST: Owner Login Handler
router.post("/login", ownerController.login);

// GET: Owner Logout
router.get("/logout", ownerController.logout);

// ========================= OWNER PAGES =========================

// GET: Owner Home Page
router.get("/home", requireOwnerLogin, ownerController.home);

// GET: Rental Owner's Customer Details
router.get("/customer-details", requireOwnerLogin, ownerController.getCustomerDetails);

// POST: Complete Rental Booking
router.post("/complete-booking/:bookingId", requireOwnerLogin, ownerController.completeBooking);

// POST: Cancel Rental Booking by Owner
router.post("/cancel-booking/:bookingId", requireOwnerLogin, ownerController.cancelBooking);

// ========================= OWNER PROFILE =========================

// GET: Owner Profile
router.get("/profile", requireOwnerLogin, ownerController.renderProfile);

// POST: Update Owner Password
router.post("/profile", requireOwnerLogin, ownerController.updateProfile);

module.exports = router;
