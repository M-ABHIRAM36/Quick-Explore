const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const rentalController = require("../controllers/rentalController");
const { requireLogin, isAuthenticated } = require("../middleware/auth");

// GET rental request form
router.get("/rentalRform", requireLogin, rentalController.renderRentalForm);

// GET all rental requests (admin view)
router.get("/requestForms/rentalForms", isAuthenticated, rentalController.getAllRentalRequests);

// POST submit rental request form (with image upload)
router.post("/requestForms/rentalForms", upload.single("images"), rentalController.submitRentalRequest);

// GET rental user credential page
router.get("/usercredentialR", requireLogin, rentalController.renderUserCredentialR);

// POST update rental price (admin)
router.post("/requestForms/updatePrice/:id", rentalController.updatePrice);

// POST update rental status (admin)
router.post("/requestForms/updateStatus/:id", rentalController.updateStatus);

// **GET - Render Rental Status Form**
router.get("/Rstatus", requireLogin, rentalController.renderStatusForm);

// **POST - Fetch Rental Request Status**
router.post("/CheckRentalStatus", rentalController.checkRentalStatus);

module.exports = router;
