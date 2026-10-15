'use strict';

// Honeypot check for the public, no-login forms (contact / consult modal,
// Entrance Test guest sign-up). Each form carries a visually hidden
// `hp_check` input a human never sees or fills; form-filling bots fill every
// field. Only a NON-EMPTY value trips it — a missing field is fine, so an old
// cached page (or a backend deployed before the frontend) keeps working.

const logger = require('./logger');

function isHoneypotTripped(req, formName) {
  const v = req.body && req.body.hp_check;
  if (typeof v !== 'string' || v.trim() === '') return false;
  logger.security('Honeypot tripped', { form: formName, ip: req.ip, ua: (req.get('user-agent') || '').slice(0, 200) });
  return true;
}

module.exports = { isHoneypotTripped };
