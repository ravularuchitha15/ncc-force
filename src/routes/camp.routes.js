const express = require('express');
const router = express.Router();
const campController = require('../controllers/camp.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../config/constants');
const { createCampValidation } = require('../validations/camp.validation');

router.use(protect);

router.get('/my-camps', authorize(ROLES.CADET), campController.getMyCamps);

router
  .route('/')
  .post(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    createCampValidation,
    validate,
    campController.createCamp
  )
  .get(campController.getCamps);

router
  .route('/:id')
  .get(campController.getCampById)
  .put(authorize(ROLES.OFFICER, ROLES.ADMIN), campController.updateCamp)
  .delete(authorize(ROLES.OFFICER, ROLES.ADMIN), campController.deleteCamp);

router.post(
  '/:id/register-cadets',
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  campController.registerCadets
);

router.delete(
  '/:id/cadets/:cadetId',
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  campController.removeCadetFromCamp
);

module.exports = router;
