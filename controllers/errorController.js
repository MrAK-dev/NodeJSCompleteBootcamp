const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value} Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError(`Invalid token. Please sign in again!`, 401);

const handleJWTExpireError = () =>
  new AppError('Your token has expired! Please sign in again.', 401);

const sendErrorDev = (error, request, response) => {
  // A) API
  if (request.originalUrl.startsWith('/api')) {
    return response.status(error.statusCode).json({
      status: error.status,
      error,
      message: error.message,
      stack: error.stack,
    });
  }
  // B) RENDERED WEBSITE
  console.error('ERROR', error);

  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: error.message,
  });
};

const sendErrorProd = (error, request, response) => {
  // A) API
  if (request.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (error.isOperational) {
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    //  B) Programming or other unknown error: don`t leak error details
    // 1) Log error
    console.error('ERROR', error);
    // 2) Send generic message
    return response.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (error.isOperational) {
    console.log(error);
    return response.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    });
  }
  // B) Programming or other unknown error: don`t leak error details
  // 1) Log error
  console.error('ERROR', error);
  // 2) Send generic message
  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later',
  });
};

module.exports = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, request, response);
  } else if (process.env.NODE_ENV === 'production') {
    let err = Object.create(error);
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpireError();
    sendErrorProd(err, request, response);
  }
};
