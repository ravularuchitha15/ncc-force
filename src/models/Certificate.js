const mongoose = require('mongoose');
const { CERTIFICATE_TYPES } = require('../config/constants');

const certificateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Certificate name is required'],
      trim: true,
      index: true
    },
    certificateType: {
      type: String,
      required: [true, 'Certificate type is required'],
      enum: {
        values: CERTIFICATE_TYPES,
        message: '{VALUE} is not a valid certificate type'
      },
      index: true
    },
    certificateNumber: {
      type: String,
      required: [true, 'Certificate number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    issuingOrg: {
      type: String,
      required: [true, 'Issuing organization is required'],
      trim: true,
      default: 'NCC Directorate / Ministry of Defence'
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required']
    },
    expiryDate: {
      type: Date,
      default: null
    },
    document: {
      filename: { type: String, required: true },
      path: { type: String, required: true },
      originalName: { type: String, default: '' },
      mimeType: { type: String, default: 'application/pdf' },
      size: { type: Number, default: 0 }
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    cadet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cadet',
      required: [true, 'Cadet reference is required'],
      index: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploaded by officer reference is required']
    }
  },
  {
    timestamps: true
  }
);

certificateSchema.index({ name: 'text', certificateNumber: 'text', issuingOrg: 'text' });

module.exports = mongoose.model('Certificate', certificateSchema);
