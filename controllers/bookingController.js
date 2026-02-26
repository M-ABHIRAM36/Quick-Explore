const ListingP = require("../models/listingP");
const VehicleRequest = require("../models/vehicleRequest");
const rentalRequest = require("../models/rentalRequest");
const Booking = require("../models/bookingVehicle.js");
const RentalBooking = require("../models/bookingRental.js");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Driver = require("../models/Driver.js");
const UserChargesHistory = require("../models/UserChargesHistory");
const UserRentalChargesHistory = require("../models/UserRentalChargesHistory");

// ========================= PLACES =========================

// GET all places
module.exports.getPlaces = async (req, res) => {
  try {
    const places = await ListingP.find();
    res.render("./listing/places2.ejs", { places });
  } catch (err) {
    console.error("Error loading places:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
};

// GET single place view
module.exports.viewPlace = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await ListingP.find({ _id: id });
    res.render("./listing/viewP.ejs", { place });
  } catch (err) {
    console.error("Error loading listing view:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
};

// ========================= VEHICLE BOOKINGS =========================

/// 📌 Fetch available vehicles for a place
module.exports.getAvailableVehicles = async (req, res) => {
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
};

// 🚗 Booking a vehicle
module.exports.bookVehicle = async (req, res) => {
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
};

// 📌 View User Bookings 
module.exports.getMyBookings = async (req, res) => {
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
          cancelledBy: booking.cancelledBy || null, // 👈 Add 
        };
      })
    );

    res.render("./BookingV/myBookings.ejs", { bookings: enrichedBookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
};

// 🔁 Renew vehicle booking
module.exports.renewBooking = async (req, res) => {
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
};

// ❌ Cancel booking
module.exports.cancelBooking = async (req, res) => {
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
    booking.cancelledBy = "driver";
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
};

// GET my vehicle charges
module.exports.getMyCharges = async (req, res) => {
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
};

// ========================= RENTAL BOOKINGS =========================

/// 📌 Get available rooms near a place
module.exports.getAvailableRooms = async (req, res) => {
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
};

// POST book a rental
module.exports.bookRental = async (req, res) => {
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
};

// GET my rental bookings
module.exports.getMyRentalBookings = async (req, res) => {
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
};

// // 📌 Rental Renewal
module.exports.renewRental = async (req, res) => {
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
};

// Cancel rental booking
module.exports.cancelRental = async (req, res) => {
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
};

// GET my rental charges
module.exports.getMyRentalCharges = async (req, res) => {
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
};
