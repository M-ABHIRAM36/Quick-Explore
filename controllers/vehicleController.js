const VehicleRequest = require("../models/vehicleRequest");

// GET vehicle request form
module.exports.renderVehicleForm = (req, res) => {
  try {
    res.render("./listing/vehicleRform.ejs");
  } catch (err) {
    console.error("Error loading vehicleRform:", err);
    res.render("errors/appError.ejs");
  }
};

// GET all vehicle requests (admin view)
module.exports.getAllVehicleRequests = async (req, res) => {
  try {
    const allvData = await VehicleRequest.find();
    res.render("./requestForms/vehicleForms", { allvData });
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    res.render("errors/error", {
      error: "Failed to load vehicle data. Please try again later.",
    });
  }
};

// POST submit vehicle request form (with image upload)
module.exports.submitVehicleRequest = async (req, res) => {
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
};

// GET user credential page
module.exports.renderUserCredential = (req, res) => {
  try {
    const userCdata = req.query;
    res.render("./listing/usercredential.ejs", { userCdata });
  } catch (err) {
    console.error("Error loading usercredential:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
};

// Approve vehicle request by updating the adminStatus
module.exports.updateVehicleStatus = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const newAdminStatus = req.body.adminStatus;
    await VehicleRequest.findByIdAndUpdate(vehicleId, { adminStatus: newAdminStatus });
    res.redirect("/requestForms/vehicleForms");
  } catch (error) {
    console.error("Error updating vehicle status:", error);
    res.render("errors/appError.ejs", { error: error.message });
  }
};

/// **GET - Render Vehicle Status Form**
module.exports.renderStatusForm = (req, res) => {
  try {
    res.render("./checkStatus/checkVstatusF.ejs");
  } catch (err) {
    console.error("Error rendering vehicle status form:", err);
    res.render("errors/appError.ejs", { error: err.message });
  }
};

// **POST - Fetch Vehicle Request Status**
module.exports.checkVehicleStatus = async (req, res) => {
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
};
