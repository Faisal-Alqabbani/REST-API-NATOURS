// /Users/faisalal-qabbani/mongodb/bin/mongod --dbpath=/Users/faisalal-qabbani/mongodb-data/
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const globalErrorHandler = require('./controller/errorController.js');
const AppError = require('./utils/appError');
const rateLimtit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// 1) Global middleware
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// set security HTTP headers
app.use(helmet());
// Develpment logging in
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// limit request from same API
const limiter = rateLimtit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
// Apply this limiter only to slash API, all the route start with slash api
app.use('/api', limiter);

// Body parser reading data from the body into req.body
// 1) First middleware
app.use(express.json({ limit: '10kb' }));
// express.urlencoded allow us to send data from form to the server
// extended ture that allow us to send complex data
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// Data sanitization againest no SQL query injection
app.use(mongoSanitize());
// Data Sanitizaion againest XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// Get All tours
// app.get('/api/v1/tours', getAllTours);
//  Get only one Tour
// app.get('/api/v1/tours/:id', getTour);
//  app.post('/api/v1/tours', createTour);
// // Update Tour
// app.patch('/api/v1/tours/:id', updateTour);
// // Delete Tour route
// app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
