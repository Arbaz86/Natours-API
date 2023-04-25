import { showAlert } from "./alert"; // Importing a function named "showAlert" from a local file named "alert"

// Defining a function named "updateSettings" that takes two parameters: "data" and "type"
export const updateSettings = async (data, type) => {
  try {
    const endpoint = type === "password" ? "updateMyPassword" : "updateMe"; // Creating a variable named "endpoint" based on the value of the "type" parameter

    const headers = // Creating a variable named "headers" based on the value of the "type" parameter
      type === "password" ? { "Content-Type": "application/json" } : {};

    const res = await fetch(
      `https://natours-api-z82r.onrender.com/api/v1/users/${endpoint}`,
      {
        // Sending a PATCH request to the server to update the user's data
        method: "PATCH",
        headers,
        body: type === "password" ? JSON.stringify(data) : data,
      }
    );

    const resData = await res.json(); // Parsing the response data as JSON and assigning it to a variable named "resData"

    // Extracting status and message from resData using destructuring assignment
    const { status, message } = resData;

    // If the server response status is "success"
    if (status === "success") {
      showAlert("success", `${type.toUpperCase()} Updated Successfully!`); // Show a success message to the user

      // Reload the page after successful update
      setTimeout(() => {
        location.reload(); // Reload the page after a delay of 1000 milliseconds (1 second)
      }, 1000);
    } else {
      // If the server response status is not "success"
      showAlert("error", message); // Show an error message to the user
    }
  } catch (error) {
    // If there is an error in the try block
    showAlert("error", error.message); // Show an error message to the user
  }
};
