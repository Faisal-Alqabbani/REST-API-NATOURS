/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51GryYXKnhobCjn8dRB4y7Y6vIn7656V8bDvVJWQm34QKWk0XQSBciWPINSm1sFS6tQWDYxBGKhagDHD6oT6Y2tVu00Co51U6z4'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/booking/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form pluse charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
