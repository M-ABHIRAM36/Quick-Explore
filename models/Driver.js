
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const driverSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  currentVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vehicleRequest",
    default: null
  },
  place: {
    type: String,
    required: true
  },
  password:{
    type:String,
    required:true
  }
});

// 🔐 Pre-save: hash the password
driverSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
driverSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
const Driver = mongoose.model("Driver", driverSchema);
module.exports = Driver;

