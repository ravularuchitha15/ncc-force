const { body } = require('express-validator');
const { ACHIEVEMENT_CATEGORIES } = require('../config/constants');

const createAchievementValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Achievement title is required'),
  body('category')
    .notEmpty()
    .isIn(ACHIEVEMENT_CATEGORIES)
    .withMessage(`Category must be one of: ${ACHIEVEMENT_CATEGORIES.join(', ')}`),
  body('eventName')
    .trim()
    .notEmpty()
    .withMessage('Event name is required'),
  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position / award is required'),
  body('cadet')
    .isMongoId()
    .withMessage('Valid Cadet ObjectId is required'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in ISO8601 format (YYYY-MM-DD)')
];

module.exports = {
  createAchievementValidation
};
