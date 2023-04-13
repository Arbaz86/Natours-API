// Import required modules and functions
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

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
  const filterBody = filterObj(req.body, "name", "email");

  // 3) Update user document
  // Find and update the current user's document in the database
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
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
