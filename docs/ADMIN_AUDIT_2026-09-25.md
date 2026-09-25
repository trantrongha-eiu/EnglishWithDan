# ADMIN AUDIT REPORT — 2026-09-25

Phạm vi: toàn bộ Admin SPA (`admin-src/`, React 19 + Vite + react-router `HashRouter`, build ra
`frontend/admin/`) và mọi API mà nó gọi (`backend/routes/admin/*` + các router ngoài `/api/admin`
có quyền staff). Audit viết TRƯỚC khi sửa code; phần "đã làm" nằm ở cuối file.

Nguồn số liệu: load thật Express router và duyệt `route.stack` (không grep), đối chiếu tĩnh
`admin-src/src` ↔ backend routes ↔ `backend/models` (84 model).

---

## 1. Current Architecture

| Tầng | Thực tế |
|---|---|
| Admin frontend | React 19 SPA, 40 page (`src/pages`), ~18.7k dòng, lazy-load theo route (trừ Dashboard). Không UI lib — 1 file `admin.css` (1.687 dòng) chứa design token (`--bg/--surface/--accent…`), light/dark theme. |
| State | Context: Auth (đọc `localStorage`), Toast, Theme, Confirm. Không có cache/query lib — mỗi page tự `useEffect → apiFetch`. |
| API layer | `utils/api.js#apiFetch`: timeout 30s, xử lý 401 (logout + redirect), cold-start Render, lỗi JSON. |
| Backend | Express 5 + Mongoose. `/api/admin` = 24 module, **216 route**. Thêm ~70 route staff ở `/api/vocab/admin`, `/api/vocabulary-lessons/admin`, `/api/essential-grammar/admin`, `/api/classes`, `/api/tuition`. |
| Auth | JWT Bearer. `middleware/auth` (check token, `tokenValidAfter`, ban, hết hạn premium) + `teacherOnly` (teacher/admin; **teacher bị chặn mọi DELETE**) / `adminOnly`. |
| Test | admin: vitest 65 test; backend: jest (mongodb-memory-server) — 23 suite admin, 326 test pass; e2e Playwright (4 spec). |

## 2. Admin Pages (40 route)

Tổng quan: Dashboard · Người dùng · Khoá học (catalog marketing).
Học sinh: Lớp & Điểm danh (+ chi tiết lớp, BTVN) · Theo dõi luyện tập (hub 5 tab: lịch sử / thi thử full / thống kê R / thống kê L / từ vựng) · Test đầu vào · Chấm bài Writing · Hộp thư (+ báo cáo vi phạm) · Chi tiết học sinh.
Nội dung: Passages · Bộ đề Reading · Đề Listening · Bài lẻ Listening · Đề Writing (4 tab) · Speaking (+ import) · Từ vựng Units · Vocabulary Lessons (+ import) · Essential Grammar · Writing Practice · Task 1 Grammar (cũ) · Khoá WT1/WT2/Speaking (1 page, 3 course) · Viết câu nâng cao · Task 2 Writing · Task 2 Templates · Tài liệu in (Tips).
Tài chính/hệ thống: Yêu cầu nâng cấp · Học phí · Mã bỏ qua Review.

## 3. User Features ↔ Admin (bảng đối chiếu)

| Feature (User) | User UI | API | Database | Admin UI | Admin action |
|---|---|---|---|---|---|
| Reading full test / lẻ | reading.html | /api/reading | TestAttempt, ReadingPracticeAttempt | Bộ đề, Passages, Thống kê R, Lịch sử | CRUD đề, xem/xoá lượt |
| Listening full / lẻ / gap-fill / dictation | listening.html, dictation.html | /api/listening | ListeningAttempt, ListeningPracticeAttempt, GapFillAttempt, DictationAttempt | Đề/Bài lẻ Listening, Thống kê L, Lịch sử | CRUD, xem/xoá lượt |
| Writing full test + chấm AI | writing.html | /api/writing | WritingAttempt | Đề Writing, Chấm bài | CRUD, chấm/duyệt |
| Speaking luyện đề | speaking.html | /api/speaking | SpeakingAttempt, SpeakingQuestion/Material | Speaking | CRUD, import, xem bài |
| Writing Practice / Task1 Grammar / Task2 / Templates | writing-practice.html, task1/2-practice.html | /api/writing-practice, /task1, /task2, /task2template | WP*, Task1*, Task2*, Task2Template* | 4 trang tương ứng | CRUD, xem lượt |
| Viết câu nâng cao | advanced-sentences.html | /api/adv-sentence | SentenceStructureGroup, **AdvSentenceAttempt** | Viết câu nâng cao (nội dung) | CRUD nội dung — **lượt làm KHÔNG hiện ở bất kỳ đâu trong admin** |
| Khoá WT1 / WT2 / Speaking | writing-task1.html, writing-task2-course.html, speaking-course.html | /api/wt1 | WT1Course/Module/Lesson/Exercise, WT1Submission, **WT1Progress** | Khoá WT1 (3 course) + Lịch sử | CRUD; bài nộp có trong feed; **tiến độ khoá theo HS không có** |
| Full Mock Test | mock-test.html | /api/mock-test | MockTestAttempt | Theo dõi → Thi thử | xem, sửa điểm, huỷ |
| Test đầu vào | entrance-test.html | /api/entrance-test | EntranceTest* | Test đầu vào | cấu hình, duyệt |
| Từ vựng Units / sổ từ / Paraphrase SRS / từ khó | dashboard.html | /api/vocab, /vocabbook, /difficult-words | VocabUnit, VocabBook, VocabActivity, **ParaphraseProgress**, **DifficultWord** | Từ vựng Units, Hoạt động từ vựng | CRUD units; sổ từ xem được; **SRS paraphrase & từ khó: không** |
| Vocabulary Lessons / Essential Grammar | dashboard.html, essential-grammar.html | /api/vocabulary-lessons, /essential-grammar | VocabularyLesson*, EssentialGrammar* | 2 trang | CRUD, thống kê HS |
| Tips 4 kỹ năng (+ luyện tập R/L) | reading/listening/writing/speaking pages | /api/*-tips/lessons | **ReadingTip, ListeningTip, WritingTip, SpeakingTip** | chỉ "Tài liệu in" (xuất file) | **Không xem/ẩn/hiện được tip nào — chỉ sửa được bằng seed script** |
| Mục tiêu / lộ trình / timetable | goal.html, dashboard | /api/goals, /study-plan, /exam-timetable | User.targetBand…, ExamTimetableProgress | — | **Không thấy mục tiêu của HS ở admin** |
| Streak / huy hiệu | nav, profile | /api/user, /badges | User streak fields | Hoạt động từ vựng, Chi tiết HS | reset/khôi phục streak, xem huy hiệu |
| Lớp, điểm danh, BTVN | dashboard (card lớp) | /api/classes, /assignments | ClassGroup, Enrollment, Session, Attendance, Assignment* | Lớp & Điểm danh | đầy đủ |
| Review bắt buộc | review-history.html | /api/review | AttemptReview, ReviewBypassCode | Mã bỏ qua Review | cấp mã |
| Nhắn tin (GV↔HS, HS↔HS), báo cáo | inbox.html | /api/user/messages, /peer | Message, Report, Block | Hộp thư | gửi, xoá, xử lý báo cáo |
| Premium / nâng cấp / học phí | upgrade-modal, tuition.html | /api/upgrade, /tuition | User.plan, UpgradeRequest, TuitionFee | Người dùng (Gói), Yêu cầu nâng cấp, Học phí | đầy đủ (admin-only) |
| Traffic | mọi trang | /api/track | PageVisit | Dashboard chart | xem |

## 4. Missing Admin Controls (ưu tiên)

1. **P1 – Tips (4 kỹ năng, 4 model)**: admin không có cách xem, ẩn/hiện, xem trước. Nội dung chỉ đổi được bằng chạy seed.
2. **P1 – Hồ sơ học tập 1 học sinh**: Chi tiết HS thiếu mục tiêu (band/ngày thi/lịch học), streak, lớp đang học, số lượt theo kỹ năng, thi thử, test đầu vào, tiến độ khoá WT1/WT2/Speaking, SRS paraphrase, từ khó. Và không có thao tác nào tại chỗ (nhắn tin/nhắc nhở phải quay lại trang Người dùng).
3. **P1 – Lượt làm "Viết câu nâng cao"** (AdvSentenceAttempt) không có trong feed hoạt động admin (feed có 15 collection nhưng thiếu cái này).
4. P2 – Khoá WT2 / Speaking course bị "giấu" sau menu tên "Task 1 Writing (khoá)".
5. Không làm (ghi nhận): trình soạn block cho Tips (schema Mixed, 7 loại block × 4 model — cần thiết kế editor riêng); SRS/từ khó chỉ đưa vào dạng số liệu tóm tắt.

## 5. Duplicate Components / Logic

| Trùng lặp | Số chỗ |
|---|---|
| `bandBadge`, `formatDur` (y hệt nhau) | 5 file (Dashboard, StudentDetail, StudentHistory, ReadingStats, ListeningStats) |
| `formatLastSeen`, `roleBadge`, `planBadge`, `simBadge` | 2 file mỗi hàm (Users/StudentDetail, StudentHistory/StudentDetail) |
| Markup modal `modal-overlay > modal > modal-header…` viết tay, không Esc/aria | 28 file |
| Trạng thái "Đang tải…" dạng dòng chữ trong bảng | 21 file |
| Pattern `useEffect → apiFetch → setState` + `.catch(() => {})` nuốt lỗi | 9 file nuốt lỗi hoàn toàn |
| Poll badge: Sidebar poll `/sidebar-badges`; Users.jsx + Messages.jsx gọi riêng `/online-users` (dữ liệu đã có trong sidebar-badges) | 3 nguồn cho cùng 1 dữ liệu |

## 6. UX Problems

- Sidebar 30 mục phẳng, không nhóm thu gọn được, không lọc theo role: **teacher thấy "Học phí"/"Yêu cầu nâng cấp"**, bấm vào → `ProtectedRoute` đẩy về `login.html` như bị đăng xuất (bug P0, xem §8).
- Dashboard: số liệu hiện "–" khi đang tải lẫn khi lỗi (không phân biệt), lỗi bị nuốt, không có "việc cần xử lý", không có biểu đồ hoạt động luyện tập.
- Users: 11 cột chật, không sort, không lọc theo gói, "Không có người dùng" hiện trong lúc đang tải.
- Pagination render **mọi** nút trang (1…N) — với nhiều trang thành hàng dài vỡ layout.
- Modal không đóng bằng Esc, không `role="dialog"`; nhiều nút chỉ có emoji không `aria-label`; không có focus ring rõ ràng.

## 7. Performance Problems

| Vấn đề | Chi tiết |
|---|---|
| `GET /admin/recent-attempts` rất nặng | Mỗi call = 15 `countDocuments` + 1 aggregate + 15 `find` (Task1 ×15 hệ số). Dashboard poll mỗi 60s (limit=10) → ~31 query/phút/tab admin chỉ để hiện 10 dòng. |
| Chi tiết HS tải 500 lượt × 15 collection | `?limit=500` (Task1 tới 3.000 doc) rồi lọc kỹ năng ở client. |
| Chi tiết HS tải analytics từ vựng của **toàn bộ học sinh** | `GET /admin/vocab-students` (aggregate VocabBook+VocabActivity cho mọi HS) chỉ để lấy 1 dòng. |
| Users: đổi trang gọi API 2 lần | `onPage` gọi `setPage(p)` **và** `load(p)`, effect lại `load` lần nữa. Không huỷ request cũ → gõ tìm kiếm nhanh có thể bị kết quả cũ ghi đè. |
| `/admin/users` `limit` không giới hạn | `?limit=100000` trả toàn bộ user. |
| Một số trang nội dung tải cả collection rồi lọc client (WritingPractice `limit=500`, ListeningSections) | chấp nhận được với quy mô hiện tại (vài trăm doc) — ghi nhận, không sửa. |

## 8. Security Problems

Đã xác minh bằng cách duyệt middleware stack thật: **216/216 route `/api/admin` đều có `auth` + `teacherOnly|adminOnly`** — không có route admin hở. `/admin/users*` không trả password/OTP/verify-token. Không phát hiện lỗ hổng authz phía server.

Vấn đề tìm thấy:
1. **P0 (UX-security)**: route admin-only ở client với teacher → redirect `login.html` (trông như bị logout) thay vì báo "không có quyền".
2. **P1**: admin có thể tự hạ quyền / tự cấm chính mình qua `PUT /admin/users/:id` hoặc `/ban` → tự khoá mình khỏi admin (chỉ `DELETE` có chặn tự xoá).
3. P2: `GET /admin/recent-attempts?userId=<không phải ObjectId>` → 500 (lộ message lỗi nội bộ) thay vì 400.
4. P2: `/admin/users` limit không chặn trên (xem §7).

## 9. Recommended Architecture (IA)

```
Tổng quan        Dashboard
Học sinh         Người dùng · Lớp & Điểm danh · Theo dõi luyện tập · Test đầu vào · Hộp thư
Chấm & duyệt     Chấm bài Writing
Đề thi IELTS     Bộ đề Reading · Bài đọc (Passages) · Đề Listening · Bài lẻ Listening · Đề Writing · Speaking
Khoá học         Khoá Writing Task 1 · Khoá Writing Task 2 · Khoá Speaking · Trang khoá học (marketing)
Luyện tập        Writing Practice · Task 1 Grammar (cũ) · Task 2 Writing · Task 2 Templates · Viết câu nâng cao
Từ vựng & NP     Từ vựng (Units) · Vocabulary Lessons · Essential Grammar
Tips & tài liệu  Tips 4 kỹ năng (MỚI) · Tài liệu in
Tài chính (admin) Yêu cầu nâng cấp · Học phí
Hệ thống         Mã bỏ qua Review
```
Nhóm thu gọn được (nhớ trạng thái), lọc theo role, ô tìm menu, sidebar thu nhỏ trên desktop.

## 10. Implementation Plan

1. P0/Security: role-aware sidebar + trang 403; chặn tự hạ quyền/tự cấm; validate `userId`; cap `limit`.
2. Shared UI: `components/ui` (PageHeader, StatCard, Skeleton/TableSkeleton, EmptyState, ErrorState, Modal a11y, Pagination rút gọn), `hooks/useApi` (loading/error/retry/abort), `utils/format` + badges dùng chung; 1 `AdminDataProvider` poll badge 1 lần cho cả Sidebar/Dashboard/Users.
3. Redesign: token/design system, sidebar, topbar, Dashboard (KPI + việc cần xử lý + biểu đồ hoạt động 14 ngày + hoạt động gần đây), Users, Chi tiết HS.
4. Missing features: `GET /admin/users/:id/overview`, `GET /admin/stats/overview` (active users, premium, hoạt động/ngày), trang Tips (list/ẩn-hiện/xem trước), AdvSentenceAttempt vào feed, deep-link 3 khoá học.
5. Performance: `recent-attempts?skill=&noTotal=1`, `vocab-students?userId=`, sửa double-fetch, abort request cũ.
6. Test: vitest + jest + lint + build; Playwright bằng tài khoản teacher trên backend local.

---

# ADMIN DASHBOARD REFACTOR — ĐÃ LÀM (2026-09-25)

## 1. UI/UX
- Design system v2 trên token có sẵn (`admin.css`): neutral light mới, `--accent-soft/--focus-ring/--*-soft`, focus ring cho mọi phần tử tương tác, skeleton, empty/error state, KPI card, panel, row menu, switch, profile/info grid.
- Shared UI (`components/ui/`): `PageHeader`, `StatCard`, `Modal` (role=dialog, Esc, focus trap), `RowMenu`, `States` (Skeleton/TableSkeleton/EmptyState/ErrorState/TableBody), `badges.jsx`.
- Shell mới: sidebar nhóm thu gọn được (nhớ trạng thái), ô "Tìm menu…", chế độ icon-only trên desktop, lọc theo role, badge dùng chung; topbar có breadcrumb + **Tìm học sinh nhanh** (phím `/`, ↑↓ Enter); skip-link; tiêu đề tab trình duyệt theo trang.
- Dashboard viết lại: 5 KPI thật, biểu đồ hoạt động 14 ngày, "Cần xử lý" (link thẳng tới việc), bài nộp gần nhất, kho nội dung, tổng lượt làm bài, dung lượng DB (admin), lượt truy cập. Mọi khối có skeleton + lỗi + thử lại.
- Người dùng: 1 cột người dùng (avatar + tên + @username · email, chấm online), 1 nút chính + menu "⋯", bộ lọc gói + sắp xếp, "Xoá bộ lọc", bộ lọc nằm trên URL.
- Hồ sơ học sinh: header có thao tác tại chỗ (Nhắn tin / Nhắc nhở / Gói / Sửa), tab trên URL.

## 2. Information Architecture
Tổng quan · Học sinh · Đề thi IELTS · Khoá học (3 khoá WT1/WT2/Speaking có mục riêng + deep-link `?course=`) · Luyện tập Writing · Từ vựng & Ngữ pháp · Tips & Tài liệu · Tài chính (admin) · Hệ thống. Một nguồn cấu hình duy nhất `layouts/navConfig.js` (bỏ map TITLES trùng trong AdminLayout).

## 3. Removed Duplications
- `bandBadge`/`formatDur` (5 bản), `formatLastSeen`/`roleBadge`/`planBadge`/`simBadge` (2 bản mỗi hàm) → `utils/format.js` + `components/ui/badges.jsx`.
- 4 modal người dùng chuyển sang `pages/users/UserModals.jsx`, dùng chung cho Người dùng + Hồ sơ học sinh.
- Poll badge 1 lần (`AdminDataProvider`) cho Sidebar, Dashboard, Người dùng (Users không còn gọi riêng `/online-users`).
- Pattern fetch lặp lại → `hooks/useApi.js` (abort request cũ, retry, poll khi tab hiển thị).
- Xoá asset template Vite không dùng (`src/assets/*`), import `REWRITE_CUTOFF` thừa.

## 4. New Admin Features
- **Tips 4 kỹ năng** (`/tips`): xem toàn bộ Tips (kể cả đang ẩn), tìm/lọc, xem trước (render Markdown an toàn), ẩn/hiện với học sinh, mở trang học sinh.
- **Hồ sơ học tập 1 học sinh** (`GET /admin/users/:id/overview`): mục tiêu, streak, lớp (teacher chỉ thấy lớp mình), BTVN, hoạt động theo kỹ năng (số lượt, gần nhất, band TB), tiến độ khoá WT1/WT2/Speaking, thi thử + test đầu vào, SRS paraphrase, từ khó, học phí chưa đóng (admin).
- **Dashboard overview** (`GET /admin/stats/overview`): học sinh hoạt động 24h/7 ngày, đăng ký mới (so tuần trước), Premium còn hạn, lượt làm bài + học sinh hoạt động theo ngày.
- Lượt "Viết câu nâng cao" (AdvSentenceAttempt) xuất hiện trong mọi feed lịch sử.

## 5. Performance Improvements
- `recent-attempts`: `?skill=` chỉ truy vấn 1 collection; `?noTotal=1` bỏ 16 countDocuments (Dashboard poll mỗi phút).
- Hồ sơ HS: lịch sử 50 dòng + "Tải thêm" (trước: 500 × 16 collection), lọc kỹ năng ở server; từ vựng `?userId=` (trước: aggregate cả lớp); tab chỉ tải khi mở.
- Người dùng: bỏ gọi API 2 lần khi đổi trang; debounce tìm kiếm (5 phím = 1 request, đã đo); huỷ request cũ.
- `/stats/overview` cache 60s phía server; `/admin/users` `limit` ≤ 100 + `.lean()` + bỏ mảng lớn khỏi list.
- Đo bằng Playwright trên bản build production: không trang nào gọi trùng endpoint.

## 6. Security Improvements
- Teacher mở trang admin-only → trang "không có quyền" (trước: bị đẩy về login như bị đăng xuất); sidebar ẩn mục admin-only với teacher.
- Chặn admin tự hạ quyền / tự cấm (API + UI).
- `recent-attempts`/`vocab-students`/overview/tips validate ObjectId → 400 thay vì 500.
- Mọi route mới: `auth` + `teacherOnly`; đã xác minh lại bằng cách duyệt middleware stack: 221/221 route `/api/admin` có đủ guard. Ẩn/hiện Tips có log `logger.security`.

## 7. Files Changed
Backend: `routes/admin/{users,stats,vocabAnalytics,index,sidebarBadges}.js`, mới `routes/admin/{studentOverview,tips}.js`, mới `services/adminActivityService.js`, `services/tipLecturePackService.js` (export `tipMarkdown`), test mới `tests/integration/adminDashboardRefactor.test.js`.
Admin: `App.jsx`, `admin.css`, `layouts/{AdminLayout.jsx,navConfig.js}`, `components/{Sidebar,Pagination,QuickSearch,SkillBadge}.jsx`, `components/ui/*`, `contexts/AdminData*.jsx`, `hooks/useApi.js`, `utils/{format,markdown,pageWindow}.js`, `routes/ProtectedRoute.jsx`, `pages/{Dashboard,Users,StudentDetail,StudentHistory,Tips,WritingTask1Course,ReadingStats,ListeningStats}.jsx`, `pages/users/UserModals.jsx`, test mới cho navConfig/Sidebar/useApi/markdown/Pagination. Build `frontend/admin/`.

## 8. APIs Changed (đều tương thích ngược)
- `GET /admin/users` + `plan`, `sort` (newest|oldest|lastSeen|name); `limit` tối đa 100.
- `PUT /admin/users/:id`, `PUT /admin/users/:id/ban`: 400 khi tự hạ quyền/tự cấm.
- `GET /admin/recent-attempts` + `skill`, `noTotal`; 400 với `userId` sai; thêm skill `adv-sentence`.
- `GET /admin/vocab-students` + `userId`.
- Mới: `GET /admin/users/:id/overview`, `GET /admin/stats/overview`, `GET /admin/tips`, `GET /admin/tips/:skill/:id`, `PATCH /admin/tips/:skill/:id/active`.

## 9. Database Changes
Không có migration/field mới. Chỉ đọc thêm các collection sẵn có; ghi duy nhất là `isActive` của Tips (field đã tồn tại).

## 10. Remaining Issues
- 28 trang cũ vẫn tự viết modal/"Đang tải…"/`.catch(() => {})` — component mới sẵn sàng, chưa migrate hàng loạt (rủi ro hồi quy cao, nên làm dần theo trang).
- Messages.jsx vẫn tự gọi `/admin/online-users` và tải 500 học sinh cho ô chọn người nhận.
- WritingPractice (`limit=500`), ListeningSections (toàn bộ) vẫn lọc client — chấp nhận được với quy mô hiện tại.
- Endpoint không còn nơi gọi, CHƯA xoá (chưa xác minh hết công cụ ngoài/curl): `/admin/history`, `/admin/listening-history`, `/admin/listening-tests`, `/admin/writing-tests`, `/admin/writing-exams/upload-image`, `/admin/messages/unread-count`, `/admin/fix-task1-context`, `/tuition/admin-summary`.
- Lịch sử của Essential Grammar / Vocabulary Lessons / Templates / khoá WT1 / Gap-fill / Viết câu nâng cao không có endpoint xoá → nút xoá đã được ẩn (trước đây gọi URL đoán và 404).

```text
BLOCKED
Feature: Soạn/sửa nội dung Tips (block editor) trong admin
Reason: nội dung là 7 loại block schema Mixed × 4 model, nguồn gốc nằm ở file seed; sửa trong DB sẽ bị ghi đè khi chạy lại seed
Required backend change: PUT /admin/tips/:skill/:id có validate từng loại block + quyết định DB hay file seed là nguồn gốc
Recommended solution: chọn DB làm nguồn gốc (ngừng auto-seed Tips khi đã có dữ liệu), rồi làm editor theo từng loại block
```

## 11. Testing
- Build: `npm run build` (admin) ✓ — API trỏ production.
- Lint: admin 0 error (45 warning cũ, trước là 50); backend 0 error (6 warning cũ).
- Unit: admin vitest 87/87 ✓ (65 → 87).
- Backend: jest 36 suite / 501 test ✓ (admin + class + tips + security), gồm 16 test mới.
- Functional/Performance: Playwright với tài khoản teacher `test` trên backend local (không seed/cron) + bản build production — 62/62 kiểm tra: dashboard, role filtering, trang 403, danh sách/lọc/phân trang/URL, debounce, hồ sơ HS 4 tab, Tips + xem trước + Esc, deep-link khoá học, tìm nhanh, 27 route cũ không lỗi console/API, không trùng request, tablet/phone không tràn ngang. Không bấm thao tác ghi nào trên dữ liệu thật.
