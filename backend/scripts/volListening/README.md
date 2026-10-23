# Seed Listening từ bộ "VOL 1–9 ORIGINAL EXAMS" (thư mục local ở gốc repo, không commit)

Thầy 2026-10-07: seed các bài lẻ của Vol 1–9 lên web, mỗi test = 4 section lẻ → 1 đề full tên có "Vol"
("Vol 1 - Test 6", seriesName "Vol 1", testNumber 6). Phần nào đã có trong ngân hàng thì KHÔNG seed lại mà dùng
bài có sẵn để ghép. **Listening trước, Reading sau. Mỗi lần 1 vol, xong thì dừng và báo cáo.** Chỗ cần quyết thì hỏi thầy.
Thiếu audio thì được tìm trên mạng. Transcript được tự sinh hoặc lấy trên mạng.

**Reading** (từ 2026-10-16): quy trình + nhật ký riêng ở `../volReading/README.md` (Vol 1 xong).
**Listening: Vol 1–9 xong (2026-10-23).**

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

## Vol 6 — khác Vol 5

`Lis/`: đề `L-TEST N.pdf` (ảnh scan, 6 test, trang khổ lớn ~1800×2900 pt → toạ độ map = px ảnh 110 dpi × 72/110) + key cả vol
`L-key.pdf` (ảnh, 1 trang/test → gõ tay `web/vol6/keys.json`) + `Full Listening.docx` = **chữ của đề (OCR), không phải transcript**
(dùng để gõ câu hỏi; `web/vol6/questions.txt`). Audio `Lis/Audio Lis/Test N/` từng phần; Track 1 của T2–T5 có phần giới thiệu cả
bài thi (~41–50 s) → `clip` từ "Part 1"; Track 4 của T1–T5 dính 10 phút chép đáp án → `clip` đến ~2 s sau "10 minutes to transfer".
`map(…, { pdf: 'Lis/L-TEST N.pdf', page, box })` (`cropFor` nay chỉ dò thư mục test khi spec không ghi `pdf`).

- Transcript: thầy 2026-10-15 — **tìm trên mạng trước, không có mới tự sinh**. Vol 6 chỉ có transcript máy của chính nhóm phát hành
  trên Scribd (khoá, không ghi người nói) và youpass.vn ("VOL 6 Test N - …", trường transcription rỗng) → tự sinh.
- Tự sinh = Whisper large-v3 (`whisper_parts.js` với stub `web/vol6/stubs/t<T>.js`) + turbo có cao độ (`speaker_pitch.js`, cache
  `web/vol6/pitch/`). Công cụ riêng (git-ignored): `node web/vol6/draft.js <T> <P> M=Tên F=Tên` = bản nháp từ turbo, chia lượt theo
  M/F, đánh dấu `[T?]` câu turbo có mà large-v3 không (đoạn large-v3 bỏ sót — hoặc câu bịa) và `[L+]` câu large-v3 có mà turbo
  không; `view.js` xem 2 bản song song; `wdedupe.js` so 6-gram với ngân hàng; `wbq.sh` hàng đợi nghe lại tự thử lại khi hết hạn mức.
  Cả hai model hay bỏ cùng một đoạn ở chỗ nghỉ (T4P4 237–267 s chứa đáp án Q37, T5P1 327–341 s) và turbo hay chép **prompt** vào chỗ
  lặng ("Well, it's £15 a day.", "Yes, that's right.") hoặc bịa "Transcription by CastingWords" → luôn soát `[T?]`.
  `wb.js` nhận `WB_MODEL=whisper-large-v3` (mỗi model hạn mức riêng 7200 s audio/giờ).
- Hai giọng cùng giới (T1P3 tutor + Fiona, T5P3) → chia lượt theo nội dung; đoạn large-v3 thường ngắt đúng chỗ đổi lượt.

## Vol 7 — khác Vol 6

`Listening/Test 1-10/`: đề `Test N.pdf` (**có text layer**, gõ câu hỏi từ `extract.json`; ảnh map vẫn cắt bằng `map(…, { pdf, page,
box })`, trang 612×792 pt) + key cả vol `Key Lis VOL 7 (T1-T10).pdf` (text) → `web/vol7/keys.json`; audio **1 file cả đề**
`VOL 7 Audio (T1-T10)/VOL 7 TEST N.mp4|m4a|mp3` → `clip` từng phần; transcript `Transcript VOL 7 (T1-T10)/… test N.docx` =
TurboScribe (dòng `(m:ss - m:ss)`, tiêu đề `Section N`/`Part N`, không ghi người nói). `Listening/Test 11/`: audio cả đề + đề PDF
(key ở 2 trang cuối) + transcript **PDF** (đánh dấu đáp án "Q7 …" ngay trong câu → spec `rawRe`).

- `extract.py`: regex `<w:t[^>]*>` cũ khớp cả `<w:tab/>`, `<w:tbl>` → T5–T10 ra lẫn XML; nay chỉ `<w:t>`/`<w:t …>`.
- Spec `docx: '<đường dẫn trong vol>'` → `vol_build.js` tách phần theo dòng tiêu đề (`splitHeadings`), bỏ dòng timestamp;
  `cut: [[từ, đến]]` xoá đoạn thô (Part 1 phát ví dụ trước rồi phát lại cả bài); `rawRe`; `turns` (Vol 3) áp sau `cleanPart`.
  Bộ lọc lời dẫn (`vol_transcript.js`) thêm: "Now turn to section N on page N", "You'll hear", số viết chữ ("six to ten",
  "thirty-one to forty"), "end of the listening test / 10 minutes to transfer", câu "check your answers" không dấu chấm; mẫu
  "Before you hear the rest…" chạy TRƯỚC mẫu "you have some time…" (trước đây nuốt luôn câu kế tiếp của bài, vd "And then…
  we bring in a buffet").
- Mốc phần: silencedetect (`noise=-40dB:d=8`) + nghe máy 12–16 s quanh mỗi mốc (Groq turbo) → bắt đầu ở "Part/Section N" (hoặc
  "Now turn to…"), hết trước lời dẫn phần sau. Nhiều đề bỏ khoảng 30 s soát đáp án giữa các phần.
- `diff_whisper.js` nay hiểu `spec.docx`/`rawRe` và dùng turbo `words/` khi không có large-v3, in kèm giây.
- Người nói: `speaker_pitch.js` (stub `web/vol7/stubs/t<T>.js`) + nội dung; công cụ riêng (git-ignored) `web/vol7/prev.js <T> <P>`
  = transcript docx đã lọc, mỗi câu một dòng (để viết `turns`).
- Playwright: site có `middleware/botGuard.js` chặn UA "HeadlessChrome" (403 "Truy cập bị từ chối" lúc đăng nhập) → `vol_pw.js`,
  `pw_fulltest.js` dùng UA Chrome thường.

## Vol 8 — khác Vol 7

`LISTENING/`: đề `VOL 8 TEST N LIS.docx` (**đánh máy**, gõ câu hỏi từ `extract.json`; ảnh map nhúng trong docx → giải nén
`web/vol8/img/t<T>/image1.*`, spec `map(…, { img: 'img/t1/image1.jpg' })` — `cropFor` nay hiểu `c.img`, đổi sang PNG, không cắt)
+ `TRANSCRIPT-KEY/TRANSCRIPT-KEY VOL 8 TEST N LIS.docx` = key dòng `Câu số N:` (câu chọn 2–3 đáp án ghi gộp `Câu số 17-18:` →
`B, C`) rồi transcript TurboScribe (tiêu đề `Section N`, không ghi người nói) + audio `AUDIO/TEST N VOL 8.mp4` = **cả đề 1 file**.
8 test, không có 10 phút chép đáp án ở cuối. Map có watermark "REAL IELTS EXAMS 0964879926" của nhà phát hành.

- Spec: `docx: 'LISTENING/TRANSCRIPT-KEY/…'` + `rawRe: [['^[\\s\\S]*?\\n(?=Section 1\\n)', '']]` (bỏ khối key; key viết `SECTION N`
  hoa, transcript `Section N`). Tên riêng docx viết khác đề in → `rawRe` theo đề (Fernley→Fearnley, Beachheads→Beach Heads, …).
- Mốc phần (công cụ git-ignored trong `web/vol8/`): `full_words.js` = Whisper cả đề có mốc từng từ → `full/t<T>.json` (turbo; hết
  hạn mức thì `WB_MODEL=whisper-large-v3`); `clips.js <T>` = P1 từ sau "…of your question booklet.", ranh giới = cuối khoảng lặng
  soát đáp án sau "end of part N" − 0,5 s, P4 hết sau câu "check your answers" cuối → `clips.json`; `mkstubs.js <T>` (+ `OVR` đặt
  tay) → `stubs/t<T>.js`, `clips_final.json` (spec T6–T8 đọc file này) và cắt `words/t<T>p<P>.json` cho `speaker_pitch.js`;
  `probe.js <T> <từ> <đến>` nghe 1 đoạn của file cả đề; `edges.js t1p1 …` nghe 10 s đầu + 12 s cuối mỗi audio phần đã cắt;
  `prev.js <T> <P>` transcript docx đã lọc, mỗi câu một dòng; `tdedupe.js` so 6-gram transcript với ngân hàng.
- Bộ lọc lời dẫn: "You now have one minute to check" (docx cụt, không có "your answers") nay cũng bị xoá.
- Tiêu đề nhóm `'X\nQuestions N-M'` và `\n\n` trong instruction bị site gộp thành 1 dòng → chỉ dùng `'Questions N-M'`.

## Vol 9 — khác Vol 8

`LISTENING/`: đề `TEST N-L.docx` (đánh máy; map nhúng trong docx → `web/vol9/img/t<T>/image1.png`) + `KEY - TRANSCRIPT/KEY TEST
N-L.docx` (key `Câu số N:` — T3/T4 là danh sách 40 dòng trần — rồi transcript TurboScribe) + `AUDIO/TEST N.mp4` cả đề 1 file. 9 test.
`web/vol9/keys.js` → `keys.json`.

- Timestamp `(m:ss - m:ss)` nằm **đầu đoạn, cùng dòng** (Vol 8 nằm riêng dòng) → `rawRe` chung ở `specs/vol9_rawre.js` (bỏ khối key +
  timestamp). Docx còn sót mốc trơ ("07:56", "06:14"…) → `fix`. Docx T2 chia Part 2/3 lệch một câu mỗi phía → `rawFix` chuyển lại.
- Công cụ (git-ignored, như Vol 8): `full_words.js`, `clips.js`, `mkstubs.js` (OVR đặt tay), `prev.js`, `tdedupe.js`, `probe.js`,
  `edges.js`, `coverq.js` + mới `sil.js <T>` (khoảng lặng kèm chữ Whisper hai bên), `seg.js <T> <từ> <đến> [regex]`, `probew.js`
  (= probe có mốc từng từ). Nhiều đề **không có 30 s soát đáp án** giữa các phần (T5, T6, T7, T8, T9 P2→3) → mốc đặt ngay trước
  "Part N" bằng `probew.js`; T5/T6/T7/T8 audio bắt đầu giữa lời dẫn Part 1; T9 audio hết 10 s sau "one minute to check".
- Map: watermark chỉ là **màu nhạt phủ lên nền** → `web/vol9/maps_src/clean.py` đưa từng điểm ảnh về bảng màu của chính map (nền
  trắng/hồng/tím, xanh ô chữ), giữ nguyên nét đen, chữ, bóng icon → ảnh sạch, đúng nguyên bản (T5–T9; nền trắng `TH=22`, nền màu
  `TH=35 WL=999 WARM=0`). T1 (sơ đồ đơn giản) vẽ lại SVG `maps_src/t1p2.svg` + `render.js`. Spec trỏ `img/t<T>/map_redraw.png`.
- T1 Q18–20 là sơ đồ đánh số + hộp từ (không phải chữ cái trên map) → group `map` + `dragDropConfig.words`, key = chữ.

## Vol 9 — 2026-10-23 (xong cả 9 test)

- Chống trùng (`vol_keys_dedupe.js 9` + `tdedupe.js` + so chữ câu hỏi): dùng lại 6 phần — T2 P4 = Health on the Night Shift (Actual
  Test 5 / Vol 2 - T7), T3 P1/P2 = Windshem Farm Center / Student Vacation Jobs (Vol 2 - T7), T4 P4 = The Impact of Technology on Young
  People (Vol 3 - T3; key 10/10, transcript ngân hàng khác bản), T7 P3 = The artist Samuel Prout (Vol 2 - T8), T8 P3 = Stone Point (Vol 6 -
  T2). CHECK giả ở T7 P1/P2, T8 P2 (chuỗi chữ cái MC trùng ngẫu nhiên, đề khác). Không đề full nào trùng.
- Mới: 30 bài lẻ — đều bật, ảnh bìa R2 (CC0/PD Wikimedia), Playwright nháp + live 30/30; 6 map (T1P2, T5P2–T9P2). Đề full **Vol 9 - Test
  1–9** tạo + bật; pw_fulltest 40/40 cả 9. `vol_audit.js 9`: 0 problem, 1102 trích dẫn khớp.
- Lỗi key gốc sửa theo băng (ghi đầu spec): **T5 Q8** "tea" → **colour** ("you have to see colour accurately"); T3 Q39 "nutritions" →
  nutrition. Docx sai so với băng/đề: T6 P4 "bought" → brought, T2 "Gerry" → Jerry, T4 "Hawthorne" → Hawthorn, T8 "Forts Road" → Forest
  Road, T1 "Springdown" → Spring Down; T8 P1 bản phát lại mất câu mở đầu → `fix` lấy từ bản ví dụ; T3 P3 băng cụt "So the others...".
- Người nói theo `speaker_pitch.js` + nội dung; T2P3 (Emma/Nick), T5P3 (Tutor/Annie/Ryan) cao độ lẫn lộn → chia theo nội dung câu hỏi.
  T4 P3 "will you be teaching out?" — cả turbo lẫn large-v3 đều nghe vậy, giữ nguyên.
- 2026-10-23 debug lại (ngoài `vol_audit.js`, công cụ git-ignored trong `web/vol9/`):
  - `keycheck.js`: key DB (bài lẻ + bản trong đề full) ↔ key docx từng câu + "→ đáp án" của giải thích, 360 câu. Lộ thêm 2 chỗ đã key theo
    băng lúc seed nhưng **chưa ghi** (nay ghi ở đầu spec, nghe lại bằng large-v3): **T7 Q15 A → C** (hội đồng "have authorised the
    spending" cho hệ thống đèn; thêm nhân viên mới chỉ đang xin duyệt), **T8 Q16 C → B** ("Payment to the centre is made by school, not by
    parents… leave payment… at the school office"). Các chỗ lệch còn lại đều có lý do (T1 Q18–20 key là chữ; T2 P4 là bài ngân hàng; T5 Q8).
  - Mọi đoạn Whisper lần đầu bỏ sót trong vùng đáp án (T7P2, T8P1, T8P4, T9P2) nghe lại bằng large-v3 (`probe.js`) → docx đúng.
  - Người nói: cao độ từng từ (`f0.py` + mốc từ, lệch ~0,4 s) cho T1P3/T2P3 → T1P3 "My problem is creating things to worry about…" là
    giọng **Rob** (đã sửa lại như băng), T2P3 Nick gợi ý ảnh, Emma phản đối ("Hang on. There's no point…"). `sync_transcripts.js --apply`
    ghi transcript mới vào bài lẻ + bản trong đề full (backup `web/vol9/backup/transcript_*`). Các phần khác DB == draft.
  - `audiocheck.js`: 9 audio đề full + 30 audio bài lẻ trên R2 đều 200, độ dài header = giải mã = DB. Sau đó audit 0 problem, pw_fulltest
    T1/T2 40/40.

## Vol 8 — 2026-10-23 (xong cả 8 test)

- Chống trùng (`vol_keys_dedupe.js 8` + `web/vol8/tdedupe.js`): chỉ **T2 P2 = "Becoming a Millionaire"** (Vol 5 - Test 2; key 10/10,
  transcript 83 %) → dùng lại. 31 phần còn lại mới, không đề full nào trùng.
- Mới: 31 bài lẻ (T1, T3–T8 đủ 4 phần; T2 P1/P3/P4) — đều bật, ảnh bìa R2 (CC0/PD Wikimedia), Playwright nháp + live 31/31;
  4 ảnh map (T1P2, T3P2, T5P2, T6P2). Đề full **Vol 8 - Test 1–8** tạo + bật; pw_fulltest 40/40 cả 8 đề. `vol_audit.js 8`:
  0 problem, 952 trích dẫn khớp.
- Lỗi key gốc đã sửa theo băng (ghi ở đầu spec): **T1 Q1** "13 March 1998" → **30 March (1988)** (băng "March the 30th. Oh, I'm the
  31st. 1988"; lúc seed tưởng Sarah tự sửa thành 31, debug 2026-10-23 bằng voice embedding: "Oh, I'm the 31st." là **nhân viên** nói ngày
  sinh của mình → 30; "13th" của docx/key là nghe nhầm "30th"). (T4 Q37 từng ghi "B → A" là nhầm: key docx vốn là A = the inside.)
  Chính tả theo đề/băng: T7 Q1 Thorn (đánh vần T-H-O-R-N), T5 Q5 Fearnleigh.
- Transcript: docx T5 P4 cụt ở "Many people were surprised." (mất đoạn chứa Q37–40) → bổ sung từ Whisper large-v3 (`rawFix`).
  Whisper bỏ sót nhiều đoạn ở chỗ ngắt (T1P2, T2P1, T5P3, T6P2/P4, T7P2, T8P2/P4) → nghe lại từng đoạn chứa đáp án: docx đúng.
  T3 P4 băng dừng sau "management of absence" (docx dính mẩu lời dẫn → `fix`); T4 audio bắt đầu giữa lời dẫn Part 1, Part 1 không
  có câu kết → mốc đặt tay; T6 P3/P4 mốc đặt tay (1234,6 s); T1 P4 đuôi dính 1 s lời giới thiệu phát lại → cắt ở 1441,9 s.
- Người nói theo `speaker_pitch.js` + nội dung; T2P3, T3P3, T5P3 cao độ lẫn lộn → chia theo nội dung câu hỏi.
- 4 ảnh map có watermark "REAL IELTS EXAMS 0964879926" → thầy duyệt thay (2026-10-23): không tìm được bản sạch trên mạng (chỉ trang
  luyện thi bên thứ ba) → **vẽ lại bằng SVG** bám theo bản gốc (`web/vol8/maps_src/t<T>p2.js` → `.svg`; `render.js` xuất PNG 2x +
  `_ovl.png` chồng lên bản gốc để căn; `measure.py` đo toạ độ theo màu/đường đen). `replace_maps.js --apply` đưa lên R2 và thay
  imageUrl ở bài lẻ + bản sao trong đề full (URL cũ: `web/vol8/backup/maps_old.json`); spec trỏ `img/t<T>/map_redraw.png`.
  Live 4/4, pw_fulltest T1/T3/T5/T6 40/40, audit 0 problem.

## Vol 7 + Vol 8 — debug lại 2026-10-23 (như Vol 9)

Công cụ chung (git-ignored, `web/`, nhận số vol): `keycheck.js <V>` (key DB bài lẻ + bản trong đề full ↔ `vol<V>/keys.json` + đuôi "→ đáp
án"), `audiocheck.js <V>`, `sync_drafts.js <V> <id…> [--apply]` (transcript + giải thích của draft → bài lẻ + bản trong đề full, backup
`vol<V>/backup/sync_<id>.json`), và **kiểm người nói bằng giọng**: `turncheck.js <V> <id…>` (câu transcript ↔ từ Whisper turbo bằng LCS,
cao độ chỉ trên các từ đó; `DUMP=1` ghi `vol<V>/turns/<id>.json`) → `py web/voicecheck.py <V> <id…>` (MFCC + cao độ mỗi câu, so với trung
bình từng người nói trong cùng bài, leave-one-out → cờ câu giống người khác; `--at=<từ>-<đến>` = dòng thời gian từng từ) + `wordpitch.js`.
Cách này tách được cả hai giọng cùng giới tốt hơn `speaker_pitch.js`, nhưng câu 1–2 từ và chỗ đổi lượt vẫn nhiễu → luôn đối chiếu cao độ
từng từ + nội dung; khi MFCC và cao độ trái nhau thì không sửa.

- Key: Vol 7 keys.json == PDF key gốc; Vol 8 keys.json == key docx gốc (đọc lại thẳng từ docx). Mọi chỗ lệch DB ↔ key gốc đều đã ghi:
  Vol 7 T1 Q25 (C → B), T3P3/T4P2 (bài ngân hàng lưu chữ hộp), T8 Q13 ("wearing formal" ⊂ "wearing formal clothes"); Vol 8 T1 Q1, còn lại
  chỉ là dạng "C have individual…" ↔ "C". Không có chỗ key theo băng mà chưa ghi. Phát hiện ghi chú sai T4 Q37 (xem trên) → sửa ghi chú.
- Người nói — sửa 8 bài (spec `turns` → `vol_build.js` → `sync_drafts.js --apply`; draft cũ: `web/vol<V>/backup/draft_pre_speakers/`):
  - V8 T3P1: "OK, so let's think about the second week now." là **Pam** (Duncan nói tiếp "We want something totally different").
  - V8 T8P1: "Actually, if we're getting an electrician out…/It was new last year, though…" là **Agent**; "That would be a good idea." là
    **Elinor** (giọng nữ 250–310 Hz).
  - V8 T8P3: **Simon** hỏi "Have you got the address?", **Dr Azari** đọc "www.studentlink. All one word…", Simon "OK, right.".
  - V7 T1P1: "Long tables aren't really very friendly, are they?" là **Debbie**; "That would be better, thanks." là **Manager** (giọng
    nam 163→102 Hz, nói tiếp "Should we say 11.30?") → sửa giải thích Q10 (quản lý chọn ngày 15).
  - V7 T1P3: "Anyway, we haven't talked about the introduction yet. Have you finished reading those articles…?" là **Jen** (190–360 Hz;
    Bill 86–155); "It only makes sense that Irene writes up…" là **Jen**, "Oh, that's easy." là **Bill** (Jen đáp "didn't you just say we
    owe her one?" — Bill nói "we owe her" lúc đầu).
  - V7 T10P3: **Professor** hỏi "But what about analyzing the data?", **Jason** đáp "Well, we've got an excellent computer program…".
  - V7 T11P1: "I'm sure it won't. But better be safe than sorry." là **Greg**.
  - (Lượt 1 để lại các chỗ chưa chắc — lượt 2 bên dưới xử lý bằng speaker embedding.)
- Đoạn Whisper bỏ sót trong vùng đáp án: cả hai vol đã nghe lại lúc seed (xem nhật ký từng vol) → không làm lại.
- `audiocheck.js`: Vol 7 10 đề full + 23 bài lẻ, Vol 8 8 đề full + 31 bài lẻ trên R2 đều 200, độ dài header = giải mã = DB.
- Sau khi sửa: `vol_audit.js 7`/`8` 0 problem, các phần không sửa DB == draft, pw_fulltest Vol 7 - Test 1, Vol 8 - Test 8 (live) 40/40.

### Lượt 2 (cùng ngày, thầy: "nghe thêm fix và push") — speaker embedding

**Công cụ mạnh nhất cho người nói**: model nhận dạng giọng WeSpeaker ResNet34 VoxCeleb (ONNX 26 MB, `onnxruntime` đã có sẵn; bản lưu
`web/models/wespeaker_en_voxceleb_resnet34.onnx`, nguồn github k2-fsa/sherpa-onnx release "speaker-recongition-models"). Fbank 80 chiều kiểu
Kaldi viết bằng numpy. Script (git-ignored, sau `DUMP=1 node web/turncheck.js <V> <id…>`):
- `py web/spkcheck.py <model> <V> <id…> [--all] [--at=a-b]` — mỗi câu ≥ 1 s → embedding 256 chiều → cosine với trung bình từng người nói
  (leave-one-out) + gom cụm không nhìn nhãn + cosine giữa các người nói. Chuẩn: bài đúng nhãn có cosine giữa 2 người 0,04–0,41 và gom cụm
  khớp nhãn gần 100 % (kể cả 2 giọng cùng giới); nhãn lộn xộn → cosine ~0,9.
- `py web/clipvote.py <model> <V> <id> <từ> <đến>` (`PAIR=X,Y`) — một đoạn ngắn là ai: so margin của nó với phân bố margin của các đoạn
  cùng độ dài lấy từ câu đã biết người nói (cách câu đó > 5 s). Dùng để chốt từng câu.
- `py web/spksplit.py <model> <V> <id>` — tách 2 giọng không dùng nhãn (eigenvector + 2-means) + dòng thời gian từng từ; `genderprobe.py`
  chiếu giọng lên trục nam–nữ học từ các bài khác. Giới tính chốt bằng phân bố cao độ (nam: ~1/3 khung < 140 Hz; nữ gần như không có).
- Thử LLM nghe audio qua OpenRouter (key free, không dùng ở web): `inkling:free` chỉ chạy trong "agentic harness", nemotron omni cần
  ≥ $0,50 credit → bỏ. Gemini vẫn không dùng (quota chung với chấm Speaking).

Sửa thêm (draft trước lượt 2: `web/vol<V>/backup/draft_pre_speakers2/`):
- **V8 T1 Q1 key 31 March → 30 March (1988)** — "Oh, I'm the 31st." là nhân viên (margin +0.43, nằm trong khoảng của nhân viên, không đoạn
  nào của Sarah đạt mức đó); sửa key + giải thích (bài lẻ + đề full). Bỏ luôn biến thể "31/03/1988": key tách theo "/" nên nó thành "31",
  "03", "1988" — gõ mỗi "1988" cũng được tính đúng (quét cả DB Listening: chỉ có câu này).
- V8 T2P3: Charlie nói "Great. So what do you think you gained most…? I think I've got much better at controlling my stress levels." và
  "That's good. So we've got quite a few things ready to say to our tutor. It'd be a good chance…".
- V8 T3P3: Greg nói "Then there's nuclear power." và "I know that the technology has improved…"; "It'll be very interesting to see the
  results of this survey." là Greg.
- V8 T5P1: Susie nói "A bit different from England in July.", "6073 Fearnleigh Drive." (sau khi đánh vần), "So, when exactly are you
  going?", "Hmm, what else?", "Hold on. I've got a leaflet here… She had a great time. Okay, it says here…"; Steve "True.".
- V8 T5P3: John hỏi "But using a range of quotations…, isn't it?" (giọng nam 113–165 Hz).
- V8 T6P3: Adele nói "So there are advantages and disadvantages with both types."; Ray nói "So what do you know?".
- V8 T7P3: "I can't remember." là Charlie (sau câu hỏi của chính anh; lượt 1 giữ theo cao độ là sai).
- V7 T1P1: "Good." (trước "So, apart from the music…") là Debbie.
- **V7 T6P3 làm lại toàn bộ theo giọng**: nhãn cũ (theo nội dung) khớp giọng không hơn ngẫu nhiên (cosine Man–Woman 0,93). Giọng B = nam,
  A = nữ. Băng không luôn theo logic hội thoại (nữ nói cả "Yes, one thing that shocked me…" lẫn "Yes, that was unexpected for me as well.",
  margin +0.43/+0.52) → ghi đúng như băng; câu margin yếu (< 0,2) chọn theo nội dung. Sau sửa cosine 0,49, còn 4 câu yếu.
- Giữ nguyên: V8 T6P1 "A photocopy?" (Whisper bỏ chữ nên đoạn lệch giờ; dòng thời gian = Customer), V7 T7P3 "Good idea." (ở ranh giới).
- Sau lượt 2: `vol_audit.js 7`/`8` 0 problem; mọi bài lẻ sửa DB == draft (cả bản trong đề full); pw_fulltest live 40/40 Vol 8 - Test 1,
  Vol 8 - Test 5, Vol 7 - Test 6.

## Vol 5 + Vol 6 — debug lại 2026-10-23 (như Vol 7 + 8 lượt 2)

Công cụ mới (git-ignored, `web/`):
- `fetchr2.js <V> <id…>` tải audio bài lẻ đã up (R2) → `vol<V>/audio/<id>_r2.mp3`; `turncheck.js` ưu tiên file này.
- `py web/localwords.py <V> <id…>` = mốc từng từ bằng **faster-whisper small.en chạy trên máy** (CPU, không tốn hạn mức Groq; model có sẵn
  trong cache HF) → `vol<V>/words_r2/<id>.json`. Lý do: `words/` cũ của Vol 5/6 nhiều bài **vượt độ dài audio** 20–60 s (làm trên file gốc
  chưa clip hoặc turbo trôi mốc) → embedding lấy sai đoạn. Mọi tool đọc mốc từ nay nhận `WORDS=words_r2`.
- `py web/spkaudit.py <model> <V> <id…> [--all]` = spkcheck + clipvote gộp: mỗi câu → margin tới người kia, so với phân bố margin của các
  cửa sổ cùng độ dài lấy từ câu chắc chắn của từng người → `>>` (margin âm, ngoài 98 % cửa sổ của chính nhãn, trong ≥ 5 % cửa sổ người kia)
  / `?` (yếu). `sh web/runaudit.sh <V> <id…>` = turncheck DUMP + spkaudit. Hiệu chuẩn: V8 T5P1/T2P3 (đã sửa lượt 2) → 0 cờ.
- `spksplitk.py <model> <V> <id> <K>` = tách K giọng không nhìn nhãn (bài 3 người), `lowfrac.js` = tỉ lệ khung cao độ < 140 Hz từng câu,
  `ctx.js <V> <id> <t…>` = các câu quanh một mốc, `copies.js <V> <id…>` = mọi đề full chứa bản sao bài lẻ (kể cả vol khác).
- `sync_drafts.js` nay ghi **mọi** đề full có bản sao (cùng title + part), không chỉ "Vol V - Test T" — V5 T7P1 nằm cả trong Vol 7 - Test 6.
  Backup `vol<V>/backup/sync_<id>_<ms>.json`. Câu `?` có span > 15 s là căn lệch qua chỗ nghỉ, bỏ qua.

Kết quả:
- Key: `keycheck.js` 5/6 — mọi chỗ lệch DB ↔ key in đều đã ghi, trừ **V5 T3 Q17** "reception" → mobile phone (đề "use your ___ in the
  western area"; sửa lúc seed, chưa ghi → nay ghi ở đầu spec). V5 T10 Q35 "3,000" ↔ "3,000/3000" chỉ là biến thể.
- `audiocheck.js`: Vol 5 10 đề + 36 bài, Vol 6 6 đề + 22 bài trên R2 đều 200, header = giải mã = DB.
- Người nói — 31 bài hội thoại (V5 19, V6 12; V5 T3P1 = V6 T1P1), sửa 10 bài (draft cũ `vol<V>/backup/draft_pre_speakers/`):
  - V5 T1P1: "And it isn't too expensive.", "That works out even cheaper.", "And there's lots to do there." là **Man**.
  - V5 T3P3: "So, our next meeting is two weeks today. Is that still OK?" là **Laura**, "Yes, and in the meantime, I'll send you an email."
    là **Tutor** (cao độ 262 Hz / giọng nam).
  - V5 T6P1: "It's easy to remember." là **William** (75 % khung < 140 Hz).
  - V5 T7P1: "I guess it all comes down to budget." là **Anna**, "Yes." sau đó là Daniel. Sửa cả bản trong **Vol 7 - Test 6**.
  - V6 T1P3 (3 người, tách 3 giọng không nhãn khớp rõ X = Daniel, Y = Fiona, Z = Tutor): Daniel nói "But the thing is… disadvantage. I mean…
    put them off.", "Then some people will be happy to speak in support…", "And we'll need to decide on some rules…", "Yes, OK, that's
    better."; Tutor "Yes, get everyone involved. Right."; Fiona "What about preparation for asking and answering questions?".
  - V6 T2P1: Receptionist "After this course, who knows?" và "Oh, that's fine."; **Jan** tự sửa ngày "Oh, uh, sorry, no, on the 13th of
    June. I meant the one starting in two weeks. Is that still all right?" → sửa giải thích Q5 (key 13th June không đổi).
  - V6 T3P3: Luke nói "Did you read about the Wonderhouse?", "Like flying saucers. They built over a hundred of them.".
  - V6 T4P3: "Babbis would be good for that too." là **Tutor** (86–102 Hz).
  - V6 T5P1: "They're both really beautiful spots." là **Ranger**.
  - V6 T6P3: "How were the people you had to work with?" là **Tomas** (từng từ 76–176 Hz, dòng thời gian giọng liền mạch Tomas tới "…all over
    the world") — băng để Tomas tự hỏi tự đáp → ghi đúng như băng.
  - Còn lại sạch; cờ yếu để nguyên (câu 1 từ "Why?", "Great.", "Okay." margin < 0,15). V6 T5P3 (2 giọng nam, lúc seed chia theo nội dung)
    tách giọng tốt (cosine 0,29), 0 cờ.
- Sau khi sửa: `vol_audit.js 5`/`6`/`7` 0 problem; mọi bản sao == bài lẻ (`copies.js`); pw_fulltest live 40/40 Vol 6 - Test 1, Vol 6 -
  Test 2, Vol 5 - Test 7, Vol 7 - Test 6.

## Vol 7 — 2026-10-16 (xong cả 11 test)

- Chống trùng (`vol_keys_dedupe.js` + so 6-gram transcript docx với ngân hàng): **T2 = "Actual Test 2", T3 = "Actual Test 1"**
  (cùng băng, key 40/40) → thầy duyệt đổi tên thành Vol 7 - Test 2/3 (`rename_tests.js 7 --apply`, backup web/vol7/backup, 9 + 9
  nhãn testName) rồi đánh số lại "Actual Test 3–8" → "1–6" (`renumber_actual_tests.js --apply`, backup web/vol1/backup, 39
  nhãn). Đề gộp tiếp theo = Actual Test 7. **T9 = "Vol 4 - Test 3"** (40/40) → thầy chọn KHÔNG tạo đề trùng.
  Dùng lại: T4 P1–P3 = Superior Home Appliances / Connections / Climate change and allergies ("Actual Test 1" nay, trước là 3;
  ngân hàng lưu Q15–20, Q25–30 dạng kéo-thả từ nên key là chữ); T5 P3 = Music Students' Attitudes to Performing (Vol 4 - T5);
  T6 P1 = The London Relocation Services (Vol 5 - T7); T8 P1–P3 = Vol 2 - Test 7 P1–P3; T11 P3 = Oral History Project (Vol 4 - T8).
- Mới: 23 bài lẻ (T1, T7, T10 đủ 4 phần; T5 P1/P2/P4; T6 P2–P4; T11 P1/P2/P4; T4 P4; T8 P4) — đều bật, ảnh bìa R2, Playwright nháp +
  live 23/23; 4 ảnh map (T1P2, T5P2, T6P2, T7P2). Đề full **Vol 7 - Test 1, 4, 5, 6, 7, 8, 10, 11** tạo + bật; pw_fulltest 40/40
  cả 10 đề Vol 7. `vol_audit.js 7`: 0 problem, 1104 trích dẫn khớp.
- Lỗi đề gốc đã sửa theo băng (ghi ở đầu spec): **T1 Q25 C → B** ("reads every assignment… That's why all the rest of us asked
  you"; engnovate.com cùng đề: B); T6 Q27–28 đề in gộp 2 lựa chọn vào dòng A → A = their standard length, thêm F = how recent the
  genre is (key A, B theo băng). Băng gốc: T6 P2 phát lời giới thiệu của đề khác ("beach races") → clip từ "First, you have some
  time…"; T7 P1 cụt giữa câu và mất "Part 2"; T10 P4 không có lời dẫn; T6 phát lại Part 1 sau khi hết đề; docx T1 P2 thiếu đoạn
  Q20 (lấy từ Whisper), docx T10 P1 ghi sai tên người nói, docx T11 đánh dấu "Q7" trong câu.
- Debug (ngoài audit): key DB ↔ key in từng câu; transcript 23 bài ↔ Whisper turbo của chính audio đã up, mọi đoạn turbo bỏ sót
  (T4P4 Crete, T5P4 mở đầu + "six or seven million dollars", T5P2 barbecues, T6P4 hai đoạn + đoạn cuối, T7P4, T11P4) nghe lại bằng
  `WB_MODEL=whisper-large-v3 wb.js` → docx đúng; turbo bịa câu prompt ("well it's £15 a day", "I'm going to go to…") ở chỗ lặng.
  Nghe máy 12 s đầu + 15 s cuối cả 23 audio đã up → sửa 2 ranh giới (`reclip_section_audio.js` mới, rồi `rejoin_test_audio.js`):
  T6 P2 dính lời dẫn P3 → mốc P2/P3 769.3 s; T10 P4 dính "IELTS Listening. Version…" của đề khác → cắt ở 1578 s.
- Lỗi cũ lộ ra ở đề vừa đổi tên (thầy duyệt sửa, backup web/vol7/backup/legacy*_): transcript "Planning a party" (bài lẻ + bản trong
  Vol 7 - Test 3) chèn "(Đáp án câu 1…4)" — lộ đáp án → xoá (cả ngân hàng chỉ bài này); giải thích Q1 "Holiday Job" gõ "Jameson"
  → Jamieson; Vol 7 - Test 3 P2 (bản trong đề full) nhãn "...:" → "Narrator:" như bài lẻ; "Aims of the geography lesson" Q28–30
  giải thích lộ ghi chú "(đã đổi số thứ tự…)" → xoá (bài lẻ + Vol 7 - T3 + Vol 4 - T2); Antikythera Q33 nhận thêm "inscriptions";
  audio đề full Vol 7 - Test 2 dư 8 phút lặng (2221 → 1640 s) và Test 3 ngắn hơn 4 phần (1687 → 1799 s) → nối lại từ bài lẻ.
  Sau đó `vol_audit.js 7` và `vol_audit.js 4` 0 problem, pw_fulltest 40/40.

## Vol 6 — 2026-10-15 (xong cả 6 test)

- Mới: 22 bài lẻ (T2–T5 đủ 4 phần, T1 P2–P4, T6 P1/P3/P4) — đều bật, có ảnh bìa (R2), Playwright nháp + live 22/22; 3 ảnh map
  (T2P2 Parson's Fruit Farm, T3P2 Cross country running event, T5P2 Plan of hotel). Đề full **Vol 6 - Test 1…6** tạo + bật
  (pw_fulltest 40/40 cả 6). `vol_audit.js 6`: 0 problem, 774 trích dẫn khớp.
- Dùng lại: T1 P1 = "Sailing Courses for Children" (Vol 5 - Test 3, key 10/10); T6 P2 = "The Elmsden Way Cycle Route" (Vol 4 -
  Test 4, cùng băng 6-gram 0,79, cùng câu hỏi). T6 P4 "Crocodile Study" khác băng với "Tracking Crocodiles in Queensland" → seed riêng.
  vol_keys_dedupe báo CHECK ở T1P2/T2P3/T5P3 chỉ là chuỗi chữ cái MC trùng ngẫu nhiên (đề khác hẳn).
- Lỗi key gốc đã sửa theo băng (ghi ở đầu spec): **T4 Q25 A → C** (băng gạt "managing time" để đọc về "managing all distribution
  from just one office" = centralisation); **T6 Q16 A → C** (dùng bài ngân hàng: ga "closed in the 1950s… ready for trains to start
  using it again earlier this year"); key gõ sai T2 Q33 "eroison", Q39 "wildife".
- 2026-10-16 debug lại (ngoài `vol_audit.js`): so key DB ↔ trang key in (`keys.json`) từng câu → ngoài T4 Q25/T6 Q16 còn 2 chỗ
  đã sửa theo băng lúc seed nhưng **chưa ghi lại** (nay ghi ở đầu spec): **T1 Q24 C → A** ("an issue that the students already
  have strong opinions about" = chủ đề khiến họ quan tâm; phe ủng hộ/phản đối do họ tự chọn, không bị giao) và **T2 Q23–30**
  key in A B C E C D A D không khớp đề/băng → C A D B A F C E (Q23 "keep most Māori terminology out…", Q25 "who the writers
  were"…). Giải thích "→ đáp án" khớp key DB cả 240 câu. Transcript 22 bài so 6-gram với large-v3 + turbo: chỗ cả hai model
  không nghe ra (T4P2 74–116 s, T4P3 Q25, T4P4 Q37, T5P1 327–341 s, T2P3) đều có bản `wb.js` trong `web/vol6/wb/` khớp
  transcript; còn lại chỉ là lời dẫn đề/"Thank you" bịa. Đầu/cuối audio (silencedetect + Whisper): T2P4/T3P2 lời giảng cụt
  giữa câu là do băng gốc (đáp án ở trước), vẫn có "end of Part N". 3 ảnh map đủ chữ cái.
  - **T1 P3 "Organising a Debate"** (`S3 (1).mp3`, không clip): sau "30 seconds to check" (~342 s) băng đọc tiếp lời giới
    thiệu Part 4 **của đề khác** ("a chemistry student… the colour purple and the development of purple dyes", 372,6–387,5 s)
    rồi 47 s lặng → trong đề full Test 1 người học nghe 2 lời giới thiệu Part 4 khác nhau. Thầy duyệt → cắt bài lẻ còn
    372 s (giữ 30 s soát đáp án; `trim_section_audio.js 6 …85f8 372 --apply`, spec `clip: [0, 372]`) + nối lại đề full
    (`rejoin_test_audio.js 6 "Vol 6 - Test 1" --apply`, 1762 → 1699 s), backup web/vol6/backup. Sau đó `vol_audit.js 6`
    0 problem, pw_fulltest Test 1 40/40.

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
