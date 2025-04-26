
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const RentalRequest = require("../models/rentalRequest");
require('dotenv').config({ path: '../.env' });


const MONGO_URL = process.env.MONGO_ATLAS_URL;


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

const imageLinks = [
  "https://res.cloudinary.com/dievkt7ez/image/upload/v1745265479/quickexplore_DEV/house.jpg",
  "https://res.cloudinary.com/dievkt7ez/image/upload/v1745347355/quickexplore_DEV/house2.jpg",
  "https://res.cloudinary.com/dievkt7ez/image/upload/v1745499216/house2_nvjpq7.jpg",
  "https://res.cloudinary.com/dievkt7ez/image/upload/v1745499216/house_al9p4e.jpg",
  "https://res.cloudinary.com/dievkt7ez/image/upload/v1745499216/house3_jbrwuq.jpg",
  "https://res.cloudinary.com/dievkt7ez/image/upload/v1745499217/house4_gr3euy.jpg",
  "https://res.cloudinary.com/dievkt7ez/image/upload/v1745347355/quickexplore_DEV/house2.jpg",
  "https://res.cloudinary.com/dievkt7ez/image/upload/v1745265479/quickexplore_DEV/house.jpg",
  "https://res.cloudinary.com/dievkt7ez/image/upload/v1745499279/apartment_cl4l5m.jpg"
];

const propertyTypes = ["House", "Apartment", "PG", "Room", "Villa"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateRental(index) {
  const place = places[getRandomInt(0, places.length - 1)];
  const ownerName = `Owner-qe`;
  const rawPassword = `QuickE@${index}`;
  const hashedPassword = await bcrypt.hash(rawPassword, 12);

    // Use Cloudinary images for first 100, fallback to sample paths after that
    const image =
    index <= 100
      ? imageLinks[Math.floor(Math.random() * imageLinks.length)]
      : `/images/rentals/sample${index}.jpg`;

  return {
    ownerName,
    contact: `${getRandomInt(6000000000, 9999999999)}`,
    email: `owner${index}@gmail.com`,
    password: hashedPassword,
    propertyType: propertyTypes[getRandomInt(0, propertyTypes.length - 1)],
    location: `${place}, Telangana`,
    place,
    distFromPlace: getRandomInt(1, 25),
    pincode: getRandomInt(500001, 509999),
    price: getRandomInt(1000, 5000),
    images: [image],
    description: `A lovely stay near ${place}. Perfect for families or solo travelers.`,
    adminStatus: "Approved",
    bookingStatus: "Available",
    createdAt: new Date()
  };
}

async function seedRentals() {
  await mongoose.connect(MONGO_URL);
  await RentalRequest.deleteMany({});

  const rentalPromises = [];
  for (let i = 1; i <= 300; i++) {
    rentalPromises.push(generateRental(i));
  }

  const rentals = await Promise.all(rentalPromises);
  await RentalRequest.insertMany(rentals);
  console.log("✅ 300 rentals added with hashed passwords (quick1 to quick300)");
  mongoose.disconnect();
}

seedRentals();
