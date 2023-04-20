// Selecting the form element using its class name
const form = document.querySelector(".form");

// Defining a function to handle login
const login = async (email, password) => {
  // Logging the email and password to the console
  console.log({ email, password });

  try {
    // Sending a POST request to the login endpoint with email and password in the request body
    const res = await fetch("http://localhost:8080/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    // Parsing the response data
    let data = await res.json();

    // Logging the response data to the console
    console.log(data);

    // Showing an alert message if the login was successful and redirecting to the home page
    if (data.status === "success") {
      alert("Logged in Successfully!");

      setTimeout(() => {
        location.assign("/");
      }, 1500);
    } else {
      // Showing an alert message with the error message if the login failed
      alert(data.message);
    }
  } catch (error) {
    // Showing an alert message with the error message if there was an error while sending the request
    alert(error.message);
  }
};

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
