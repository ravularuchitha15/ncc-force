const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

/**
 * @desc    Get all users with filtering and pagination
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, search, isActive, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (typeof isActive !== 'undefined') query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('cadetProfile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };

    return ApiResponse.success(res, 'Users retrieved successfully', users, 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin only)
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('cadetProfile');
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }
    return ApiResponse.success(res, 'User retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create an NCC Officer account
 * @route   POST /api/users/officer
 * @access  Private (Admin only)
 */
const createOfficer = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(ApiError.conflict('User with this email already exists'));
    }

    const officer = await User.create({
      name,
      email,
      password,
      role: ROLES.OFFICER
    });

    const officerData = {
      _id: officer._id,
      name: officer.name,
      email: officer.email,
      role: officer.role,
      createdAt: officer.createdAt
    };

    return ApiResponse.created(res, 'NCC Officer account created successfully', officerData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role & permissions
 * @route   PUT /api/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!Object.values(ROLES).includes(role)) {
      return next(ApiError.badRequest(`Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    return ApiResponse.success(res, `User role updated to ${role}`, user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/users/:id/status
 * @access  Private (Admin only)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    // Prevent admin from deactivating self
    if (user._id.toString() === req.user._id.toString()) {
      return next(ApiError.badRequest('You cannot deactivate your own account'));
    }

    user.isActive = !user.isActive;
    await user.save();

    return ApiResponse.success(
      res,
      `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    if (user._id.toString() === req.user._id.toString()) {
      return next(ApiError.badRequest('You cannot delete your own account'));
    }

    await User.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createOfficer,
  updateUserRole,
  toggleUserStatus,
  deleteUser
};
