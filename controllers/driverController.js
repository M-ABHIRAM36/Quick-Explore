const Driver = require("../models/Driver.js");
const VehicleRequest = require("../models/vehicleRequest");
const Booking = require("../models/bookingVehicle.js");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// ========================= ADMIN: DRIVER MANAGEMENT =========================

// GET form to assign a vehicle to a driver
module.exports.renderAssignVehicle = async (req, res) => {
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
};

// POST: Assign vehicle to driver
module.exports.assignVehicle = async (req, res) => {
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
};

// GET: Assign a new driver to any approved vehicle
module.exports.renderAssignNewDriver = async (req, res) => {
  try {
    const drivers = await Driver.find();
    const vehicles = await VehicleRequest.find({ adminStatus: "Approved" });

    res.render('./driver/assignNewDriverToVehicle', { drivers, vehicles });
  } catch (err) {
    console.error(err);
    res.render("errors/appError.ejs", { error: "Failed to load new driver assignment page." });
  }
};

// POST: Assign a new driver to a vehicle and update all bookings
module.exports.assignNewDriver = async (req, res) => {
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
};

// GET: Add driver form
module.exports.renderAddDriver = async (req, res) => {
  try {
    res.render("./driver/addDriver");
  } catch (err) {
    console.error(err);
    res.render("errors/appError.ejs", { error: "Failed to load add driver form." });
  }
};

// POST: Add a new driver
module.exports.addDriver = async (req, res) => {
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
};

// ========================= DRIVER AUTH =========================

// GET: Driver login page
module.exports.renderLoginForm = (req, res) => {
  res.render("./driver/driverLogin");
};

// GET: Driver logout
module.exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/driver/login");
  });
};

// POST: Driver login
module.exports.login = async (req, res) => {
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
};

// ========================= DRIVER PAGES =========================

// GET: Driver home page
module.exports.home = async (req, res) => {
  try {
    const driver = await Driver.findById(req.session.driver_id);
    if (!driver) {
      return res.render("errors/appError.ejs", { error: "Driver not found." });
    }

    res.render("driver/driverPage", { driver });
  } catch (error) {
    console.error("Error loading driver home:", error);
    res.render("errors/appError.ejs", { error: "Unable to load driver home page." });
  }
};

// GET: Customer details page (for this driver)
module.exports.getCustomerDetails = async (req, res) => {
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
};

// POST: Fetch customer details by driver ID (optional use)
module.exports.postCustomerDetails = async (req, res) => {
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
};

// POST: Complete a ride
module.exports.completeRide = async (req, res) => {
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
};

// 🚗 Cancel ride by driver
module.exports.cancelRide = async (req, res) => {
  try {
    console.log("Cancelling ride...");
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    console.log("Booking found:", booking);

    if (!booking) {
      return res.render("errors/appError.ejs", { error: "Booking not found" });
    }

    if (!booking.driverId) {
      return res.render("errors/appError.ejs", { error: "No driver assigned to this booking" });
    }

    // Calculate cancellation fee based on time difference
    const pickupDate = new Date(booking.pickupDate);
    const now = new Date();
    const timeDifference = Math.abs(pickupDate - now) / (1000 * 60); // in minutes

    let cancellationFee = 0;
    if (timeDifference > 20 && timeDifference <= 1440) { // Between 20 minutes and 24 hours
      cancellationFee = booking.totalAmount * 0.10; // 10% of total amount
    } else if (timeDifference > 1440) { // More than 24 hours
      const vehicle = await VehicleRequest.findById(booking.vehicleId);
      cancellationFee = vehicle?.rentalPricePerDay || 0; // One day's rent
    }

    // Update booking status
    booking.vehicleStatus = "Cancelled";
    
    booking.cancelledBy = "driver";
    await booking.save();

    // Update vehicle status
    await VehicleRequest.findByIdAndUpdate(booking.vehicleId, { 
      bookingStatus: "Available",
    });



    // Record transaction if there's a cancellation fee
    if (cancellationFee > 0) {
      await Transaction.create({
        userId: booking.userId,
        vehicleId: booking.vehicleId,
        amount: cancellationFee,
        type: "Cancellation Fee"
      });
    }

console.log("Ride cancelled successfully");
    res.redirect("/driver/customer-details");
  } catch (error) {
    console.error("Error canceling ride:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
};

// ========================= DRIVER PROFILE =========================

// GET: Driver profile
module.exports.renderProfile = async (req, res) => {
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
};

// POST: Update driver password
module.exports.updateProfile = async (req, res) => {
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
};
