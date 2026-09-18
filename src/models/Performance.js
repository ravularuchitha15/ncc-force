const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    cadet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cadet',
      required: [true, 'Cadet reference is required'],
      index: true
    },
    assessmentPeriod: {
      type: String,
      required: [true, 'Assessment period is required (e.g. Q1 2026, Annual Evaluation 2025-26)'],
      trim: true
    },
    assessmentDate: {
      type: Date,
      default: Date.now
    },
    paradePerformance: {
      rating: {
        type: String,
        enum: ['Outstanding', 'Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
        default: 'Good'
      },
      remarks: { type: String, trim: true, default: '' }
    },
    discipline: {
      rating: {
        type: String,
        enum: ['Outstanding', 'Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
        default: 'Good'
      },
      remarks: { type: String, trim: true, default: '' }
    },
    trainingPerformance: {
      rating: {
        type: String,
        enum: ['Outstanding', 'Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
        default: 'Good'
      },
      remarks: { type: String, trim: true, default: '' }
    },
    participation: {
      rating: {
        type: String,
        enum: ['Outstanding', 'Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
        default: 'Good'
      },
      remarks: { type: String, trim: true, default: '' }
    },
    leadership: {
      rating: {
        type: String,
        enum: ['Outstanding', 'Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
        default: 'Good'
      },
      remarks: { type: String, trim: true, default: '' }
    },
    physicalTraining: {
      rating: {
        type: String,
        enum: ['Outstanding', 'Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
        default: 'Good'
      },
      remarks: { type: String, trim: true, default: '' }
    },
    overallRemarks: {
      type: String,
      required: [true, 'Overall evaluation remarks are required'],
      trim: true
    },
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assessing officer reference is required']
    }
  },
  {
    timestamps: true
  }
);

performanceSchema.index({ cadet: 1, assessmentPeriod: 1 });

module.exports = mongoose.model('Performance', performanceSchema);
