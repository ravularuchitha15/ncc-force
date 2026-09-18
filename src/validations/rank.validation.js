const { body, param } = require('express-validator');

const createRankValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Rank name is required'),
  body('level')
    .isInt({ min: 1 })
    .withMessage('Rank level must be an integer >= 1'),
  body('wing')
    .optional()
    .isIn(['Army', 'Navy', 'Air', 'All'])
    .withMessage('Wing must be one of: Army, Navy, Air, All')
];

const promoteCadetValidation = [
  param('cadetId')
    .isMongoId()
    .withMessage('Valid Cadet ObjectId is required in URL parameter'),
  body('newRankId')
    .isMongoId()
    .withMessage('Valid new Rank ObjectId is required'),
  body('reason')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Promotion reason cannot be empty')
];

module.exports = {
  createRankValidation,
  promoteCadetValidation
};
