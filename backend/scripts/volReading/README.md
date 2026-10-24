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

## Vol 2+ — khác Vol 1 (công cụ)

Reading của Vol 2 nằm ở `<VOL>/reading/*.pdf` (không theo thư mục test; Vol 2 = 9 file 3 bài + 2 file 1 bài, chỉ "Test 1" và
"Test 3" có trang KEY; tất cả là ảnh scan, nhiều trang chụp điện thoại → OCR kém, watermark "Group: Real Ielts Exams" đè lên 1 dòng).
- `py render2.py <V>` → `web/vol<V>/pages/<stem>_p<k>.png` (stem = tên file bỏ cách, "AC_" → "ACx"), OCR như Vol 1.
- `node dedupe2.js <V> [minPct]` (chỉ đọc): mỗi file chứa bài ngân hàng nào (6-gram của bài ngân hàng có trong OCR cả file; 80–98% =
  cùng bài, 20–47% = cùng bài nhưng scan mờ → xem ảnh). Không cần key.
- `web/vol<V>/keys.json` dạng `{ "<stem>": [{title, start, pages:[trang bài], qpages:[trang câu hỏi], key?}] }` → `node split2.js <V>`
  → `text/<stem>p<P>.txt` → `node qcheck.js <V> <stem> <P> <id> [offset]` (key so sánh khi có).
- `node showbank.js <id|đuôi id>`: in gọn câu hỏi + key một bài ngân hàng (so với ảnh trang PDF).
- Bài mới vẫn đặt tên `specs/vol<V>/t<T>p<P>` theo số đề full; bản sao đánh số lại cần thêm vào `SAME_TEXT_OK[<V>]` của vr_import.js.
- Lỗi của chính bài ngân hàng: `specs/vol<V>/bank_fixes.js` (`[{id, why, fix(doc)}]`) → `node bank_fix.js <V> [--apply]` (in diff
  từng trường, backup `web/vol<V>/backup/bank_<id>_*.json`, ghi có điều kiện updatedAt; chỉ title/content/questionGroups).
- `vr_audit.js` nay chấp nhận kết luận "→ E (Sound)" (chú thích trong ngoặc sau đáp án).

## Vol 2 — 2026-10-23 (xong: 9 đề full, 3 bài mới)

- **Đề full Vol 2 - Test 1…9** (đánh số theo số trong tên file; "AC3" trùng số với "Test 3" → 8, "AC_" → 9):
  T1 = Test 1 (The Iceman (Vol 2) / Twin Study / The origin of ancient writing), T2 = AC2 (Bondi / economic effect of climate /
  verbal and non-verbal messages), T3 = Test 3 (Becoming an Expert / Revolutions in Mapping / Sir Francis Ronalds and Telegraph),
  T4 = AR4, T5 = AC5, T6 = AC6, T7 = AC7, T8 = AC3, T9 = AC_. "book review" (P1) + "whale culture" (P3) là bài lẻ không có P2 →
  không có đề full; cả hai đã có trong ngân hàng.
- **Dùng lại 26 bài nguyên trạng** (Actual Mocktest 21–76; text 6-gram + từng câu hỏi/lựa chọn + xem ảnh mọi chỗ yếu). Key Test 1/3
  khớp ngân hàng. AC5 "Footprints" Vol in Q1–6 YES/NO/NG, ngân hàng TRUE/FALSE/NG — cùng câu, cùng đáp án → giữ. "Jewels from the
  Sea" có 2 bản ngân hàng → dùng bản Mocktest 29 (bản 33 sai key Q5).
- **Mới 3 bài** (bật, giải thích tiếng Việt): "The Iceman (Vol 2)" = bản sao đánh số lại 1–13 (ngân hàng lưu là Passage 2, giữ ảnh
  bìa gốc); "The origin of ancient writing" (Test 1 P3; mini 1460 chỉ có câu hỏi) — word bank in "L clay tablets Uruk" → L / N,
  "oracle message" → oral; "Sir Francis Ronalds and Telegraph" (Test 3 P3; mini 1463 lẫn 2 câu của bài Mapping, PDF đúng) —
  "Queen Elizabeth I" → Queen Victoria (phong tước 1870), Q32 key không nguyên văn (`free`), Q39 nhận "D / C" (đoạn C cũng nói
  "The system was slow"). Ảnh bìa CC0/PD trên R2.
- **Sửa ngân hàng** (`bank_fix.js 2 --apply`, backup web/vol2/backup): Whale Culture Q29 chép nhầm câu 27 (key + giải thích vốn
  đúng cho câu thật) + lựa chọn F; Jewels (Mocktest 33) Q5 TRUE → FALSE; "A closer examination…" lỗi chính tả Q38 + dấu cách cuối
  tên; "Bondi " → Bondi; "Nature's use Full designs" → Nature's Useful Designs.
- Kiểm: pw_mini 3/3, pw_admin 3/3, pw_grade 100% (bài mới + bài vừa sửa + cả 27 bài của 9 đề), pw_full_tests 9/9,
  `_audit_reading_warnings` 0, `vr_audit.js 2`: 0 problem (360 câu).

## Vol 3 — 2026-10-23 (xong: 10 đề full, 9 bài mới)

Nguồn: `reading/TEST N.pdf` / `test N - full.pdf` (scan, 1 file = 1 đề, đánh số theo tên file) + `reading/explain/test N.pdf`
(bảng "key + đoạn trích" tiếng Anh, chính là key của T1–T9; scan) + `reading/key/key.pdf` (= `explain/reading tets 10.pdf`, key T10,
có text layer). `render2.py` đặt tên `t<N>` cho file đề, `explain-t<N>` / `key-key` cho file trong thư mục con; `split2.js` /
`qcheck.js` nhận số đề (`3 1 …`). `node keycmp3.js <V> <T> <id…>` (chỉ đọc) = key đọc từ cột trái file explain so với key ngân hàng
(OCR hay mất vài số → xem ảnh). `node vol_titles_re.js <V>` = regex tên mọi bài của các đề "Vol V" (cho pw_grade / pw_admin).

- **Đề full Vol 3 - Test 1…10** tạo + bật.
- **Dùng lại 21 bài** (T1 P1, T3 cả 3 — P2 = "New filter…" đã làm ở Vol 1, T4 P2–P3, T5–T9 cả 3). Khác biệt giữ bản ngân hàng:
  T5 P2 Q20–21 Vol đảo thứ tự lựa chọn B/C (đáp án vẫn A + D); T9 P1 Q6 Vol in "cannot cope with supermarket ___" (key
  competition), ngân hàng "competition from ___ supermarkets" (key suburban) — như "A New Voyage" ở Vol 1. Key Vol sai theo bài
  (giữ ngân hàng): T4 P2 Q20 (chính trích dẫn của explain nói "a long way behind"), T5 P1 Q1, T5 P3 Q39, T8 P2 Q20, T9 P1 Q13,
  T9 P3 Q35. explain/test 8.pdf giải thích nhầm bài "tone deaf" của T7 thay cho "Yawning" → dùng key ngân hàng.
- **Sửa ngân hàng** (`bank_fix.js 3 --apply`): "Science and the Stradivarius" Q17 (đoạn E) vii → viii (thợ Ý chỉnh cộng hưởng theo
  "exact musical intervals… numbers and exact ratios"; key Vol đúng) + giải thích mới.
- **Mới 9 bài** (bật, ảnh bìa CC0/PD trên R2, giải thích tiếng Việt): T1 P2 Insect decision-making (2 câu cụt ở mọi bản → bổ sung
  theo bài gốc The Economist trên trang LSE của Christian List), T1 P3 Fear of the Unknown (Peter Chemin → Chernin), T2 P1 Bovids
  (bản Vol nói nhiều nhất ở "Southeast Asian islands" → Q1 = D theo bài in), T2 P2 Photovoltaics on the rooftop (mini thiếu đoạn G;
  PDF đủ 9 đoạn; explain "16 D" nhưng trích đoạn H → H), T2 P3 How should reading be taught? (Q33 explain NG / key gốc TRUE → nhận
  cả hai), T4 P1 The Wonder Plant (bản Vol khác hẳn mini 1062 cả bài lẫn câu hỏi → theo PDF), T10 P1–P3 (chỉ có PDF; Q19 nhận
  "movie / dancing", P2 đoạn B mất "not exist").
- Kiểm: pw_mini 9/9, pw_admin 9/9, pw_grade 100% (9 bài mới + cả 30 bài của 10 đề), pw_full_tests 10/10, `_audit_reading_warnings` 0,
  `vr_audit.js 3`: 0 problem (400 câu).
  `vr_audit.js` nay chấp nhận "→ vii Heading text" như vr_build.js.

## Vol 4 — 2026-10-24 (xong: 8 đề full, 23 bài mới)

Nguồn: `reading/test N/*.pdf` (scan/ảnh chụp, 1 thư mục = 1 đề) + `reading/explain key/*.pdf` (bảng "số câu | đáp án | ảnh đoạn
trích"; T1, T2, T10 có chữ gõ — đọc bằng pymupdf; còn lại scan → xem ảnh, `keycmp3.js` không đọc được bố cục bảng này).
`render2.py` nay đặt tên `t<N>` cho file trong thư mục con `test N/`, `explainkey-t<N>` cho file key. `test 6/test 6.docx` = bản
OCR sẵn của đề 6 (dùng làm nền chữ, đối chiếu ảnh). Công cụ mới: `dedupe_mini.js <V> [minPct] [stem]` (như dedupe2 nhưng dò kho
cào mini-ielts, kể cả bài chưa vào ngân hàng → tìm bản chữ sạch: T3 P3 = mini 1513, T5 P3 = mini 1029); `vol_new_titles_re.js <V>`
(regex tên các bài draft của vol — cho pw_admin / pw_grade; đừng dựng regex bằng `node -e` trong bash, escape hỏng → regex rỗng =
chạy cả ngân hàng).

- **Đề full Vol 4 - Test 1…6, 8, 9** tạo + bật. **T7 = nguyên Vol 3 - Test 9, T10 = nguyên Vol 3 - Test 10 → không tạo** (thầy chọn,
  vr_tests chặn đề trùng bộ 3 bài). **T9 chỉ 37 câu**: PDF và file key đều không có câu 27–29 (P3 "Temperament" bắt đầu ở câu 30).
- **Dùng lại**: T8 P1 Traditional Maori medicines (Mocktest 65); T7/T10 (6 bài của Vol 3). Key khớp. T7 PDF trang 4 là trang câu
  27–31 của P3 đặt nhầm (thiếu trang Q7–13 của P1). **Sửa ngân hàng** (`bank_fix.js 4 --apply`): The dingo debate Q25 nhận thêm
  "rabbit numbers" (key Vol, đúng cụm trong bài).
- **Mới 23 bài** (bật, ảnh bìa CC0/PD trên R2, giải thích tiếng Việt). Key Vol sai đã sửa theo bài (chi tiết đầu từng spec):
  T1 P2 Q22–23 A,B → B,D (langmaster xác nhận); T2 P1 Q2 NG → FALSE, Q6 NG → TRUE; T2 P3 Q33 NO → YES, Q34 NG → NO; T3 P1 Q5
  NG (Vol TRUE nhầm Rayner/Raymond — nhận cả hai); T4 P1 Q8 "other people" → construction materials; T4 P2 Q21 C → A; T6 P2 Q15
  vi → ii, Q17 ii → vii; T8 P3 Q37 B → A; T9 P3 Q33 C → D.
- **Chữ bị mất trong PDF, đã bổ sung** (ghi rõ trong spec): T4 P1 (thiếu mô tả Bodily-kinesthetic, nhãn Interpersonal, cả mục
  Naturalist → theo danh sách của M. A. Christison, English Teaching Forum 1998 — không kiểm chứng được nguyên văn trên mạng);
  T4 P3 nửa đầu câu mở đoạn 3; T5 P2 đoạn A ("…to do business. Reputation is used…", theo Porter & Kramer HBR 2006, file key còn
  giữ phần đầu); T9 P2 mục C một câu nối về enzyme trong máu sam (PDF và file key cùng mất).
- Kiểm: pw_mini 23/23, pw_admin 23/23, pw_grade 100% (23 bài mới + dingo + Maori), pw_full_tests 8/8, `_audit_reading_warnings` 0,
  `vr_audit.js 4`: 0 problem (317 câu, 355 trích dẫn).
- **Đối chiếu bản online (thầy bảo, cùng ngày)** — tải trang bằng curl (WebFetch chỉ trả tóm tắt), `py webcmp.py <spec.txt>
  <page.html> <out.txt>` cắt đúng đoạn bài rồi `wdiff.js` so từng từ. Có bản: ieltsit.com (`/news/e-482-<slug>-reading-answers`),
  tuhoc.dolenglish.vn (`/<slug>-de`), ieltsreading.info, izone.edu.vn, ieltscity.vn, thesol.edu.vn. Kết quả:
  T9 P2 mục C khôi phục nguyên văn (ieltsit) thay câu tự viết; T4 P3 "When he realised that traditional experiments…"
  (ieltsit/dolenglish); T3 P1 Q5 là "Jane Raymond believes…" (izone) → key TRUE; T5 P2 câu Porter & Kramer đúng nguyên văn
  (dolenglish cũng mất đoạn như PDF). Key đã sửa được xác nhận: T2 P1 (ieltsreading.info), T2 P3 (thesol), T4 P2 Q21 (ieltsit),
  T6 P2 B ii / D vii (ieltscity; ieltsit chép key Vol), T8 P3 Q37 A (izone/ece/ieltscity; ieltsit chép key Vol). Không tìm được:
  nguyên văn Christison cho T4 P1 (Wayback chặn 429; các trang IELTS tự dựng lại mục này từ bảng câu hỏi), câu 27–29 và key Q33 của
  T9 P3 "Temperament". `vr_update.js 4 t3p1 t4p3 t9p2 --apply` (0 lượt làm bài). Debug lại: pw_admin 24/24, pw_grade 24/24 100% +
  dingo, pw_full_tests 8/8, `_audit_reading_warnings` 0, `vr_audit.js 4` 0 problem.

## Đề / bài thiếu câu — không publish (thầy 2026-10-24)

"Đề nào thiếu câu thì tạm thời không publish cho học sinh." `node vr_incomplete.js [--apply]` liệt kê (và ẩn, isActive:false) mọi
đề full có cố định 3 bài mà không đủ câu 1–40, và mọi bài lẻ có dưới 13 câu (bài 13 câu đánh số 28–40 vẫn đủ, giữ). Đề "MockTest
Đề Random" (không gắn bài) bỏ qua. Thầy: "đề nào sửa được thì sửa, không sửa được mới ẩn" → tìm câu thiếu trong bản gốc trước.
- **Vol 1 - Test 9: đã sửa, bật lại** — Cane Toad (mọi bản online cũng 13 câu, đoạn A là ví dụ) → ví dụ thành câu 27 (Paragraph A →
  v, đáp án có sẵn), tiêu đề 27–33 cho A–G, đề đủ 40 câu (`vr_update.js 1 t9p3 --apply`, 0 lượt làm).
- **Còn ẩn (không sửa được):** Vol 1 - Test 7 — bản gốc "Bestcom—Considerate Computing" có 13 câu (14–26), "Extinct: the Giant
  Deer" (engnovate) đánh số 28–40: đề nguồn có Passage 2 dài 14 câu nhưng không còn bản nào, không có ví dụ để chuyển thành câu.
  Vol 4 - Test 9 + bài **Temperament** (chỉ Q30–40) — không tìm thấy bản nào của bài này trên mạng. Backend chỉ trả đề/bài isActive:true cho học sinh. Khi tìm được câu bị thiếu: bổ sung spec →
`vr_update.js` → bật lại trong admin (Đề thi → bật / Bài đọc → bật). Chạy `vr_incomplete.js` sau mỗi vol mới.

## Vol 5 — 2026-10-24 (xong: 10 đề full, 30 bài mới)

Nguồn: `Reading/Test N/Test N- up.pdf` (đề, scan) + `Reading/Test N/Explanation- N.pdf` (bảng key + đoạn trích; scan, riêng
Test 8 có chữ gõ — đọc bằng pymupdf). `render2.py` nay đặt tên `explain-tN` cho file "Expla…" trong thư mục `Test N/`
(trước đây trùng tên `tN` với file đề). Công cụ mới: `webgrep.py <page.html> "<cụm>" …` (xem cụm từ trong trang online đã
curl — để lấy nguyên văn chỗ PDF mất chữ); `vr_build.js`: số viết bằng chữ ("five hours") được tính như số khi đề cho
"AND/OR A NUMBER", và `longOk: [n]` cho câu in hai chỗ trống dưới một số câu (T10 P3 Q33 "weight and position").

- **Đề full Vol 5 - Test 1…10** tạo + bật, đều đủ 40 câu.
- **Không dùng lại bài nào**: chỉ T7 P2 "Art and engineering" (~ "Art in Iron and Steel", Mocktest 70) và T9 P3 "The Placebo
  Effect" (~ "The Power of Nothing", Mocktest 66) trùng một phần chữ (bản gốc dài hơn) nhưng bộ câu hỏi khác hẳn → bài mới,
  ghi trong `SAME_TEXT_OK[5]` của vr_import.js.
- **Mới 30 bài** (bật, ảnh bìa CC0/PD trên R2, giải thích tiếng Việt). Key Vol sai đã sửa theo bài (chi tiết đầu từng spec):
  T3 P2 Q14 B → F (B đã là đáp án Q16); T3 P3 Q37 file key in "G" (tên đoạn) → marketing managers; T4 P1 Q9 NG → FALSE (nhận cả
  hai); T4 P3 Q27 F → E; T5 P1 Q6 genetically-engineered → traditional, Q11 NG → FALSE; T5 P2 Q23 B → A, Q24 C → B (ghép theo
  người nói); T5 P3 Q33 NG → NO; T6 P3 Q31 A → B. Key không chắc: T10 P1 Q2 "growing problem" giữ TRUE, nhận thêm NOT GIVEN.
  T4 P2 file key bỏ trống Q25–26 → records, nutrition (theo bài).
- **Chữ bị mất trong PDF**: lấy lại nguyên văn khi có nguồn — T2 P2 "homes to lose no more than 60 kilowatt-hours per square
  metre" (langmaster), T4 P2 câu "they can achieve records … nutrition … 0.0001 of a second" (Prospect "Out of thin air"),
  T7 P2 "the artless and dehumanising aspects…" (bản Petroski trong ngân hàng), T9 P3 "inflating a blood-pressure cuff",
  T10 P1 cả bài đối chiếu langmaster, T10 P2 "arrival of humans in the New World". **Tự bổ sung tối thiểu** (không có nguồn,
  ghi rõ trong spec): T4 P1 "a … know as graphite. It crumbled", T6 P1 "showing that teens are biologically", T7 P1 "engineering
  graduate, Nolan Bushnell, realised that technology had developed" (chứa đáp án Q1 của key Vol), T7 P3 "are more open to it,
  but Nicholson".
- **Câu hỏi bị thiếu / cụt trong PDF**: T9 P3 Q34 (PDF chỉ in 32–33, key có "34 C") → khôi phục từ bộ câu gốc trên
  koolearn / ielts.xdf.cn ("Fabrizio Benedetti's research … neutralized by introducing naloxone", khớp key); T7 P3 Q33 bị cắt →
  "…has prepared our brains well for post-industrial life"; T7 P3 PDF không có tên bài → đặt "Managing the Human Animal" (tên
  sách trong bài).
- Kiểm: pw_mini 30/30, pw_admin 30/30, pw_grade 30/30 100%, pw_full_tests 10/10, `_audit_reading_warnings` 0,
  `vr_audit.js 5`: 0 problem (400 câu, 484 trích dẫn), `vr_incomplete.js`: 0.
- **Debug lại (cùng ngày)**: dò từ lạ trong chữ bài so với toàn ngân hàng + dò lỗi dấu câu/khoảng trắng → sửa 3 chỗ gạch nối /
  dấu phẩy (T9 P1 "USA , the", T9 P2 "radio- tagged", T10 P3 "thrill- seeking"), `vr_update.js 5 t9p1 t9p2 t10p3 --apply`
  (0 lượt làm). So DB với draft: 27 bài còn lại khớp. T9 P2 tiêu đề iv in lỗi ("The importance in the natural world") — bản
  online (bestmytest) là phiên bản khác bộ tiêu đề, giữ như PDF. Kiểm lại: pw_admin 30/30, pw_grade 30/30 100%,
  pw_full_tests 10/10, `_audit_reading_warnings` 0, `vr_audit.js 5` 0 problem, `vr_incomplete.js` 0.

## Vol 6 — 2026-10-24 (xong: 6 đề full, 18 bài mới)

Nguồn: thư mục `Read/` (không phải `reading/`): `R-TEST N.pdf` (đề, scan; Test 1 có 4 trang bìa/mục lục đầu), `expl 1-4.pdf` +
`expl 5-6.pdf` (key + giải thích tiếng Anh, scan in sạch → OCR đọc tốt) và **`Full Reading.docx` = bản gõ sẵn cả 6 đề** (làm nền
chữ, có vài ghi chú tiếng Việt của người gõ phải xoá). `render2.py` nay tìm thư mục `read` và nhận tên `R-TEST N` → `tN`
(file `expl 1-4` → `expl1-4`); trang Vol 6 rất to → render 72 dpi. Công cụ mới: `py docx2txt.py <docx> web/vol6/full_reading.txt`
(văn bản + bảng) → `node docxsplit.js 6` → `web/vol6/docx/t<T>p<P>.txt`; `SRC=docx node dedupe2.js 6` / `SRC=docx node
dedupe_mini.js 6` đọc các file này thay cho OCR. So docx với OCR trang PDF bằng `wdiff.js` (docx khớp PDF gần như từng chữ).
`vr_build.js`: đoạn "## Tiêu đề" = tiêu đề phụ in đậm trong bài. `_audit_reading_warnings.js`: key sentence-endings dạng
"C / E" hợp lệ khi mọi lựa chọn đều có trong danh sách (máy chấm vốn tách "/").

- **Đề full Vol 6 - Test 1…6** tạo + bật, đều đủ 40 câu.
- **Không dùng lại bài nào**: chỉ "Mungo Lady and Mungo Man" trùng ~21% chữ với "Mungo Man" (Mocktest 48, bài khác, bộ câu hỏi
  khác) → `SAME_TEXT_OK[6]`.
- **Mới 18 bài** (bật, ảnh bìa CC0/PD trên R2, giải thích tiếng Việt). File key Vol 6 sai nhiều — hay gặp nhất là chữ cái lệch so
  với chính lời giải thích của nó. Đã sửa theo bài (chi tiết đầu từng spec): T1 P1 Q10 FALSE → NOT GIVEN; T1 P3 Q29 F → G, Q30
  E → F, Q36 C → D, Q40 E → C (nhận cả E); T2 P1 Q2 FALSE → NOT GIVEN; T2 P3 Q38–40 D,C,B → F,B,C; T3 P2 Q25–26 B,E → C,E;
  T3 P3 file key bỏ câu 30 và đánh lệch số → 30 C, 31 B, 32 G; T4 P1 Q7 FALSE → TRUE (dolacademy/ece/izone cũng TRUE); T5 P2
  Q20 key bỏ trống → laboratory rats, Q24 E → G; T5 P3 Q36 NOT GIVEN → NO, Q38 B (setting) → H (period).
- **Câu hỏi thiếu trong PDF**: T5 P2 PDF dừng ở Q23 — Q24–26 (nối đoạn A–G) lấy từ file key (in đủ đề). T4 P3 Q40 bị cắt
  ("…an effect which is") → "positive" theo file key (người gõ docx tự đoán "unexpected" — bỏ). T4 P3 PDF đánh nhầm Q27 thành "24".
- **Chữ hỏng trong PDF**: T3 P1 bản scan dán lẫn dòng của đoạn khác (3 chỗ) → khôi phục ("lives hunting animals", "…in Africa,
  Asia, and Europe. By 2,000 years ago much of the Earth's population…"), notes Q2–3 lặp câu; T5 P2 sửa theo bài gốc "Bedtime
  Stories" (National Wildlife 2007: "10 to 20 seconds", "tired muscles", câu của Bingman in hai lần). **Tự bổ sung tối thiểu**
  (không tìm được nguyên văn, ghi trong spec): T3 P2 "some realised it was the shape", "forces involved in flight - weight, lift,
  drag and thrust" (câu sau nói "four forces"); T6 P3 "mixes the quantitative and the qualitative" (mất một dòng ở chỗ sang trang).
- Kiểm: pw_mini 18/18, pw_admin 18/18, pw_grade 18/18 100%, pw_full_tests 6/6, `_audit_reading_warnings` 0 (cả 352 bài),
  `vr_audit.js 6`: 0 problem (240 câu, 304 trích dẫn), `vr_incomplete.js`: 0.
- **Debug lại (thầy bảo, cùng ngày)**: không có bản online kèm key cho các bài đã sửa key (chỉ "Radiocarbon dating" có — Q7 TRUE
  khớp). `vr_update.js 6 <18 bài>` (dry run): DB trùng khớp spec, 0 lượt làm. So từng câu hỏi / lựa chọn / tiêu đề / ending trong
  DB với OCR trang PDF (bigram ≥ 80%): chỉ lệch ở chỗ OCR đọc sai hoặc chỗ đã sửa có chủ ý (thêm: T6 P3 lựa chọn C in "The
  world's first futurology was hosted by Finland" → "futurology conference"). Chạy lại: pw_admin 18/18, pw_grade 18/18 100%,
  pw_full_tests 6/6, `_audit_reading_warnings` 0, `vr_audit.js 6` 0 problem, `vr_incomplete.js` 0.
