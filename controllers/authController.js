// Importing required modules and files
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/sendEmail");

// Function to create JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Function to create and send JWT token as a cookie
const createSendToken = (user, statusCode, res) => {
  // Create the JWT token for the user
  const token = signToken(user._id);

  // Set the cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false, // Set to true in production
    httpOnly: true,
  };

  // Set the JWT token as a cookie
  res.cookie("jwt", token, cookieOptions);

  // Send the response with the JWT token
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// Function to signup a new user
exports.signup = catchAsync(async (req, res, next) => {
  // Extract the required fields from the request body
  const { name, email, password, passwordConfirm } = req.body;

  // Create a new user
  const newUser = await User.create({ name, email, password, passwordConfirm });

  // Signup the user and, send JWT
  createSendToken(newUser, 201, res);
});

// Function to login an existing user
exports.login = async (req, res, next) => {
  // Extract the required fields from the request body
  const { email, password } = req.body;

  // Check if the email and password are provided
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // Check if the user with the provided email exists and the password is correct
  const user = await User.findOne({ email }).select("+password");

  // The correctPassword method is used to compare a plain password with a hashed password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email or Password!", 401));
  }

  // If everything is OK, send the JWT token to the client
  createSendToken(user, 200, res);
};

// Function to protect a route with JWT authentication
exports.protect = catchAsync(async (req, res, next) => {
  // Get the JWT token from the request headers and check if it exists
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // Verify the JWT token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if the user with the decoded token ID exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The token belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed the password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;

  next();
});
// This function restricts access to certain routes based on user roles
exports.restrictTo = (...roles) => {
  // Returns a middleware function that checks if the user's role is included in the allowed roles
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // If the user's role is not included, return an error response
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    // If the user's role is included, move on to the next middleware
    next();
  };
};

// This function sends a reset password email to the user
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // If there's no user with that email, return an error response
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Sent it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: 
${resetURL}.\nif you didn't forget your password, please ignore this email `;

  try {
    // Send the email with the reset URL to the user's email address
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    // Return a success response
    res.status(200).json({
      success: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    // If there was an error sending the email, clear the reset token and return an error response
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  // 2) If token has not expired, and there is user , set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
