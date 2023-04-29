// Import required modules
const express = require("express"); // Import the Express framework
const bookingController = require("../controllers/bookingController"); // Import the booking controller
const authController = require("../controllers/authController"); // Import the authentication controller

// Create an Express router instance
const router = express.Router(); // Create an instance of the Express router

router.use(authController.protect); // Use the authentication controller to protect all routes defined below this line

// Define the "/checkout-session/:tourId" route
router.get(
  "/checkout-session/:tourId",
  bookingController.getCheckoutSession // Handle the route with the getCheckoutSession method of the booking controller
);

router
  .route("/")
  .get(bookingController.getAllBookings) // Handle GET requests to the root route with the getAllBookings method of the booking controller
  .post(bookingController.createBooking); // Handle POST requests to the root route with the createBooking method of the booking controller

router
  .route("/:id")
  .get(bookingController.getBooking) // Handle GET requests to "/:id" with the getBooking method of the booking controller
  .patch(bookingController.updateBooking) // Handle PATCH requests to "/:id" with the updateBooking method of the booking controller
  .delete(bookingController.deleteBooking); // Handle DELETE requests to "/:id" with the deleteBooking method of the booking controller

// Export the router for use in other files
module.exports = router; // Export the router instance for use in other files
