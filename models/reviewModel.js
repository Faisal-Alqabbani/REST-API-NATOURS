const mongoose = require('mongoose');
const Tour = require('./toursModel');
const reviewScheam = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Tour must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to an user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewScheam.index({ tour: 1, user: 1 }, { unique: true });

reviewScheam.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewScheam.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};
reviewScheam.post('save', function () {
  // This points to current review
  this.constructor.calcAverageRatings(this.tour);
});

reviewScheam.pre(/findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewScheam.post(/findOneAnd/, async function () {
  // await this.findOne(), does not work here, query has already excuted
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', reviewScheam);
module.exports = Review;
