const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireLogin } = require("../middleware/auth");

// Root route
router.get("/", userController.root);

/// Splash Screen Route (first visit)
router.get("/flash", userController.flash);

// GET Register Form
router.get("/register", userController.renderRegisterForm);

// POST Register
router.post("/register", userController.register);

// GET Login Form
router.get("/login", userController.renderLoginForm);

// POST Login
router.post("/login", userController.login);

// Logout
router.get("/logout", userController.logout);

// ========================= USER PROFILE =========================

router.get("/user/profile", requireLogin, userController.renderProfile);
router.post("/user/profile", requireLogin, userController.updateProfile);

module.exports = router;
