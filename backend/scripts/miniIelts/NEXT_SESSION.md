# Prompt tiếp tục — nhập đề lẻ Reading từ mini-ielts

Dán nguyên phần dưới vào cuộc hội thoại mới.

---

Tiếp tục nhập đề lẻ Reading từ mini-ielts.com vào ngân hàng đề (repo EnglishWithDan, prod ieltsthayha.com).

**Đọc trước, theo thứ tự:**
1. `backend/scripts/miniIelts/README.md`, nhất là **§6, mục "TRẠNG THÁI MỚI NHẤT"**, §4 (quy trình 12 bước) và §5 (các bẫy đã gặp).
2. Memory `mini_ielts_reading_import.md`.

**Quy tắc cố định (thầy đã chốt):**
- Chỉ lấy bài trong mục **Recent Actual Tests** (`https://mini-ielts.com/reading?c=recent-actual-tests`). Danh sách 340 id nằm ở `web/mini/all_ids.json`. Không lấy các mục khác của mini-ielts.
- Lô nào cũng **rà tay từng câu** như các phiên trước: tự đọc bài và tự làm từng câu. Key của mini sai khá thường xuyên, nên khi nghi ngờ phải tìm key độc lập (vietop, ieltsmaterial, ielts-mentor, thesol, engnovate…). Không chắc thì bỏ bài, đừng đoán. Nếu các nguồn mâu thuẫn mà bài thật sự mở cả hai cách hiểu thì ghi key thay thế dạng `"FALSE / NOT GIVEN"` hoặc `"A / B"` (riêng nhóm chọn-N `multi-answer-group` không hỗ trợ key thay thế, nên bỏ bài).
- Bỏ bài khi: đoạn văn bị cắt hoặc mất câu mà câu hỏi dựa vào, phương án lựa chọn vô nghĩa, dưới 13 câu, có hình nhưng không lấy được hình đầy đủ, hoặc là đề General Training.
- Bài đạt (Playwright render đúng, `_audit_reading_warnings` 0 cảnh báo, `pw_admin` không cảnh báo, `pw_grade` 100%) thì **bật cho học sinh luôn** (`--activate`).
- Bài nào mới nhập cũng phải có **giải thích tiếng Việt** (bước 12: file `../data/miniIeltsReading/explanations/<passageId>.json` dạng Dịch / Vị trí / Trích / Phân tích, rồi chạy `setMiniExplanations.js`).
- Ảnh bìa: xem từng ảnh. Thay ảnh có logo/banner site khác, bìa sách, ảnh lạc đề, hay ảnh hotlink từ site thương mại bằng ảnh Wikimedia (`wm_search.js "<query>" --free`, chọn bằng mắt; ảnh CC BY thì phải ghi công qua `--image`).
- Script ghi DB đều mặc định chạy thử (dry run), phải thêm `--apply` mới ghi. Không bao giờ chạy deleteMany/updateMany với filter rỗng.
- Tool: Python dùng `py`. Sửa code có regex/backslash bằng tool Edit/Write, **không** dùng heredoc hay `node -e` trong bash (ký tự `\b`, `\w` bị shell làm hỏng).

**Việc cần làm, theo thứ tự:**
1. **Hoàn tất lô 12.** 19 bài trong `web/mini/batch12_reviewed.txt` đã rà tay xong và đã có patch. Còn phải: `node dump_passages.js` → `node mini_finalize.js <ids>` → copy `final_<id>.json` sang `draft_c<id>.json`, chạy `mini_check.js c<id>…` (báo "not in passage" cho từ trong word bank là báo nhầm) → xem ảnh bìa, chọn ảnh thay thế → tạo `../data/miniIeltsReading/batch12.json` (`[{source, imageUrl, doc}]`, imageUrl để null nếu thay ảnh) → làm tiếp bước 7–12 của §4 → commit + push.
2. Rà nốt 7 bài convert sạch: 1256 (danh sách heading dồn một dòng, tách theo số La Mã giống patch 1306), 1250 (nhiều khả năng bỏ: có chữ rác và link http trong bài), 1094, 1211, 1145, 1242, 1147.
3. Với 33 bài heavy còn WARN (`web/mini/heavy_convert3.txt`): `node mini_convert.js <ids>`, đọc WARN. Nâng converter nếu lỗi lặp lại ở nhiều bài; nếu chỉ một bài thì dựng lại nhóm bằng patch, dùng helper `renum` và `setQ`.
4. Thử tải lại hình từ `content.ieltsonlinetests.com` cho 964, 1183, 1203, 1075 (máy chủ đó từng không kết nối được). Lấy được hình rõ thì rà như Giai đoạn B, không thì bỏ.
5. Mỗi lô xong: cập nhật README §2/§6 và memory, ghi các bài bỏ vào `web/mini/rejected.txt`, commit với dòng `Co-Authored-By`, push lên main.

Cuối phiên, báo cáo theo bảng: lô nào, nhận/bỏ bao nhiêu bài, key đã sửa so với mini (kèm nguồn đã tra), các bài còn lại.
