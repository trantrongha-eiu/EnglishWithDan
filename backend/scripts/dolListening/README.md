# Nhập đề lẻ Listening từ DOL Tự học (tuhoc.dolenglish.vn)

Nguồn: https://tuhoc.dolenglish.vn/luyen-thi-ielts/ielts-listening-practice — 428 section (29 trang × 15).
Thầy Hà yêu cầu 2026-10-01: lấy về đủ audio, transcript và giải thích.

## Quy tắc đã chốt

- **Giải thích của DOL ("Giải thích chi tiết theo Linear") là nội dung TRẢ PHÍ** (gói PRO 299.000đ/tháng) — nó có lọt trong
  payload trang nhưng bị ẩn với người dùng miễn phí. **Không lấy.** `dol_fetch.js` xoá mọi object `explanation` ngay khi lưu,
  chỉ giữ `startTimeInSeconds/endTimeInSeconds` (nút "Listen from here" miễn phí). Giải thích tiếng Việt do mình tự viết.
- Lấy phần miễn phí: câu hỏi, đáp án, transcript (cue có mốc thời gian + tên người nói), audio mp3, ảnh map/diagram.
- Audio và ảnh được tải về và đưa lên Cloudinary của mình (`listening-sections/dol_<SectionId>`, `listening-maps/dol_<SectionId>_<g>`),
  không hotlink DOL. Ảnh map do DOL vẽ có logo "dol.vn" — **không xoá logo**.
- Đánh dấu nguồn: `audioFileName = "dol_<testSectionId>.mp3"` (dùng để chống nhập trùng).
- `isActualTest`: true cho CAMBRIDGE và ACTUAL_TEST, false cho PRACTICE_TEST_PLUS / IELTS_TRAINER / OFFICIAL_GUIDE.
- Bài trùng: với ngân hàng (đề lẻ + bản sao trong đề full) → bỏ; trong DOL ("Actual Test" là bản viết lại của PTP/Cambridge)
  → giữ bản gốc. Bài không đủ 10 câu, câu hỏi có ảnh (isImageIncluded) → bỏ/để sau.
- Bài qua hết kiểm tra (key rà tay + giải thích hợp lệ + Playwright 10/10) thì bật luôn cho học sinh (như mini-ielts).
- **Thầy 2026-10-07:** không lấy Cambridge trước Cam 10 (format cũ). Mỗi đợt ~10 bài lẻ → debug (audio, transcript,
  hình, nội dung, giải thích) → sửa lỗi → **dừng**, không tự lấy thêm. Biến thể đáp án DOL tự thêm mà không có trong
  transcript (vd. "character" cho "personality") → bỏ. **Ảnh bìa: không có ảnh đúng chủ đề thì lấy ảnh TƯỢNG TRƯNG
  (không cần chính xác) — không xoá/ẩn bài vì thiếu ảnh bìa.** **Bài map/plan/diagram thiếu hình → bắt buộc bổ sung hình**
  (vẽ lại bằng `dol_mapimg.py` / `fix_map_images.js`), không bỏ bài.

## Quy trình mỗi lô (cwd = backend/scripts/dolListening)

1. `node dump_listening.js` — dump ListeningSection + ListeningTest prod → `web/` (chỉ đọc).
2. (đã làm) `dol_fetch.js` tải 428 bài → `web/dol/<dolId>.json`; danh sách `web/dol_items.json` lấy từ
   `POST https://api.dolenglish.vn/public/search-transform/api/filter` (content_group PRACTICE_SECTION).
3. `node dol_triage.js` — convert tất cả + phân loại clean / dup-bank / dup-dol / needs-work → `web/triage.json`.
4. Chọn lô → `web/batchN.txt` (mỗi dòng 1 dolId).
5. `node dol_ctx.js <ids>` — in câu hỏi + key + đoạn transcript quanh mốc thời gian để RÀ KEY và viết giải thích.
   Sửa tay (key, chữ, hướng dẫn, tiêu đề, bảng) trong `dol_patches.js`, rồi `node dol_convert.js <ids>`.
6. Viết giải thích: `../data/dolListening/explanations/<dolId>.json` = `{ title, q: { "<n>": { v, t, p } } }`
   (v = vị trí, t = trích transcript NGUYÊN VĂN (chuỗi hoặc mảng), p = phân tích kết thúc bằng "→ <đáp án>").
   Ghi file bằng tool Write (heredoc bash làm hỏng ký tự). `node set_dol_expl.js <ids>` kiểm tra.
7. `node pw_dol.js <ids>` — Playwright trên ieltsthayha.com, chặn API bằng bản nháp: đủ ô trả lời, ảnh, chấm 10/10.
8. `node dol_import.js <ids> --apply` — nhập ẩn (tải audio → Cloudinary, dựng ảnh map → Cloudinary). Ghi `web/imported.json`.
9. `node set_dol_expl.js <ids> --apply` — ghi giải thích vào DB.
10. `node dol_activate.js <ids> --apply` — bật (từ chối nếu thiếu giải thích/audio/transcript); `--off` để ẩn lại.
11. `LIVE=1 node pw_dol.js <ids>` — kiểm tra lại trên site thật bằng dữ liệu DB.

## Bộ chuyển đổi (dol_convert.js)

Dạng DOL → nhóm của mình: SINGLE_ANSWER → plain/multiple-choice; MULTIPLE_ANSWER → multi-answer-group (mỗi đáp án 1 câu);
MATCHING_DRAG_DROP / MATCHING_FEATURE_NAME / MATCHING_ENDING → matching-options; DRAG_OUT (map chữ cái) → map + ảnh có
nhãn chữ (dol_mapimg.py); DRAG_IN (ô số trên ảnh + danh sách từ) → map chế độ kéo-thả; DIAGRAM_LABEL_COMPLETION → map +
ô điền; NOTE/FORM/SENTENCE/FLOWCHART completion → note-form (hoặc table nếu chỉ có 1 bảng; drag-drop nếu có hộp từ);
SHORT_ANSWER → plain fill-blank. Hậu tố `_V2` xử lý như bản thường. Chưa hỗ trợ: FLOW_CHART_COMPLEX (2 bài).

## Ảnh bìa card (ListeningSection.thumbnailUrl) — 2026-10-01

Giống Reading: chỉ ảnh Wikimedia **CC0/Public domain**, chọn bằng mắt. `cover_queries.json` (key = 6 ký tự cuối _id) →
`node lcover_candidates.js [titleRegex]` → `node lcover_sheet.js <from> [10]` (hoặc `a,b,c`) → xem `shots/covers_<from>.png` →
`node lcover_pick.js 12=a 13=- …` (ghi `../data/listeningCovers.json`) → `node ../setListeningThumbnail.js --batch ../data/listeningCovers.json --apply`.
Bài mới nhập cũng phải có ảnh bìa trước khi bật. `pw_covers.js` xem trước card (local listening.html + API thật).
2026-10-07: mọi bài lẻ đang bật đều có ảnh bìa (197 trong `listeningCovers.json`). 4 bài cũ thiếu ảnh được gắn ảnh tượng
trưng: Cam 18 T2 P2 (nhà ở ngoại ô), Cam 21 T4 P2 (trung tâm triển lãm), Holly's Work Placement (sân vận động), Job Centre
(quầy cà phê). (Trong phiên có lúc hiểu nhầm thành "xoá bài": 2 bài bị xoá đã khôi phục nguyên _id bằng `restore_sections.js`
từ `web/backup/`, 2 bài bị ẩn đã mở lại; Tip "sentence-completion" lại ghim Job Centre như cũ.)
Rà ảnh map: 31 nhóm map/plan/diagram trong đề lẻ + đề full đều có ảnh, 19 URL ảnh đều trả 200.

## Rà soát bài cũ — `audit_listening.js [--active] [--tests]`

Kiểm: đủ 10 câu, audio, transcript, giải thích, placeholder `__Qn__`, map có ảnh, key MC/matching/drag-drop hợp lệ, key điền từ có trong
transcript. 2026-10-01 đã sửa: 4 map thiếu ảnh (`fix_map_images.js`), Cam 18 T1 P2/P3 lựa chọn lặp chữ cái + Learner Persistence
thiếu Q38–40 (`fix_old_content.js`), ẩn 1 bản trùng "Influence of Children on Adult Diet". **Còn lại: 55 bài chưa có giải thích**
(Cam 17 T4, Cam 18, 19, 21… — danh sách trong `web/audit.json`), 2 bản "Influence of Children" vẫn trùng (chờ thầy chọn),
42/43 đề full đang ẩn từ 30/9 (thao tác hàng loạt — chưa đụng).

## Gộp đề lẻ thành đề full — 2026-10-07

Thầy: "bài lẻ nào chưa nằm trong bài full test thì gộp 4 section lẻ thành 1 full test, đánh số như các đề cũ".
`node dump_listening.js && node orphan_sections.js` → `web/orphans.json` (so transcript 8-gram + tên/part với mọi phần của
đề full; KHÔNG so câu hỏi — note-form chỉ có "Q1 Q2…" nên khớp giả). Sau đó `node orphan_sections.js` chỉ gán nguồn theo
tên — nguồn đúng (sách/test/section) phải gán lại bằng so transcript với `dol_items.json` (đã làm, ghi trong orphans.json).
`node build_full_tests.js [--apply|--activate]`: bộ Cambridge đủ 4 section → "Cam N - Test M" (seriesName "Cam N",
testNumber M); phần dư → "Actual Test 16, 17…" (seriesName "Actual Tests"). Audio = nối 4 mp3 section (ffmpeg concat,
192k) → Cloudinary `listening/listening_<testId>_<ts>`; tạo ẨN → `node pw_fulltest.js "<tên>"…` (chấm 40/40 bằng
gradeQuestionGroups, đủ 40 ô trên màn làm bài thật, map hiện ảnh, audio nạp) → `--activate`.
Đã tạo + bật: Cam 9 - Test 3, Cam 9 - Test 4, Cam 10 - Test 1…4, Actual Test 16 (Cam 9 T2 S1/S2/S4 + T1 S3). Chỗ nối
P1→P2 nghe lại bằng Whisper: liền mạch. **Còn 12 đề lẻ chưa vào đề full** (P1 5 / P2 4 / P3 3 / P4 0 — thiếu Part 4 nên
chưa ghép được): Job Inquiry, Hiring A Public Room, Apartment Rental In Calgary, City Transport Lost Property, Megequip;
Sports World, Treloar Valley Ferry, Outdoor Survival Skills, John Manjiro; TV News Work Placement, University Orientation,
Advice On Writing A Dissertation. Lần nhập DOL sau nên ưu tiên Part 4 (vd. Cam 11 T1 S2–S4 sẽ hoàn thành Cam 11 Test 1).

## BÀN GIAO — cuối phiên 2026-10-01 (đọc mục này trước)

**Đã xong:** 30 bài DOL đang bật (lô 1–2 + 6 bài đầu lô 3). Ảnh bìa (code đã push `36cff042`, 183 bài có ảnh). Map thiếu
ảnh (4 bài) đã có ảnh. Gộp 3 nhóm đề lẻ trùng (`merge_duplicates.js`, lượt làm được chuyển sang bản giữ lại). Mở lại 42 đề
full bị ẩn. Vá transcript cụt: Cam 20 T1–T4 (`fix_test_transcripts.js`, chèn câu từ bản DOL), Actual Test 7 P1, Energy
Consumption Assignment (`fix_section_transcripts.js` + `../data/listeningTranscriptFixes.js`, nghe bằng `old_whisper.js`).
Giải thích bài cũ: 20/53 bài lẻ xong (Energy Consumption, Cam 17 T4 P1–P4, cả Cam 18) — `old_expl.js` (file ở
`../data/listeningExplanationsOld/`), tự chép sang bản trong đề full.

**Việc tiếp theo (theo thứ tự):**
1. Giải thích cho 33 bài lẻ cũ còn lại (Victor Hugo, Cam 19 ×12, Stanthorpe, Céide Fields, lifeboat, Tardigrades, Science
   experiment, Microplastics, Tree planting, Cam 21 ×12, makeup trainee, rubber, cruise ship, invasive species, houses of
   the future, music therapy) + 16 phần Cam 20 chỉ có trong đề full (target `test:Cam 20 - Test N:P`).
   Quy trình: `node old_expl.js ctx <id>` → viết JSON → `node old_expl.js check` → `node old_expl.js apply`.
   Danh sách: `node dump_listening.js && node audit_listening.js --tests` (dòng "no explanation").
   Khi viết, nếu câu trả lời không có trong transcript → transcript cụt: nghe bằng `old_whisper.js <id> <from> <to>`,
   thêm vào `listeningTranscriptFixes.js`, chạy `fix_section_transcripts.js --apply`.
   Lỗi nhỏ cần sửa: Cam 17 T4 P3 lựa chọn H "No one ring it liked it at first" → "No one using it…"; Cam 18 T1 P1
   transcript "DW3Q 7YZ" → "DW30 7YZ".
2. Nhập tiếp DOL, mỗi đợt ~10 bài rồi dừng (luật ở đầu file): **còn 270 bài sạch, không trùng ngân hàng** —
   Actual Test 114, Cambridge 10–14 57 (Cam 9 đã nhập hết ở lô 1–2; không lấy thêm Cam < 10), Practice Tests Plus 58,
   Official Guide 21, IELTS Trainer 20. Chạy lại `node dump_listening.js && node dol_triage.js` trước mỗi lô để chống trùng
   (triage so transcript 8-gram + câu hỏi + tên với cả đề lẻ lẫn đề full, và loại bản "Actual Test" viết lại của bài
   PTP/Cambridge). Lô kế tiếp tự nhiên: Cam 11 T1 S2 → (Fiddy Working Heritage Farm, Study On Gender In Physics, …).
   Mỗi bài mới nhập cũng cần ảnh bìa (`lcover_*`, ảnh tượng trưng là được). 13 bài "needs-work" để sau.

**Lô 4 — 2026-10-07 (xong, đang bật):** 9 bài Cam 10 (T2 S4, T3 S1–4, T4 S1–4) + Cam 11 T1 S1 Hiring A Public Room
(`web/batch4.txt`). Sửa: Hiring Q2/Q3 "£" sai chỗ + thiếu "(" + 3 lỗi chính tả transcript; Self-Regulatory bỏ biến thể
"character"/"ambitions" (không có trong băng); Early Learning Q1 nhận cả "four". Kiểm: set_dol_expl 10/10, pw_dol nháp +
LIVE 10/10, audit sạch, audio dài hơn cue cuối ~45–55s (phần "check your answers"), khoảng nghỉ giữa bài nghe lại bằng Whisper
= chỉ là quãng "look at questions 7 to 10".

## Trạng thái

Xem `web/imported.json` (dolId → _id) và `web/triage.json`. 2026-10-01: lô 1 (10 bài, `web/batch1.txt`) đã bật.
Triage: 428 = 310 clean + 101 trùng ngân hàng (Cambridge 15–21) + 4 trùng nội bộ DOL + 13 cần xử lý.
Clean theo nguồn: Actual Test 116, Cambridge 9–14 88, PTP 62, IELTS Trainer 22, Official Guide 22.
