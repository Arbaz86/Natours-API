import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";

// Selecting the form element using its class name
const loginForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");

if (loginForm) {
  // Adding an event listener to the form for the submit event
  loginForm.addEventListener("submit", (e) => {
    // Preventing the default form submission behavior
    e.preventDefault();

    // Getting the email and password values from the form inputs
    let email = loginForm.email.value;
    let password = loginForm.password.value;

    // Calling the login function with email and password values
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener("click", logout);

if (userDataForm) {
  userDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Getting the name and email values from the form inputs
    let name = userDataForm.name.value;
    let email = userDataForm.email.value;

    // Calling the updateData function with name and email values
    await updateSettings({ name, email }, "data");
  });
}
if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save-password").innerHTML = "Updating...";

    // Getting the password-current, password and password-confirm values from the form inputs
    let passwordCurrent = userPasswordForm["password-current"].value;
    let password = userPasswordForm["password"].value;
    let passwordConfirm = userPasswordForm["password-confirm"].value;

    // Calling the updateData function with password-current, password and password-confirm values
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );

    document.querySelector(".btn--save-password").innerHTML = "Save Password";

    passwordCurrent = userPasswordForm["password-current"].value = "";
    password = userPasswordForm["password"].value = "";
    passwordConfirm = userPasswordForm["password-confirm"].value = "";
  });
}
