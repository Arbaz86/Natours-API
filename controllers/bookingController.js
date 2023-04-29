// Importing the Stripe and Express packages
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const factory = require("./handlerFactory");

// Importing utility functions and error handling module
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Importing Tour and Booking models
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");

// Async middleware function to get the checkout session for a tour
// Define an Express controller for creating a Stripe checkout session
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour from the request parameters
  const { tourId } = req.params;

  // Find the tour in the database using the Tour model
  const tour = await Tour.findById(tourId);

  // 2) Create a new Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    // Define the payment method types (only card payments are supported)
    payment_method_types: ["card"],
    // Set the mode to "payment" to create a one-time payment
    mode: "payment",
    // Define the URLs for success and cancellation redirects
    success_url: `${req.protocol}://${req.get("host")}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    // Set the customer email and client reference ID
    customer_email: req.user.email,
    client_reference_id: tourId,
    // Add the line items for the session (in this case, only one tour)
    line_items: [
      {
        // Define the price data for the tour
        price_data: {
          currency: "inr",
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 80 * 100, // Convert the tour price to paise (Indian currency)
        },
        quantity: 1, // Only one tour is being booked in this session
      },
    ],
  });

  // 3) Send the session object as a response
  res.status(200).json({
    status: "success",
    session,
  });
});
// Async middleware function to create a booking after a successful checkout
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  // If the required query parameters are missing, pass control to the next middleware
  if (!tour || !user || !price) return next();

  // Create the booking
  await Booking.create({ tour, user, price });

  // Redirect to the original URL without query parameters
  res.redirect(req.originalUrl.split("?")[0]);
});

exports.createBooking = factory.createOne(Booking);

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);
