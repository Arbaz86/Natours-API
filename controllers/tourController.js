const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
// const APIFeatures = require("../utils/apiFeatures");
// const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

// get request for all the data
exports.getAllTours = factory.getAll(Tour);

// get request for single data that match with id
exports.getTour = factory.getOne(Tour, { path: "reviews" });

// post request for crating new data
exports.createTour = factory.createOne(Tour);

// patch request for updating data by id
exports.updateTour = factory.updateOne(Tour);

// delete request for deleting a data by id
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = Tour.aggregate();
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/19.062060, 72.906577/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  // Extracting distance, latlng and unit from the params of the request.
  const { distance, latlng, unit } = req.params;
  // Splitting the latlng string into two strings, one for latitude and one for longitude.
  const [lat, lng] = latlng.split(",");

  // Calculating the radius in radians for the geospatial query based on the unit provided.
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  // Checking if the latitude and longitude have been provided, and returning an error if they are missing.
  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  // Querying the Tour model for tours that have startLocation within the radius of the specified location.
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  // Sending the response with the tours found.
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  // Extracting latlng and unit from the params of the request.
  const { latlng, unit } = req.params;
  // Splitting the latlng string into two strings, one for latitude and one for longitude.
  const [lat, lng] = latlng.split(",");

  // Calculating the multiplier based on the unit provided.
  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  // Checking if the latitude and longitude have been provided, and returning an error if they are missing.
  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  // Querying the Tour model for tours that are sorted by their distance from the specified location.
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  // Sending the response with the distances found.
  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});
