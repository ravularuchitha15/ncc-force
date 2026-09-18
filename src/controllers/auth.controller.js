const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Cadet = require('../models/Cadet');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');
const { auth, isFirebaseReady } = require('../config/firebase');

/**
 * Generate signed JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'super_secret_ncc_management_jwt_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public (or Admin for staff)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, cadetId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(ApiError.conflict('An account with this email address already exists'));
    }

    // Determine target role (default cadet)
    let assignedRole = role || ROLES.CADET;

    // If caller is registering an admin or officer, ensure caller is authenticated admin
    if ([ROLES.ADMIN, ROLES.OFFICER].includes(assignedRole)) {
      if (!req.user || req.user.role !== ROLES.ADMIN) {
        // If system has no admin yet, allow first user to be admin
        const totalUsers = await User.countDocuments();
        if (totalUsers > 0 && assignedRole === ROLES.ADMIN) {
          return next(ApiError.forbidden('Only an existing administrator can create admin accounts'));
        }
      }
    }

    // If registering as a cadet and cadetId is provided, link with cadet profile
    let cadetProfileId = null;
    if (assignedRole === ROLES.CADET && cadetId) {
      const cadet = await Cadet.findOne({ cadetId: cadetId.toUpperCase() });
      if (cadet) {
        cadetProfileId = cadet._id;
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      cadetProfile: cadetProfileId
    });

    // If linked to cadet, update cadet's user reference
    if (cadetProfileId) {
      await Cadet.findByIdAndUpdate(cadetProfileId, { user: user._id });
    }

    const token = generateToken(user);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cadetProfile: user.cadetProfile,
      createdAt: user.createdAt
    };

    return ApiResponse.created(res, 'User registered successfully', {
      user: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const identifier = (email || '').trim();

    console.log(`[Auth] Incoming login request for identifier: "${identifier}"`);

    if (!identifier || !password) {
      return next(ApiError.badRequest('Please provide both email/cadet ID and password'));
    }

    // 1. Find user by email (case-insensitive)
    let user = await User.findOne({
      email: { $regex: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, 'i') }
    }).select('+password').populate({
      path: 'cadetProfile',
      populate: { path: 'currentRank' }
    });

    // 2. If not found by email, check if identifier is a Cadet ID (e.g. NCC/2025/KA/SD/1001)
    if (!user) {
      const cadet = await Cadet.findOne({
        cadetId: { $regex: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (cadet && cadet.user) {
        user = await User.findById(cadet.user).select('+password').populate({
          path: 'cadetProfile',
          populate: { path: 'currentRank' }
        });
      }
    }

    if (!user) {
      console.warn(`[Auth] User not found for: "${identifier}"`);
      return next(
        ApiError.unauthorized(
          'Invalid email or password. For demo testing, use cadet.rahul@ncc.gov.in or officer.sharma@ncc.gov.in (password: Password@123).'
        )
      );
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('Your account has been deactivated. Please contact an officer or administrator.'));
    }

    const cleanPassword = (password || '').trim();
    let isMatch = await user.matchPassword(cleanPassword);

    // In development mode, allow common demo password variants and case-insensitivity
    if (!isMatch && process.env.NODE_ENV !== 'production') {
      const demoVariants = [
        'password@123',
        'password123',
        'password',
        'demo123',
        '123456',
        'admin123',
        'admin@123'
      ];
      if (
        demoVariants.includes(cleanPassword.toLowerCase()) ||
        cleanPassword.toLowerCase() === 'password@123'
      ) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      console.warn(`[Auth] Password mismatch for user: "${user.email}"`);
      return next(
        ApiError.unauthorized(
          'Invalid email or password. For demo testing, use cadet.rahul@ncc.gov.in or officer.sharma@ncc.gov.in (password: Password@123).'
        )
      );
    }

    console.log(`[Auth] Successful login for: "${user.email}" (${user.role})`);
    const token = generateToken(user);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cadetProfile: user.cadetProfile,
      createdAt: user.createdAt
    };

    return ApiResponse.success(res, 'Logged in successfully', {
      user: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  return ApiResponse.success(res, 'Logged out successfully');
};

/**
 * @desc    Get currently logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cadetProfile',
      populate: { path: 'currentRank' }
    });

    return ApiResponse.success(res, 'Current user profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request password reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(ApiError.notFound('No user found with this email address'));
    }

    // Generate unhashed reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and save to user
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set 1-hour expiration
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    return ApiResponse.success(
      res,
      'Password reset token generated. In a production environment with SMTP, this will be emailed.',
      { resetToken }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using reset token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const resetToken = req.params.token;
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(ApiError.badRequest('Invalid or expired password reset token'));
    }

    user.password = req.body.password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    const token = generateToken(user);

    return ApiResponse.success(res, 'Password has been reset successfully', {
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password (authenticated)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(ApiError.badRequest('Current password is incorrect'));
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user);

    return ApiResponse.success(res, 'Password changed successfully', { token });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate with Firebase ID token (Google Sign-In / Mobile / Web)
 * @route   POST /api/auth/firebase-login
 * @access  Public
 */
const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken, fcmToken } = req.body;

    if (!isFirebaseReady() || !auth) {
      return next(
        ApiError.internal(
          'Firebase is not configured on this server. Please provide Firebase credentials in .env or serviceAccountKey.json'
        )
      );
    }

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (tokenErr) {
      if (tokenErr.code === 'auth/id-token-expired') {
        return next(ApiError.unauthorized('Firebase ID token has expired'));
      }
      return next(ApiError.unauthorized(`Invalid Firebase ID token: ${tokenErr.message}`));
    }

    const { uid, email, name, picture } = decodedToken;

    // Look for existing user by firebaseUid or email
    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, ...(email ? [{ email: email.toLowerCase() }] : [])]
    }).populate({
      path: 'cadetProfile',
      populate: { path: 'currentRank' }
    });

    if (user) {
      if (!user.isActive) {
        return next(
          ApiError.forbidden('Your account has been deactivated. Please contact an officer or administrator.')
        );
      }

      let modified = false;
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        modified = true;
      }
      if (fcmToken && !user.fcmTokens.includes(fcmToken)) {
        user.fcmTokens.push(fcmToken);
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // Auto-provision user account for Firebase authenticated user
      let cadetProfileId = null;
      if (email) {
        const cadet = await Cadet.findOne({ email: email.toLowerCase() });
        if (cadet) {
          cadetProfileId = cadet._id;
        }
      }

      const randomPassword = crypto.randomBytes(32).toString('hex');
      const displayName = name || (email ? email.split('@')[0] : 'Cadet');

      user = await User.create({
        name: displayName,
        email: email ? email.toLowerCase() : `${uid}@firebase.user`,
        password: randomPassword,
        role: ROLES.CADET,
        firebaseUid: uid,
        cadetProfile: cadetProfileId,
        fcmTokens: fcmToken ? [fcmToken] : []
      });

      if (cadetProfileId) {
        await Cadet.findByIdAndUpdate(cadetProfileId, { user: user._id });
        user = await User.findById(user._id).populate({
          path: 'cadetProfile',
          populate: { path: 'currentRank' }
        });
      }
    }

    const token = generateToken(user);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cadetProfile: user.cadetProfile,
      firebaseUid: user.firebaseUid,
      createdAt: user.createdAt
    };

    return ApiResponse.success(res, 'Logged in with Firebase successfully', {
      user: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  firebaseLogin
};

