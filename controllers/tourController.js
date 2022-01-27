const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (request, response) => {
  try {
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
  } catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (request, response) => {
  try {
    const tour = await Tour.findById(request.params.id);
    // Tour.findOne({ _id: request.params.id })
    response.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    response.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (request, response) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();
    const newTour = await Tour.create(request.body);

    response.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    response.status(400).json({
      status: 'fail',
      message: { name: err.name, errmsg: err.message, ...err },
    });
  }
};

exports.updateTour = async (request, response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });
    response.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    response.status(400).json({
      status: 'fail',
      message: { name: err.name, errmsg: err.message, ...err },
    });
  }
};

exports.deleteTour = async (request, response) => {
  try {
    await Tour.findByIdAndDelete(request.params.id);
    response.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    response.status(400).json({
      status: 'fail',
      message: { name: err.name, errmsg: err.message, ...err },
    });
  }
};

exports.getTourStats = async (request, response) => {
  try {
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
  } catch (err) {
    response.status(400).json({
      status: 'fail',
      message: { name: err.name, errmsg: err.message, ...err },
    });
  }
};

exports.getMonthlyPlan = async (request, response) => {
  try {
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
  } catch (err) {
    response.status(404).json({
      status: 'fail',
      message: { name: err.name, errmsg: err.message, ...err },
    });
  }
};
