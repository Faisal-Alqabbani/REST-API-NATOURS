// https://documenter.getpostman.com/view/11570321/SztD6oCU?version=latest
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    maxLength: 15,
    minlength: 3,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'please provide your email '],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    lowercase: true,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    trim: true,
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    //this only works on Create and Save
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangeAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpired: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre('save', async function (next) {
  // only run this function if password was acutliy modified
  if (!this.isModified('password')) return next();
  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfilrm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // This point to current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTinmstamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    console.log(changeTimeStamp, JWTTinmstamp);
    return JWTTinmstamp < changeTimeStamp;
  }
  // keep in mind false mean not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const restToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(restToken)
    .digest('hex');
  console.log({ restToken }, this.passwordResetToken);
  this.passwordResetExpired = Date.now() + 10 * 60 * 1000;
  return restToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
