const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Exporting function that gets all tour data and renders overview page
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Getting tour data from tourModel collection
  const tours = await Tour.find();

  // 2) Building a template for the overview page
  // 3) Rendering that template using the tour data from step 1
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

// Exporting function that renders tour details page
exports.getTour = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const tour = await Tour.findOne({ slug })
    .populate({
      path: "reviews",
      select: "review rating user createdAt",
    })
    .populate({
      path: "guides",
    });

  console.log(tour);

  res.status(200).render("tour", {
    title: "The Forest Hiker Tour",
    tour,
  });
});
