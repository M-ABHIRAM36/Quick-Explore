<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
</p>

<h1 align="center">🌍 QuickExplore</h1>

<p align="center">
  <strong>A full-stack travel & tourism platform for vehicle bookings, rental accommodations, and destination discovery.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-routes-reference">API Routes</a> •
  <a href="#-database-schemas">Database</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Architecture](#-architecture)
  - [MVC Structure](#mvc-folder-structure)
  - [System Design Diagram](#system-design-diagram)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Seeding Data](#seeding-data)
  - [Running the App](#running-the-app)
- [User Roles & Permissions](#-user-roles--permissions)
- [API Routes Reference](#-api-routes-reference)
- [Business Logic Deep Dive](#-business-logic-deep-dive)
  - [Booking Flow](#1-vehicle-booking-flow)
  - [Rental Booking Flow](#2-rental-booking-flow)
  - [Cancellation & Fee Logic](#3-cancellation--fee-logic)
  - [Renewal Logic](#4-renewal-logic)
  - [Driver Assignment](#5-driver-assignment-logic)
  - [Password & Auth System](#6-password--authentication-system)
  - [Rental Owner Onboarding](#7-rental-owner-onboarding)
- [Database Schemas](#-database-schemas)
- [Middleware](#-middleware)
- [Session Management](#-session-management)
- [Image Uploads](#-image-uploads-cloudinary)
- [Error Handling](#-error-handling)
- [Project Structure](#-project-structure-tree)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 📖 About the Project

**QuickExplore** is a full-stack web application that connects travelers with local vehicle rental services and accommodation providers. Users can browse tourist destinations, book vehicles with assigned drivers, and rent accommodations — all through a unified platform.

The platform supports **four distinct user roles** (User, Admin, Driver, Rental Owner), each with its own dashboard, authentication system, and feature set.

### Why QuickExplore?

- **For Travelers** — Discover places, book vehicles and rooms in one platform
- **For Vehicle Owners** — Register vehicles and earn through the platform
- **For Rental Owners** — List properties and manage tenant bookings
- **For Admins** — Approve/reject requests, assign drivers, manage the ecosystem

---

## ✨ Features

### 👤 User Features
- ✅ User registration & login with hashed passwords (bcrypt)
- ✅ Browse tourist places across India
- ✅ Book vehicles at destinations with date selection
- ✅ Book rental accommodations (Houses, PGs, Apartments, Villas)
- ✅ View booking history (active, completed, cancelled)
- ✅ Renew/extend bookings (vehicles & rentals)
- ✅ Cancel bookings with dynamic cancellation fees
- ✅ View cancellation charges history
- ✅ Profile management with password change

### 🛡️ Admin Features
- ✅ Secure admin login (env-based credentials)
- ✅ Review & approve/reject vehicle registration requests
- ✅ Review & approve/reject rental property requests
- ✅ Set rental pricing
- ✅ Add new drivers to the system
- ✅ Assign/reassign drivers to vehicles
- ✅ View system architecture docs (DFD)

### 🚗 Driver Features
- ✅ Driver login with phone, email & password
- ✅ View assigned customer booking details
- ✅ Mark rides as completed
- ✅ Cancel rides (with auto fee calculation)
- ✅ Change password from profile

### 🏠 Rental Owner Features
- ✅ Owner login with auto-generated credentials
- ✅ View tenant/customer details
- ✅ Mark stays as completed
- ✅ Cancel bookings (with auto fee calculation)
- ✅ Change password from profile

### 🔧 System Features
- ✅ Server-side sessions stored in MongoDB (connect-mongo)
- ✅ Image uploads to Cloudinary
- ✅ Splash screen on first visit
- ✅ Request status tracking (vehicle & rental)
- ✅ 404 catch-all error page
- ✅ Dynamic cancellation fee engine

---

## 🏗️ Architecture

QuickExplore follows the **Model-View-Controller (MVC)** pattern:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser   │────▶│    Routes    │────▶│ Controllers  │────▶│   Models     │
│   (EJS)     │◀────│  (Express)   │◀────│  (Logic)     │◀────│  (Mongoose)  │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                           │                    │
                    ┌──────┴──────┐       ┌─────┴──────┐
                    │ Middleware  │       │ Cloudinary  │
                    │  (Auth)    │       │  (Images)   │
                    └─────────────┘       └────────────┘
```

### MVC Folder Structure

```
QuickExplore/
├── app.js                  # Express setup, middleware, route mounting (~90 lines)
├── config/
│   ├── db.js               # MongoDB connection via Mongoose
│   └── cloudinary.js       # Cloudinary + Multer storage config
├── middleware/
│   └── auth.js             # 4 auth middlewares (User, Admin, Driver, Owner)
├── controllers/
│   ├── userController.js   # User registration, login, logout, profile
│   ├── adminController.js  # Admin auth, panel, documentation routes
│   ├── vehicleController.js# Vehicle request CRUD, status checks
│   ├── rentalController.js # Rental request CRUD, status checks
│   ├── bookingController.js# Vehicle & rental bookings, charges history
│   ├── driverController.js # Driver auth, rides, assignment, profile
│   └── ownerController.js  # Owner auth, tenant management, profile
├── routes/
│   ├── users.js            # /register, /login, /logout, /user/profile
│   ├── admin.js            # /adminLogin, /admin, /Adminlogout
│   ├── vehicles.js         # /vehicleRform, /requestForms/vehicleForms
│   ├── rentals.js          # /rentalRform, /requestForms/rentalForms
│   ├── bookings.js         # /places2, /book-vehicle, /book-rooms, /my-bookings
│   ├── drivers.js          # /driver/* (mounted at /driver prefix)
│   └── owners.js           # /owner/* (mounted at /owner prefix)
├── models/                 # 10 Mongoose schemas
├── views/                  # EJS templates organized by feature
├── public/                 # Static assets (CSS, images)
└── init/                   # Database seeding scripts
```

### System Design Diagram

```
                           ┌──────────────────────┐
                           │     QuickExplore      │
                           │      (Express)        │
                           └──────────┬───────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
     ┌──────┴──────┐          ┌───────┴───────┐          ┌──────┴──────┐
     │    Users    │          │    Admin      │          │   Drivers   │
     │  Register   │          │  Approve/     │          │   Login     │
     │  Login      │          │  Reject       │          │   Rides     │
     │  Book       │          │  Assign       │          │   Cancel    │
     │  Cancel     │          │  Price Set    │          │   Complete  │
     └──────┬──────┘          └───────┬───────┘          └──────┬──────┘
            │                         │                         │
            │                  ┌──────┴──────┐                  │
            │                  │   Rental    │                  │
            │                  │   Owners    │                  │
            │                  │   Login     │                  │
            │                  │   Manage    │                  │
            │                  └──────┬──────┘                  │
            │                         │                         │
     ┌──────┴─────────────────────────┴─────────────────────────┴──────┐
     │                         MongoDB Atlas                           │
     │  Users | Drivers | Listings | Vehicles | Rentals | Bookings    │
     │  Transactions | ChargesHistory | RentalChargesHistory          │
     └──────────────────────────────┬──────────────────────────────────┘
                                    │
                             ┌──────┴──────┐
                             │ Cloudinary  │
                             │  (Images)   │
                             └─────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js v4 |
| **Database** | MongoDB (Mongoose ODM) |
| **Template Engine** | EJS (with ejs-mate layouts) |
| **Authentication** | bcrypt (password hashing) + express-session |
| **Session Store** | connect-mongo (MongoDB-backed sessions) |
| **Image Storage** | Cloudinary (via multer-storage-cloudinary) |
| **File Upload** | Multer |
| **Environment** | dotenv |
| **HTTP Method Override** | method-override (PUT/DELETE via forms) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v16 or higher) — [Download](https://nodejs.org/)
- **MongoDB** (local) or **MongoDB Atlas** account — [Atlas](https://www.mongodb.com/atlas)
- **Cloudinary** account — [Sign up](https://cloudinary.com/)
- **Git** — [Download](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/QuickExplore.git

# 2. Navigate to the project directory
cd QuickExplore

# 3. Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGO_ATLAS_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/quickexplore

# Session Secret
SESSION_SECRET=your_super_secret_session_key_here

# Cloudinary Configuration
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret

# Admin Credentials
QuickExploreTeamAdmin_USERNAME=admin
QuickExploreTeamAdmin_EMAIL=admin@quickexplore.com
QuickExploreTeamAdmin_PASSWORD=your_admin_password

# Driver Default Password (assigned when admin creates a new driver)
DRIVER_PASS=default_driver_password
```

> ⚠️ **Never commit your `.env` file.** It's already in `.gitignore`.

### Seeding Data

The `init/` folder contains seed scripts for initial data:

```bash
# Seed tourist places
node init/listingP.js

# Seed sample vehicles
node init/vehicleRequestData.js

# Seed sample drivers
node init/driver.js

# Seed sample bookings
node init/bookingVehicle.js

# Seed sample rental requests
node init/rentalRequest.js

# Seed sample users
node init/userinit.js
```

### Running the App

```bash
# Start the server
node app.js

# Output: app is listening on port : 8080
# Output: DB CONNECTED TO ATLAS MONGODB!
```

Open your browser and navigate to: **http://localhost:8080**

---

## 👥 User Roles & Permissions

| Feature | User | Admin | Driver | Rental Owner |
|---------|:----:|:-----:|:------:|:------------:|
| Browse Places | ✅ | ❌ | ❌ | ❌ |
| Book Vehicle | ✅ | ❌ | ❌ | ❌ |
| Book Rental | ✅ | ❌ | ❌ | ❌ |
| Cancel Own Booking | ✅ | ❌ | ❌ | ❌ |
| Renew Booking | ✅ | ❌ | ❌ | ❌ |
| View Charges History | ✅ | ❌ | ❌ | ❌ |
| Approve/Reject Requests | ❌ | ✅ | ❌ | ❌ |
| Add Drivers | ❌ | ✅ | ❌ | ❌ |
| Assign Drivers to Vehicles | ❌ | ✅ | ❌ | ❌ |
| Set Rental Pricing | ❌ | ✅ | ❌ | ❌ |
| View Customer Details | ❌ | ❌ | ✅ | ✅ |
| Complete Ride/Stay | ❌ | ❌ | ✅ | ✅ |
| Cancel Ride (Driver-side) | ❌ | ❌ | ✅ | ❌ |
| Cancel Booking (Owner-side) | ❌ | ❌ | ❌ | ✅ |
| Change Password | ✅ | ❌ | ✅ | ✅ |

### Authentication Matrix

| Role | Login Method | Session Variable | Middleware |
|------|-------------|-----------------|------------|
| **User** | Email + Password | `req.session.userId` | `requireLogin` |
| **Admin** | Username + Email + Password (from `.env`) | `req.session.authenticated` | `isAuthenticated` |
| **Driver** | Phone + Email + Password | `req.session.driver_id` | `requireDriverLogin` |
| **Rental Owner** | Phone + Email + Password | `req.session.owner_id` | `requireOwnerLogin` |

---

## 📡 API Routes Reference

### User Routes (`routes/users.js`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | — | Redirects to `/flash` |
| `GET` | `/flash` | — | Splash screen |
| `GET` | `/register` | — | Registration form |
| `POST` | `/register` | — | Create new user account |
| `GET` | `/login` | — | Login form |
| `POST` | `/login` | — | Authenticate user |
| `GET` | `/logout` | — | Destroy session & logout |
| `GET` | `/user/profile` | `requireLogin` | View user profile |
| `POST` | `/user/profile` | `requireLogin` | Change user password |

### Admin Routes (`routes/admin.js`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/adminLogin` | — | Admin login form |
| `POST` | `/adminLogin` | — | Authenticate admin |
| `GET` | `/Adminlogout` | `isAuthenticated` | Admin logout |
| `GET` | `/admin` | `isAuthenticated` | Admin dashboard |
| `GET` | `/quickexploreDFDd1` | `isAuthenticated` | DFD Document 1 |
| `GET` | `/quickexploreDFDd2` | `isAuthenticated` | DFD Document 2 |
| `GET` | `/quickexploreSA` | `isAuthenticated` | System Architecture doc |

### Vehicle Routes (`routes/vehicles.js`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/vehicleRform` | `requireLogin` | Vehicle registration form |
| `GET` | `/requestForms/vehicleForms` | `isAuthenticated` | Admin: view all vehicle requests |
| `POST` | `/requestForms/vehicleForms` | — | Submit vehicle request (with image upload) |
| `GET` | `/usercredential` | `requireLogin` | Show user credentials after vehicle request |
| `POST` | `/updateVehicleStatus/:id` | — | Admin: approve/reject vehicle |
| `GET` | `/Vstatus` | `requireLogin` | Vehicle request status check form |
| `POST` | `/CheckVehicleStatus` | — | Fetch vehicle request status |

### Rental Routes (`routes/rentals.js`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/rentalRform` | `requireLogin` | Rental property registration form |
| `GET` | `/requestForms/rentalForms` | `isAuthenticated` | Admin: view all rental requests |
| `POST` | `/requestForms/rentalForms` | — | Submit rental request (with image upload) |
| `GET` | `/usercredentialR` | `requireLogin` | Show credentials after rental request |
| `POST` | `/requestForms/updatePrice/:id` | — | Admin: set rental price |
| `POST` | `/requestForms/updateStatus/:id` | — | Admin: approve/reject rental |
| `GET` | `/Rstatus` | `requireLogin` | Rental request status check form |
| `POST` | `/CheckRentalStatus` | — | Fetch rental request status |

### Booking Routes (`routes/bookings.js`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/places2` | — | Browse all tourist places |
| `GET` | `/listings/:id/viewP` | `requireLogin` | View single place details |
| `GET` | `/book-vehicle` | `requireLogin` | Available vehicles at a place |
| `POST` | `/book-vehicle` | — | Book a vehicle |
| `GET` | `/my-bookings` | `requireLogin` | User's vehicle bookings |
| `POST` | `/renew-booking/:bookingId` | — | Extend vehicle booking |
| `POST` | `/cancel-booking/:bookingId` | — | Cancel vehicle booking |
| `GET` | `/my-charges` | `requireLogin` | Vehicle cancellation charges history |
| `GET` | `/book-rooms` | `requireLogin` | Available rentals at a place |
| `POST` | `/bookRental/:rentalId` | `requireLogin` | Book a rental accommodation |
| `GET` | `/my-Rbookings` | `requireLogin` | User's rental bookings |
| `POST` | `/renew-rental/:rentalBookingId` | `requireLogin` | Extend rental booking |
| `POST` | `/cancel-rental/:bookingId` | — | Cancel rental booking |
| `GET` | `/my-rentalcharges` | `requireLogin` | Rental cancellation charges history |

### Driver Routes (`routes/drivers.js` — mounted at `/driver`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/driver/login` | — | Driver login form |
| `POST` | `/driver/login` | — | Authenticate driver |
| `GET` | `/driver/logout` | — | Driver logout |
| `GET` | `/driver/home` | `requireDriverLogin` | Driver dashboard |
| `GET` | `/driver/customer-details` | `requireDriverLogin` | View assigned customers |
| `POST` | `/driver/customer-details` | — | Fetch customer details by driver ID |
| `POST` | `/driver/complete-ride/:bookingId` | `requireDriverLogin` | Mark ride as completed |
| `POST` | `/driver/cancel-ride/:bookingId` | — | Cancel ride (driver-initiated) |
| `GET` | `/driver/profile` | `requireDriverLogin` | Driver profile page |
| `POST` | `/driver/profile` | `requireDriverLogin` | Change driver password |
| `GET` | `/driver/assign-vehicle` | `isAuthenticated` | Admin: assign vehicle to driver |
| `POST` | `/driver/assign-vehicle` | — | Admin: execute assignment |
| `GET` | `/driver/assign-vehicleNewDriver` | `isAuthenticated` | Admin: reassign driver |
| `POST` | `/driver/assign-vehicleNewDriver` | — | Admin: execute reassignment |
| `GET` | `/driver/add` | `isAuthenticated` | Admin: add driver form |
| `POST` | `/driver/add` | `isAuthenticated` | Admin: create new driver |

### Owner Routes (`routes/owners.js` — mounted at `/owner`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/owner/login` | — | Owner login form |
| `POST` | `/owner/login` | — | Authenticate owner |
| `GET` | `/owner/logout` | — | Owner logout |
| `GET` | `/owner/home` | `requireOwnerLogin` | Owner dashboard |
| `GET` | `/owner/customer-details` | `requireOwnerLogin` | View tenants |
| `POST` | `/owner/complete-booking/:bookingId` | `requireOwnerLogin` | Mark stay as completed |
| `POST` | `/owner/cancel-booking/:bookingId` | `requireOwnerLogin` | Cancel tenant booking |
| `GET` | `/owner/profile` | `requireOwnerLogin` | Owner profile page |
| `POST` | `/owner/profile` | `requireOwnerLogin` | Change owner password |

---

## 🧠 Business Logic Deep Dive

### 1. Vehicle Booking Flow

```
User selects a place
        │
        ▼
GET /book-vehicle?place=XYZ
  → Query: VehicleRequest { adminStatus: "Approved", bookingStatus: "Available", place }
        │
        ▼
User picks vehicle & dates → POST /book-vehicle
        │
        ├── Verify vehicle exists & is approved + available
        ├── Check no existing "Booked" booking for this vehicle
        ├── Auto-find assigned driver: Driver.findOne({ currentVehicle: vehicleId })
        ├── Calculate: rentalDays = ceil((dropoff - pickup) / 1 day)
        ├── Calculate: totalAmount = rentalDays × rentalPricePerDay
        ├── Create Booking record (vehicleStatus: "Booked", paymentStatus: "Pending")
        ├── Update VehicleRequest.bookingStatus → "Booked"
        └── Redirect → /my-bookings
```

**Key Points:**
- Only **admin-approved** vehicles with status **"Available"** are shown
- Driver is auto-assigned based on the `currentVehicle` field
- Vehicle gets locked (`bookingStatus: "Booked"`) immediately upon booking
- Total amount is calculated server-side to prevent manipulation

### 2. Rental Booking Flow

```
User selects a place
        │
        ▼
GET /book-rooms?place=XYZ
  → Query: rentalRequest { place: /XYZ/i, adminStatus: "Approved", bookingStatus: "Available" }
        │
        ▼
User picks rental & dates → POST /bookRental/:rentalId
        │
        ├── Verify rental exists & is approved + available
        ├── Check for overlapping bookings:
        │     RentalBooking { rentalId, status: ["Booked","Ongoing"],
        │       checkInDate ≤ checkOutDate AND checkOutDate ≥ checkInDate }
        ├── Create RentalBooking record (status: "Booked")
        ├── Update rentalRequest.bookingStatus → "Booked"
        └── Redirect → /my-Rbookings
```

**Key Points:**
- Place search is **case-insensitive** using regex
- **Overlap detection** prevents double bookings
- `totalAmount` is sent from the form (calculated client-side from daily rate × days)

### 3. Cancellation & Fee Logic

The system implements a **tiered cancellation fee** structure based on time difference:

```
┌─────────────────────────────────────────────────────┐
│              CANCELLATION FEE TIERS                 │
├──────────────────┬──────────────────────────────────┤
│ Time to Pickup   │ Fee                              │
├──────────────────┼──────────────────────────────────┤
│ ≤ 20 minutes     │ ₹0 (free cancellation)           │
│ 20 min – 24 hrs  │ 10% of total booking amount      │
│ > 24 hours       │ 1 day's rental price              │
└──────────────────┴──────────────────────────────────┘
```

**For Vehicle Cancellation (`POST /cancel-booking/:bookingId`):**
```
timeDifference (from request body, in minutes)
  │
  ├── > 20 AND ≤ 1440 → fee = totalAmount × 0.10
  ├── > 1440          → fee = vehicle.rentalPricePerDay
  └── ≤ 20            → fee = 0
  │
  ├── booking.vehicleStatus → "Cancelled"
  ├── booking.cancelledBy → "driver" (indicates who initiated)
  ├── vehicle.bookingStatus → "Available" (freed up)
  ├── Create Transaction record (if fee > 0)
  ├── Create UserChargesHistory record (if fee ≥ 0)
  └── Render cancel-summary page
```

**For Rental Cancellation (`POST /cancel-rental/:bookingId`):**
- Same tiered logic, but uses `rental.price` instead of `rentalPricePerDay`
- Records in `UserRentalChargesHistory` instead
- Renders `rental-cancel-summary` page

**For Driver-Initiated Cancellation (`POST /driver/cancel-ride/:bookingId`):**
- Calculates fee based on actual pickup date vs current time (server-side)
- Sets `booking.cancelledBy = "driver"`
- Creates Transaction record but does NOT create UserChargesHistory

**For Owner-Initiated Cancellation (`POST /owner/cancel-booking/:bookingId`):**
- Calculates fee based on checkInDate vs current time (server-side)
- Sets `booking.cancelledBy = "owner"`
- Records in UserRentalChargesHistory (if fee > 0)

### 4. Renewal Logic

**Vehicle Renewal (`POST /renew-booking/:bookingId`):**
```
additionalDays (from form)
  │
  ├── New dropoff = original dropoff + additionalDays
  ├── Total days = ceil((newDropoff - pickupDate) / 1 day)
  ├── Updated total = totalDays × rentalPricePerDay
  └── Save & redirect to /my-bookings
```

**Rental Renewal (`POST /renew-rental/:rentalBookingId`):**
```
additionalDays (from form)
  │
  ├── Must be the booking owner (userId check)
  ├── Must be currently "Booked" status
  ├── New checkout = original checkout + additionalDays
  ├── Total days = ceil((newCheckout - checkInDate) / 1 day)
  ├── Updated total = totalDays × dailyRate (rental.price)
  └── Save & redirect to /my-Rbookings
```

### 5. Driver Assignment Logic

```
Admin assigns driver → POST /driver/assign-vehicle
  │
  ├── Clear any existing vehicle assignment for this vehicle:
  │     Driver.updateMany({ currentVehicle: vehicleId }, { currentVehicle: null })
  ├── Assign driver:
  │     Driver.findByIdAndUpdate(driverId, { currentVehicle: vehicleId })
  ├── Update vehicle:
  │     VehicleRequest.findByIdAndUpdate(vehicleId, { currentDriver: driverId })
  └── Redirect back

Admin reassigns driver → POST /driver/assign-vehicleNewDriver
  │
  ├── Same as above PLUS:
  └── Update ALL existing bookings for this vehicle:
        Booking.updateMany({ vehicleId }, { driverId: newDriverId })
```

**Key Points:**
- One vehicle can only have one driver at a time
- When reassigning, ALL bookings (even past ones) get the new driver ID
- Driver auto-assignment happens at booking time: `Driver.findOne({ currentVehicle: vehicleId })`

### 6. Password & Authentication System

**User Passwords:**
- Hashed with `bcrypt` (12 salt rounds) via a Mongoose **pre-save hook**
- Password comparison via `user.comparePassword(candidate)` instance method
- On profile update, setting `user.password = newPlain` triggers the pre-save hook again

**Driver Passwords:**
- Same bcrypt pre-save hook and `comparePassword` method
- Default password set from `process.env.DRIVER_PASS` when admin creates driver
- Drivers can change their password from `/driver/profile`

**Owner Passwords:**
- **No** pre-save hook — hashing is done **manually** in the controller:
  ```js
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  owner.password = hashedPassword;
  ```
- `comparePassword` instance method exists for login verification

**Admin Auth:**
- No database record — credentials are read directly from environment variables
- Session flag `req.session.authenticated = true` upon successful login

### 7. Rental Owner Onboarding

When a rental property request is submitted:

```
POST /requestForms/rentalForms
  │
  ├── Save rental request with password: "placeholder"
  ├── Generate unique password: "QuE9@" + last 5 chars of MongoDB _id
  │     Example: QuE9@a3f8c
  ├── Hash generated password with bcrypt (12 rounds)
  ├── Update rental record with hashed password
  ├── Redirect to /usercredentialR showing:
  │     - Request ID
  │     - Contact
  │     - Email
  │     - Plain-text generated password (shown ONCE)
  └── Owner uses these credentials to login at /owner/login
```

---

## 📊 Database Schemas

### Entity Relationship Diagram

```
User ──┬──▶ Booking (Vehicle) ──▶ VehicleRequest ◀── Driver
       │                      └──▶ Driver
       ├──▶ RentalBooking ──▶ RentalRequest
       ├──▶ Transaction ──▶ VehicleRequest
       ├──▶ UserChargesHistory ──▶ VehicleRequest + Booking
       └──▶ UserRentalChargesHistory ──▶ RentalRequest + RentalBooking

Driver.currentVehicle ──▶ VehicleRequest
VehicleRequest.currentDriver ──▶ Driver
```

### Models Summary

| Model | Collection | Key Fields | Purpose |
|-------|-----------|------------|---------|
| **User** | `users` | username, email, password, phone | Platform users |
| **Driver** | `drivers` | username, phone, email, currentVehicle, password | Vehicle drivers |
| **ListingP** | `listingps` | title, location, type, images, entryFee | Tourist destinations |
| **VehicleRequest** | `vehiclerequests` | ownerName, vehicleType, brand, model, registrationNumber, rentalPricePerDay, adminStatus, bookingStatus, currentDriver | Registered vehicles |
| **RentalRequest** | `rentalrequests` | ownerName, propertyType, location, price, adminStatus, bookingStatus, password | Rental properties |
| **Booking** | `bookings` | userId, vehicleId, driverId, pickupDate, dropoffDate, totalAmount, vehicleStatus | Vehicle bookings |
| **RentalBooking** | `rentalbookings` | userId, rentalId, checkInDate, checkOutDate, totalAmount, status, cancellationFee | Rental bookings |
| **Transaction** | `transactions` | userId, vehicleId, amount, type | Financial transactions |
| **UserChargesHistory** | `userchargeshistories` | userId, vehicleId, bookingId, destination, cancellationFee | Vehicle cancellation history |
| **UserRentalChargesHistory** | `userrentalchargeshistories` | userId, rentalId, bookingId, destination, cancellationFee | Rental cancellation history |

### Status Enums

**Admin Status** (vehicles & rentals):
| Status | Meaning |
|--------|---------|
| `Pending` | Awaiting admin review (default) |
| `Approved` | Admin accepted the request |
| `Rejected` | Admin denied the request |
| `Flagged` | Marked for further review |

**Booking Status** (vehicles & rentals):
| Status | Meaning |
|--------|---------|
| `Available` | Ready for booking (default) |
| `Booked` | Currently booked by a user |
| `Ongoing` | Trip/stay in progress |
| `Completed` | Trip/stay finished |
| `Cancelled` | Booking was cancelled |

**Payment Status:**
| Status | Meaning |
|--------|---------|
| `Pending` | Payment not yet collected (default) |
| `Completed` | Payment received |
| `Failed` | Payment attempt failed |

---

## 🔐 Middleware

Located in `middleware/auth.js`:

```javascript
// Protects user-only routes
requireLogin(req, res, next)
  → Checks: req.session.userId
  → Redirects to: /login

// Protects admin-only routes
isAuthenticated(req, res, next)
  → Checks: req.session.authenticated
  → Redirects to: /adminLogin

// Protects driver-only routes
requireDriverLogin(req, res, next)
  → Checks: req.session.driver_id
  → Redirects to: /driver/login

// Protects owner-only routes
requireOwnerLogin(req, res, next)
  → Checks: req.session.owner_id
  → Redirects to: /owner/login
```

### Global Middleware (in `app.js`)

```javascript
// Makes currentUser available to ALL EJS templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});
```

---

## 🍪 Session Management

| Config | Value | Purpose |
|--------|-------|---------|
| **Store** | `connect-mongo` (MongoDB) | Sessions persist across server restarts |
| **Secret** | `process.env.SESSION_SECRET` | Signs session cookies |
| **Max Age** | 24 hours (`86400000 ms`) | Auto-logout after 1 day |
| **httpOnly** | `true` | Prevents client-side JS access to cookies |
| **resave** | `false` | Don't save session if unmodified |
| **saveUninitialized** | `false` | Don't create session until data is stored |

### Session Variables by Role

```javascript
// User login
req.session.userId = user._id;
req.session.user = { _id, username, email };

// Admin login
req.session.authenticated = true;

// Driver login
req.session.driver_id = driver._id;

// Owner login
req.session.owner_id = rental._id;

// Splash screen
req.session.splashShown = true/false;
```

---

## ☁️ Image Uploads (Cloudinary)

Configuration in `config/cloudinary.js`:

```javascript
// Storage Settings
Folder: 'quickexplore_DEV'
Allowed Formats: jpg, jpeg, png
Public ID: Original filename (without extension)
```

**Used in routes:**
- `POST /requestForms/vehicleForms` — Vehicle registration images
- `POST /requestForms/rentalForms` — Rental property images

**Upload middleware:** `multer` with `CloudinaryStorage` adapter

---

## ⚠️ Error Handling

The app uses a **two-tier error handling** system:

1. **Operational Errors** → `views/errors/error.ejs`
   - User-friendly messages (invalid credentials, not found, etc.)
   - Rendered with: `res.render("errors/error", { error: "message" })`

2. **Application Errors** → `views/errors/appError.ejs`
   - System-level errors (DB failures, unexpected crashes)
   - Rendered with: `res.render("errors/appError.ejs", { error })`

3. **404 Not Found** → Catch-all route
   ```javascript
   app.get('*', (req, res) => {
     res.status(404).render("errors/appError", { error: 'Page not found', statusCode: 404 });
   });
   ```

Every route handler is wrapped in `try/catch` blocks with appropriate error logging via `console.error`.

---

## 📁 Project Structure (Tree)

```
Quick-Explore/
│
├── app.js                              # Express app entry point (~90 lines)
│
├── config/
│   ├── db.js                           # MongoDB connection
│   └── cloudinary.js                   # Cloudinary + Multer storage
│
├── controllers/
│   ├── userController.js               # User auth + profile
│   ├── adminController.js              # Admin auth + dashboard
│   ├── vehicleController.js            # Vehicle request management
│   ├── rentalController.js             # Rental request management
│   ├── bookingController.js            # All booking operations
│   ├── driverController.js             # Driver operations
│   └── ownerController.js              # Rental owner operations
│
├── middleware/
│   └── auth.js                         # 4 authentication middlewares
│
├── models/
│   ├── User.js                         # User schema
│   ├── Driver.js                       # Driver schema
│   ├── listingP.js                     # Tourist place schema
│   ├── vehicleRequest.js              # Vehicle registration schema
│   ├── rentalRequest.js               # Rental property schema
│   ├── bookingVehicle.js              # Vehicle booking schema
│   ├── bookingRental.js               # Rental booking schema
│   ├── Transaction.js                 # Transaction schema
│   ├── UserChargesHistory.js          # Vehicle charges history
│   └── UserRentalChargesHistory.js    # Rental charges history
│
├── routes/
│   ├── users.js                        # User routes
│   ├── admin.js                        # Admin routes
│   ├── vehicles.js                     # Vehicle routes
│   ├── rentals.js                      # Rental routes
│   ├── bookings.js                     # Booking routes
│   ├── drivers.js                      # Driver routes (prefix: /driver)
│   └── owners.js                       # Owner routes (prefix: /owner)
│
├── views/
│   ├── flash.ejs                       # Splash screen
│   ├── BookingR/                       # Rental booking views
│   │   ├── bookRental.ejs
│   │   └── myRbookings.ejs
│   ├── BookingV/                       # Vehicle booking views
│   │   ├── bookVehicle.ejs
│   │   └── myBookings.ejs
│   ├── checkStatus/                    # Status check views
│   │   ├── checkRstatusF.ejs
│   │   ├── checkVstatusF.ejs
│   │   ├── showRstatus.ejs
│   │   └── showVstatus.ejs
│   ├── docsqe/                         # Documentation views
│   │   ├── Physical_DFD_QuickExplore.ejs
│   │   ├── Physical_DFD_QuickExplore2.ejs
│   │   └── QuickExplore_Architecture.ejs
│   ├── driver/                         # Driver views
│   │   ├── addDriver.ejs
│   │   ├── assignNewDriverToVehicle.ejs
│   │   ├── assignVehicle.ejs
│   │   ├── customerList.ejs
│   │   ├── driverLogin.ejs
│   │   ├── driverPage.ejs
│   │   ├── driverProfile.ejs
│   │   └── enterDriverId.ejs
│   ├── errors/                         # Error pages
│   │   ├── appError.ejs
│   │   └── error.ejs
│   ├── includes/                       # Partial templates
│   │   ├── basicCode.ejs
│   │   └── navbar.ejs
│   ├── layouts/                        # Layout templates
│   │   └── boilerplate.ejs
│   ├── listing/                        # Place & form views
│   │   ├── places2.ejs
│   │   ├── rentalRform.ejs
│   │   ├── usercredential.ejs
│   │   ├── usercredentialR.ejs
│   │   ├── vehicleRform.ejs
│   │   └── viewP.ejs
│   ├── rentalOwner/                    # Owner views
│   │   ├── customerList.ejs
│   │   ├── ownerLogin.ejs
│   │   ├── ownerPage.ejs
│   │   └── ownerProfile.ejs
│   ├── requestForms/                   # Admin request views
│   │   ├── admin.ejs
│   │   ├── adminLogin.ejs
│   │   ├── rentalForms.ejs
│   │   └── vehicleForms.ejs
│   └── users/                          # User views
│       ├── cancel-summary.ejs
│       ├── login.ejs
│       ├── my-charges.ejs
│       ├── my-rentalcharges.ejs
│       ├── register.ejs
│       ├── rental-cancel-summary.ejs
│       └── userProfile.ejs
│
├── public/
│   └── images/                         # Static images
│
├── init/                               # Database seed scripts
│   ├── bookingVehicle.js
│   ├── driver.js
│   ├── listingP.js
│   ├── rentalRequest.js
│   ├── userinit.js
│   └── vehicleRequestData.js
│
├── .env                                # Environment variables (not committed)
├── .gitignore
├── cloudConfig.js                      # Legacy cloud config (kept for compatibility)
├── package.json
└── package-lock.json
```

---

## 📸 Screenshots

> screenshots of my application are:

| Page | Screenshot |
|------|-----------|
| Landing / Splash | <img width="1916" height="967" alt="image" src="https://github.com/user-attachments/assets/45ba2580-41af-4092-997e-1f5e69cd0113" />|
| Places Listing | <img width="1919" height="1031" alt="image" src="https://github.com/user-attachments/assets/68df16ad-a56c-495f-b98f-9a7985a2f0c0" />|
| Places Listing | <img width="1919" height="919" alt="image" src="https://github.com/user-attachments/assets/45aae212-0ee9-4ab8-ae6f-1a7787888656" />|
| Vehicle Booking | <img width="1906" height="959" alt="image" src="https://github.com/user-attachments/assets/920121e0-2134-4fae-9ff7-e7b6ef559854" />|
| Rental Booking | <img width="1919" height="969" alt="image" src="https://github.com/user-attachments/assets/dbca0572-fc0d-47f9-abb8-ca550b4c0757" />|
| My Bookings | <img width="1917" height="968" alt="image" src="https://github.com/user-attachments/assets/55cdb1c4-cf1c-4d23-8f39-136e656aed80" />|
| My Bookings | <img width="1919" height="974" alt="image" src="https://github.com/user-attachments/assets/6cf1dc1c-8864-4821-9064-b4977159fb3f" />|
| Admin Dashboard | <img width="1915" height="971" alt="image" src="https://github.com/user-attachments/assets/df701833-decb-47a0-9449-1fa7fa7af83d" />|
| Admin Dashboard | <img width="1919" height="974" alt="image" src="https://github.com/user-attachments/assets/b58d3c02-d402-4333-993d-9bc1fa9574ac" />|
| Admin Dashboard | <img width="1918" height="975" alt="image" src="https://github.com/user-attachments/assets/1391681a-d29e-45f7-876b-62c95a81a93c" />|
| Admin Dashboard | <img width="828" height="619" alt="image" src="https://github.com/user-attachments/assets/a82289de-d0d6-43a8-bdd3-614260bc61af" />|
| Admin Dashboard | <img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/6b0154b2-3b98-415a-8f3d-a36fa6961c2b" />|
| Admin Dashboard | <img width="1913" height="975" alt="image" src="https://github.com/user-attachments/assets/68fc6c43-b202-4b47-88ad-20bf2b5425da" />|
| Driver Dashboard | <img width="1910" height="965" alt="image" src="https://github.com/user-attachments/assets/6ea5c112-9cf4-4cce-8c3f-93c3061e654f" />|
| Owner Dashboard | <img width="1918" height="969" alt="image" src="https://github.com/user-attachments/assets/e7e0862a-3f14-4d4e-b065-a36357e1998c" />|

---
## Development Process

I designed the system flow and database schema on paper before implementation.

The first version was built in a monolithic Express app to understand the data flow clearly.

Later I refactored the project into MVC architecture for better maintainability.

## 🗺️ Roadmap

- [ ] Payment gateway integration (Razorpay / Stripe)
- [ ] Real-time notifications (Socket.io)
- [ ] Email notifications for booking confirmations
- [ ] Google Maps integration for place locations
- [ ] Rating & review system for vehicles and rentals
- [ ] Multi-language support
- [ ] Mobile-responsive PWA
- [ ] REST API for mobile app integration
- [ ] Advanced search filters (price range, vehicle type, property type)
- [ ] Dashboard analytics for admin

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork** the repository
2. **Clone** your fork
   ```bash
   git clone https://github.com/your-username/QuickExplore.git
   ```
3. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make** your changes
5. **Test** thoroughly — make sure `node app.js` runs without errors
6. **Commit** with a meaningful message
   ```bash
   git commit -m "feat: add payment gateway integration"
   ```
7. **Push** to your branch
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open** a Pull Request

### Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Code formatting (no logic change) |
| `refactor:` | Code restructuring |
| `test:` | Adding or updating tests |
| `chore:` | Build/tooling changes |

### Contribution Guidelines

- **Do NOT** change existing route paths or session variable names
- **Do NOT** modify database schemas without discussion
- **Do NOT** remove existing features
- **Do** add proper error handling with try/catch
- **Do** follow the existing MVC pattern (routes → controllers → models)
- **Do** test with `node app.js` before submitting
- **Do** update this README if adding new routes or features

### Areas Where Help is Needed

| Area | Description | Difficulty |
|------|-------------|-----------|
| 💳 Payment Integration | Add Razorpay/Stripe for actual payments | Medium |
| 📧 Email Service | Send booking confirmations via email | Easy |
| 🗺️ Maps Integration | Show places on Google Maps | Medium |
| ⭐ Review System | Let users rate vehicles & rentals | Medium |
| 🧪 Testing | Add unit & integration tests (Jest/Mocha) | Medium |
| 📱 Responsive UI | Improve mobile experience | Easy |
| 🔔 Notifications | Real-time updates with Socket.io | Hard |
| 📊 Admin Analytics | Charts & stats for admin dashboard | Medium |
| 🌐 i18n | Multi-language support | Medium |
| 🐳 Docker | Add Dockerfile & docker-compose | Easy |

### Reporting Issues

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser / Node.js version

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 QuickExplore Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Acknowledgements

- [Express.js](https://expressjs.com/) — Fast, unopinionated web framework
- [MongoDB](https://www.mongodb.com/) — NoSQL database
- [Mongoose](https://mongoosejs.com/) — Elegant MongoDB ODM
- [EJS](https://ejs.co/) — Embedded JavaScript templating
- [Cloudinary](https://cloudinary.com/) — Image management platform
- [bcrypt](https://www.npmjs.com/package/bcrypt) — Password hashing library
- [connect-mongo](https://www.npmjs.com/package/connect-mongo) — MongoDB session store

---

<p align="center">
  Made with ❤️ by the <strong>QuickExplore Team</strong>
</p>

<p align="center">
  ⭐ Star this repo if you found it helpful!
</p>
