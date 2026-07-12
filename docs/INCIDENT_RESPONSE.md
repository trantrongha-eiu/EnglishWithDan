# Incident Response — EnglishWithDan

Practical guide for responding to production incidents. Pairs with
`docs/RUNBOOK.md` (routine operations, and the detailed Secret Rotation
procedure this doc points to repeatedly) and `docs/BACKUP_RESTORE.md`
(recovery mechanics if data or infrastructure is lost).

## 1. Severity classification

| Severity | Definition | Examples |
|---|---|---|
| **Critical** | Data breach, full site outage, or compromised secrets | Confirmed unauthorized DB access; JWT/DB credential compromise; site fully unreachable |
| **High** | Degraded but partially functional; a core flow is broken for most/all users | `/health` reporting `degraded`; login broken; AI grading down for an extended period during peak use |
| **Medium** | A non-core feature is broken, or a core feature is broken for a subset of users | Cloudinary uploads failing while everything else works; one exam module misbehaving |
| **Low** | Cosmetic, self-recovering, or already handled gracefully by the app | A single AI grading request timing out (the app already shows a friendly "AI overloaded, try again" message) |

**Standing Critical-severity item, independent of any new trigger:** this
system's `JWT_SECRET`, `MONGO_URI`, and `CLOUDINARY_API_SECRET` are
currently confirmed unrotated despite having leaked via a formerly-public
GitHub repo's git history. This is treated as an active Critical incident
in this document, not a hypothetical scenario — see §3.1.

## 2. General response process

1. **Detect** — via `/health*` endpoints, Render's own alerting/logs, or a
   user report.
2. **Assess** — determine severity (table above), scope (all users? a
   subset? one feature?), and whether data integrity/confidentiality is at
   risk.
3. **Contain** — stop active harm first: this can mean rotating a secret,
   banning an account, rolling back a deploy, or disabling a feature —
   before root-causing it fully.
4. **Communicate** — even a one-line internal note ("investigating login
   issues, will update in 30 min") beats silence; this is a small team/app
   but user trust still matters, especially for anything touching account
   security.
5. **Resolve** — fix the root cause, not just the symptom.
6. **Postmortem** — write down what happened, why, and what changes (code,
   process, or monitoring) would have caught it sooner or prevented it.
   For this codebase specifically, add a line to `docs/RUNBOOK.md`'s
   "known operational risks" if the incident reveals a new one.

---

## 3. Playbooks

### 3.1 Suspected credential/secret compromise

**Run this playbook now, even without a new trigger.** The precondition
for this playbook — `JWT_SECRET`, `MONGO_URI`, and `CLOUDINARY_API_SECRET`
being leaked and unrotated — is a **currently true fact about this
system**, confirmed as of the most recent check. Every day this stays
unrotated is a day any past clone of the (formerly public) repo has live
admin-equivalent access to the database and can forge tokens for any user.

Checklist:
1. Treat as Critical severity immediately — this is not a "monitor and
   see" situation.
2. Go to `docs/RUNBOOK.md` §6 (Secret Rotation Procedure) and execute it
   in full: `JWT_SECRET` first (invalidates forged tokens immediately),
   then `MONGO_URI` (revokes leaked DB access), then
   `CLOUDINARY_API_SECRET`, then `GOOGLE_CLIENT_SECRET` if Google OAuth is
   in use.
3. If this playbook is being run because of a *newly observed* suspicious
   event (not just as the standing precondition), additionally:
   - Check `auth`-category logs for unexpected patterns (see
     `docs/RUNBOOK.md` §3) — banned-user access attempts, unusual OTP
     failure volume.
   - Check the `users` collection (via admin panel or, if admin access
     itself is untrusted, directly via MongoDB Atlas) for unexpected role
     changes, new admin accounts, or unfamiliar accounts created around the
     suspected compromise time.
   - Check Cloudinary's media library / usage dashboard for unexpected
     uploads or deletions if `CLOUDINARY_API_SECRET` compromise is in
     scope.
4. After rotation, verify per `docs/RUNBOOK.md` §6.5.
5. Postmortem note: since this specific leak (committed `.env`, public
   repo) is already a known, long-standing item, the postmortem for this
   playbook should focus on *why rotation didn't happen sooner* despite
   being flagged multiple times, and what process change (e.g. a recurring
   check, an owner assigned, a deadline) prevents that recurring.

### 3.2 Site/API down

1. Check `GET /health/live` first — no dependencies, fastest signal of
   whether the process itself is up.
   - No response / connection refused / timeout → the process or the
     Render service itself is down. Check the Render dashboard for the
     service's deploy status and recent deploy/crash events.
   - Responds `{status:'ok'}` → the process is alive; the "down" symptom is
     more specific than a full outage — check `/health/ready` and
     `/health` next, and check whether it's actually a frontend-serving or
     DNS/CORS issue rather than the API itself (verify by hitting an API
     endpoint directly, not just loading the site).
2. Check `GET /health/ready` — 503 here narrows it to a database
   connectivity problem (go to §3.3).
3. Check the Render dashboard directly: is the service showing as
   "live," "deploying," "crashed," or suspended? Render sends `SIGTERM` on
   every deploy — a deploy in progress is expected brief unavailability
   during the swap, not an incident, provided the graceful-shutdown
   sequence (`docs/RUNBOOK.md` §5) completes normally.
4. Check the MongoDB Atlas status page
   (status.mongodb.com) for a platform-wide Atlas incident independent of
   this app.
5. Check recent commits/deploys — a bad deploy is the most common cause of
   a sudden full outage in a small app like this. If a recent deploy is the
   suspect, redeploying the last known-good commit via Render (Manual
   Deploy → select a previous commit) is a valid immediate containment
   step even before root-causing the bad deploy.
6. Check `unhandled` and `process` category logs (`docs/RUNBOOK.md` §3) for
   a crash loop — repeated `uncaughtException` entries close together mean
   the process is restarting and immediately crashing again on the same
   bug.

### 3.3 Database connectivity issues

`GET /health/ready` returning **503** (`database: 'disconnected'`) means
`mongoose.connection.readyState !== 1` — the app cannot serve nearly any
request, since almost every route touches the database.

1. Confirm with `GET /health` — its database check is a *live ping*
   (`mongoose.connection.db.admin().ping()`), which distinguishes "actually
   unresponsive" from "readyState briefly stale." If `/health`'s
   `dependencies.database.message` has a specific driver error, that's the
   fastest lead.
2. Check `database`-category logs (`docs/RUNBOOK.md` §3) —
   `backend/server.js` logs `error`/`disconnected`/`reconnected` events for
   the connection's entire lifetime, not just the initial connect, so the
   log history should show when it dropped and whether it's cycling.
3. Check MongoDB Atlas dashboard: cluster status (paused? under
   maintenance?), any active alerts, and the Atlas status page for a
   platform incident.
4. Check whether `MONGO_URI` is still valid — if a database user's
   password was recently rotated (§3.1 / `docs/RUNBOOK.md` §6.2) without
   updating the Render env var in lockstep, this is a self-inflicted and
   very plausible cause. Cross-check timing against any recent rotation
   work.
5. Check Atlas's IP access list — if Render's egress IPs changed or the
   access list was tightened, new connections would be rejected. (This app
   currently has no code-level retry/backoff visibility beyond mongoose's
   own driver behavior and the `error`/`disconnected`/`reconnected`
   listeners in `backend/server.js`.)
6. Once resolved, confirm recovery via `/health/ready` returning 200
   before considering the incident closed — a "looks reconnected" log line
   isn't sufficient confirmation on its own.

### 3.4 Suspicious admin activity / possible account takeover

1. **Read this first, it changes how you investigate:** because
   `JWT_SECRET` is currently unrotated and confirmed leaked (§3.1), **any
   admin action observed right now cannot be fully trusted to have been
   performed by the real admin it appears to be from** — a JWT claiming to
   be that admin could have been forged by anyone who ever cloned the
   formerly-public repo. Standard "check if the admin's account was
   phished" reasoning is insufficient here; the attacker doesn't need the
   admin's password or session at all.
2. Given that, the *first* action for any suspicious admin activity right
   now is the same as §3.1: rotate `JWT_SECRET` immediately
   (`docs/RUNBOOK.md` §6.1). This invalidates every outstanding token,
   forged or legitimate, and is the only way to be sure the next admin
   action you observe is actually from someone who just freshly
   authenticated with a real password.
3. After rotation, investigate the specific suspicious activity:
   - Review what changed — role changes, user bans/unbans, deleted
     content — via the admin panel's own data (user list sorted by
     `updatedAt` if visible, or directly in MongoDB Atlas) and cross-check
     against `auth`-category logs for context.
   - `PUT /api/admin/users/:id` and `/ban` are the two role/ban-affecting
     endpoints (`backend/routes/admin/users.js`) — both are `adminOnly`.
     If a non-trusted role change is found (e.g. an unexpected promotion
     to `admin`), reverse it and treat any account touched by it as
     suspect too.
   - Check for newly created admin/teacher accounts (`POST
     /api/admin/users`) around the suspicious window.
4. Once `JWT_SECRET` is rotated and the specific suspicious change is
   reversed/confirmed benign, this collapses back into the standard §3.1
   flow for the remaining secrets (`MONGO_URI`, `CLOUDINARY_API_SECRET`) —
   finish that rotation too, since a forged-admin-JWT incident and a
   leaked-DB-credential incident share the same root cause here.

### 3.5 AI (Gemini) service failures

**Severity: Low, by design — this is not an outage.** `backend/services/geminiService.js`'s
`classifyGeminiError()` already detects quota/overload conditions (HTTP
503/429, or messages containing "overloaded", "resource_exhausted",
"quota", "unavailable", "too many") and converts them into a friendly,
non-crashing response — the grading UI shows an "AI is overloaded, please
try again shortly" style message rather than an error page. A 45-second
(essay) / 30-second (speaking, Task 2) timeout via `withTimeout()` also
guards against a hung Gemini call holding a request open indefinitely,
surfacing the same friendly overload message instead.

1. Confirm scope: is this a handful of failed grading attempts (expected,
   self-recovering — Gemini free/low tiers do rate-limit) or a sustained
   100%-failure rate over several minutes?
2. Check `ai`-category logs (`docs/RUNBOOK.md` §3) — each entry includes
   the Gemini error `status` and `message`, and distinguishes API errors
   from JSON-parse failures (the latter auto-retries once before giving up
   and logging).
3. If sustained: check `GET /health` — `dependencies.gemini.status` only
   reports key *presence*, not liveness, so it won't confirm/deny a live
   outage. Check Gemini/Google AI Studio's own status page, and confirm
   `GEMINI_API_KEY` hasn't expired or hit a billing/quota wall on the
   Google Cloud/AI Studio console.
4. No user data is at risk and no other part of the app is affected — this
   only touches essay/speaking/Task 2 AI grading. Communicate as a
   temporary degradation if sustained, not an outage.

### 3.6 Rate-limit / abuse spike

Login, register, forgot-password, verify-OTP, and reset-password are all
rate-limited via `express-rate-limit` in `backend/routes/auth.js`, keyed by
**IP + the account identifier being targeted** (so one attacker can't spray
many accounts from one IP, and one IP isn't fully blocked just because
several legitimate users share it, e.g. an office network). Current limits
(15-minute window each): login 10, register 5, forgot-password 5,
verify-OTP 10, reset-password 10 attempts.

1. If legitimate users are hitting 429s unexpectedly, or conversely if
   brute-force traffic seems to be getting through unthrottled, **the
   first thing to check is `trust proxy`** in `backend/app.js`:
   `app.set('trust proxy', 1)`. Render sits behind exactly one reverse-proxy
   hop, so this must stay `1` (trust exactly one hop's `X-Forwarded-For`
   entry). If this were ever changed to `true`, it would trust every hop
   including client-supplied `X-Forwarded-For` values, letting an attacker
   spoof a fresh apparent IP on every request and bypass the per-IP
   component of rate limiting entirely. If it were removed/set to `false`
   or `0`, every request would appear to come from Render's internal proxy
   IP, collapsing the rate limiter onto one shared bucket for the whole
   site (legitimate users would get 429s from each other's traffic).
   **Verify it reads exactly `app.set('trust proxy', 1)`** — this is a
   one-line but load-bearing config, not something that should change
   without deliberate review.
2. Check `security`-category logs for a spike in CORS rejections
   (`backend/app.js`'s CORS `origin` callback logs every rejected origin)
   — a spike here can indicate scripted abuse from unexpected origins, or
   a legitimate misconfiguration if a valid frontend origin is being
   rejected (e.g. after adding a new domain without updating
   `FRONTEND_URL`/the allowlist).
3. Check `auth`-category logs for volume of banned-user attempts and wrong-OTP
   guesses — both are logged specifically because they're operationally
   meaningful signals distinct from routine 401s (which are deliberately
   not logged to avoid noise).
4. If a genuine abuse spike is confirmed and outside the built-in rate
   limiter's coverage (e.g. hammering a non-auth endpoint), consider
   temporary mitigations at the Render/DNS level (if available on the
   plan) in addition to any application-level fix.
