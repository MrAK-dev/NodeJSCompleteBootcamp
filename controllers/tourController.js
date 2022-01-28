const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (request, response, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), request.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  response.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
  // try {
  //   // EXECUTE QUERY
  //   const features = new APIFeatures(Tour.find(), request.query)
  //     .filter()
  //     .sort()
  //     .limitFields()
  //     .paginate();
  //   const tours = await features.query;

  //   // SEND RESPONSE
  //   response.status(200).json({
  //     status: 'success',
  //     results: tours.length,
  //     data: {
  //       tours,
  //     },
  //   });
  // } catch (err) {
  //   response.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

exports.getTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findById(request.params.id);
  // Tour.findOne({ _id: request.params.id })

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  response.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (request, response, next) => {
  const newTour = await Tour.create(request.body);

  response.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
  // try {
  //   // const newTour = new Tour({});
  //   // newTour.save();
  // } catch (err) {
  //   response.status(400).json({
  //     status: 'fail',
  //     message: { name: err.name, errmsg: err.message, ...err },
  //   });
  // }
});

exports.updateTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  response.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findByIdAndDelete(request.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  response.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (request, response, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  response.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (request, response, next) => {
  const year = parseInt(request.params.year, 10); // 2022

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  response.status(200).json({
    status: 'success',
    data: plan,
  });
});
