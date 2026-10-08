'use strict';

// Card cover for a student practice list (Reading, Listening, Vocab Topics):
// a small 2:1 crop of a Cloudinary image. Other hosts are returned unchanged.
function toCardThumbnail(url) {
  if (!url) return '';
  return url.replace(/(res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?!c_fill)/, '$1c_fill,g_auto,w_480,h_240,q_auto,f_auto/');
}

// A stored cover URL is '' (no cover) or an https URL; anything else is
// rejected, since the student page puts it straight into an <img src>.
function isValidCoverUrl(v) {
  return typeof v === 'string' && (v === '' || (/^https:\/\/[^\s"'<>]+$/.test(v) && v.length <= 1000));
}

module.exports = { toCardThumbnail, isValidCoverUrl };
