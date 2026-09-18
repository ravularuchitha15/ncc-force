const express = require('express');
const router = express.Router();
const cadetController = require('../controllers/cadet.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../config/constants');
const {
  createCadetValidation,
  updateCadetValidation,
  cadetSelfUpdateValidation
} = require('../validations/cadet.validation');

router.use(protect);

// Cadet self-service routes
router.get('/me/profile', authorize(ROLES.CADET), cadetController.getMyCadetProfile);
router.patch(
  '/me/update',
  authorize(ROLES.CADET),
  upload.single('profilePhoto'),
  cadetSelfUpdateValidation,
  validate,
  cadetController.updateMyCadetProfile
);

// Officer/Admin collection routes
router
  .route('/')
  .post(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    upload.single('profilePhoto'),
    createCadetValidation,
    validate,
    cadetController.createCadet
  )
  .get(authorize(ROLES.OFFICER, ROLES.ADMIN), cadetController.getCadets);

// Individual cadet operations
router
  .route('/:id')
  .get(cadetController.getCadetById)
  .put(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    upload.single('profilePhoto'),
    updateCadetValidation,
    validate,
    cadetController.updateCadet
  )
  .delete(authorize(ROLES.OFFICER, ROLES.ADMIN), cadetController.deleteCadet);

module.exports = router;
