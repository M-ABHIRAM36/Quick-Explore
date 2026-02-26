const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");

require('dotenv').config();

// Database Connection
const connectDB = require("./config/db");
connectDB()
  .then(() => {
    console.log("DB CONNECTED TO ATLAS MONGODB!");
  })
  .catch((err) => {
    console.log(err);
  });

const MONGO_URL = process.env.MONGO_ATLAS_URL;

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use('/uploads', express.static('uploads'));

// Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Change to a strong secret!
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URL }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Global Middleware - Set currentUser
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Route Imports
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const vehicleRoutes = require("./routes/vehicles");
const rentalRoutes = require("./routes/rentals");
const bookingRoutes = require("./routes/bookings");
const driverRoutes = require("./routes/drivers");
const ownerRoutes = require("./routes/owners");

// Route Mounting
app.use("/", userRoutes);
app.use("/", adminRoutes);
app.use("/", vehicleRoutes);
app.use("/", rentalRoutes);
app.use("/", bookingRoutes);
app.use("/driver", driverRoutes);
app.use("/owner", ownerRoutes);

// Catch-all route for undefined routes (404 - Not Found)
app.get('*', (req, res) => {
  const error = 'Page not found'; // Message to be displayed
  const statusCode = 404; // Error code
  const stack = process.env.NODE_ENV === 'development' ? 'Stack trace here' : null; // Only show stack in development

  res.status(statusCode).render("errors/appError", { error, statusCode, stack });
});

// Start Server
app.listen(port, () => {
  console.log("app is listening on port : 8080");
});
