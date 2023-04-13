const Review = require("../models/reviewModel");
// const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.setTourUserIds = (req, res, next) => {
  // Check if req.body.tour exists, set to tourId parameter if not
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // Check if req.body.user exists, set to logged in user's ID if not
  if (!req.body.user) req.body.user = req.user.id;

  // Call next middleware function
  next();
};
// Retrieves all reviews or the reviews for a specific tour if provided in the request parameter
exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

// The createReview function creates a new review, sets the tour and user if not provided, and sends a success response with the newly created review
exports.createReview = factory.createOne(Review);

// The updateReview function uses the updateOne function from the factory utility to update a review by ID.
exports.updateReview = factory.updateOne(Review);

// The deleteReview function deletes a review using the deleteOne function from the factory utility, which is a reusable function for deleting a single document by ID from a given model.
exports.deleteReview = factory.deleteOne(Review);
