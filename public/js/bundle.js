const $c67cb762f0198593$export$516836c6a9dfc573 = ()=>{
    const el = document.querySelector(".alert");
    if (el) el.parentElement.removeChild(el);
};
const $c67cb762f0198593$export$de026b00723010c1 = (type, message)=>{
    $c67cb762f0198593$export$516836c6a9dfc573();
    const markup = `<div class="alert alert--${type}" >${message}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    setTimeout(()=>{
        $c67cb762f0198593$export$516836c6a9dfc573();
    }, 5000);
};


const $70af9284e599e604$export$596d806903d1f59e = async (email, password)=>{
    // Logging the email and password to the console
    console.log({
        email: email,
        password: password
    });
    try {
        // Sending a POST request to the login endpoint with email and password in the request body
        const res = await fetch("https://natours-api-z82r.onrender.com/api/v1/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        // Parsing the response data
        let data = await res.json();
        // Logging the response data to the console
        console.log(data);
        // Showing an alert message if the login was successful and redirecting to the home page
        if (data.status === "success") {
            (0, $c67cb762f0198593$export$de026b00723010c1)("success", "Logged in Successfully!");
            setTimeout(()=>{
                location.assign("/");
            }, 1500);
        } else // Showing an alert message with the error message if the login failed
        (0, $c67cb762f0198593$export$de026b00723010c1)("error", data.message);
    } catch (error) {
        // Showing an alert message with the error message if there was an error while sending the request
        (0, $c67cb762f0198593$export$de026b00723010c1)("error", error.message);
        console.log(error);
    }
};
const $70af9284e599e604$export$a0973bcfe11b05c9 = async ()=>{
    try {
        const res = await fetch("http://localhost:8080/api/v1/users/logout");
        const data = await res.json();
        console.log(data);
        if (data.status === "success") {
            (0, $c67cb762f0198593$export$de026b00723010c1)("success", "Logged Out Successfully!");
            location.reload();
        }
    } catch (error) {
        (0, $c67cb762f0198593$export$de026b00723010c1)("error", "Error logging out! Try again.");
    }
};



const $936fcc27ffb6bbb1$export$3bf0495508a61ee = async (name, email)=>{
    console.log({
        name: name,
        email: email
    });
    try {
        const res = await fetch("https://natours-api-z82r.onrender.com/api/v1/users/updateMe", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email
            })
        });
        const data = await res.json();
        // Showing an alert message if the login was successful and redirecting to the home page
        if (data.status === "success") (0, $c67cb762f0198593$export$de026b00723010c1)("success", "Data Updated Successfully!");
        else // Showing an alert message with the error message if the login failed
        (0, $c67cb762f0198593$export$de026b00723010c1)("error", data.message);
    } catch (error) {
        (0, $c67cb762f0198593$export$de026b00723010c1)("error", error.message);
    }
};


// Selecting the form element using its class name
const $d0f7ce18c37ad6f6$var$loginForm = document.querySelector(".form--login");
const $d0f7ce18c37ad6f6$var$logOutBtn = document.querySelector(".nav__el--logout");
const $d0f7ce18c37ad6f6$var$userDataForm = document.querySelector(".form-user-data");
if ($d0f7ce18c37ad6f6$var$loginForm) // Adding an event listener to the form for the submit event
$d0f7ce18c37ad6f6$var$loginForm.addEventListener("submit", (e)=>{
    // Preventing the default form submission behavior
    e.preventDefault();
    // Getting the email and password values from the form inputs
    let email = $d0f7ce18c37ad6f6$var$loginForm.email.value;
    let password = $d0f7ce18c37ad6f6$var$loginForm.password.value;
    // Calling the login function with email and password values
    (0, $70af9284e599e604$export$596d806903d1f59e)(email, password);
});
if ($d0f7ce18c37ad6f6$var$logOutBtn) $d0f7ce18c37ad6f6$var$logOutBtn.addEventListener("click", (0, $70af9284e599e604$export$a0973bcfe11b05c9));
if ($d0f7ce18c37ad6f6$var$userDataForm) $d0f7ce18c37ad6f6$var$userDataForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    // Getting the name and email values from the form inputs
    let name = $d0f7ce18c37ad6f6$var$userDataForm.name.value;
    let email = $d0f7ce18c37ad6f6$var$userDataForm.email.value;
    // Calling the updateData function with name and email values
    (0, $936fcc27ffb6bbb1$export$3bf0495508a61ee)(name, email);
});


//# sourceMappingURL=bundle.js.map
