const express = require('express');
// const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const reviewController = require('./../controller/reviewController');
const router = express.Router({ mergeParams: true });
router.use(authController.protect);
router
  .route('/')
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  )
  .get(reviewController.getAllReview);
router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
