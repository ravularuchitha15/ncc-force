const { body, param } = require('express-validator');
const { ATTENDANCE_STATUS } = require('../config/constants');

const markAttendanceValidation = [
  body('cadet')
    .isMongoId()
    .withMessage('Valid Cadet ID (MongoDB ObjectId) is required'),
  body('date')
    .notEmpty()
    .withMessage('Attendance date is required')
    .isISO8601()
    .withMessage('Date must be in valid ISO8601 format (YYYY-MM-DD)'),
  body('sessionName')
    .trim()
    .notEmpty()
    .withMessage('Session name is required'),
  body('status')
    .notEmpty()
    .isIn(Object.values(ATTENDANCE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(ATTENDANCE_STATUS).join(', ')}`),
  body('remarks')
    .optional()
    .trim()
];

const bulkAttendanceValidation = [
  body('date')
    .notEmpty()
    .withMessage('Attendance date is required')
    .isISO8601()
    .withMessage('Date must be in valid ISO8601 format (YYYY-MM-DD)'),
  body('sessionName')
    .trim()
    .notEmpty()
    .withMessage('Session name is required'),
  body('records')
    .isArray({ min: 1 })
    .withMessage('Records must be a non-empty array of cadet attendance entries'),
  body('records.*.cadet')
    .isMongoId()
    .withMessage('Each record must contain a valid cadet ObjectId'),
  body('records.*.status')
    .isIn(Object.values(ATTENDANCE_STATUS))
    .withMessage(`Each status must be one of: ${Object.values(ATTENDANCE_STATUS).join(', ')}`)
];

module.exports = {
  markAttendanceValidation,
  bulkAttendanceValidation
};
