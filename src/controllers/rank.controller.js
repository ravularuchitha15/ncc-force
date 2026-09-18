const Rank = require('../models/Rank');
const Cadet = require('../models/Cadet');
const RankHistory = require('../models/RankHistory');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

/**
 * @desc    Get all available ranks sorted by level
 * @route   GET /api/ranks
 * @access  Private
 */
const getRanks = async (req, res, next) => {
  try {
    const { wing } = req.query;
    const query = {};
    if (wing) {
      query.$or = [{ wing }, { wing: 'All' }];
    }

    const ranks = await Rank.find(query).sort({ level: 1 });
    return ApiResponse.success(res, 'Ranks retrieved successfully', ranks);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new rank definition
 * @route   POST /api/ranks
 * @access  Private (Officer, Admin)
 */
const createRank = async (req, res, next) => {
  try {
    const { name, abbreviation, level, wing, description, eligibility } = req.body;

    const existing = await Rank.findOne({ name });
    if (existing) {
      return next(ApiError.conflict('A rank with this name already exists'));
    }

    const rank = await Rank.create({
      name,
      abbreviation,
      level,
      wing,
      description,
      eligibility
    });

    return ApiResponse.created(res, 'Rank created successfully', rank);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Promote a cadet to a new rank and track history
 * @route   POST /api/ranks/promote/:cadetId
 * @access  Private (Officer, Admin)
 */
const promoteCadet = async (req, res, next) => {
  try {
    const { cadetId } = req.params;
    const { newRankId, reason } = req.body;

    const cadet = await Cadet.findById(cadetId).populate('currentRank');
    if (!cadet) {
      return next(ApiError.notFound('Cadet not found'));
    }

    const newRank = await Rank.findById(newRankId);
    if (!newRank) {
      return next(ApiError.notFound('New rank not found'));
    }

    const previousRankId = cadet.currentRank ? cadet.currentRank._id : null;

    // Check if new rank is identical
    if (previousRankId && previousRankId.toString() === newRankId.toString()) {
      return next(ApiError.badRequest('Cadet already holds this rank'));
    }

    // Create rank promotion history record
    const historyEntry = await RankHistory.create({
      cadet: cadet._id,
      previousRank: previousRankId,
      newRank: newRank._id,
      promotionDate: new Date(),
      reason: reason || 'Merit and performance advancement',
      approvedBy: req.user._id
    });

    // Update current rank on cadet model
    cadet.currentRank = newRank._id;
    await cadet.save();

    const populatedCadet = await Cadet.findById(cadet._id).populate('currentRank');
    const populatedHistory = await RankHistory.findById(historyEntry._id)
      .populate('previousRank')
      .populate('newRank')
      .populate('approvedBy', 'name role email');

    return ApiResponse.success(res, `Cadet successfully promoted to ${newRank.name}`, {
      cadet: populatedCadet,
      promotionRecord: populatedHistory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get rank promotion history for a cadet
 * @route   GET /api/ranks/history/:cadetId
 * @access  Private
 */
const getCadetRankHistory = async (req, res, next) => {
  try {
    const { cadetId } = req.params;

    // Role check: Cadet can only view own rank history
    if (req.user.role === ROLES.CADET) {
      if (!req.user.cadetProfile || req.user.cadetProfile._id.toString() !== cadetId) {
        return next(ApiError.forbidden('You can only view your own rank history'));
      }
    }

    const history = await RankHistory.find({ cadet: cadetId })
      .populate('previousRank', 'name level abbreviation')
      .populate('newRank', 'name level abbreviation')
      .populate('approvedBy', 'name role')
      .sort({ promotionDate: -1, createdAt: -1 });

    return ApiResponse.success(res, 'Rank promotion history retrieved', history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRanks,
  createRank,
  promoteCadet,
  getCadetRankHistory
};
