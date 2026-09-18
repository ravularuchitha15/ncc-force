const fs = require('fs');
const path = require('path');

/**
 * Safely removes a file from disk if it exists
 * @param {string} relativeOrAbsolutePath
 */
const removeFile = (filePath) => {
  if (!filePath) return;
  try {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error.message);
  }
};

/**
 * Ensures upload folders exist
 */
const ensureUploadDirs = () => {
  const dirs = [
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'uploads', 'profiles'),
    path.join(process.cwd(), 'uploads', 'certificates'),
    path.join(process.cwd(), 'uploads', 'achievements')
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

/**
 * Deletes a file either from local disk or from Firebase Cloud Storage
 * @param {string} filePathOrUrl
 */
const deleteAnyFile = async (filePathOrUrl) => {
  if (!filePathOrUrl) return;
  if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
    try {
      const { deleteFromFirebase } = require('../services/firebaseStorage.service');
      await deleteFromFirebase(filePathOrUrl);
    } catch (_) {}
  } else {
    removeFile(filePathOrUrl);
  }
};

/**
 * Handles uploaded file storage based on STORAGE_DRIVER (local or firebase)
 * @param {Object} file - Multer file object
 * @param {string} subfolder - Target folder (e.g. 'profiles', 'certificates', 'achievements')
 */
const processUploadedFile = async (file, subfolder = 'uploads') => {
  if (!file) return null;
  if (process.env.STORAGE_DRIVER === 'firebase') {
    try {
      const { isFirebaseReady } = require('../config/firebase');
      const { uploadToFirebase } = require('../services/firebaseStorage.service');
      if (isFirebaseReady()) {
        const uploaded = await uploadToFirebase(file, subfolder);
        removeFile(file.path);
        return {
          path: uploaded.url,
          filename: uploaded.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          isFirebase: true
        };
      }
    } catch (err) {
      console.warn(`[Storage] Firebase upload failed, using local storage: ${err.message}`);
    }
  }

  return {
    path: `uploads/${subfolder}/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    isFirebase: false
  };
};

module.exports = {
  removeFile,
  ensureUploadDirs,
  deleteAnyFile,
  processUploadedFile
};
