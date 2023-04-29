// Importing required modules and files
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/sendEmail");
const { promisify } = require("util");

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

  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelcome();

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

exports.logout = (req, res) => {
  res.cookie("jwt", "logged out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
  });
};

// Function to protect a route with JWT authentication
exports.protect = catchAsync(async (req, res, next) => {
  // Get the JWT token from the request headers and check if it exists
  let token;

  // If the Authorization header starts with "Bearer", assume the token is a JWT and extract it from the header
  if (req.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers?.authorization?.split(" ")[1];
  }
  // Otherwise, check for a cookie named "jwt" and use its value as the token
  else if (req.cookies?.jwt) {
    token = req.cookies?.jwt;
  }

  // If no JWT token was found, return an error indicating that the user is not logged in
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
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies?.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      console.log(decoded);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // console.log(currentUser);

      // 3) Check if user changed password after the token was issued
      // if (currentUser.changedPasswordAfter(decoded.iat)) {
      //   return next();
      // }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      req.user = currentUser;

      return next();
    } catch (err) {
      console.log(err);
      return next();
    }
  }

  next();
};

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
  const resetToken = user.createPasswordRestToken();
  await user.save({ validateBeforeSave: false });

  // 3) Sent it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    // Send the email to the user's email address with the reset URL
    await new Email(user, resetURL).sendPasswordReset();

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
