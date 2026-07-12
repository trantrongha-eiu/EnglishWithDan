# Production Runbook — EnglishWithDan

Operational reference for running and maintaining the live system. If you're
here because something is on fire, you may want `docs/INCIDENT_RESPONSE.md`
instead — this doc is for routine operations and the (currently very
urgent) secret rotation procedure.

## 1. System overview

EnglishWithDan is an IELTS exam-preparation platform. It has three
deployable pieces: (1) a Node.js/Express API (`backend/`, entry point
`backend/server.js`) that serves all business logic and is the only piece
with a database connection; (2) a vanilla-JS public frontend (`frontend/*.html`,
no build step — served as static files); (3) a React admin SPA
(`admin-src/`), built with Vite into `frontend/admin/` and served as static
files alongside the public frontend. The backend depends on MongoDB Atlas
(cloud-hosted, connection string `MONGO_URI`) as its primary datastore, and
optionally on Cloudinary (file/image/audio storage), Google Gemini (AI
essay/speaking grading), Google OAuth (social login), and an email provider
(password-reset OTP delivery) — all of these optional integrations degrade
gracefully (feature disabled) rather than crashing the app when unconfigured.
Everything is deployed on Render (a PaaS that auto-deploys from git pushes).

## 2. How to check system health

Three unauthenticated endpoints exist for this (see `backend/routes/health.js`).
None of them ever return secret values or business data — safe to hit from
anywhere, including uptime monitors.

### `GET /health/live`
Liveness only — "is the process up at all." No dependency checks, cheap
enough to poll every few seconds. Returns `{ status: 'ok', uptimeSeconds }`.
This is the endpoint that should be configured as Render's own Health Check
Path. If this doesn't respond, the process itself is down or hung — see
INCIDENT_RESPONSE.md's "Site/API down" playbook.

### `GET /health/ready`
Readiness — "is the process ready to serve real traffic." Checks only
`mongoose.connection.readyState`. Returns `200 { status: 'ready', database: 'connected' }`
or **503** `{ status: 'not_ready', database: 'disconnected' }`. A 503 here
means the app is up but cannot serve any request that touches the database
(i.e., almost everything) — see INCIDENT_RESPONSE.md's "Database
connectivity issues" playbook.

### `GET /health`
Detailed status — uptime, memory (`rssMb`, `heapUsedMb`, `heapTotalMb`),
a **live** MongoDB ping (not just readyState — this catches a connection
that reports "connected" but is actually unresponsive), and a **live**
Cloudinary ping if Cloudinary credentials are configured. Gemini,
Google OAuth, and email are reported as **configuration presence only**
(`configured` / `not_configured`) — never a live call, since a live Gemini
call costs real money and this endpoint should be safe to poll periodically.
Returns HTTP 200 with `status: 'ok'` if every checked dependency is fine,
or **HTTP 503 with `status: 'degraded'`** if any checked dependency (database
or Cloudinary) failed its live check.

**If `/health` reports `degraded`:**
1. Look at `dependencies.database.status` and `dependencies.cloudinary.status`
   in the response body — the failing one will have `status: 'error'` and a
   `message` field with the underlying error.
2. If it's the database, go to the "Database connectivity issues" playbook
   in `docs/INCIDENT_RESPONSE.md`.
3. If it's Cloudinary, check the Cloudinary status page and dashboard —
   uploads/avatars/audio will fail while this is down, but the rest of the
   app (auth, reading/listening practice, admin panel for non-upload
   actions) keeps working normally. This is a partial-degradation
   incident, not a full outage.
4. `/health` does not check Gemini or email liveness by design — if AI
   grading or email delivery is failing, `/health` will still say `ok`.
   Diagnose those via the `ai` log category and by testing the specific
   feature (see INCIDENT_RESPONSE.md's "AI service failures" playbook).

## 3. How to read logs

All structured logging goes through `backend/utils/logger.js` (built this
phase). Every log line is a single JSON object with this shape:

```json
{"timestamp":"2026-07-11T03:14:00.000Z","level":"info","category":"startup","message":"Server running on port 5000"}
```

Fields: `timestamp` (ISO 8601), `level` (`info` / `warn` / `error`),
`category`, `message`, plus any extra metadata passed by the call site.
Any metadata key that looks sensitive (matches
`/pass(word)?|secret|token|jwt|otp|apikey|api_key|authorization/i`) is
automatically replaced with `"[redacted]"`, recursively through nested
objects — this is defense-in-depth in case a call site accidentally passes
something it shouldn't; it is not a substitute for not logging secrets in
the first place.

**Categories currently in active use:**

| Category | Emitted from | What it means |
|---|---|---|
| `startup` | `backend/server.js` | Boot sequence: DB connect, seed scripts, cron start, port bind |
| `shutdown` | `backend/server.js` | Graceful-shutdown sequence (see §5) |
| `database` | `backend/server.js`, `backend/routes/health.js` (via `logger.db`/`logger.dbError`) | Connect/disconnect/reconnect events, health-check ping failures |
| `ai` | `backend/services/geminiService.js` (via `logger.ai`) | Gemini API errors and JSON-parse failures during essay/speaking/Task 2 grading |
| `security` | `backend/app.js` | CORS origin rejections |
| `auth` | `backend/middleware/auth.js`, `backend/services/authService.js` (via `logger.auth`) | Banned-user login/request attempts, wrong password-reset OTP guesses |
| `unhandled` | `backend/middleware/errorHandler.js` | Any error reaching the global Express error handler — includes stack trace, HTTP method, and path |
| `process` | `backend/server.js` | `uncaughtException` and `unhandledRejection` events (see §5 — the latter does not crash the process, so this category should still be checked periodically even without an active incident) |

**Where to find them:** on Render, these are plain JSON lines in the
service's **Logs** tab. Render does not currently have a separate
log-aggregation/search tool wired up — searching means either using
Render's own log viewer's built-in text search, or streaming/filtering via
the Render CLI (`render logs`). Since every line is valid JSON, piping
through a tool like `jq` works if you export or stream the logs locally
(e.g. `render logs --tail | grep '"category":"ai"'` or through `jq
'select(.category=="ai")'`).

## 4. Common operational tasks

**Restart the service.** There is no in-app or CLI restart mechanism —
restart via the Render dashboard (Manual Deploy → "Deploy latest commit",
or the "Restart service" action if available on the plan). The app's
graceful-shutdown handler (`backend/server.js`) means a restart drains
in-flight requests, stops the tuition-reminder cron, and closes the MongoDB
connection cleanly before the process exits — see §5.

**Ban / unban a user.** Preferred: admin panel → Users → select user → Ban
toggle. Underlying API: `PUT /api/admin/users/:id/ban` (admin-only),
body `{ "isBanned": true, "banReason": "<text>" }` (or `isBanned: false`
to unban, which also clears `banReason`). Effect is immediate — a banned
user's existing valid JWT is rejected on their very next request (see
`backend/middleware/auth.js`), not just on next login. Banned-user login
attempts and rejected-token-due-to-ban events are logged under the `auth`
category.

**Promote / demote a role.** Preferred: admin panel → Users → edit user →
change role dropdown (`student` / `teacher` / `admin`). Underlying API:
`PUT /api/admin/users/:id` (admin-only), body includes `role: "teacher"` (etc.).
This same endpoint accepts a `newPassword` field to directly set a user's
password — see §6 (Secret Rotation) and the admin-recovery notes there for
why that matters operationally, not just for routine password resets.

**Check current dependency versions / vulnerabilities.** From `backend/`:
`npm audit`. See §7 for the current known state (11/12 patched, 1 open).

## 5. Graceful shutdown behavior (for context when restarting/redeploying)

From `backend/server.js`:
- **SIGTERM / SIGINT** (sent by Render on every deploy, manual restart, or
  scale event): stops accepting new HTTP connections, stops the
  tuition-reminder cron, closes the MongoDB connection, then exits. A
  10-second force-exit timer guards against anything hanging (a stuck
  connection or slow in-flight request) — if graceful shutdown doesn't
  finish in 10s, the process is force-killed with exit code 1 and an error
  log line.
- **`uncaughtException`**: logged with full stack trace under the `process`
  category, then the process exits immediately (`process.exit(1)`) so Render
  restarts a clean process rather than continuing to serve from a
  possibly-corrupted state.
- **`unhandledRejection`**: logged under the `process` category but
  **does not exit the process**. This is deliberate — the codebase has
  pre-existing fire-and-forget `.catch()` patterns elsewhere, and treating
  every unhandled rejection as fatal risked turning a previously-harmless
  one into a crash loop. **Operational implication:** if `process`-category
  `unhandledRejection` log lines start appearing in production, they will
  not page anyone via a crash — someone has to notice them in the logs and
  investigate as a real bug, since they don't self-announce via downtime.

## 6. Secret Rotation Procedure — READ THIS SECTION FIRST

**Current status: URGENT, not hypothetical.** This repository's
`backend/.env` was committed to git history early in the project and the
GitHub repo was public at the time. As of the most recent check, the
following secrets are **confirmed still byte-identical** to the values that
leaked:

- `JWT_SECRET` — **not rotated**
- `MONGO_URI` (contains the database password) — **not rotated**
- `CLOUDINARY_API_SECRET` — **not rotated**
- `OPENROUTER_API_KEY` — **has been rotated** (only one done so far)

This means, right now, without any further compromise needed: **anyone who
ever cloned the repo while it was public can forge a valid JWT for any
user, including any admin account**, and **has direct read/write access to
the production MongoDB database**. This has been flagged multiple times
across this engagement and has not yet been actioned. Treat this as an
active incident, not a backlog item — see `docs/INCIDENT_RESPONSE.md`'s
"Suspected credential/secret compromise" playbook, which explicitly says
this rotation should be run immediately regardless of whether a new
trigger event is observed.

The full list of every environment variable that needs a value (including
which are currently unrotated) is maintained in `docs/ENVIRONMENT_VARIABLES.md`
and `backend/.env.example` — use those as the checklist; this section
describes *how* to rotate each one.

> The exact menu wording below is a best-effort description of each
> platform's standard flow, written without live access to confirm current
> UI labels — verify against the actual dashboard as you go; the sequence
> of steps (find the credential, regenerate it, update the value everywhere
> it's used, redeploy, verify) is what matters, not the precise button text.

### 6.1 Rotate `JWT_SECRET` (highest priority — invalidates all forged tokens)
1. Generate a new high-entropy secret, e.g.:
   `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
2. Render dashboard → the backend service → **Environment** tab → update
   `JWT_SECRET` to the new value → save.
3. Trigger a redeploy (Render typically redeploys automatically on an env
   var change; if not, Manual Deploy → Deploy latest commit).
4. **Effect:** every previously-issued JWT — including any forged from the
   leaked secret — becomes invalid immediately. All legitimate users will
   be signed out and need to log in again. This is expected and correct.
5. Verify: hit `/health/live` to confirm the service came back up, then
   confirm a fresh login issues a working token and an old token (if you
   have one saved) is now rejected with 401.

### 6.2 Rotate `MONGO_URI` (database user password)
1. MongoDB Atlas dashboard → the project/cluster → **Database Access**.
2. Find the database user currently used in the connection string → Edit →
   generate/set a new password (Atlas can auto-generate a strong one).
3. Build the new full connection string with the new password (same
   cluster host, same database name — only the credential changes).
4. Render dashboard → Environment tab → update `MONGO_URI` → save → redeploy.
5. Verify via `/health` — `dependencies.database.status` should be `ok`
   (this is a *live* ping, so it directly confirms the new credential works).
6. Once confirmed, if Atlas shows the old password/user as still listed
   separately (i.e. you created a new user rather than rotating the
   existing one's password), delete the old database user so the leaked
   credential stops working entirely.

### 6.3 Rotate `CLOUDINARY_API_SECRET`
1. Cloudinary dashboard → **Settings** → **Security** (or **API Keys**) →
   regenerate the API secret for the account/key in use.
2. Render dashboard → Environment tab → update `CLOUDINARY_API_SECRET` →
   save → redeploy.
3. Verify via `/health` — `dependencies.cloudinary.status` should be `ok`
   if `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY` are also configured
   (this is a live `cloudinary.api.ping()` call).
4. Spot-check an actual upload flow (e.g. avatar upload, or an admin
   content upload with an inline image) to confirm writes still work, not
   just the ping.

### 6.4 Rotate `GOOGLE_CLIENT_SECRET` (if Google OAuth is in use)
1. Google Cloud Console → **APIs & Services** → **Credentials** → select
   the OAuth 2.0 Client ID in use → regenerate/reset the client secret.
2. Render dashboard → Environment tab → update `GOOGLE_CLIENT_SECRET` →
   save → redeploy.
3. Verify by completing a "Sign in with Google" flow end-to-end.

### 6.5 After rotating all of the above
- Confirm each one individually via `/health` (database, cloudinary) and a
  manual functional check (login for JWT, Google sign-in for OAuth).
- Update whatever secure record the team keeps of current secret values
  (see the "no config backup" gap noted in `docs/BACKUP_RESTORE.md` — if
  no such record exists yet, this rotation is a good moment to start one
  in a password manager or secrets vault).
- Consider whether the git history itself should be scrubbed/rewritten or
  the repo's visibility permanently locked down, separately from rotating
  the values — rotation neutralizes the leaked values but does not remove
  them from history.

## 7. Known operational risks

- **`JWT_SECRET`, `MONGO_URI`, `CLOUDINARY_API_SECRET` are unrotated
  despite being leaked via git history in a formerly-public repo.** This is
  the single most important open risk in the system — see §6 above.
  `OPENROUTER_API_KEY` has already been rotated as a partial start.
- **`nodemailer` 6.10.1 has multiple HIGH-severity CVEs** (SMTP/CRLF
  injection). Fixable only via a breaking major-version upgrade to 9.x,
  which was deliberately not auto-applied this phase — it needs human
  review/testing of the email-sending code path (password-reset OTP,
  writing-graded notifications) before upgrading. Tracked as an open item;
  run `npm audit` in `backend/` to see current detail.
- 11 of 12 previously-known dependency vulnerabilities were patched this
  phase (mongoose, multer, lodash, minimatch, path-to-regexp, picomatch,
  qs, uuid, brace-expansion) via non-breaking updates. `nodemailer` above is
  the one remaining.
- **Confirmed mongoose deprecation warning**, observed directly in test
  output after this phase's dependency patching:
  ```
  [MONGOOSE] Warning: mongoose: the `new` option for findOneAndUpdate()
  and findOneAndReplace() is deprecated. Use `returnDocument: 'after'` instead.
  ```
  This fires from the `{ new: true }` option pattern used across several
  `findOneAndUpdate`/`findByIdAndUpdate` calls (e.g.
  `backend/routes/admin/users.js`). It's a warning, not a failure — every
  test still passes and behavior is unchanged — but it's a real signal
  that a future mongoose major version may remove the `new` option
  entirely. Low priority; a mechanical find-and-replace across the
  affected call sites (swap `{ new: true }` for `{ returnDocument: 'after' }`,
  verifying each site's return-value shape didn't change) is a reasonable
  follow-up, not urgent.
