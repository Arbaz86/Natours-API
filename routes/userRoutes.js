// Import the Express.js module
const express = require("express");

// Import userController and authController modules
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

// Create an instance of an Express Router
const router = express.Router();

// Define user authentication routes using the authController methods
router.post("/signup", authController.signup); // User signup route
router.post("/login", authController.login); // User login route
router.get("/logout", authController.logout); // User logout route

// Define password reset routes
router.post("/forgotPassword", authController.forgotPassword); // Route for sending reset password email
router.patch("/resetPassword/:token", authController.resetPassword); // Route for resetting password using token

// Require authentication for all routes below this point
router.use(authController.protect);

// Define routes for updating user data, including photo uploads
router.patch("/updateMyPassword", authController.updatePassword); // Route for updating user password
router.get("/me", userController.getMe, userController.getUser); // Route for retrieving current user data

// Define a router for updating user data, including photo uploads
router.patch(
  "/updateMe",
  userController.uploadUserPhoto, // Middleware function for handling photo uploads
  userController.resizeUserPhoto, // Middleware function for resizing and saving uploaded photos
  userController.updateMe // Main handler function for updating user data
);
router.delete("/deleteMe", userController.deleteMe); // Route for deleting user account

// Require admin access for all routes below this point
router.use(authController.restrictTo("admin"));

// Define routes for user management
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser); // Route for retrieving all users and creating new users
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser); // Route for retrieving, updating and deleting user data by ID

// Export the router for use in other modules
module.exports = router;
