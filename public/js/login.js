const form = document.querySelector(".form");

const login = async (email, password) => {
  console.log({ email, password });
  try {
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

    let data = await res.json();

    console.log(data);
    if (data.status === "success") {
      alert("Logged in Successfully!");

      setTimeout(() => {
        location.assign("/");
      }, 1500);
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert(error.message);
  }
};

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let email = form.email.value;
  let password = form.password.value;

  login(email, password);
});
