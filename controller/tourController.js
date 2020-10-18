const Tour = require('./../models/toursModel');
// const APIFeatuers = require('./../utils/APIfeaturs');
const AppError = require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    //400 bad request
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
// upload.single('name') req.file
// upload.Array('images',5) req.files
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  // imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  // req.body.imageCover = imageCoverFilename;

  // images in loop
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = (req.body.imageCover = `tour-${
        req.params.id
      }-${Date.now()}-${index + 1}.jpeg`);
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// 2) ROUTE HANDLERS

// Create Tour Function

// exports.createTour = catchAsync(async (req, res) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });
exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getTour = factory.getOne(Tour, 'reviews');
exports.alisTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage';
  req.query.feilds = 'name,difficulty,ratingsAverage,summary,price';
  next();
};

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // Bild Query
//   // 1A)Filtering
//   // const queryObj = { ...req.query };
//   // const excludeFeild = ['page', 'sort', 'limit', 'feilds'];
//   // excludeFeild.forEach((el) => delete queryObj[el]);

//   // // 1B)Advanced Filtering
//   // // { difficulty: 'easy', duration: { $gte: '5' } }
//   // // { difficulty: 'easy', duration: { gte: '5' } }
//   // // gte,gt,lte ,lt, eq
//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//   // let query = Tour.find(JSON.parse(queryStr));
//   // console.log(JSON.parse(queryStr));

//   //2) Sorting
//   // if (req.query.sort) {
//   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   console.log(sortBy);
//   //   query = query.sort(sortBy);
//   //   //localhost:3000/api/v1/tours?sort=-price,-ratingsAverage
//   //   // query = query.sort(req.query.sort);
//   //   // Sort price ratingsAvrage
//   // } else {
//   //   query = query.sort('-createdAt');
//   // }
//   // if (req.query.feilds) {
//   //   //localhost:3000/api/v1/tours?feilds=-name,-duration maens include evrey thing exapt name and dutaion
//   //   //localhost:3000/api/v1/tours?feilds=name,duration body include only the name and the duation
//   //   const feilds = req.query.feilds.split(',').join(' ');
//   //   query = query.select(feilds);
//   //   // query = feilds.select('name price something anything')
//   // } else {
//   //   // Display all feilds exaprt __v. exculde this feild
//   //   query = query.select('-__v');
//   // }
//   // Pagination
//   // const page = req.query.page * 1 || 1;
//   // const limit = req.query.limit * 1 || 100;
//   // const skip = (page - 1) * limit;
//   // query = query.skip(skip).limit(limit);
//   // // page=3&limit=10, 1-10 , 11,20 21,30 page 3
//   // if (req.query.page) {
//   //   const numTour = await query.countDocuments();
//   //   if (skip >= numTour) throw Error('Page not dose not exists ');
//   // }

//   // Execute quary
//   const featurs = new APIFeatuers(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await featurs.query;
//   res.status(200).json({
//     status: 'success',
//     length: tours.length,
//     data: {
//       tours,
//     },
//   });
//   // query.sort().select().skip().limit()

//   // another way to query into DB
//   // const tours = await Tour.find()
//   //   .where('duration')
//   //   .equals(5)
//   //   .where('difficulty')
//   //   .equals('easy');
//   // { difficulty: 'easy', duration: { gte: '5' } }
//   // SEND RESPONSE
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   const id = req.params.id;
//   const tour = await Tour.findById(id).populate({
//     path: 'reviews',
//   });
//   if (!tour) {
//     return next(new AppError('Not tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tours: tour,
//     },
//   });
//   // const tour = tours.find((el) => el.id === id);
//   // if (id > tours.length)
//   // res.status(200).json({
//   //   status: 'success',
//   //   data: {
//   //     tours: tour,
//   //   },
//   // });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('Not tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('Not tour found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
exports.getTourStats = async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: '$$ratingsAverage',
        // _id: '$price',
        _id: { $toUpper: '$difficulty' },
        numOfTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        numRatings: { $sum: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalPrice: { $sum: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
};

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

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
        numToursStarts: { $sum: 1 },
        Tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      // Give each of the fields name a zero or one
      $project: {
        // now the ID no longer shows up
        _id: 0,
      },
    },
    {
      $sort: { numToursStarts: 1 },
    },
    {
      // the limit of output
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
// '/tour-within/:distance/center/:latling/unit/:unit'
// '/tour-within/:distance/center/33.991999, -118.472705/unit/:unit'

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(
      new AppError(
        'Pleses provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Pleses provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});

// const newId = tours[tours.length - 1].id + 1;
// console.log(newId);
// const newTour = Object.assign({ id: newId }, req.body);
// tours.push(newTour);
// fs.writeFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   (errro) => {

//   }
// );

// middle ware
// exports.checkID = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invaild ID',
//     });
//   }
//   next();
// };
