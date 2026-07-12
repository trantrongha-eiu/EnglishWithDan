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

module.exports = { isImageDataUri };
