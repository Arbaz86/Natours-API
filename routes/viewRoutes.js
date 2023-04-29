// Require the express module
const express = require("express");

// Require the necessary controller modules
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");
const viewController = require("../controllers/viewController");

// Create an instance of the express router
const router = express.Router();

// Define the middleware that checks if the user is logged in for all routes
// router.use(authController.isLoggedIn);

// Define the routes using the router object
router.route("/").get(
  bookingController.createBookingCheckout, // Middleware to handle booking
  authController.isLoggedIn, // Middleware to check if the user is logged in
  viewController.getOverview // Function to handle the request and render the overview page
);

router.route("/tour/:slug").get(
  authController.isLoggedIn, // Middleware to check if the user is logged in
  viewController.getTour // Function to handle the request and render the tour page
);

router.route("/login").get(
  authController.isLoggedIn, // Middleware to check if the user is logged in
  viewController.getLoginForm // Function to handle the request and render the login form page
);

router.route("/signup").get(
  authController.isLoggedIn, // Middleware to check if the user is logged in
  viewController.getSignupForm // Function to handle the request and render the signup form page
);

router.route("/me").get(
  authController.protect, // Middleware to check if the user is logged in and protect the route
  viewController.getAccount // Function to handle the request and render the user account page
);

router.route("/my-tours").get(
  authController.protect, // Middleware to check if the user is logged in and protect the route
  viewController.getMyTour // Function to handle the request and render the user's booked tours page
);

router.route("/submit-user-data").patch(
  authController.protect, // Middleware to check if the user is logged in and protect the route
  viewController.updateUserData // Function to handle the request and update the user's data
);

// Export the router object
module.exports = router;
