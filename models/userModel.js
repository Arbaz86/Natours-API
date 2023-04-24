// Require necessary modules
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Create a new mongoose schema for users
const userSchema = new mongoose.Schema({
  // User's name
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
    trim: true,
  },
  // User's email
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  // User's profile photo
  photo: {
    type: String,
    default: "default.jpg",
  },
  // User's role (user, guide, lead-guide, admin)
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  // User's password
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  // User's password confirmation (used for validation)
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // Validator function to check if password and password confirmation match
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  // Date when user's password was last changed
  passwordChangedAt: { type: Date, default: Date.now() },
  // User's password reset token (used for resetting password)
  passwordResetToken: String,
  // User's password reset token expiration date
  passwordResetExpires: Date,
  // Flag to indicate if user is active (used for soft deletion)
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Mongoose middleware to hash password before saving user to database
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually MODIFIED
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 10
  this.password = await bcrypt.hash(this.password, 10);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  // Call next middleware
  next();
});

// Mongoose middleware to set passwordChangedAt field when password is changed
userSchema.pre("save", function (next) {
  // If password was not modified or user is new, skip this middleware
  if (!this.isModified("password") || this.isNew) return next();

  // Set passwordChangedAt field to current time minus 1 second
  this.passwordChangedAt = Date.now() - 1000;

  // Call next middleware
  next();
});

// Mongoose middleware to exclude inactive users from query results
userSchema.pre(/^find/, function (next) {
  // Set active field to $ne (not equal) false to exclude inactive users from query
  this.find({ active: { $ne: false } });

  // Call next middleware
  next();
});

// Mongoose method to check if plain password matches hashed password
userSchema.methods.correctPassword = async function (
  plainPassword,
  userPassword
) {
  // Compare plain password with hashed password and return result
  return bcrypt.compare(plainPassword, userPassword);
};

// Check if the password was changed after a given timestamp
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Create a password reset token
userSchema.methods.createPasswordRestToken = function () {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  //  hashing the token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log({ resetToken, passwordResetToken: this.passwordResetToken });

  // added 10 minutes expiry time
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
