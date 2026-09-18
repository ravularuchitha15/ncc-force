const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    unitName: {
      type: String,
      required: [true, 'Unit name is required'],
      unique: true,
      trim: true
    },
    battalion: {
      type: String,
      required: [true, 'Battalion is required'],
      trim: true
    },
    directorate: {
      type: String,
      required: [true, 'Directorate is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Unit', unitSchema);
