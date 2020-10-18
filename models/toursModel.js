const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const vaildator = require('vaidator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      reqiured: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have less or equal than 40 characters'],
      minlength: [10, 'A tour must have more or equal than 10 characters'],
      // validate:[vaildator.isAlpha, 'Tour name must be only contain character ']
    },
    slug: String,
    duration: {
      type: Number,
      reqiured: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      reqiuerd: [true, 'A tour must have a group size'],
      // Enum only work with string
      enum: {
        values: ['easy', 'medium', 'difficult'],
        messsage: 'Difficuly is either: easy, medium, difficuly ',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // min and max can also work with date
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(10 * val) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must hvae a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to current doc one New doucment creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below rgouler price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summaty'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      reqiuerd: [true, 'A tour must have a cover image '],
    },
    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      defult: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: [String],
        description: [String],
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// Document Middleware: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', function (next) {
//   console.log('Wil save Document');
//   next();
// });
tourSchema.post('save', function (doc, next) {
  next();
});
// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next)
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} Milliseconds`);

  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);

//   next();
// });

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
