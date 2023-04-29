// Import the required modules
const express = require("express"); // Express.js web application framework
const reviewController = require("../controllers/reviewController"); // Controller for reviews
const authController = require("../controllers/authController"); // Controller for authentication

// Create a new router
const router = express.Router({ mergeParams: true });

// Use the 'protect' middleware for all routes in this router
router.use(authController.protect);

// Routes for reviews related to a specific tour
router
  .route("/")
  .get(reviewController.getAllReviews) // Get all reviews for a specific tour
  .post(
    authController.protect, // Requires authentication
    authController.restrictTo("user"), // Requires user role
    reviewController.setTourUserIds,
    reviewController.createReview // Creates a new review for a specific tour
  );

router
  .route("/:id")
  .get(reviewController.getReview) // Get a review by ID
  .patch(
    authController.restrictTo("user", "admin"), // Requires user and admin roles
    reviewController.updateReview // Updates a review by ID
  )
  .delete(
    authController.restrictTo("user", "admin"), // Requires user and admin roles
    reviewController.deleteReview // Deletes a review by ID
  );

// Export the router
module.exports = router;
