// Importing required modules
const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");

// Creating a new Mongoose schema for tours
const tourSchema = new mongoose.Schema(
  {
    // Defining the properties of a tour object
    name: {
      type: String,
      required: [true, "A tour must have a name"], // The name is required
      unique: true, // The name must be unique
      trim: true, // Remove whitespace from the beginning and end of the name
      maxlength: [40, "A tour name must have less or equal then 40 characters"], // The name cannot exceed 40 characters
      minlength: [10, "A tour name must have more or equal then 10 characters"], // The name must have at least 10 characters
      // validate: [validator.isAlpha, "Tour name must only contain characters"], // A validator to check if the name only contains letters
    },
    // Define a slug field that will store a URL-friendly version of the tour name
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"], // The duration is required
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"], // The maximum group size is required
    },
    difficulty: {
      type: String,
      required: [true, " A tour must have a difficulty"], // The difficulty level is required
      enum: {
        values: ["easy", "medium", "difficult"], // The difficulty level can only be one of these values
        message: "Difficulty is either: easy, medium, difficult", // Error message if a value outside the enum is entered
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5, // The default rating is 4.5
      min: [1, "Rating must be above 1.0"], // The minimum rating is 1.0
      max: [5, "Rating must be below 5.0"], // The maximum rating is 5.0
      set: (val) => Math.round(val * 10) / 10, // Run Each time ratingsAverage Val Changed 4.66666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0, // The default rating quantity is 0
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"], // The price is required
    },
    priceDiscount: {
      type: Number,
      // custom validator to ensure that discount price is less than the regular price
      validate: {
        validator: function (val) {
          // The validator function will run when creating a new document
          // `this` refers to the current document being created
          return val < this.price; // The discount price must be less than the regular price
        },
        message: "Discount price ({VALUE}) should be below the regular price", // Error message if the validator fails
      },
    },
    summary: {
      type: String,
      required: [true, "A tour must have a summary"], // The summary is required
      trim: true, // Remove whitespace from the beginning and end of the summary
    },
    description: { type: String, trim: true }, // Optional tour description
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"], // The cover image is required
    },
    images: { type: [String] }, // An array of image URLs for the tour
    // The createdAt field stores the date when the tour was created
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // this field won't be sent to clients by default
    },

    // The startDates field is an array of dates when the tour starts
    startDates: [Date],

    // The secretTour field is a boolean flag that indicates whether the tour is a secret tour or not
    secretTour: {
      type: Boolean,
      default: false,
    },

    // The startLocation field is a GeoJSON object that stores the starting location of the tour
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    // The locations field is an array of GeoJSON objects that store the locations visited during the tour
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],

    // The guides field is an array of user IDs that correspond to the guides for the tour
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    // The toJSON and toObject options add virtual properties to the JSON and object representations of the schema
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 });
// Create an index on the 'price' and 'averageRatings' fields of the 'tourSchema' schema
tourSchema.index({ price: 1, averageRatings: -1 });

// This line of code creates an index on the "slug" field in ascending order in the "tourSchema" collection.
tourSchema.index({ slug: 1 });

// Creating a 2dsphere index for the startLocation field of the Tour model for geospatial queries.
tourSchema.index({ startLocation: "2dsphere" });

// Middleware function that automatically generates a slug field based on the tour name before saving a new document
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// The reviews virtual populates the reviews field of the tour document with reviews from the Review model
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// The pre-find middleware populates the guides field of the tour document with the corresponding user documents from the User model
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });

  next();
});

// The Tour model is created using the tourSchema and exported
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
