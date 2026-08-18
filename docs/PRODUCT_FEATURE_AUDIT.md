# Product & Feature Audit — Tính năng thiếu & Giao diện cũ cần cải thiện

**Ngày:** 2026-08-18
**Phạm vi:** Toàn bộ sản phẩm (frontend học sinh + backend + admin panel), nhìn ở góc độ **sản phẩm/UX** — khác với 2 audit trước đó vốn tập trung vào bug kỹ thuật và trùng lặp code:
- [`STUDENT_UI_AUDIT.md`](STUDENT_UI_AUDIT.md) (25/07) — đã fix xong các lỗi Cao (đã verify lại: `register.html` có `toast.js`, `listening.html` có `api-client.js`, `inbox.js` đã gắn class `.active`).
- [`ADMIN_PANEL_AUDIT.md`](ADMIN_PANEL_AUDIT.md) (25/07) — vẫn còn nguyên giá trị, chưa lặp lại nội dung ở đây.

**Mục đích:** Thuần rà soát — chưa sửa gì. Trả lời 2 câu hỏi: (1) tính năng "hay ho" nào nền tảng luyện IELTS nên có mà site chưa có, (2) tính năng/giao diện cũ nào cần đầu tư thêm.

---

## Tóm tắt ưu tiên

| # | Phát hiện | Giá trị/Ảnh hưởng | Loại |
|---|---|---|---|
| 1 | Thanh toán học phí & nâng cấp Premium 100% thủ công, không cổng thanh toán tự động | Cao — thất thu, tốn công admin mỗi tháng | Thiếu tính năng |
| 2 | `login.html`/`register.html` lạc hoàn toàn khỏi design-system (font, màu, không load tokens.css) | Cao — ấn tượng đầu tiên của user mới | UI cũ |
| 3 | Vocab không có spaced-repetition (SM-2/Leitner) thật sự | Cao — đây là core value của 1 app học từ | Thiếu tính năng |
| 4 | Dashboard (trang đầu sau đăng nhập) chỉ giới thiệu tính năng Vocab, không nhắc gì tới Reading/Listening/Writing/Speaking/Dictation/Grammar | Cao — user mới khó khám phá hết tính năng đã xây | UI/UX |
| 5 | Không có mock test tổng hợp 4 kỹ năng ra band điểm chung (mỗi kỹ năng đang tách rời) | Trung bình-Cao | Thiếu tính năng |
| 6 | Analytics/tiến độ học rất nông: chỉ 10 attempt gần nhất/kỹ năng, không có biểu đồ band theo thời gian, Speaking thiếu hẳn field `avgBand` | Trung bình-Cao | Tính năng sơ khai |
| 7 | Không có notification center/bell — chỉ có badge Hộp thư + banner cứng, không xem lại được thông báo cũ | Trung bình | Thiếu tính năng |
| 8 | Nhắc học phí chỉ gửi tin nhắn trong app — học sinh không mở web sẽ không bao giờ thấy | Trung bình | Tính năng sơ khai |
| 9 | Speaking AI chấm phát âm dựa trên suy đoán từ transcript, không phân tích audio thật (code tự ghi chú rõ hạn chế này) | Trung bình | Tính năng sơ khai |
| 10 | Mật độ inline-style rất cao ở các trang lõi (dashboard 125 chỗ, index 97, listening 68) dù đã có tokens.css/components.css | Trung bình | UI cũ (nợ kỹ thuật) |
| 11 | Không có PWA/offline, accessibility (`aria-*`/`alt`) gần như không có | Trung bình-Thấp | Thiếu tính năng |
| 12 | Không có search toàn site, không có study planner hướng tới tương lai (chỉ có heatmap nhìn lại quá khứ) | Thấp-Trung bình | Thiếu tính năng |

---

## A. Tính năng sản phẩm còn thiếu

### 1. Thanh toán tự động — gap lớn nhất về vận hành
- `tuitionService.notifyPayment()` chỉ set `studentNotified=true` + gửi `Message` nội bộ cho admin; admin tự tay đánh dấu `isPaid`.
- `upgrade.controller.js createRequest`: học sinh gửi yêu cầu, response nói thẳng "Admin sẽ xác nhận trong vòng 24 giờ" — không có webhook VNPay/Momo/PayOS nào tự xác nhận & tự cấp quyền.
- Với mô hình thu phí hàng tháng (`TuitionFee` theo month/year) và gói Premium, mỗi tháng admin phải xác nhận thủ công cho từng học sinh — vừa chậm trải nghiệm học sinh (chờ tới 24h mới được dùng), vừa tốn công admin, vừa dễ sai sót/quên.

### 2. Spaced-repetition thật cho Vocab
- `VocabBook`/`VocabUnit`/`VocabularyLesson` không có field kiểu `nextReviewDate`/`easeFactor`/`interval`. "Ôn lại từ hay sai" chỉ lọc từ sai ≥3 lần, không có lịch nhắc theo thuật toán quên (SM-2/Leitner) như Anki/Quizlet/Memrise — trong khi vocab là 1 trụ cột lớn của sản phẩm (nhiều tính năng: streak, Búa Daniel, leaderboard đều xoay quanh vocab).

### 3. Mock test tổng hợp 4 kỹ năng
- Dữ liệu từng kỹ năng đã đầy đủ (`TestAttempt`, `ListeningAttempt`, `WritingAttempt`, `SpeakingAttempt` đều độc lập, đều ra band riêng) nhưng không có lớp "phiên thi" nối 4 kỹ năng thành 1 buổi ~2h45p ra band tổng — đây là tính năng lõi của các nền tảng mock-test cạnh tranh. Không cần xây lại gì từ đầu, chỉ thiếu tầng orchestration + UI.
- Đi kèm: không có certificate/PDF "Test Report Form" giả lập sau khi hoàn thành.

### 4. Notification center
- Toàn bộ thông báo hiện chỉ là: badge đếm trên "Hộp thư" (poll 20 giây) + vài banner full-width chèn cứng (hết hạn gói, nhắc học, streak). Không có nơi tổng hợp để xem lại thông báo đã đóng/đã qua.

### 5. Nhắc học phí ra ngoài app
- `nodemailer` hiện chỉ dùng cho OTP reset mật khẩu. `sendReminder`/`sendBulkReminders` chỉ tạo `Message` nội bộ — học sinh không đăng nhập sẽ không bao giờ thấy nhắc học phí. Nên có ít nhất email digest, tốt hơn nữa là cân nhắc push notification.

### 6. Khác (giá trị thấp hơn, dễ làm sau)
- Không có PWA/offline (không `manifest.json`/service worker) — lợi ích rõ nhất cho luyện Listening/Dictation trên di động.
- Accessibility gần như bằng 0 (`dashboard.html` chỉ 1 `aria-label`; `reading.html`/`writing.html` = 0) — ảnh hưởng SEO và nhóm dùng keyboard/screen reader.
- Không có search toàn site (chỉ search được trong 1 sổ từ vựng).
- Không có teacher live-annotation (inline comment) trên bài Writing/Speaking — hiện chỉ có band tổng + AI feedback dạng đoạn văn.
- Không có referral/coupon program.

---

## B. Tính năng đã có nhưng còn sơ khai, cần đầu tư thêm

### 1. Analytics/tiến độ học — nông hơn vẻ ngoài
- `GET /user/stats` chỉ lấy **10 attempt gần nhất mỗi kỹ năng** — không đủ để vẽ xu hướng dài hạn chính xác.
- **Speaking thiếu hẳn field `avgBand`** trong response (`speaking: { total, history }`) trong khi Reading/Listening/Writing đều có — rõ ràng bị bỏ sót, không phải chủ ý.
- `frontend/profile.html` phần "Band Score của tôi" chỉ vẽ 1 thanh bar tĩnh (band hiện tại), **không có biểu đồ đường theo thời gian** — không dùng Chart.js hay canvas chart thật nào trong toàn bộ frontend.
- Không có gợi ý "điểm yếu" tự động (vd: "bạn yếu Task Response, thử thêm bài X") — chỉ trả số liệu thô, học sinh tự diễn giải.

### 2. Speaking AI feedback — phát âm chỉ là suy đoán
- `geminiService.js` tự ghi chú: pronunciation score "is an estimation based on the transcript and speech recognition quality... you cannot hear real audio". Có đủ 4 sub-score (fluency/vocabulary/grammar/pronunciation) nhưng không phân tích waveform/trọng âm/ngữ điệu thật — độ tin cậy thấp hơn các app chuyên biệt (ELSA, Speechace).

### 3. Reminder system phân mảnh (bổ sung góc nhìn payment cho phát hiện đã có ở ADMIN_PANEL_AUDIT mục 1)
- 4-6 cơ chế nhắc độc lập đã nêu ở audit trước; điểm mới ở đây: **không cái nào trong số đó ra khỏi app** (không email/SMS/push) — rủi ro thất thu học phí nếu học sinh ngừng mở web.

### 4. Dashboard — trang chủ ứng dụng đang chỉ đại diện cho Vocab
- Welcome screen của `dashboard.html` chỉ giới thiệu 4 tính năng thuộc Vocab (nhập hàng loạt, streak, Paraphrase Cambridge, Búa Daniel) dù đây là trang đầu tiên user mới thấy sau đăng nhập (logo trong `nav.js` trỏ về đây) — Reading/Listening/Writing/Speaking/Dictation/Grammar/Tips hoàn toàn không được nhắc tới ở đây, chỉ nằm trong dropdown nav mà user phải tự khám phá.

---

## C. Giao diện cũ cần làm mới

### 1. `login.html` / `register.html` — cũ nhất, lạc nhịp hoàn toàn
- Dùng font `Poppins` + gradient hồng-tím cứng (`#f093fb → #f5576c`), trong khi phần còn lại của site đã chuyển sang `Plus Jakarta Sans` (index/dashboard) hoặc `Inter` (reading/listening/writing) — 3 font-family khác nhau cùng lúc.
- `register.html` là trang **duy nhất** không load `css/tokens.css` lẫn `css/components.css` — tự cô lập hoàn toàn khỏi design-system. `login.html` có load nhưng vẫn bị `login.css` override bằng giá trị hard-code riêng.
- Lần sửa gần nhất của cả 2 trang là 26/07 (đợt vá bug `toast.js`); trong khi `dashboard.html`/`reading.html` được cập nhật liên tục tới 17/08. Đây là 2 trang "cổng vào" đầu tiên nhưng lại lạc hậu nhất — ưu tiên cao vì ảnh hưởng ấn tượng đầu với user mới.

### 2. Mật độ inline-style cao ở các trang lõi — nợ kỹ thuật UI
- `dashboard.html`: 125 chỗ `style="..."` inline; `index.html`: 97; `listening.html`: 68; `profile.html`: 57; `speaking.html`: 48. Ngược lại `dictation.html` (trang mới nhất) có 0 inline style, code sạch.
- Không phải do thiếu design-system (tokens.css/components.css đã tồn tại đầy đủ) mà do các trang cũ tích lũy qua nhiều đợt patch nhanh chưa được refactor lại — sẽ ngày càng khó giữ UI nhất quán và khó áp dụng theme mới nếu cần sau này.

---

## Không thuộc phạm vi audit này

Các phát hiện về trùng lặp code/kiến trúc admin panel (4 cơ chế nhắc nhở, 2 trang cùng quản lý WritingSample, 3 hệ thống bài tập ngữ pháp chồng chéo, AccessKey mồ côi...) đã có đầy đủ trong [`ADMIN_PANEL_AUDIT.md`](ADMIN_PANEL_AUDIT.md), không lặp lại ở đây.
