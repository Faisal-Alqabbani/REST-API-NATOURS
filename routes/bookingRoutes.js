const express = require('express');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');
const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.setTourAndUser, bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getOneBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;
