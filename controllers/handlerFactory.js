const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Define a function that deletes a single document of a given model by ID
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // Check if Model is a valid Mongoose model
    if (!Model || typeof Model.findById !== "function") {
      return next(new AppError("Invalid Mongoose model provided", 500));
    }

    const { id } = req.params;

    // Find and delete the document using the ID and the provided model
    const doc = await Model.findByIdAndDelete(id);

    // If no document is found, return an error using the AppError utility
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    // If the document is successfully deleted, send a success response with a status of 204 and no data
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // Check if Model is a valid Mongoose model
    if (!Model || typeof Model.findById !== "function") {
      return next(new AppError("Invalid Mongoose model provided", 500));
    }

    const { id } = req.params;

    // Update the document with the request body using the Model.findByIdAndUpdate() method
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true, // return the updated document
      runValidators: true, // run the model's validation rules on the updated document
    });

    // If the document does not exist, return an error using the AppError class
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    // If the update is successful, return a JSON response with the updated document
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // Check if Model is a valid Mongoose model
    if (!Model || typeof Model.findById !== "function") {
      return next(new AppError("Invalid Mongoose model provided", 500));
    }

    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    // Check if Model is a valid Mongoose model
    if (!Model || typeof Model.findById !== "function") {
      return next(new AppError("Invalid Mongoose model provided", 500));
    }
    let query = Model.findById(req.params?.id);

    // If popOption is provided, the function also populates the specified fields in the retrieved document.
    if (popOption) query = query.populate(popOption);

    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Executes the query and returns statistics regarding its performance
    // const docs = await features.query.explain();

    // Executes the query without returning statistics regarding its performance
    const docs = await features.query;

    res
      .status(200)
      .json({ status: "success", result: docs.length, data: { data: docs } });
  });
