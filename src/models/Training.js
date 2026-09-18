const mongoose = require('mongoose');
const { TRAINING_TYPES, TRAINING_STATUS } = require('../config/constants');

const trainingSchema = new mongoose.Schema(
  {
    trainingId: {
      type: String,
      required: [true, 'Training ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Training name is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    trainingType: {
      type: String,
      required: [true, 'Training type is required'],
      enum: {
        values: TRAINING_TYPES,
        message: '{VALUE} is not a valid training type'
      },
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Training date is required'],
      index: true
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (e.g. 06:00 AM)']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (e.g. 08:30 AM)']
    },
    location: {
      type: String,
      required: [true, 'Location / Parade ground is required'],
      trim: true
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor/Officer reference is required']
    },
    assignedCadets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cadet'
      }
    ],
    status: {
      type: String,
      enum: {
        values: Object.values(TRAINING_STATUS),
        message: '{VALUE} is not a valid training status'
      },
      default: TRAINING_STATUS.SCHEDULED,
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

// Search index
trainingSchema.index({ name: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Training', trainingSchema);
