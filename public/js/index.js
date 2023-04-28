import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";
import { signup } from "./signup";
import { bookTour } from "./stripe";

// Selecting the form element using its class name
const loginForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const signupBtn = document.querySelector(".form--signup");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");
const bookBtn = document.getElementById("book-tour");

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

if (signupBtn) {
  signupBtn.addEventListener("submit", (e) => {
    // Preventing the default form submission behavior
    e.preventDefault();

    // Getting the name, email, password and passwordConfirm values from the form inputs
    let name = signupBtn.name.value;
    let email = signupBtn.email.value;
    let password = signupBtn.password.value;
    let passwordConfirm = signupBtn.passwordConfirm.value;

    // Calling the signup function with name, email, password and passwordConfirm values
    signup({ name, email, password, passwordConfirm });
  });
}

if (userDataForm) {
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Getting the name, email and photo values from the form inputs
    const formData = new FormData();
    formData.append("name", userDataForm.name.value);
    formData.append("email", userDataForm.email.value);
    formData.append("photo", userDataForm.photo.files[0]);

    // Calling the updateData function with name and email values
    updateSettings(formData, "data");
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

if (bookBtn) {
  bookBtn.addEventListener("click", (e) => {
    e.target.textContent = "Processing...";
    const { tourId } = e.target.dataset;
    console.log(tourId);

    bookTour(tourId);
  });
}
