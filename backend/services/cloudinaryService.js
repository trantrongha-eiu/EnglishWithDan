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

// Bulk delete of up to 100 image assets per call (Admin API).
async function destroyAssets(publicIds) {
  const ids = (publicIds || []).filter(Boolean);
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const res = await cloudinary.api.delete_resources(ids.slice(i, i + 100), { resource_type: 'image' });
    deleted += Object.values((res && res.deleted) || {}).filter(v => v === 'deleted').length;
  }
  return deleted;
}

// public_ids of image assets in `folder` uploaded more than `days` ago
// (Search API), at most `max` per call. Uses an absolute timestamp: the
// relative form is inverted from what it reads like (`uploaded_at>1d`
// matched assets uploaded minutes ago when checked against the live
// account, 2026-10-02).
async function listOldImages(folder, days, max = 100) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const res = await cloudinary.search
    .expression(`folder:${folder} AND resource_type:image AND uploaded_at<"${cutoff}"`)
    .max_results(max)
    .execute();
  return ((res && res.resources) || []).map(r => r.public_id);
}

// Lightweight connectivity check for the detailed health endpoint (Phase
// 11) — cloudinary.api.ping() is a cheap admin-API call, not a real
// upload, so it's safe to call from an infrequently-polled diagnostic
// endpoint without incurring upload costs.
async function ping() {
  return cloudinary.api.ping();
}

module.exports = { uploadImage, uploadBufferStream, uploadBufferAsDataUri, destroyAsset, destroyAssets, listOldImages, ping };
