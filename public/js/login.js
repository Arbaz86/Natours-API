import { showAlert } from "./alert";

// Defining a function to handle login
export const login = async (email, password) => {
  // Logging the email and password to the console
  console.log({ email, password });

  try {
    // Sending a POST request to the login endpoint with email and password in the request body
    const res = await fetch(
      "https://natours-api-z82r.onrender.com/api/v1/users/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    // Parsing the response data
    let data = await res.json();

    // Logging the response data to the console
    console.log(data);

    // Showing an alert message if the login was successful and redirecting to the home page
    if (data.status === "success") {
      showAlert("success", "Logged in Successfully!");

      setTimeout(() => {
        location.assign("/");
      }, 1500);
    } else {
      // Showing an alert message with the error message if the login failed
      showAlert("error", data.message);
    }
  } catch (error) {
    // Showing an alert message with the error message if there was an error while sending the request
    showAlert("error", error.message);
    console.log(error);
  }
};

export const logout = async () => {
  try {
    const res = await fetch(
      "https://natours-api-z82r.onrender.com/api/v1/users/logout"
    );
    const data = await res.json();

    console.log(data);

    if (data.status === "success") {
      showAlert("success", "Logged Out Successfully!");
      location.reload();
    }
  } catch (error) {
    showAlert("error", "Error logging out! Try again.");
  }
};
