const User = require("../models/User");

// Root route
module.exports.root = (req, res) => {
  try {
    res.redirect("/flash");
  } catch (err) {
    console.error("Root route error:", err);
    res.render("errors/appError.ejs");
  }
};

/// Splash Screen Route (first visit)
module.exports.flash = (req, res) => {
  try {
    req.session.splashShown = true;

    setTimeout(() => {
      req.session.splashShown = false;
    }, 30 * 60 * 1000);  // 30 minutes

    res.render('flash');
  } catch (err) {
    console.error("Error in /flash route:", err);
    res.render("errors/appError.ejs");
  }
};

// GET Register Form
module.exports.renderRegisterForm = (req, res) => {
  try {
    res.render("./users/register.ejs");
  } catch (err) {
    console.error("Error loading register form:", err);
    res.render("errors/appError.ejs");
  }
};

// POST Register
module.exports.register = async (req, res) => {
  const { username, email, password, phone } = req.body;
  try {
    const user = new User({ username, email, password, phone });
    await user.save();
    req.session.userId = user._id;
    res.redirect("/places2");
  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === 11000) {
      return res.render("errors/error", {
        error: "Email or username already exists. Please try with different credentials.",
      });
    }
    res.render("errors/appError.ejs");
  }
};

// GET Login Form
module.exports.renderLoginForm = (req, res) => {
  try {
    res.render("./users/login.ejs");
  } catch (err) {
    console.error("Error loading login form:", err);
    res.render("errors/appError.ejs");
  }
};

// POST Login
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render("errors/error", {
        error: "Invalid email or password. Please check your credentials and try again.",
      });
    }
    req.session.userId = user._id;
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };
    res.redirect("/places2");
  } catch (err) {
    console.error("Login error:", err);
    res.render("errors/appError.ejs");
  }
};

// Logout
module.exports.logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/places2");
  } catch (err) {
    console.error("Logout error:", err);
    res.render("errors/appError.ejs");
  }
};

// ========================= USER PROFILE =========================

// GET User Profile
module.exports.renderProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.render("errors/appError.ejs", { error: "User not found." });
    }

    res.render("users/userProfile", { user, error: null, success: null });
  } catch (err) {
    console.error("Error loading user profile:", err);
    res.render("errors/appError.ejs", { error: "Unable to load user profile." });
  }
};

// POST User Profile (password change)
module.exports.updateProfile = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.render("errors/appError.ejs", { error: "User not found." });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.render("users/userProfile", {
        user,
        error: "Old password is incorrect",
        success: null
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("users/userProfile", {
        user,
        error: "New passwords do not match",
        success: null
      });
    }

    user.password = newPassword;
    await user.save();

    res.render("users/userProfile", {
      user,
      success: "Password updated successfully",
      error: null
    });
  } catch (err) {
    console.error("Error updating user password:", err);
    const user = await User.findById(req.session.userId);
    res.render("users/userProfile", {
      user,
      error: "An error occurred while updating your password",
      success: null
    });
  }
};
