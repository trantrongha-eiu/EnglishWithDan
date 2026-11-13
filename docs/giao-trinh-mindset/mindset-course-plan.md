# Khóa Mindset for IELTS trên web: kế hoạch và quy trình

Khóa học bám sát bộ giáo trình **Mindset for IELTS** (Cambridge) trong thư mục `Mindset curriculum/`. Cả ba quyển đã xong: quyển 0 (Foundation, trình độ A2), quyển 1 và quyển 2 (Level 1, Level 2 — Reading & Listening).

| Quyển | Mã khóa | Trang học viên | Trạng thái |
|---|---|---|---|
| Mindset 0, Foundation (10 unit, 20 audio) | `MINDSET-0` | `/mindset-0.html` (link gọn `/mindset/0`) | Đã soạn đủ 10 unit |
| Mindset 1, Level 1 (71 audio) | `MINDSET-1` | `/mindset-1.html` (link gọn `/mindset/1`) | Đã soạn đủ 8 unit (13/11/2026) |
| Mindset 2, Level 2 (75 audio) | `MINDSET-2` | `/mindset-2.html` (link gọn `/mindset/2`) | Đã soạn đủ 8 unit (13/11/2026) |

## 1. Cấu trúc mỗi unit (giống thứ tự trong sách)

Mỗi unit là một module trên hệ khóa học WT1, gồm tối đa 7 buổi. Buổi sau mở khi buổi trước đạt điểm tự chấm trung bình ≥70% và có ít nhất 1 bài viết/nói (nếu buổi đó có).

| Buổi | Nội dung | Sổ từ vựng |
|---|---|---|
| 🔤 Từ vựng & Khởi động | Lead-in, Vocabulary; ảnh cắt từ sách | **Sổ 1** |
| 📖 Reading | Bài giảng chiến thuật + **bài đọc làm trên reading.html (giao diện thi thật)** + bài tập trong khóa | **Sổ 2** |
| 🧩 Ngữ pháp | Tóm tắt hộp Grammar của sách + **nút sang bài Essential Grammar trên web** + bài tập ngữ pháp của sách | (không có sổ) |
| ✍️ Writing | Bài giảng bố cục + bài tập câu + bài viết **AI chấm** (rubric trình độ A2) | **Sổ 3** |
| 🎧 Listening | Bài giảng + **bài nghe làm trên listening.html, audio gốc trên R2**, có transcript và giải thích | **Sổ 4** |
| 🗣️ Speaking | Bài giảng + bài nói ghi âm **AI chấm** (dùng chung bộ ghi âm của khóa Speaking) | **Sổ 5** |
| 📝 Ôn tập cuối Unit | Bài Grammar and Vocabulary cuối unit | (không có sổ) |

Khối **"Lưu vào Sổ N trên web"** ở cuối mỗi buổi có nút lưu một chạm vào sổ mặc định N của học viên (`VocabBook.defaultSlot`). Danh sách "từ: nghĩa" kèm câu ví dụ vẫn hiện để chép vào "Nhập hàng loạt". Trùng từ thì bỏ qua.

Trong mỗi buổi, bài tập và bài Reading/Listening (giao diện thi thật) hiện **xen kẽ theo đúng thứ tự số bài trong sách** ("Các bước của buổi học"). `buildMindset.js` sắp bài theo thẻ `(Ex. N)` / `(G&V Ex. N)` (G&V xếp sau cùng vì trang Grammar and Vocabulary đóng unit; bài không có số đi liền sau bài đứng trước nó), gán mã bài theo vị trí mới, và ghi `step` cho mỗi link Reading/Listening (số bài tập đứng trước nó; bài "Exam skills" lấy số bài lớn nhất). Thẻ bài Reading/Listening hiện điểm tốt nhất của học viên.

Admin **và giáo viên** giao bài từng buổi qua loại bài tập về nhà **"Mindset (Buổi học)"** (`mindset_course_lesson`). Bộ chọn hiện "Mindset 1 · Unit 3 · Buổi 2 — …", lọc theo quyển · unit và có nút "Chọn tất cả". Bài tự tick khi học viên làm hết các bài của buổi, các bài tự chấm đạt trung bình ≥70% **và mỗi bài Reading/Listening của buổi đạt ≥70%** (lần làm tốt nhất, `services/coursePracticeService.js`).

## 2. Nội dung quyển 0 đã soạn

- 10 unit, 70 buổi, 223 bài tập: 194 bài tự chấm, 11 bài viết AI chấm, 18 bài nói AI chấm. Đã đối chiếu từng bài với sách + Answer Key ngày 12/11/2026 (xem mục 5).
- 10 bài Reading (Passage) và 19 bài Listening (ListeningSection) dùng 19 file audio (track 01 là phần giới thiệu nên không dùng).
- 42 ảnh cắt từ sách: tranh Lead-in, tranh mô tả, bản đồ, sơ đồ, biểu đồ.
- 5 sổ, mỗi unit khoảng 50–80 từ/cụm từ.

Đáp án lấy theo Answer Key của sách. Mọi bài tự chấm đều đã chạy qua bộ chấm thật và đạt 100% với chính đáp án của nó.

## 2b. Nội dung quyển 1 đã soạn (13/11/2026)

- Sách Level 1 chỉ có phần **Reading & Listening** (8 unit). Mỗi unit 4 buổi: 🔤 Lead-in & Vocabulary → 📖 Reading (chiến thuật dạng câu hỏi + bài đọc chính + Exam skills) → 🧩 Grammar focus → 🎧 Listening.
- 32 buổi, 100 bài tự chấm trong khóa; 16 bài Reading (Passage) + 41 bài Listening (ListeningSection, audio Mindset_L1_NN = track NN in trong sách; track của phần Speaking/Writing không dùng). Tổng 356 câu Reading/Listening, mọi câu có giải thích tiếng Việt.
- Sổ từ vựng theo sách của lớp (trang "Từ vựng & cụm từ hay"): Unit 1–2 → Sổ 1, Unit 3–4 → Sổ 2, Unit 5–6 → Sổ 3, Unit 7–8 → Sổ 4 (khai báo `slot` trong buổi). Danh sách từ ở `scripts/mindset/m1/vocab/*.txt`, câu ví dụ lấy tự động từ bài đọc/transcript (`m1/_vocab.js`).
- Bản đồ Listening dùng group `map` + `dragDropConfig.words` (ảnh + kéo thả chữ cái/nhãn) — group `matching-options` trên listening.html không hiện ảnh.
- Unit 1 Ex. 8 Q1 (South Africa): theo Answer Key, đáp án chính là "over 40%" (South Africa thuộc Sub-Saharan Africa). "almost 70%" (con số cụ thể trong bài đọc) cũng được chấm đúng.

**Quy tắc chung (12/11/2026):** đề bài (tiêu đề, hướng dẫn, câu hỏi, đáp án lựa chọn) giữ **tiếng Anh** như sách; chỉ giải thích và bài giảng ngữ pháp/chiến thuật dùng tiếng Việt. Quyển 0 đã được chuyển đề sang tiếng Anh.

## 2c. Nội dung quyển 2 đã soạn (13/11/2026)

- Giống quyển 1: 8 unit × 4 buổi (Lead-in & Vocabulary → Reading → Grammar focus → Listening) = 32 buổi, 80 bài tự chấm trong khóa.
- 20 bài Reading + 57 bài Listening, tổng 419 câu, mọi câu có giải thích tiếng Việt; audio `Mindset_L2_NN` = track NN in trong sách (track Speaking không dùng).
- Sổ theo sách của lớp: Unit 1–2 → Sổ 1, 3–4 → Sổ 2, 5–6 → Sổ 3, 7–8 → Sổ 4. Danh sách từ ở `m2/vocab/*.txt` (trích tự động từ trang "Từ vựng & cụm từ hay" của PDF); câu ví dụ lấy từ bài đọc/transcript, từ nào không có trong bài thì có câu tự viết sau dấu ` | `.
- **Văn bản sách (bài đọc, transcript) không gõ tay**: `m2/_extract.py` trích từ lớp OCR của PDF theo khai báo trong `m2/texts.json` (vùng cắt, mốc đầu đoạn, các chỗ sửa lỗi OCR) ra `m2/text/*.txt`; unit đọc bằng `txt()` (`m2/_text.js`). Chạy lại: `py scripts/mindset/m2/_extract.py [tên]`. Lý do: viết nguyên văn khối dài từ sách bị bộ lọc nội dung chặn.
- Dạng mới: "Choose TWO letters" (`qMulti` trong dsl.js → `multi-answer-group`; verifyMindset gửi cả cụm đáp án), sơ đồ điền chữ (group `map` không có `dragDropConfig` → ô nhập chữ cạnh ảnh), bản đồ đánh số ô 1–6 (Unit 2), lượng từ, signposting.
- Answer Key: Unit 1 Ex. 4 câu 5 key in "B1074", audioscript là "81074" → chấm đúng cả hai. Unit 5 Ex. 12 danh sách ghi "Daniel Kluko", bài đọc ghi "Kluka" → web dùng "Kluka".

## 3. Quy trình kỹ thuật

```
backend/scripts/mindset/dsl.js            # hàm soạn bài gọn: mcq, gap, match, order, cat, write, speak, qMcq, qNote…
backend/scripts/mindset/m0/course.js      # thông tin khóa
backend/scripts/mindset/m0/u01.js … u10.js # nội dung từng unit
backend/scripts/data/mindset0/img/        # ảnh cắt từ sách
backend/scripts/data/mindset0/media.json  # URL R2 của audio + ảnh (commit file này)
```

1. `node scripts/mindset/buildMindset.js m0`: build file unit ra `data/mindset0/lessons-uNN.json`, `exercises-uNN.json`, `practice-uNN.json`.
2. `node scripts/seedMindsetMedia.js mindset0 --dry`: kiểm tra dữ liệu.
3. `node scripts/seedMindsetMedia.js mindset0`: upload audio/ảnh lên R2 (chỉ lần đầu, có cache trong media.json), rồi upsert Passage/ListeningSection theo `courseRef`. Dùng `--upload-only` nếu chỉ muốn upload.
4. `node scripts/seedCourse.js mindset0`: seed khóa, unit, buổi, bài tập. Chuỗi `media:<file>` được thay bằng URL R2, `practiceLinks[].ref` được thay bằng link reading.html / listening.html.
5. Trước khi seed: `node scripts/mindset/verifyMindset.js mindset1` (không cần DB) chấm mọi bài bằng bộ chấm thật với đáp án của chính nó, kiểm tra ____ / __Qn__, link, giải thích và đề không có tiếng Việt. Quyển 1/2: thay `m0`/`mindset0` bằng `m1`/`mindset1` hoặc `m2`/`mindset2` ở các lệnh trên.

Bài đọc/nghe của khóa có trường `courseRef`, nên **không hiện trong danh sách đề IELTS**, random test hay tìm kiếm (`utils/courseContent.js` → `NOT_COURSE`). Chúng chỉ mở qua link trong buổi học.

## 4. Kế hoạch quyển 1 và 2

1. Thêm `m1` / `m2` vào `LEVELS` trong `buildMindset.js`, `COURSES` trong `seedMindsetMedia.js` và `seedCourse.js`. Thêm `MINDSET-1/2` vào `wt1Service.COURSES`, `routes/admin/wt1.js`, `routes/admin/reviewBypass.js`, `courseScope` của `mindset_course_lesson`, trang admin và mục `LEVELS` trong `frontend/js/mindset-course.js`.
2. Tạo `frontend/mindset-1.html` (copy mindset-0.html, đổi `data-mindset-level`), thêm `_redirects` và link menu.
3. Quyển 1/2 là sách **Reading & Listening** (target band 5.5 / 6.5), nên buổi Writing/Speaking sẽ ít hơn. Bài đọc dài kiểu IELTS sẽ làm hết trên reading.html; các bài trong khóa tập trung vào kỹ năng và chiến thuật của từng dạng câu hỏi.
4. Ghép audio: tên file `Mindset_L1_NN.mp3`, `Mindset_L2_NN.mp3`, đối chiếu số track in trong sách (biểu tượng audio cạnh bài tập).

## 5. Checklist đối chiếu sách (bắt buộc trước khi seed mỗi quyển)

Lần soạn đầu quyển 0 bị sót: G&V 4 (U2), G&V 6 + Ex. 15 (U3), G&V 1/5 + Ex. 17–18 + cả buổi Ôn tập (U5), G&V 6/9 + Ex. 6/17 (U9), G&V 4 (U10), và nhiều bài bị cắt bớt câu (vd. U3 G&V 2 chỉ có 15/23 từ). Đã bổ sung đủ ngày 12/11/2026. Quy trình để không lặp lại:

1. Trích text sách: `pdftotext -layout` (có sẵn trong Git Bash). Trang PDF = số trang in + 1 với quyển 0.
2. Lấy **Answer Key** làm danh sách chuẩn: mỗi unit, mỗi số bài (kể cả "Grammar and Vocabulary Unit N") có đáp án cố định thì phải có trên web. Bài "Student's own answers" → bài viết/nói hoặc bỏ qua.
3. Đếm số câu từng bài trong key và so với số item/ô trống trên web (script đếm: đọc `lessons[k].ex[].items`, gap tính theo số `blanks`). Thiếu câu = phải thêm.
4. Ghi số bài sách trong tiêu đề bài tập: `(Ex. N)`, `(G&V Ex. N)` để lần sau đối chiếu được bằng grep.
5. Từ vựng của các bài tập từ vựng phải có trong `vocab` của buổi có Sổ (vocab/reading/writing/listening/speaking); buổi grammar/review không có Sổ nên đưa từ vào buổi vocab.
6. Sau khi đã seed lên production: **chỉ thêm bài vào cuối buổi, thêm câu vào cuối bài**. Mã bài = vị trí trong buổi (`M0-U05-L3-E07`), chèn giữa sẽ làm lệch bài làm cũ của học viên. Buổi mới chỉ thêm ở cuối unit (review là buổi cuối).
7. Chạy bộ chấm thật với đáp án của chính bài (mọi bài tự chấm phải đạt 100%) và kiểm tra số `____` khớp số ô trống.
8. Không tin chú thích "PDF không có" — mở trang PDF kiểm tra lại (G&V 6 của U3 thực ra có trong PDF).
9. Rà soát 13/11/2026 (sau khi seed): so từng đáp án web với Answer Key (cắt cột key bằng pymupdf, tìm đáp án trong khối Unit) và **đếm số câu mỗi bài trong key so với web**. Đã sửa: M1 U6 Listening Ex. 7 câu 2 (art gallery, không phải restaurants), M0 U1 G&V 7 thiếu câu 6 và 10, M0 U3 Ex. 15 thiếu 3 câu, M0 U4 Ex. 17 thiếu ô 13 và 16, M0 U10 Ex. 10/12 thiếu ô, M2 U6 Ex. 16 làm lại đủ 8 câu như bảng trong sách. Sách tự mâu thuẫn: M0 U1 G&V 7 câu 9 (từ cho sẵn "father", key ghi "mother") → theo từ cho sẵn.
