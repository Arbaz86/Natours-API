// Importing mongoose package
const mongoose = require("mongoose");

// Creating a new schema for reviews
const reviewSchema = new mongoose.Schema(
  {
    // text of the review
    review: {
      type: String,
      required: [true, "Review can not be empty!"],
      trim: true,
    },
    // rating for the review
    rating: {
      type: Number,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    // date the review was created (default is current date/time)
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // ID of the tour this review is for
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },
    // ID of the user who wrote this review
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
  },
  {
    // Options for the schema
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware to populate the user field with the name and photo of the user who wrote the review
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

// Creating a model for the review schema
const Review = mongoose.model("Review", reviewSchema);

// Exporting the Review model
module.exports = Review;
