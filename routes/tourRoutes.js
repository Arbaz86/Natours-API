const express = require("express");
const router = express.Router();

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");
// router.param("id", tourController.checkID);

router.use("/:tourId/reviews", reviewRouter);
// POST /tour/sdf5sdf5jkj61sfs/reviews
// GET /tour/sdf5sdf5jkj61sfs/reviews
// GET /tour/sdf5sdf5jkj61sfs/reviews/989dfs15

// Route for fetching tours within a specified radius from a given point
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);

// Route for fetching the distances of tours from a given point
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

// Tours
router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
