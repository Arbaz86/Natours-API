// Importing the Stripe and Express packages
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");

// Importing utility functions and error handling module
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Importing Tour and Booking models
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");

// Async middleware function to get the checkout session for a tour
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const { tourId } = req.params;

  const tour = await Tour.findById(tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tourId,
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 80 * 100,
        },
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
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
