// Define an error handling middleware function that takes in four arguments: err, req, res, and next.
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Send a JSON response to the client with the error status code, status, and message
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
