import { login, logout } from "./login";
import { updateData } from "./updateSettings";

// Selecting the form element using its class name
const loginForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");

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
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Getting the name and email values from the form inputs
    let name = userDataForm.name.value;
    let email = userDataForm.email.value;

    // Calling the updateData function with name and email values
    updateData(name, email);
  });
}
