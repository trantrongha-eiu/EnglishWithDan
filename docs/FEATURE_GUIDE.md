# Feature Guide

A practical "how do I..." reference for six common changes, each pointing at real files to model new code after. For the *rules* behind these steps (naming, layering, error handling, testing conventions), see [`docs/CODING_STANDARDS.md`](CODING_STANDARDS.md) — this doc doesn't repeat them. For *why* the system is shaped this way, see [`docs/ARCHITECTURE.md`](ARCHITECTURE.md).

## Table of contents
1. [Adding a new API endpoint](#1-adding-a-new-api-endpoint)
2. [Adding a new public frontend page](#2-adding-a-new-public-frontend-page)
3. [Adding a new React component (admin-src)](#3-adding-a-new-react-component-admin-src)
4. [Adding a new database model](#4-adding-a-new-database-model)
5. [Adding a new AI feature](#5-adding-a-new-ai-feature)
6. [Adding a new admin feature](#6-adding-a-new-admin-feature)

## 1. Adding a new API endpoint

Follow the `routes → controllers → services → models` layering from [`docs/CODING_STANDARDS.md`](CODING_STANDARDS.md#service-architecture). Model the shape on `backend/routes/courses.js` / `backend/controllers/course.controller.js` / `backend/services/courseService.js` — the smallest complete example of the full chain in the codebase.

1. **Model** (only if the data doesn't already have one) — see [§4](#4-adding-a-new-database-model) below.
2. **Service** — add a new `async function` to the relevant `backend/services/xxxService.js` (or create one, following `courseService.js`'s shape), doing the actual Mongoose query/business logic. Add it to that file's closing `module.exports`.
3. **Controller** — add an `exports.xxx = async (req, res) => {...}` (or `catchAsync(async (req, res) => {...})`, preferred for new code — see `backend/controllers/contact.controller.js`) to the matching `backend/controllers/xxx.controller.js`. Pull inputs off `req`, call exactly one service function, shape the response.
4. **Route** — add `router.get/post/put/delete('/path', [auth], [rateLimiter], controller.xxx)` to `backend/routes/xxx.js`. If the file is new, mount it in `backend/server.js`/`app.js` next to the existing `app.use('/api/...', require('./routes/...'))` lines — an unmounted route file is dead code.
5. **Test** — add a unit test for the service (`backend/tests/unit/services/xxxService.test.js`, using `backend/tests/factories/` builders — see `courseService.test.js`) and, if the endpoint has auth/role/ownership logic worth verifying, an integration test (`backend/tests/integration/xxx.test.js`, Supertest against `app.js` — see `speaking.test.js` for the premium-gate + ownership-scoping pattern).
6. If the endpoint is public-facing and cost/abuse-sensitive (sends email, calls a paid API, etc.), add a rate limiter — see `backend/routes/contact.js`'s `contactLimiter` for the simplest example.

## 2. Adding a new public frontend page

`frontend/` has no build step — a new page is a new static file plus explicit script includes. Use `frontend/contact.html` as a simple starting layout, and `frontend/dashboard.html` for the full authenticated-page script order.

1. Create `frontend/your-page.html`. Copy the `<head>`/navbar/mobile-menu boilerplate from an existing page rather than writing it from scratch.
2. Include shared scripts **in this order** (later ones depend on earlier ones):
   - `js/shared/safe-redirect.js` — if the page uses login redirects (usually pulled in transitively by `auth.js`).
   - `js/shared/auth-service.js` + `js/auth.js` — include both if the page requires login (the page-load guard, inactivity logout, banned-account interceptor live in `auth.js`; pages like `login.html`/`auth-callback.html` that need the primitives *without* the automatic guard include `auth-service.js` alone).
   - `js/nav.js` — if the page shows the shared nav bar.
   - `js/shared/utils.js`, `js/shared/toast.js`, `js/shared/confirm-dialog.js` — include whichever your page actually calls (`escHtml`, `showToast`/`toast`, confirm dialogs). Don't include scripts the page doesn't use.
3. Add your page-specific script last: `js/your-page.js`, named to match the HTML file's basename (see `writing.html` ↔ `js/writing.js`).
4. **Auth gating**: if the page requires login, call `AuthService.requirePageAuth(false)` early in your page script (see any authenticated page's script for the exact call). The frontend guard is a UX convenience only — the real gate is always server-side (`middleware/auth.js`); never assume the frontend check alone protects the data.
5. **Clean URL**: if the page needs a clean route (e.g. `/my-feature` instead of `/my-feature.html`), add a rule to `frontend/_redirects` — rules are matched top-to-bottom, first match wins, and the `/* /404.html 404` catch-all must stay last. See the existing rules for the difference between a `200` rewrite (URL stays clean forever) and a `302` redirect (URL normalizes after landing).
6. **Nav link**: if the page needs a link in the shared nav, add an entry to the `LINKS` array in `frontend/js/nav.js` (`{href, icon, label}`, optionally `children` for a dropdown, optionally `badgeId` for a notification badge).

## 3. Adding a new React component (admin-src)

- **Page-specific** (only used by one admin screen): put it in `admin-src/src/pages/` if it *is* a screen (add a `<Route>` in `admin-src/src/App.jsx`), or as a helper component inside/near the page file that uses it if it's a sub-piece of one screen (see `admin-src/src/components/questionGroupBuilder/` for how a large page-owned component was split into sub-files once it grew — still not promoted to the top-level `components/` folder since nothing else uses those pieces).
- **Genuinely shared** (used by ≥2 screens): put it in `admin-src/src/components/` — see `Pagination.jsx` or `ConfirmDialog.jsx` for the shape. Check first whether what you need already exists; most admin pages currently build their own tables/forms inline (see [`docs/ARCHITECTURE.md`](ARCHITECTURE.md#admin-architecture-react-spa)) rather than through a shared primitive, so don't assume one exists.
- **Context consumption**: call `useAuth()` (current user, `isAdmin`/`isTeacher`, `logout`) and `useToast()` (a single `showToast(msg, type)` function, not a component) at the top of your component — see `admin-src/src/pages/Courses.jsx` for a real page using both plus `useConfirm()` (`ConfirmDialog.jsx`'s exported hook) for delete confirmations. Don't reach into `localStorage` directly for auth state; go through `useAuth()`.
- **Data fetching**: call `apiFetch(path, opts)` from `admin-src/src/utils/api.js` directly inside the component (`useEffect` + a `load()` function is the standard shape — see `Courses.jsx`) — there's no shared data-fetching hook or global store to plug into.
- **Test**: add a co-located `Component.test.jsx` next to `Component.jsx`, Vitest + React Testing Library. Mock contexts with `vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({...}) }))` if the component just *consumes* a context; render inside the real `<AuthProvider>` only if you're testing the context/provider itself (see `admin-src/src/contexts/AuthContext.test.jsx`'s `Consumer` pattern for that case). Test conventions in more depth: [`docs/CODING_STANDARDS.md`](CODING_STANDARDS.md#testing-conventions). How to run the suite: [`docs/DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md#running-tests).

## 4. Adding a new database model

1. Create `backend/models/YourModel.js` — `PascalCase` filename, singular noun, matching `mongoose.model('YourModel', YourModelSchema)`. Use `{ timestamps: true }` unless you have a specific reason not to (every existing model does).
2. **Indexes**: only add an index for a query pattern that's actually hot (a filter/sort your service code will really run, not a speculative one). See `backend/models/SpeakingAttempt.js`'s `{userId: 1, createdAt: -1}` index and its comment explaining exactly which query it serves — that's the pattern to follow: name the real caller in a comment next to the index, don't add indexes preemptively. See [`docs/DATABASE.md`](DATABASE.md)'s "Patterns across the schema" section for the fuller reasoning across all ~37 existing collections if it's been written by the time you read this; if not, the principle above is the whole rule.
3. If the collection is user-generated data that shouldn't grow forever (an attempt/session log, not durable content), consider a TTL index — several `*Attempt` models already do this; check one of them (e.g. via `docs/DATABASE.md`) before inventing a manual cleanup job.
4. **Document it**: add the new model to [`docs/DATABASE.md`](DATABASE.md) — purpose, relationships (`ref`s to other models), indexes, lifecycle (does it ever get deleted/expire?), and a couple of common queries against it. This is a checklist item, not optional — `docs/DATABASE.md`'s whole value is being a complete, accurate list of every collection.
5. Add a factory function to `backend/tests/factories/contentFactory.js` (or `userFactory.js` if it's identity-related) so unit tests for services touching this model don't hand-roll schema-shaped objects inline.

## 5. Adding a new AI feature

Read [`docs/ARCHITECTURE.md`](ARCHITECTURE.md#ai-grading-workflow) first for the shape every Gemini call in this codebase follows (timeout racing, error classification, prompt-injection delimiters). Then, concretely:

1. Add a new `async function yourGrading(...)` to `backend/services/geminiService.js`, next to `checkEssay`/`checkSpeaking`/`gradeT2Question`. Reuse the existing `withTimeout(promise, ms, timeoutMessage)` wrapper (pick a timeout in the 30–45s range depending on prompt size, matching the existing three) and `classifyGeminiError(err, overloadMessage)` so a quota/overload condition becomes the same friendly `.isOverloaded = true` error the other three functions already produce — callers already know how to turn that into a 503. Also reuse `extractJson(rawText)` for parsing the response.
2. **Prompt-injection defense**: wrap any student-submitted text in explicit delimiters (`<<<SOMETHING_START>>>...<<<SOMETHING_END>>>`) with a system-instruction line telling the model to treat everything between them as data, never as instructions — copy the exact pattern from `checkEssay`'s `<<<STUDENT_ESSAY_START>>>` handling. This isn't optional decoration; it closed a real, security-audited gap.
3. Add the new function name to `geminiService.js`'s closing `module.exports`.
4. Call it from a service function (not directly from a controller — see [`docs/CODING_STANDARDS.md`](CODING_STANDARDS.md#service-architecture)), which the controller calls in its own `try/catch` (or lets `catchAsync` handle) checking `err.isOverloaded` to return 503 vs 500 — see `speaking.controller.js`'s `analyze` handler for the exact pattern.
5. **Rate limit the route**: any endpoint that triggers a Gemini call needs its own `express-rate-limit` instance keyed by user ID (falling back to IP), skipping `role === 'admin'`, and logging `logger.security('Rate limit exceeded', {...})` on the handler — copy `backend/routes/speaking.js`'s `analyzeLimiter` or `backend/routes/task2Practice.js`'s `checkLimiter` verbatim and adjust the window/max/message.
6. Document the new endpoint in [`docs/API.md`](API.md) (or [`docs/API_ADMIN.md`](API_ADMIN.md) if it's admin-only) — request shape, response shape, auth/role/rate-limit requirements, error responses (including the 503 overload case).
7. Cost control reminder: never wire a live Gemini call into `/health` or any other frequently-polled/monitoring endpoint (see `docs/ARCHITECTURE.md`'s AI grading workflow section) — that turns a cheap diagnostic into an unbounded-cost target.

## 6. Adding a new admin feature

1. **Route file**: add to an existing domain file under `backend/routes/admin/` if one fits, otherwise create a new one following `backend/routes/admin/courses.js`'s shape (simplest complete CRUD example: `auth` + `teacherOnly`/`adminOnly` + a handful of routes, no extra ceremony).
2. **Mount it**: a new file **must** be added to `backend/routes/admin/index.js` via `router.use(require('./yourFile'))` — routes in an unmounted file are unreachable. Add a one-line comment next to it describing what it covers, matching the existing list's style.
3. **`teacherOnly` vs `adminOnly`** — based on the real, consistent split across every existing admin route file:
   - **`teacherOnly`** (teacher or admin role) — content management: creating/editing/hiding IELTS content (courses, passages, listening/writing/speaking material, Task 1/2 exercises), viewing stats/history, messaging. Note `teacherOnly` itself additionally blocks `DELETE` for a `teacher`-role user (see `backend/routes/admin/_shared.js`) — a teacher can create/edit/hide content but not permanently delete it; only `admin` can.
   - **`adminOnly`** (admin role only) — anything destructive, financial, or role/permission-changing: user account creation/edit/ban/delete and role changes (`backend/routes/admin/users.js`), plan/billing changes and upgrade-request approval (`backend/routes/admin/billing.js`), `db-status` and one-off maintenance/reseed endpoints (`backend/routes/admin/stats.js`, `task2Topics.js`). If your new route mutates money, roles, or permanently destroys data, default to `adminOnly`.
   - If [`docs/API_ADMIN.md`](API_ADMIN.md) documents a role for a similar existing endpoint by the time you're reading this, follow that documented split; the rule above is derived directly from the current route files and should match it.
4. **Admin-security logging**: role/ban/delete-style actions on `User` log via `logger.security(...)` with actor + target IDs (see `backend/routes/admin/users.js`) — do the same for any new destructive/role-changing action.
5. **Admin-src page**: add `admin-src/src/pages/YourFeature.jsx` (model on `Courses.jsx` for a simple list+modal CRUD screen), fetching via `apiFetch('/admin/your-path')` from `admin-src/src/utils/api.js`. Add a `<Route path="your-feature" element={<YourFeature />} />` inside `admin-src/src/App.jsx`'s protected route tree — wrap it in `<ProtectedRoute role="admin">` (see the `tuition`/`upgrade-requests` routes) if the feature is admin-only rather than teacher-accessible, matching whatever you chose for the backend route's gating in step 3.
6. Add a link for it in `admin-src/src/components/Sidebar.jsx` if it should appear in the admin nav.
