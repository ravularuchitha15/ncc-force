const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievement.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { ROLES } = require('../config/constants');
const { createAchievementValidation } = require('../validations/achievement.validation');

router.use(protect);

router
  .route('/')
  .post(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    upload.single('document'),
    createAchievementValidation,
    validate,
    achievementController.createAchievement
  )
  .get(achievementController.getAchievements);

router
  .route('/:id')
  .get(achievementController.getAchievementById)
  .put(
    authorize(ROLES.OFFICER, ROLES.ADMIN),
    upload.single('document'),
    achievementController.updateAchievement
  )
  .delete(authorize(ROLES.OFFICER, ROLES.ADMIN), achievementController.deleteAchievement);

module.exports = router;
