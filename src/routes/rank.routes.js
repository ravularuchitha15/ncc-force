const express = require('express');
const router = express.Router();
const rankController = require('../controllers/rank.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../config/constants');
const {
  createRankValidation,
  promoteCadetValidation
} = require('../validations/rank.validation');

router.use(protect);

router
  .route('/')
  .get(rankController.getRanks)
  .post(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    createRankValidation,
    validate,
    rankController.createRank
  );

router.post(
  '/promote/:cadetId',
  authorize(ROLES.OFFICER, ROLES.ADMIN),
  promoteCadetValidation,
  validate,
  rankController.promoteCadet
);

router.get('/history/:cadetId', rankController.getCadetRankHistory);

module.exports = router;
