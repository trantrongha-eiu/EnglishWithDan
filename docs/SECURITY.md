# Security

This app went through four full security-audit rounds (OWASP-mapped, each with independent verification agents, each fixing every Critical/High finding before being marked done) plus a fifth production-readiness security pass. This doc is the durable summary of that work — what the security model actually is today, not a chronological audit log. For the operational side (secret rotation *procedure*, incident response), see [`docs/RUNBOOK.md`](RUNBOOK.md) and [`docs/INCIDENT_RESPONSE.md`](INCIDENT_RESPONSE.md) — this doc explains the *model*, those explain what to *do*.

## ⚠️ Standing critical risk — read this first

**`JWT_SECRET`, `MONGO_URI`, and `CLOUDINARY_API_SECRET` were committed to this repository's git history early in the project, while the GitHub repo was public.** As of the most recent check (repeated across four separate audit passes), all three are still byte-identical to the leaked values — **they have not been rotated.** `OPENROUTER_API_KEY` has been rotated.

Practical consequence, right now, without any further compromise needed: anyone who ever cloned this repo while it was public can forge a valid JWT for any account (including admin) and has direct read/write access to the production database. Full rotation procedure: [`docs/RUNBOOK.md` §6](RUNBOOK.md#6-secret-rotation-procedure--read-this-section-first). This is not a historical footnote — treat it as live until it's actually done.

## Authentication

JWT bearer tokens, stateless, no server-side session store, 7-day expiry, no refresh mechanism (a token is valid for its full lifetime or until the user logs in again). Full flow: [`docs/ARCHITECTURE.md` § Authentication flow](ARCHITECTURE.md#authentication-flow).

Security properties, each independently audited and verified:
- **Passwords**: bcrypt, cost factor 10. Never stored or logged in plaintext.
- **User enumeration**: login failures for "no such account" and "wrong password" return an identical status code and message — an attacker cannot distinguish the two from the response. A residual timing side-channel (a nonexistent-account lookup is faster than a real bcrypt comparison) is closed with a dummy bcrypt comparison on the fast path, so both cases take comparable time.
- **OTP (password reset)**: 6-digit code generated with `crypto.randomInt` (CSPRNG, not `Math.random`), 15-minute expiry, max 5 wrong guesses enforced via a single atomic `findOneAndUpdate` (not a read-then-write — a prior audit found and fixed a race condition where concurrent guesses could bypass the 5-attempt cap).
- **Google OAuth**: protected against login/session-swap CSRF via a random nonce packed into the OAuth `state` param and cross-checked against a short-lived httpOnly cookie *before* the authorization code is ever exchanged. A banned account is rejected on the OAuth path the same as the local-login path.
- **Banned accounts**: enforced on every request, not just at login — `middleware/auth.js` re-checks `isBanned` from the database on every authenticated request, so an existing valid token stops working the moment the account is banned.
- **JWT verification**: HS256 only (no `alg:none` acceptance), secret never falls back to a hardcoded default, malformed/expired/wrong-secret tokens all cleanly return 401 with no crash.

## Authorization

Two independent axes — `role` (`student`/`teacher`/`admin`) and `plan` (`free`/`premium`) — both read exclusively from `req.user`, which is loaded fresh from the database on every request. No endpoint anywhere accepts a role or plan claim from the request body/headers.

- **IDOR**: every route file (36 total, re-verified across multiple audit rounds) that returns or mutates user-specific data filters by ownership *at the query level* (`{_id, userId: req.user._id}`), not by fetching and comparing in application code.
- **Admin/teacher gating**: `teacherOnly`/`adminOnly` middleware (`backend/routes/admin/_shared.js`), applied per-route — `adminOnly` is strictly narrower and used for destructive/financial/role-changing actions specifically. See [`docs/API_ADMIN.md`](API_ADMIN.md) for the exact gate on every admin endpoint.
- **Premium gating**: `middleware/requirePremium.js`, checked server-side from the database-loaded plan value (auto-expired if `planExpiresAt` has passed) — never trusts a client-sent plan claim.
- **Mass assignment**: every user-facing update endpoint (profile, registration) explicitly whitelists accepted fields — a request body containing `role` or `plan` is silently ignored, not applied.

## Input validation / injection

- **NoSQL injection**: a global middleware (`backend/middleware/mongoSanitize.js`) strips `$`-prefixed and dotted keys from `req.body`/`params`/`query`, recursively including inside arrays, applied before every route. Every user-supplied search string that reaches a `$regex` filter is escaped first (`escapeRegex` helper).
- **XSS**: the vanilla-JS frontend has one shared escaping helper (`escHtml`, `frontend/js/shared/utils.js`) used consistently across essentially every `innerHTML` call site that includes user/admin-controlled data — a few gaps found in earlier audit rounds (vocab book names, difficult-words fields, course cards, tuition settings) were all fixed and are now covered by regression tests. The React admin app has zero `dangerouslySetInnerHTML` usage anywhere — JSX's default escaping is never bypassed.
- **SSRF**: the one place a raw string could theoretically reach an outbound URL (Cloudinary's `upload()`, which accepts a data URI *or* a remote URL) is guarded by `isImageDataUri()` — a strict, fully-anchored regex that can only match a base64 data URI, never an `http(s)://` string — enforced on every call site.
- **Prototype pollution, command injection, path traversal**: none found — no recursive object-merge utility exists in the codebase, no `child_process` usage anywhere, and the backend is a pure JSON API with no filesystem-serving code path (all file storage goes through Cloudinary).
- **Server-side re-grading**: a genuinely important fix from the second security-audit round — every practice-save endpoint across reading/listening/writing/Task 1/Task 2 (via `task2PracticeService`) re-derives `isCorrect`/`score`/`xpEarned` from the real answer key server-side. Before this fix, a client could submit fabricated grading data directly to the save endpoint and bypass grading entirely. AI-graded question types are a documented, narrower exception (re-running Gemini on every save isn't practical) — see [`docs/ARCHITECTURE.md` § AI grading workflow](ARCHITECTURE.md#ai-grading-workflow).
  **Known gap, found while writing `docs/API.md`, not yet fixed:** `POST /api/task2template/save` (a *separate* service/model — `task2TemplateService`/`Task2TemplateAttempt` — from the `task2PracticeService`/`Task2Attempt` pair the fix above actually covers) still trusts client-supplied `totalItems`/`correctItems` verbatim, only coercing them with `Number()`. This endpoint fell outside that security fix's scope because it's a different route/service pair than the one the audit targeted. Same class of risk as the original finding (a client can submit a fabricated score directly to this one endpoint); worth a targeted fix in a future phase rather than something silently patched during a documentation-only pass. See [`docs/MAINTENANCE.md`](MAINTENANCE.md) for tracking.

## File uploads

All uploads go through Cloudinary (never local disk). Every multer config has both a MIME-type filter and a file-size limit. SVG is deliberately excluded from the accepted image-upload formats (an SVG can embed `<script>`, a known stored-XSS vector if the raw asset URL is ever opened directly rather than rendered via `<img>`).

## Rate limiting / brute-force protection

`express-rate-limit`, applied to every auth endpoint (login, register, forgot-password, verify-OTP, reset-password) and every AI-cost-incurring endpoint (speaking analyze, Task 2 check, admin AI-grade), keyed by IP + account identifier for auth routes so one attacker can't spray many accounts from one IP without also being individually throttled per-account. Rate-limit hits and repeated auth failures are logged (`logger.security`/`logger.auth`) — this wasn't always true; an earlier gap where brute-force activity was completely invisible in logs was found and fixed during the production-readiness audit.

**Load-bearing config**: `app.set('trust proxy', 1)` in `backend/app.js`. This must stay exactly `1` (Render sits behind exactly one reverse-proxy hop) — `true` would trust every hop including a client-supplied `X-Forwarded-For` header, letting an attacker spoof a fresh apparent IP on every request and bypass rate limiting entirely; unset/`false` would make every request appear to come from Render's internal proxy address, collapsing all rate limiting onto one shared global bucket. This was a real, live bug (found and fixed) before the current value was set — don't change it without understanding both failure modes.

## Secret management

- **No secrets in source code** — verified via repeated fresh greps across the whole working tree (not just git history) for credential-shaped literals; `backend/.env.example` contains only placeholders.
- **Centralized-ish env var access** — `backend/config/index.js` centralizes most environment-variable reads, though a number of files still read `process.env.X` directly (see [`docs/MAINTENANCE.md`](MAINTENANCE.md) for this as tracked tech debt, not a live bug — `dotenv` loads correctly before any of these run either way).
- **Log redaction** — `backend/utils/logger.js` redacts both sensitive-looking *keys* (password/secret/token/jwt/otp/apikey/authorization) and sensitive-shaped *values* (a MongoDB connection string's embedded credentials, `Bearer <token>` fragments, JWT-shaped strings, common cloud API-key prefixes) wherever they appear in logged data — added specifically because a MongoDB connection failure's error message can otherwise include the raw connection string.
- **Test isolation** — the test suite's `MONGO_URI`/`JWT_SECRET` are always sourced from an isolated in-memory database and a fixed test value respectively, never from a real local `.env`, even if one exists on the machine running the tests.

## OWASP Top 10 (2021) — where each maps in this codebase

| Category | Status |
|---|---|
| A01 Broken Access Control | Audited across all 36 route files — IDOR/role/premium gating verified, zero unresolved findings |
| A02 Cryptographic Failures | bcrypt for passwords, CSPRNG for OTPs — **but see the standing critical risk above: leaked, unrotated secrets** |
| A03 Injection | NoSQL injection (mongoSanitize), XSS (escHtml/JSX), regex injection (escapeRegex) all covered |
| A04 Insecure Design | Server-side re-grading, atomic OTP-lockout, `trust proxy` — each a real design gap found and closed |
| A05 Security Misconfiguration | Helmet defaults intact, exact-match CORS allowlist (never wildcarded with credentials), no verbose stack traces to clients |
| A06 Vulnerable/Outdated Components | `npm audit` patched 11 of 12 known CVEs; `nodemailer` has open HIGH-severity CVEs pending a breaking-change upgrade decision — see `docs/MAINTENANCE.md` |
| A07 Identification & Auth Failures | Rate limiting, account lockout via OTP cap, enumeration-resistant login responses |
| A08 Software/Data Integrity Failures | Server-side re-grading (see above) is the primary instance of this category in this app |
| A09 Security Logging & Monitoring Failures | Structured logging with a `security` category, though coverage isn't 100% of every possible security-relevant event — see `docs/MAINTENANCE.md` |
| A10 Server-Side Request Forgery | `isImageDataUri()` closes the one plausible SSRF vector (Cloudinary's URL-accepting upload API) |

## Security checklist (for new code)

- [ ] Does this endpoint need `auth`? If it touches any user-specific or admin data, yes.
- [ ] Does it need `teacherOnly`/`adminOnly`, and did you pick the right one (destructive/financial/role-changing → `adminOnly`)?
- [ ] If it fetches/mutates a specific resource by ID, does the query filter by ownership (`{_id, userId: req.user._id}`), not just fetch-then-check?
- [ ] If it accepts a search string, does it go through `escapeRegex` before reaching a `$regex` filter?
- [ ] If it renders user/admin-controlled text into HTML (frontend) or an email body (backend), does it go through `escHtml`/`escapeHtml`?
- [ ] If it accepts a file upload, does it have both a MIME-type filter and a size limit, and does it exclude SVG for images?
- [ ] If it's AI-cost-incurring or brute-forceable, does it have a rate limiter, and does the limiter's `handler` log the rejection?
- [ ] If it logs anything, does the logged data avoid raw secrets/tokens (the logger's redaction is defense-in-depth, not a substitute for not logging secrets in the first place)?
- [ ] Does a new environment variable get added to `backend/.env.example` and documented in `docs/ENVIRONMENT_VARIABLES.md`?

## Secret rotation

Full step-by-step procedure, per secret, with verification steps: [`docs/RUNBOOK.md` §6](RUNBOOK.md#6-secret-rotation-procedure--read-this-section-first). Not duplicated here on purpose — that doc is the single source of truth for the *how*, and needs to be followed exactly as an ordered procedure, not summarized.
