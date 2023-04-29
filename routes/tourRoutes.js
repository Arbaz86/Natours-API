// Import the necessary modules
const express = require("express");
const router = express.Router();

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

// Set up a new route for handling requests related to reviews
router.use("/:tourId/reviews", reviewRouter);

// Route for fetching tours within a specified radius from a given point
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);

// Route for fetching the distances of tours from a given point
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

// Route for fetching the top 5 cheapest tours
router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

// Route for fetching all tours and creating a new tour
router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

// Route for fetching, updating, and deleting a specific tour
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

// Export the router object
module.exports = router;
