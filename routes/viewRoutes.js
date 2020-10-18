const express = require('express');
const viewController = require('./../controller/viewController');
const authController = require('./../controller/authController');
const bookingController = require('./../controller/bookingController');
const router = express.Router();
router.get(
  '/',

  authController.isLoggedIn,
  viewController.getOverView,
  bookingController.createBookingCheckout
);

router.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewController.getTourView
);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

router.get('/my-tour', authController.protect, viewController.getMyTour);
router.get('/manage-users', authController.protect, viewController.getAllUsers);

module.exports = router;
