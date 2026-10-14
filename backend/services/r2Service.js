'use strict';

// Cloudflare R2 object storage for every uploaded file: Listening audio,
// card covers, content images, proctor screenshots, avatars, PDFs
// (services/mediaStore.js picks R2 or the Cloudinary fallback). Cloudinary's
// free plan counts every byte delivered against 25 credits/month, and Listening audio
// was ~95% of that (2026-10); R2 has no egress fees. The bucket is served
// read-only through its custom domain (config.r2.publicUrl), so a stored
// audioUrl is a plain https URL — the media proxy, admin <audio> previews
// and scripts all keep working unchanged.
const config = require('../config');

let client;
function s3() {
  if (!client) {
    const { S3Client } = require('@aws-sdk/client-s3');
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: config.r2.accessKeyId, secretAccessKey: config.r2.secretAccessKey },
    });
  }
  return client;
}

function isConfigured() {
  const r = config.r2;
  return !!(r.accountId && r.accessKeyId && r.secretAccessKey && r.bucket && r.publicUrl);
}

function publicHost() {
  try { return config.r2.publicUrl ? new URL(config.r2.publicUrl).hostname : null; } catch { return null; }
}

// Upload `body` (Buffer) at `key` and return its public URL.
async function putObject(key, body, contentType) {
  const { PutObjectCommand } = require('@aws-sdk/client-s3');
  await s3().send(new PutObjectCommand({
    Bucket: config.r2.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    // keys are never reused (they carry a timestamp), so the CDN may keep them
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  return `${config.r2.publicUrl}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

async function deleteObject(key) {
  const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
  return s3().send(new DeleteObjectCommand({ Bucket: config.r2.bucket, Key: key }));
}

// Upload an audio Buffer (or local file path) as `${folder}/${public_id}.${ext}`.
// Result is shaped like a Cloudinary upload result ({ secure_url, duration })
// so the admin upload path and the import scripts swap over with one line.
async function uploadAudio(src, { folder, public_id, ext = 'mp3', contentType = 'audio/mpeg' }) {
  const buf = Buffer.isBuffer(src) ? src : require('fs').readFileSync(src);
  // Duration is best-effort: a file music-metadata can't read (or, under
  // Jest, the ESM-only package failing to load) uploads with duration 0
  // rather than failing the whole upload.
  let meta = null;
  try {
    const { parseBuffer } = await import('music-metadata');
    meta = await parseBuffer(buf, { mimeType: contentType, size: buf.length }, { duration: true });
  } catch { /* duration stays 0 */ }
  const secure_url = await putObject(`${folder}/${public_id}.${ext}`, buf, contentType);
  return { secure_url, duration: (meta && meta.format.duration) || 0 };
}

// Practice-list card cover (Reading / Listening / Vocab / Writing). Cloudinary
// covers are cropped per request by utils/cardThumbnail (480×240 c_fill,g_auto);
// R2 serves bytes as-is, so the crop happens once here: 2:1 at 640×320
// (card is ~240–320 CSS px wide → sharp on 2× screens), "attention" crop
// ≈ g_auto, WebP. Returns the public URL.
const COVER_W = 640, COVER_H = 320;
async function uploadCoverImage(buf, { folder = 'covers' } = {}) {
  const sharp = require('sharp');
  const out = await sharp(buf, { limitInputPixels: 50e6 })
    .rotate() // honour EXIF orientation from phone photos
    .resize(COVER_W, COVER_H, { fit: 'cover', position: sharp.strategy.attention })
    .webp({ quality: 80 })
    .toBuffer();
  const id = `${Date.now()}_${require('crypto').randomBytes(4).toString('hex')}`;
  return putObject(`${folder}/${id}.webp`, out, 'image/webp');
}

// The object key behind one of our R2 URLs ("proctor-shots/123_ab.jpg"),
// or null for any other URL (Cloudinary, local path, '').
function keyOf(url) {
  if (typeof url !== 'string' || !config.r2.publicUrl || !url.startsWith(config.r2.publicUrl + '/')) return null;
  return url.slice(config.r2.publicUrl.length + 1).split('/').map(decodeURIComponent).join('/');
}

// Up to 1000 keys per DeleteObjects call. Returns how many were deleted.
async function deleteObjects(keys) {
  const { DeleteObjectsCommand } = require('@aws-sdk/client-s3');
  const list = [...new Set((keys || []).filter(Boolean))];
  let deleted = 0;
  for (let i = 0; i < list.length; i += 1000) {
    const res = await s3().send(new DeleteObjectsCommand({
      Bucket: config.r2.bucket,
      Delete: { Objects: list.slice(i, i + 1000).map(Key => ({ Key })), Quiet: false },
    }));
    deleted += ((res && res.Deleted) || []).length;
  }
  return deleted;
}

// Keys under `prefix` last written more than `days` ago (all pages).
async function listOldKeys(prefix, days) {
  const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const keys = [];
  let token;
  do {
    const res = await s3().send(new ListObjectsV2Command({
      Bucket: config.r2.bucket, Prefix: prefix.replace(/\/?$/, '/'), ContinuationToken: token,
    }));
    for (const o of (res.Contents || [])) if (new Date(o.LastModified).getTime() < cutoff) keys.push(o.Key);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

const newId = () => `${Date.now()}_${require('crypto').randomBytes(4).toString('hex')}`;
// No SVG: it can carry script if its URL is opened directly (see utils/validation).
const IMAGE_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/bmp': 'bmp', 'image/avif': 'avif' };

// Upload an image (base64 data URI, or Buffer + contentType) as-is under
// `folder`. A JPEG with an EXIF rotation is turned upright first, so the
// stored width/height match what the browser shows. Result is shaped like a
// Cloudinary upload result: { secure_url, public_id (= the R2 key), width, height }.
async function uploadImage(src, { folder, contentType } = {}) {
  let buf = src, type = contentType;
  if (typeof src === 'string') {
    const m = /^data:([\w/+.-]+);base64,/.exec(src);
    if (!m) throw new Error('not a base64 data URI');
    type = m[1];
    buf = Buffer.from(src.slice(m[0].length), 'base64');
  }
  type = String(type || '').toLowerCase().replace('image/jpg', 'image/jpeg');
  const ext = IMAGE_EXT[type];
  if (!ext) throw new Error(`unsupported image type ${type || '(none)'}`);
  // Size is best-effort (sharp can't read BMP) — only assignment images use it.
  let width, height;
  try {
    const sharp = require('sharp');
    const meta = await sharp(buf, { limitInputPixels: 100e6 }).metadata();
    ({ width, height } = meta);
    if (ext === 'jpg' && meta.orientation > 1) {
      const { data, info } = await sharp(buf, { limitInputPixels: 100e6 }).rotate().jpeg({ quality: 90 }).toBuffer({ resolveWithObject: true });
      buf = data; ({ width, height } = info);
    }
  } catch { /* stored as-is, no size */ }
  const key = `${folder}/${newId()}.${ext}`;
  return { secure_url: await putObject(key, buf, type), public_id: key, width, height };
}

// Profile picture: square crop ("attention" ≈ Cloudinary's g_face for a
// portrait), 256×256 WebP — shown at ≤128 CSS px.
async function uploadAvatar(src) {
  const sharp = require('sharp');
  const buf = Buffer.from(String(src).slice(String(src).indexOf(',') + 1), 'base64');
  const out = await sharp(buf, { limitInputPixels: 50e6 })
    .rotate()
    .resize(256, 256, { fit: 'cover', position: sharp.strategy.attention })
    .webp({ quality: 82 })
    .toBuffer();
  const key = `avatars/${newId()}.webp`;
  return { secure_url: await putObject(key, out, 'image/webp'), public_id: key };
}

// Any other file (PDF handouts, speaking recordings) under `folder`.
async function uploadFile(buf, { folder, ext, contentType }) {
  const key = `${folder}/${newId()}.${ext}`;
  return { secure_url: await putObject(key, buf, contentType), public_id: key };
}

// Bytes of a Buffer, base64 data URI, http(s) URL or local file path — for
// the import / patch scripts, which get images from all four.
async function loadBuffer(src) {
  if (Buffer.isBuffer(src)) return src;
  const s = String(src);
  if (s.startsWith('data:')) return Buffer.from(s.slice(s.indexOf(',') + 1), 'base64');
  if (/^https?:\/\//.test(s)) {
    const r = await fetch(s, { headers: { 'User-Agent': 'EnglishWithDan/1.0 (https://ieltsthayha.com)' } });
    if (!r.ok) throw new Error(`download ${r.status} ${s}`);
    return Buffer.from(await r.arrayBuffer());
  }
  return require('fs').readFileSync(s);
}

// Scripts: store an image (any loadBuffer source) at `${name}_<time>.<ext>` —
// a fresh key each run, never an overwrite (putObject marks objects
// immutable, so a reused key would keep serving the old bytes). `maxWidth`
// scales a wider image down (Cloudinary's c_limit). Returns { secure_url, public_id }.
async function uploadImageFrom(src, name, { maxWidth } = {}) {
  const sharp = require('sharp');
  let buf = await loadBuffer(src);
  const meta = await sharp(buf, { limitInputPixels: 100e6 }).metadata();
  const fmt = meta.format === 'jpg' ? 'jpeg' : meta.format;
  if (!['jpeg', 'png', 'webp', 'gif'].includes(fmt)) throw new Error(`unsupported image format ${meta.format}`);
  if (maxWidth && meta.width > maxWidth) buf = await sharp(buf, { limitInputPixels: 100e6 }).rotate().resize({ width: maxWidth }).toFormat(fmt).toBuffer();
  const key = `${name}_${Date.now()}.${fmt === 'jpeg' ? 'jpg' : fmt}`;
  return { secure_url: await putObject(key, buf, `image/${fmt}`), public_id: key };
}

module.exports = {
  isConfigured, publicHost, putObject, deleteObject, deleteObjects, listOldKeys, keyOf,
  uploadAudio, uploadCoverImage, uploadImage, uploadAvatar, uploadFile, loadBuffer, uploadImageFrom,
  COVER_W, COVER_H,
};
