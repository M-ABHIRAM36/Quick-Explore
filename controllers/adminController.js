// Admin credentials from env
const QUICKEXPLORETEAM = {
  username: process.env.QuickExploreTeamAdmin_USERNAME,
  email: process.env.QuickExploreTeamAdmin_EMAIL,
  password: process.env.QuickExploreTeamAdmin_PASSWORD,
};

// Admin Login Page
module.exports.renderLoginForm = (req, res) => {
  try {
    res.render("requestForms/adminLogin.ejs");
  } catch (err) {
    console.error("Admin login page error:", err);
    res.render("errors/appError.ejs");
  }
};

// Admin Login Form Handler
module.exports.login = (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (
      username === QUICKEXPLORETEAM.username &&
      email === QUICKEXPLORETEAM.email &&
      password === QUICKEXPLORETEAM.password
    ) {
      req.session.authenticated = true;
      res.redirect("/admin");
    } else {
      res.send("Invalid credentials. <a href='/adminLogin'>Try again</a>");
    }
  } catch (err) {
    console.error("Admin login error:", err);
    res.render("errors/appError.ejs");
  }
};

// Admin Logout
module.exports.logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/adminLogin");
  } catch (err) {
    console.error("Admin logout error:", err);
    res.render("errors/appError.ejs");
  }
};

// Protected admin route
module.exports.renderAdminPanel = (req, res) => {
  try {
    res.render("./requestForms/admin.ejs");
  } catch (err) {
    console.error("Admin panel error:", err);
    res.render("errors/appError.ejs");
  }
};

// DFD Documentation Routes
module.exports.renderDFD1 = (req, res) => {
  res.render("docsqe/Physical_DFD_QuickExplore");
};

module.exports.renderDFD2 = (req, res) => {
  res.render("docsqe/Physical_DFD_QuickExplore2");
};

module.exports.renderArchitecture = (req, res) => {
  res.render("docsqe/QuickExplore_Architecture");
};
