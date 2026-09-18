const mongoose = require('mongoose');
const { CAMP_STATUS } = require('../config/constants');

const campSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Camp name is required'],
      trim: true,
      index: true
    },
    campType: {
      type: String,
      required: [true, 'Camp type is required (e.g. ATC, CATC, RDC, TSC, NIC, Trekking)'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Camp start date is required'],
      index: true
    },
    endDate: {
      type: Date,
      required: [true, 'Camp end date is required'],
      validate: {
        validator: function (val) {
          return !this.startDate || val >= this.startDate;
        },
        message: 'End date must be on or after start date'
      }
    },
    officerInCharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Officer in charge is required']
    },
    participatingCadets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cadet'
      }
    ],
    status: {
      type: String,
      enum: {
        values: Object.values(CAMP_STATUS),
        message: '{VALUE} is not a valid camp status'
      },
      default: CAMP_STATUS.UPCOMING,
      index: true
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

campSchema.index({ name: 'text', location: 'text', campType: 'text' });

module.exports = mongoose.model('Camp', campSchema);
