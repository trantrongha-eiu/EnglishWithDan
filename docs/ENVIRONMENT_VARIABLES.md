# Environment Variable Reference — EnglishWithDan

Canonical source: `backend/.env.example` (18 variables). This doc explains
*what each one does and what breaks without it*; `backend/config/index.js`
shows exactly how each is read. Only the backend consumes environment
variables at runtime — the static public frontend and admin SPA call the
backend's public URL directly and have no env-driven configuration of their
own (see `docs/DEPLOYMENT.md` §4).

## CRITICAL: unrotated leaked secrets — active, unresolved risk

**`backend/.env` was committed to git history early in this project, and the
GitHub repository was public at the time.** As of the most recent check:

| Secret | Status |
|---|---|
| `JWT_SECRET` | **NOT rotated** — still byte-identical to the leaked value |
| `MONGO_URI` | **NOT rotated** — still byte-identical to the leaked value (this is the database password) |
| `CLOUDINARY_API_SECRET` | **NOT rotated** — still byte-identical to the leaked value |
| `OPENROUTER_API_KEY` | Rotated |

This is **not a resolved historical incident** — it is a live, unactioned
risk. Anyone who ever cloned the repository while it was public can, right
now, forge a valid JWT for any account (including admin) and has direct
read/write access to the production MongoDB database. This has been flagged
multiple times across this engagement without action. Do not treat this as
background noise in this table — it needs to be rotated.

**Full rotation procedure (step-by-step, per secret): see `docs/RUNBOOK.md`,
§6 "Secret Rotation Procedure — READ THIS SECTION FIRST".** This document
only tracks *which* variable does *what* and *current rotation status* — it
is not the how-to.

## How to read this table

- **Required** — the app will not function correctly (or will crash/misbehave)
  without it.
- **Optional** — the app boots fine without it; the dependent feature
  quietly disables itself. This codebase's pattern throughout is
  `if (process.env.X) { ... }` rather than throwing — `backend/config/index.js`
  deliberately does not add fail-fast validation on top of that (see its own
  header comment), so a misconfigured optional var fails silently, not loudly.

## Core

| Variable | Required? | Purpose | Used in | If missing |
|---|---|---|---|---|
| `PORT` | Optional (defaults to `5000`) | Port the Express server binds to | `backend/server.js`, `backend/config/index.js` | Falls back to 5000. On Render, the platform sets `PORT` itself — do not hardcode a different value in the dashboard. |
| `NODE_ENV` | Optional | Standard Node environment flag (`development`/`production`/`test`) | Read implicitly across the app (e.g. test harness sets `test`) | No explicit crash, but any environment-conditional behavior (e.g. verbose error output) may default to development-like behavior. Set to `production` on Render. |
| `MONGO_URI` | **Required** | MongoDB Atlas connection string — the only datastore this app has | `backend/server.js` (`mongoose.connect`), `backend/config/index.js` | App fails to connect to the database at startup; `mongoose.connect(...).catch()` logs `logger.error('startup', 'MongoDB initial connection failed', ...)` but the process does **not** exit — it stays up serving requests that will fail on any DB access, and `/health/ready` and `/health` will correctly report not-ready/degraded. **Currently an unrotated leaked secret — see warning above.** |
| `JWT_SECRET` | **Required** | Signs/verifies all auth JWTs | `backend/config/index.js`, auth middleware/controllers | Any code path that signs or verifies a JWT will throw at call time (not at boot) — effectively all login/session-protected functionality breaks. **Currently an unrotated leaked secret — see warning above.** |

## CORS / public URLs

| Variable | Required? | Purpose | Used in | If missing |
|---|---|---|---|---|
| `FRONTEND_URL` | Optional | Comma-separated list of **additional** allowed CORS origins, appended to the hardcoded default allowlist | `backend/app.js` (`DEFAULT_ALLOWED_ORIGINS` + `envOrigins`) | Not fatal — the hardcoded defaults (`https://ieltsthayha.com`, `https://www.ieltsthayha.com`, `http://localhost:3000`, `http://localhost:5173`) still work. Only matters if you need an *extra* origin (e.g. a staging domain) to reach the API; without it, requests from that origin are rejected by CORS and logged via `logger.security('CORS: rejected origin', ...)`. |
| `BACKEND_URL` | Optional | Backend's own public URL | `backend/config/index.js` | Grouped/exposed via config but not load-bearing for any behavior found in `app.js`/`server.js` directly — mainly documentation/consistency value. |

## Cloudinary (file uploads — avatars, listening audio, images, PDFs)

| Variable | Required? | Purpose | Used in | If missing |
|---|---|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | Optional (but all three needed together) | Cloudinary account identifier | `backend/server.js` (`cloudinary.config`), `backend/services/cloudinaryService.js`, `backend/config/index.js` | Uploads fail. `GET /health` reports `dependencies.cloudinary: { status: 'not_configured' }` (checked via presence of this + `CLOUDINARY_API_KEY`) rather than attempting a live ping. |
| `CLOUDINARY_API_KEY` | Optional (see above) | Cloudinary auth | same as above | Same as above. |
| `CLOUDINARY_API_SECRET` | Optional (see above) | Cloudinary auth | same as above | Same as above. **Currently an unrotated leaked secret — see warning above.** |

## AI grading (optional — features degrade gracefully)

| Variable | Required? | Purpose | Used in | If missing |
|---|---|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini — AI essay/speaking/Task 2 grading | `backend/services/geminiService.js`, `backend/config/index.js` | AI grading features fail/are disabled at call time; failures are logged via `logger.ai(...)`. `GET /health` reports `dependencies.gemini` as `configured`/`not_configured` by **key presence only** — it deliberately never makes a live Gemini call (that costs money per call), so a present-but-invalid key will show as `configured` even though it doesn't actually work. |
| `ANTHROPIC_API_KEY` | Optional | Anthropic API access (secondary/alternate AI provider) | `backend/config/index.js` | Whatever feature routes through this provider is disabled/fails. |
| `OPENROUTER_API_KEY` | Optional | OpenRouter API access (alternate AI provider) | `backend/server.js` (startup log), `backend/config/index.js` | Disabled/fails for whatever routes through it. This is the one secret in this table that **has** been rotated. |
| `GROQ_API_KEY` | Optional | Groq API access (alternate AI provider) | `backend/config/index.js` | Disabled/fails for whatever routes through it. |

## Google OAuth login (optional)

| Variable | Required? | Purpose | Used in | If missing |
|---|---|---|---|---|
| `GOOGLE_CLIENT_ID` | Optional | Enables Passport Google OAuth strategy | `backend/server.js` (conditionally initializes `passport`), `backend/config/index.js` | "Sign in with Google" is unavailable; email/password login is unaffected. `GET /health` reports `dependencies.googleOAuth` as `configured`/`not_configured` by presence of this variable. |
| `GOOGLE_CLIENT_SECRET` | Optional (paired with above) | Google OAuth client secret | `backend/config/index.js` | Same as above. |

## Email (password-reset OTP, grading notifications)

| Variable | Required? | Purpose | Used in | If missing |
|---|---|---|---|---|
| `EMAIL_USER` | Optional (one of `EMAIL_USER`/`RESEND_API_KEY` needed for email to actually send) | Gmail SMTP account (via nodemailer) for outbound email | `backend/server.js` (startup log), `backend/config/index.js` | Forgot-password OTP emails and grading-complete notifications are not delivered. `GET /health` reports `dependencies.email` as `configured` if either this or `RESEND_API_KEY` is set. |
| `EMAIL_PASS` | Optional (paired with `EMAIL_USER`) | Gmail SMTP app password | `backend/config/index.js` | Same as above. |
| `RESEND_API_KEY` | Optional (alternate to `EMAIL_USER`/`EMAIL_PASS`) | Resend transactional-email API | `backend/config/index.js` | Same as above if neither email path is configured. |

## Known dependency risk affecting the email path

`nodemailer` (used for the `EMAIL_USER`/`EMAIL_PASS` SMTP path) is pinned at
`6.10.1`, which has multiple HIGH-severity CVEs (including SMTP/CRLF
injection). Fixing this requires a breaking major-version upgrade to `9.x`
that was deliberately not auto-applied — it needs human review/testing of
the email-sending code paths first. See `docs/RUNBOOK.md` §7 "Known
operational risks" for tracking status; run `npm audit` in `backend/` for
current detail.
