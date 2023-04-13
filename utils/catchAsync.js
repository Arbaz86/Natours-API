module.exports = (fn) => {
  // This function takes in an asynchronous function as an argument
  return (req, res, next) => {
    // We return a new function that takes in the req, res, and next parameters
    // This new function calls the asynchronous function and passes in the req, res, and next parameters
    // We then chain a catch() method to catch any errors thrown by the asynchronous function
    // and pass them to the Express error handling middleware via the next() function
    fn(req, res, next).catch(next);
  };
};
