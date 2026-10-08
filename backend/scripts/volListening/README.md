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
   transcript, transcript dính chữ). Audio bài lẻ quá dài (vd. còn 10 phút chép đáp án) → `trim_section_audio.js`; đề full → `trim_test_audio.js`;
   audio đề full cũ lệch tổng 4 phần (khoảng nghỉ bị cắt) → `rejoin_test_audio.js` (nối lại từ 4 audio bài lẻ).

## Vol 2+ — khác Vol 1

Thư mục `listening/test N/`: `Test N.pdf` (đề + KEY, ảnh scan; Test 3 có text layer) + mỗi phần 1 file
`…pN.pdf` = transcript **Otter.ai** (chữ sai nhiều, phần lớn lượt nói không ghi người nói) + mp3/m4a. Tên file có tiền tố
mojibake "Bản sao của Bản sao của " → spec ghi phần đuôi (`audio: 'listening/test 1/part 1.mp3'`, `findFile` trong
`vol_media.js` tìm file có tên kết thúc như vậy). Nhiều pN.pdf bị đặt **nhầm test** (vd. Vol 2 test 4/6/8 p1 = test 1/3)
→ kiểm keyword trước khi dùng.

- Chống trùng: `node vol2_dedupe.js <V>` (transcript) + `node vol2_keys_dedupe.js` (gõ key từng phần vào file rồi so key
  với ngân hàng — cách chắc nhất).
- Transcript: `node whisper_parts.js` (stub spec chỉ cần `{vol,test,sections:[{part,audio}]}`) rồi
  `node merge_preview.js <V> <T> <P> [spec]` = **chữ Whisper + đoạn Whisper bỏ sót lấy từ Otter + lượt nói theo khối
  Otter** (`mergeOtterWhisper` trong `vol_transcript.js`; khối Otter không tên = đổi người nói). In ra cả các đoạn lấy từ
  Otter để soát. Spec: `speakers: {1:'Agent',2:'Customer'}` (số theo Otter) + `fix` (áp lên bản đã ghép). Bài hội thoại
  mà Otter chia lượt quá sai → viết nguyên văn vào `transcript:` của spec (vẫn lấy chữ từ bản ghép). Không có pN.pdf đúng
  → cũng viết `transcript:` từ Whisper. Chỗ nghi ngờ: `node wb.js <V> <T> <P> <từ giây> <đến giây>` (Groq
  whisper-large-v3-turbo, hạn mức riêng). Whisper hay bịa "Thank you." / "I like to know what you doing" ở chỗ lặng.
- Gemini (`gemini_transcribe.js`) cho transcript tốt nhất nhưng key là gói free 20 lượt/ngày dùng chung với chấm
  Speaking của web → **không dùng**.
- Ảnh map: trang render 110 dpi → toạ độ PDF = px × 72/110 (trang A4 595×842; một số PDF 595×770).

## Vol 3 — khác Vol 2

`Listening/test N/`: đề `test N[- up].pdf` (ảnh scan, KHÔNG có trang key) + audio; key cả vol ở `Key Lis VOL 3-full.xlsx`
(1 sheet/test → `web/vol3/keys.json`); transcript Otter ở `Listening/transcript/test N.pdf` (**cả test trong 1 PDF**, thường
không ghi người nói; riêng test 6 tách `transcript/test 6/section N.pdf`). Test 1–4 audio là **1 file cả đề**.

- Chống trùng: `node vol_keys_dedupe.js <V>` (đọc `web/vol<V>/keys.json`, in cả đề full chứa bài khớp nhất).
- `clip: [từ, đến]` (giây) trong spec: lấy đoạn audio của phần từ file cả đề, hoặc cắt đuôi 10 phút chép đáp án / phần giới
  thiệu bài thi (`partFile` trong `vol_media.js`; dùng chung cho Whisper, wb.js, import). Mốc: Otter + silencedetect, phần bắt
  đầu ở "Now turn to section N", hết sau "You now have half a minute to check".
- Otter cả test được tự tách theo phần (`otterPages` trong `merge_preview.js`: "Now turn to / Section N, you will hear",
  thiếu thì lấy "end of section N-1").
- Người nói: `turns: [['Agent', 'Good morning.'], ['Anna', "I'm interested…"], …]` = câu mở đầu mỗi lượt (tìm tuần tự trong
  bản ghép sau `fix`), suy theo nội dung; `turns: []` = bài một giọng. Có `turns` thì bỏ số người nói của Otter.
- Part 1 phát ví dụ trước rồi phát lại cả bài → `fix` xoá bản ví dụ (giữ bản đầy đủ).

## Vol 4 — khác Vol 3

`listening/test N/`: đề scan tên lộn xộn (`test 1.pdf`, `test 2- listening (2).pdf`, `listening- up.pdf`, …) → ảnh map ghi
`map(…, { pdf: 'listening/test 4/listening- test 4.pdf', page, box })`. Key cả vol ở `listening/Key Lis vol 4-full.xlsx`
(máy không có openpyxl → đọc thẳng XML trong zip) → `web/vol4/keys.json`. Transcript Otter **theo phần** nhưng định dạng
khác (`Speaker 1 (00:32):`, gần như không chia người nói) và có phần tách 2 PDF (`Part 2 Cau 11 - 16.pdf` + `…17 - 20.pdf`)
→ spec ghi `otter: ['…pdf', '…pdf']` (`otterPages` nối theo thứ tự; `otterToRaw` hiểu định dạng mới); không có PDF → `otter: false`.
Vì Otter không chia lượt, transcript từng phần được **viết nguyên văn vào `transcript:`** (chữ từ bản ghép Whisper + Otter,
chỗ hụt nghe lại bằng `wb.js`). Track 1 có phần giới thiệu bài thi → `clip` từ "Now turn to Section 1"; Track 4 dính 10 phút
chép đáp án → `clip` đến ~2 s sau "half a minute / one minute to check" (mốc lấy bằng silencedetect + Whisper turbo).

## Vol 5 — khác Vol 4

`Listening/Test N/`: đề `Test N- up.pdf` (ảnh scan; T9 có text layer) + audio từng phần (`P1.mp3`, `S1.mp3`, `P1 (2).mp3`,
`p1.wma`…; spec ghi đúng tên). Key cả vol: `Listening/Tổng hợp key Listening.pdf` (ảnh, 1 trang/test → gõ tay vào
`web/vol5/keys.json`). Transcript Otter cả test 1 PDF ở `Listening/Transcripts & Keys/test N- ….pdf` — **ảnh scan** (trừ T9),
nên dùng để soát bằng mắt, không ghép tự động. Nhiều phần có phần giới thiệu bài thi / ví dụ phát trước / 10 phút chép đáp
án → `clip`. Một số phần là "practice of the day" đánh số câu 1–10 (đề đánh lại 11–20 / 31–40).

- Transcript viết nguyên văn vào `transcript:` = chữ Whisper large-v3 (`whisper_parts.js` với stub `web/vol5/stubs/t<T>.js`),
  chỗ large-v3 bỏ sót nghe lại bằng `wb.js`.
- Người nói: **`node speaker_pitch.js <stub|spec> <part>`** (mới) = Whisper turbo có mốc thời gian từng từ (cache
  `web/vol5/words/`) + cao độ giọng (`f0.py`, numpy) → mỗi câu một dòng `M`/`F`/`~`. Chỉ phân biệt nam/nữ; hai giọng cùng
  giới thì suy theo nội dung.

## Vol 5 — 2026-10-08 (xong cả 10 test)

- Mới: 36 bài lẻ (T1, T3, T5, T6, T9, T10 đủ 4 phần; T2 P1–P3; T4 P2–P4; T7 P1/P3/P4; T8 P1/P2/P4) — đều bật, có ảnh bìa,
  Playwright nháp + live 36/36; 5 ảnh map/diagram (T2P3, T5P2, T6P2, T9P2, T10P2).
- Dùng lại (key + câu hỏi khớp 10/10): T2 P4 = "Office Design" (Vol 3 - Test 10), T4 P1 = "Booking Flights" (Actual Test 7),
  T7 P2 = "Moving Office" (Actual Test 7 / Vol 2 - Test 8), T8 P3 = "Music in Restaurants" (Vol 1 - Test 9).
  Không test nào trùng nguyên đề cũ → tạo + bật đề full **Vol 5 - Test 1…10** (pw_fulltest 40/40 cả 10). `vol_audit.js 5`: 0 problem, 1238 trích dẫn khớp.
- T2 P2 "Becoming a Millionaire" (Arthur Knowles) ≠ T1 P2 "Starting a Business" (Arthur Jones): khác băng, khác câu hỏi.
- Lỗi key gốc đã sửa theo băng (ghi ở đầu mỗi spec): T5 Q3 dividing → diving; T5 Q34–37 (key của bản đề khác) →
  interaction/obligation/process/cooperation; T6 Q35 A → B; T7 Q9 2 → 3; T9 Q19 E → F. T2 Q1 băng đánh vần G-R-A-Y.
  Đề in sai: T4 P4 đánh số 1–10, T7 Q26 cụt chữ, Q27–30 hộp A-F (7 lựa chọn), T10 Q9 mất số câu.
- 2026-10-08 debug lại (ngoài `vol_audit.js`): so transcript từng phần với Whisper turbo có mốc thời gian của chính audio đã
  up (`web/vol5/words/`, bổ sung t7p4/t8p4/t9p2/t9p4) + `wb.js` nghe lại 14 đoạn lệch → transcript đúng, chỉ **T10 P4 thiếu
  2 câu cuối** ("Thank you for attending tonight's presentation. Please know that my Central Government Tax Agency…") → đã
  thêm vào spec + bài lẻ + bản trong đề full (backup web/vol5/backup/t10p4transcript_*). Người nói: so cao độ giọng từng lượt
  (căn transcript ↔ từ Whisper) — nhãn đều đúng; ngưỡng cố định 165/175 Hz của speaker_pitch.js hay xếp nhầm giọng nam
  cao (Adam T2P1, Man T5P1, Daniel T7P1) thành F → so tương đối với người đối thoại. Đoạn đầu/cuối audio: không phần nào cắt
  mất lời; T7P4/T8P4 còn câu "10 minutes to transfer" (không kèm 10 phút lặng). Key ↔ "→ đáp án" của giải thích khớp cả 400
  câu; 5 ảnh map đủ chữ cái. Header mp3 = độ dài giải mã (mốc turbo vượt độ dài ở T4P2/T10P2 là do Whisper trôi mốc).
  Đối chiếu lại map T9 P2 (Q15–20 C E G H F B) với lời chỉ đường: đúng; Q19 F = góc Park Road × Renne's Drive phía bắc
  Park Road (D phía nam, E là bãi xe mới Q16).
- Ảnh bìa thừa (thầy duyệt xoá): 3 mục trong `data/listeningCovers.json` trỏ tới bài không còn trong ngân hàng
  (Cam 18 - Test 1 – Part 2/3 cũ `…da09c7`/`…da09d5`, "The influence of children on adult diet" `…ffa24a`) → xoá mục
  (333 → 330, khớp 330 bài có ảnh bìa) + xoá 3 ảnh tương ứng trên Cloudinary `listening/covers/` (không bài/collection nào
  dùng; backup web/vol5/backup/stale_covers). Cloudinary nay còn 330 ảnh bìa Listening, đều đang được dùng.

## Vol 4 — 2026-10-08

- Mới: 31 bài lẻ (T1, T3, T4, T5, T8, T9, T10 đủ 4 phần + T2 P1/P2/P4) — đều bật, có ảnh bìa, Playwright live 31/31;
  5 ảnh map/diagram (T2P2, T4P2, T5P2, T8P2, T9P3). Đề full **Vol 4 - Test 1, 2, 3, 4, 5, 8, 9, 10**.
- Dùng lại: T2 P3 = "Aims of the geography lesson" (Actual Test 2 P3, cùng băng, cùng câu hỏi; key xlsx Q23 "D" sai —
  "Neither of us was too dominant" loại D, key B của ngân hàng đúng).
- T2 P4 cùng băng "Biomass Fuel" (Actual Test 5 P4) nhưng bộ câu hỏi khác hẳn (cost/store/powder… ≠ waste/cleaner/size…)
  → seed riêng "Biomass Briquettes" (transcript lấy của ngân hàng, đối chiếu Whisper).
- **T6 = Vol 3 - Test 6**: 4 file audio + PDF đề giống từng byte (md5) → không seed. Key xlsx sheet Test 6 (studio,
  laundry, harbour…) là của một đề khác, không khớp đề này.
- **T7 = nguyên đề "Actual Test 1"** (4 phần cùng băng, cùng key 10/10) → thầy duyệt 2026-10-08: đổi tên thành
  **Vol 4 - Test 7** (`rename_tests.js 4 --apply`, backup web/vol4/backup, 12 nhãn testName) rồi đánh số lại
  "Actual Test 2–9" → "1–8" (`renumber_actual_tests.js --apply`, backup web/vol1/backup, 50 nhãn testName). Quét lại:
  không đề nào số trong tên ≠ testNumber, không trùng tên, mọi ListeningAttempt.testName = tên đề hiện tại.
  Đề gộp tiếp theo = Actual Test 9.
  - Lỗi cũ lộ ra khi audit: audio đề full (dựng tay) phát **nhầm băng Part 1** (cuộc gọi "Granary Cottage" – Tom/Shirley,
    không phải "Holiday rental" – Dave/Carol Marriott của câu hỏi) và dư ~2,5 phút đuôi "You have two minutes left…"
    → nối lại từ 4 audio bài lẻ (`rejoin_test_audio.js 4 "Vol 4 - Test 7" --apply`, 1830 s → 1766 s, backup; không ai
    đang làm dở). Giải thích Q5 bài lẻ "Holiday rental" (+ bản trong đề full) trích thiếu "It's close by." → sửa (backup
    web/vol4/backup/q5quote_*). Sau đó `vol_audit.js 4` 0 problem, pw_fulltest 40/40.
- T4 P3 "Willows": key xlsx trùng chuỗi đáp án Cam 18 T1 P3 9/10 (vol_keys_dedupe báo CHECK) nhưng đề và băng khác hẳn.
- Lỗi key gốc đã sửa theo băng (ghi ở đầu mỗi spec): T3 Q1 Southeast → south-west; T4 Q17 C → A; T4 Q26 A → C;
  T4 Q10 44298611 (thiếu số 0, nhận cả 044298611); T5 Q21–22 D,E → C,D; T9 Q29 A → B; key gõ sai T2 Q35, T3 Q35/Q39.
  Đề in sai: T4 Q22 lặp câu hỏi Q23, T5 Q36 vỡ dòng, T9 Q6/Q9 mất số câu.
- T4 P2: băng đọc "Amsden" nhưng đề + map ghi Elmsden → transcript theo tên trên đề.
- Audio T2 P2 (`Track 2.mp3`) hỏng một đoạn: header 404 s nhưng chỉ giải mã được 371 s (nội dung liền mạch, Whisper cũng
  371 s) → nối đề full lệch 33 s; đã mã hoá lại audio bài lẻ (`trim_section_audio.js 4 <id> 371`, backup web/vol4/backup).
  Các mp3 gốc khác (không clip) đã kiểm header = giải mã.

## Vol 3 — 2026-10-08 (xong cả 10 test)

- Mới: 17 bài lẻ (T1, T6, T9, T10 đủ 4 phần + T2 P2) — đều bật, có ảnh bìa, Playwright live 17/17; 1 ảnh map (T1 P2).
  Đề full **Vol 3 - Test 1, 2, 6, 9, 10** tạo mới + bật (pw_fulltest 40/40). T2 P1/P3/P4 dùng lại bài của Actual Test 6.
- T2 P2 cùng băng với "The City of Gisborne" (Actual Test 6 P2) nhưng bộ câu hỏi khác (Q11–16) → seed riêng "Radio Guide to Gisborne".
- Trùng nguyên đề: **T3 = "Actual Test 8", T4 = "Actual Test 9"** → thầy duyệt đổi tên thành Vol 3 - Test 3/4
  (`rename_tests.js 3 --apply`, backup `web/vol3/backup/`, 7 nhãn testName) rồi đánh số lại "Actual Test 10–11" → "8–9"
  (`renumber_actual_tests.js --apply`, backup web/vol1/backup). **T5 = Vol 2 - Test 7, T7 = Vol 2 - Test 9, T8 = Vol 2 - Test 10**
  → thầy chọn KHÔNG tạo đề trùng (không có Vol 3 - Test 5/7/8; spec chỉ ghi nhận).
- Lỗi key gốc đã sửa theo băng (ghi ở đầu mỗi spec): T1 Q19–20 B,C → B,E; T1 Q26 D → C; T6 Q17 C → B; T6 Q39 roads → ropes;
  T9 Q2 "3 courses" → celebration; T9 Q11 A → B; T9 Q31 smell → bear; T9 Q33 viewers → bread; T10 Q21 A → B.
  Instruction sai: T1 Q4–10 "NO MORE THAN WORDS", T9 Q16–20 ghi "questions 26-30".
- Debug: `vol_audit.js 3` sạch sau khi đồng bộ key Q9 "JYZ37/JYZ 37" vào bản trong đề full Vol 3 - Test 3 (backup
  web/vol3/backup) và sửa audit báo nhầm trích dẫn có nháy đơn trước dấu chấm ("'Home Welcome'.").
- 2026-10-08 thầy duyệt sửa lỗi cũ (sau đó `vol_audit.js 1/2/3` đều 0 problem, pw_fulltest 40/40):
  - `vol_audit.js` trước chỉ kiểm trích dẫn trong nháy thẳng "…" → giải thích dùng nháy cong “…” (Vol 2/3) KHÔNG được
    kiểm. Nay kiểm mọi đoạn trong nháy trên dòng Transcript (in số trích dẫn đã kiểm: Vol 1 872, Vol 2 1080, Vol 3 734 —
    đều khớp). Vol 1 - Test 1 P3 Q22 là báo nhầm (audit cũ gộp `— Steve:` giữa 2 trích dẫn vào chữ trích).
  - Audio đề full Vol 1 - Test 1–4 (Actual Test 1–4 cũ, dựng tay): đủ nội dung nhưng 30 s kiểm tra sau mỗi phần bị rút
    còn ~15–18 s và mất câu "That is the end of section N" (T4 thì thừa đuôi 42 s lặng) → nối lại từ 4 audio bài lẻ
    (`rejoin_test_audio.js 1 "Vol 1 - Test 1" … --apply`, backup web/vol1/backup). Dò sóng âm: 4 phần nằm đúng chỗ, liền nhau.
  - "Cam 15 - Test 1" lưu testNumber 4 (trang tài nguyên hiện "Test 4", sắp xếp sai) → 1 (backup web/vol1/backup/testnumber_*).
    Quét cả listeningtests + readingtests: không còn đề nào số trong tên ≠ testNumber.

## Vol 2 — 2026-10-07 (xong cả 10 test)

- Mới: 33 bài lẻ (T1–T6, T9, T10 đủ 4 phần + T8 P4) — đều bật, có ảnh bìa, Playwright live 10/10; 5 ảnh map/diagram
  (T3P2, T5P2, T6P2, T9P2, T8P4).
- Dùng lại: **Test 7 = nguyên đề "Actual Test 10"** (cùng băng, cùng key) → đổi tên thành Vol 2 - Test 7
  (`node rename_tests.js 2 --apply`, backup `web/vol2/backup/`, đồng bộ 2 nhãn testName trong lịch sử). Test 8 P1–P3 =
  "Joining a wildlife conservation society" / "Moving Office" / "The artist Samuel Prout".
- Đề full: Vol 2 - Test 1–6, 8, 9, 10 tạo mới + bật (pw_fulltest 40/40); Test 7 là đề cũ đổi tên.
- T1 P2 cùng đề gốc với "Southern Wonders Beach Resort" nhưng câu hỏi/đáp án khác (Q11, Q16, Q18–20) → seed riêng.
- Lỗi đề gốc đã sửa (ghi ở đầu mỗi spec): T1 key Q35/36 lệch (exhibitions/affordable); T2 Q9–10 key C,D → A,D và Q20
  F → B (theo băng); T3 Q8–10 lựa chọn vỡ dòng (dựng lại A–G); T9 Q3 "James" → "Chase" (băng); T4/T5 key 2 từ cho ô
  ONE WORD (chấp nhận thêm "pool"/"wealthy"); T8 Q38 12.5 (Whisper nghe "12", Otter + wb.js: 12.5).
- Còn lại ở đề cũ (chưa sửa, chờ thầy): audio "Vol 2 - Test 7" (Actual Test 10 cũ) dài 38,6 phút vì còn ~10 phút lặng
  chép đáp án ở cuối (nội dung hết ở ~28:25).
- 2026-10-08 debug lại: bài lẻ cũ "Health on the Night Shift. 14 + 15" (T7 P4, nội dung y hệt bản trong đề full) đổi tên
  thành "Health on the Night Shift"; audit bỏ qua dấu "…", nháy đơn/kép và centre/center khi so trích dẫn (các cảnh báo
  trích dẫn ở T7 P1/P2, T8 P1 là báo nhầm).
- 2026-10-08 thầy duyệt: "Actual Test 11–12" → "Actual Test 10–11" (`renumber_actual_tests.js --apply`, backup
  web/vol1/backup, 2 lượt làm bài đổi testName theo); audio đề full "Vol 2 - Test 7" cắt 2317 s → 1708 s
  (`trim_test_audio.js`, silencedetect: hết Section 4 + câu kết ở 28:25, sau đó chỉ im lặng / "two minutes left").
  Sau đó `vol_audit.js 2` sạch (0 problem), pw_fulltest T7 + Actual Test 10/11 đều 40/40.

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
  ListeningAttempt.testName (tên lưu sẵn hiện ở lịch sử/review) của 12 đề này và Vol 1 - Test 1–4. Đề gộp tiếp theo = Actual Test 13 (nay là 9 — xem Vol 4).
- Sau sửa: `vol_audit.js 1` sạch, Playwright live 18 bài lẻ 10/10, 9 đề full 40/40.
- Lỗi đề gốc đã sửa (ghi ở đầu mỗi spec): T7 thiếu key Q34 (insects, theo băng), lựa chọn trùng chữ cái (T7 Q23-24, T9 Q27-30,
  T5 Q21-22), instruction sai ("NO WORD ONLY", "ONE MORE THAN TWO WORDS"); T7 "$500 deposit" (băng: $1,500).
