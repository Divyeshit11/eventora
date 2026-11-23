Eventora
*********

--Eventora is a full-stack event discovery and ticket booking platform.Users can Create Accounts,browse events, select ticket types and seats,add tickets to a cart,complete payment through Razorpay,receive tickets, and manage bookings. Organizers can create and manage events, while administrators can moderate events, manage users, view analytics, and export reports.

Main features:
*************
-User registration, login, logout, password reset, and password change 
-Role-based access:user, organizer, and admin.
-Event browsing,search,categories,filters,sorting,and pagination
-Favorites and persistent cart
-Multiple ticket types and quantities
-Optional seat selection
-Razorpay payment order creation and payment verification
-Razorpay webhook support for payment
confirmation if a browser callback is interrupted
-PDF ticket generation and ticket-download feature
-Email confirmation and scheduled event reminders
-Ticket check-in for organizers and admins
-Event moderation,user-role management,
analytics,CSV import/export
-Responsive UI for mobile,tablet,and desktop

How we built the project
***********************
we built Eventora as a separate frontend and backend application.

The frontend is a React single-page application. it is responsible for pages, responsive design,forms, user interaction,cart storage, and calling backend APIs.

The backend is an Express API. it handles authentication, authorization, event data,booking logic, payment verification, email delivery, PDF generation, and communication with MongoDB.

Vercel hosts both the frontend and backend API.
The react app is built into the dist folder, and vercel routes /api/* requests to the express serverless function.

Browser
  │
  ├── React frontend on Vercel
  │       │
  │       └── /api/* requests
  │
  └── Express API on Vercel
          │
          ├── MongoDB Atlas
          ├── Razorpay
          └── SMTP email service


Technologies used
*****************
React -- Builds reusable, interactive frontend components
vite -- Fast React development server and optimized production build
React Router -- Handles page navigation without full page reloads
Redux Toolkit -- Manages shared authentication, events, and favorites state
Tailwind CSS -- Builds Responsive and consistent UI quickly
Node.js -- Runs JavaScript on the server
Express.js -- Creates RESET API routes and backend middleware
MongoDB Atlas -- Stores users,events,bookings,and ticket data
Mongoose -- Defines MongoDB schemas and validates database data
JSON web Token -- keeps users securely authenticated
bcryptjs -- Hashes passwords before storing them
Razorpay -- Creates payment orders and verifies payments
Nodemailer-- Sends passwords reset, booking, and reminder emails
PDFKIT -- Generates downloadable PDF tickets
QRCode -- Generates QR codes for tickets/check-in
Multer / csv - parse --- Supports event CSV Import
Vercel -- Deploys the frontend and serverless API.

Project folder structure
************************
eventora/
│
├── src/                         # React frontend source code
│   ├── pages/                   # Complete application pages
│   ├── Components/              # Reusable UI components
│   │   ├── common/              # Buttons, icons, layouts, shared UI
│   │   ├── events/              # Event cards, filters, CSV import, grids
│   │   └── layout/              # Navbar, footer, hero section
│   ├── features/                # Redux slices for auth and events
│   ├── services/                # API request functions
│   ├── app/                     # Redux store, cart, local persistence
│   ├── data/                    # Static categories and navigation data
│   └── pages/                   # Home, login, events, checkout, admin, etc.
│
├── server/                      # Express backend
│   ├── config/                  # MongoDB connection configuration
│   ├── controllers/             # Main business logic for API endpoints
│   ├── middleware/              # Authentication and role checks
│   ├── models/                  # Mongoose models: User, Event, Booking
│   ├── routes/                  # Express route definitions
│   ├── services/                # Email, notifications, PDF ticket service
│   ├── assets/                  # Backend assets such as logo for email
│   ├── test/                    # Backend automated tests
│   └── server.js                # Express app entry point
│
├── api/index.js                 # Vercel serverless API adapter
├── public/                      # Static frontend files
├── vercel.json                  # Vercel deployment, API rewrite, and cron setup
├── package.json                 # Frontend scripts and dependencies
└── server/package.json          # Backend scripts and dependencies


Important files:
****************
src/App.jsx  --- Defines frontend routes and protected pages.

src/Services/evenService.js -- Makes API calls to the backend

src/feature/auth/authSlice.js -- Stores user session and authentication state

src/app/cart.js -- Saves and loads cart data from browser storage.

server/server.js --Configures Express, CORS, Security middleware, routes, and health

server/config/db.js -- Connects the backend to MongoDB

server/modles/User.js -- Defines user fields, roles, password-reset fields, and favorites

server/modles/Event.js --Defines event, ticket type, seating, capacity, and moderation fields

server/models/Booking.js -- Defines booking, payment, ticket, and check-in fields

server/controllers/paymentController.js -- Creates Razorpay orders, verifies payments, processes webhooks

server/middleware/requireAuth.js -- Validates JWT tokens and checks user permissions

api/index.js -- Starts the express app inside Vercel Serverless function

vercel.json -- Routes frontend/API requests and schedules reminders

How the database works
**********************

MongoDB stores information in collections.in Eventora, the main collections are:
users
 ├── email
 ├── passwordHash
 ├── role
 └── favorites

events
 ├── title, category, date, location
 ├── ticketTypes
 ├── ticketCapacity and ticketsSold
 ├── organizer
 └── moderation status

bookings
 ├── user
 ├── event
 ├── ticket items and selected seats
 ├── payment status
 ├── Razorpay order/payment IDs
 ├── ticket code
 └── check-in status

 A booking references both a user and event. This allows the System to show a user's bookings, show an organizer's attendees, and prevent tickets from being oversold.

 Ticket booking and Payment flow
 *******************************
1. User Selects tickets and seats
2. Frontend stores the selected item in the cart
3. User opens checkout
4. Backend validates tickets, seats, event availability, and capacity
5. Backend temporarily reserves ticket inventory
6. Backend creates a Razorpay order
7. Razorpay webhook acts as a backup confirmation path
8. Frontend sends payment details for signature verification
9. Backend marks booking as paid and generates a ticket code
10. Razorpay webhook acts as a backup confirmation path
11. User receives a ticket and confirmation email

The temporary reservation prevents multiple users from buying the same ticket inventory at the same time. Unpaid reservations expire after a configured period, and the inventory is released.


Authentication and authorization
********************************
Eventora uses JWT authentication.

After login, the backend creates a signed JWT. the frontend stores the session and sends the token in the Authorization header for protected API calls

The backend checks:
--is the token valid?
-- is the user still available?
-- Has the user's role change?
-- Does the user have permission for this action?

Example:
-- Normal users can browse events and book tickets.
-- Organizers can create and manage their own events.
-- Admins can moderate events, manage users, and view analytics.

Responsive design
********************
The frontend uses TailwindCSS with mobile-first responsive design.
-- Mobile layouts use one-column designs and touch-friendly controls.
--Tablet layouts use more balanced grids.
-- Desktop layouts use multi-column event cards, dashboards, and wide layouts.
-- wide tables use horizontal scrolling on small screens instead of breaking the page.
-- Navigation change into a mobile drawer menu on smaller screens.

Security practices
********************
-- Password are hashed using bcrypt.
-- Authentication uses signed JWT tokens.
-- Sensitive credentials are stored in environment variables, not frontend code.
-- Payment signatures are verified on the backend.
-- Razorpay webhook signatures are verified before changing booking status.
-- Helmet adds common HTTP security headers.
-- CORS limits which frontend origins can call the API.
-- Rate limiting protects API endpoints from excessive requests.
-- User roles are checked on protected organizer and admin routes.
-- CSV uploads have file-count and size restrictions.

How the system handles more users
*********************************

Eventora is designed with scalability practices that support growth, but real high-traffic capacity depends on vercel limits, MongoDB Atlas tier, Razorpay capacity, SMTP provider limits, monitoring, and load testing.

-- Vercel serverless functions can scale API instances based on requests.
-- MongoDB Atlas can be upgraded as data size and traffic increase.
-- Pagination avoids loading every event from the database at once.
-- Database indexes improve frequently used queries.
-- Atomic database updates prevent ticket overselling
during concurrent bookings.
-- Ticket reservations expire, avoiding permanently locked inventory.
-- Static frontend files are served through Vercel's CDN.
-- Payment processing is delegated to razorpay instead of storing payment-card data.
-- webhook provide a backup payment-confirmation path.

Environment variables:
**********************
MONGODB_URI=
MONGODB_DB=
CLIENT_URL=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=

SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

CRON_SECRET=
EVENT_REMINDER_DAYS=

Explain that all secrets must be added in vercel environmental variables and must never be committed to github.

Local Setup
**********
git clone <your-repository-url>
cd eventora

npm install
cd server && npm install && cd ..

cp .env.example .env
cp server/.env.example server/.env

Then add local values to server/.env

npm run dev

In another terminal:
cd server
npm run dev

Testing
*******
npm run lint
npm test
npm run build

cd server
npm test