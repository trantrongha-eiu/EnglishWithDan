'use strict';

// Consolidates 3 independently hand-rolled Cloudinary upload patterns
// found across listeningService.js (streaming audio upload), tuitionService.js
// (buffer→base64→data-URI upload for QR images), and user.controller.js's
// avatar upload (data-URI upload with a transformation) — all three called
// `cloudinary.uploader.upload*` directly with no shared helper.
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Upload a base64 data-URI image (avatars, map/diagram images, QR codes).
async function uploadImage(dataUri, options) {
  return cloudinary.uploader.upload(dataUri, { resource_type: 'image', ...options });
}

// Upload a raw Buffer (e.g. multer memoryStorage) via a streaming upload —
// used for large audio/video files where reading the whole buffer into a
// base64 string first would be wasteful.
async function uploadBufferStream(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => err ? reject(err) : resolve(result));
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// Upload a Buffer as a base64 data-URI (smaller files where streaming
// isn't necessary, e.g. QR code images from a multer buffer).
async function uploadBufferAsDataUri(buffer, mimetype, options) {
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
  return cloudinary.uploader.upload(dataUri, options);
}

async function destroyAsset(publicId) {
  return cloudinary.uploader.destroy(publicId).catch(() => {});
}

// Lightweight connectivity check for the detailed health endpoint (Phase
// 11) — cloudinary.api.ping() is a cheap admin-API call, not a real
// upload, so it's safe to call from an infrequently-polled diagnostic
// endpoint without incurring upload costs.
async function ping() {
  return cloudinary.api.ping();
}

module.exports = { uploadImage, uploadBufferStream, uploadBufferAsDataUri, destroyAsset, ping };
