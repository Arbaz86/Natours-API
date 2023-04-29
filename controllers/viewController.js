const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (req, res, next) => {
  // Find all bookings made by the currently logged-in user.
  const bookings = await Booking.find({ user: req?.user?.id });

  // Extract an array of tour IDs from the user's bookings.
  const tourIDs = bookings.map((el) => el.tour._id);

  let tours;

  // If the user has booked some tours, exclude them from the list of all tours.
  if (tourIDs.length > 0) {
    tours = await Tour.find({ _id: { $nin: tourIDs } });
  } else {
    // Otherwise, fetch all tours.
    tours = await Tour.find();
  }

  // Render the `overview` view with the list of tours.
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

// Define the getTour controller function
exports.getTour = catchAsync(async (req, res, next) => {
  // Get the slug parameter from the request
  const { slug } = req.params;

  // Find the tour with the given slug, and populate its reviews field with the review, rating, and user fields
  const tour = await Tour.findOne({ slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  // If no tour was found, return a 404 error using the AppError class
  if (!tour) return next(new AppError("There is no tour with that name.", 404));

  // If a tour was found, render the tour page with the tour data and title
  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});

// Export a function to get the login form
exports.getLoginForm = (req, res) => {
  // Render the login template and send it to the client with a title of "Log into your account"
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

// Export a function to get the user account
exports.getAccount = (req, res) => {
  // Render the account template and send it to the client with a title of "Your Account"
  res.status(200).render("account", {
    title: "Your Account",
  });
};

// Export a function to get the signup form
exports.getSignupForm = (req, res) => {
  // Render the signup template and send it to the client with a title of "Create your account!"
  res.status(200).render("signup", {
    title: "Create your account!",
  });
};

// Export a function to get the tours booked by the user
exports.getMyTour = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  // Render the overview template and send it to the client with a title of "My Tours" and a list of tours
  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});

// Export a function to update user data
exports.updateUserData = catchAsync(async (req, res, next) => {
  // Get the name and email fields from the request body
  const { name, email } = req.body;

  // Update the user data in the database
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, runValidators: true }
  );

  // Render the account template and send it to the client with a title of "Your Account" and the updated user data
  res.status(200).render("account", {
    title: "Your Account",
    user: updatedUser,
  });
});
