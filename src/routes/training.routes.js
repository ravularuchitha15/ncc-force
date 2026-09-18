const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/training.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../config/constants');
const { createTrainingValidation } = require('../validations/training.validation');

router.use(protect);

router.get('/my-trainings', authorize(ROLES.CADET), trainingController.getMyTrainings);

router
  .route('/')
  .post(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    createTrainingValidation,
    validate,
    trainingController.createTraining
  )
  .get(trainingController.getTrainings);

router
  .route('/:id')
  .get(trainingController.getTrainingById)
  .put(authorize(ROLES.OFFICER, ROLES.ADMIN), trainingController.updateTraining)
  .delete(authorize(ROLES.OFFICER, ROLES.ADMIN), trainingController.deleteTraining);

router.post('/:id/assign', authorize(ROLES.OFFICER, ROLES.ADMIN), trainingController.assignCadets);
router.delete(
  '/:id/cadets/:cadetId',
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  trainingController.removeCadetFromTraining
);

module.exports = router;
