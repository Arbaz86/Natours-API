const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

// User authentication routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// It will protect all the below routes
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", userController.getMe, userController.getUser);

// Define a router for updating user data, including photo uploads
router.patch(
  "/updateMe",
  userController.uploadUserPhoto, // Middleware function for handling photo uploads
  userController.resizeUserPhoto, // Middleware function for resizing and saving uploaded photos
  userController.updateMe // Main handler function for updating user data
);
router.delete("/deleteMe", userController.deleteMe);

router.use(authController.restrictTo("admin"));
// User management routes
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// Export the router
module.exports = router;
