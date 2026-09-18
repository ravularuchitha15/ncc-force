const { body, param } = require('express-validator');
const { TRAINING_TYPES, TRAINING_STATUS } = require('../config/constants');

const createTrainingValidation = [
  body('trainingId')
    .trim()
    .notEmpty()
    .withMessage('Training ID is required'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Training name is required'),
  body('trainingType')
    .notEmpty()
    .isIn(TRAINING_TYPES)
    .withMessage(`Training type must be one of: ${TRAINING_TYPES.join(', ')}`),
  body('date')
    .notEmpty()
    .isISO8601()
    .withMessage('Date must be a valid format (YYYY-MM-DD)'),
  body('startTime')
    .trim()
    .notEmpty()
    .withMessage('Start time is required'),
  body('endTime')
    .trim()
    .notEmpty()
    .withMessage('End time is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('assignedCadets')
    .optional()
    .isArray()
    .withMessage('Assigned cadets must be an array of Cadet ObjectIds'),
  body('status')
    .optional()
    .isIn(Object.values(TRAINING_STATUS))
    .withMessage(`Status must be one of: ${Object.values(TRAINING_STATUS).join(', ')}`)
];

module.exports = {
  createTrainingValidation
};
