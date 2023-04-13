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

// calcAverageRatings function to calculate the average rating for a tour based on its reviews
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // use the aggregate function to perform a match on the tourId and group the results by tour
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour", // group by tour
        nRating: { $sum: 1 }, // count the number of ratings
        aveRating: { $avg: "$rating" }, // calculate the average rating
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingQuantity: stats[0].nRating,
    ratingsAverage: stats[0].aveRating,
  });

  console.log(stats); // log the statistics to the console
};

// Add a post-save hook to the Review schema
reviewSchema.post("save", function () {
  // Whenever a Review document is saved, call the calcAverageRatings function on the constructor of the Review model
  // Pass in the tour ID associated with this Review document to calcAverageRatings
  this.constructor.calcAverageRatings(this.tour);
});

// Creating a model for the review schema
const Review = mongoose.model("Review", reviewSchema);

// Exporting the Review model
module.exports = Review;
