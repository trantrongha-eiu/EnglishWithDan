# Platform Audit — Status Check & Forward Recommendations

**Ngày:** 2026-08-22
**Phạm vi:** Toàn bộ sản phẩm — đối chiếu lại 3 audit trước đó ([`STUDENT_UI_AUDIT.md`](STUDENT_UI_AUDIT.md) 25/07, [`ADMIN_PANEL_AUDIT.md`](ADMIN_PANEL_AUDIT.md) 25/07, [`PRODUCT_FEATURE_AUDIT.md`](PRODUCT_FEATURE_AUDIT.md) 18/08) với trạng thái code **hiện tại**, cộng thêm rà soát các tính năng mới thêm vào từ đó tới nay.
**Mục đích:** Trả lời 3 câu hỏi — (1) tính năng hiện có hoạt động tốt chưa, (2) UI/UX còn thiếu gì, (3) đề xuất tính năng/quản lý mới. Đây KHÔNG phải audit từ đầu — 3 audit trước đã rất kỹ, việc này chỉ đối chiếu delta + bổ sung.

---

## Kết luận nhanh

**Nền tảng đang ở trạng thái tốt và được bảo trì tích cực.** Cả 6 lỗi mức Cao trong `STUDENT_UI_AUDIT.md` và 10/11 lỗi trong `ADMIN_PANEL_AUDIT.md` đã được vá — phần lớn trong **cùng ngày hoặc 1 ngày sau khi audit được viết** (commit `0ea4747`, `a34b70f`, `5cdbf6e`, `c531cb2`, `9858070`, tất cả 25-26/07). `PRODUCT_FEATURE_AUDIT.md` (viết 18/08) cũng đã có 8/12 hạng mục được giải quyết **ngay trong cùng ngày** bởi 1 commit lớn (`682f13d`). Hiện tại **không còn lỗi mức Cao nào đang mở** trong cả 3 audit. Những gì còn lại chủ yếu là nợ kỹ thuật kiến trúc (trang trùng lặp) hoặc tính năng lớn cần đầu tư mới (thanh toán tự động, mock test 4 kỹ năng gộp).

---

## 1. Tình trạng các lỗi đã phát hiện trước đó

### 1a. STUDENT_UI_AUDIT.md (25/07) — 6/6 lỗi Cao đã fix

| # | Lỗi gốc | Trạng thái |
|---|---|---|
| register.html thiếu `toast.js` → kẹt "Đang xử lý..." | ✅ Fixed (`0ea4747`) |
| speaking.html thoát thi thử không xác nhận | ✅ Fixed (`0ea4747`) |
| inbox.html panel mobile không hiện | ✅ Fixed (`0ea4747`) |
| listening.html thiếu api-client.js/401 | ✅ Fixed (`0ea4747`) |
| task1-practice.html thiếu api-client.js/401 | ✅ Fixed (`0ea4747`) |
| writing-practice.html/task1-practice.html trùng ~4600 dòng | ⚠️ **Vẫn mở, còn nặng hơn** — nay 4708 dòng gộp, chưa tách component chung |

Phần lớn lỗi Trung bình/Thấp còn lại (dark mode thiếu, sticky sidebar che banner, hiệu ứng âm thanh trùng lặp, form tư vấn 3 bản...) cũng đã fix qua 4 đợt dọn dẹp theo nhóm trang. Vẫn còn mở (không phải Cao, đúng như đánh giá gốc): modal xác nhận tự viết tay ở nhiều trang thay vì dùng chung, chưa có module timer/autosave dùng chung, login.html/register.html vẫn trùng ~90% HTML, privacy.html/terms.html copy-paste khung trang.

**Lỗi mới phát hiện (chưa có trong audit gốc):**
- 🟡 **Trung bình** — `register.html` còn sót CSS/markup toast cũ (pre-migration) đè lên style thật của `toast.js` — style/dark-mode có nhưng **không hiển thị đúng** vì bị CSS cũ (`register.html:179-206`, `#toast-container` không có class thật) ghi đè. Ngay cả toast "Đăng ký thành công!" — thứ mà fix S1 phụ thuộc vào — cũng đang hiện sai giao diện.
- 🟢 Thấp — `privacy.html`/`terms.html` vẫn dùng `--gray` (không đổi theo theme) thay vì `--text2`, cùng lỗi đã fix riêng cho `404.html`.
- 🟢 Thấp — `index.html` vẫn còn vài khối "why-icon" nền pastel cứng không có dark override.

### 1b. ADMIN_PANEL_AUDIT.md (25/07) — 10/11 đã fix/merge

Đã fix hoàn toàn: 2 trang Writing Sample trùng nhau (gộp còn 1), thông tin học sinh phân mảnh 3 trang (gộp thành `StudentDetail.jsx`), 2 cơ chế cấp Premium (gộp `grantPremium()`), AccessKey mồ côi (xoá hẳn), bug đếm/phân trang `StudentHistory.jsx`, route Listening lệch chuẩn tổ chức, tên gọi gây hiểu lầm, và các mục Thấp còn lại.

⚠️ **Còn dở dang:** mục #1 (4 cơ chế "Nhắc nhở") — commit fix nói "đã gộp 4 cơ chế" nhưng thực tế chỉ gộp 2/4 (Users.jsx + VocabActivity.jsx dùng chung endpoint có đếm dồn); **3 cơ chế nhắc học phí (Tuition per-fee, bulk, cron) vẫn hoàn toàn tách biệt**, không đếm dồn, không bắn banner cảnh báo như cơ chế 1a.

**Lỗi mới phát hiện:**
- 🟡 **Trung bình** — Bất đối xứng: Reading vừa được thêm hẳn 1 trang thống kê riêng (`ReadingStats.jsx`, commit `754693c` 17/08) trong khi **Listening đã có sẵn backend y hệt** (`listAdminAttempts`/`getAdminAttemptsStats`) nhưng **chưa từng được gắn vào trang admin nào** — cùng pattern "code có sẵn nhưng không ai gọi tới" mà audit gốc từng nêu (AccessKey, 2 endpoint bảo trì).
- 🟢 Thấp — `Task2Topics.jsx` (đã đổi tên từ `Task2Exercises.jsx` để sửa lỗi đặt tên) vẫn phục vụ ở URL `/task2-exercises` — cái tên gây nhầm sống sót trong đường dẫn dù đã đổi tên file/nhãn sidebar.

### 1c. PRODUCT_FEATURE_AUDIT.md (18/08) — 8/12 đã giải quyết cùng ngày

Một commit lớn `682f13d` (cùng ngày viết audit) đã giải quyết: login/register vào lại design-system + dark mode, SRS thật cho Vocab (Leitner box + `nextReviewAt`/`srsBox`, API "từ cần ôn"), dashboard thêm khối "Khám phá các kỹ năng khác" (Reading/Listening/Writing/Speaking), Speaking có `avgBand` + profile.html có biểu đồ đường thật (SVG), notification center (chuông + dropdown), nhắc học phí đã có gửi email (`emailService.js`).

**Vẫn đúng như audit gốc (chưa giải quyết):**
- 🔴 Thanh toán 100% thủ công, không cổng thanh toán tự động — xác nhận là **quyết định sản phẩm chủ ý**, không phải bị bỏ quên (commit message nói rõ).
- 🔴 Không có mock test tổng hợp 4 kỹ năng ra 1 band chung.
- 🟡 Speaking pronunciation vẫn suy đoán từ transcript, không phân tích audio thật.
- 🟡 Mật độ inline-style vẫn cao, thậm chí **tăng nhẹ** (dashboard.html 125→131) do các tính năng mới thêm vào không refactor lại code cũ.
- 🟡 PWA mới làm 1 phần: có `manifest.json` + service worker nhưng chỉ gắn ở 3/26 trang. Accessibility có cải thiện (thêm aria-label ở dashboard/reading/writing) nhưng chưa phải rà soát WCAG đầy đủ.
- 🟡 Search toàn site đã có, nhưng **planner hướng tới tương lai vẫn chưa có** (chỉ có `targetExamDate` + banner điểm yếu, không có lịch tự động).

---

## 2. Tính năng mới từ 18/08 tới nay — đánh giá nhanh

| Tính năng | Commit | Đánh giá |
|---|---|---|
| **Review System** (bắt buộc xem lại câu sai sau Reading/Listening) | `f363b79`, `0c7429d` | Thiết kế tốt (idempotent, track từng lỗi, ẩn đáp án đúng phía server) — nhưng phát hành cùng ngày kèm 1 bug nghiêm trọng (lộ đáp án đúng trước khi retry, cả UI lẫn API) đã được vá ~20h sau (`7460712`). Nhắc nhở: pattern này (ship nhanh → phát hiện bug nghiêm trọng → vá cùng ngày) đang lặp lại — tốc độ tốt nhưng nên cân nhắc thêm 1 vòng review trước khi những tính năng chạm vào "đáp án đúng/sai" lên production. |
| **Achievement badges** (huy hiệu thành tích) | `1304916` | Tính toán "live" từ dữ liệu sẵn có (không cần bảng riêng) — gọn. **Gap:** hoàn toàn không có ở phía admin — giáo viên/admin không xem được học sinh đã đạt huy hiệu gì, chỉ học sinh tự thấy trong `profile.html`. |
| **Cron tự động chấm Writing bằng AI** (mỗi 20 phút) | `2ad90b0` | Tích hợp tốt, có guard chống chạy chồng, không tự publish điểm cho học sinh (vẫn cần giáo viên xác nhận) — không thấy vấn đề. |
| **Streak: Writing/Speaking không nối chuỗi** *(đã fix trong phiên làm việc này, 22/08)* | `6411c0f` | Lịch hoạt động (heatmap) đã tính Writing/Speaking là "có học" từ lâu, nhưng streak thật chỉ tính Reading/Listening/Vocab — học sinh chỉ luyện Writing/Speaking 1 ngày vẫn bị đứt streak dù lịch báo "đã học". Đã vá. |
| **Cache tĩnh JS/CSS không có cache-bust** *(đã fix trong phiên làm việc này, 22/08)* | `56a5d58` | Nguyên nhân của báo cáo "tính năng mới phải xoá cache mới thấy" — Render Static Site không hỗ trợ file `_headers` trong repo, không có build step để hash tên file. Đã thêm `?v=` vào 358 thẻ script/link trên 26 trang; cần nhớ bump version này ở mỗi lần deploy JS/CSS mới (đã ghi vào `DEPLOYMENT.md`). |

---

## 3. Sức khoẻ kỹ thuật (bổ sung, chưa có trong 3 audit trước)

- **Test coverage backend: 70.9% statements** (5457/7696), yếu nhất là tầng `controllers` (53.32% statements, 39.83% branches) — đúng tầng xử lý input trực tiếp từ người dùng, rủi ro cao nhất nếu có lỗi.
- **CI không có gate coverage** — `test:ci` chạy và xuất báo cáo coverage nhưng không fail build nếu coverage giảm. Lint cũng **không chặn** build (`|| true` trong workflow).

---

## 4. Đề xuất — Tính năng & Quản lý mới

Sắp theo ưu tiên **giá trị/nỗ lực**, không phải chỉ theo mức độ nghiêm trọng:

### Nên làm sớm (giá trị cao, nỗ lực thấp-vừa)
1. ✅ **DONE (22/08)** ~~Sửa gấp: register.html toast bị lệch style~~ — đã xoá CSS toast chết đè lên fix thật (`1df676c`).
2. ✅ **DONE (22/08)** ~~Hoàn thiện gộp cơ chế "Nhắc nhở"~~ — thêm `User.tuitionReminderCount`, cả 3 cơ chế nhắc học phí (per-fee/bulk/cron) giờ đều đếm dồn + tự reset khi hết nợ + banner cảnh báo riêng trên nav.js (`0893b81`).
3. ✅ **DONE (22/08)** ~~Thêm `ListeningStats.jsx`~~ — mirror `ReadingStats.jsx`, wire vào sidebar/router (`a53959f`).
4. ✅ **DONE (22/08)** ~~Cho admin/giáo viên xem huy hiệu học sinh~~ — tab "🏅 Huy hiệu" mới trong `StudentDetail.jsx` + `GET /admin/users/:id/badges` (`a53959f`).
5. ✅ **DONE (22/08)** ~~Bật CI coverage gate~~ — `coverageThreshold` trong `jest.config.js` (global 70/58/67/72%, controllers 52/38/53/55%); phát hiện thêm 1 test cũ (`learningToday.test.js`) fail tất định vào cuối tuần (phụ thuộc ngày trong tuần) — đã vá luôn (`f3f0b48`).
6. **auth-callback.html vẫn lạc nhịp design-system** — login.html/register.html đã được đưa về đúng token màu/font ngày 18/08, nhưng trang thứ 3 trong cùng cụm (`auth-callback.html`) bị bỏ sót, vẫn Poppins + gradient hồng-tím cứng.

### Đầu tư trung hạn (giá trị cao, nỗ lực lớn hơn)
7. **Cổng thanh toán tự động (VNPay/Momo/PayOS)** — vẫn là gap vận hành lớn nhất, xác nhận là quyết định có chủ ý nhưng đáng xem lại định kỳ khi số lượng học sinh tăng — càng nhiều học sinh, chi phí xác nhận thủ công mỗi tháng càng lớn.
8. **Mock test tổng hợp 4 kỹ năng ra 1 band chung** — dữ liệu từng kỹ năng đã đủ đầy (band riêng từng `TestAttempt`/`ListeningAttempt`/`WritingAttempt`/`SpeakingAttempt`), chỉ thiếu tầng "phiên thi" nối 4 phần + màn hình báo cáo tổng hợp kiểu Test Report Form. Đây là tính năng cạnh tranh trực tiếp với các nền tảng mock-test khác.
9. **Refactor writing-practice.html/task1-practice.html** — cặp trang song sinh ~4700 dòng đang lớn dần theo thời gian thay vì được gộp lại; càng để lâu càng khó tách, và lỗi đã từng lặp lại y hệt ở cả 2 trang vì code bị copy tay.

### Có thể làm sau (giá trị vừa/thấp hơn, hoặc cần quyết định phạm vi trước)
10. **Hoàn thiện PWA** — đã có manifest + service worker nhưng chỉ 3/26 trang gắn; nên hoặc rollout đủ 26 trang, hoặc thu hẹp phạm vi lại có chủ đích (vd chỉ Listening/Dictation, nơi lợi ích offline rõ nhất).
11. **Study planner hướng tới tương lai** — hiện chỉ có ngày thi mục tiêu + banner điểm yếu (nhìn về quá khứ); một lịch học gợi ý tự động theo ngày thi còn lại sẽ hoàn thiện vòng lặp "phân tích điểm yếu → gợi ý → lên lịch".
12. **Speaking chấm phát âm bằng audio thật** — cần tích hợp dịch vụ phân tích giọng nói chuyên biệt (kiểu ELSA/Speechace) thay vì suy đoán từ transcript; effort lớn nhất trong danh sách, nên cân nhắc dựa trên mức độ học sinh phàn nàn về độ chính xác điểm Speaking hiện tại.

---

## Phương pháp

Audit này được thực hiện bằng 3 agent song song, mỗi agent đọc lại toàn bộ 1 trong 3 audit gốc, đối chiếu từng phát hiện với code hiện tại (không suy đoán từ text audit), trích dẫn file/dòng cụ thể và commit đã fix (nếu có), đồng thời quét thêm các vấn đề mới phát sinh từ các commit sau ngày audit gốc. Toàn bộ trích dẫn evidence trong báo cáo con đã được giữ nguyên; báo cáo này chỉ tổng hợp lại theo hướng ưu tiên hành động.
