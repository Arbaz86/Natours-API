const Tour = require("../models/tourModel");
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
