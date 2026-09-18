const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../config/constants');
const {
  markAttendanceValidation,
  bulkAttendanceValidation
} = require('../validations/attendance.validation');

router.use(protect);

router
  .route('/')
  .post(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    markAttendanceValidation,
    validate,
    attendanceController.markAttendance
  )
  .get(authorize(ROLES.OFFICER, ROLES.ADMIN), attendanceController.getAttendance);

router.post(
  '/bulk',
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  bulkAttendanceValidation,
  validate,
  attendanceController.markBulkAttendance
);

router.get('/cadet/:cadetId', attendanceController.getCadetAttendance);

router
  .route('/:id')
  .get(attendanceController.getCadetAttendance)
  .put(authorize(ROLES.OFFICER, ROLES.ADMIN), attendanceController.updateAttendance)
  .delete(authorize(ROLES.OFFICER, ROLES.ADMIN), attendanceController.deleteAttendance);

module.exports = router;
