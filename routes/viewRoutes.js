const express = require("express");
const viewController = require("../controllers/viewController");

const router = express.Router();

// router.get("/", (req, res) => {
//   res.status(200).render("base", {
//     tour: "The Forest Hiker",
//     user: "Arbaz",
//   });
// });

// router.route("/").get();
router.route("/").get(viewController.getOverview);
router.route("/tour").get(viewController.getTour);

module.exports = router;
