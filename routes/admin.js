const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAuthenticated } = require("../middleware/auth");

// Admin Login Page
router.get("/adminLogin", adminController.renderLoginForm);

// Admin Login Form Handler
router.post("/adminLogin", adminController.login);

// Admin Logout
router.get("/Adminlogout", isAuthenticated, adminController.logout);

// Protected admin route
router.get("/admin", isAuthenticated, adminController.renderAdminPanel);

// DFD Documentation Routes
router.get("/quickexploreDFDd1", isAuthenticated, adminController.renderDFD1);
router.get("/quickexploreDFDd2", isAuthenticated, adminController.renderDFD2);
router.get("/quickexploreSA", isAuthenticated, adminController.renderArchitecture);

module.exports = router;
