# Ba hệ thống "bài tập câu/ngữ pháp" — khi nào dùng cái nào

Ba model độc lập cùng lưu các câu hỏi luyện viết dạng ngắn (dịch câu, sắp xếp từ,
điền chỗ trống...). Loại câu hỏi (`type`) trùng lặp giữa cả ba (`fill_blank`,
`rearrange`, `translation` xuất hiện ở cả 3), nên **`type` KHÔNG phải là thứ quyết
định nên thêm bài tập mới vào hệ thống nào** — `type` chỉ là *hình thức* câu hỏi.
Thứ quyết định là *nội dung/ngữ cảnh* bài tập đang luyện kỹ năng gì:

| Hệ thống | Model | Trang admin | Dùng khi... |
|---|---|---|---|
| **WPExercise** | `backend/models/WPExercise.js` | Writing Practice → tab "Bài tập" (`/admin/wp-exercises`) | Kỹ năng viết câu **chung chung, không gắn riêng Task 1 hay Task 2** — luyện ngữ pháp/cấu trúc câu (thì, liên từ, mệnh đề...) mà học sinh dùng được ở bất kỳ dạng bài nào. Gắn với 1 `WPLesson` (chủ đề bài học) qua `lessonId`. |
| **Task1Exercise** | `backend/models/Task1Exercise.js` | Task 1 Grammar Exercises (`/admin/task1/exercises`) | Kỹ năng **riêng cho Task 1** — mô tả biểu đồ/bảng/bản đồ/quy trình. Phân loại theo `skillType` (noun_phrase, data_description, comparison, paraphrase, trend_language, overview) + `module` (1-4), không liên quan chủ đề Task 2 nào. |
| **Task2Topic.questions** | `backend/models/Task2Topic.js` | Task 2 Writing Exercises (`/admin/task2/topics/:id/questions`) | Câu hỏi **gắn với 1 chủ đề luận Task 2 cụ thể** (VD "Environment", "Technology") — luôn nằm lồng bên trong 1 `Task2Topic`, dùng để xây kỹ năng viết về đúng chủ đề đó. |

`Task2Templates.jsx` (`/admin/task2/templates`) không nằm trong nhóm này — đây là
ngân hàng **mẫu câu cố định theo cấu trúc bài luận** (không phải bài tập/quiz có
đáp án), khác bản chất dù giao diện bảng lồng nhau trông tương tự Task2Exercises.

## Ví dụ áp dụng

- Thêm bài "điền từ còn thiếu" (`fill_blank`) về cách dùng "however" vs "nevertheless"
  nói chung → **WPExercise** (không gắn Task nào cụ thể).
- Thêm bài "sắp xếp từ" (`rearrange`) để luyện câu mô tả xu hướng tăng/giảm trong
  biểu đồ đường → **Task1Exercise**, `skillType: trend_language`.
- Thêm bài "dịch câu" (`translation`) làm ví dụ mở bài cho chủ đề "Advantages and
  disadvantages of social media" → **Task2Topic.questions**, nested trong topic đó.

*(Ghi chú thêm ngày 25/07/2026, theo `docs/ADMIN_PANEL_AUDIT.md` mục 3 — không gộp
3 model thành 1 vì đây là thay đổi schema có rủi ro với dữ liệu thật đang chạy; quy
tắc trên là bản sửa an toàn cho việc "không rõ nên thêm bài tập vào đâu".)*
