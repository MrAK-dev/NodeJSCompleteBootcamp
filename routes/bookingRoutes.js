const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(authController.protect, bookingController.getAllBooking)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(authController.protect, bookingController.deleteBooking);
module.exports = router;
