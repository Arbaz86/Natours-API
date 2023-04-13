// Importing mongoose package
const mongoose = require("mongoose");
const Tour = require("./tourModel");

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

// A static method on the Review schema to calculate and update the average rating for a tour
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // Use the aggregate function to perform a match on the tourId and group the results by tour
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour", // Group by tour ID
        nRating: { $sum: 1 }, // Count the number of ratings
        aveRating: { $avg: "$rating" }, // Calculate the average rating
      },
    },
  ]);

  if (stats.length > 0) {
    // If there are ratings for the tour, update the tour's rating statistics in the database
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingsAverage: stats[0].aveRating,
    });
  } else {
    // If there are no ratings for the tour, set the tour's rating statistics to default values
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
// Add a post-save hook to the Review schema
reviewSchema.post("save", function () {
  // Whenever a Review document is saved, call the calcAverageRatings function on the constructor of the Review model
  // Pass in the tour ID associated with this Review document to calcAverageRatings
  this.constructor.calcAverageRatings(this.tour);
});

// A pre middleware function on the Review schema that saves the current review document to `this.r`
// before executing the query, so that we can access it in the post middleware
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

// A post middleware function on the Review schema that updates the tour's rating statistics
// after a findOneAndX query (e.g. findOneAndUpdate, findOneAndDelete) has been executed
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

// Creating a model for the review schema
const Review = mongoose.model("Review", reviewSchema);

// Exporting the Review model
module.exports = Review;
