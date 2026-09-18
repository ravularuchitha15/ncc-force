const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

router.use(protect);

router.get('/officer', authorize(ROLES.OFFICER, ROLES.ADMIN), dashboardController.getOfficerDashboard);
router.get('/cadet', authorize(ROLES.CADET), dashboardController.getCadetDashboard);

module.exports = router;
