// Require the express module
const express = require("express");

// Require the view controller module
const viewController = require("../controllers/viewController");

// Create an instance of the express router
const router = express.Router();

// Define the routes using the router object
// When a GET request is made to the root path ("/"), call the getOverview function from the viewController module
router.route("/").get(viewController.getOverview);

// When a GET request is made to the "/tour" path, call the getTour function from the viewController module
router.route("/tour").get(viewController.getTour);

// Export the router object
module.exports = router;
