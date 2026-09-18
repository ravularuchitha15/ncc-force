const { body } = require('express-validator');
const { CAMP_STATUS } = require('../config/constants');

const createCampValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Camp name is required'),
  body('campType')
    .trim()
    .notEmpty()
    .withMessage('Camp type is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('startDate')
    .notEmpty()
    .isISO8601()
    .withMessage('Start date must be in ISO8601 format (YYYY-MM-DD)'),
  body('endDate')
    .notEmpty()
    .isISO8601()
    .withMessage('End date must be in ISO8601 format (YYYY-MM-DD)'),
  body('status')
    .optional()
    .isIn(Object.values(CAMP_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CAMP_STATUS).join(', ')}`)
];

module.exports = {
  createCampValidation
};
