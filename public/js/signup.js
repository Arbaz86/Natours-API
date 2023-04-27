import { showAlert } from "./alert";

export const signup = async ({ name, email, password, passwordConfirm }) => {
  console.log({ name, email, password, passwordConfirm });
  try {
    const res = await fetch(
      "https://natours-api-z82r.onrender.com/api/v1/users/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, passwordConfirm }),
      }
    );

    const data = await res.json();

    if (data.status === "success") {
      showAlert("success", "Signup Successfully!");

      setTimeout(() => {
        location.assign("/");
      }, 500);
    } else {
      showAlert("error", data.message);
    }
  } catch (error) {
    showAlert("error", error.message);
  }
};
