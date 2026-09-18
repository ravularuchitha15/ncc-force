const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../config/constants');

const attendanceSchema = new mongoose.Schema(
  {
    cadet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cadet',
      required: [true, 'Cadet reference is required'],
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true
    },
    sessionName: {
      type: String,
      required: [true, 'Session or parade name is required'],
      trim: true,
      index: true
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: Object.values(ATTENDANCE_STATUS),
        message: '{VALUE} is not a valid attendance status'
      },
      default: ATTENDANCE_STATUS.PRESENT,
      index: true
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Officer reference is required']
    }
  },
  {
    timestamps: true
  }
);

// Normalize date to midnight UTC to prevent subtle timestamp mismatch in unique constraint
attendanceSchema.pre('save', function () {
  if (this.date) {
    const d = new Date(this.date);
    d.setUTCHours(0, 0, 0, 0);
    this.date = d;
  }
});

// Compound unique index to prevent duplicate attendance records for the same cadet, date, and session
attendanceSchema.index({ cadet: 1, date: 1, sessionName: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
