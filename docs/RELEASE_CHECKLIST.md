# Release Checklist — EnglishWithDan

A practical checklist for shipping a change to production. Copy this into
your PR/release notes and check items off as you go — skip only what
genuinely doesn't apply (e.g. no E2E run needed for a backend-only bugfix
with no UI surface), and say so rather than silently omitting it.

## Pre-release

- [ ] Run the full test suite from repo root: `npm test` (runs backend
      Jest ~365 tests, frontend Jest/jsdom 93 tests, admin Vitest 43 tests —
      all against in-memory MongoDB / mocked externals, never production
      data). All three must pass.
- [ ] If the change touches any HTML page, frontend JS, or the admin SPA UI,
      run the E2E suite: `npm run test:e2e` from repo root. This needs a
      locally-served static frontend first — see `playwright.config.js`'s
      header comment for exact commands (`npx http-server frontend -p 3000`,
      optionally `cd backend && npm start`, then `npm run test:e2e`; override
      the target with `E2E_BASE_URL=...` if needed).
- [ ] If `admin-src/` changed, rebuild it and commit the output:
      `cd admin-src && npm run build` — output goes to `frontend/admin/`
      (tracked in git, not gitignored) and must be committed like any other
      file. See `docs/DEPLOYMENT.md` §4.
- [ ] Push/open the PR and confirm `.github/workflows/ci.yml` is green —
      backend, frontend, admin, and deployment-validation jobs all pass.
      (Backend lint is non-blocking by design; the other three jobs are not.)
- [ ] Review the full diff for accidentally committed secrets — API keys,
      `.env` contents, tokens, connection strings pasted into code or test
      fixtures. This repo has an existing unresolved secret-leak incident
      (see `docs/ENVIRONMENT_VARIABLES.md`'s top warning and
      `docs/RUNBOOK.md` §6) — do not add to it.
- [ ] If this change adds, removes, or renames an environment variable,
      confirm `backend/.env.example` is updated to match, and that
      `docs/ENVIRONMENT_VARIABLES.md` reflects the change (required/optional
      status, purpose, what breaks if missing).
- [ ] If this change adds a new third-party integration or dependency,
      confirm it degrades gracefully if unconfigured (matches this
      codebase's existing pattern — see `backend/config/index.js`'s header
      comment) rather than crashing the app at startup.
- [ ] Sanity-check any new/changed Mongo query or index usage — no migration
      tooling exists in this repo, so schema-affecting changes need manual
      verification against real data shape before merge.

## Release

- [ ] Merge to the branch Render auto-deploys from (`main`, per
      `.github/workflows/ci.yml`'s trigger). Render deploys automatically
      on push — there is no manual "deploy" step in this repo (no
      `render.yaml`, no CI deploy job). See `docs/DEPLOYMENT.md` for the
      full mechanics.
    - [ ] Backend deploy: confirm on the Render dashboard that the Web
          Service picked up the new commit and the build/start succeeded.
    - [ ] Frontend/admin deploy (only relevant if `frontend/` or
          `frontend/admin/` changed): confirm the static site deploy
          succeeded.
- [ ] Watch the Render dashboard build/deploy logs live for the backend
      service until you see the `logger.startup('Server running on port
      ...')` line — confirms the new instance actually came up, not just
      that the build finished.

## Post-release verification

- [ ] Hit `GET /health` on the live backend URL
      (`https://englishwithdan.onrender.com/health`). Confirm:
    - [ ] Top-level `status: 'ok'` (not `degraded`).
    - [ ] `dependencies.database.status: 'ok'`.
    - [ ] `dependencies.cloudinary.status` is `ok` or `not_configured` — not
          `error`.
    - [ ] `dependencies.gemini`, `dependencies.googleOAuth`,
          `dependencies.email` show the expected `configured`/`not_configured`
          state for this environment (these are presence-checks only, not
          live calls — see `backend/routes/health.js`).
- [ ] Also confirm `GET /health/live` and `GET /health/ready` both respond
      200 — cheap extra confirmation that liveness and DB-readiness are both
      fine, not just the detailed endpoint.
- [ ] Spot-check 2–3 critical user flows manually against the live site, not
      just automated tests against a mocked backend:
    - [ ] Log in with an existing account (email/password).
    - [ ] Log in / register via Google OAuth, if that's configured in this
          environment and touched by the release.
    - [ ] Exercise one core practice feature end-to-end relevant to the
          change (e.g. submit a reading/listening test, submit a Task 1/Task 2
          writing attempt, or a speaking attempt) and confirm it completes
          and, where applicable, grading/AI feedback returns.
    - [ ] If the release touched the admin panel, log into `/admin/` and
          check the specific screen that changed.
- [ ] Watch logs for the first few minutes after deploy for unexpected
      entries. All logs are structured JSON via `backend/utils/logger.js`
      (see `docs/RUNBOOK.md` §3 for the full category table); pay particular
      attention to:
    - [ ] `category: "error"` lines you don't recognize as pre-existing/expected.
    - [ ] `category: "security"` (`logger.security`) — CORS origin
          rejections; a spike right after deploy could mean a frontend
          origin/URL mismatch.
    - [ ] `category: "database"` errors (`logger.dbError`) — connection
          drops or reconnects.
    - [ ] `category: "ai"` (`logger.ai`) — Gemini call failures or JSON-parse
          failures during grading.
    - [ ] `category: "auth"` (`logger.auth`) — an unexpected spike could
          indicate a broken login flow, not just normal banned-user/bad-OTP
          noise.
    - [ ] `category: "process"` — `unhandledRejection` entries here do
          **not** crash the process (deliberate tradeoff, see
          `docs/RUNBOOK.md` §5) and so won't page anyone; treat any new one
          appearing right after this deploy as a lead worth investigating,
          not noise.
- [ ] Confirm no spike in 5xx responses following the deploy (via Render's
      own metrics/logs, or your monitoring of choice if one is wired up).
- [ ] If anything above fails: see `docs/DEPLOYMENT.md` §5 (roll back by
      reverting the commit and pushing) and `docs/RUNBOOK.md` /
      `docs/INCIDENT_RESPONSE.md` for the relevant playbook.

## After release

- [ ] Update any release/changelog tracking your team keeps (not automated
      by anything in this repo).
- [ ] If this release included a secret rotation (see the still-open item in
      `docs/RUNBOOK.md` §6), confirm it's checked off there and not just
      here.
