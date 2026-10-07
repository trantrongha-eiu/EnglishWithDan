# Seed Listening từ bộ "VOL 1–9 ORIGINAL EXAMS" (thư mục local ở gốc repo, không commit)

Thầy 2026-10-07: seed các bài lẻ của Vol 1–9 lên web, mỗi test = 4 section lẻ → 1 đề full tên có "Vol"
("Vol 1 - Test 6", seriesName "Vol 1", testNumber 6). Phần nào đã có trong ngân hàng thì KHÔNG seed lại mà dùng
bài có sẵn để ghép. **Listening trước, Reading sau. Mỗi lần 1 vol, xong thì dừng và báo cáo.** Chỗ cần quyết thì hỏi thầy.
Thiếu audio thì được tìm trên mạng. Transcript được tự sinh hoặc lấy trên mạng.

## Quy trình 1 vol (cwd = backend/scripts/volListening)

1. `py extract.py <V>` → `web/vol<V>/extract.json` (chữ docx transcript; PDF là ảnh scan, không có text) + ảnh trang PDF.
   Đọc trang câu hỏi (thường p1–6 của PDF mỗi test) và trang **KEY LISTENING** (2–3 trang cuối) bằng mắt.
2. Chống trùng với ngân hàng (`../dolListening/dump_listening.js` rồi copy `sections.json`/`tests.json` vào `web/`):
   so transcript 8-gram, **so cả key điền từ và chữ câu hỏi** — nhiều bài trong ngân hàng là cùng đề nhưng thu âm lại
   (transcript lệch hẳn, key giống 90–100%).
3. Viết `specs/vol<V>_t<T>.js`: câu hỏi (helpers `note/table/mc/multi/map/matching/short` trong `vol_build.js`), key, giải
   thích tiếng Việt `{ v, t, p }` (t = trích NGUYÊN VĂN transcript, p kết thúc "→ đáp án"), tên người nói `speakers`,
   sửa chữ `fix` (trong 1 lượt nói) / `rawFix` (cả docx), ảnh map `map(…, { page, box })` (toạ độ PDF point, `crop.py`).
   Phần trùng ngân hàng: `{ part, reuse: '<sectionId>' }`.
4. `node vol_build.js specs/…` → `web/vol<V>/draft/t<T>p<P>.json` + kiểm (đủ 10 câu, key, trích dẫn có trong transcript,
   key điền từ nghe được). Cảnh báo "(check)" = key không nguyên văn (vd. ngày đọc "April the 17th") → kiểm tay.
5. Transcript: **docx là nền** (đầy đủ nhưng ASR sai số/tên). `node whisper_parts.js specs/…` (Groq Whisper, để đối chiếu)
   rồi `node diff_whisper.js specs/… [part]` liệt kê chỗ docx ≠ Whisper → đưa vào `fix`. KHÔNG dùng Whisper làm nền:
   nó bỏ cả đoạn ở chỗ nghỉ dài và bịa "Thank you". Nghe 1 đoạn: scratchpad `wb.js <mp3> <from> <to>`.
6. `node vol_pw.js <V> t6p1 …` (Playwright site thật, bản nháp) → `node vol_import.js <V> … --apply` (ẩn; audio + map lên
   Cloudinary, mp4/m4a/wma đổi sang mp3) → ảnh bìa bằng `../dolListening/lcover_*` (key = 6 ký tự cuối _id, ảnh tượng trưng
   CC0/PD) → `node vol_activate.js <V> --apply` (từ chối nếu thiếu giải thích/audio/transcript/ảnh bìa/ảnh map) →
   `LIVE=1 node vol_pw.js <V> …`.
7. Đề full: `node vol_full_tests.js <V> <T…> [--apply|--activate]` (nối 4 mp3 → 1 audio) + `../dolListening/pw_fulltest.js "Vol V - Test T"`.
   Test trùng nguyên đề full cũ → đổi tên đề cũ (`rename_tests.js`, có backup), không tạo trùng.
8. Debug cả vol trước khi báo cáo: `node vol_audit.js <V>` (chỉ đọc DB: hình dạng đề, bản trong đề full == bài lẻ,
   draft == DB, URL audio/ảnh bìa/map trả về, độ dài audio đề full ≈ tổng 4 phần, trích dẫn giải thích có trong
   transcript, transcript dính chữ). Audio bài lẻ quá dài (vd. còn 10 phút chép đáp án) → `trim_section_audio.js`.

## Vol 1 — 2026-10-07 (xong cả 10 test)

- Test 1–4 = đề full "Actual Test 1–4" có sẵn (cả 4 phần, cùng key) → **đổi tên** thành Vol 1 - Test 1–4 (thầy chọn).
- Test 6–10: seed 15 bài lẻ mới + dùng lại 5 bài: T6 P3 = Assignment Notes & Presentation Guidance, T9 P2 = Global Museum,
  T10 P1 = Superior Home Appliances, T10 P3 = Marketing Students Discussion on SUVs, T10 P4 = Research into Learner
  Persistence. Đã tạo + bật Vol 1 - Test 6…10 (40/40, đủ 40 ô, map hiện ảnh).
- Test 5: P1 "New Guinea" = Mindset for IELTS **Level 3** track 67, không có trong thư mục → thầy chỉ nguồn
  tutorlistening.com/blog/new-guinea-listening ("part 1.mp3", 6:07) → cắt chữ "Track 67." ở đầu, lưu `test 5/Part 1.mp3`.
  docx thiếu mốc "Part one" → `rawFix` trong spec. Lỗi đề: Q4 thừa "no", Q6 "in order", Q10 key "replacement of natural
  dyes" → "natural" (câu đã có "replacement … of dyes"), docx "14,000" → 40,000. Đã seed + bật P1 và **Vol 1 - Test 5** (40/40).
- 2026-10-07 thầy đưa `Mindset_L2_67.mp3` (gốc repo) cho Test 5 P1 → KHÔNG đúng bài: đó là Mindset **Level 2** track 67
  (Speaking Part 3 mẫu về private tutoring, 2:11). Cần Mindset **Level 3** track 67 (bài nói ~5 phút về New Guinea).
- Debug lại cả vol (`node vol_audit.js 1`, chỉ đọc): 18 bài mới + Test 5 sạch. Còn lại ở đề cũ (Actual Test 1–4 cũ):
  audio bài lẻ "The Mangrove Regeneration Project" (T4 P4) dính 10 phút chép đáp án (15:48, nội dung hết ở ~5:14) →
  đã cắt còn 314 s (`trim_section_audio.js`, thầy duyệt); transcript T3 P1/P3 dính chữ sau dấu câu ("day.It's")
  đã sửa cả bài lẻ + bản trong đề full (`fix_glued_transcripts.js`). Audio đề full T1–4 đủ đến hết Part 4.
- Thầy duyệt đánh số lại: "Actual Test 5–16" → "Actual Test 1–12" (`renumber_actual_tests.js`, có backup), kèm đồng bộ
  ListeningAttempt.testName (tên lưu sẵn hiện ở lịch sử/review) của 12 đề này và Vol 1 - Test 1–4. Đề gộp tiếp theo = Actual Test 13.
- Sau sửa: `vol_audit.js 1` sạch, Playwright live 18 bài lẻ 10/10, 9 đề full 40/40.
- Lỗi đề gốc đã sửa (ghi ở đầu mỗi spec): T7 thiếu key Q34 (insects, theo băng), lựa chọn trùng chữ cái (T7 Q23-24, T9 Q27-30,
  T5 Q21-22), instruction sai ("NO WORD ONLY", "ONE MORE THAN TWO WORDS"); T7 "$500 deposit" (băng: $1,500).
