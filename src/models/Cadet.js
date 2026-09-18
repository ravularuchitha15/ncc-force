const mongoose = require('mongoose');
const { CADET_STATUS, BLOOD_GROUPS, GENDERS } = require('../config/constants');

const cadetSchema = new mongoose.Schema(
  {
    cadetId: {
      type: String,
      required: [true, 'Cadet ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: GENDERS,
        message: '{VALUE} is not a valid gender'
      }
    },
    institution: {
      type: String,
      required: [true, 'College / Institution name is required'],
      trim: true
    },
    unit: {
      type: String,
      required: [true, 'NCC Unit is required'],
      trim: true,
      index: true
    },
    battalion: {
      type: String,
      required: [true, 'Battalion is required'],
      trim: true,
      index: true
    },
    enrollmentDate: {
      type: Date,
      required: [true, 'Enrollment date is required'],
      default: Date.now
    },
    yearSemester: {
      type: String,
      required: [true, 'Year / Semester is required (e.g. 1st Year / Sem 2)'],
      trim: true
    },
    bloodGroup: {
      type: String,
      enum: {
        values: BLOOD_GROUPS,
        message: '{VALUE} is not a valid blood group'
      },
      default: null
    },
    address: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' }
    },
    emergencyContact: {
      name: { type: String, trim: true, default: '' },
      relation: { type: String, trim: true, default: '' },
      phoneNumber: { type: String, trim: true, default: '' }
    },
    currentRank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rank',
      default: null
    },
    profilePhoto: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: Object.values(CADET_STATUS),
        message: '{VALUE} is not a valid cadet status'
      },
      default: CADET_STATUS.ACTIVE,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient searching
cadetSchema.index({ fullName: 'text', cadetId: 'text', email: 'text' });

module.exports = mongoose.model('Cadet', cadetSchema);
