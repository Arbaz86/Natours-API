const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

// Routes for reviews related to a specific tour
router
  .route("/")
  .get(reviewController.getAllReviews) // retrieves all reviews for a specific tour
  .post(
    authController.protect, // requires authentication
    authController.restrictTo("user"), // requires user role
    reviewController.setTourUserIds,
    reviewController.createReview // creates a new review for a specific tour
  );

router
  .route("/:id")
  .get(reviewController.getReview) // get a review by ID
  .patch(
    authController.restrictTo("user", "admin"), // requires user and admin role
    reviewController.updateReview
  ) // updates a review by ID
  .delete(
    authController.restrictTo("user", "admin"), // requires user and admin role
    reviewController.deleteReview
  ); // deletes a review by ID

// Export the router
module.exports = router;
