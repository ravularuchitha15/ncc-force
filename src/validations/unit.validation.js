const { body, param } = require('express-validator');

const createUnitValidation = [
  body('unitName')
    .trim()
    .notEmpty()
    .withMessage('Unit name is required'),
  body('battalion')
    .trim()
    .notEmpty()
    .withMessage('Battalion is required'),
  body('directorate')
    .trim()
    .notEmpty()
    .withMessage('Directorate is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('description')
    .optional()
    .trim()
];

const updateUnitValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid unit ID format'),
  body('unitName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Unit name cannot be empty'),
  body('battalion')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Battalion cannot be empty'),
  body('directorate')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Directorate cannot be empty'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty')
];

module.exports = {
  createUnitValidation,
  updateUnitValidation
};
