const rentalRequest = require("../models/rentalRequest");
const RentalBooking = require("../models/bookingRental.js");
const User = require("../models/User");
const UserRentalChargesHistory = require("../models/UserRentalChargesHistory");
const bcrypt = require("bcrypt");

// ========================= OWNER AUTH =========================

// GET: Owner Login Page
module.exports.renderLoginForm = (req, res) => {
  res.render("rentalOwner/ownerLogin");
};

// GET: Owner Logout
module.exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/owner/login");
  });
};

// POST: Owner Login Handler
module.exports.login = async (req, res) => {
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
};

// ========================= OWNER PAGES =========================

// GET: Owner Home Page
module.exports.home = async (req, res) => {
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
};

// GET: Rental Owner's Customer Details
module.exports.getCustomerDetails = async (req, res) => {
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
};

// POST: Complete Rental Booking
module.exports.completeBooking = async (req, res) => {
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
};

// POST: Cancel Rental Booking by Owner
module.exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await RentalBooking.findById(bookingId);
    if (!booking) {
      return res.render("errors/appError.ejs", { error: "Booking not found." });
    }

    // Calculate cancellation fee based on time difference
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const timeDifference = Math.abs(checkInDate - now) / (1000 * 60); // in minutes

    let cancellationFee = 0;
    if (timeDifference > 20 && timeDifference <= 1440) { // Between 20 minutes and 24 hours
      cancellationFee = booking.totalAmount * 0.10; // 10% of total amount
    } else if (timeDifference > 1440) { // More than 24 hours
      const rental = await rentalRequest.findById(booking.rentalId);
      cancellationFee = rental?.price || 0; // One day's rent
    }

    // Update booking status
    booking.status = "Cancelled";
    booking.cancellationFee = cancellationFee;
    booking.cancelledBy = "owner";
    await booking.save();

    // Update rental status
    await rentalRequest.findByIdAndUpdate(booking.rentalId, {
      bookingStatus: "Available"
    });

    // Record in user charges history
    if (cancellationFee > 0) {
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

    res.redirect("/owner/customer-details");
  } catch (err) {
    console.error("Error cancelling rental booking:", err);
    res.render("errors/appError.ejs", { error: "Failed to cancel the booking. Please try again." });
  }
};

// ========================= OWNER PROFILE =========================

// GET: Owner Profile
module.exports.renderProfile = async (req, res) => {
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
};

// POST: Update Owner Password
module.exports.updateProfile = async (req, res) => {
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
};
