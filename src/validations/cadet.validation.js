const { body, param, query } = require('express-validator');
const { CADET_STATUS, BLOOD_GROUPS, GENDERS } = require('../config/constants');

const createCadetValidation = [
  body('cadetId')
    .trim()
    .notEmpty()
    .withMessage('Cadet ID is required'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Date of birth must be a valid date format (YYYY-MM-DD)'),
  body('gender')
    .notEmpty()
    .isIn(GENDERS)
    .withMessage(`Gender must be one of: ${GENDERS.join(', ')}`),
  body('institution')
    .trim()
    .notEmpty()
    .withMessage('Institution is required'),
  body('unit')
    .trim()
    .notEmpty()
    .withMessage('NCC Unit is required'),
  body('battalion')
    .trim()
    .notEmpty()
    .withMessage('Battalion is required'),
  body('yearSemester')
    .trim()
    .notEmpty()
    .withMessage('Year/Semester is required'),
  body('bloodGroup')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(BLOOD_GROUPS)
    .withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(', ')}`),
  body('status')
    .optional()
    .isIn(Object.values(CADET_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CADET_STATUS).join(', ')}`)
];

const updateCadetValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid cadet ID format in URL parameter'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('gender')
    .optional()
    .isIn(GENDERS)
    .withMessage(`Gender must be one of: ${GENDERS.join(', ')}`),
  body('bloodGroup')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(BLOOD_GROUPS)
    .withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(', ')}`),
  body('status')
    .optional()
    .isIn(Object.values(CADET_STATUS))
    .withMessage(`Status must be one of: ${Object.values(CADET_STATUS).join(', ')}`)
];

const cadetSelfUpdateValidation = [
  body('phoneNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty if provided'),
  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),
  body('emergencyContact')
    .optional()
    .isObject()
    .withMessage('Emergency contact must be an object')
];

module.exports = {
  createCadetValidation,
  updateCadetValidation,
  cadetSelfUpdateValidation
};
