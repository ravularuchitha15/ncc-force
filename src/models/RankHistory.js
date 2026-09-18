const mongoose = require('mongoose');

const rankHistorySchema = new mongoose.Schema(
  {
    cadet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cadet',
      required: [true, 'Cadet reference is required'],
      index: true
    },
    previousRank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rank',
      default: null
    },
    newRank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rank',
      required: [true, 'New rank is required']
    },
    promotionDate: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      trim: true,
      default: 'Merit and performance promotion'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Approving officer reference is required']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RankHistory', rankHistorySchema);
