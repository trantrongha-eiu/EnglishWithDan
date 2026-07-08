'use strict';

// Cloudinary's upload() accepts a data URI, a remote URL, or a local file path
// as its first argument — if a caller can pass an arbitrary string, they can
// make Cloudinary fetch an arbitrary URL server-side (SSRF via a third-party
// proxy). Endpoints that expect an "imageBase64" upload should only ever
// accept an actual base64 image data URI.
function isImageDataUri(str) {
  return typeof str === 'string' && /^data:image\/(png|jpe?g|gif|webp|bmp|svg\+xml);base64,[A-Za-z0-9+/]+=*$/.test(str);
}

module.exports = { isImageDataUri };
