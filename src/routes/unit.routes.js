const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unit.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../config/constants');
const {
  createUnitValidation,
  updateUnitValidation
} = require('../validations/unit.validation');

router.use(protect);

router
  .route('/')
  .get(unitController.getUnits)
  .post(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    createUnitValidation,
    validate,
    unitController.createUnit
  );

router
  .route('/:id')
  .get(unitController.getUnitById)
  .put(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    updateUnitValidation,
    validate,
    unitController.updateUnit
  )
  .delete(authorize(ROLES.ADMIN), unitController.deleteUnit);

module.exports = router;
