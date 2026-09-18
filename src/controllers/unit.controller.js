const Unit = require('../models/Unit');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all units with optional search & filtering
 * @route   GET /api/units
 * @access  Private
 */
const getUnits = async (req, res, next) => {
  try {
    const { search, battalion, directorate } = req.query;
    const query = {};

    if (battalion) {
      query.battalion = { $regex: battalion, $options: 'i' };
    }
    if (directorate) {
      query.directorate = { $regex: directorate, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { unitName: { $regex: search, $options: 'i' } },
        { battalion: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const units = await Unit.find(query).sort({ unitName: 1 });
    return ApiResponse.success(res, 'Units retrieved successfully', units);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single unit by ID
 * @route   GET /api/units/:id
 * @access  Private
 */
const getUnitById = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return next(ApiError.notFound('Unit not found'));
    }
    return ApiResponse.success(res, 'Unit retrieved successfully', unit);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new NCC Unit
 * @route   POST /api/units
 * @access  Private (Officer, Admin)
 */
const createUnit = async (req, res, next) => {
  try {
    const { unitName, battalion, directorate, location, description } = req.body;

    const existing = await Unit.findOne({ unitName: unitName.trim() });
    if (existing) {
      return next(ApiError.conflict('A unit with this name already exists'));
    }

    const unit = await Unit.create({
      unitName: unitName.trim(),
      battalion: battalion.trim(),
      directorate: directorate.trim(),
      location: location.trim(),
      description: description ? description.trim() : ''
    });

    return ApiResponse.created(res, 'Unit created successfully', unit);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an NCC Unit
 * @route   PUT /api/units/:id
 * @access  Private (Officer, Admin)
 */
const updateUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!unit) {
      return next(ApiError.notFound('Unit not found'));
    }

    return ApiResponse.success(res, 'Unit updated successfully', unit);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an NCC Unit
 * @route   DELETE /api/units/:id
 * @access  Private (Admin)
 */
const deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) {
      return next(ApiError.notFound('Unit not found'));
    }
    return ApiResponse.success(res, 'Unit deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit
};
