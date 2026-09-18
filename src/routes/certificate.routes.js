const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../config/constants');
const { createCertificateValidation } = require('../validations/certificate.validation');

router.use(protect);

router
  .route('/')
  .post(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    upload.single('certificate'),
    createCertificateValidation,
    validate,
    certificateController.createCertificate
  )
  .get(certificateController.getCertificates);

router.get('/:id/download', certificateController.downloadCertificate);

router
  .route('/:id')
  .get(certificateController.getCertificateById)
  .put(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    upload.single('certificate'),
    certificateController.updateCertificate
  )
  .delete(authorize(ROLES.OFFICER, ROLES.ADMIN), certificateController.deleteCertificate);

module.exports = router;
