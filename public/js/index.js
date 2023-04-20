import { login } from "./login";

// Selecting the form element using its class name
const form = document.querySelector(".form");

if (form) {
  // Adding an event listener to the form for the submit event
  form.addEventListener("submit", (e) => {
    // Preventing the default form submission behavior
    e.preventDefault();

    // Getting the email and password values from the form inputs
    let email = form.email.value;
    let password = form.password.value;

    // Calling the login function with email and password values
    login(email, password);
  });
}
