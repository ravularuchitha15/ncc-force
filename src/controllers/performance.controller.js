const Performance = require('../models/Performance');
const Cadet = require('../models/Cadet');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

/**
 * @desc    Record official performance assessment
 * @route   POST /api/performance
 * @access  Private (Officer, Admin)
 */
const createPerformance = async (req, res, next) => {
  try {
    const {
      cadet,
      assessmentPeriod,
      assessmentDate,
      paradePerformance,
      discipline,
      trainingPerformance,
      participation,
      leadership,
      physicalTraining,
      overallRemarks
    } = req.body;

    const cadetDoc = await Cadet.findById(cadet);
    if (!cadetDoc) {
      return next(ApiError.notFound('Cadet not found'));
    }

    const performance = await Performance.create({
      cadet,
      assessmentPeriod,
      assessmentDate: assessmentDate || Date.now(),
      paradePerformance,
      discipline,
      trainingPerformance,
      participation,
      leadership,
      physicalTraining,
      overallRemarks,
      assessedBy: req.user._id
    });

    const populated = await Performance.findById(performance._id)
      .populate('cadet', 'cadetId fullName unit battalion currentRank')
      .populate('assessedBy', 'name role');

    return ApiResponse.created(res, 'Performance evaluation recorded', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get performance records with filtering
 * @route   GET /api/performance
 * @access  Private
 */
const getPerformanceRecords = async (req, res, next) => {
  try {
    const { cadet, assessmentPeriod, page = 1, limit = 10 } = req.query;

    const query = {};

    if (req.user.role === ROLES.CADET) {
      if (!req.user.cadetProfile) {
        return ApiResponse.success(res, 'No performance records found', []);
      }
      query.cadet = req.user.cadetProfile._id;
    } else if (cadet) {
      query.cadet = cadet;
    }

    if (assessmentPeriod) {
      query.assessmentPeriod = { $regex: assessmentPeriod, $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Performance.countDocuments(query);
    const records = await Performance.find(query)
      .populate('cadet', 'cadetId fullName unit battalion currentRank')
      .populate('assessedBy', 'name role')
      .sort({ assessmentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };

    return ApiResponse.success(res, 'Performance evaluations retrieved', records, 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single performance evaluation by ID
 * @route   GET /api/performance/:id
 * @access  Private
 */
const getPerformanceById = async (req, res, next) => {
  try {
    const record = await Performance.findById(req.params.id)
      .populate('cadet', 'cadetId fullName unit institution currentRank')
      .populate('assessedBy', 'name role');

    if (!record) {
      return next(ApiError.notFound('Performance record not found'));
    }

    if (req.user.role === ROLES.CADET) {
      if (
        !req.user.cadetProfile ||
        req.user.cadetProfile._id.toString() !== record.cadet._id.toString()
      ) {
        return next(ApiError.forbidden('You can only view your own performance evaluations'));
      }
    }

    return ApiResponse.success(res, 'Performance record details retrieved', record);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update performance evaluation
 * @route   PUT /api/performance/:id
 * @access  Private (Officer, Admin)
 */
const updatePerformance = async (req, res, next) => {
  try {
    const updated = await Performance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('cadet', 'cadetId fullName')
      .populate('assessedBy', 'name role');

    if (!updated) {
      return next(ApiError.notFound('Performance record not found'));
    }

    return ApiResponse.success(res, 'Performance record updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete performance record
 * @route   DELETE /api/performance/:id
 * @access  Private (Officer, Admin)
 */
const deletePerformance = async (req, res, next) => {
  try {
    const record = await Performance.findByIdAndDelete(req.params.id);
    if (!record) {
      return next(ApiError.notFound('Performance record not found'));
    }
    return ApiResponse.success(res, 'Performance record deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPerformance,
  getPerformanceRecords,
  getPerformanceById,
  updatePerformance,
  deletePerformance
};
