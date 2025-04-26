const mongoose = require("mongoose");
const Driver = require("../models/Driver");
const Vehicle = require("../models/vehicleRequest");
require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');



const MONGO_URL = process.env.MONGO_ATLAS_URL;

mongoose.connect(MONGO_URL)
  .then(async () => {
    const places = [
      "Charminar", "Golconda Fort", "Ramoji Film City", "Bhadrakali Temple", "Kuntala Waterfalls",
      "Nagarjuna Sagar Dam", "Pakhal Lake", "Medak Cathedral", "Bogatha Waterfall", "Laknavaram Lake",
      "Yadagirigutta Temple", "Ananthagiri Hills", "Kadam Dam", "Alampur Jogulamba Temple", "Khammam Fort",
      "Pocharam Wildlife Sanctuary", "Ethipothala Falls", "Warangal Fort", "Sammakka Saralamma Temple",
      "Thousand Pillar Temple", "Bhadrachalam Temple", "Sri Raja Rajeshwara Temple", "Kakatiya Musical Garden",
      "Sri Ramalingeswara Temple", "Edulabad Waterfalls", "Ananthagiri Temple",
      "Sri Lakshmi Narasimha Swamy Temple", "Kinnerasani Wildlife Sanctuary", "Dhulikatta Buddhist Stupa",
      "Jagtial Fort", "Bhongir Fort", "Nizam Sagar Dam", "Sri Kaleshwara Mukteswara Swamy Temple",
      "Jadcherla Sri Lakshmi Venkateswara Swamy Temple", "Pillalamarri Banyan Tree", "Koilkonda Fort",
      "Manthani Temples", "Mayuri Haritha Vanam", "Chaya Someswara Temple", "Jurala Dam", "Rachakonda Fort",
      "Surendrapuri Mythological Museum", "Narsapur Forest", "Antharaganga Waterfalls", "Kinnerasani Dam",
      "Medaram Jatara Festival Grounds", "Shamirpet Lake", "Dichpally Ramalayam", "Pochera Waterfalls",
      "Eegalapenta Reservoir", "Phanigiri Buddhist Site","Ananta Padmanabha Swamy Temple","Ramappa Temple"
    ];
    // 300 driver are assigned
    const driversData = await Promise.all(
      Array.from({ length: 300 }, async (_, i) => {
        const hashedPassword = await bcrypt.hash(process.env.DRIVER_PASS, 12);
        return {
          username: `driver-qe`,
          phone: `98765${(10000 + i).toString().slice(-5)}`,
          email: `driver${i + 1}@gmail.com`,
          currentVehicle: null,
          place: places[Math.floor(Math.random() * places.length)],
          password: hashedPassword
        };
      })
    );
    
    

    await Driver.deleteMany({});

    // Insert drivers into the database
    const drivers = await Driver.insertMany(driversData);    
    console.log("300 drivers inserted!");

    // Fetch all vehicles from the database
    const vehicles = await Vehicle.find();
    if (vehicles.length === 0) {
      console.log("No vehicles found in the database. Please make sure there are vehicles in the database.");
      return;
    }

    // Ensure we have drivers before assigning them to vehicles
    if (drivers.length === 0) {
      console.log("No drivers found to assign.");
      return;
    }

    console.log(`Found ${vehicles.length} vehicles and ${drivers.length} drivers.`);

    // Assign each vehicle a driver (round-robin assignment if there are more vehicles than drivers)
    const vehicleAssignments = vehicles.map(async (vehicle, index) => {
      // Find the driver by id (round-robin assignment)
      const driverIndex = index % drivers.length;
      const driver = drivers[driverIndex]; // Use the driver directly from the inserted array

      if (!driver) {
        console.log(`Driver ${driverIndex} is missing!`);
        return;
      }

      // Assign the driver to the vehicle
      vehicle.currentDriver = driver._id;
      driver.currentVehicle = vehicle._id;

      // Debug: Checking if the assignment is correct
      console.log(`Assigning driver ${driver.username} (ID: ${driver._id}) to vehicle ${vehicle.registrationNumber}`);

      await vehicle.save(); // Save the updated vehicle
      await driver.save(); // Save the updated driver

      console.log(`Assigned driver ${driver.username} to vehicle ${vehicle.registrationNumber}`);
    });

    // Wait for all vehicle assignments to complete
    await Promise.all(vehicleAssignments);
    console.log("All vehicles assigned to drivers!");

    mongoose.disconnect();
  })
  .catch(err => {
    console.error("DB connection failed", err);
    mongoose.disconnect();
  });
