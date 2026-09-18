const { body } = require('express-validator');

const createPerformanceValidation = [
  body('cadet')
    .isMongoId()
    .withMessage('Valid Cadet ObjectId is required'),
  body('assessmentPeriod')
    .trim()
    .notEmpty()
    .withMessage('Assessment period is required (e.g. Q1 2026, Annual Evaluation)'),
  body('overallRemarks')
    .trim()
    .notEmpty()
    .withMessage('Overall evaluation remarks are required')
];

module.exports = {
  createPerformanceValidation
};
