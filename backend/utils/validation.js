'use strict';

// Cloudinary's upload() accepts a data URI, a remote URL, or a local file path
// as its first argument — if a caller can pass an arbitrary string, they can
// make Cloudinary fetch an arbitrary URL server-side (SSRF via a third-party
// proxy). Endpoints that expect an "imageBase64" upload should only ever
// accept an actual base64 image data URI.
// svg+xml deliberately excluded — SVGs can embed <script>/event-handler
// payloads that execute if the raw asset URL is ever opened directly
// rather than rendered inside an <img> tag (security audit finding).
function isImageDataUri(str) {
  return typeof str === 'string' && /^data:image\/(png|jpe?g|gif|webp|bmp);base64,[A-Za-z0-9+/]+=*$/.test(str);
}

// BUG-025: isImageDataUri() only checks type/format — nothing stops a
// caller from sending an arbitrarily large base64 payload (the frontend's
// own upload flow compresses down to ~600px/quality 0.85 first, but
// that's client-side only and not a security boundary; a direct API
// request bypasses it entirely). Computed from the base64 STRING length
// directly (no decoding into a Buffer first) so checking the size can
// never itself be the memory spike it's meant to prevent — same
// reasoning the frontend's own MAX_AVATAR_BYTES comment documents for why
// an unbounded read must be rejected before any expensive work happens on
// it, just applied server-side. Standard base64-to-byte-count formula,
// adjusted for 0-2 trailing '=' padding characters.
function getBase64PayloadByteSize(dataUri) {
  const commaIdx = dataUri.indexOf(',');
  const payload = commaIdx === -1 ? dataUri : dataUri.slice(commaIdx + 1);
  const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0;
  return Math.floor((payload.length * 3) / 4) - padding;
}

module.exports = { isImageDataUri, getBase64PayloadByteSize };
