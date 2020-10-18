const AppError = require('./../utils/appError');
// for Cast Error DB
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
// for duplicated err in DB
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field valure: ${value} Please enter another value`;
  return new AppError(message, 400);
};
// for validator Error in DB
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input Data ${errors.join('. ')}`;
  return new AppError(message, 400);
};
// for JsonWebTokenError
const handleJWTError = () =>
  new AppError('Inalid token please log in again!', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //RENDERD WEBSITE

    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });
  }
};
const handleJWTExpired = () =>
  new AppError('Your token has expired! please log in again!', 401);
const sendProduction = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational , trusted error:Send Message to clint
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // B) Programming or other unknown error: don't leak error details
    }
    // 1)log Errro
    //Send genaric message
    console.error('Error', err);
    return res.status(500).json({
      status: 'error',
      message: 'something went very wrong',
    });
  }
  // B) RENDER WEBSITE
  // Operational , trusted error:Send Message to clint
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });

    // Programming or other unknown error: don't leak error details
  }
  // 1)log Errro
  console.error('Error', err);

  //Send genaric message
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();
    console.log(err.message);
    console.log(error.message);
    sendProduction(error, req, res);
  }
};
