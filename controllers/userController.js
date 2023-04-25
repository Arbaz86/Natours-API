// Import required modules and functions
const multer = require("multer");
// Import the Sharp library for image processing
const sharp = require("sharp");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

// Set up the disk storage engine for uploaded files
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Specify the directory where the files will be saved
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     // Generate a unique file name for the uploaded file
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

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

// Export a middleware function for handling user photo uploads
exports.uploadUserPhoto = upload.single("photo");

// Define a middleware function to resize user photos
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  // If there is no uploaded file, skip to the next middleware function
  if (!req.file) return next();

  // Rename the uploaded file to include the user ID and timestamp
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Use Sharp to resize and convert the image to JPEG format, then save it to disk
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  // Call the next middleware function
  next();
});

// Define a helper function to filter out unwanted fields when updating user data
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  // Iterate over all keys in the object and copy allowed fields to a new object
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  // Return the new object with only allowed fields
  return newObj;
};

// Define controller functions for handling user-related requests

// Create a new user (not implemented)
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

// Update the currently logged-in user's data
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);

  // 1) Create error if user POSTs password data
  // Check if request body contains password-related fields and create an error if so
  if (req.body?.password || req.body?.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  // Use the filterObj helper function to remove unwanted fields from the request body
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  // Find and update the current user's document in the database
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // Send response with updated user data
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Deactivate the currently logged-in user's account
exports.deleteMe = catchAsync(async (req, res, next) => {
  // Find and update the current user's document to set active field to false
  await User.findByIdAndUpdate(req.user.id, { active: false });

  // Send response with success status and null data
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get all users
exports.getAllUsers = factory.getAll(User);

// Get a single user by ID
exports.getUser = factory.getOne(User);

// Update a single user by ID & NOTE: Do not update password with this one
exports.updateUser = factory.updateOne(User);

// Delete a single user by ID
exports.deleteUser = factory.deleteOne(User);
