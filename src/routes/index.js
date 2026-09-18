const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const cadetRoutes = require('./cadet.routes');
const attendanceRoutes = require('./attendance.routes');
const trainingRoutes = require('./training.routes');
const campRoutes = require('./camp.routes');
const rankRoutes = require('./rank.routes');
const certificateRoutes = require('./certificate.routes');
const achievementRoutes = require('./achievement.routes');
const performanceRoutes = require('./performance.routes');
const dashboardRoutes = require('./dashboard.routes');
const unitRoutes = require('./unit.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cadets', cadetRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/training', trainingRoutes);
router.use('/camps', campRoutes);
router.use('/ranks', rankRoutes);
router.use('/certificates', certificateRoutes);
router.use('/achievements', achievementRoutes);
router.use('/performance', performanceRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/units', unitRoutes);

module.exports = router;

