// Import required modules and functions
const multer = require("multer");
// Import the Sharp library for image processing
const sharp = require("sharp");
const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
// const APIFeatures = require("../utils/apiFeatures");
// const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

// Set up the multer storage engine to store uploaded files in memory
const multerStorage = multer.memoryStorage();

// Set up a file filter function to ensure that only image files are uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    // If the file is an image file, call the callback with `true`
    cb(null, true);
  } else {
    // If the file is not an image file, call the callback with an error object and `false`
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

// Create a `multer` middleware instance with the storage engine and file filter options
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Export the `uploadTourImages` middleware function for handling file uploads
exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// Export the `resizeTourImages` middleware function for resizing and converting uploaded images
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // Use Sharp to resize and convert the image to JPEG format, then save it to disk

  // If there are no uploaded images, move on to the next middleware function
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover Image
  // Set the filename for the resized cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  // Resize and convert the cover image to JPEG format, and save it to disk
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 80 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  // Initialize an empty array to store the filenames of the resized images
  req.body.images = [];

  // Use Promise.all() to process all images concurrently
  await Promise.all(
    req.files.images.map(async (file, i) => {
      // Generate a unique filename for each image
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      // Resize and convert the image to JPEG format, and save it to disk
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      // Add the new filename to the req.body.images array
      req.body.images.push(filename);
    })
  );

  // Call the next middleware function
  next();
});

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
