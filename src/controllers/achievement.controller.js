const Achievement = require('../models/Achievement');
const Cadet = require('../models/Cadet');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { removeFile, deleteAnyFile, processUploadedFile } = require('../utils/fileHelper');
const { ROLES } = require('../config/constants');

/**
 * @desc    Create a cadet achievement record
 * @route   POST /api/achievements
 * @access  Private (Officer, Admin)
 */
const createAchievement = async (req, res, next) => {
  try {
    const { title, description, category, date, eventName, position, cadet } = req.body;

    const cadetDoc = await Cadet.findById(cadet);
    if (!cadetDoc) {
      if (req.file) removeFile(req.file.path);
      return next(ApiError.notFound('Cadet not found'));
    }

    let documentInfo = { filename: null, path: null, mimeType: null };
    if (req.file) {
      const processed = await processUploadedFile(req.file, 'achievements');
      documentInfo = {
        filename: processed.filename,
        path: processed.path,
        mimeType: processed.mimeType
      };
    }

    const achievement = await Achievement.create({
      title,
      description,
      category,
      date: date || Date.now(),
      eventName,
      position,
      document: documentInfo,
      cadet,
      addedBy: req.user._id
    });

    const populated = await Achievement.findById(achievement._id)
      .populate('cadet', 'cadetId fullName unit')
      .populate('addedBy', 'name role');

    return ApiResponse.created(res, 'Achievement recorded successfully', populated);
  } catch (error) {
    if (req.file) removeFile(req.file.path);
    next(error);
  }
};

/**
 * @desc    Get achievements with filtering and pagination
 * @route   GET /api/achievements
 * @access  Private
 */
const getAchievements = async (req, res, next) => {
  try {
    const { cadet, category, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Cadets can only view their own achievements
    if (req.user.role === ROLES.CADET) {
      if (!req.user.cadetProfile) {
        return ApiResponse.success(res, 'No achievements found', []);
      }
      query.cadet = req.user.cadetProfile._id;
    } else if (cadet) {
      query.cadet = cadet;
    }

    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { eventName: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Achievement.countDocuments(query);
    const achievements = await Achievement.find(query)
      .populate('cadet', 'cadetId fullName unit')
      .populate('addedBy', 'name role')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };

    return ApiResponse.success(res, 'Achievements retrieved', achievements, 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get achievement by ID
 * @route   GET /api/achievements/:id
 * @access  Private
 */
const getAchievementById = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('cadet', 'cadetId fullName unit institution')
      .populate('addedBy', 'name role');

    if (!achievement) {
      return next(ApiError.notFound('Achievement not found'));
    }

    if (req.user.role === ROLES.CADET) {
      if (
        !req.user.cadetProfile ||
        req.user.cadetProfile._id.toString() !== achievement.cadet._id.toString()
      ) {
        return next(ApiError.forbidden('You can only view your own achievements'));
      }
    }

    return ApiResponse.success(res, 'Achievement details retrieved', achievement);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update achievement
 * @route   PUT /api/achievements/:id
 * @access  Private (Officer, Admin)
 */
const updateAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      if (req.file) removeFile(req.file.path);
      return next(ApiError.notFound('Achievement not found'));
    }

    const updateData = { ...req.body };

    if (req.file) {
      if (achievement.document && achievement.document.path) {
        await deleteAnyFile(achievement.document.path);
      }
      const processed = await processUploadedFile(req.file, 'achievements');
      updateData.document = {
        filename: processed.filename,
        path: processed.path,
        mimeType: processed.mimeType
      };
    }

    const updated = await Achievement.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('cadet', 'cadetId fullName');

    return ApiResponse.success(res, 'Achievement updated successfully', updated);
  } catch (error) {
    if (req.file) removeFile(req.file.path);
    next(error);
  }
};

/**
 * @desc    Delete achievement
 * @route   DELETE /api/achievements/:id
 * @access  Private (Officer, Admin)
 */
const deleteAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return next(ApiError.notFound('Achievement not found'));
    }

    if (achievement.document && achievement.document.path) {
      await deleteAnyFile(achievement.document.path);
    }

    await Achievement.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, 'Achievement deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download / view achievement supporting document
 * @route   GET /api/achievements/:id/download
 * @access  Private
 */
const downloadAchievementDocument = async (req, res, next) => {
  try {
    const path = require('path');
    const fs = require('fs');
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return next(ApiError.notFound('Achievement not found'));
    }

    if (req.user.role === ROLES.CADET) {
      if (
        !req.user.cadetProfile ||
        req.user.cadetProfile._id.toString() !== achievement.cadet.toString()
      ) {
        return next(ApiError.forbidden('You are not authorized to download this document'));
      }
    }

    if (!achievement.document || !achievement.document.path) {
      return next(ApiError.notFound('No document attached to this achievement'));
    }

    if (achievement.document.path.startsWith('http://') || achievement.document.path.startsWith('https://')) {
      return res.redirect(achievement.document.path);
    }

    const filePath = path.join(process.cwd(), achievement.document.path);
    if (!fs.existsSync(filePath)) {
      return next(ApiError.notFound('Document file was not found on server'));
    }

    return res.download(filePath, achievement.document.filename);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAchievement,
  getAchievements,
  getAchievementById,
  downloadAchievementDocument,
  updateAchievement,
  deleteAchievement
};
