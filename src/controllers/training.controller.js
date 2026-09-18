const Training = require('../models/Training');
const Cadet = require('../models/Cadet');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

/**
 * @desc    Create a new training session
 * @route   POST /api/training
 * @access  Private (Officer, Admin)
 */
const createTraining = async (req, res, next) => {
  try {
    const {
      trainingId,
      name,
      description,
      trainingType,
      date,
      startTime,
      endTime,
      location,
      assignedCadets,
      status,
      remarks
    } = req.body;

    const existing = await Training.findOne({ trainingId: trainingId.toUpperCase() });
    if (existing) {
      return next(ApiError.conflict('A training session with this Training ID already exists'));
    }

    const training = await Training.create({
      trainingId: trainingId.toUpperCase(),
      name,
      description,
      trainingType,
      date,
      startTime,
      endTime,
      location,
      instructor: req.user._id,
      assignedCadets: assignedCadets || [],
      status,
      remarks
    });

    const populated = await Training.findById(training._id)
      .populate('instructor', 'name email role')
      .populate('assignedCadets', 'cadetId fullName unit');

    return ApiResponse.created(res, 'Training session created successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all training sessions with filters
 * @route   GET /api/training
 * @access  Private
 */
const getTrainings = async (req, res, next) => {
  try {
    const {
      trainingType,
      status,
      location,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (trainingType) query.trainingType = trainingType;
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: 'i' };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { trainingId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Training.countDocuments(query);
    const trainings = await Training.find(query)
      .populate('instructor', 'name email')
      .populate('assignedCadets', 'cadetId fullName unit')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    const pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };

    return ApiResponse.success(res, 'Training sessions retrieved', trainings, 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single training session by ID
 * @route   GET /api/training/:id
 * @access  Private
 */
const getTrainingById = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('instructor', 'name email role')
      .populate('assignedCadets', 'cadetId fullName unit institution currentRank');

    if (!training) {
      return next(ApiError.notFound('Training session not found'));
    }

    return ApiResponse.success(res, 'Training details retrieved', training);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get training sessions assigned to current cadet
 * @route   GET /api/training/my-trainings
 * @access  Private (Cadet only)
 */
const getMyTrainings = async (req, res, next) => {
  try {
    if (!req.user.cadetProfile) {
      return next(ApiError.notFound('No cadet profile linked to this user'));
    }

    const trainings = await Training.find({
      assignedCadets: req.user.cadetProfile._id
    })
      .populate('instructor', 'name email')
      .sort({ date: -1 });

    return ApiResponse.success(res, 'Assigned training sessions retrieved', trainings);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update training session
 * @route   PUT /api/training/:id
 * @access  Private (Officer, Admin)
 */
const updateTraining = async (req, res, next) => {
  try {
    const training = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('instructor', 'name email')
      .populate('assignedCadets', 'cadetId fullName');

    if (!training) {
      return next(ApiError.notFound('Training session not found'));
    }

    return ApiResponse.success(res, 'Training session updated successfully', training);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign cadets to training
 * @route   POST /api/training/:id/assign
 * @access  Private (Officer, Admin)
 */
const assignCadets = async (req, res, next) => {
  try {
    const { cadetIds } = req.body; // Array of Cadet ObjectIds
    if (!Array.isArray(cadetIds) || cadetIds.length === 0) {
      return next(ApiError.badRequest('cadetIds must be a non-empty array'));
    }

    const training = await Training.findById(req.params.id);
    if (!training) {
      return next(ApiError.notFound('Training session not found'));
    }

    // Add without duplicates
    cadetIds.forEach((id) => {
      if (!training.assignedCadets.some((c) => c.toString() === id.toString())) {
        training.assignedCadets.push(id);
      }
    });

    await training.save();
    const populated = await Training.findById(training._id).populate(
      'assignedCadets',
      'cadetId fullName unit'
    );

    return ApiResponse.success(res, 'Cadets assigned to training successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a cadet from training session
 * @route   DELETE /api/training/:id/cadets/:cadetId
 * @access  Private (Officer, Admin)
 */
const removeCadetFromTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return next(ApiError.notFound('Training session not found'));
    }

    training.assignedCadets = training.assignedCadets.filter(
      (c) => c.toString() !== req.params.cadetId
    );

    await training.save();
    return ApiResponse.success(res, 'Cadet removed from training session', training);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete training session
 * @route   DELETE /api/training/:id
 * @access  Private (Officer, Admin)
 */
const deleteTraining = async (req, res, next) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) {
      return next(ApiError.notFound('Training session not found'));
    }
    return ApiResponse.success(res, 'Training session deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTraining,
  getTrainings,
  getTrainingById,
  getMyTrainings,
  updateTraining,
  assignCadets,
  removeCadetFromTraining,
  deleteTraining
};
