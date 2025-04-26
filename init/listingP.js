const mongoose = require("mongoose");
const ListingP = require("../models/listingP.js"); // Ensure this is the correct path to your model
require('dotenv').config({ path: '../.env' });


const MONGO_URL = process.env.MONGO_ATLAS_URL;

mongoose.connect(MONGO_URL)
.then(() => console.log("Database connected"))
.catch((err) => console.log(err));

const touristPlaces = [
        {
          title: "Charminar",
          "images": ["https://upload/public/images/charminar.jpg"],
          "location": "Hyderabad",
          "pincode": 500002,
          "description": "A historic monument and mosque, an icon of Hyderabad.",
          "type": "Monument"
        },
        {
          "title": "Golconda Fort",
          "images": ["https://upload.wikimedia.org/golconda.jpg"],
          "location": "Hyderabad",
          "pincode": 500008,
          "description": "A grand fortress with historical significance and stunning architecture.",
          "type": "Monument"
        },
        {
          "title": "Ramoji Film City",
          "images": ["https://upload.wikimedia.org/ramoji.jpg"],
          "location": "Hyderabad",
          "pincode": 501512,
          "description": "The world’s largest film city, a major tourist attraction.",
          "type": "Famous City"
        },
        {
          "title": "Bhadrakali Temple",
          "images": ["https://upload.wikimedia.org/bhadrakali.jpg"],
          "location": "Warangal",
          "pincode": 506007,
          "description": "One of the oldest temples dedicated to Goddess Bhadrakali.",
          "type": "Temple"
        },
        {
          "title": "Kuntala Waterfalls",
          "images": ["https://upload.wikimedia.org/kuntala.jpg"],
          "location": "Adilabad",
          "pincode": 504323,
          "description": "The highest waterfall in Telangana, a beautiful scenic spot.",
          "type": "Waterfall"
        },
        {
          "title": "Nagarjuna Sagar Dam",
          "images": ["https://upload.wikimedia.org/nagarjunasagar.jpg"],
          "location": "Nalgonda",
          "pincode": 508202,
          "description": "A massive dam with breathtaking views and boating facilities.",
          "type": "Waterfall"
        },
        {
          "title": "Pakhal Lake",
          "images": ["https://upload.wikimedia.org/pakhal.jpg"],
          "location": "Warangal",
          "pincode": 506355,
          "description": "A man-made lake surrounded by forests, great for nature lovers.",
          "type": "Famous City"
        },
        {
          "title": "Medak Cathedral",
          "images": ["https://upload.wikimedia.org/medak.jpg"],
          "location": "Medak",
          "pincode": 502110,
          "description": "One of the largest church buildings in India.",
          "type": "Monument"
        },
        {
          "title": "Bogatha Waterfall",
          "images": ["https://upload.wikimedia.org/bogatha.jpg"],
          "location": "Jayashankar Bhupalpally",
          "pincode": 506168,
          "description": "A scenic waterfall known as the 'Niagara of Telangana'.",
          "type": "Waterfall"
        },
        {
          "title": "Laknavaram Lake",
          "images": ["https://upload.wikimedia.org/laknavaram.jpg"],
          "location": "Warangal",
          "pincode": 506324,
          "description": "A scenic lake with a hanging bridge, perfect for a getaway.",
          "type": "Famous City"
        },
        {
          "title": "Yadagirigutta Temple",
          "images": ["https://upload.wikimedia.org/yadagirigutta.jpg"],
          "location": "Yadadri Bhuvanagiri",
          "pincode": 508115,
          "description": "A famous pilgrimage site dedicated to Lord Narasimha.",
          "type": "Temple"
        },
        {
          "title": "Ananthagiri Hills",
          "images": ["https://upload.wikimedia.org/ananthagiri.jpg"],
          "location": "Vikarabad",
          "pincode": 501101,
          "description": "A beautiful hill station with trekking trails and dense forests.",
          "type": "Trekking"
        },
        {
          "title": "Kadam Dam",
          "images": ["https://upload.wikimedia.org/kadamdam.jpg"],
          "location": "Adilabad",
          "pincode": 504202,
          "description": "A scenic dam offering boat rides and peaceful surroundings.",
          "type": "Waterfall"
        },
        {
          "title": "Alampur Jogulamba Temple",
          "images": ["https://upload.wikimedia.org/alampur.jpg"],
          "location": "Jogulamba Gadwal",
          "pincode": 509152,
          "description": "A revered Shakti Peetha temple with historical significance.",
          "type": "Temple"
        },
        {
          "title": "Khammam Fort",
          "images": ["https://upload.wikimedia.org/khammamfort.jpg"],
          "location": "Khammam",
          "pincode": 507001,
          "description": "A historical fort blending Hindu and Muslim architectural styles.",
          "type": "Monument"
        },
        {
          "title": "Pocharam Wildlife Sanctuary",
          "images": ["https://upload.wikimedia.org/pocharam.jpg"],
          "location": "Medak",
          "pincode": 502115,
          "description": "A wildlife sanctuary with diverse flora and fauna.",
          "type": "Famous City"
        },
        {
          "title": "Ethipothala Falls",
          "images": ["https://upload.wikimedia.org/ethipothala.jpg"],
          "location": "Nalgonda",
          "pincode": 508202,
          "description": "A stunning waterfall formed by the Chandravanka river.",
          "type": "Waterfall"
        },
        {
          "title": "Warangal Fort",
          "images": ["https://upload.wikimedia.org/warangalfort.jpg"],
          "location": "Warangal",
          "pincode": 506002,
          "description": "An ancient fort with historical ruins and carvings.",
          "type": "Monument"
        },
        {
          "title": "Sammakka Saralamma Temple",
          "images": ["https://upload.wikimedia.org/sammakka.jpg"],
          "location": "Mulugu",
          "pincode": 506343,
          "description": "A popular tribal temple and pilgrimage site.",
          "type": "Temple"
        },
        {
              "title": "Thousand Pillar Temple",
              "images": ["https://upload.wikimedia.org/thousandpillar.jpg"],
              "location": "Warangal",
              "pincode": 506002,
              "description": "A historic temple known for its intricate stone carvings and architecture.",
              "type": "Temple"
          },
          {
              "title": "Bhadrachalam Temple",
              "images": ["https://upload.wikimedia.org/bhadrachalam.jpg"],
              "location": "Bhadrachalam",
              "pincode": 507111,
              "description": "A famous temple dedicated to Lord Rama, located on the banks of the Godavari River.",
              "type": "Temple"
          },
          {
              "title": "Sri Raja Rajeshwara Temple",
              "images": ["https://upload.wikimedia.org/rajrajeshwara.jpg"],
              "location": "Vemulawada",
              "pincode": 505302,
              "description": "A significant Shiva temple known for its religious importance.",
              "type": "Temple"
          },
          {
              "title": "Kakatiya Musical Garden",
              "images": ["https://upload.wikimedia.org/kakatiyagarden.jpg"],
              "location": "Warangal",
              "pincode": 506002,
              "description": "A beautiful garden with a musical fountain show near Warangal Fort.",
              "type": "Famous City"
          },
          {
              "title": "Sri Ramalingeswara Temple",
              "images": ["https://upload.wikimedia.org/ramalingeswara.jpg"],
              "location": "Nalgonda",
              "pincode": 508001,
              "description": "An ancient Shiva temple with stunning architectural details.",
              "type": "Temple"
          },

          {
              "title": "Edulabad Waterfalls",
              "images": ["https://upload.wikimedia.org/edulabad.jpg"],
              "location": "Medchal-Malkajgiri",
              "pincode": 501301,
              "description": "A picturesque waterfall surrounded by lush greenery.",
              "type": "Waterfall"
          },
          {
              "title": "Ananthagiri Temple",
              "images": ["https://upload.wikimedia.org/ananthagiritemple.jpg"],
              "location": "Vikarabad",
              "pincode": 501101,
              "description": "A scenic temple in the Ananthagiri Hills, popular for trekking and nature walks.",
              "type": "Temple"
          },
          {
              "title": "Sri Lakshmi Narasimha Swamy Temple",
              "images": ["https://upload.wikimedia.org/yadagirinarsimha.jpg"],
              "location": "Yadagirigutta",
              "pincode": 508115,
              "description": "A famous pilgrimage site dedicated to Lord Narasimha.",
              "type": "Temple"
          },
          {
              "title": "Kinnerasani Wildlife Sanctuary",
              "images": ["https://upload.wikimedia.org/kinnerasani.jpg"],
              "location": "Bhadradri Kothagudem",
              "pincode": 507101,
              "description": "A lush sanctuary with diverse wildlife, including deer and migratory birds.",
              "type": "Famous City"
          },
          {
              "title": "Dhulikatta Buddhist Stupa",
              "images": ["https://upload.wikimedia.org/dhulikatta.jpg"],
              "location": "Karimnagar",
              "pincode": 505527,
              "description": "An ancient Buddhist site with historical and archaeological significance.",
              "type": "Monument"
          },
          {
              "title": "Jagtial Fort",
              "images": ["https://upload.wikimedia.org/jagtialfort.jpg"],
              "location": "Jagtial",
              "pincode": 505327,
              "description": "A historical fort known for its strategic location and architecture.",
              "type": "Monument"
          },
          {
                "title": "Bhongir Fort",
                "images": ["https://upload.wikimedia.org/bhongirfort.jpg"],
                "location": "Bhongir",
                "pincode": 508116,
                "description": "A monolithic rock fortress offering panoramic views and trekking opportunities.",
                "type": "Monument"
            },
            {
                "title": "Nizam Sagar Dam",
                "images": ["https://upload.wikimedia.org/nizamsagar.jpg"],
                "location": "Kamareddy",
                "pincode": 503186,
                "description": "A scenic dam offering boating and picnic spots near the Manjira River.",
                "type": "Waterfall"
            },
            {
                "title": "Sri Kaleshwara Mukteswara Swamy Temple",
                "images": ["https://upload.wikimedia.org/kaleshwaram.jpg"],
                "location": "Kaleshwaram",
                "pincode": 505504,
                "description": "A famous Shiva temple situated on the confluence of the Godavari and Pranahita rivers.",
                "type": "Temple"
            },
            {
                "title": "Jadcherla Sri Lakshmi Venkateswara Swamy Temple",
                "images": ["https://upload.wikimedia.org/jadcherla.jpg"],
                "location": "Mahbubnagar",
                "pincode": 509301,
                "description": "A significant temple known for its spiritual importance and festivals.",
                "type": "Temple"
            },
            {
                "title": "Pillalamarri Banyan Tree",
                "images": ["https://upload.wikimedia.org/pillalamarri.jpg"],
                "location": "Mahbubnagar",
                "pincode": 509001,
                "description": "A 700-year-old banyan tree with a sprawling canopy and scenic surroundings.",
                "type": "Famous City"
            },
            {
                "title": "Koilkonda Fort",
                "images": ["https://upload.wikimedia.org/koilkonda.jpg"],
                "location": "Mahbubnagar",
                "pincode": 509371,
                "description": "An ancient fort with stunning views and historical significance.",
                "type": "Monument"
            },
            {
                "title": "Manthani Temples",
                "images": ["https://upload.wikimedia.org/manthani.jpg"],
                "location": "Manthani",
                "pincode": 505184,
                "description": "A group of ancient temples reflecting the rich heritage of Telangana.",
                "type": "Temple"
            },
            {
                "title": "Mayuri Haritha Vanam",
                "images": ["https://upload.wikimedia.org/mayurivanam.jpg"],
                "location": "Mahbubnagar",
                "pincode": 509002,
                "description": "A lush green park and eco-tourism site, perfect for a peaceful getaway.",
                "type": "Famous City"
            },
            {
                "title": "Chaya Someswara Temple",
                "images": ["https://upload.wikimedia.org/chayasomeswara.jpg"],
                "location": "Nalgonda",
                "pincode": 508248,
                "description": "An architectural marvel where a shadow constantly falls on the Shiva Lingam.",
                "type": "Temple"
            },
            {
                "title": "Jurala Dam",
                "images": ["https://upload.wikimedia.org/jurala.jpg"],
                "location": "Jogulamba Gadwal",
                "pincode": 509132,
                "description": "A hydroelectric dam with picturesque surroundings, ideal for picnics.",
                "type": "Waterfall"
            },
            {
                "title": "Rachakonda Fort",
                "images": ["https://upload.wikimedia.org/rachakonda.jpg"],
                "location": "Nalgonda",
                "pincode": 508246,
                "description": "An ancient fort offering breathtaking views and trekking opportunities.",
                "type": "Monument"
            },
            {
                "title": "Surendrapuri Mythological Museum",
                "images": ["https://upload.wikimedia.org/surendrapuri.jpg"],
                "location": "Yadadri Bhuvanagiri",
                "pincode": 508115,
                "description": "A unique mythological museum showcasing Hindu epics and deities.",
                "type": "Famous City"
            },
            {
                "title": "Narsapur Forest",
                "images": ["https://upload.wikimedia.org/narsapur.jpg"],
                "location": "Medak",
                "pincode": 502313,
                "description": "A dense forest offering trekking, birdwatching, and a refreshing environment.",
                "type": "Famous City"
            },
            {
                "title": "Antharaganga Waterfalls",
                "images": ["https://upload.wikimedia.org/antharaganga.jpg"],
                "location": "Khammam",
                "pincode": 507101,
                "description": "A hidden gem among waterfalls, known for its scenic beauty.",
                "type": "Waterfall"
            },
            {
                "title": "Kinnerasani Dam",
                "images": ["https://upload.wikimedia.org/kinnerasanidam.jpg"],
                "location": "Bhadradri Kothagudem",
                "pincode": 507101,
                "description": "A serene dam and reservoir surrounded by lush greenery.",
                "type": "Waterfall"
            },
            {
                "title": "Medaram Jatara Festival Grounds",
                "images": ["https://upload.wikimedia.org/medaramfestival.jpg"],
                "location": "Mulugu",
                "pincode": 506343,
                "description": "The venue of Asia's biggest tribal festival, held once every two years.This is a tribal festival held in Telangana, attracting millions of devotees.",
                "type": "Festival"
            },
            {
                "title": "Shamirpet Lake",
                "images": ["https://upload.wikimedia.org/shamirpet.jpg"],
                "location": "Hyderabad",
                "pincode": 500078,
                "description": "A serene lake known for birdwatching, boating, and scenic sunsets.",
                "type": "Famous City"
            },
            {
                "title": "Dichpally Ramalayam",
                "images": ["https://upload.wikimedia.org/dichpally.jpg"],
                "location": "Nizamabad",
                "pincode": 503175,
                "description": "A historic temple dedicated to Lord Rama, known for its intricate carvings.",
                "type": "Temple"
            },
            {
                "title": "Pochera Waterfalls",
                "images": ["https://upload.wikimedia.org/pochera.jpg"],
                "location": "Adilabad",
                "pincode": 504323,
                "description": "A stunning waterfall with a unique rock formation and serene surroundings.",
                "type": "Waterfall"
            },
            {
                "title": "Eegalapenta Reservoir",
                "images": ["https://upload.wikimedia.org/eegalapenta.jpg"],
                "location": "Nagarkurnool",
                "pincode": 509203,
                "description": "A peaceful reservoir with stunning views of the surrounding hills.",
                "type": "Waterfall"
            },
            {
                "title": "Phanigiri Buddhist Site",
                "images": ["https://upload.wikimedia.org/phanigiri.jpg"],
                "location": "Suryapet",
                "pincode": 508376,
                "description": "An ancient Buddhist site with well-preserved stupas and relics.",
                "type": "Monument"
            },
            {
              "title": "Ananta Padmanabha Swamy Temple",
              "images": ["https://upload.wikimedia.org/wikipedia/commons/5/5b/Ananta_Padmanabha_Swamy_Temple_Vikarabad.jpg"],
              "location": "Vikarabad",
              "pincode": 501101,
              "description": "A beautiful ancient temple dedicated to Lord Vishnu, surrounded by lush Ananthagiri Hills.",
              "type": "Temple"
            },
            {
              "title": "Ramappa Temple",
              "images": ["https://upload.wikimedia.org/wikipedia/commons/4/46/Ramappa_Temple.jpg"],
              "location": "Palampet, Mulugu District",
              "pincode": 506345,
              "description": "A stunning 13th-century Kakatiya-era temple, known for its intricate carvings and floating bricks, and recognized as a UNESCO World Heritage Site.",
              "type": "Temple"
            }
];
      

const seedDB = async () => {
    await ListingP.deleteMany({}); // Clear existing data
    await ListingP.insertMany(touristPlaces);
    console.log("Database for Tourist Places seeded successfully!");
};

seedDB().then(() => {
    mongoose.connection.close();
});
