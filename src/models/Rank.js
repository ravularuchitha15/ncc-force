const mongoose = require('mongoose');

const rankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Rank name is required'],
      unique: true,
      trim: true
    },
    abbreviation: {
      type: String,
      trim: true,
      default: ''
    },
    level: {
      type: Number,
      required: [true, 'Rank level is required for hierarchical ordering'],
      min: [1, 'Level must be at least 1']
    },
    wing: {
      type: String,
      enum: ['Army', 'Navy', 'Air', 'All'],
      default: 'All'
    },
    description: {
      type: String,
      default: ''
    },
    eligibility: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Rank', rankSchema);
