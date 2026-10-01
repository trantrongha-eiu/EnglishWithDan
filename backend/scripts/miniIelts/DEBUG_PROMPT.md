# Prompt debug — rà lại các bài Reading đã nhập từ mini-ielts

Dán nguyên phần dưới vào cuộc hội thoại mới.

---

Debug toàn bộ các bài Reading đã nhập từ mini-ielts (tag `mini-ielts`, khoảng 117 bài, đều đang hiển thị cho học sinh). Mục tiêu: tìm và sửa mọi lỗi mà học sinh có thể gặp. **Không nhập thêm bài mới trong phiên này.**

**Đọc trước:** `backend/scripts/miniIelts/README.md` (§3 công cụ, §5 bẫy, §6 trạng thái), memory `mini_ielts_reading_import.md`, `reading_bank_audit_2026_09_30.md`, `reading_question_type_unreliable.md`.

**Kiểm tra tự động (cwd = `backend/scripts/miniIelts`):**
1. `node dump_passages.js` (chạy nền vì có thể mất hơn 2 phút) → `node ../_audit_reading_warnings.js out.json` (phải 0 cảnh báo; đừng truyền `passages.json` vào vì script sẽ ghi đè file).
2. `node key_audit.js mini-ielts`: chỉ sửa khi **đáp án chính** sai (không có trong bài, vượt giới hạn số từ, dính dấu câu). Biến thể phụ thêm cho dễ chấm thì để nguyên.
3. `TAG=mini-ielts node pw_reading.js` và `TAG=mini-ielts node pw_grade.js`: mọi bài phải render đủ ô trả lời và chấm đúng 100%.
4. `node pw_admin.js` cho các bài mini: modal admin không được có cảnh báo.
5. Viết thêm một script chỉ đọc để kiểm tra:
   - số câu ≥ 13 và `questionRange` liên tục, khớp với số thứ tự câu;
   - không có câu MC rỗng hay ít hơn 3 lựa chọn;
   - mọi câu có `explanation`, và phần sau dấu "→" cuối cùng của giải thích chứa đáp án chính;
   - mọi `__Qn__` trong note/summary/table đều có câu tương ứng và ngược lại;
   - nhóm word bank có key là TỪ chứ không phải chữ cái;
   - nhóm matching có số lựa chọn bằng số chữ cái;
   - nhóm có `imageUrl` thì ảnh tải được (HTTP 200);
   - nội dung không còn rác (`##a`, `##qi`, `&lt;div`, `{A}`, ký tự điều khiển, chữ dính kiểu "thewords");
   - không có hai bài trùng tên.

**Rà tay (chọn mẫu, ưu tiên theo rủi ro):**
- Các key thay thế (`" / "` trong key TFNG/YNNG/MC/matching): đọc lại bài, xác nhận cả hai cách hiểu đều có cơ sở, và giải thích có nêu điều đó.
- Các bài có nhóm được dựng lại bằng tay (tìm `fn:` có `questions = [...]`, `tableConfig`, `headingsConfig` trong `mini_patches.js`): so với trang gốc `web/mini/p_<id>.html` / `s_<id>.html`.
- Các bài có sơ đồ (`group.imageUrl`): mở ảnh, kiểm tra nhãn trên hình khớp với dòng trong note và có ghi chú "Trên hình, ô X–Y tương ứng với câu …" khi số câu đã bị đánh lại.
- Mở thử 10 bài ngẫu nhiên ở chế độ học sinh trên prod (Playwright, chỉ GET, chặn request ghi), làm bài và xem màn hình xem lại: ô đúng/sai, giải thích hiện đúng câu.

**Khi sửa:**
- Sửa nguồn dữ liệu (`mini_patches.js`, batch JSON, file giải thích) để lần sau chạy lại cũng đúng. Ghi lên prod bằng script cập nhật có điều kiện theo `updatedAt`, chạy thử trước rồi mới `--apply`, chỉ đụng đúng các trường cần sửa.
- Không bao giờ chạy deleteMany/updateMany với filter rỗng. Không ẩn bài đang nằm trong đề full (full test chỉ tải bài `isActive`).
- Đổi key thì phải sửa cả giải thích (dùng trường `key` + `why` trong file giải thích, rồi chạy `setMiniExplanations.js --force` cho đúng file đó).
- Chạy lại `pw_grade` cho các bài đã sửa. Commit + push, cập nhật README §6 và memory.

Cuối phiên báo cáo: các lỗi tìm thấy (bài, câu, loại lỗi, nguyên nhân), những gì đã sửa, những gì cần thầy quyết định.
