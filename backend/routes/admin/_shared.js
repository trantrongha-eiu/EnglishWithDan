'use strict';

// Shared middleware and helpers used across the admin route modules in
// this directory. Extracted verbatim from the former single-file
// backend/routes/admin.js (2,700 lines, 125 routes) — behavior unchanged,
// only the file boundary moved.

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { effectiveStreak } = require('../../utils/streak');

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Upload a base64 image data URI to Cloudinary, return the secure URL.
// Shared by every admin route that lets teachers attach an inline image
// (passages, writing tasks) — folder controls which Cloudinary bucket it lands in.
async function uploadImageDataUri(imageBase64, folder) {
  const result = await cloudinary.uploader.upload(imageBase64, { folder, resource_type: 'image' });
  return result.secure_url;
}

// Upload a PDF Buffer (from multer memoryStorage) to Cloudinary as a raw
// asset, return the secure URL. Shared by speaking materials + writing samples.
async function uploadPdfBuffer(buffer, folder) {
  const dataUri = `data:application/pdf;base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, { folder, resource_type: 'raw' });
  return result.secure_url;
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

// Multer: store file in memory for Cloudinary upload
const uploadPdfMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Chỉ chấp nhận file PDF'));
  }
});

module.exports = { escapeRegex, effectiveStreak, teacherOnly, adminOnly, uploadPdfMemory, uploadImageDataUri, uploadPdfBuffer };
