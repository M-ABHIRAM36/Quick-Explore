const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const bcrypt = require("bcrypt");
const multer  = require('multer')
const {storage} = require("./cloudConfig.js");
const upload = multer({ storage });

require('dotenv').config();




const MONGO_URL = process.env.MONGO_ATLAS_URL;

const ListingP = require("./models/listingP");
const VehicleRequest = require("./models/vehicleRequest");
const rentalRequest = require("./models/rentalRequest");
const Booking = require("./models/bookingVehicle.js");
const RentalBooking = require("./models/bookingRental.js");
const Transaction = require("./models/Transaction");
const User = require("./models/User");
const Driver = require("./models/Driver.js");
const UserChargesHistory = require("./models/UserChargesHistory");
const UserRentalChargesHistory = require("./models/UserRentalChargesHistory");

main()
  .then(() => {
    console.log("DB CONNECTED TO ATLAS MONGODB!");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use('/uploads', express.static('uploads'));

const session = require("express-session");
const MongoStore = require("connect-mongo");
const { error } = require("console");

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

// Root route
app.get("/", (req, res) => {
  try {
    res.redirect("/flash");
  } catch (err) {
    console.error("Root route error:", err);
    res.render("errors/appError.ejs");
  }
});

/// Splash Screen Route (first visit)
app.get('/flash', (req, res) => {
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
});

// GET Register Form
app.get("/register", (req, res) => {
  try {
    res.render("./users/register.ejs");
  } catch (err) {
    console.error("Error loading register form:", err);
    res.render("errors/appError.ejs");
  }
});

// POST Register
app.post("/register", async (req, res) => {
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
});

// GET Login Form
app.get("/login", (req, res) => {
  try {
    res.render("./users/login.ejs");
  } catch (err) {
    console.error("Error loading login form:", err);
    res.render("errors/appError.ejs");
  }
});

// POST Login
app.post("/login", async (req, res) => {
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
});

// Logout
app.get("/logout", (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/places2");
  } catch (err) {
    console.error("Logout error:", err);
    res.render("errors/appError.ejs");
  }
});

// Middleware for like /my-booking..
const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
};

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});



// Admin credentials from env
const QUICKEXPLORETEAM = {
  username: process.env.QuickExploreTeamAdmin_USERNAME,
  email: process.env.QuickExploreTeamAdmin_EMAIL,
  password: process.env.QuickExploreTeamAdmin_PASSWORD,
};

// Admin Login Page
app.get("/adminLogin", (req, res) => {
  try {
    res.render("requestForms/adminLogin.ejs");
  } catch (err) {
    console.error("Admin login page error:", err);
    res.render("errors/appError.ejs");
  }
});

// Admin Login Form Handler
app.post("/adminLogin", (req, res) => {
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
});

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect("/adminLogin");
  }
}

// Admin Logout
app.get("/Adminlogout",isAuthenticated, (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/adminLogin");
  } catch (err) {
    console.error("Admin logout error:", err);
    res.render("errors/appError.ejs");
  }
});

// Protected admin route
app.get("/admin", isAuthenticated, (req, res) => {
  try {
    res.render("./requestForms/admin.ejs");
  } catch (err) {
    console.error("Admin panel error:", err);
    res.render("errors/appError.ejs");
  }
});


app.get("/vehicleRform", requireLogin, (req, res) => {
  try {
    res.render("./listing/vehicleRform.ejs");
  } catch (err) {
    console.error("Error loading vehicleRform:", err);
    res.render("errors/appError.ejs");
  }
});

app.get("/rentalRform", requireLogin, (req, res) => {
  try {
    res.render("./listing/rentalRform.ejs");
  } catch (err) {
    console.error("Error loading rentalRform:", err);
    res.render("errors/appError.ejs");
  }
});

app.get("/requestForms/vehicleForms", isAuthenticated, async (req, res) => {
  try {
    const allvData = await VehicleRequest.find();
    res.render("./requestForms/vehicleForms", { allvData });
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    res.render("errors/error", {
      error: "Failed to load vehicle data. Please try again later.",
    });
  }
});

app.post("/requestForms/vehicleForms", upload.single("images"), async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const imageUrl = req.file.path;

    const newRequest = new VehicleRequest({
      ...req.body,
      images: [imageUrl],
    });

    const result = await newRequest.save();

    res.redirect(
      `/usercredential?id=${result._id}&contact=${result.contact}&email=${result.email}`
    );
  } catch (error) {
    console.error("Error inserting vehicle request:", error);
    res.status(500).send("Error inserting vehicle request");
  }
});

app.get("/usercredential", requireLogin, (req, res) => {
  try {
    const userCdata = req.query;
    res.render("./listing/usercredential.ejs", { userCdata });
  } catch (err) {
    console.error("Error loading usercredential:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
});

app.get("/usercredentialR", requireLogin, (req, res) => {
  try {
    const userCdata = req.query;
    res.render("./listing/usercredentialR.ejs", { userCdata });
  } catch (err) {
    console.error("Error loading usercredentialR:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
});

// Approve vehicle request by updating the adminStatus
app.post("/updateVehicleStatus/:id", async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const newAdminStatus = req.body.adminStatus;
    await VehicleRequest.findByIdAndUpdate(vehicleId, { adminStatus: newAdminStatus });
    res.redirect("/requestForms/vehicleForms");
  } catch (error) {
    console.error("Error updating vehicle status:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});

app.get("/requestForms/rentalForms", isAuthenticated, async (req, res) => {
  try {
    const allRentalData = await rentalRequest.find();
    res.render("./requestForms/rentalForms.ejs", { allRentalData });
  } catch (error) {
    console.error("Error fetching rental data:", error);
    res.render("errors/error", { error: "Failed to load rental data. Please try again later." });
  }
});

app.post("/requestForms/rentalForms", upload.single("images"), async (req, res) => {
  try {
    console.log("Received form data:", req.body);
    console.log("Uploaded file:", req.file);

    const imageUrl = req.file ? req.file.path : null;

    const newRental = new rentalRequest({
      ...req.body,
      images: imageUrl ? [imageUrl] : [],
      password: "placeholder",
    });

    const result = await newRental.save();
    const generatedPassword = `QuE9@${result._id.toString().slice(-5)}`;
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    result.password = hashedPassword;
    await result.save();

    console.log("Rental Owner created with password:", generatedPassword);

    res.redirect(`/usercredentialR?id=${result._id}&contact=${result.contact}&email=${result.email}&password=${generatedPassword}`);
  } catch (error) {
    console.error("Error inserting rental request:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});

app.post("/requestForms/updatePrice/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    await rentalRequest.findByIdAndUpdate(id, { price });
    res.redirect("/requestForms/rentalForms");
  } catch (error) {
    console.error("Error updating price:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});

app.post("/requestForms/updateStatus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminStatus } = req.body;
    await rentalRequest.findByIdAndUpdate(id, { adminStatus });
    res.redirect("/requestForms/rentalForms");
  } catch (error) {
    console.error("Error updating status:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});


/// **GET - Render Vehicle Status Form**
app.get("/Vstatus", requireLogin, (req, res) => {
  try {
    res.render("./checkStatus/checkVstatusF.ejs");
  } catch (err) {
    console.error("Error rendering vehicle status form:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
});

// **POST - Fetch Vehicle Request Status**
app.post("/CheckVehicleStatus", async (req, res) => {
  try {
    const { objectId, contact, email } = req.body;
    const query = { _id: objectId, contact, email };
    const vehicleRequest = await VehicleRequest.findOne(query);

    if (!vehicleRequest) {
      return res.render("errors/error", {
        error: "Vehicle request not found. Please check your details and try again.",
      });
    }

    res.render("./checkStatus/showVstatus.ejs", { vehicleRequest });
  } catch (error) {
    console.error("Error fetching vehicle request:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});

// **GET - Render Rental Status Form**
app.get("/Rstatus", requireLogin, (req, res) => {
  try {
    res.render("./checkStatus/checkRstatusF.ejs");
  } catch (err) {
    console.error("Error rendering rental status form:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
});

// **POST - Fetch Rental Request Status**
app.post("/CheckRentalStatus", async (req, res) => {
  try {
    const { objectId, contact, email } = req.body;
    const query = { _id: objectId, contact, email };
    const RentalRequest = await rentalRequest.findOne(query);

    if (!RentalRequest) {
      return res.render("errors/error", {
        error: "Rental request not found. Please check your details and try again.",
      });
    }

    res.render("./checkStatus/showRstatus.ejs", { RentalRequest });
  } catch (error) {
    console.error("Error fetching rental request:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});

app.get("/places2", async (req, res) => {
  try {
    const places = await ListingP.find();
    res.render("./listing/places2.ejs", { places });
  } catch (err) {
    console.error("Error loading places:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
});

app.get("/listings/:id/viewP", requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const place = await ListingP.find({ _id: id });
    res.render("./listing/viewP.ejs", { place });
  } catch (err) {
    console.error("Error loading listing view:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
});






/// 📌 Fetch available vehicles for a place
app.get("/book-vehicle", requireLogin, async (req, res) => {
  try {
    const { place } = req.query;
    const availableVehicles = await VehicleRequest.find({
      adminStatus: "Approved",
      bookingStatus: "Available",
      place
    });
    res.render("./BookingV/bookVehicle", { vehicles: availableVehicles, place });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});

// 🚗 Booking a vehicle
app.post("/book-vehicle", async (req, res) => {
  try {
    const userId = req.session.userId;
    const { vehicleId, place, pickupDate, dropoffDate } = req.body;

    const vehicle = await VehicleRequest.findById(vehicleId);
    if (!vehicle) return res.render("errors/appError.ejs", { error: "Vehicle not found" });

    if (vehicle.adminStatus !== "Approved" || vehicle.bookingStatus !== "Available") {
      return res.render("errors/appError.ejs", { error: "Vehicle is not available for booking" });
    }

    const existingBooking = await Booking.findOne({ vehicleId, vehicleStatus: "Booked" });
    if (existingBooking) {
      return res.render("errors/appError.ejs", { error: "Vehicle already booked" });
    }

    const driver = await Driver.findOne({ currentVehicle: vehicleId });

    const startDate = new Date(pickupDate);
    const endDate = new Date(dropoffDate);
    const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalAmount = rentalDays * vehicle.rentalPricePerDay;

    const newBooking = new Booking({
      userId,
      vehicleId,
      place,
      pickupDate,
      dropoffDate,
      totalAmount,
      paymentStatus: "Pending",
      vehicleStatus: "Booked",
      driverId: driver ? driver._id : null
    });

    await newBooking.save();
    await VehicleRequest.findByIdAndUpdate(vehicleId, { bookingStatus: "Booked" });

    res.redirect("/my-bookings");
  } catch (error) {
    console.error("Error booking vehicle:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});

// 📌 View User Bookings 
app.get("/my-bookings", requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const bookings = await Booking.find({ userId });

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const vehicle = await VehicleRequest.findById(booking.vehicleId);
        const driver = await Driver.findById(booking.driverId);

        return {
          ...booking.toObject(),
          vehicle: vehicle ? vehicle.toObject() : null,
          driver: driver ? driver.toObject() : null,
          image: vehicle?.images?.[0] || "/default-car.jpg",
        };
      })
    );

    res.render("./BookingV/myBookings.ejs", { bookings: enrichedBookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});

// 🔁 Renew vehicle booking
app.post("/renew-booking/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { additionalDays } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.render("errors/appError.ejs", { error: "Booking not found" });

    const vehicle = await VehicleRequest.findById(booking.vehicleId);
    if (!vehicle) return res.render("errors/appError.ejs", { error: "Vehicle not found" });

    const originalDropoff = new Date(booking.dropoffDate);
    const newDropoff = new Date(originalDropoff);
    newDropoff.setDate(newDropoff.getDate() + parseInt(additionalDays));

    const totalDays = Math.ceil((newDropoff - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24));
    const updatedTotal = totalDays * (vehicle.rentalPricePerDay || 0);

    booking.dropoffDate = newDropoff;
    booking.totalAmount = updatedTotal;

    await booking.save();
    res.redirect("/my-bookings");
  } catch (error) {
    console.error("Error renewing booking:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});

// ❌ Cancel booking
app.post("/cancel-booking/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { timeDifference } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.render("errors/appError.ejs", { error: "Booking not found" });

    let cancellationFee = 0;
    if (timeDifference > 20 && timeDifference <= 1440) {
      cancellationFee = booking.totalAmount * 0.10;
    } else if (timeDifference > 1440) {
      const vehicle = await VehicleRequest.findById(booking.vehicleId);
      cancellationFee = vehicle?.rentalPricePerDay || 0;
    }

    booking.vehicleStatus = "Cancelled";
    booking.cancellationFee = cancellationFee;
    await booking.save();

    await VehicleRequest.findByIdAndUpdate(booking.vehicleId, { bookingStatus: "Available" });

    if (cancellationFee > 0) {
      await Transaction.create({
        userId: booking.userId,
        vehicleId: booking.vehicleId,
        amount: cancellationFee,
        type: "Cancellation Fee"
      });
    }

    if (cancellationFee >= 0) {
      await UserChargesHistory.create({
        userId: booking.userId,
        vehicleId: booking.vehicleId,
        bookingId: booking._id,
        destination: booking.place,
        fromDate: booking.pickupDate,
        toDate: booking.dropoffDate,
        cancellationFee,
        cancelledAt: new Date()
      });
    }

    const user = await User.findById(booking.userId);
    const vehicle = await VehicleRequest.findById(booking.vehicleId);

    res.render("users/cancel-summary", {
      user,
      vehicle,
      booking,
      cancellationFee,
      cancelledAt: new Date()
    });

  } catch (error) {
    console.error("Error canceling booking:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});





app.get("/my-charges", requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get all charge records for this user
    const chargesRaw = await UserChargesHistory.find({ userId }).sort({ cancelledAt: -1 });

    // Manually fetch vehicle data
    const charges = await Promise.all(
      chargesRaw.map(async (charge) => {
        const vehicle = await VehicleRequest.findById(charge.vehicleId);
        return {
          destination: charge.destination,
          fromDate: charge.fromDate,
          toDate: charge.toDate,
          cancellationFee: charge.cancellationFee,
          cancelledAt: charge.cancelledAt,
          vehicle: vehicle ? {
            brand: vehicle.brand,
            model: vehicle.model,
            registrationNumber: vehicle.registrationNumber
          } : {}
        };
      })
    );

    res.render("./users/my-charges.ejs", { charges });
  } catch (error) {
    console.error("Error fetching charges:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
});


// Booking rooms
/// 📌 Get available rooms near a place
app.get("/book-rooms", requireLogin, async (req, res) => {
  const place = req.query.place;
  
  // If no place is provided, return an error or show a message
  if (!place) {
      return res.status(400).send("Place is required to search for rentals.");
  }

  try {
      // Find approved rental rooms with the given place, and that are approved by the admin and available for booking
      const rentals = await rentalRequest.find({ 
          place: { $regex: place, $options: 'i' }, // Case-insensitive search for place
          adminStatus: "Approved",               // Check if the rental is approved by the admin
          bookingStatus: "Available"             // Check if the rental is available for booking
      });

      // Render the bookRental page with available rentals
      res.render("./BookingR/bookRental.ejs", { rentals, place });
  } catch (error) {
      console.error("Error fetching rooms:", error);
      res.render("errors/appError.ejs", { error: "Some error" });

  }
});




app.post("/bookRental/:rentalId", requireLogin, async (req, res) => {
  const { rentalId } = req.params;
  const { checkInDate, checkOutDate, totalAmount } = req.body;
  const userId = req.session.userId;

  try {
      // Find the rental request by ID
      const rental = await rentalRequest.findById(rentalId);

      // Ensure the rental exists and is approved by the admin, and is available for booking
      if (!rental || rental.adminStatus !== "Approved" || rental.bookingStatus !== "Available") {
          return res.status(400).send("The rental is either not approved or not available for booking.");
      }

      // Check if the rental is already booked for the desired dates
      const existingBooking = await RentalBooking.findOne({
          rentalId,
          status: { $in: ["Booked", "Ongoing"] },
          $or: [
              { checkInDate: { $lte: checkOutDate }, checkOutDate: { $gte: checkInDate } }, // Overlapping booking
          ],
      });

      if (existingBooking) {
          return res.status(400).send("The rental is already booked for the selected dates.");
      }

      // Create a new rental booking
      const newBooking = new RentalBooking({
          userId,
          rentalId,
          place: rental.place,
          checkInDate,
          checkOutDate,
          totalAmount,
          paymentStatus: "Pending",
          status: "Booked"
      });

      // Save the new booking
      await newBooking.save();

      // Update the rental's booking status to "Booked"
      rental.bookingStatus = "Booked";
      await rental.save();

      // Redirect the user to their bookings page
      res.redirect("/my-Rbookings"); // Redirect to the user's bookings page
  } catch (error) {
      console.error("Booking Error:", error);
      res.render("errors/appError.ejs", { error: "Some error" });

  }
});



app.get("/my-Rbookings", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  try {
      // Step 1: Get all bookings for the user
      const bookings = await RentalBooking.find({ userId });

      // Step 2: Get all rentalIds from those bookings
      const rentalIds = bookings.map(booking => booking.rentalId);

      // Step 3: Fetch rental details in bulk
      const rentalDetails = await rentalRequest.find({
          _id: { $in: rentalIds }
      });

      // Step 4: Merge rental info with bookings
      const bookingsWithRental = bookings.map(booking => {
          const rentalInfo = rentalDetails.find(
              rental => rental._id.toString() === booking.rentalId.toString()
          );
          return {
              ...booking.toObject(),
              rentalInfo
          };
      });
// console.log("The rental info is my-Rbookings get route  :",bookings);
      res.render("BookingR/myRbookings.ejs", { bookings: bookingsWithRental });
  } catch (err) {
      console.error("Error fetching rental bookings:", err);
      res.render("errors/appError.ejs", { error: "Some error" });

  }
});

// rental renewal
// // 📌 Rental Renewal
app.post("/renew-rental/:rentalBookingId", requireLogin, async (req, res) => {
  const { rentalBookingId } = req.params;
  const { additionalDays } = req.body;
  const userId = req.session.userId;

  try {
    // 1. Get the booking
    const rentalBooking = await RentalBooking.findById(rentalBookingId);
    if (!rentalBooking || rentalBooking.userId.toString() !== userId) {
      return res.status(404).send("Booking not found or unauthorized");
    }

    if (rentalBooking.status !== "Booked") {
      return res.status(400).send("Cannot renew a rental that is not currently booked.");
    }

    // 2. Get the rental request manually
    const rental = await rentalRequest.findById(rentalBooking.rentalId);
    if (!rental) return res.status(404).send("Rental not found");

    // 3. Calculate new check-out date
    const originalCheckout = new Date(rentalBooking.checkOutDate);
    const newCheckout = new Date(originalCheckout);
    newCheckout.setDate(newCheckout.getDate() + parseInt(additionalDays));

    // 4. Recalculate total cost
    const dailyRate = rental.price || 0;
    const totalDays = Math.ceil((newCheckout - new Date(rentalBooking.checkInDate)) / (1000 * 60 * 60 * 24));
    const updatedTotal = totalDays * dailyRate;

    // 5. Update and save
    rentalBooking.checkOutDate = newCheckout;
    rentalBooking.totalAmount = updatedTotal;

    await rentalBooking.save();

    res.redirect("/my-Rbookings");
  } catch (error) {
    console.error("Rental Renewal Error:", error);
    res.render("errors/appError.ejs", { error: "Some error" });

  }
});


app.post("/cancel-rental/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { timeDifference } = req.body;

    const booking = await RentalBooking.findById(bookingId);
    if (!booking) return res.status(404).send("Rental booking not found");

    // Calculate cancellation fee
    let cancellationFee = 0;
    if (timeDifference > 20 && timeDifference <= 1440) {
      cancellationFee = booking.totalAmount * 0.10;
    } else if (timeDifference > 1440) {
      const rental = await rentalRequest.findById(booking.rentalId);
      cancellationFee = rental?.price || 0;
    }

    // Update booking
    booking.status = "Cancelled";
    booking.cancellationFee = cancellationFee;
    await booking.save();

    // Set rental to available
    await rentalRequest.findByIdAndUpdate(booking.rentalId, {
      bookingStatus: "Available"
    });

    // Save to rental charges history
 

    if (cancellationFee >= 0) {
      await UserRentalChargesHistory.create({
        userId: booking.userId,
        rentalId: booking.rentalId,
        bookingId: booking._id,
        destination: booking.place,
        fromDate: booking.checkInDate,
        toDate: booking.checkOutDate,
        cancellationFee,
        cancelledAt: new Date()
      });
    }

    // Load user & rental for EJS
    const user = await User.findById(booking.userId);
    const rental = await rentalRequest.findById(booking.rentalId);

    res.render("users/rental-cancel-summary", {
      user,
      rental,
      booking,
      cancellationFee,
      cancelledAt: new Date()
    });
  } catch (error) {
    console.error("Error cancelling rental:", error);
    res.render("errors/appError.ejs", { error: "Some error" });

  }
});


app.get("/my-rentalcharges", requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const history = await UserRentalChargesHistory.find({ userId });

    const formatted = await Promise.all(
      history.map(async (entry) => {
        const rental = await rentalRequest.findById(entry.rentalId);
        return {
          destination: entry.destination,
          fromDate: entry.fromDate,
          toDate: entry.toDate,
          cancelledAt: entry.cancelledAt,
          cancellationFee: entry.cancellationFee,
          rental: {
            location: rental.location,
            price: rental.price,
            propertyType: rental.propertyType
          }
        };
      })
    );

    res.render("users/my-rentalcharges", { charges: formatted });
  } catch (error) {
    console.error("Error fetching rental charges:", error);
    res.render("errors/appError.ejs", { error: "Some error" });

  }
});




// routes/driver.js

// GET form to assign a vehicle to a driver
app.get('/driver/assign-vehicle',isAuthenticated, async (req, res) => {
  try {
    const drivers = await Driver.find();

    const vehicles = await VehicleRequest.find({
      adminStatus: "Approved",
      bookingStatus: "Available",
      currentDriver: null,
    });

    res.render('./driver/assignVehicle', { drivers, vehicles });
  } catch (err) {
    console.error(err);
    res.render("errors/appError.ejs", { error: "Failed to load assign vehicle page." });
  }
});

// POST: Assign vehicle to driver
app.post('/driver/assign-vehicle', async (req, res) => {
  const { driverId, vehicleId } = req.body;

  try {
    await Driver.updateMany({ currentVehicle: vehicleId }, { $set: { currentVehicle: null } });

    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { currentVehicle: vehicleId },
      { new: true }
    );

    if (!updatedDriver) {
      return res.render("errors/appError.ejs", { error: "Driver not found." });
    }

    await VehicleRequest.findByIdAndUpdate(vehicleId, { currentDriver: driverId });

    console.log(`✅ Vehicle ${vehicleId} is now assigned to driver ${updatedDriver.username}`);
    res.redirect('/driver/assign-vehicle');
  } catch (err) {
    console.error("❌ Error assigning vehicle:", err);
    res.render("errors/appError.ejs", { error: "Failed to assign vehicle to driver." });
  }
});

// GET: Assign a new driver to any approved vehicle
app.get('/driver/assign-vehicleNewDriver', isAuthenticated, async (req, res) => {
  try {
    const drivers = await Driver.find();
    const vehicles = await VehicleRequest.find({ adminStatus: "Approved" });

    res.render('./driver/assignNewDriverToVehicle', { drivers, vehicles });
  } catch (err) {
    console.error(err);
    res.render("errors/appError.ejs", { error: "Failed to load new driver assignment page." });
  }
});

// POST: Assign a new driver to a vehicle and update all bookings
app.post('/driver/assign-vehicleNewDriver', async (req, res) => {
  const { driverId, vehicleId } = req.body;

  try {
    await Driver.updateMany({ currentVehicle: vehicleId }, { $set: { currentVehicle: null } });

    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { currentVehicle: vehicleId },
      { new: true }
    );

    if (!updatedDriver) {
      return res.render("errors/appError.ejs", { error: "Driver not found." });
    }

    await VehicleRequest.findByIdAndUpdate(vehicleId, { currentDriver: driverId });

    await Booking.updateMany(
      { vehicleId: vehicleId },
      { $set: { driverId: driverId } }
    );

    console.log(`✅ Vehicle ${vehicleId} is now assigned to driver ${updatedDriver.username}`);
    res.redirect('/admin');
  } catch (err) {
    console.error("❌ Error assigning vehicle:", err);
    res.render("errors/appError.ejs", { error: "Failed to reassign driver to vehicle." });
  }
});

// GET: Add driver form
app.get("/driver/add",isAuthenticated, async (req, res) => {
  try {
    res.render("./driver/addDriver");
  } catch (err) {
    console.error(err);
    res.render("errors/appError.ejs", { error: "Failed to load add driver form." });
  }
});

// POST: Add a new driver
app.post("/driver/add",isAuthenticated, async (req, res) => {
  try {
    const { username, phone, email, place } = req.body;

    const newDriver = new Driver({
      username,
      phone,
      email,
      place,
      currentVehicle: null,
      password: process.env.DRIVER_PASS
    });

    await newDriver.save();
    res.redirect("/admin");
  } catch (error) {
    console.error("Error adding driver:", error);
    res.render("errors/appError.ejs", { error: "Failed to add driver. Please try again." });
  }
});







/// Middleware to ensure driver is logged in
function requireDriverLogin(req, res, next) {
  if (!req.session.driver_id) {
    return res.redirect("/driver/login");
  }
  next();
}

// GET: Driver login page
app.get("/driver/login", (req, res) => {
  res.render("./driver/driverLogin");
});

// GET: Driver logout
app.get("/driver/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/driver/login");
  });
});

// POST: Driver login
app.post("/driver/login", async (req, res) => {
  const { phone, email, password } = req.body;

  try {
    const driver = await Driver.findOne({ phone, email });

    if (!driver) {
      return res.render("errors/appError.ejs", { error: "Driver not found with provided phone and email." });
    }

    const isMatch = await driver.comparePassword(password);
    if (!isMatch) {
      return res.render("errors/appError.ejs", { error: "Invalid password. Please try again." });
    }

    req.session.driver_id = driver._id;
    res.redirect("/driver/home");
  } catch (error) {
    console.error("Driver login error:", error);
    res.render("errors/appError.ejs", { error: "Server error during login." });
  }
});

// GET: Driver home page
app.get("/driver/home", requireDriverLogin, async (req, res) => {
  try {
    const driver = await Driver.findById(req.session.driver_id);
    if (!driver) {
      return res.render("errors/appError.ejs", { error: "Driver not found." });
    }

    res.render("Driver/driverPage", { driver });
  } catch (error) {
    console.error("Error loading driver home:", error);
    res.render("errors/appError.ejs", { error: "Unable to load driver home page." });
  }
});

// GET: Customer details page (for this driver)
app.get("/driver/customer-details", requireDriverLogin, async (req, res) => {
  try {
    const driverId = req.session.driver_id;

    const bookings = await Booking.find({ driverId, vehicleStatus: "Booked" });

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const user = await User.findById(booking.userId);
        const vehicle = await VehicleRequest.findById(booking.vehicleId);

        return {
          ...booking.toObject(),
          user: user ? user.toObject() : null,
          vehicle: vehicle ? vehicle.toObject() : null,
        };
      })
    );

    res.render("./driver/customerList", { bookings: enrichedBookings });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    res.render("errors/appError.ejs", { error: "Unable to fetch customer details." });
  }
});


// POST: Fetch customer details by driver ID (optional use)
app.post("/driver/customer-details", async (req, res) => {
  const { driverId } = req.body;

  try {
    const bookings = await Booking.find({ driverId, vehicleStatus: "Booked" });

    const customerDetails = await Promise.all(
      bookings.map(async (booking) => {
        const user = await User.findById(booking.userId);
        return {
          bookingId: booking._id,
          place: booking.place,
          pickupDate: booking.pickupDate,
          dropoffDate: booking.dropoffDate,
          username: user?.username || "Unknown",
          phone: user?.phone || "N/A",
        };
      })
    );

    res.render("./driver/customerList", { customers: customerDetails });
  } catch (err) {
    console.error("Error fetching customer details:", err);
    res.render("errors/appError.ejs", { error: "Error retrieving customer information." });
  }
});

// POST: Complete a ride
app.post("/driver/complete-ride/:bookingId", requireDriverLogin, async (req, res) => {
  const bookingId = req.params.bookingId;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.render("errors/appError.ejs", { error: "Booking not found." });
    }

    if (booking.vehicleId) {
      const vehicle = await VehicleRequest.findById(booking.vehicleId);

      if (vehicle) {
        vehicle.bookingStatus = "Available";
        await vehicle.save();
      }
    }

    booking.vehicleStatus = "Completed";
    await booking.save();

    res.redirect("/driver/customer-details");
  } catch (err) {
    console.error("Error completing ride:", err);
    res.render("errors/appError.ejs", { error: "Failed to complete ride. Please try again." });
  }
});



// Middleware: Ensure owner is logged in
function requireOwnerLogin(req, res, next) {
  if (!req.session.owner_id) {
    return res.redirect("/owner/login");
  }
  next();
}

// GET: Owner Login Page
app.get("/owner/login", (req, res) => {
  res.render("rentalOwner/ownerLogin");
});

// GET: Owner Logout
app.get("/owner/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/owner/login");
  });
});

// POST: Owner Login Handler
app.post("/owner/login", async (req, res) => {
  const { phone, email, password } = req.body;

  try {
    const rental = await rentalRequest.findOne({ contact: phone, email });

    if (!rental) {
      return res.render("errors/appError.ejs", {
        error: "Rental owner not found. Please ensure phone and email match your registered details."
      });
    }

    const isMatch = await rental.comparePassword(password);
    if (!isMatch) {
      return res.render("errors/appError.ejs", {
        error: "Invalid password. Please try again."
      });
    }

    console.log("Owner login successful. ID:", rental._id);

    req.session.owner_id = rental._id;
    res.redirect("/owner/home");
  } catch (err) {
    console.error("Owner login error:", err);
    res.render("errors/appError.ejs", { error: "Server error during login. Please try again later." });
  }
});


// GET: Owner Home Page
app.get("/owner/home", requireOwnerLogin, async (req, res) => {
  try {
    const rental = await rentalRequest.findById(req.session.owner_id);

    if (!rental) {
      return res.render("errors/appError.ejs", { error: "Rental owner not found." });
    }

    res.render("rentalOwner/ownerPage", { rental });
  } catch (err) {
    console.error("Error loading owner home page:", err);
    res.render("errors/appError.ejs", { error: "Unable to load home page." });
  }
});

// GET: Rental Owner's Customer Details
app.get("/owner/customer-details", requireOwnerLogin, async (req, res) => {
  try {
    const rentalId = req.session.owner_id;
    console.log("The rentalId in GET /owner/customer-details route:", rentalId);

    const bookings = await RentalBooking.find({ rentalId, status: "Booked" });

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const user = await User.findById(booking.userId);
        return {
          ...booking.toObject(),
          user: user ? user.toObject() : null,
        };
      })
    );

    res.render("rentalOwner/customerList", { bookings: enrichedBookings });
  } catch (err) {
    console.error("Error fetching rental customers:", err);

    let errorMessage = "An error occurred while fetching customer details.";
    if (err.name === "CastError") {
      errorMessage = "Invalid rental ID format.";
    } else if (err.name === "ValidationError") {
      errorMessage = "Data validation failed.";
    } else if (err.code === 11000) {
      errorMessage = "Duplicate entry detected.";
    }

    res.render("errors/appError.ejs", { error: errorMessage });
  }
});

// POST: Complete Rental Booking
app.post("/owner/complete-booking/:bookingId", requireOwnerLogin, async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await RentalBooking.findById(bookingId);
    if (!booking) {
      return res.render("errors/appError.ejs", { error: "Booking not found." });
    }

    booking.status = "Completed";
    await booking.save();

    await rentalRequest.findByIdAndUpdate(booking.rentalId, {
      bookingStatus: "Available",
    });

    res.redirect("/owner/customer-details");
  } catch (err) {
    console.error("Error completing rental booking:", err);
    res.render("errors/appError.ejs", { error: "Failed to complete the booking. Please try again." });
  }
});


// ========================= DRIVER PROFILE =========================

app.get("/driver/profile", requireDriverLogin, async (req, res) => {
  try {
    const driver = await Driver.findById(req.session.driver_id);

    if (!driver) {
      return res.render("errors/appError.ejs", { error: "Driver not found." });
    }

    const success = req.session.success || null;
    const error = req.session.error || null;
    req.session.success = null;
    req.session.error = null;

    res.render("driver/driverProfile", { driver, success, error });
  } catch (err) {
    console.error("Error loading driver profile:", err);
    res.render("errors/appError.ejs", { error: "Unable to load driver profile." });
  }
});

app.post("/driver/profile", requireDriverLogin, async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  try {
    if (!newPassword || !confirmPassword) {
      req.session.error = "Password fields cannot be empty";
      return res.redirect("/driver/profile");
    }

    if (newPassword !== confirmPassword) {
      req.session.error = "Passwords do not match";
      return res.redirect("/driver/profile");
    }

    const driver = await Driver.findById(req.session.driver_id);
    if (!driver) {
      req.session.error = "Driver not found";
      return res.redirect("/driver/profile");
    }

    driver.password = newPassword;
    await driver.save();

    req.session.success = "Password updated successfully";
    res.redirect("/driver/profile");
  } catch (err) {
    console.error("Error updating driver password:", err);
    req.session.error = "An error occurred while updating your password";
    res.redirect("/driver/profile");
  }
});

// ========================= OWNER PROFILE =========================

app.get("/owner/profile", requireOwnerLogin, async (req, res) => {
  try {
    const owner = await rentalRequest.findById(req.session.owner_id);
    if (!owner) {
      return res.render("errors/appError.ejs", { error: "Owner not found." });
    }
    res.render("rentalOwner/ownerProfile", { owner, error: null, success: null });
  } catch (err) {
    console.error("Error loading owner profile:", err);
    res.render("errors/appError.ejs", { error: "Unable to load owner profile." });
  }
});

app.post("/owner/profile", requireOwnerLogin, async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  try {
    const owner = await rentalRequest.findById(req.session.owner_id);
    if (!owner) {
      return res.render("errors/appError.ejs", { error: "Owner not found." });
    }

    if (!newPassword || !confirmPassword) {
      return res.render("rentalOwner/ownerProfile", {
        owner,
        error: "Password fields cannot be empty",
        success: null
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("rentalOwner/ownerProfile", {
        owner,
        error: "Passwords do not match",
        success: null
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    owner.password = hashedPassword;
    await owner.save();

    res.render("rentalOwner/ownerProfile", {
      owner,
      success: "Password updated successfully",
      error: null
    });
  } catch (err) {
    console.error("Error updating owner password:", err);
    const owner = await rentalRequest.findById(req.session.owner_id);
    res.render("rentalOwner/ownerProfile", {
      owner,
      error: "An error occurred while updating your password",
      success: null
    });
  }
});

// ========================= USER PROFILE =========================

app.get("/user/profile", requireLogin, async (req, res) => {
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
});

app.post("/user/profile", requireLogin, async (req, res) => {
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
});


app.get("/quickexploreDFDd1",isAuthenticated, (req, res) => {
  res.render("docsqe/Physical_DFD_QuickExplore");
})

app.get("/quickexploreDFDd2",isAuthenticated, (req, res) => {
  res.render("docsqe/Physical_DFD_QuickExplore2");
})

app.get("/quickexploreSA",isAuthenticated, (req, res) => {
  res.render("docsqe/QuickExplore_Architecture");
})


// Catch-all route for undefined routes (404 - Not Found)
app.get('*', (req, res) => {
  const error = 'Page not found'; // Message to be displayed
  const statusCode = 404; // Error code
  const stack = process.env.NODE_ENV === 'development' ? 'Stack trace here' : null; // Only show stack in development

  res.status(statusCode).render("errors/appError", { error, statusCode, stack });
});


// Start Server
app.listen(port,()=>{
  console.log("app is listening on port : 8080");
})