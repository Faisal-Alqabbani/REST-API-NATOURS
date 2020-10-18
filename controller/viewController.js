const Tour = require('../models/toursModel');
const Booking = require('../models/bookingModel');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
exports.getOverView = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collections
  const tours = await Tour.find();
  // 2) Build template
  // 3) render that template
  res.status(200).render('overview', { title: 'All Tours', tours });
});
exports.getTourView = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'user rating review',
  });
  if (!tour) {
    next(new AppError('there is no tour with that name', 404));
  }
  res.status(200).render('tour', { tour, title: `${tour.name} Tour` });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Login' });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', { title: 'Your Account' });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(200)
    .render('account', { title: 'Your Account', user: updatedUser });
});

exports.getMyTour = catchAsync(async (req, res, next) => {
  // 1) find all bookings
  const bookings = await Booking.find({ user: req.user._id });
  // 2) Find tours with the returned ID
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render('overview', {
    title: 'My Booking',
    tours,
  });
});

exports.getAllUsers = (req, res, next) => {
  res.status(200).render('users-manage', { title: 'Manage-Users' });
};
