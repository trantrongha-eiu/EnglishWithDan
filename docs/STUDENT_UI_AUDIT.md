# Student UI Audit — luồng, trùng lặp, dark mode, mobile

**Ngày:** 25/07/2026
**Phạm vi:** Toàn bộ 23 trang giao diện học sinh (`frontend/*.html`), rà soát bằng 4 đợt research song song theo nhóm trang.
**Mục đích:** Thuần rà soát — chưa sửa gì. Mỗi phát hiện gắn mức độ (Cao/Trung bình/Thấp) theo mức ảnh hưởng tới học sinh, không phải độ khó sửa.

---

## Tóm tắt ưu tiên — 6 lỗi mức Cao cần xem trước

| # | Lỗi | Trang | Ảnh hưởng thực tế |
|---|---|---|---|
| 1 | `register.html` thiếu thẻ `<script>` load `toast.js` → mọi `showToast()` ném lỗi | register.html | **Đăng ký thành công vẫn bị kẹt nút "Đang xử lý..." mãi mãi, không chuyển trang, không có thông báo** — học sinh tưởng bị treo dù tài khoản đã tạo thành công |
| 2 | Nút "Thoát" khi đang thi thử nhiều phần (Part 1-3) không hỏi xác nhận | speaking.html | Bấm nhầm 1 cái là mất toàn bộ bài thi thử đang làm dở, không có cách khôi phục |
| 3 | Panel đọc tin nhắn trên mobile không bao giờ hiện ra (thiếu toggle class `.active`) | inbox.html | **Hộp thư gần như không dùng được trên điện thoại** — không đọc được nội dung, không trả lời được, không nhận được quà búa/lửa |
| 4 | Không load `api-client.js`, không xử lý lỗi 401 (hết hạn đăng nhập) | listening.html | Nếu phiên đăng nhập hết hạn giữa bài nghe 40-60 phút, lỗi âm thầm không rõ nguyên nhân |
| 5 | Cùng lỗi thiếu xử lý 401 như trên | task1-practice.html | Bài làm có thể không lưu được mà không có cảnh báo |
| 6 | `writing-practice.html` và `task1-practice.html` là 2 bản gần như trùng lặp hoàn toàn (~4.600 dòng code song song) | writing-practice.html, task1-practice.html | Sửa lỗi ở 1 trang dễ quên trang kia — đã xảy ra thật (xem lỗi "chế độ Thi thử vẫn tra được từ điển" bên dưới, có ở CẢ HAI trang) |

---

## 1. Nhóm Reading / Listening / Writing / Task 1 Practice

*(reading.html, listening.html, writing.html, writing-practice.html, task1-practice.html)*

Điểm chung tốt: cả 5 trang đều load đúng `theme.js`, `nav.js`, `tokens.css`, `mobile.css`, và tính năng tra từ điển (double-click) đều được gắn đúng — không trang nào bị thiếu như essential-grammar.html từng bị (đã fix, còn nguyên).

Điểm chung cần lưu ý: **không có module dùng chung cho đồng hồ đếm giờ / tự động lưu bài** — mỗi trang (reading-v2.js, listening.html, writing.js, writing-practice.html, task1-practice.html, task2-practice.html, task2-template.html) tự viết lại `setInterval` đếm giờ và `saveExamToStorage()` riêng.

### reading.html
- 🟡 **Trung bình** — Banner "bạn có bài thi dở dang" (`#resume-banner`) dùng `position:sticky;top:0` nhưng không cộng `--nav-height`, nên khi cuộn trang banner bị **thanh nav che khuất hoàn toàn** (`reading.css:259-262`). listening.html lại xây banner tương tự theo kiểu khác hẳn (không sticky) — hai trang chị em giải quyết cùng 1 vấn đề bằng 2 cách khác nhau.
- 🟡 **Trung bình** — Khung loading-skeleton (`.test-card-skeleton`, nền trắng) không có override dark mode → **chớp trắng mỗi lần tải danh sách đề** khi đang ở giao diện tối.
- 🟢 Thấp — `.fs-btn`/`.btn-redo-test` có override dark mode bên listening.css nhưng KHÔNG có bên reading.css — cùng 1 nút, sáng ở trang này, tối ở trang kia.
- 🟢 Thấp — Modal xác nhận (nộp bài/thoát) tự viết riêng thay vì dùng `js/shared/confirm-dialog.js` chung.
- ✅ Mobile: làm kỹ nhất trong 5 trang — có breakpoint riêng cho màn hình thi (`.exam-split` xếp dọc, thanh công cụ cuộn ngang).

### listening.html
- 🔴 **Cao** — Là trang DUY NHẤT trong 5 trang không load `js/shared/api-client.js`, **không xử lý mã lỗi 401 ở đâu cả**. Bài nghe thường kéo dài 40-60+ phút — nếu token hết hạn giữa chừng, lưu bài/nộp bài thất bại âm thầm, học sinh không được thông báo "phiên đăng nhập hết hạn, đăng nhập lại".
- 🟡 Trung bình — Tự viết lại timer/autosave riêng (cùng vấn đề chung ở trên).
- 🟢 Thấp — `.btn-redo-test` thiếu dark mode (đối xứng với lỗi bên reading.css).
- ✅ Tra từ điển tắt đúng lúc trong bài thi thật, bật lại đúng lúc khi xem lại — nhất quán với reading.html.

### writing.html
*(Lưu ý: đây là trang DUY NHẤT nộp bài thật cho giáo viên chấm — khác hẳn writing-practice.html/task1-practice.html bên dưới, cần giữ phân biệt rõ)*
- 🟢 Thấp — Tự viết 4 modal xác nhận riêng (`#practice-exit-modal`, `#practice-submit-modal`, `#exit-modal-overlay`, `#confirm-modal-overlay`) thay vì dùng chung.
- 🟢 Thấp — Tra từ điển chỉ bật ở màn luyện tập lẻ + xem lại, KHÔNG bật ở bài thi thật có tính giờ — có vẻ là chủ ý (đã ghi chú trong code), không phải bug, nên xác nhận lại với admin cho chắc.
- ✅ Dark mode + mobile đều ổn, có dùng đúng `api-client.js`.

### writing-practice.html & task1-practice.html
*(2 trang luyện câu ngắn có game hóa — writing-practice.html là "Viết câu giao tiếp" chung chung, task1-practice.html là luyện riêng 6-7 kỹ năng Task 1)*
- 🔴 **Cao (kiến trúc)** — Hai trang dùng chung 1 file CSS (`writing-practice.css`), cùng hệ class `wp-*`, cùng cấu trúc HTML/JS gần như copy-paste (~4.600 dòng gộp lại) thay vì 1 component dùng chung có tham số riêng theo kỹ năng. Hậu quả thực tế: lỗi dưới đây bị lặp lại y hệt ở CẢ HAI trang vì code bị sao chép.
- 🟡 **Trung bình (x2, 1 mỗi trang)** — Tra từ điển **KHÔNG tắt** khi vào "Chế độ Thi thử", trong khi chính trang này ghi rõ "Không có gợi ý — giống thi thật". Học sinh double-click vẫn tra được nghĩa từ ngay trong lúc thi thử "không gợi ý".
- 🔴 **Cao** — task1-practice.html cũng thiếu `api-client.js`/xử lý 401 giống listening.html (rủi ro thấp hơn vì bài ngắn hơn, nhưng vẫn có thể mất bài làm âm thầm).
- 🟢 Thấp — Tên/tiêu đề trên writing-practice.html khá chung chung, dễ nhầm với writing.html hoặc task1-practice.html nếu học sinh vào thẳng từ link/bookmark thay vì qua menu (menu đã ghi rõ "Viết câu giao tiếp").
- ✅ Mobile + dark mode: làm tốt nhất trong nhóm — sidebar chuyển thành bottom-sheet đúng chuẩn, 0 lỗ hổng dark mode tìm thấy.

---

## 2. Nhóm Task 2 / Grammar / Speaking / Courses

*(task2-practice.html, task2-template.html, essential-grammar.html, speaking.html, courses.html)*

### task2-practice.html & task2-template.html
- 🟢 Thấp (×4) — Modal xác nhận thoát, modal lịch sử luyện tập, hàm định dạng thời gian mm:ss đều bị viết trùng giữa 2 trang thay vì dùng chung. `task2-template.html` có link nhanh sang 3 trang luyện viết khác ở sidebar, `task2-practice.html` thì không có chiều ngược lại.
- 🟡 Trung bình — task2-template.html: tiến độ luyện Cloze chỉ lưu ở `localStorage`, không có cảnh báo "xoá cache trình duyệt = mất tiến độ".
- ✅ Dark mode: rà soát từng màu cứng (hardcoded) trong cả 2 trang — không tìm thấy lỗ hổng nào, mọi màu đều có cặp override dark mode.
- ✅ Mobile: cả 2 đều có breakpoint thật cho vùng luyện tập (không chỉ cho nav), input tăng lên 16px trên mobile để tránh iOS tự zoom.

### essential-grammar.html
- ✅ **Xác nhận: fix tra từ điển từ trước vẫn còn nguyên, không bị revert.**
- 🟢 Thấp — Hiệu ứng âm thanh đúng/sai (`playOk`/`playWrong`) viết trùng lặp y hệt ở 3 trang khác (task2-practice, task2-template, essential-grammar) — code còn tự ghi chú lại điều này nhưng chưa gộp thành module chung.
- ✅ Dark mode + mobile: tốt nhất trong nhóm 5 trang này — mobile dùng FAB + bottom-sheet đúng chuẩn thay vì chỉ ép layout desktop nhỏ lại.

### speaking.html
*(Không rà lại phần logic ghi âm mic — đã fix và verify ở phiên làm việc trước)*
- 🔴 **Cao** — Nút "Thoát" ở màn hình thi thử tuần tự (nhiều Part) không có xác nhận nào — bấm 1 cái mất sạch bài đang làm, trong khi task2-practice.html/task2-template.html đều có hỏi "Dừng luyện tập?" trước khi thoát.
- 🟡 Trung bình — Cùng lỗi thiếu xác nhận ở màn luyện tập từng câu đơn lẻ (rủi ro thấp hơn vì chỉ mất 1 câu).
- 🟡 Trung bình — Dark mode: tiêu đề card "Nhận xét tổng thể" (feedback) không có override — chữ xám đậm (#374151) trên nền xanh đen (#1f2937) gần như không đọc được.
- 🟡 Trung bình — Dark mode: tiêu đề màn hình trống (khi lọc không ra câu hỏi nào) màu gần đen (#111) trên nền cũng gần đen → **chữ vô hình**.
- ✅ Tra từ điển, nút mic responsive trên mobile, toast đều ổn.

### courses.html
*(Xác nhận: đây là trang giới thiệu khoá học công khai, KHÔNG cần đăng nhập, không có luồng mua/enroll — chỉ dẫn tới form liên hệ tư vấn. Không trang nào trong app (dashboard, profile...) link ngược lại đây — có vẻ là chủ ý tách biệt trang marketing/trang học, nên xác nhận lại với admin.)*
- 🟡 Trung bình — Popup "Đăng ký tư vấn" (`consult-modal.js`, dùng chung ở cả courses/about/contact) **hoàn toàn không có dark mode** — bấm "Tư vấn ngay" khi đang ở giao diện tối sẽ hiện 1 popup trắng chói lên giữa trang tối.
- 🟡 Trung bình — Trang tự viết nav/menu riêng thay vì dùng `nav.js` chung (giống 6-7 trang marketing khác) — có thể là chủ ý (tách app khỏi trang marketing), cần admin xác nhận.
- ✅ Dark mode phần còn lại của trang + mobile: đều ổn.

---

## 3. Nhóm Dashboard / Profile / Inbox / Học phí / Trang chủ

### dashboard.html
- 🟡 Trung bình — Sidebar sổ từ vựng (`position:sticky`) không cộng thêm chiều cao banner cảnh báo (`--expiry-banner-height`) → khi có banner "sắp hết hạn Premium" hoặc banner "bị nhắc nhở 3 lần" hiện ra, sidebar cuộn lên sẽ bị banner đè lên.
- 🟡 Trung bình — Cơ chế cảnh báo "đang làm dở quiz Classroom" chỉ áp dụng cho nút "← Back" của chính nó — thoát bằng sidebar/menu mobile/nút back trình duyệt thì **KHÔNG cảnh báo gì, mất bài làm dở âm thầm**.
- 🟢 Thấp (×3) — Nút "Ôn lại từ hay sai" bản mobile thiếu 1 màu hover dark mode (chớp sáng khi chạm); banner "nhận búa Daniel" dùng inline style nên không thể override dark mode được (tương tự ở inbox.html và index.html — nên sửa gộp 1 lần); `<html lang="en">` trên trang toàn tiếng Việt.
- ✅ **Xác nhận: KHÔNG có lỗi 2 số liệu streak khác nhau** (như đã tìm thấy bên admin panel) — cả 2 chỗ hiển thị streak dùng chung 1 hàm, 1 API.
- ✅ Mobile: bottom-sheet/FAB, leaderboard giới hạn cuộn, phân lớp Classroom quiz — tất cả các fix từ phiên trước vẫn còn nguyên và hoạt động đúng.

### profile.html
- 🟡 Trung bình — Cùng lỗi sticky-sidebar-che-banner như dashboard.html (chỉ xảy ra trên desktop, mobile đã chuyển sang layout tĩnh nên không bị).
- ✅ Số liệu streak/kho đồ khớp với dashboard.html (đọc cùng field DB, không có sai lệch).
- ✅ Dark mode + mobile: đầy đủ, không có lỗ hổng.

### inbox.html
- 🔴 **Cao** — CSS chờ 1 class `.active` để hiện panel đọc tin nhắn trên mobile, nhưng `inbox.js` **không bao giờ gắn class đó** — trên điện thoại, bấm vào tin nhắn thì nội dung có tải nhưng panel vẫn ẩn, không thấy gì cả. Không có nút "quay lại" nào cho kiểu 2-cột→1-cột này nếu sửa. **Học sinh hiện tại không đọc được tin nhắn, không trả lời được, không nhận được quà búa/lửa từ điện thoại.**
- 🟢 Thấp — Khung "nhận quà" (búa/lửa) dùng gradient màu cam cứng, không có bản dark mode — không bị mờ chữ nhưng lạc tông giữa 1 trang toàn dùng token màu chuẩn.
- 🟢 Thấp — 1 chỗ dùng cứng `64px` thay vì biến `--nav-height`.
- ✅ Luồng nhận quà, tra từ điển, và việc 2 banner cảnh báo không đè lên layout — đều ổn.

### tuition.html (Học phí)
- 🟡 Trung bình — Luồng xác nhận thanh toán chỉ 1 chiều: học sinh bấm "Đã chuyển khoản" thì admin nhận được tin nhắn, nhưng khi **admin xác nhận đã nhận tiền thì học sinh KHÔNG được thông báo gì** — chỉ biết khi tự quay lại trang xem badge đổi màu.
- 🟡 Trung bình — Trang không có `@media` nào cho riêng nó; dòng hiển thị số tài khoản ngân hàng không có `flex-wrap` → có nguy cơ tràn/bị cắt trên điện thoại màn hình hẹp (~375px).
- ✅ QR code, bảo mật (escape HTML cho field admin nhập) đều ổn.

### index.html (Trang chủ / Landing)
*(Xác nhận: đây là trang marketing công khai trước đăng nhập, cố ý tách biệt hoàn toàn khỏi hệ thống nav/banner của app đã đăng nhập — không phải lỗi)*
- 🟢 Thấp — Vài khối nội dung (thẻ tính năng AI-writing, nút "lên đầu trang") dùng inline style nền trắng cứng, không có đường nào để override dark mode — tạo mảng trắng lạc giữa trang tối.
- ✅ Phần lớn trang dark-mode tốt, có ghi chú hẳn trong code về việc này.

---

## 4. Nhóm trang tĩnh / Đăng nhập

*(login.html, register.html, auth-callback.html, about.html, contact.html, privacy.html, terms.html, 404.html)*

### 🔴 register.html — LỖI NGHIÊM TRỌNG NHẤT TOÀN BỘ BÁO CÁO
Trang thiếu hẳn thẻ `<script src="js/shared/toast.js">` (login.html có, register.html thì không — có vẻ bị sót khi dọn code). Toàn bộ form dùng hàm `showToast(...)` ở **11 chỗ khác nhau**, tất cả đều lỗi `ReferenceError` vì hàm không tồn tại.
Hậu quả cụ thể:
- Lỗi nhập liệu (thiếu trường, mật khẩu yếu, chưa đồng ý điều khoản...) — **không hiện thông báo gì cả**, form chỉ đơ ra.
- **Đăng ký THÀNH CÔNG** — lỗi xảy ra ngay trước dòng chuyển hướng sang login.html, nên: không có thông báo "thành công", **không tự chuyển trang**, nút bấm kẹt ở trạng thái "Đang xử lý..." vĩnh viễn. Học sinh tưởng bị treo máy, không biết tài khoản đã được tạo thật.

### login.html / register.html / auth-callback.html — cụm 3 trang riêng biệt
- 🟢 Thấp — Cả 3 trang dùng font chữ (Poppins) + tông màu hồng-tím hoàn toàn khác với phần còn lại của web (Plus Jakarta Sans + xanh-đỏ), **không có dark mode** ở cả 3.
- 🟢 Thấp — login.html/register.html giống nhau ~90% (HTML/CSS bị copy chứ không dùng chung component).
- 🟢 Thấp — Cỡ chữ ô nhập liệu <16px → điện thoại iPhone sẽ tự động zoom vào khi chạm vào ô nhập, trải nghiệm giật cục ngay lần đầu học sinh vào web.
- ✅ auth-callback.html xử lý lỗi tốt, không bị màn hình trắng câm lặng khi OAuth thất bại.
- (Đã biết từ trước, không phải phát hiện mới) Cả 2 trang gọi thẳng URL API production thay vì qua lớp dùng chung — chỉ ảnh hưởng khi test local, không ảnh hưởng học sinh thật.

### about.html / contact.html — trùng lặp form tư vấn
- 🟡 Trung bình — **CÙNG 1 form "Đăng ký tư vấn miễn phí" bị cài đặt riêng 3 LẦN**: 1 bản nhúng thẳng trong about.html, 1 bản gần giống hệt nhúng trong contact.html, và 1 bản thứ 3 là popup dùng chung (`consult-modal.js`) — cả 3 đều gửi tới cùng 1 API `/api/contact`. Sửa 1 chỗ dễ quên 2 chỗ còn lại.
- ✅ Dark mode + mobile: cả 2 trang đều ổn.

### privacy.html / terms.html / 404.html
- 🟢 Thấp — Toàn bộ nav/footer/khung nội dung pháp lý bị copy-paste giữa privacy.html và terms.html thay vì dùng 1 khung chung.
- 🟢 Thấp — 404.html: dùng token màu `--gray` (không đổi theo theme) thay vì `--text2` cho dòng thông báo lỗi → chữ mờ hơn bình thường khi ở dark mode.
- ⚠️ **Lưu ý riêng, không phải lỗi kỹ thuật**: privacy.html tự ghi chú rõ nội dung điều khoản/chính sách là **bản nháp chưa được luật sư rà soát** — đây là rủi ro pháp lý thật, nên biết trước khi công bố rộng rãi.
- ✅ Cả 3 trang không phải ngõ cụt — đều có đường quay lại trang chủ/dashboard rõ ràng. 404.html đặc biệt làm tốt (2 nút thoát rõ ràng).

### Bảng tổng hợp dark mode / mobile — nhóm trang tĩnh

| Trang | Dark mode | Mobile |
|---|---|---|
| login.html | Không | Có |
| register.html | Không | Có |
| auth-callback.html | Không | Không cần (layout đơn giản) |
| about.html | Có | Có |
| contact.html | Có | Có |
| privacy.html | Có | Có (layout đơn cột tự thích ứng) |
| terms.html | Có | Có |
| 404.html | Có | Có |

---

## Các pattern lặp lại nhiều nơi (đáng gộp sửa 1 lần thay vì từng trang)

1. **Không có module dùng chung cho đồng hồ đếm giờ / tự động lưu bài** — bị viết lại độc lập ở ít nhất 7 trang (reading, listening, writing, writing-practice, task1-practice, task2-practice, task2-template).
2. **Modal xác nhận thoát/nộp bài** bị viết tay riêng ở nhiều trang thay vì dùng `js/shared/confirm-dialog.js` — 1 số có lý do chính đáng (cần nút "lưu nháp" phụ mà component chung chưa hỗ trợ), nhưng phần khung/CSS vẫn có thể dùng chung.
3. **Banner/thẻ dùng inline style hoặc gradient màu cứng, không có đường override dark mode** — lặp lại ở dashboard.html (banner búa Daniel), inbox.html (khung nhận quà), index.html (thẻ tính năng) — 3 nơi, 1 nguyên nhân, nên sửa gộp.
4. **Sticky sidebar không cộng `--expiry-banner-height`** — dashboard.html, profile.html đều thiếu, trong khi task2-template.html/essential-grammar.html đã làm đúng — có sẵn công thức đúng để copy sang 2 trang còn thiếu.
5. **Nav/footer trang marketing** (index/about/contact/courses/privacy/terms/404) đều tự viết riêng thay vì `nav.js` chung — nhất quán trong nhóm này nên nhiều khả năng là chủ ý (tách biệt trang marketing/app), không phải lỗi, nhưng đáng xác nhận lại.
