# Các hệ thống "bài tập câu/ngữ pháp" — khi nào dùng cái nào

Các model độc lập cùng lưu các câu hỏi luyện viết dạng ngắn (dịch câu, sắp xếp từ,
điền chỗ trống...). Loại câu hỏi (`type`) trùng lặp giữa chúng (`fill_blank`,
`rearrange`, `translation`...), nên **`type` KHÔNG phải là thứ quyết
định nên thêm bài tập mới vào hệ thống nào** — `type` chỉ là *hình thức* câu hỏi.
Thứ quyết định là *nội dung/ngữ cảnh* bài tập đang luyện kỹ năng gì:

| Hệ thống | Model | Trang admin | Dùng khi... |
|---|---|---|---|
| **WPExercise** | `backend/models/WPExercise.js` | Writing Practice → tab "Bài tập" (`/admin/wp-exercises`) | Kỹ năng viết câu **chung chung, không gắn riêng Task 1 hay Task 2** — luyện ngữ pháp/cấu trúc câu (thì, liên từ, mệnh đề...) mà học sinh dùng được ở bất kỳ dạng bài nào. Gắn với 1 `WPLesson` (chủ đề bài học) qua `lessonId`. |
| **Task1Exercise** | `backend/models/Task1Exercise.js` | Task 1 Grammar Exercises (`/admin/task1/exercises`) | Bài tập ngữ pháp **rời rạc** cho Task 1 — phân loại theo `skillType` (noun_phrase, data_description, comparison, paraphrase, trend_language, overview, introduction) + `module` (1-4). Không có tầng khoá học / buổi học / gate. Đây là hệ thống **cũ**; nội dung mới về Task 1 nên vào hệ WT1 bên dưới. |
| **WT1Exercise** (hệ WT1) | `backend/models/WT1Course.js` … `WT1Exercise.js` (+ `WT1Submission`, `WT1Progress`) | (chưa có trang admin — quản lý qua `scripts/seedWritingTask1Course.js`) | Khoá **Writing Task 1 có cấu trúc nhiều tầng**: `WT1Course → WT1Module → WT1Lesson → WT1Exercise → Item`. Mỗi lesson là một "buổi học" 60 phút, có `objectives` / `keyLanguage` / `gate` mở buổi kế tiếp. 11 `type` (mcq, gap_fill, error_correction, sentence_transform, word_form, categorize, matching, ordering, sentence_writing, paragraph_writing, full_task1); `autoGrade:true` chấm bằng JS, `autoGrade:false` chấm bằng AI theo `rubric`. Mọi tham chiếu dùng `code` (chuỗi ổn định) để re-seed không phá tiến độ học viên. Module 1–2 = biểu đồ tĩnh/động; Module 3 = Maps; Module 4 = Process. |
| **Task2Topic.questions** | `backend/models/Task2Topic.js` | Task 2 Writing Exercises (`/admin/task2/topics/:id/questions`) | Câu hỏi **gắn với 1 chủ đề luận Task 2 cụ thể** (VD "Environment", "Technology") — luôn nằm lồng bên trong 1 `Task2Topic`, dùng để xây kỹ năng viết về đúng chủ đề đó. |

> **Task 1 Grammar cũ (`Task1Exercise`) vs hệ WT1:** hai hệ đang chạy song song.
> `Task1Exercise` có ~123 doc + `Task1Attempt` lịch sử học viên và trang
> `task1-practice.html`. Kế hoạch: giữ trang cũ đến khi trang khoá học WT1 lên,
> rồi redirect `task1-practice.html` → trang WT1 và **lưu trữ** (không xoá cứng)
> `Task1Exercise` vì lịch sử `Task1Attempt` còn tham chiếu tới nó — xem
> `memory/incident_vocabbook_mass_delete`.

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
