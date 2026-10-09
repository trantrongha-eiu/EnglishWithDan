'use strict';

// Cloudflare R2 object storage for Listening audio. Cloudinary's free plan
// counts every byte delivered against 25 credits/month, and Listening audio
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
  const { parseBuffer } = await import('music-metadata');
  const meta = await parseBuffer(buf, { mimeType: contentType, size: buf.length }, { duration: true }).catch(() => null);
  const secure_url = await putObject(`${folder}/${public_id}.${ext}`, buf, contentType);
  return { secure_url, duration: (meta && meta.format.duration) || 0 };
}

module.exports = { isConfigured, publicHost, putObject, deleteObject, uploadAudio };
