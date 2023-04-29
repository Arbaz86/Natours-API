// Importing Mongoose package
const mongoose = require("mongoose");

// Creating a booking schema using Mongoose schema constructor
const bookingSchema = new mongoose.Schema({
  // Reference to the Tour model
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "Booking must belong to a Tour!"],
  },
  // Reference to the User model
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a User!"],
  },
  // Price of the booking
  price: {
    type: Number,
    required: [true, "Booking must have a price"],
  },
  // Date and time of the booking creation
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  // Whether the booking has been paid or not
  paid: {
    type: Boolean,
    default: true,
  },
});

// Pre-query middleware to populate the user and tour fields
bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "tour",
    select: "name",
  });

  next();
});

// Creating the Booking model using the booking schema
const Booking = mongoose.model("Booking", bookingSchema);

// Exporting the Booking model
module.exports = Booking;
