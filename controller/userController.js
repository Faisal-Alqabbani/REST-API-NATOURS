const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
// I used cb here because this not coming from express
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-id-timestamp
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
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
// resize UserPhoto
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.uploadUserPhoto = upload.single('photo');
const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find({});
//   res.status(200).json({
//     status: 'success',
//     length: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.createUser = factory.createOne(User);
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  // 1) Create Error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. please use /updateMyPassword',
        400
      )
    );
  }
  // 2) Filter out unwanted fields names that not allowed to be updated
  const filteredBody = filterObject(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) update user document.
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
// Don't up date password with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
