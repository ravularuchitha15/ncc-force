const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/apiError');

// Ensure base upload directories exist
const uploadBase = path.join(process.cwd(), 'uploads');
['profiles', 'certificates', 'achievements'].forEach((sub) => {
  const dir = path.join(uploadBase, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'profiles';
    if (file.fieldname === 'certificate' || req.baseUrl.includes('certificates')) {
      subfolder = 'certificates';
    } else if (file.fieldname === 'achievement' || req.baseUrl.includes('achievements')) {
      subfolder = 'achievements';
    }
    cb(null, path.join(uploadBase, subfolder));
  },
  filename: (req, file, cb) => {
    // Generate safe, collision-free filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  }
});

// File filter to restrict dangerous file types
const fileFilter = (req, file, cb) => {
  const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedDocMimes = ['application/pdf', 'image/jpeg', 'image/png'];

  if (file.fieldname === 'profilePhoto' || file.fieldname === 'photo') {
    if (allowedImageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(ApiError.badRequest('Only image files (JPEG, PNG, WEBP) are allowed for profile photos'), false);
    }
  } else {
    // Certificates and achievements can be PDF or Image
    if (allowedDocMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(ApiError.badRequest('Only PDF and Image files (JPEG, PNG) are allowed for documents'), false);
    }
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024; // 5MB

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize
  },
  fileFilter
});

module.exports = upload;
