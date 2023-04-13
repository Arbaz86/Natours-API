const mongoose = require("mongoose");
const app = require("./app");
const PORT = process.env.PORT || 8080;

// Connect to MongoDB using the connection string from the environment variables
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("> Successfully connected to DB"))
  .catch((error) => console.error(`> Error connecting to MongoDB: ${error}`));

// Start the Express server on the specified port
try {
  app.listen(PORT, () => {
    console.log(`> Server running on port ${PORT}`);
  });
} catch (error) {
  console.error(`Error starting server: ${error}`);
}
