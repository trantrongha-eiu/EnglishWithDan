'use strict';

// Fast "is this a real, deliverable address?" check for email sign-up.
// Replaces the old verify-by-link step, which awaited an SMTP send before
// responding (slow/hanging from Render) and kept the student out of the
// app until they found the email. Everything here finishes in well under a
// second, so a new account can log in right away:
//
//   1. syntax                       (instant)
//   2. Gmail mailbox-name rules     (instant — catches "abc@gmail.com"-style fakes)
//   3. disposable-provider list     (instant — utils/disposableEmailDomains)
//   4. typo'd big-provider domains  (instant — "gmial.com" → suggest gmail.com)
//   5. DNS MX lookup                (~20-200ms, cached per domain, hard 2.5s cap)
//
// Step 5 proves the domain can receive mail at all — it can't prove the
// mailbox exists (SMTP RCPT probing is blocked from most hosts incl. Render
// and big providers don't answer it honestly). A DNS outage/timeout fails
// OPEN so infrastructure trouble never blocks a real student.
const dns = require('dns');
const { isDisposableEmail } = require('./disposableEmailDomains');

const EMAIL_RE = /^[a-z0-9._%+-]+@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

// Big providers whose MX is certain — skip DNS for the common case.
const KNOWN_GOOD_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.com.vn', 'outlook.com',
  'hotmail.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'proton.me',
  'protonmail.com',
]);

// Common misspellings of the providers Vietnamese students actually use.
const DOMAIN_TYPOS = {
  'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com',
  'gmail.om': 'gmail.com', 'gmail.vn': 'gmail.com', 'gmail.com.vn': 'gmail.com',
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'gmal.com': 'gmail.com',
  'gmil.com': 'gmail.com', 'gmali.com': 'gmail.com', 'gmeil.com': 'gmail.com',
  'yahooo.com': 'yahoo.com', 'yaho.com': 'yahoo.com', 'yahoo.con': 'yahoo.com',
  'yahoo.co': 'yahoo.com', 'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'outlok.com': 'outlook.com',
  'outlook.con': 'outlook.com', 'outlook.co': 'outlook.com', 'icloud.con': 'icloud.com',
  'iclod.com': 'icloud.com',
};

const MX_TIMEOUT_MS = 2500;
const MX_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MX_CACHE_MAX = 2000;
const mxCache = new Map(); // domain -> { ok, at }

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Gmail usernames are 6-30 chars of letters/digits/dots (dots don't count
// and can't lead, trail or repeat). Anything else at gmail.com can't exist.
function isValidGmailLocal(local) {
  const base = local.split('+')[0];
  if (!/^[a-z0-9.]+$/.test(base)) return false;
  if (base.startsWith('.') || base.endsWith('.') || base.includes('..')) return false;
  const len = base.replace(/\./g, '').length;
  return len >= 6 && len <= 30;
}

function withTimeout(promise, ms) {
  let t;
  return Promise.race([
    promise,
    new Promise((_, reject) => { t = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), ms); }),
  ]).finally(() => clearTimeout(t));
}

// true = domain accepts mail, false = it definitely doesn't, null = unknown
// (DNS trouble — caller fails open).
async function domainAcceptsMail(domain) {
  const hit = mxCache.get(domain);
  if (hit && Date.now() - hit.at < MX_CACHE_TTL_MS) return hit.ok;

  let ok;
  try {
    const records = await withTimeout(dns.promises.resolveMx(domain), MX_TIMEOUT_MS);
    // RFC 7505 "null MX" (a single record with exchange ".") = explicitly no mail.
    ok = records.some(r => r.exchange && r.exchange !== '.');
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'NXDOMAIN') ok = false;
    else return null; // timeout / SERVFAIL / no network — don't cache, don't block
  }

  if (mxCache.size >= MX_CACHE_MAX) mxCache.delete(mxCache.keys().next().value);
  mxCache.set(domain, { ok, at: Date.now() });
  return ok;
}

// Returns { ok: true, email } with the normalized address, or
// { ok: false, reason, suggestion? } — reason is one of
// 'invalid' | 'gmail_invalid' | 'disposable' | 'typo' | 'no_mx'.
async function checkEmail(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (email.length > 254 || !EMAIL_RE.test(email)) return { ok: false, reason: 'invalid' };

  const at = email.lastIndexOf('@');
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length > 64) return { ok: false, reason: 'invalid' };

  if (DOMAIN_TYPOS[domain]) {
    return { ok: false, reason: 'typo', suggestion: `${local}@${DOMAIN_TYPOS[domain]}` };
  }
  if ((domain === 'gmail.com' || domain === 'googlemail.com') && !isValidGmailLocal(local)) {
    return { ok: false, reason: 'gmail_invalid' };
  }
  if (isDisposableEmail(email)) return { ok: false, reason: 'disposable' };
  if (KNOWN_GOOD_DOMAINS.has(domain)) return { ok: true, email };

  const accepts = await domainAcceptsMail(domain);
  if (accepts === false) return { ok: false, reason: 'no_mx' };
  return { ok: true, email };
}

module.exports = { checkEmail, normalizeEmail, isValidGmailLocal, _mxCache: mxCache };
