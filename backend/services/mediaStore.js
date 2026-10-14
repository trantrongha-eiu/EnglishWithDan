'use strict';

// One place that decides where an uploaded file goes: Cloudflare R2 when
// configured (production — no egress fees), else Cloudinary as before (local
// dev without R2_* vars, and the test suite, which blanks them).
//
// Every upload resolves to { url, publicId, width?, height? }. `publicId` is
// the R2 key or the Cloudinary public_id; destroy() works out which from the
// URL, so records written before the move to R2 (Cloudinary ids) and after
// (R2 keys) are both deleted correctly.
const r2Service = require('./r2Service');
const cloudinaryService = require('./cloudinaryService');

const useR2 = () => r2Service.isConfigured();

// Inline / content image (base64 data URI): map, chart, assignment photo,
// proctor screenshot, QR code. Stored as-is.
async function uploadImage(dataUri, folder) {
  const r = useR2()
    ? await r2Service.uploadImage(dataUri, { folder })
    : await cloudinaryService.uploadImage(dataUri, { folder });
  return { url: r.secure_url, publicId: r.public_id, width: r.width, height: r.height };
}

async function uploadAvatar(dataUri) {
  const r = useR2()
    ? await r2Service.uploadAvatar(dataUri)
    : await cloudinaryService.uploadImage(dataUri, {
      folder: 'avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
    });
  return { url: r.secure_url, publicId: r.public_id };
}

async function uploadPdf(buffer, folder) {
  const r = useR2()
    ? await r2Service.uploadFile(buffer, { folder, ext: 'pdf', contentType: 'application/pdf' })
    : await cloudinaryService.uploadBufferAsDataUri(buffer, 'application/pdf', { folder, resource_type: 'raw' });
  return { url: r.secure_url, publicId: r.public_id };
}

// A short recording (Entrance Test speaking answer: webm / ogg / mp4 / wav).
const AUDIO_EXT = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav' };
async function uploadRecording(buffer, mimetype, folder, name) {
  const type = String(mimetype || 'audio/webm').split(';')[0].toLowerCase();
  const r = useR2()
    ? await r2Service.uploadAudio(buffer, { folder, public_id: name, ext: AUDIO_EXT[type] || 'webm', contentType: type })
    : await cloudinaryService.uploadBufferStream(buffer, { resource_type: 'video', folder, public_id: name });
  return { url: r.secure_url, publicId: r.public_id || (r2Service.keyOf(r.secure_url) || '') };
}

// Delete stored files. Each item is { url, publicId } (or a bare URL /
// public_id string). R2 URLs are deleted by key; anything else is treated as
// a Cloudinary image public_id. Never throws; returns how many were deleted.
async function destroy(items, { resourceType = 'image' } = {}) {
  const r2Keys = [], cld = [];
  for (const it of [].concat(items || [])) {
    const url = typeof it === 'string' ? it : it && it.url;
    const pid = typeof it === 'string' ? it : it && it.publicId;
    const key = r2Service.keyOf(url) || r2Service.keyOf(pid);
    if (key) r2Keys.push(key);
    else if (pid && !/^https?:/.test(pid)) cld.push(pid);
  }
  let n = 0;
  if (r2Keys.length && useR2()) n += await r2Service.deleteObjects(r2Keys).catch(() => 0);
  if (cld.length) {
    n += resourceType === 'image'
      ? await cloudinaryService.destroyAssets(cld).catch(() => 0)
      : (await Promise.all(cld.map(id => cloudinaryService.destroyAsset(id, { resource_type: resourceType })))).length;
  }
  return n;
}

module.exports = { useR2, uploadImage, uploadAvatar, uploadPdf, uploadRecording, destroy };
