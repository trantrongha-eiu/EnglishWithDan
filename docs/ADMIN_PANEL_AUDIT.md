# Admin Panel Audit — Trùng lặp & vấn đề cần dọn dẹp

**Ngày:** 2026-07-25
**Phạm vi:** Toàn bộ `admin-src/src/pages/*` + các route backend tương ứng dưới `backend/routes/admin/*` và các route admin nằm ngoài thư mục đó.
**Mục đích:** Liệt kê các tính năng bị trùng lặp/chồng chéo có thể gộp lại, và các vấn đề/không nhất quán khác phát hiện được trong quá trình rà soát. Đây là báo cáo thuần rà soát — **chưa sửa gì**, chờ hướng dẫn ưu tiên fix.

Mỗi phát hiện có gắn **mức độ** (Cao / Trung bình / Thấp) theo mức ảnh hưởng tới trải nghiệm admin hoặc rủi ro nhầm lẫn dữ liệu, không phải độ khó sửa.

---

## Tóm tắt nhanh

| # | Phát hiện | Mức độ | Loại |
|---|---|---|---|
| 1 | 4 cơ chế "Nhắc nhở" độc lập, không chia sẻ code, hành vi khác nhau dù cùng nhãn | Cao | Trùng lặp + không nhất quán |
| 2 | Hai trang admin riêng biệt cùng quản lý **Bài mẫu Writing** (`WritingSample`) | Cao | Trùng lặp thật sự |
| 3 | Ba hệ thống "bài tập câu/ngữ pháp" chồng chéo loại bài tập | Trung bình | Trùng lặp cấu trúc |
| 4 | Thông tin 1 học sinh nằm rải ở 3 trang không liên kết nhau | Cao | Phân mảnh UX |
| 5 | Hai cơ chế cấp Premium độc lập + tính năng AccessKey mồ côi | Trung bình | Trùng lặp + code chết |
| 6 | `StudentHistory.jsx` đếm/phân trang sai khi vượt ~900 bản ghi | Trung bình | Bug |
| 7 | Route Listening nằm ngoài `routes/admin/`, khác chuẩn mọi loại nội dung khác | Thấp | Không nhất quán tổ chức code |
| 8 | Nhiều tên gây hiểu lầm (`Task2Exercises.jsx`, `billing.js`, `studentNotified`) | Thấp | Không nhất quán đặt tên |
| 9 | Hai flow "dán text để import hàng loạt" viết riêng cho Vocabulary vs VocabularyLesson | Thấp | Trùng lặp UI (dữ liệu thì hợp lệ tách riêng) |
| 10 | Số liệu "học sinh" ở Dashboard và "người dùng" ở Users.jsx dùng phạm vi khác nhau | Thấp | Không nhất quán số liệu |
| 11 | 2 API admin không có nơi nào gọi tới (`reseed-task2-week12`, `fix-task1-context`) | Thấp | Code không dùng tới từ UI |

---

## 1. Hệ thống "Nhắc nhở" (remind) bị phân mảnh — 4 cơ chế độc lập — Mức độ: **Cao**

Có **bốn** đường đi khác nhau để "gửi nhắc nhở tới học sinh", không cái nào dùng chung service/helper — mỗi nơi tự viết `Message.create()`/`insertMany()` riêng.

| # | Nút bấm (UI) | Endpoint | Handler | Có đếm dồn? | Có bắn banner cảnh báo? |
|---|---|---|---|---|---|
| 1a | `Users.jsx:487` 🔔 Nhắc nhở | `POST /admin/users/:id/remind` | `backend/routes/admin/users.js:125-148` | ✅ `User.studyReminderCount` | ✅ banner đỏ toàn site khi ≥3 lần (`frontend/js/nav.js:259-269, 320-343`) |
| 1b | `VocabActivity.jsx:483-487` 🔔 Nhắc nhở | `POST /admin/messages` (endpoint chung) | `backend/routes/admin/messages.js:71-95` | ❌ không | ❌ không |
| 1c | `Tuition.jsx:564` 📩 (từng khoản phí) | `POST /tuition/:id/remind` | `tuitionService.sendReminder` (`backend/services/tuitionService.js:180-195`) | ❌ không | ❌ không |
| 1d | `Tuition.jsx:387-389` 📣 Nhắc hàng loạt | `POST /tuition/remind-bulk` | `tuitionService.sendBulkReminders` (`tuitionService.js:197-215`) | ❌ không | ❌ không |
| 1e | *(tự động, cron 08:00 hằng ngày)* | không có route HTTP | `backend/cron/tuitionReminder.js` (đọc `TuitionSettings.autoRemindEnabled`) | ❌ không | ❌ không |
| 1f | `Messages.jsx` (soạn thư tự do) | `POST /admin/messages` | `backend/routes/admin/messages.js:71-95` | tuỳ chọn (nếu admin tự đính kèm quà) | ❌ không |

**Vấn đề cụ thể:**
- `Users.jsx` có **hai nút cạnh nhau** — 🔔 Nhắc nhở (`:487`) và ✉️ nhắn tin (`:488`) — cùng gửi tin nhắn tới học sinh, nhưng chỉ nút 🔔 mới cộng `studyReminderCount`. Admin bấm nhầm nút ✉️ là "né" luôn cơ chế cảnh báo leo thang mà không biết.
- Ba template nhắc học phí (`sendReminder`, `sendBulkReminders`, cron `tuitionReminder.js:52-67`) là ba đoạn code viết tay gần giống hệt nhau — comment trong `tuitionService.js:3-6` giải thích đây là "chủ ý vì lời văn khác nhau", nhưng về mặt kỹ thuật vẫn là logic copy-paste, sửa 1 nơi dễ quên 2 nơi còn lại.
- Không có nơi nào track "học sinh này đã bị nhắc học phí bao nhiêu lần" — khác hẳn với cơ chế 1a có hẳn cột "NHẮC NHỞ" hiển thị số lần trong bảng `Users.jsx`.
- `TuitionFee.studentNotified` (`backend/models/TuitionFee.js:17`) tên dễ đọc nhầm thành "đã báo cho học sinh", nhưng thực ra nghĩa ngược lại: **học sinh** báo cho admin là đã chuyển khoản (set trong `notifyPayment()`, `tuitionService.js:235-236`).

**Gợi ý gộp (tham khảo, chưa làm gì):** cơ chế 1b/1c/1d/1e/1f về bản chất chỉ là "tạo 1 `Message`" — có thể gộp vào một service `sendMessageToStudent()`/`sendBulkMessage()` dùng chung. Cơ chế 1a khác biệt thật sự (có đếm dồn + banner) nên giữ riêng, hoặc tổng quát hoá thành "loại nhắc nhở" có thể áp dụng cho cả 4 nút còn lại nếu muốn tất cả đều leo thang cảnh báo.

---

## 2. Hai trang riêng biệt cùng quản lý **Bài mẫu Writing** — Mức độ: **Cao** (trùng lặp thật, không phải hiểu nhầm)

`WritingSamples.jsx` (menu "Bài mẫu Writing") và tab "📄 Bài mẫu" trong `WritingTests.jsx` (menu "Đề Writing", tab tại `WritingTests.jsx:574`, thân tab `:709-758`) **cùng thao tác trên đúng 1 model** `WritingSample` qua đúng 1 bộ endpoint:

- `GET/POST/PUT/DELETE /api/admin/writing/samples`, `POST /api/admin/writing/samples/upload-pdf` (`backend/routes/admin/writingSamples.js:17-70`)
- Gọi y hệt từ cả hai nơi: `WritingSamples.jsx:137-161` và `WritingTests.jsx:475, 502-518`.

Nhưng mỗi trang tự viết **modal sửa riêng, đã lệch nhau về UX**:
- `WritingSamples.jsx:9-125` (`SampleModal`) — có nút "Upload PDF" riêng phải bấm trước khi Lưu được bật, có checkbox `isActive` trong form.
- `WritingTests.jsx:263-382` (`WritingSampleModal`) — chọn file gắn thẳng vào form, upload xảy ra khi Lưu; **không có** ô `isActive` trong modal (chỉ đổi được trạng thái active từ dòng bảng ngoài).

Cả hai trang đều đang hiện hành trên sidebar cùng lúc → admin có thể sửa/xoá cùng 1 bản PDF từ 2 màn hình khác nhau, với 2 luồng thao tác khác nhau. **Đây là ứng viên gộp mạnh nhất trong toàn bộ audit.**

---

## 3. Ba hệ thống "bài tập câu/ngữ pháp" chồng chéo — Mức độ: **Trung bình**

Ba model bài tập độc lập, tự code riêng, nhưng loại bài tập (`type`) trùng lặp nhiều:

| Trang | Model | Endpoint | Các loại `type` |
|---|---|---|---|
| `WritingPractice.jsx` (tab "Bài tập") | `WPExercise` (`backend/models/WPExercise.js:6`) | `/admin/wp-exercises` | `translation, rearrange, fill_blank, expand, combine` |
| `Task1Exercises.jsx` | `Task1Exercise` (`backend/models/Task1Exercise.js:8`) | `/admin/task1/exercises` | `fill_blank, translation, rearrange, multiple_choice, error_correction, paraphrase_choose, data_transform` |
| `Task2Exercises.jsx` (modal câu hỏi) | `Task2Topic.questions` (`backend/models/Task2Topic.js:4-18`) | `/admin/task2/topics/:id/questions` | `essay_type_recognition, fill_blank, rearrange, translation, error_correction, topic_sentence, short_writing, paraphrase` |

`fill_blank`, `rearrange`, `translation` xuất hiện ở **cả ba**. Cấu trúc field cũng gần giống hệt nhau (`level`, `type`, câu hỏi, `baseWords`, `options`, đáp án mẫu, `explanation`, `grammarPoint`, `orderIndex`, `isActive`). Mỗi trang tự viết lại form ẩn/hiện field theo `type` từ đầu (`Task1Exercises.jsx:99-231`, `Task2Exercises.jsx:129-222`, `WritingPractice.jsx:111-161`) — không có quy tắc rõ ràng để biết một bài "fill_blank" mới nên thêm vào trang nào trong 3 trang này.

*(`Task2Templates.jsx` KHÔNG nằm trong nhóm này — đây là ngân hàng mẫu câu cố định theo cấu trúc bài luận, khác hẳn về bản chất dù giao diện bảng lồng nhau trông giống `Task2Exercises.jsx`.)*

---

## 4. Thông tin 1 học sinh phân mảnh ở 3 trang không liên kết — Mức độ: **Cao**

Muốn xem đầy đủ về **1 học sinh**, admin phải tự tay mở và tìm lại tên học sinh đó ở **3 trang riêng biệt**, không có link chéo nào giữa chúng:

| Trang | Dữ liệu hiển thị | Endpoint |
|---|---|---|
| `Users.jsx` (`/users`) | username, email, họ tên, lớp, role, gói/premium, trạng thái cấm, ngày tạo, lần online cuối, số lần nhắc nhở | `GET /admin/users`, `GET /admin/users/:id` |
| `StudentHistory.jsx` (`/history`) | Lịch sử làm bài Reading/Listening/Writing/Speaking, điểm band, số câu đúng, thời gian làm | `GET /admin/recent-attempts?limit=300` |
| `VocabActivity.jsx` (`/vocab-activity`) | Sổ từ vựng, số từ đã thuộc, streak, biểu đồ hoạt động theo ngày/tháng/năm | `GET /admin/vocab-students`, `/admin/vocab-books/:id`, `/admin/vocab-activity/:id` |

Xác nhận: dòng bảng `Users.jsx` (`:483-497`) chỉ có nút Sửa/Gói/Nhắc nhở/Nhắn tin/Cấm/Xoá — không có link sang lịch sử làm bài hay hoạt động từ vựng của đúng học sinh đó. Ngược lại `StudentHistory.jsx` và modal chi tiết của `VocabActivity.jsx` cũng không link ngược về `Users.jsx`. `Dashboard.jsx` (`:159-194`) còn hiện thêm 1 bảng con "Bài nộp gần nhất" — về cơ bản là bản rút gọn (limit=10 thay vì limit=300) của đúng dữ liệu `StudentHistory.jsx` đã có, tạo ra 1 view thứ 4 trùng lặp một phần.

**Gợi ý (tham khảo):** gộp thành 1 trang "Chi tiết học sinh" — phần đầu là thông tin từ `Users.jsx` (gói, lớp, trạng thái), bên dưới là các tab Lịch sử làm bài / Hoạt động từ vựng, thay vì 3 trang rời rạc.

---

## 5. Hai cơ chế cấp Premium độc lập + AccessKey mồ côi — Mức độ: **Trung bình**

- **Cấp trực tiếp**: `Users.jsx` → `PlanModal` → `PUT /admin/users/:id/plan` (`backend/routes/admin/billing.js:19-41`).
- **Duyệt yêu cầu**: `UpgradeRequests.jsx` → `PUT /admin/upgrade-requests/:id/approve` (`billing.js:69-94`).

Cả hai cùng gọi `computePlanExpiry` rồi tự tay `User.findByIdAndUpdate({plan, planExpiresAt, planStartedAt})` — **viết lặp lại cùng 1 phép cập nhật** ở 2 chỗ (`billing.js:26-33` và `:81-83`) thay vì dùng chung 1 hàm `grantPremium(userId, months)`. Không hẳn là bug (2 luồng nghiệp vụ khác nhau: admin chủ động gán vs duyệt yêu cầu học sinh gửi), nhưng logic cập nhật nên gộp.

- **`backend/routes/admin/accessKeys.js`** — cơ chế **thứ ba**, hoàn toàn khác: cấp quyền làm **1 đề thi cụ thể** (không phải gói premium toàn site). Xác nhận: **không có trang admin nào** trong `admin-src` gọi tới API này (không có trong `Sidebar.jsx`, không có route trong `App.jsx`), và cũng **không có endpoint nào phía học sinh** để "dùng" access key — field `currentUses` trong model không bao giờ được tăng ở đâu cả. Đã được ghi nhận sẵn là nợ kỹ thuật trong `docs/MAINTENANCE.md:30` và `docs/ARCHITECTURE.md:164` ("có vẻ đã bị thay thế bởi hệ thống `plan`/`requirePremium` nhưng chưa gỡ bỏ hẳn"). Cần quyết định: hoàn thiện tính năng này hay xoá hẳn.

---

## 6. `StudentHistory.jsx` đếm/phân trang sai khi dữ liệu lớn — Mức độ: **Trung bình** (bug thật)

`Users.jsx` và `UpgradeRequests.jsx` dùng phân trang server-side thật, `total` lấy từ `countDocuments` (chính xác tuyệt đối). `StudentHistory.jsx` thì khác: gọi 1 lần duy nhất `GET /admin/recent-attempts?limit=300` (`StudentHistory.jsx:52`), và tiêu đề "Lịch sử làm bài ({filtered.length})" (`:100`) chỉ là số dòng **đã tải về** (tối đa ~900 dòng do backend giới hạn `rows.slice(0, LIMIT*3)`, `backend/routes/admin/stats.js:340`), không phải tổng số thật trong DB. Một khi tổng số lượt làm bài toàn hệ thống vượt ~900, các lượt làm bài cũ hơn **biến mất hoàn toàn khỏi trang** mà không có cách nào tải thêm — con số hiển thị cũng ngầm sai (thấp hơn thực tế) mà không có cảnh báo nào cho admin biết.

---

## 7. Route Listening nằm ngoài chuẩn tổ chức thư mục — Mức độ: **Thấp**

Reading (Passages + Reading Tests) nằm đúng chuẩn trong `backend/routes/admin/passages.js`, mount qua `backend/routes/admin/index.js`. Listening (Listening Tests, Listening Sections, upload audio, ghép đề) lại nằm lẫn trong `backend/routes/listening.js:34-80`, mount ở namespace `/api/listening` riêng (`backend/app.js:98`), **không hề đi qua `routes/admin/`**. `ListeningTests.jsx:92` gọi `/listening/admin/tests` trong khi `ReadingTests.jsx:23` gọi `/admin/tests` — hai namespace API khác nhau cho hai trang admin đáng lẽ song song nhau. Không ảnh hưởng chức năng, chỉ gây khó tìm code sau này.

---

## 8. Tên gọi gây hiểu lầm — Mức độ: **Thấp**

- **`Task2Exercises.jsx`**: tên gợi ý "danh sách bài tập" giống `Task1Exercises.jsx`, nhưng thực chất quản lý **Topics chứa Questions lồng bên trong** (`Task2Topic.questions`), API cũng dùng từ "topics"/"questions" chứ không phải "exercises" ở đâu cả. Dễ nhầm là "bản Task 2 của Task1Exercises" trong khi cấu trúc dữ liệu khác hẳn (phẳng vs lồng nhau).
- **`backend/routes/admin/billing.js`**: chỉ chứa Quản lý gói Premium + Duyệt yêu cầu nâng cấp — không hề đụng tới hoá đơn/học phí thật (`TuitionFee` mới là nơi quản lý tiền học phí, nằm ở `backend/routes/tuition.js` hoàn toàn tách biệt). Tên file dễ khiến người đọc tưởng đây là module thanh toán.
- **`TuitionFee.studentNotified`** (đã nêu ở mục 1): nghĩa là "học sinh đã báo admin đã chuyển khoản", không phải "đã báo cho học sinh".

---

## 9. Hai flow "dán text để import hàng loạt" viết riêng — Mức độ: **Thấp**

- `Vocabulary.jsx` → `ImportJsonModal` (`:299-398`) — dán JSON thô vào modal, `POST /vocab/admin/import` → model `VocabUnit`.
- `VocabularyLessonImport.jsx` — cả 1 trang riêng, dán theo cú pháp `@lesson`/`@word` tự định nghĩa, có bước Validate/Preview/Import riêng, `POST /vocabulary-lessons/admin/parse` + `/import` → model `VocabularyLesson`.

Dữ liệu đích **khác nhau thật sự** (đã ghi rõ trong comment `backend/models/VocabularyLesson.js:3-6`: `VocabUnit` là kho Cambridge Paraphrase có sẵn, `VocabularyLesson` là bài giáo viên giao riêng, `VocabBook` là sổ học sinh tự tạo — 3 khái niệm tách biệt hợp lý). Vấn đề chỉ nằm ở **phần khung UI** (textarea dán + nút validate + nút import) bị viết tay 2 lần theo 2 kiểu khác nhau — có thể tách thành 1 component "paste & import" dùng chung, không liên quan gì đến việc gộp dữ liệu.

---

## 10. Số liệu "học sinh"/"người dùng" lệch phạm vi giữa 2 trang — Mức độ: **Thấp**

`Users.jsx` tiêu đề "Người dùng ({total})" (`:417`) mặc định đếm **tất cả role** (student + teacher + admin) vì không lọc role mặc định. `Dashboard.jsx` thẻ "Học sinh" (`:141`) chỉ đếm role=student (`backend/routes/admin/stats.js:50`). Hai con số nhìn tên gần giống nhau nhưng phạm vi khác nhau — admin đối chiếu 2 trang dễ tưởng có sai lệch dữ liệu trong khi thực ra chỉ là 2 phép đếm khác nhau.

---

## 11. Hai endpoint backend không nơi nào gọi tới — Mức độ: **Thấp**

`backend/routes/admin/task2Topics.js:131` (`POST /admin/reseed-task2-week12`) và `:142` (`POST /admin/fix-task1-context`) — 2 route bảo trì 1 lần, chạy script `seedTask2Exercises.js`/`updateTask1Context.js`. Không có nơi nào trong `admin-src` gọi tới — có vẻ dùng thủ công qua curl/Postman khi cần, không phải code thừa từ tính năng đã gỡ, nhưng vẫn đáng lưu ý vì tồn tại như route công khai (có `teacherOnly` guard) mà không ai trong admin panel biết tới.

---

## Không phải vấn đề (đã kiểm tra, xác nhận hợp lệ tách riêng)

Để tránh báo động giả — các trường hợp sau **trông giống trùng lặp nhưng đã xác nhận là tách biệt hợp lý**, không cần gộp:

- `Vocabulary.jsx` (VocabUnit) / `VocabularyLessons.jsx` (VocabularyLesson) / `VocabBook` — 3 khái niệm vocab khác mục đích, đã tự document rõ trong code.
- `ReadingTests.jsx` vs `ListeningTests.jsx`, `Passages.jsx` vs `ListeningSections.jsx` — cấu trúc trang giống nhau (đã dùng chung `useListFilter`, `Pagination`, `SortSelect`) nhưng quản lý model/kỹ năng hoàn toàn khác nhau.
- `WritingGrades.jsx` — hàng đợi chấm bài AI cho bài học sinh đã nộp, khác hẳn nhóm trang biên tập nội dung (`WritingTests`, `WritingSamples`, `WritingPractice`).
- `Speaking.jsx` — tự quản lý trọn vẹn câu hỏi + đáp án mẫu Speaking qua route riêng, không chồng lấn trang nào khác.
- `Task2Templates.jsx` — ngân hàng mẫu câu cố định theo cấu trúc luận, khác bản chất với `Task2Exercises.jsx` dù giao diện bảng lồng nhau trông tương tự.
- `billing.js` vs `tuition.js` — không có model hay dữ liệu chung, chỉ trùng cảm giác tên gọi (đã nêu ở mục 8).
