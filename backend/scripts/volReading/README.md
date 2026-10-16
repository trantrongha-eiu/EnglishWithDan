# Seed Reading từ bộ "VOL 1–9 ORIGINAL EXAMS" (đề lẻ + đề full "Vol V - Test T")

Thầy 2026-10-16: Listening Vol 1–6 xong → seed Reading các đề lẻ và gộp thành đề full của từng vol, bắt đầu Vol 1. Cùng quy tắc
với Listening (`../volListening/README.md`): bài đã có trong ngân hàng thì **dùng lại**, không seed trùng; mỗi lần 1 vol, xong thì
dừng và báo cáo; chỗ cần quyết thì hỏi thầy. Đề full: tên "Vol V - Test T", seriesName "Vol V", testNumber T (trang Reading tự
gom thành nhóm "Vol V").

## Quy trình 1 vol (cwd = backend/scripts/volReading; `web/` bị gitignore)

1. `py render.py <V> [dpi=150]` → `web/vol<V>/pages/t<T>_p<k>.png` (PDF Vol 1 là ảnh scan, không có text layer).
   `ocr.ps1` = OCR có sẵn của Windows (Windows.Media.Ocr, không cần cài gì) → chạy cho mọi trang:
   `foreach ($f in Get-ChildItem web\vol<V>\pages\*.png) { powershell -ExecutionPolicy Bypass -File ocr.ps1 $f.FullName "web\vol<V>\ocr\$($f.BaseName).txt" }`
   (mỗi dòng "x y w h<TAB>chữ"; OCR rất sạch, chỉ hay đọc "lo" thành "b", chữ cái đoạn đứng riêng một dòng thì mất).
2. Gõ trang KEY READING (trang cuối, có cả tên 3 bài) vào `web/vol<V>/keys.json` → `node split.js <V>` tách OCR thành từng bài
   (`text/t<T>p<P>.txt` = bài + "=== QUESTIONS ===" + câu hỏi; `paras/…` = bài đã nối thành đoạn).
3. Chống trùng: `node dump_reading.js` (dump ngân hàng → `web/passages.json`, `web/tests.json`) → `node dedupe.js <V>`
   (key + tên) → với bài nghi trùng: `node compare.js <V> <T> <P> <id>` (6-gram bài đọc 2 chiều; 75–97% = cùng bài, phần hụt
   là nhiễu OCR) + `node qcheck.js <V> <T> <P> <id> [offset]` (từng câu hỏi / lựa chọn có trên trang PDF không + so key).
   **So cả bộ câu hỏi**: Vol hay giữ bài đọc nhưng đổi/đảo câu hỏi mà vẫn giữ key cũ.
4. Bài mới: `specs/vol<V>/t<T>p<P>.txt` (bài đọc, đoạn cách dòng trống; "A " đầu đoạn = chữ cái đoạn in đậm; dòng đầu "# …" =
   sapo in nghiêng) + `specs/vol<V>/t<T>p<P>.js` (helpers `tfng/ynng/mc/multi/headings/matching/endings/notes/summary/table/short`
   trong `vr_build.js`, `key`, `expl: {n: [dịch, vị trí, trích “…”, phân tích … → đáp án]}`, ghi chú sửa lỗi nguồn ở đầu file).
   Công cụ: `mkpara.js` (dọn file paras, thêm chữ cái đoạn), `relet.js` (nối lại đoạn theo chữ cái), `wdiff.js <ocr> mini:<id>|bank:<id>`
   (diff theo từ với bản cào mini-ielts `../miniIelts/web/mini/x_<id>.json` hoặc bản ngân hàng — để sửa lỗi OCR).
   `node vr_build.js specs/vol<V>/*.js` → `web/vol<V>/draft/…` + kiểm: số câu liền mạch, key hợp lệ, đáp án điền từ có nguyên văn
   trong bài + đúng giới hạn số từ (`free: [...]` = biến thể hợp lệ không nguyên văn), trích dẫn có trong bài, "→ X" khớp key.
   Bài cũ đánh số sai ô (vd. Passage 1 dùng làm Passage 2): `node copy_renum.js <V> <T> <P> <idSuffix> "<tên> (Vol V)"` (bản sao
   đánh số lại — đáp án chấm theo số câu trên cả đề nên không ghép được bài trùng số câu).
5. `MINI_DATA=../volReading/web/vol<V>/batch.json node pw_mini.js` (cwd `../miniIelts`; batch = mảng các draft) → render qua frontend
   thật, phải N/N → `node vr_import.js <V> [--apply]` (thêm ẩn; chặn trùng tên / trùng chữ ≥15% trừ `SAME_TEXT_OK`).
6. Ảnh bìa (cwd `../miniIelts`): thêm từ khoá vào `cover_queries.json` → `node dump_passages.js` → `node cover_candidates.js "<regex tên>"`
   → `node cover_sheet.js 0 5` … (xem bằng mắt) → `node cover_pick.js 0=c …` → lọc `../data/passageCovers.json` theo id vừa nhập
   thành `web/vol<V>/covers.json` → `node ../setPassageThumbnail.js --batch ../volReading/web/vol<V>/covers.json --apply` (R2).
7. Kiểm trước khi bật: `node ../_audit_reading_warnings.js out.json` (**tham số là file ĐẦU RA** — đừng truyền passages.json) →
   `node dump_passages.js` → `node pw_admin.js "<regex>"` → `node vr_import.js <V> --activate [--apply]` → `node pw_grade.js "<regex>"`
   (100% mỗi bài, không lưu gì).
8. Đề full: `specs/vol<V>/tests.js` (T → 3 bài: tên draft hoặc _id ngân hàng) → `node vr_tests.js <V> [--apply]` →
   `node pw_full_tests.js "^Vol <V> - Test \d+$"` (cwd `../miniIelts`, không ghi DB; `SHOT=1` chụp ảnh) → `node vr_audit.js <V>`
   (chỉ đọc: đề/bài bật, thứ tự P1/P2/P3, đủ key + giải thích, "→" khớp key, trích dẫn có trong bài, có ảnh bìa).

Playwright của `../miniIelts/pw_*.js` nay dùng UA Chrome thường (botGuard chặn "HeadlessChrome" → kẹt ở trang đăng nhập).

## Vol 1 — 2026-10-16 (xong cả 10 test)

Mỗi `Test N.pdf` (scan) có Reading ở khoảng trang 6–19, key ở trang cuối.

- **Dùng lại 19 bài nguyên trạng** (cùng bài đọc, cùng câu hỏi): T1 silk / baby mammoth / musical expert; T2 Clipper Races /
  Orientation of birds / accidents in business; T3 language development / TV advertising / A New Voyage; T4 good ideas fail /
  water away / Megafauna; T5 P2 Multitasks, P3 Grimm; T6 P1 history of tea; T9 P1 Tuatara, P2 Tasmanian Tiger; T10 P1 pesticide-free
  village, P2 Skyscraper Farming. Chỗ key Vol khác ngân hàng đều là lỗi key Vol (ngân hàng đúng theo bài): T1 Q27 C → B
  (tài năng = cấu trúc não bẩm sinh, nhận ra *trước* khi giỏi), T2 Q32 F → E, T6 Q20 NG (bản ngân hàng FALSE: "avoid monoculture"),
  T1 Q24/26, T9 Q8 gõ sai; ngân hàng lưu summary có word bank dạng chữ thay vì chữ cái (cùng đáp án). T3 P3 "A New Voyage": Vol in
  Q38–40 câu chữ khác (cùng chuỗi key NO/NG/YES) → dùng bản ngân hàng (câu chữ chuẩn).
- **Mới 11 bài** (đều bật, có ảnh bìa CC0/PD trên R2, giải thích tiếng Việt): T5 P1 Voyage of going: beyond the blue line 2;
  T6 P3 NatureWorks Polylactic acid; T7 Protecting turtles / Thoughtful Computing system / Irish Elk; T8 A Brief History of Tea /
  New filter promises clean water for millions / The Cause of Linguistic Change; T9 P3 The Cane Toad in Australia; T10 P3 Marketing
  and Mind Control; + **"Biodiversity (Vol 1)"** = bản sao đánh số lại 14–26 của "Biodiversity" (ngân hàng lưu là Passage 1).
  "New filter…" cùng bài đọc với "Water Filter" (mini, Passage 1) nhưng bộ câu hỏi khác → bài riêng.
- Đề full **Vol 1 - Test 1…10** tạo + bật. **T7, T9 chỉ 39 câu** (Passage 3 đánh số 28–40, đề gốc không có câu 27; 39 đúng vẫn
  band 9.0). pw_full_tests 10/10, pw_grade 11/11 100%, `vr_audit.js 1`: 0 problem (398 câu, 240 trích dẫn).
- Lỗi đề gốc đã sửa (chi tiết ở đầu từng spec): T5 P1 PDF thiếu câu 2 → lấy từ mini-ielts 1296; Q2/Q4 key lệch → "NOT GIVEN / NO",
  "NO / NOT GIVEN" (nhận cả hai). T6 P3 key Q37–40 A,D / A,C → A,C / A,B (đề có lựa chọn D trùng nghĩa A ở Q39–40 — nhóm chọn-2
  không nhận key thay thế). T7 P1 Q9 hỏi "leatherback" nhưng rùa chết là loggerhead → "the four turtles". T7 P2 "ONLY ONE WORD" nhưng
  key "voice mail" → TWO WORDS. T7 P3 Vol đảo câu summary/Q33–35 mà giữ key cũ → key đặt lại theo câu in; Q39 (Asia) mọi nguồn = C
  dù bài không ủng hộ — giải thích nói rõ. T8 P2 Vol đảo 4 câu TFNG mà giữ key cũ → 20 T, 21 NG, 22 F, 23 NG; Q25 D → B. T10 P3 đoạn
  de Waal mất câu ở mọi bản → bổ sung theo ece.edu.vn; Q30 D → "A / D".
- 2026-10-17 thầy bảo tra mạng rồi tự sửa (`vr_update.js 1 … --apply`, backup `web/vol1/backup/`, chưa ai làm bài):
  - Câu 27 của T7/T9: không nguồn nào có (Giant Deer trên ieltsmaterial.com đánh 28–40, Cane Toad trên ece.edu.vn 1–13, đều 13
    câu) — đề gốc có Passage 2 dài 14 câu, Vol thay bằng bài 13 câu → giữ 39 câu như PDF.
  - T6 P3 Q39–40: bỏ lựa chọn D trùng nghĩa A (E in → D), key A, B. Không có key độc lập trên mạng.
  - T7 P3 Q36–39: mọi key B D A C (mỗi chữ một lần); theo bài Q37 = châu Phi hoặc nhiệt đới châu Á, Q39 = Úc → key "D / C", "B / C"
    (vẫn nhận key in), cho dùng lại chữ cái.
  - T10 P3: câu de Waal viết lại theo đúng quan sát gốc (de Waal 1982: một con đực non bắt chước dáng khập khiễng của con đực
    đầu đàn; dẫn trong bài báo của Queen's University Belfast) thay cho bản đoán của ece.edu.vn.
  - T3 P3 "A New Voyage": bộ Q38–40 của Vol = bản "Recent Actual Tests" của mini-ielts 1451 (cùng key NO/NG/YES) → giữ bản ngân hàng.
  Sau đó `vr_audit.js 1` 0 problem, `_audit_reading_warnings` 0, pw_admin / pw_grade / pw_full_tests đạt.
