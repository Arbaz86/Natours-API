import { showAlert } from "./alert";

export const updateSettings = async (data, type) => {
  console.log({ data, type });
  try {
    const endpoint = type === "password" ? "updateMyPassword" : "updateMe";

    const res = await fetch(
      `https://natours-api-z82r.onrender.com/api/v1/users/${endpoint}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const resData = await res.json();

    // Showing an alert message if the login was successful and redirecting to the home page
    if (resData.status === "success") {
      showAlert("success", `${type.toUpperCase()} Updated Successfully!`);
    } else {
      // Showing an alert message with the error message if the login failed
      showAlert("error", resData.message);
    }
  } catch (error) {
    showAlert("error", error.message);
  }
};
