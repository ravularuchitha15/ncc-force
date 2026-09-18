const mongoose = require('mongoose');
const { ACHIEVEMENT_CATEGORIES } = require('../config/constants');

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ACHIEVEMENT_CATEGORIES,
        message: '{VALUE} is not a valid achievement category'
      },
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Achievement date is required'],
      default: Date.now
    },
    eventName: {
      type: String,
      required: [true, 'Event or competition name is required'],
      trim: true
    },
    position: {
      type: String,
      required: [true, 'Position or award level is required (e.g. 1st Place, Gold Medal)'],
      trim: true
    },
    document: {
      filename: { type: String, default: null },
      path: { type: String, default: null },
      mimeType: { type: String, default: null }
    },
    cadet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cadet',
      required: [true, 'Cadet reference is required'],
      index: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Added by officer reference is required']
    }
  },
  {
    timestamps: true
  }
);

achievementSchema.index({ title: 'text', eventName: 'text', position: 'text' });

module.exports = mongoose.model('Achievement', achievementSchema);
