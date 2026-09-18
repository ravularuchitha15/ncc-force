const Camp = require('../models/Camp');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

/**
 * @desc    Create a new NCC Camp
 * @route   POST /api/camps
 * @access  Private (Officer, Admin)
 */
const createCamp = async (req, res, next) => {
  try {
    const {
      name,
      campType,
      description,
      location,
      startDate,
      endDate,
      participatingCadets,
      status,
      remarks
    } = req.body;

    const camp = await Camp.create({
      name,
      campType,
      description,
      location,
      startDate,
      endDate,
      officerInCharge: req.user._id,
      participatingCadets: participatingCadets || [],
      status,
      remarks
    });

    const populated = await Camp.findById(camp._id)
      .populate('officerInCharge', 'name email role')
      .populate('participatingCadets', 'cadetId fullName unit');

    return ApiResponse.created(res, 'Camp created successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all camps with filtering and pagination
 * @route   GET /api/camps
 * @access  Private
 */
const getCamps = async (req, res, next) => {
  try {
    const {
      campType,
      status,
      location,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (campType) query.campType = { $regex: campType, $options: 'i' };
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: 'i' };

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { campType: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Camp.countDocuments(query);
    const camps = await Camp.find(query)
      .populate('officerInCharge', 'name email')
      .populate('participatingCadets', 'cadetId fullName unit')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limitNum);

    const pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };

    return ApiResponse.success(res, 'Camps retrieved successfully', camps, 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single camp details
 * @route   GET /api/camps/:id
 * @access  Private
 */
const getCampById = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id)
      .populate('officerInCharge', 'name email role')
      .populate('participatingCadets', 'cadetId fullName unit institution currentRank');

    if (!camp) {
      return next(ApiError.notFound('Camp not found'));
    }

    return ApiResponse.success(res, 'Camp details retrieved', camp);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get camps in which the logged-in cadet is registered
 * @route   GET /api/camps/my-camps
 * @access  Private (Cadet only)
 */
const getMyCamps = async (req, res, next) => {
  try {
    if (!req.user.cadetProfile) {
      return next(ApiError.notFound('No cadet profile linked to this user'));
    }

    const camps = await Camp.find({
      participatingCadets: req.user.cadetProfile._id
    })
      .populate('officerInCharge', 'name email')
      .sort({ startDate: -1 });

    return ApiResponse.success(res, 'Registered camps retrieved', camps);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update camp details
 * @route   PUT /api/camps/:id
 * @access  Private (Officer, Admin)
 */
const updateCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('officerInCharge', 'name email')
      .populate('participatingCadets', 'cadetId fullName');

    if (!camp) {
      return next(ApiError.notFound('Camp not found'));
    }

    return ApiResponse.success(res, 'Camp updated successfully', camp);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register / assign cadets to camp
 * @route   POST /api/camps/:id/register-cadets
 * @access  Private (Officer, Admin)
 */
const registerCadets = async (req, res, next) => {
  try {
    const { cadetIds } = req.body;
    if (!Array.isArray(cadetIds) || cadetIds.length === 0) {
      return next(ApiError.badRequest('cadetIds must be an array of Cadet ObjectIds'));
    }

    const camp = await Camp.findById(req.params.id);
    if (!camp) {
      return next(ApiError.notFound('Camp not found'));
    }

    cadetIds.forEach((id) => {
      if (!camp.participatingCadets.some((c) => c.toString() === id.toString())) {
        camp.participatingCadets.push(id);
      }
    });

    await camp.save();
    const populated = await Camp.findById(camp._id).populate(
      'participatingCadets',
      'cadetId fullName unit'
    );

    return ApiResponse.success(res, 'Cadets registered to camp successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a cadet from camp roster
 * @route   DELETE /api/camps/:id/cadets/:cadetId
 * @access  Private (Officer, Admin)
 */
const removeCadetFromCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) {
      return next(ApiError.notFound('Camp not found'));
    }

    camp.participatingCadets = camp.participatingCadets.filter(
      (c) => c.toString() !== req.params.cadetId
    );

    await camp.save();
    return ApiResponse.success(res, 'Cadet removed from camp roster', camp);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a camp
 * @route   DELETE /api/camps/:id
 * @access  Private (Officer, Admin)
 */
const deleteCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findByIdAndDelete(req.params.id);
    if (!camp) {
      return next(ApiError.notFound('Camp not found'));
    }
    return ApiResponse.success(res, 'Camp deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCamp,
  getCamps,
  getCampById,
  getMyCamps,
  updateCamp,
  registerCadets,
  removeCadetFromCamp,
  deleteCamp
};
