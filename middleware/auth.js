// Middleware for like /my-booking..
const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
};

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect("/adminLogin");
  }
}

/// Middleware to ensure driver is logged in
function requireDriverLogin(req, res, next) {
  if (!req.session.driver_id) {
    return res.redirect("/driver/login");
  }
  next();
}

// Middleware: Ensure owner is logged in
function requireOwnerLogin(req, res, next) {
  if (!req.session.owner_id) {
    return res.redirect("/owner/login");
  }
  next();
}

module.exports = {
  requireLogin,
  isAuthenticated,
  requireDriverLogin,
  requireOwnerLogin,
};
