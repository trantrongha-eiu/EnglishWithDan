'use strict';

// API-wide bot / scraper guard, mounted on /api in app.js.
//
// Two layers, both cheap and stateless apart from the in-memory limiter:
//   1. blockBadAgents — rejects requests whose User-Agent is empty or is a
//      known scripting client / headless browser / AI-training or SEO
//      crawler. The real site is only ever called by a browser, so none of
//      these have a legitimate reason to hit /api. Search engines (Googlebot,
//      Bingbot) are deliberately NOT listed — they render the public pages
//      and may call the public endpoints those pages use.
//   2. apiLimiter — a site-wide ceiling per account (JWT id) or, for
//      anonymous calls, per IP. Generous on purpose: one page load fires
//      ~15 calls and a whole classroom can share one NAT IP. The per-route
//      limiters (middleware/rateLimit.js) stay the fine-grained layer; this
//      only stops floods / bulk scraping loops.
//
// A User-Agent is trivially spoofable — this filters lazy scripts, not a
// determined attacker. Content stays protected by auth / requirePremium /
// answer-key stripping on each route.
//
// Active in production (NODE_ENV=production) or with BOT_GUARD=on;
// BOT_GUARD=off disables it (e.g. a one-off admin script against prod).

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const logger = require('../utils/logger');

const BAD_AGENT_RE = new RegExp([
  // scripting / HTTP libraries
  'curl', 'wget', 'python-requests', 'python-urllib', 'aiohttp', 'httpx',
  'scrapy', 'go-http-client', 'java/', 'okhttp', 'apache-httpclient',
  'libwww-perl', 'node-fetch', 'undici', 'axios/', 'postmanruntime',
  'insomnia', 'httpie', 'guzzlehttp', 'ruby', 'php/',
  // headless / automation browsers
  'headlesschrome', 'phantomjs', 'puppeteer', 'playwright', 'selenium',
  'electron/', 'slimerjs',
  // AI-training crawlers
  'gptbot', 'chatgpt-user', 'oai-searchbot', 'ccbot', 'claudebot',
  'claude-web', 'anthropic-ai', 'bytespider', 'perplexitybot', 'amazonbot',
  'cohere-ai', 'diffbot', 'omgili', 'imagesiftbot', 'youbot', 'meta-externalagent',
  // SEO / data harvesters
  'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'petalbot', 'dataforseobot',
  'blexbot', 'serpstatbot', 'megaindex', 'zoominfobot',
].map((s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|'), 'i');

function isBadAgent(ua) {
  if (!ua || ua.trim().length < 10) return true;
  return BAD_AGENT_RE.test(ua);
}

// One log line per IP per 10 min — a blocked bot retrying in a loop must not
// flood the security log.
const LOG_EVERY_MS = 10 * 60 * 1000;
const lastLogged = new Map();
function logOnce(key, message, meta) {
  const now = Date.now();
  const prev = lastLogged.get(key);
  if (prev && now - prev < LOG_EVERY_MS) return;
  if (lastLogged.size > 5000) lastLogged.clear();
  lastLogged.set(key, now);
  logger.security(message, meta);
}

function blockBadAgents(req, res, next) {
  // Preflights carry the browser's UA anyway; never block them so a CORS
  // error is never mistaken for a bot block.
  if (req.method === 'OPTIONS') return next();
  const ua = req.get('user-agent') || '';
  if (!isBadAgent(ua)) return next();
  logOnce(`ua:${req.ip}`, 'Bot guard: blocked user-agent', {
    ip: req.ip, path: req.path, ua: ua.slice(0, 200),
  });
  return res.status(403).json({ success: false, message: 'Truy cập bị từ chối' });
}

// Key by account when the request carries a valid token (guest tokens
// included), otherwise by IP. A forged/expired token just falls back to IP.
function limiterKey(req) {
  const h = req.get('authorization') || '';
  if (h.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(h.slice(7), process.env.JWT_SECRET);
      if (decoded && decoded.id) return `u:${decoded.id}`;
    } catch { /* fall through to IP */ }
  }
  return `ip:${ipKeyGenerator(req.ip)}`;
}

function createApiLimiter({ windowMs = 60 * 1000, max = 300 } = {}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: limiterKey,
    skip: (req) => req.method === 'OPTIONS',
    handler: (req, res) => {
      logOnce(`rl:${limiterKey(req)}`, 'Bot guard: API rate limit exceeded', {
        ip: req.ip, path: req.path,
      });
      res.status(429).json({ success: false, message: 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.' });
    },
  });
}

function isEnabled(env = process.env) {
  if (env.BOT_GUARD === 'off') return false;
  return env.BOT_GUARD === 'on' || env.NODE_ENV === 'production';
}

// Middleware chain to mount on /api. Returns a no-op when disabled.
function botGuard(opts = {}) {
  if (!(opts.enabled ?? isEnabled())) return [(_req, _res, next) => next()];
  return [blockBadAgents, createApiLimiter(opts.limit)];
}

module.exports = { botGuard, isBadAgent, isEnabled };
