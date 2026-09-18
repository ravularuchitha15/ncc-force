const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const Cadet = require('../models/Cadet');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { removeFile, deleteAnyFile, processUploadedFile } = require('../utils/fileHelper');
const { ROLES } = require('../config/constants');

/**
 * @desc    Upload and create a new certificate
 * @route   POST /api/certificates
 * @access  Private (Officer, Admin)
 */
const createCertificate = async (req, res, next) => {
  try {
    const {
      name,
      certificateType,
      certificateNumber,
      issuingOrg,
      issueDate,
      expiryDate,
      description,
      cadet
    } = req.body;

    if (!req.file) {
      return next(ApiError.badRequest('Please upload the certificate document (PDF, PNG, JPEG)'));
    }

    const cadetDoc = await Cadet.findById(cadet);
    if (!cadetDoc) {
      removeFile(req.file.path);
      return next(ApiError.notFound('Cadet not found'));
    }

    const existingCert = await Certificate.findOne({
      certificateNumber: certificateNumber.trim().toUpperCase()
    });
    if (existingCert) {
      removeFile(req.file.path);
      return next(ApiError.conflict('A certificate with this Certificate Number already exists'));
    }

    const processed = await processUploadedFile(req.file, 'certificates');

    const certRecord = await Certificate.create({
      name,
      certificateType,
      certificateNumber: certificateNumber.trim().toUpperCase(),
      issuingOrg: issuingOrg || 'NCC Directorate / Ministry of Defence',
      issueDate,
      expiryDate: expiryDate || null,
      document: {
        filename: processed.filename,
        path: processed.path,
        originalName: processed.originalName,
        mimeType: processed.mimeType,
        size: processed.size
      },
      description,
      cadet,
      uploadedBy: req.user._id
    });

    const populated = await Certificate.findById(certRecord._id)
      .populate('cadet', 'cadetId fullName unit battalion')
      .populate('uploadedBy', 'name role');

    return ApiResponse.created(res, 'Certificate created and uploaded successfully', populated);
  } catch (error) {
    if (req.file) removeFile(req.file.path);
    next(error);
  }
};

/**
 * @desc    Get all certificates with filtering
 * @route   GET /api/certificates
 * @access  Private
 */
const getCertificates = async (req, res, next) => {
  try {
    const {
      cadet,
      certificateType,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // If cadet, force query to only their own certificates
    if (req.user.role === ROLES.CADET) {
      if (!req.user.cadetProfile) {
        return ApiResponse.success(res, 'No certificates found', []);
      }
      query.cadet = req.user.cadetProfile._id;
    } else if (cadet) {
      query.cadet = cadet;
    }

    if (certificateType) query.certificateType = certificateType;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { certificateNumber: { $regex: search, $options: 'i' } },
        { issuingOrg: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Certificate.countDocuments(query);
    const certs = await Certificate.find(query)
      .populate('cadet', 'cadetId fullName unit')
      .populate('uploadedBy', 'name role')
      .sort({ issueDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const pagination = {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };

    return ApiResponse.success(res, 'Certificates retrieved successfully', certs, 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get certificate by ID
 * @route   GET /api/certificates/:id
 * @access  Private
 */
const getCertificateById = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate('cadet', 'cadetId fullName unit institution')
      .populate('uploadedBy', 'name role');

    if (!cert) {
      return next(ApiError.notFound('Certificate not found'));
    }

    // Role check: Cadet can only view own certificate
    if (req.user.role === ROLES.CADET) {
      if (!req.user.cadetProfile || req.user.cadetProfile._id.toString() !== cert.cadet._id.toString()) {
        return next(ApiError.forbidden('You can only view your own certificates'));
      }
    }

    return ApiResponse.success(res, 'Certificate details retrieved', cert);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download / view certificate file securely
 * @route   GET /api/certificates/:id/download
 * @access  Private
 */
const downloadCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return next(ApiError.notFound('Certificate not found'));
    }

    // Authorization check
    if (req.user.role === ROLES.CADET) {
      if (!req.user.cadetProfile || req.user.cadetProfile._id.toString() !== cert.cadet.toString()) {
        return next(ApiError.forbidden('You are not authorized to download this certificate'));
      }
    }

    if (cert.document.path.startsWith('http://') || cert.document.path.startsWith('https://')) {
      return res.redirect(cert.document.path);
    }

    const filePath = path.join(process.cwd(), cert.document.path);
    if (!fs.existsSync(filePath)) {
      return next(ApiError.notFound('Certificate file was not found on server'));
    }

    return res.download(filePath, cert.document.originalName || `${cert.name}.pdf`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update certificate metadata
 * @route   PUT /api/certificates/:id
 * @access  Private (Officer, Admin)
 */
const updateCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      if (req.file) removeFile(req.file.path);
      return next(ApiError.notFound('Certificate not found'));
    }

    const updateData = { ...req.body };

    // If new file uploaded, remove old file
    if (req.file) {
      if (cert.document && cert.document.path) {
        await deleteAnyFile(cert.document.path);
      }
      const processed = await processUploadedFile(req.file, 'certificates');
      updateData.document = {
        filename: processed.filename,
        path: processed.path,
        originalName: processed.originalName,
        mimeType: processed.mimeType,
        size: processed.size
      };
    }

    const updated = await Certificate.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('cadet', 'cadetId fullName');

    return ApiResponse.success(res, 'Certificate updated successfully', updated);
  } catch (error) {
    if (req.file) removeFile(req.file.path);
    next(error);
  }
};

/**
 * @desc    Delete certificate and document file
 * @route   DELETE /api/certificates/:id
 * @access  Private (Officer, Admin)
 */
const deleteCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return next(ApiError.notFound('Certificate not found'));
    }

    if (cert.document && cert.document.path) {
      await deleteAnyFile(cert.document.path);
    }

    await Certificate.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, 'Certificate deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCertificate,
  getCertificates,
  getCertificateById,
  downloadCertificate,
  updateCertificate,
  deleteCertificate
};
