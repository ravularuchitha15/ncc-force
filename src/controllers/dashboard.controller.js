const Cadet = require('../models/Cadet');
const Attendance = require('../models/Attendance');
const Training = require('../models/Training');
const Camp = require('../models/Camp');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const Performance = require('../models/Performance');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { CADET_STATUS, TRAINING_STATUS, CAMP_STATUS } = require('../config/constants');

/**
 * @desc    Get Officer/Admin Dashboard overview
 * @route   GET /api/dashboard/officer
 * @access  Private (Officer, Admin)
 */
const getOfficerDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Run aggregate queries concurrently for high performance
    const [
      totalCadets,
      activeCadets,
      inactiveCadets,
      recentAttendance,
      upcomingTraining,
      upcomingCamps,
      recentCertificates,
      recentAchievements,
      recentCadets
    ] = await Promise.all([
      Cadet.countDocuments(),
      Cadet.countDocuments({ status: CADET_STATUS.ACTIVE }),
      Cadet.countDocuments({ status: { $ne: CADET_STATUS.ACTIVE } }),
      Attendance.find()
        .populate('cadet', 'cadetId fullName unit')
        .populate('markedBy', 'name')
        .sort({ date: -1, createdAt: -1 })
        .limit(5),
      Training.find({
        date: { $gte: today },
        status: { $in: [TRAINING_STATUS.SCHEDULED, TRAINING_STATUS.ONGOING] }
      })
        .populate('instructor', 'name')
        .sort({ date: 1 })
        .limit(5),
      Camp.find({
        endDate: { $gte: today },
        status: { $in: [CAMP_STATUS.UPCOMING, CAMP_STATUS.ONGOING] }
      })
        .populate('officerInCharge', 'name')
        .sort({ startDate: 1 })
        .limit(5),
      Certificate.find()
        .populate('cadet', 'cadetId fullName')
        .sort({ issueDate: -1, createdAt: -1 })
        .limit(5),
      Achievement.find()
        .populate('cadet', 'cadetId fullName')
        .sort({ date: -1, createdAt: -1 })
        .limit(5),
      Cadet.find()
        .populate('currentRank', 'name level')
        .sort({ updatedAt: -1 })
        .limit(5)
    ]);

    const dashboardData = {
      metrics: {
        totalCadets,
        activeCadets,
        inactiveCadets
      },
      recentAttendance,
      upcomingTraining,
      upcomingCamps,
      recentCertificates,
      recentAchievements,
      recentCadets
    };

    return ApiResponse.success(res, 'Officer dashboard data retrieved', dashboardData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Cadet Personal Dashboard overview
 * @route   GET /api/dashboard/cadet
 * @access  Private (Cadet only)
 */
const getCadetDashboard = async (req, res, next) => {
  try {
    if (!req.user.cadetProfile) {
      return next(ApiError.notFound('No cadet profile linked to your user account'));
    }

    const cadetId = req.user.cadetProfile._id;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [
      cadet,
      attendanceRecords,
      upcomingTraining,
      participatedCamps,
      certificates,
      achievements,
      recentPerformance
    ] = await Promise.all([
      Cadet.findById(cadetId).populate('currentRank'),
      Attendance.find({ cadet: cadetId }).sort({ date: -1 }).limit(10),
      Training.find({
        assignedCadets: cadetId,
        date: { $gte: today }
      })
        .populate('instructor', 'name')
        .sort({ date: 1 })
        .limit(5),
      Camp.find({
        participatingCadets: cadetId
      })
        .populate('officerInCharge', 'name')
        .sort({ startDate: -1 })
        .limit(5),
      Certificate.find({ cadet: cadetId }).sort({ issueDate: -1 }),
      Achievement.find({ cadet: cadetId }).sort({ date: -1 }),
      Performance.find({ cadet: cadetId })
        .populate('assessedBy', 'name role')
        .sort({ assessmentDate: -1 })
        .limit(5)
    ]);

    // Calculate attendance percentage
    const allAttendance = await Attendance.find({ cadet: cadetId });
    const totalSessions = allAttendance.length;
    const presentCount = allAttendance.filter((a) => a.status === 'Present').length;
    const attendancePercentage =
      totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : 0;

    const dashboardData = {
      profile: {
        cadetId: cadet.cadetId,
        fullName: cadet.fullName,
        unit: cadet.unit,
        battalion: cadet.battalion,
        institution: cadet.institution,
        yearSemester: cadet.yearSemester,
        currentRank: cadet.currentRank,
        profilePhoto: cadet.profilePhoto,
        status: cadet.status
      },
      attendanceSummary: {
        totalSessions,
        presentSessions: presentCount,
        attendancePercentage: `${attendancePercentage}%`,
        recentAttendance: attendanceRecords
      },
      upcomingTraining,
      participatedCamps,
      certificates,
      achievements,
      recentPerformance
    };

    return ApiResponse.success(res, 'Cadet dashboard data retrieved', dashboardData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOfficerDashboard,
  getCadetDashboard
};
