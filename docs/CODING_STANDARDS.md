# Coding Standards

The conventions this codebase actually follows, read from the real code — not an idealized style guide. Where the codebase is inconsistent about something, that's stated explicitly below rather than papered over. When in doubt for new code, match the pattern used by the newest/cleanest example cited in each section, not the oldest one.

## Table of contents
- [Naming conventions](#naming-conventions)
- [Folder conventions](#folder-conventions)
- [Service architecture](#service-architecture)
- [Controller responsibilities](#controller-responsibilities)
- [Error handling](#error-handling)
- [Logging conventions](#logging-conventions)
- [Testing conventions](#testing-conventions)

## Naming conventions

| What | Convention | Example |
|---|---|---|
| Backend route file | `camelCase.js`, matches the API resource | `backend/routes/writingPractice.js` |
| Backend controller file | `camelCase.controller.js` | `backend/controllers/speaking.controller.js` |
| Backend service file | `camelCaseService.js` | `backend/services/courseService.js` |
| Backend model file | `PascalCase.js`, singular noun, matches `mongoose.model('Name', ...)` | `backend/models/SpeakingAttempt.js` → `mongoose.model('SpeakingAttempt', ...)` |
| Admin route sub-file | `camelCase.js` under `routes/admin/` | `backend/routes/admin/writingGrading.js` |
| React page component | `PascalCase.jsx`, one per admin screen, matches the exported component name | `admin-src/src/pages/WritingGrades.jsx` |
| React shared component | `PascalCase.jsx` under `components/` | `admin-src/src/components/Pagination.jsx` |
| React context | `PascalCase` + `Context.jsx`, exports a `XxxProvider` and a `useXxx()` hook | `admin-src/src/contexts/ToastContext.jsx` → `ToastProvider`, `useToast()` |
| Public frontend page | `kebab-case.html` or flat lowercase, one file per page | `frontend/task2-template.html` |
| Public frontend shared script | `kebab-case.js` under `js/shared/`, IIFE attaching to `window` | `frontend/js/shared/auth-service.js` → `window.AuthService` |
| Public frontend page script | matches the HTML file's basename | `frontend/writing.html` ↔ `frontend/js/writing.js` |
| Variables/functions (JS everywhere) | `camelCase`; async functions are not specially prefixed (no `fetchX`/`getXAsync` convention — plain `getX`, `listX`, `createX`, `updateX`, `deleteX`) | `listActiveCourses`, `saveAttempt`, `gradeSpeaking` |

**Test file naming/location is genuinely inconsistent across the three codebases, on purpose (each followed its own test-runner's idiom, not unified):**
- `admin-src/`: co-located, `Component.test.jsx` next to `Component.jsx` (e.g. `admin-src/src/components/Pagination.jsx` + `Pagination.test.jsx` in the same folder).
- `backend/`: a fully separate tree, `backend/tests/{unit,integration,security}/...test.js`, mirroring the source structure but not sitting next to it (e.g. `backend/services/courseService.js` is tested by `backend/tests/unit/services/courseService.test.js`).
- `frontend/`: also a separate tree, `frontend/tests/shared/...test.js`, testing `frontend/js/shared/*.js` only — the page-specific scripts (`js/dashboard.js` etc.) have no test coverage at all.

Don't try to unify these — match whichever pattern the code you're adding to already uses.

## Folder conventions

The full directory tree and what lives where is documented once, in [`docs/ARCHITECTURE.md`](ARCHITECTURE.md#backend-architecture) (backend) and its [Admin architecture](ARCHITECTURE.md#admin-architecture-react-spa) / [Frontend architecture](ARCHITECTURE.md#frontend-architecture-public-site) sections — this section is just the placement *rules*, not a restated tree:

- A new backend business-logic function goes in `backend/services/`, in the existing service file for its domain if one exists, otherwise a new `xxxService.js`.
- A new **admin-only** route goes in `backend/routes/admin/`, in the existing domain file if one exists, otherwise a new file that **must be mounted** in `backend/routes/admin/index.js` (a route file that isn't `router.use()`'d there is dead code — nothing wires up `routes/admin/*.js` automatically).
- A new **public/student-facing** route goes in `backend/routes/`, and **must be mounted** in `backend/server.js`/`app.js` the same way (check an existing `app.use('/api/...', require('./routes/...'))` line for the pattern).
- A new admin screen goes in `admin-src/src/pages/` and **must be added to the router** in `admin-src/src/App.jsx` (a page component that isn't in a `<Route>` is unreachable).
- A new **genuinely shared, reusable** admin UI piece goes in `admin-src/src/components/`. Most admin pages build their own tables/forms inline rather than through a shared `Table` component — there isn't one (see `docs/ARCHITECTURE.md`) — so don't assume a shared primitive exists before checking.
- A new public frontend page is a new `frontend/*.html` file; a script shared across ≥2 pages goes in `frontend/js/shared/`, a script used by only one page goes in `frontend/js/` named after that page.

## Service architecture

Layering (routes → controllers → services → models) is documented in full in [`docs/ARCHITECTURE.md`](ARCHITECTURE.md#backend-architecture) — this section goes one level deeper, into how services are actually *shaped* internally.

**Every one of the 20 files in `backend/services/` uses the same internal shape, with zero exceptions found**: a set of plain, individually-declared `async function xxx(...)` (or occasionally non-async, e.g. `geminiService.js`'s `classifyGeminiError`) at module scope, collected into a single `module.exports = { a, b, c }` object literal at the bottom of the file. There is no service that exports a class, a singleton object built with `module.exports = { async a() {...}, async b() {...} }` inline, or a default export. If you're adding a function to an existing service, add another named function and add it to the closing `module.exports` list; if you're creating a new service, start from `backend/services/courseService.js` (nine lines, one function) as the minimal shape or `backend/services/speakingService.js` for a slightly fuller one.

**Third-party access is wrapped, not called raw — with two confirmed, narrow exceptions.** Every service and controller that needs Cloudinary goes through `backend/services/cloudinaryService.js` (`uploadImage`, `uploadBufferStream`, `uploadBufferAsDataUri`, `destroyAsset`, `ping`), and every AI call goes through `backend/services/geminiService.js` (`checkEssay`, `checkSpeaking`, `gradeT2Question`). The two exceptions, both real and both admin-only: `backend/routes/admin/_shared.js` has its own `uploadImageDataUri`/`uploadPdfBuffer` helpers that call `cloudinary.uploader.upload` directly (predates `cloudinaryService.js`, scoped to the admin route files that `require('./_shared')`), and `backend/routes/admin/writingGrading.js` builds its own IELTS band-descriptor prompt and calls `checkEssay` directly rather than going through a dedicated service function — both are known, bounded exceptions, not a pattern to imitate in a brand-new service. New code should call `cloudinaryService`/`geminiService`, never `require('cloudinary')` or `require('@google/genai')` directly outside those two wrapper files.

## Controller responsibilities

Per-layer responsibilities (what a controller must/must-not contain) are in [`docs/ARCHITECTURE.md`](ARCHITECTURE.md#backend-architecture)'s layering table. In practice, reading `speaking.controller.js`, `course.controller.js`, `auth.controller.js`, `vocab.controller.js`, and `listening.controller.js` side by side shows one consistent shape (pull fields off `req`, call one service function, shape the JSON response) wrapped in **two different, coexisting error-handling styles**:

1. **`catchAsync`-wrapped** (`backend/middleware/catchAsync.js`) — the handler is plain `async (req, res) => {...}` with no `try/catch` at all; a thrown error is caught by the wrapper, logged server-side, and turned into `{success:false, message:err.message}` at `err.statusCode || 500`. Used in exactly **4 of 17** controller files today: `user.controller.js`, `speaking.controller.js`, `tuition.controller.js`, `contact.controller.js`.
2. **Manual `try/catch`** — every other controller (13 of 17: `auth.controller.js`, `course.controller.js`, `vocab.controller.js`, `listening.controller.js`, `writing.controller.js`, etc.) writes its own `try { ... } catch (err) { res.status(...).json({success:false, message:...}) }` per handler, with the status code and message chosen per call site (400 for validation-shaped failures, 404 for not-found, 500 as the default) rather than a single convention.

**For new controller code, prefer `catchAsync`** — it removes the boilerplate and (unlike the manual style) actually logs the error server-side before responding, closing a real gap where most existing `catch` blocks never call `console.error`/`logger.error` at all. This is not a mandate to retrofit the other 13 files; that's explicitly out of scope (see [`docs/MAINTENANCE.md`](MAINTENANCE.md) for the tracked tech debt).

A recurring pattern worth copying regardless of which wrapper you use: services return a `{status: 'ok' | 'duplicate' | 'not_found' | ...}` shaped result for anything with more than one failure mode (see `authService.loginUser`, `vocabService.createUnit`), and the controller does a small if/else chain mapping each `status` to its HTTP response — this keeps the service framework-agnostic (no `res` reference inside it) while still letting the controller pick the exact status code/message per case.

## Error handling

Two patterns coexist in the codebase today, same as controllers:

1. **Manual, per-handler** — the overwhelming majority: `res.status(500).json({success: false, message: err.message})` (or a hardcoded Vietnamese message, or `err.statusCode || 500` for the few call sites that check it) written out at every catch block. This is what you'll see in nearly every route and controller file.
2. **`AppError` hierarchy** (`backend/errors/AppError.js`) — `NotFoundError` (404), `ValidationError` (400), `AuthenticationError` (401), `AuthorizationError` (403), `ExternalServiceError` (502, for Cloudinary/Gemini/email failures), `DatabaseError` (500). A service throws one of these instead of returning `null`/a status string, and the caller (or `catchAsync`, or the global `errorHandler`) reads `err.statusCode`/`err.isOperational` to shape the response. **Adoption today is narrow and illustrative, not systematic**: `backend/services/listeningService.js` (`getAdminTest`, `deleteAdminTestPermanent`) is the one real production use; `backend/middleware/errorHandler.js` and `backend/middleware/catchAsync.js` both honor `.statusCode`/`.isOperational` so the mechanism works end-to-end, but almost nothing else throws an `AppError` yet.

**For new code, prefer the `AppError` pattern**: have services `throw new NotFoundError('...')` etc. instead of returning `null` or a bespoke status string, and let `catchAsync` (or the global `errorHandler` if the route reaches it) turn that into the right HTTP response automatically. This is a recommendation for new code only — retrofitting the rest of the codebase onto `AppError` is explicitly out of scope for this phase (see [`docs/MAINTENANCE.md`](MAINTENANCE.md)'s tech debt section); both patterns will continue to coexist, and that's fine.

The global `errorHandler` (`backend/middleware/errorHandler.js`, registered last in `app.js`) is the backstop for anything that isn't caught locally — it never leaks a stack trace or raw error message to the client unless the error is `isOperational` (i.e. an `AppError`); everything else becomes a generic `"Lỗi server"` 500.

## Logging conventions

`backend/utils/logger.js` is structured JSON logging (one `console.log`/`console.error` JSON line per event) with categories `info`/`warn`/`error`/`security`/`startup`/`shutdown`/`ai`/`db`/`dbError`/`auth`, plus automatic redaction of sensitive-looking keys (password/secret/token/jwt/otp/apikey) and credential-shaped values (Mongo connection strings, `Bearer` tokens, JWTs, cloud API keys) even when embedded inside an otherwise-innocuous string like `err.message`.

It's used at specific, deliberately chosen high-value points, not universally:
- `logger.startup`/`logger.shutdown` — server lifecycle (`server.js`)
- `logger.security` — CORS rejections, rate-limit trips, admin role/ban/delete actions (an audit-trail requirement, see `backend/routes/admin/users.js`)
- `logger.auth` — wrong-password attempts, wrong-OTP guesses, login on a banned account
- `logger.ai` — Gemini API errors (status code + message) in `geminiService.js`
- `logger.db`/`logger.dbError` — MongoDB connection lifecycle

**The other ~70 `console.log`/`console.error` calls scattered across services, controllers, and routes were deliberately left as plain `console.*` in the phase that introduced the logger** — migrating all of them was judged disproportionate churn for a "preserve existing functionality" phase. See [`docs/MAINTENANCE.md`](MAINTENANCE.md)'s known-tech-debt section for the current state of that backlog.

For new code: use `logger.*` at genuinely operationally-significant points (anything security/auth/startup/shutdown/AI/DB-relevant, or anything an on-call person would want to grep for in Render's log viewer) — plain `console.error` inside a routine `catch` block for an ordinary request failure is still the norm and is fine to keep using; don't feel obligated to route every log line through the structured logger.

## Testing conventions

How to *run* any of the test suites — commands, watch mode, coverage, CI — is in [`docs/DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md#running-tests`); this section is only about where new tests go and what they mock.

**Backend** (`backend/tests/{unit,integration,security}/`):
- Unit tests target one service at a time (`backend/tests/unit/services/xxxService.test.js`) and build their fixtures via the shared factories in `backend/tests/factories/` (`userFactory.js` for `createStudent`/`createPremiumStudent`/`signTokenFor`, `contentFactory.js` for `createCourse`/`createPassage`/`createSpeakingQuestion`/etc.) rather than hand-rolling schema-shaped objects inline — add a new factory function there if you're testing a model that doesn't have one yet.
- All backend tests share one in-memory-MongoDB harness: `backend/tests/support/globalSetup.js` starts a single `mongodb-memory-server` instance for the whole run, and `backend/tests/support/setupTestDb.js` (imported per test file) connects that file to its own uniquely-named database within it, wiping collections in `afterEach` — this is why test files never see each other's data despite sharing one Mongo instance, and why no test needs its own manual cleanup logic beyond that shared harness.
- Integration tests (`backend/tests/integration/`) drive real HTTP requests against `app.js` via Supertest (`request(app).get(...)`), asserting on status code + response shape, auth/role gating, and ownership scoping (e.g. `backend/tests/integration/speaking.test.js`'s premium-gate and "only your own history" checks).
- Security tests (`backend/tests/security/`) are their own category — IDOR, role escalation, JWT tampering — separate from functional integration tests even though they also use Supertest.
- AI/Cloudinary calls are mocked at the SDK level (`backend/tests/unit/services/geminiService.test.js`, `cloudinaryService.test.js`) — never a real network call, never a real API key needed. A service that's a thin delegate to `geminiService` (e.g. `speakingService.gradeSpeaking`) is deliberately *not* exercised in that service's own unit test file — see the comment at the top of `backend/tests/unit/services/speakingService.test.js`.

**Frontend** (`frontend/tests/shared/`, testing `frontend/js/shared/*.js` only): the page-specific scripts (`js/dashboard.js` etc.) have no test coverage. The shared scripts are plain `<script>`-loaded IIFEs with no `module.exports`, so `frontend/tests/helpers/loadScript.js` reads the source text and runs it via **indirect eval** (`window.eval(code)`, not a bare `eval(code)`) so it executes in jsdom's global scope exactly like a real `<script>` tag would — see that file's header comment for why indirect eval specifically matters here. Do not add `module.exports` to a `js/shared/*.js` file to make it "more testable" — that would be a source-file behavior change outside a docs phase's scope, and the eval trick already covers it.

**Admin** (`admin-src/src/**/*.test.jsx`, co-located): Vitest + React Testing Library + `@testing-library/jest-dom`, run in jsdom. Contexts (`AuthContext`, `ToastContext`, etc.) are tested directly by rendering a small `Consumer` component that calls the hook and exposes its values via `data-testid` spans (see `admin-src/src/contexts/AuthContext.test.jsx`) rather than mocking React itself. Components that consume a context via `useAuth()`/`useToast()` typically mock the context module with `vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({...}) }))` rather than wrapping every render in a real `<AuthProvider>`. `admin-src/src/tests/setup.js` polyfills `localStorage`/`sessionStorage` for the Node/jsdom combination in this environment — don't assume `localStorage` works out of the box in a new test file without it (it's wired into Vitest's config automatically, not something you need to import manually).
