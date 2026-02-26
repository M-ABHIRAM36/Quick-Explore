const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const vehicleController = require("../controllers/vehicleController");
const { requireLogin, isAuthenticated } = require("../middleware/auth");

// GET vehicle request form
router.get("/vehicleRform", requireLogin, vehicleController.renderVehicleForm);

// GET all vehicle requests (admin view)
router.get("/requestForms/vehicleForms", isAuthenticated, vehicleController.getAllVehicleRequests);

// POST submit vehicle request form (with image upload)
router.post("/requestForms/vehicleForms", upload.single("images"), vehicleController.submitVehicleRequest);

// GET user credential page
router.get("/usercredential", requireLogin, vehicleController.renderUserCredential);

// Approve vehicle request by updating the adminStatus
router.post("/updateVehicleStatus/:id", vehicleController.updateVehicleStatus);

/// **GET - Render Vehicle Status Form**
router.get("/Vstatus", requireLogin, vehicleController.renderStatusForm);

// **POST - Fetch Vehicle Request Status**
router.post("/CheckVehicleStatus", vehicleController.checkVehicleStatus);

module.exports = router;
