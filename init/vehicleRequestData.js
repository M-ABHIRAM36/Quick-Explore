const mongoose = require("mongoose");
const VehicleRequest = require("../models/vehicleRequest.js");
require('dotenv').config({ path: '../.env' });



const MONGO_URL = process.env.MONGO_ATLAS_URL;


// List of tourist places for rentals
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
        "https://res.cloudinary.com/dievkt7ez/image/upload/v1745498629/Maruti-Suzuki-Baleno_kxad8r.avif",
        "https://res.cloudinary.com/dievkt7ez/image/upload/v1745502694/maruti-suzuki-dzire-1_s7knw5.webp",
        "https://res.cloudinary.com/dievkt7ez/image/upload/v1745498587/tata_harrier_ky2b1m.jpg",
        "https://res.cloudinary.com/dievkt7ez/image/upload/v1745498122/car1_vf8cvx.webp",
        "https://res.cloudinary.com/dievkt7ez/image/upload/v1745499218/jeep_vtja9l.jpg",
        "https://res.cloudinary.com/dievkt7ez/image/upload/v1745499215/harrier_q92qdz.jpg",
        "https://res.cloudinary.com/dievkt7ez/image/upload/v1745499086/volvo_fp1ugu.jpg",
        "https://res.cloudinary.com/dievkt7ez/image/upload/v1745498075/BMW2_nbzaqy.webp",
        "https://res.cloudinary.com/dievkt7ez/image/upload/v1745264192/quickexplore_DEV/bmw.jpg",
        "https://res.cloudinary.com/dievkt7ez/image/upload/v1745499214/activa_asootm.jpg"
    ];
// Sample vehicle data (initial hardcoded vehicles)
const vehicleRequests = [
    {
        ownerName: "RaviKumar",
        contact: "9876543210",
        email: "ravi@gmail.com",
        vehicleType: "4-Wheeler",
        brand: "Hyundai",
        model: "Creta",
        registrationNumber: "TS09AB1234",
        location: "Madhapur, Hyderabad",
        place: "Charminar",
        pincode: 500081,
        images: ["https://stimg.cardekho.com/images/carexteriorimages/930x620/Hyundai/Creta/7695/1651645683867/front-left-side-47.jpg"],
        rentalPricePerDay: 2500,
        availableFrom: new Date("2025-04-01"),
        availableTo: new Date("2025-06-01"),
        status: "Approved",
        adminStatus: "Approved", // Updated field
        bookingStatus: "Available", // Updated field
        currentDriver: null // No driver assigned yet
    },
    {
        ownerName: "SitaSharma",
        contact: "9012345678",
        email: "sita@gmail.com",
        vehicleType: "2-Wheeler",
        brand: "Honda",
        model: "Activa",
        registrationNumber: "TS07CD5678",
        location: "Kukatpally, Hyderabad",
        place: "Golconda Fort",
        pincode: 500072,
        images: ["https://telugu.cdn.zeenews.com/telugu/sites/default/files/Honda-Activa-6G-price-in-india.jpg"],
        rentalPricePerDay: 500,
        availableFrom: new Date("2025-04-10"),
        availableTo: new Date("2025-05-20"),
        status: "Approved",
        adminStatus: "Approved", // Updated field
        bookingStatus: "Available", // Updated field
        currentDriver: null // No driver assigned yet
    },
    {
        ownerName: "AmitPatel",
        contact: "9123456789",
        email: "amit@gmail.com",
        vehicleType: "4-Wheeler",
        brand: "Maruti",
        model: "Swift",
        registrationNumber: "TS05EF9101",
        location: "Secunderabad, Hyderabad",
        place: "Ramoji Film City",
        pincode: 500003,
        images: ["https://5.imimg.com/data5/LU/PE/HY/SELLER-29014811/maruti-swift.jpg"],
        rentalPricePerDay: 1800,
        availableFrom: new Date("2025-04-05"),
        availableTo: new Date("2025-07-10"),
        status: "Approved",
        adminStatus: "Approved", // Updated field
        bookingStatus: "Available", // Updated field
        currentDriver: null // No driver assigned yet
    }
];

// Function to generate random sample data
const generateVehicles = () => {
    const vehicleTypes = ["2-Wheeler", "4-Wheeler", "3-Wheeler", "Bus-ac", "Bus-non ac"];
    const brands = ["Honda", "Toyota", "Suzuki", "Bajaj","BMW", "Mahindra", "Hyundai", "Maruti", "KTM"];
    const models = ["Activa", "Innova", "Swift", "Pulsar", "Bolero", "Creta", "Ertiga", "Duke"];
    const locations = ["Madhapur, Hyderabad", "Kukatpally, Hyderabad", "Secunderabad, Hyderabad", "Banjara Hills, Hyderabad", "Gachibowli, Hyderabad"];

    for (let i = 0; i < 200; i++) {
        const randomType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
        const randomBrand = brands[Math.floor(Math.random() * brands.length)];
        const randomModel = models[Math.floor(Math.random() * models.length)];
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        const randomPlace = places[Math.floor(Math.random() * places.length)];
        const price = randomType === "2-Wheeler" ? 500 : randomType === "3-Wheeler" ? 800 : randomType.includes("Bus") ? 5000 : 2000;
        const availableFrom = new Date(2025, Math.floor(Math.random() * 6) + 3, Math.floor(Math.random() * 28) + 1);
        const availableTo = new Date(2025, availableFrom.getMonth() + 2, availableFrom.getDate() + 5);

        const image = i < 100
        ? imageLinks[Math.floor(Math.random() * imageLinks.length)]
        : `https://example.com/vehicle${i + 4}.jpg`;

        vehicleRequests.push({
            ownerName: `Owner-qe`,
            contact: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
            email: `owner${i + 4}@gmail.com`,
            vehicleType: randomType,
            brand: randomBrand,
            model: randomModel,
            registrationNumber: `TS${Math.floor(10 + Math.random() * 90)}AB${Math.floor(1000 + Math.random() * 9000)}`,
            location: randomLocation,
            place: randomPlace,
            pincode: 500000 + Math.floor(Math.random() * 999),
            images: [image],
            rentalPricePerDay: price,
            availableFrom,
            availableTo,
            adminStatus: "Approved", // Random admin status
            // bookingStatus: "Available", // Random booking status
            currentDriver: null // No driver assigned yet
        });
    }
};

// Generate 200 more sample vehicles with random status and booking status
generateVehicles();

// Seed function to insert vehicles into the database
const seedVehicleRequests = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        await VehicleRequest.deleteMany({}); // Clear existing data
        await VehicleRequest.insertMany(vehicleRequests); // Insert new data
        console.log("Vehicle Requests seeded successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding vehicle requests:", error);
    }
};

// Execute seeding
seedVehicleRequests();
