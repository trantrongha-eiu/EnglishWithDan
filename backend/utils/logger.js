'use strict';

// Structured logging utility (Phase 11 — production readiness).
//
// Emits one JSON line per log event — readable in Render's plain-text log
// viewer, and directly parseable if a log-aggregation tool (Datadog,
// Logtail, etc.) is ever wired up later, with no format migration needed.
//
// This is additive infrastructure, not a rewrite: most of the ~70 existing
// console.log/console.error call sites across the codebase are low-stakes
// informational/debug logs and are left as-is (touching all of them would
// be disproportionate churn for a "preserve existing functionality" phase).
// This logger is applied at the specific high-value operational points
// the brief calls out: startup, shutdown, security events, auth failures,
// database failures, and AI failures — see each call site's own comment
// for why it was chosen.
//
// Categories map directly to the brief's requested separation: info,
// warn, error, security, startup, shutdown, ai, db, auth.

const SENSITIVE_KEYS = /pass(word)?|secret|token|jwt|otp|apikey|api_key|authorization/i;

// Value-level redaction (production-readiness audit finding): key-based
// redaction alone misses a credential embedded INSIDE an innocuously-named
// field — most importantly a MongoDB connection string (which embeds
// username:password) surfacing inside `err.message`/`err.stack` on a
// connection failure, exactly the kind of error a bad MONGO_URI produces.
// Each pattern below masks only the credential portion where possible,
// preserving the rest of the string for debugging (host, db name, etc.).
const VALUE_REDACTIONS = [
  // mongodb://user:pass@host or mongodb+srv://user:pass@host — mask the
  // credential, keep the connection target visible.
  [/(mongodb(?:\+srv)?:\/\/)[^\s@/]+@/gi, '$1[redacted]@'],
  // Authorization: Bearer <token> / a bare "Bearer xyz" fragment in text.
  [/\bBearer\s+[A-Za-z0-9\-_.]{10,}/gi, 'Bearer [redacted]'],
  // JWT-shaped strings (header.payload.signature, base64url segments).
  [/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g, '[redacted-jwt]'],
  // Common cloud/AI API-key prefixes (Google, OpenAI-style, Google OAuth access tokens).
  [/\b(?:AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{16,}|ya29\.[A-Za-z0-9_-]{20,})\b/g, '[redacted-key]'],
];

function redactString(str) {
  if (typeof str !== 'string') return str;
  let out = str;
  for (const [pattern, replacement] of VALUE_REDACTIONS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

// Extracts the useful, safe-to-log fields from an Error instance —
// Error's own message/stack/name are non-enumerable, so a naive
// Object.entries(err) (or spreading it into a log line) silently loses
// them instead of leaking them; this makes sure they're captured AND
// still passed through the same string redaction as everything else.
function redactError(err) {
  // Field names deliberately avoid `message` — the log entry already has
  // its own top-level `message` (the human-readable call-site text); a
  // meta field of the same name would silently overwrite it via object
  // spread in write() below, discarding whichever one lost.
  return { errorName: err.name, errorMessage: redactString(err.message), stack: redactString(err.stack) };
}

// Defense-in-depth redaction — logger callers shouldn't pass sensitive
// values in `meta`, but a future call site that accidentally does (e.g.
// spreading a request body, or a raw error/connection-string ending up in
// a message string) shouldn't leak it into logs.
function redact(meta) {
  if (meta instanceof Error) return redactError(meta);
  if (typeof meta === 'string') return redactString(meta);
  if (Array.isArray(meta)) return meta.map(redact);
  if (!meta || typeof meta !== 'object') return meta;

  const out = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.test(key)) {
      out[key] = '[redacted]';
    } else {
      out[key] = redact(value);
    }
  }
  return out;
}

function write(level, category, message, meta) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message: redactString(message),
    ...redact(meta),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

module.exports = {
  info: (category, message, meta) => write('info', category, message, meta),
  warn: (category, message, meta) => write('warn', category, message, meta),
  error: (category, message, meta) => write('error', category, message, meta),

  // Convenience wrappers for the brief's specifically-called-out categories.
  security: (message, meta) => write('warn', 'security', message, meta),
  startup: (message, meta) => write('info', 'startup', message, meta),
  shutdown: (message, meta) => write('info', 'shutdown', message, meta),
  ai: (message, meta) => write('error', 'ai', message, meta),
  db: (message, meta) => write('info', 'database', message, meta),
  dbError: (message, meta) => write('error', 'database', message, meta),
  auth: (message, meta) => write('warn', 'auth', message, meta),
};
