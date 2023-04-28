import { showAlert } from "./alert";

// const stripe = Stripe(
//   "pk_test_51N1T9nSFVPq5h09idp6f91aEyLa1LuYS0GHBUf69WiDHnhABgy2kljo1iV35PYk1FJGU3lAHbCl1JR9l4B4KjgEP00UTFbcsdY"
// );

export const bookTour = async (tourId) => {
  // 1) Get checkout session from API
  try {
    const res = await fetch(
      `https://natours-api-z82r.onrender.com/api/v1/bookings/checkout-session/${tourId}`
    );

    const session = await res.json();
    const url = session?.session?.url;

    if (session?.session?.url) {
      window.location.href = url;
    } else {
      showAlert("error", "Something went wrong!");
    }
  } catch (error) {
    console.log(error.message);
    showAlert("error", error.message);
  }

  // 2) Create checkout form + chanre credit card
};
