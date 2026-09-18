const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// All user management routes require Admin privileges
router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.route('/')
  .get(userController.getUsers);

router.post('/officer', userController.createOfficer);

router.route('/:id')
  .get(userController.getUserById)
  .delete(userController.deleteUser);

router.put('/:id/role', userController.updateUserRole);
router.patch('/:id/status', userController.toggleUserStatus);

module.exports = router;
