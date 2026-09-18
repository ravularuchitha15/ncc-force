const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performance.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../config/constants');
const { createPerformanceValidation } = require('../validations/performance.validation');

router.use(protect);

router
  .route('/')
  .post(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    createPerformanceValidation,
    validate,
    performanceController.createPerformance
  )
  .get(performanceController.getPerformanceRecords);

router
  .route('/:id')
  .get(performanceController.getPerformanceById)
  .put(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    performanceController.updatePerformance
  )
  .delete(authorize(ROLES.OFFICER, ROLES.ADMIN), performanceController.deletePerformance);

module.exports = router;
