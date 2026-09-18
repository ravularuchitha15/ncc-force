const Cadet = require('../models/Cadet');
const User = require('../models/User');
const Rank = require('../models/Rank');
const RankHistory = require('../models/RankHistory');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { removeFile, deleteAnyFile, processUploadedFile } = require('../utils/fileHelper');
const { ROLES, CADET_STATUS } = require('../config/constants');

const safeJsonParse = (val, fallback = {}) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
};

/**
 * @desc    Create a new cadet profile
 * @route   POST /api/cadets
 * @access  Private (Officer, Admin)
 */
const createCadet = async (req, res, next) => {
  try {
    const {
      cadetId,
      fullName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      institution,
      unit,
      battalion,
      enrollmentDate,
      yearSemester,
      bloodGroup,
      address,
      emergencyContact,
      currentRank,
      status
    } = req.body;

    // Check duplicate cadetId or email
    const existingCadet = await Cadet.findOne({
      $or: [{ cadetId: cadetId.toUpperCase() }, { email: email.toLowerCase() }]
    });
    if (existingCadet) {
      if (req.file) removeFile(req.file.path);
      return next(ApiError.conflict('A cadet with this Cadet ID or Email already exists'));
    }

    // Resolve initial rank (default to lowest level rank e.g. "Cadet" if not supplied)
    let rankId = currentRank;
    if (!rankId) {
      const defaultRank = await Rank.findOne().sort({ level: 1 });
      if (defaultRank) {
        rankId = defaultRank._id;
      }
    }

    let profilePhotoPath = null;
    if (req.file) {
      const processed = await processUploadedFile(req.file, 'profiles');
      profilePhotoPath = processed.path;
    }

    const cadet = await Cadet.create({
      cadetId: cadetId.toUpperCase(),
      fullName,
      email: email.toLowerCase(),
      phoneNumber,
      dateOfBirth,
      gender,
      institution,
      unit,
      battalion,
      enrollmentDate: enrollmentDate || Date.now(),
      yearSemester,
      bloodGroup,
      address: safeJsonParse(address),
      emergencyContact: safeJsonParse(emergencyContact),
      currentRank: rankId,
      profilePhoto: profilePhotoPath,
      status: status || CADET_STATUS.ACTIVE
    });

    // If an initial rank was assigned, log rank history entry
    if (rankId) {
      await RankHistory.create({
        cadet: cadet._id,
        previousRank: null,
        newRank: rankId,
        reason: 'Initial enrollment rank',
        approvedBy: req.user._id
      });
    }

    // If a user with this email already exists, link the cadet
    const linkedUser = await User.findOne({ email: email.toLowerCase() });
    if (linkedUser) {
      cadet.user = linkedUser._id;
      await cadet.save();
      linkedUser.cadetProfile = cadet._id;
      await linkedUser.save();
    }

    const populatedCadet = await Cadet.findById(cadet._id).populate('currentRank');

    return ApiResponse.created(res, 'Cadet profile created successfully', populatedCadet);
  } catch (error) {
    if (req.file) removeFile(req.file.path);
    next(error);
  }
};

/**
 * @desc    Get all cadets with multi-field search, filtering, and pagination
 * @route   GET /api/cadets
 * @access  Private (Officer, Admin)
 */
const getCadets = async (req, res, next) => {
  try {
    const {
      search,
      cadetId,
      unit,
      battalion,
      rank,
      yearSemester,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (cadetId) query.cadetId = { $regex: cadetId, $options: 'i' };
    if (unit) query.unit = { $regex: unit, $options: 'i' };
    if (battalion) query.battalion = { $regex: battalion, $options: 'i' };
    if (rank) query.currentRank = rank;
    if (yearSemester) query.yearSemester = { $regex: yearSemester, $options: 'i' };
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { cadetId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { institution: { $regex: search, $options: 'i' } },
        { unit: { $regex: search, $options: 'i' } },
        { battalion: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Cadet.countDocuments(query);
    const cadets = await Cadet.find(query)
      .populate('currentRank')
      .populate('user', 'name email role isActive')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };

    return ApiResponse.success(res, 'Cadets retrieved successfully', cadets, 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get cadet profile by ID
 * @route   GET /api/cadets/:id
 * @access  Private
 */
const getCadetById = async (req, res, next) => {
  try {
    const cadet = await Cadet.findById(req.params.id)
      .populate('currentRank')
      .populate('user', 'name email role isActive');

    if (!cadet) {
      return next(ApiError.notFound('Cadet not found'));
    }

    // Role check: Cadet can only view own profile
    if (
      req.user.role === ROLES.CADET &&
      (!req.user.cadetProfile || req.user.cadetProfile._id.toString() !== cadet._id.toString())
    ) {
      return next(ApiError.forbidden('You can only view your own cadet profile'));
    }

    return ApiResponse.success(res, 'Cadet details retrieved', cadet);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in cadet's own profile
 * @route   GET /api/cadets/me/profile
 * @access  Private (Cadet only)
 */
const getMyCadetProfile = async (req, res, next) => {
  try {
    if (!req.user.cadetProfile) {
      return next(ApiError.notFound('No cadet profile linked with this user account'));
    }

    const cadet = await Cadet.findById(req.user.cadetProfile)
      .populate('currentRank')
      .populate('user', 'name email role');

    if (!cadet) {
      return next(ApiError.notFound('Cadet profile not found'));
    }

    return ApiResponse.success(res, 'Own cadet profile retrieved', cadet);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cadet profile (Full update for Officers/Admins)
 * @route   PUT /api/cadets/:id
 * @access  Private (Officer, Admin)
 */
const updateCadet = async (req, res, next) => {
  try {
    const cadet = await Cadet.findById(req.params.id);
    if (!cadet) {
      if (req.file) removeFile(req.file.path);
      return next(ApiError.notFound('Cadet not found'));
    }

    const updateData = { ...req.body };

    // Handle profile photo update
    if (req.file) {
      if (cadet.profilePhoto) await deleteAnyFile(cadet.profilePhoto);
      const processed = await processUploadedFile(req.file, 'profiles');
      updateData.profilePhoto = processed.path;
    }

    if (updateData.address !== undefined) {
      updateData.address = safeJsonParse(updateData.address);
    }
    if (updateData.emergencyContact !== undefined) {
      updateData.emergencyContact = safeJsonParse(updateData.emergencyContact);
    }

    // Do not allow direct rank update here (must use promotion endpoint to maintain rank history)
    delete updateData.currentRank;

    const updatedCadet = await Cadet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('currentRank');

    return ApiResponse.success(res, 'Cadet updated successfully', updatedCadet);
  } catch (error) {
    if (req.file) removeFile(req.file.path);
    next(error);
  }
};

/**
 * @desc    Cadet self-update permitted personal details
 * @route   PATCH /api/cadets/me/update
 * @access  Private (Cadet only)
 */
const updateMyCadetProfile = async (req, res, next) => {
  try {
    if (!req.user.cadetProfile) {
      if (req.file) removeFile(req.file.path);
      return next(ApiError.notFound('No cadet profile linked to your user account'));
    }

    const cadet = await Cadet.findById(req.user.cadetProfile);
    if (!cadet) {
      if (req.file) removeFile(req.file.path);
      return next(ApiError.notFound('Cadet profile not found'));
    }

    const { phoneNumber, address, emergencyContact } = req.body;
    if (phoneNumber) cadet.phoneNumber = phoneNumber;

    if (address !== undefined) {
      cadet.address = safeJsonParse(address);
    }

    if (emergencyContact !== undefined) {
      cadet.emergencyContact = safeJsonParse(emergencyContact);
    }

    if (req.file) {
      if (cadet.profilePhoto) await deleteAnyFile(cadet.profilePhoto);
      const processed = await processUploadedFile(req.file, 'profiles');
      cadet.profilePhoto = processed.path;
    }

    await cadet.save();
    const populated = await Cadet.findById(cadet._id).populate('currentRank');

    return ApiResponse.success(res, 'Personal profile updated successfully', populated);
  } catch (error) {
    if (req.file) removeFile(req.file.path);
    next(error);
  }
};

/**
 * @desc    Delete or deactivate a cadet
 * @route   DELETE /api/cadets/:id
 * @access  Private (Officer, Admin)
 */
const deleteCadet = async (req, res, next) => {
  try {
    const { hardDelete } = req.query;
    const cadet = await Cadet.findById(req.params.id);

    if (!cadet) {
      return next(ApiError.notFound('Cadet not found'));
    }

    if (hardDelete === 'true') {
      if (cadet.profilePhoto) await deleteAnyFile(cadet.profilePhoto);
      await Cadet.findByIdAndDelete(req.params.id);
      return ApiResponse.success(res, 'Cadet permanently deleted');
    }

    // Soft deactivate by default
    cadet.status = CADET_STATUS.INACTIVE;
    await cadet.save();

    return ApiResponse.success(res, 'Cadet status changed to Inactive', cadet);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCadet,
  getCadets,
  getCadetById,
  getMyCadetProfile,
  updateCadet,
  updateMyCadetProfile,
  deleteCadet
};
