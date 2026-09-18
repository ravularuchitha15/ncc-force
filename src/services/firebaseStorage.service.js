const path = require('path');
const fs = require('fs');
const { bucket, isFirebaseReady } = require('../config/firebase');
const ApiError = require('../utils/apiError');

/**
 * Upload a file to Firebase Cloud Storage
 * @param {Object} file - Express Multer file object (supports file.path or file.buffer)
 * @param {String} subfolder - Subfolder in bucket (e.g., 'profiles', 'certificates', 'achievements')
 * @returns {Promise<{ url: string, storagePath: string, filename: string }>}
 */
const uploadToFirebase = async (file, subfolder = 'uploads') => {
  if (!isFirebaseReady() || !bucket) {
    throw ApiError.internal('Firebase Storage is not initialized or storage bucket is not configured');
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.originalname).toLowerCase();
  const sanitizedBase = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const filename = `${sanitizedBase}-${uniqueSuffix}${ext}`;
  const storagePath = `${subfolder}/${filename}`;

  const blob = bucket.file(storagePath);

  const options = {
    metadata: {
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString()
      }
    }
  };

  if (file.buffer) {
    // In-memory upload
    await blob.save(file.buffer, options);
  } else if (file.path) {
    // Disk file streaming
    await new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(blob.createWriteStream(options))
        .on('error', reject)
        .on('finish', resolve);
    });
  } else {
    throw ApiError.badRequest('No valid file buffer or file path provided for upload');
  }

  // Attempt to make public; if bucket-level uniform access prevents it, provide download/signed URL
  let publicUrl = '';
  try {
    await blob.makePublic();
    publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
  } catch (err) {
    // Fallback: Generate long-lived v4 signed URL (10 years)
    try {
      const [signedUrl] = await blob.getSignedUrl({
        action: 'read',
        expires: '03-01-2036'
      });
      publicUrl = signedUrl;
    } catch (_) {
      publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    }
  }

  return {
    url: publicUrl,
    storagePath,
    filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size
  };
};

/**
 * Delete a file from Firebase Cloud Storage by its storage path or full URL
 * @param {String} fileUrlOrPath - Full storage URL or bucket path (e.g. 'profiles/photo-123.jpg')
 */
const deleteFromFirebase = async (fileUrlOrPath) => {
  if (!isFirebaseReady() || !bucket || !fileUrlOrPath) return false;

  try {
    let storagePath = fileUrlOrPath;

    // If a full URL was supplied, extract relative path
    if (fileUrlOrPath.startsWith('http://') || fileUrlOrPath.startsWith('https://')) {
      const url = new URL(fileUrlOrPath);
      // Format: /bucket-name/subfolder/file.ext or /download/storage/v1/b/...
      const pathname = decodeURIComponent(url.pathname);
      const prefix = `/${bucket.name}/`;
      if (pathname.includes(prefix)) {
        storagePath = pathname.split(prefix)[1];
      } else {
        const parts = pathname.split('/');
        storagePath = parts.slice(parts.indexOf('o') + 1).join('/');
      }
    }

    // Strip query parameters if any
    storagePath = storagePath.split('?')[0];

    const file = bucket.file(storagePath);
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
      return true;
    }
    return false;
  } catch (err) {
    console.warn(`[Firebase Storage] Deletion warning for ${fileUrlOrPath}: ${err.message}`);
    return false;
  }
};

module.exports = {
  uploadToFirebase,
  deleteFromFirebase
};
