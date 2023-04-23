import { showAlert } from "./alert";

export const updateData = async (name, email) => {
  console.log({ name, email });

  try {
    const res = await fetch(
      "https://natours-api-z82r.onrender.com/api/v1/users/updateMe",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
        }),
      }
    );

    const data = await res.json();

    // Showing an alert message if the login was successful and redirecting to the home page
    if (data.status === "success") {
      showAlert("success", "Data Updated Successfully!");
    } else {
      // Showing an alert message with the error message if the login failed
      showAlert("error", data.message);
    }
  } catch (error) {
    showAlert("error", error.message);
  }
};
