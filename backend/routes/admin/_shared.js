'use strict';

// Shared middleware and helpers used across the admin route modules in
// this directory. Extracted verbatim from the former single-file
// backend/routes/admin.js (2,700 lines, 125 routes) — behavior unchanged,
// only the file boundary moved.

const multer = require('multer');
const mediaStore = require('../../services/mediaStore');
const { effectiveStreak } = require('../../utils/streak');
const { escapeRegex } = require('../../utils/strings');

// Upload a base64 image data URI (R2, or Cloudinary when R2 isn't
// configured — services/mediaStore), return its URL. Shared by every admin
// route that lets teachers attach an inline image (passages, writing tasks).
async function uploadImageDataUri(imageBase64, folder) {
  return (await mediaStore.uploadImage(imageBase64, folder)).url;
}

// Card cover image (Passage / ListeningSection / VocabularyLesson /
// WritingExam .thumbnailUrl — all four admin forms post here via
// CoverImageField). Goes to Cloudflare R2 when configured (pre-cropped
// there, see r2Service.uploadCoverImage), else Cloudinary as before.
async function uploadCoverImageDataUri(imageBase64) {
  const r2Service = require('../../services/r2Service');
  if (!r2Service.isConfigured()) return uploadImageDataUri(imageBase64, 'reading/covers');
  const buf = Buffer.from(String(imageBase64).slice(String(imageBase64).indexOf(',') + 1), 'base64');
  return r2Service.uploadCoverImage(buf, { folder: 'covers' });
}

// Upload a PDF Buffer (from multer memoryStorage), return its URL. Shared by
// speaking materials + writing samples.
async function uploadPdfBuffer(buffer, folder) {
  return (await mediaStore.uploadPdf(buffer, folder)).url;
}

// Chỉ teacher và admin mới dùng được
const teacherOnly = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
  }
  // Teacher không được xóa nội dung
  if (req.user.role === 'teacher' && req.method === 'DELETE') {
    return res.status(403).json({ success: false, message: 'Giáo viên không có quyền xóa nội dung' });
  }
  next();
};

// Chỉ admin mới dùng được (quản lý user, v.v.)
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Chỉ admin mới có quyền thực hiện thao tác này' });
  }
  next();
};

// Multer: store file in memory for the R2 / Cloudinary upload
const uploadPdfMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Chỉ chấp nhận file PDF'));
  }
});

// Wraps uploadPdfMemory.single('pdf') so a multer error (wrong mimetype,
// over the 50MB limit) reaches the client as the normal
// { success:false, message } JSON shape instead of falling through to
// Express's generic error handler — multer reports its own errors via this
// middleware's (err) callback, which fires before the route handler (and
// its own try/catch) ever runs. Shared by both PDF-upload routes
// (writing samples, speaking materials).
function uploadPdf(req, res, next) {
  uploadPdfMemory.single('pdf')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}

module.exports = { escapeRegex, effectiveStreak, teacherOnly, adminOnly, uploadPdfMemory, uploadPdf, uploadImageDataUri, uploadCoverImageDataUri, uploadPdfBuffer };
