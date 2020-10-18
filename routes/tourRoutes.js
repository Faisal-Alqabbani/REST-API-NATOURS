const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
// const reviewController = require('./../controller/reviewController');
const reviewRouter = require('./reviewRoutes');
const bookingRouter = require('./bookingRoutes');
const router = express.Router();

// router.param('id', tourController.checkID);
// POST /tour/123341we324/reviews
// GET /tour/123wqe324/reviews
// GET /tour/sdwer32/reviews/afsders
router.use('/:tourId/reviews', reviewRouter);
router.use('/:tourId/booking', bookingRouter);

router
  .route('/top-5-cheap')
  .get(tourController.alisTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
// You can use this route
// /tour-distance?distance=30&enter=23,-123&unit=mi
// /tour-wihtin/200/center/12323,-12/unit/:unit

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = router;
