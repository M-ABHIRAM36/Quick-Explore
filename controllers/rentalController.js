const rentalRequest = require("../models/rentalRequest");
const bcrypt = require("bcrypt");

// GET rental request form
module.exports.renderRentalForm = (req, res) => {
  try {
    res.render("./listing/rentalRform.ejs");
  } catch (err) {
    console.error("Error loading rentalRform:", err);
    res.render("errors/appError.ejs");
  }
};

// GET all rental requests (admin view)
module.exports.getAllRentalRequests = async (req, res) => {
  try {
    const allRentalData = await rentalRequest.find();
    res.render("./requestForms/rentalForms.ejs", { allRentalData });
  } catch (error) {
    console.error("Error fetching rental data:", error);
    res.render("errors/error", { error: "Failed to load rental data. Please try again later." });
  }
};

// POST submit rental request form (with image upload)
module.exports.submitRentalRequest = async (req, res) => {
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
};

// GET rental user credential page
module.exports.renderUserCredentialR = (req, res) => {
  try {
    const userCdata = req.query;
    res.render("./listing/usercredentialR.ejs", { userCdata });
  } catch (err) {
    console.error("Error loading usercredentialR:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
};

// POST update rental price (admin)
module.exports.updatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    await rentalRequest.findByIdAndUpdate(id, { price });
    res.redirect("/requestForms/rentalForms");
  } catch (error) {
    console.error("Error updating price:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
};

// POST update rental status (admin)
module.exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminStatus } = req.body;
    await rentalRequest.findByIdAndUpdate(id, { adminStatus });
    res.redirect("/requestForms/rentalForms");
  } catch (error) {
    console.error("Error updating status:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
};

// **GET - Render Rental Status Form**
module.exports.renderStatusForm = (req, res) => {
  try {
    res.render("./checkStatus/checkRstatusF.ejs");
  } catch (err) {
    console.error("Error rendering rental status form:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
};

// **POST - Fetch Rental Request Status**
module.exports.checkRentalStatus = async (req, res) => {
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
};
