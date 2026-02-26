const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { isAuthenticated, requireDriverLogin } = require("../middleware/auth");

// ========================= ADMIN: DRIVER MANAGEMENT =========================

// GET form to assign a vehicle to a driver
router.get("/assign-vehicle", isAuthenticated, driverController.renderAssignVehicle);

// POST: Assign vehicle to driver
router.post("/assign-vehicle", driverController.assignVehicle);

// GET: Assign a new driver to any approved vehicle
router.get("/assign-vehicleNewDriver", isAuthenticated, driverController.renderAssignNewDriver);

// POST: Assign a new driver to a vehicle and update all bookings
router.post("/assign-vehicleNewDriver", driverController.assignNewDriver);

// GET: Add driver form
router.get("/add", isAuthenticated, driverController.renderAddDriver);

// POST: Add a new driver
router.post("/add", isAuthenticated, driverController.addDriver);

// ========================= DRIVER AUTH =========================

// GET: Driver login page
router.get("/login", driverController.renderLoginForm);

// POST: Driver login
router.post("/login", driverController.login);

// GET: Driver logout
router.get("/logout", driverController.logout);

// ========================= DRIVER PAGES =========================

// GET: Driver home page
router.get("/home", requireDriverLogin, driverController.home);

// GET: Customer details page (for this driver)
router.get("/customer-details", requireDriverLogin, driverController.getCustomerDetails);

// POST: Fetch customer details by driver ID (optional use)
router.post("/customer-details", driverController.postCustomerDetails);

// POST: Complete a ride
router.post("/complete-ride/:bookingId", requireDriverLogin, driverController.completeRide);

// 🚗 Cancel ride by driver
router.post("/cancel-ride/:bookingId", driverController.cancelRide);

// ========================= DRIVER PROFILE =========================

// GET: Driver profile
router.get("/profile", requireDriverLogin, driverController.renderProfile);

// POST: Update driver password
router.post("/profile", requireDriverLogin, driverController.updateProfile);

module.exports = router;
