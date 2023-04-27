// Require the express module
const express = require("express");
const authController = require("../controllers/authController");

// Require the view controller module
const viewController = require("../controllers/viewController");

// Create an instance of the express router
const router = express.Router();

// router.use(authController.isLoggedIn);

// Define the routes using the router object
// When a GET request is made to the root path ("/"), call the getOverview function from the viewController module
router.route("/").get(authController.isLoggedIn, viewController.getOverview);

// When a GET request is made to the "/tour" path, call the getTour function from the viewController module
router
  .route("/tour/:slug")
  .get(authController.isLoggedIn, viewController.getTour);

router
  .route("/login")
  .get(authController.isLoggedIn, viewController.getLoginForm);

router
  .route("/signup")
  .get(authController.isLoggedIn, viewController.getSignupForm);

router.route("/me").get(authController.protect, viewController.getAccount);

router
  .route("/submit-user-data")
  .patch(authController.protect, viewController.updateUserData);

// Export the router object
module.exports = router;
