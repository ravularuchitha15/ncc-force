const { body } = require('express-validator');
const { CERTIFICATE_TYPES } = require('../config/constants');

const createCertificateValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Certificate name is required'),
  body('certificateType')
    .notEmpty()
    .isIn(CERTIFICATE_TYPES)
    .withMessage(`Certificate type must be one of: ${CERTIFICATE_TYPES.join(', ')}`),
  body('certificateNumber')
    .trim()
    .notEmpty()
    .withMessage('Certificate number is required'),
  body('cadet')
    .isMongoId()
    .withMessage('Valid Cadet ObjectId is required'),
  body('issueDate')
    .notEmpty()
    .isISO8601()
    .withMessage('Issue date must be a valid date (YYYY-MM-DD)'),
  body('expiryDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Expiry date must be a valid date (YYYY-MM-DD)')
];

module.exports = {
  createCertificateValidation
};
