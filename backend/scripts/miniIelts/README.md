# Nhập đề lẻ Reading từ mini-ielts.com — hướng dẫn tiếp tục

Tài liệu bàn giao cho phiên AI sau (và cho thầy Hà). Cập nhật 2026-09-30.

## 1. Bối cảnh

- Nguồn: https://mini-ielts.com/reading?c=recent-actual-tests — 29 trang, ~340 bài; ~300 bài không trùng với ngân hàng của mình.
- Thầy Hà đã được báo rủi ro bản quyền/điều khoản (lấy nội dung của site khác đưa lên site thu phí) và vẫn quyết định làm, theo từng lô.
- YouPass (youpass.vn) **không lấy**: có lớp chống bot Bunny Shield (403). Không tìm cách vượt.
- Quy ước đã chốt: bài nhập vào ở trạng thái **ẩn** (`isActive:false`, tag `mini-ielts`) để kiểm tra; **bài nào đạt chuẩn (bước 10 + 11 đều qua) thì bật hiển thị cho học sinh luôn** (thầy chốt 2026-09-30, không cần chờ duyệt tay); tự xếp Passage 1/2/3; kèm ảnh minh hoạ. Cả 40 bài của lô 1–4 đã bật 2026-09-30.

## 2. Trạng thái hiện tại

136 bài đã nhập (lô 1–12, xem `node mini_status.js`; bảng dưới chỉ liệt kê 74 bài đầu) và **đang hiển thị cho học sinh** (đủ ảnh, 0 cảnh báo ở admin, render đúng 100% qua Playwright ở cả admin lẫn chế độ luyện, pw_grade 100%) — pilot + batch2 … batch8 (lô 3–8 nhập 2026-09-30):

| _id | Tên | P |
|---|---|---|
| 6abcc046db792dd76cd76399 | Australian artist Margaret Preston | P1 |
| 6abcc047db792dd76cd763a9 | Pacific navigation and voyaging | P3 |
| 6abcc048db792dd76cd763c1 | The dingo debate | P2 |
| 6abcc04adb792dd76cd763d2 | Fishbourne Roman Palace | P1 |
| 6abcc04bdb792dd76cd763e2 | How to find your way out of a food desert | P1 |
| 6abcc04cdb792dd76cd763f2 | What is the secret of a long life? | P1 |
| 6abcc04ddb792dd76cd76402 | Learning to Walk | P3 |
| 6abcc04ddb792dd76cd76414 | Traditional Maori medicines | P1 |
| 6abcc04edb792dd76cd76424 | Mind Music | P2 |
| 6abcc04fdb792dd76cd76435 | How the mind ages | P2 |
| 6abcc4429bd9acaeb9541f39 | Ensuring our future food supply | P1 |
| 6abcc4439bd9acaeb9541f49 | Willpower | P2 |
| 6abcc4439bd9acaeb9541f59 | The pesticide-free village | P1 |
| 6abcc4449bd9acaeb9541f6a | The moto car | P3 |
| 6abcc4469bd9acaeb9541f7c | The hidden lives of solitary bees | P2 |
| 6abcc4469bd9acaeb9541f8d | Reclaiming the future of aral sea | P2 |
| 6abcc4489bd9acaeb9541f9e | Conflicting climatic phenomena co-existing on the Mars | P2 |
| 6abcc4499bd9acaeb9541faf | Bodie: America's most famous ghost town | P1 |
| 6abcc44b9bd9acaeb9541fbf | Changes in Air | P3 |
| 6abcc44d9bd9acaeb9541fd1 | The success of cellulose | P2 |
| 6abcd3924bdca60c3b137caf | Growing up in New Zealand | P2 |
| 6abcd3924bdca60c3b137cbf | The Flavour Industry | P2 |
| 6abcd3924bdca60c3b137cd0 | How Fair is Fair Trade? | P2 |
| 6abcd3954bdca60c3b137ce9 | Deafhood | P2 |
| 6abcd3974bdca60c3b137cfa | The history of tea | P1 |
| 6abcd3994bdca60c3b137d0a | Grimm’s Fairy Tales | P3 |
| 6abcd3994bdca60c3b137d1c | Putting the brakes on climate change: Are hydrogen cars the answer? | P3 |
| 6abcd3994bdca60c3b137d37 | Inside the mind of a fan: How watching sport affects the brain | P3 |
| 6abcd39b4bdca60c3b137d49 | Tickling and Laughter | P3 |
| 6abcd39d4bdca60c3b137d5b | Mungo Man | P3 |
| 6abcde3cee81e7573b2fe877 | Food advertising on children | P2 |
| 6abcde3eee81e7573b2fe891 | Ancient Storytelling | P2 |
| 6abcde40ee81e7573b2fe8a2 | Western Immigration of Canada | P2 |
| 6abcde40ee81e7573b2fe8be | Book review on Musicophilia | P3 |
| 6abcde40ee81e7573b2fe8d6 | Water Filter | P1 |
| 6abcde43ee81e7573b2fe8e7 | Finding our way | P2 |
| 6abcde45ee81e7573b2fe8f8 | Flight from reality | P2 |
| 6abcde47ee81e7573b2fe909 | Cosmetics in Ancient Past | P2 |
| 6abcde47ee81e7573b2fe919 | Undoing Our Emotions | P2 |
| 6abcde48ee81e7573b2fe92a | Synaesthesia | P3 |
| 6abce9251cf40659f1d901e0 | The history of cakes at weddings (có hình Q10–13) | P1 |
| 6abce9271cf40659f1d901f1 | The Benefits of Being Bilingual | P3 |
| 6abce9271cf40659f1d90203 | The truth about lying | P2 |
| 6abce9291cf40659f1d9021c | The Intersection of Health Sciences and Geography | P2 |
| 6abce92a1cf40659f1d9022c | The Columbian Exchange | P3 |
| 6abce92a1cf40659f1d9023e | The Farmers! Parade of history | P2 |
| 6abce92c1cf40659f1d9024f | Pollution! In the Bay | P2 |
| 6abce92d1cf40659f1d90260 | Knowledge in medicine | P3 |
| 6abce92f1cf40659f1d90271 | Assessing the risk | P3 |
| 6abce9301cf40659f1d90283 | The vikings wayfaring way | P2 |
| 6abd01a41b50c9b87212e52a | The Power of Nothing | P3 |
| 6abd01a61b50c9b87212e53c | What Are Dreams? | P3 |
| 6abd01a81b50c9b87212e54e | Travel Accounts | P1 |
| 6abd01aa1b50c9b87212e55e | Art in Iron and Steel | P3 |
| 6abd01ac1b50c9b87212e570 | Multitasking Debate | P2 |
| 6abd01ae1b50c9b87212e581 | Biodiversity | P1 |
| 6abd01af1b50c9b87212e591 | Renewable Energy | P2 |
| 6abd01b21b50c9b87212e5a1 | The Fruit Book | P3 |
| 6abd01b21b50c9b87212e5b2 | The history of glass | P1 |
| 6abd01b41b50c9b87212e5c2 | Cork | P1 |
| 6abd18a4766cfd5ee7885ccb | The Impact of the Potato | P1 |
| 6abd18a4766cfd5ee7885cdb | The problem of climate change | P2 |
| 6abd18a4766cfd5ee7885cec | The Ant and the Mandarin | P2 |
| 6abd18a7766cfd5ee7885cfc | Collecting as a hobby | P1 |
| 6abd18a7766cfd5ee7885d0c | The Tuatara of New Zealand (đoạn 6 + cuối đoạn 8 bị xáo theo cột → ghép lại, không thêm chữ) | P1 |
| 6abd18ab766cfd5ee7885d1c | Alfred Nobel: The man behind the Nobel Prize | P1 |
| 6abd18ad766cfd5ee7885d2c | Movie of Metropolis | P3 |
| 6abd18af766cfd5ee7885d3e | We have Star performers! | P2 |
| 6abd18b0766cfd5ee7885d4f | Blue-footed Boobies (key mini Q19 sai: vi → vii) | P2 |
| 6abd18b1766cfd5ee7885d69 | The Romantic Poets (bảng Q33–39 dựng lại thành tableConfig) | P3 |
| 6abd3688ed19df2f96f58e96 | Effort and Science to Win | P2 |
| 6abd368bed19df2f96f58ea7 | The Rise and Fall of the British Textile Industry | P1 |
| 6abd368bed19df2f96f58eb8 | Human Remains in the Green Sahara | P3 |
| 6abd368ded19df2f96f58eca | Numeracy: Can Animals Tell Numbers? (key mini Q3/Q4 sai; nhóm 8–13 là TFNG) | P1 |

Đã xem nhưng **bỏ** (đừng làm lại trừ khi có nguồn chuẩn khác): 1528 Insect decision-making, 1529 Fear of the Unknown, 1521 E-training (không có nhãn đoạn A–H dù đề hỏi "Which paragraph"); 1513 fluoridation (lựa chọn B là chữ rác, là đáp án Q36); 1510 Global Warming NZ 2, 1497 Maori Fish Hooks, 1494 Beginning of intelligence, 1489 Sense of flavour 2, 1488 Volatility Kills, 1480 Lighting up the lies, 1456 Olive Oil, 1496 Sunny Days for Silicon, 1482 Digital diet (đáp án mini sai/mơ hồ hàng loạt hoặc parse hỏng); 1516 The importance of law (trang đáp án lỗi 500). Lô 3: 1404 History of timekeeping (câu hỏi dựa trên hình, đề hỏng), 1396 Researcher on the Tree Crown (đoạn E mất câu đầu, đáp án Alan Smith không có trong bài), 1393 Elnino and Seabirds (bài ghép nhiều nguồn, lẫn trích dẫn), 1390 Coral reefs (chỉ 12 câu, Q16 mơ hồ B/C), 1383 Brunel (đoạn D mất câu, Q19/Q23/Q25 sai), 1413/1395 Adolescence + 1410 Personality + 1382 Foot health (trùng ngân hàng); chưa xem kỹ (WARN converter): 1419, 1421, 1415, 1416, 1414, 1411, 1399, 1392, 1391, 1409, 1407, 1387, 1385, 1384, 1375, 1376, 1359. Lô 4: 1322 Product adoption (Q19 sai rõ, Q24 nhắc Webvan không có trong bài), 1319 Algae biodiesel (key Q24–26 bị xáo), 1312 British Architecture 2 (Q11 các nguồn không thống nhất, chữ rác), 1309 Bitterness (mất nhóm Q26–27), 1325 Natural pesticide (cùng bài/câu hỏi với "The pesticide-free village" đã nhập), 1316 Easter Island (Q31/Q33 key sai), 1315 Communication in Science (Q30 lệch, đoạn lặp), 1296 Blue line 2 (mất câu Q9 cần), 1292 Mental Gymnastics (Q18 key sai, Q19 hỏng, thiếu đoạn), 1284 Tattoo on Tikopia (hình 3 ô chung 1 mũi tên → không trả lời được), 1268 Satellite (Q20 không có căn cứ), 1266 Finches (mất đoạn A), 1273 Bondi (Q3/Q7 sai/mơ hồ), 1259 Tulip (Q32 hiểu sai). Lô 5: 1249 Making Copier (đoạn C bị đảo), 1103 Life-Casting (Q20/Q23 các nguồn cho 3 đáp án khác nhau), 1072 Dirty River (Q7 sai, tóm tắt hỏng), 1374 Compliance (bài rời rạc, Q36/Q38 sai), 1371 Plant Scents (mất cả nhóm Q22–26), 1369 Photovoltaics (bản mini mất 1 đoạn so với gốc A–I → key theo đoạn sai lệch), 1367 Plain English (tóm tắt hỏng), 1363 Rural transport (tóm tắt hỏng). Lô 6: 1355 Malaria (đoạn B tự mâu thuẫn, thiếu đoạn), 1344 Football (mất đoạn B–C), 1342 Biomimicry (Q31/Q39/Q40 hỏng), 1331 Organic farming (tóm tắt sai key), 1329 TV Addiction (đoạn B mất câu, Q21 sai người), 1328 Copy your neighbor (11 câu, nhóm MC rỗng), 1326 Oil (mất đoạn H chứa Michael Lynch), 1057 Music (danh sách heading rỗng), 1055 Mozart Effect (Q22 dựa câu hỏng). Lô 7: nhóm trắc nghiệm cuối bị rỗng (converter không tách được lựa chọn → thiếu câu; để Giai đoạn C) 1029 Amateur Naturalists, 1230 Need to Belong, 965 Theatrical dress, 1379 Happiness; 1406 Bite That Heals (đoạn E mất nửa câu, Q36 không có căn cứ, Q29/Q40 sai), 1405 Dugong (Q5/Q6/Q9 mơ hồ, câu Q10 hỏng), 1403 Thomas Harriot (Q30 gán nhầm đoạn, Q34/Q36/Q38 mơ hồ), 1394 Environment to Children (bài chắp vá câu để khớp đề, bảng hỏng, thiếu Q13), 1341 Telegraph (mất đoạn cáp Đại Tây Dương, Q27 sai, Q33/Q36 không có trong bài), 1271 Radio Automation (sơ đồ Q1–7 không có hình), 1261 Burgess Shale (Q13 không căn cứ), 1361 Bovids (10 câu); mất danh sách heading hoặc nhãn đoạn: 1476 1478 1477 1441 1454 1493 1287 1286 1299 1141 1215 1036. Danh sách đầy đủ theo id: `web/mini/rejected.txt` (gitignored). Trùng với ngân hàng: xem `node mini_dedupe.js`.

Giải thích đáp án tiếng Việt: `../data/miniIeltsReading/explanations/<passageId>.json` → `../setMiniExplanations.js` (xem mục 6.2).

## 3. Công cụ (thư mục này)

Chạy mọi lệnh với cwd = `backend/scripts/miniIelts`. `web/`, `shots/`, `passages.json` bị gitignore (dữ liệu cào + dump prod).

| File | Việc |
|---|---|
| `dump_passages.js` | Dump toàn bộ Passage trên prod → `passages.json` (chỉ đọc). Chạy đầu phiên. |
| `web/mini/list_N.html`, `order*.txt` | Trang danh sách đã tải (1–16). Trang 17–29 chưa tải: `curl -sL -A "Mozilla/5.0" "https://mini-ielts.com/reading?c=recent-actual-tests&page=N" -o web/mini/list_N.html` |
| `mini_extract.py <id> <slug>` | Tải bài + trang đáp án → `web/mini/x_<id>.json` (bài, câu hỏi, đáp án). Dùng `py` (không phải `python`), đặt `PYTHONIOENCODING=utf-8`. |
| `mini_dedupe.js` | Với các id trong `web/mini/order.txt` (hoặc `ORDER=web/mini/order3.txt`): % trùng 8-gram với ngân hàng, số từ, số đáp án. Lọc: <15%, ≥700 từ, 13–14 đáp án. |
| `mini_convert.js <ids…>` | x_ → `draft_<id>.json` theo schema Passage (TFNG/YNNG, headings, matching, sentence-endings, summary+word bank, notes, MC, choose-two), tự xếp P1/P2/P3 (14 câu→P3; có matching/headings/endings→P2; còn lại P1) và đánh số lại câu. In bản xem nhanh + WARN. |
| `mini_check.js <ids…>` | Kiểm tra tự động draft: đáp án điền từ có trong bài, nhãn đoạn A–H có trong bài, key TFNG/MC/matching hợp lệ. (Báo nhầm khi đáp án nằm trong dấu nháy, vd. 'escapers'.) |
| `show.js <ids…>` | In toàn văn bài + câu hỏi + đáp án để RÀ TAY. |
| `mini_patches.js` | Sửa tay theo từng id: `text` (thay chuỗi/regex ở mọi chỗ), `keys` (số câu SAU khi đánh lại), `notes`, `fn(doc)`. |
| `mini_finalize.js <ids…>` | Áp patches + dọn dấu câu → `final_<id>.json`; báo patch không khớp. |
| `pw_mini.js` | Playwright: login tài khoản teacher test (`PW_TEST_USER`/`PW_TEST_PASS` trong `backend/.env`) trên ieltsthayha.com, render từng bài qua frontend thật bằng cách chặn API (KHÔNG ghi DB). `MINI_DATA=<data.json> node pw_mini.js` |
| `pw_admin.js [regex]` | Playwright: mở modal "📝 Câu hỏi" ở admin cho từng passage (theo `passages.json`), đọc cảnh báo; chặn mọi request không phải GET. |
| `pw_reading.js [regex]` | Playwright: mở từng passage đang active ở chế độ luyện (chỉ GET) và kiểm tra ô trả lời/đáp án. |
| `key_audit.js [tag]` | Kiểm tĩnh mọi đáp án điền từ: có trong bài, đúng giới hạn số từ, không dính dấu câu/ngoặc, có biến thể nháy thẳng `'`. Các "vấn đề" ở biến thể phụ (thêm cho dễ chấm) là vô hại — chỉ sửa khi đáp án chính sai. |
| `pw_grade.js [regex]` | Playwright end-to-end: điền đáp án đúng vào từng câu ở chế độ luyện, bấm chấm như học sinh, đọc kết quả chấm; chặn mọi request không phải GET nên **không lưu gì**. Phải 100% mỗi bài. `PS_FILE=<dump.json>` để chạy trên bộ khác. |
| `../importMiniIeltsReading.js <data.json> [--apply]` | Nhập vào DB (ẩn), chống trùng (tên + 8-gram ≥15%), đưa ảnh lên Cloudinary `reading/mini-ielts/<slug>`. `--image <passageId> <url|file> "<ghi công>"` để thêm ảnh thay thế. |
| `../data/miniIeltsReading/pilot.json`, `batch2.json` … `batch8.json` | Dữ liệu 8 lô đã nhập. |
| `wm_search.js "<query>" [--free]` | Tìm ảnh minh hoạ thay thế trên Wikimedia (lọc giấy phép CC0/PD/CC BY*, `--free` = chỉ CC0/PD) → contact sheet `shots/wm.png` + `web/wm.json` (có `image` 1280px để tải bằng curl + UA). |
| `shot.js <file.html> <out.png>` | Chụp màn hình file HTML cục bộ (contact sheet ảnh). Dùng thay cho `node -e` có regex `\\` (bị hỏng escape). |
| `cover_candidates.js [regex]` → `cover_sheet.js <from> [n]` / `cover_sheet.js 2,4,14` → `cover_pick.js 12=a 13=- …` | Ảnh bìa card cho bài chưa có ảnh: gom ứng viên Wikimedia **chỉ CC0/PD** theo `cover_queries.json` (id → "query \| query"), dựng contact sheet `shots/covers_<n>.png`, ghi lựa chọn vào `../data/passageCovers.json` (kèm tên file Commons + giấy phép). Kho ứng viên có thể lẫn ảnh nhạy cảm — luôn chọn bằng mắt. |
| `../setPassageThumbnail.js --batch ../data/passageCovers.json [--apply]` (hoặc `<id> <file\|url>`) | Tải ảnh (UA riêng, retry 429) → Cloudinary `reading/covers/<slug>-<6 ký tự cuối id>` → chỉ set `thumbnailUrl` (+updatedAt, có điều kiện). Bỏ qua bài đã có ảnh bìa trừ `--force`. |
| `expl_show.js <id\|regex>` / `expl_show.js --todo` | In bài + câu hỏi + key từ `passages.json` để viết giải thích; `--todo` = bài mini chưa có file giải thích. |
| `../setMiniExplanations.js [files] [--local\|--apply] [--force]` | Ghi giải thích (chỉ trường `explanation`, và `correctAnswer` khi file có `key`+`why`) sau khi kiểm tra; bỏ qua câu đã có giải thích trừ `--force`. |
| `../fixMiniContentTypos.js [--apply]` | Sửa lỗi chữ trong content bài mini theo danh sách id cố định; đồng bộ cả file lô. |
| `pw_covers.js` | Playwright (chỉ GET): đếm `thumbnail` trong `/api/reading/practice/list` từng category, kiểm tra ảnh trên card tải được, chụp `shots/covers_list_<cat>.png`. |
| `mini_status.js [--list]` | Đếm 340 id Recent Actual Tests: đã nhập / đã bỏ / trùng ngân hàng / còn lại (heavy WARN, broken, chờ máy chủ hình, chưa rà). Chạy cuối mỗi lô để báo cáo. |
| `mini_debug_check.js` | Kiểm tra cấu trúc chỉ đọc mọi bài mini (≥13 câu, questionRange, MC ≥3 lựa chọn, giải thích khớp key, `__Qn__` ↔ câu, key word bank là từ trong bank, số lựa chọn matching ↔ chữ cái, ảnh nhóm HTTP 200, rác `{A}`/`##`, trùng tên). |
| `mini_compare.js <miniId> [group…]` | In nhóm câu hỏi trên prod cạnh bản gốc `x_<id>.json` để so các nhóm dựng tay. |
| `pw_review.js [N] [regex]` | Playwright (chặn mọi request ghi): làm N bài ngẫu nhiên (đúng/sai/bỏ trống xen kẽ), kiểm tra màn xem lại tô đúng/sai/bỏ qua và mỗi câu hiện đúng giải thích của nó. |
| `mini_batch.js <batchN> <ids…>` | Tạo `../data/miniIeltsReading/batchN.json` từ `final_<id>.json` + tải ảnh bìa ứng viên về `shots/cover_<id>.*`. |
| `titles_re.js <batch.json>` | In regex tên bài của một lô để lọc `pw_reading.js` / `pw_grade.js` (tránh lỗi escape của bash). |
| `../setMiniActualTest.js [--apply]` | Bật `isActualTest` (tab "Actual test" ở danh sách luyện) cho mọi bài mini chưa bật. Importer giờ tự đặt `isActualTest: true` cho bài mới. |

## 4. Quy trình cho một lô (~10 bài)

1. `node dump_passages.js`
2. Chọn ứng viên: `node mini_dedupe.js` (sau khi `mini_extract.py` các id mới) → lọc như bảng trên.
3. `node mini_convert.js <ids>` → `node mini_check.js <ids>` → loại bài có WARN nặng (thiếu câu, thiếu nhãn đoạn, danh sách lựa chọn rỗng).
4. **Rà tay từng bài** bằng `node show.js <id>`: đọc bài, tự trả lời từng câu. **Đáp án mini-ielts sai rất thường xuyên** (≈ 1/3 số bài có ít nhất 1 câu sai; đã gặp đáp án đảo, lệch cả nhóm). Khi nghi ngờ, tìm key độc lập (ece.edu.vn thường có; ieltsonestop chỉ là bản chép mini). Không chắc thì **bỏ bài**, đừng đoán.
   Đồng thời sửa lỗi gõ (OCR: "modem"→"modern", "C02"→"CO2"…), câu bị cắt/đảo, dòng ghi chú bị gộp, hướng dẫn sai (TFNG ghi "views of the writer", "A–D" khi có 5 lựa chọn…). Không bịa nội dung; nếu phải khôi phục câu bị mất, tìm bản gốc online (vd. Psychology Today cho "How the mind ages").
5. Ghi sửa vào `mini_patches.js` → `node mini_finalize.js <ids>` (phải "all patches applied") → copy final sang `draft_c<id>.json` rồi `node mini_check.js c<id>…`.
6. Tạo file dữ liệu `../data/miniIeltsReading/batchN.json` = `[{source, imageUrl, doc}]` (imageUrl = `x.imgs[0]` với `&amp;`→`&`).
7. `MINI_DATA=../data/miniIeltsReading/batchN.json node pw_mini.js` → phải N/N OK.
8. `node ../importMiniIeltsReading.js ../data/miniIeltsReading/batchN.json` (dry) → `--apply`.
9. Ảnh hỏng (thường ~50%): tìm ảnh Wikimedia Commons qua API (`generator=search&gsrnamespace=6&prop=imageinfo&iiextmetadatafilter=LicenseShortName|Artist`), **tải về bằng curl có User-Agent** (Cloudinary tải trực tiếp bị Wikimedia chặn 429), rồi `--image <id> <file> "Ảnh: … — Tác giả, giấy phép (Wikimedia Commons)"`. Ảnh CC BY/BY-SA bắt buộc ghi công.
10. `node dump_passages.js` → `node ../_audit_reading_warnings.js out.json` (phải 0 cảnh báo) → `node pw_admin.js "<tên các bài mới>"` (phải N/N).
11. Bật cho học sinh: `node ../importMiniIeltsReading.js --activate ../data/miniIeltsReading/batchN.json` (dry) → thêm `--apply` (chỉ đụng đúng các bài trong file, theo danh sách _id). Rồi `node dump_passages.js` → `TAG=mini-ielts node pw_reading.js` (mở từng bài ở chế độ luyện như học sinh, phải N/N) → `node key_audit.js` → `TAG=mini-ielts node pw_grade.js "<tên các bài mới>"` (làm đúng hết phải được chấm 100%; bài nào không đạt thì ẩn lại và sửa).
12. Giải thích tiếng Việt: `node dump_passages.js` → `node expl_show.js --todo` → với từng bài `node expl_show.js <id>`, viết `../data/miniIeltsReading/explanations/<id>.json` → `node ../setMiniExplanations.js --local` (phải valid hết) → `node ../setMiniExplanations.js` (dry, xem KEY CHANGE nếu có) → `--apply`.

## 5. Bẫy đã gặp

- **Bài có map / diagram / flow-chart / hình minh hoạ trong câu hỏi: PHẢI kèm hình đầy đủ** (yêu cầu của thầy, 2026-09-30). `mini_extract.py` giờ lưu ảnh trong từng phần câu hỏi (`sections[].imgs`; các bài extract trước đó phải chạy lại), `mini_convert.js` gắn vào `group.imageUrl` (frontend hiển thị ảnh này trên đầu nhóm câu cho mọi loại nhóm) và WARN nếu đề nhắc tới diagram/map mà không có ảnh, hoặc có nhiều ảnh (mỗi câu một hình). Importer tải ảnh này lên Cloudinary; lỗi thì bỏ bài. Kiểm tra bằng mắt: hình phải rõ, đủ nhãn, không bị cắt; không có hình đầy đủ thì bỏ bài.

- Bash heredoc làm hỏng dấu `\` trong regex → sửa code bằng tool Edit/Write, không dùng `sed`/heredoc cho regex.
- Trang đáp án mini đôi khi lỗi 500 → bỏ bài.
- Nhiều bài mini không ghi nhãn A–H trong bài dù có câu "Which paragraph" → bỏ (không đoán ranh giới đoạn). Nhưng từ lô 3: nhiều trang để chữ "A", "B"… thành đoạn `<p>` riêng — `mini_convert.js` giờ tự gộp nhãn đó vào đoạn sau, nên chạy lại convert trước khi kết luận "thiếu nhãn".
- `_audit_reading_warnings.js <file>` GHI kết quả vào `<file>` — dùng `out.json`, đừng truyền `passages.json` (sẽ bị ghi đè thành `[]`).
- Ảnh mini đôi khi là banner quảng cáo của site khác ("IELTS Reading Answers") hoặc sai chủ đề → xem từng ảnh (`curl` về `shots/`), thay bằng Wikimedia (đặt `imageUrl: null` trong batch rồi `--image`).
- Summary có word bank: học sinh kéo **từ**, nên đáp án phải lưu **từ**, không phải chữ cái (converter đã tự đổi).
- Modal admin: điều hướng chỉ đổi hash không remount → `pw_admin.js` đi qua `about:blank`.
- Trang luyện đề lẻ render vào `#retry-questions-inner`, không phải `#questions-inner`.
- `mini_check.js` KHÔNG báo nhóm câu rỗng: nhóm "Choose the correct letter A, B, C or D" không có câu nào (converter không tách được lựa chọn) → bài thiếu câu (10–12 câu). Xem `show.js`: dòng `-- plain | Choose the correct letter…` không có `Q..` bên dưới là dấu hiệu. Lô 7 gặp 4 bài.
- Ảnh minh hoạ mini đôi khi là link `upload.wikimedia.org` (CC BY) → không để importer tải (429, thiếu ghi công): đặt `imageUrl: null` rồi `--image <id> <file> "<ghi công>"`.

## 6. Việc còn lại

**⛔ DỪNG NHẬP (thầy chốt 2026-10-01): không lấy thêm bài mini-ielts nữa.** Chỉ làm tiếp khi thầy yêu cầu lại. Lúc dừng: 136 bài đang chạy, 49 id chưa xử lý (`node mini_status.js --list`). Lô 13 mới convert thử, chưa ghi DB: 1471 (trùng "Finding our way") và 1311 (trùng 22% "How the mind ages") đã ghi vào `rejected.txt`; 1088 Activities for Children rà xong key (đúng, Q18 nên nhận "NOT GIVEN / FALSE"; cần sửa vài lỗi chữ: "lifepark", dấu phẩy toàn góc "18，", câu hỏi "trainning", "What is aim"), chưa có patch; 1211 và 1242 là cùng một bài "What is an ASBO" (chỉ lấy một).

**CẬP NHẬT 2026-10-01 (phiên debug + lô 12):**
- Đang chạy **136 bài mini** (lô 1–12), tất cả có giải thích TV, tất cả tick **Actual test** (thầy yêu cầu: bài Recent Actual Tests hiển thị như bài actual test → hiện cả ở tab "Actual"). `node mini_status.js`: 136 nhập / 126 bỏ / 27 trùng ngân hàng / **51 còn lại** (33 heavy WARN, 4 broken, 4 chờ máy chủ hình, 10 chưa rà: 1471 1311 1256 1250 1094 1211 1145 1242 1147 1088).
- Debug toàn bộ 117 bài cũ: `_audit` 0 cảnh báo, pw_reading 117/117, pw_grade 117/117, pw_admin 136/136, `mini_debug_check.js`, 15 bài có nhóm dựng tay so với bản gốc đều khớp, 9 ảnh sơ đồ khớp nhãn/key, `pw_review.js` màn xem lại OK. Lỗi tìm thấy và đã sửa (`fixMiniContentTypos.js`): nhãn đoạn `{A}` ở Economic Evolution (mini_finalize giờ tự đổi `{A}` → **A**), tiêu đề còn số của mini ("Facial Expression 1", "Food for thought 2"). Lô 12 khi rà thêm: Franklin nhóm 27–32 chỉ có lựa chọn A–H dù bài có đoạn I (đã thêm I), How to Handle the Sun tóm tắt "an ___" trỏ sai sang 'arrangement' (đổi "a"; key 'blend'), Bird Migration Q25 thêm "daytime predators".
- Cần thầy quyết: Rainwater Harvesting Q12 đang nhận cả YES lẫn NO (hai đáp án ngược nhau; bài nói hộ dân "đồng ý góp" nhưng "rất khó khiến họ góp").

**TRẠNG THÁI TRƯỚC ĐÓ (2026-10-01, cuối phiên lô 11):**
- Chỉ lấy bài trong mục **Recent Actual Tests** (`reading?c=recent-actual-tests`, 340 id trong `web/mini/all_ids.json`) — thầy chốt, không lấy mục khác của mini-ielts.
- Đang chạy cho học sinh: **117 bài mini** (lô 1–11), tất cả có giải thích TV. Lô 9 = 4 minor + Giai đoạn B; lô 10 = 14 bài cứu từ 39 "hỏng" (đa số chỉ là passage nằm trong `<li>`/`<div>`, `mini_extract.py` đã xử lý); lô 11 = 18 bài Giai đoạn C.
- **Lô 12 đang dở:** đã rà tay xong và có patch trong `mini_patches.js` (đã chạy `mini_finalize.js`, tất cả patch khớp) cho 19 bài `web/mini/batch12_reviewed.txt` = 1492 1474 1439 1421 1415 1399 1391 1384 1351 1346 1345 1339 1336 1335 1306 1301 1290 1289 1260. **Chưa** làm bước 6→12 (ảnh bìa, batch12.json, pw_mini, import, audit, activate, pw_grade, giải thích).
- Còn chưa rà (convert sạch): 1256 (heading dồn 1 dòng, key có vẻ đúng), 1250 (chữ rác + link http trong bài, nhiều khả năng bỏ), 1094 1211 1145 1242 1147. Còn 33 bài heavy vẫn WARN sau khi nâng converter (`web/mini/heavy_convert3.txt`). 964 1183 1203 1075 chờ máy chủ hình `content.ieltsonlinetests.com` (`web/mini/image_host_down.txt`).
- Converter đã nâng (xem commit 56a41886): `seqOptions`, tách câu hỏi dồn 1 block, MC theo số câu của radio, checkbox kiểu `name='q7' value='A'`. Helper `renum(g, start)` trong `mini_patches.js` để dựng lại nhóm.
- Key nhiều đáp án khi nguồn mâu thuẫn: ghi `"FALSE / NOT GIVEN"`, `"A / B"`… (grader, màn xem lại và `_audit_reading_warnings.js` đều chấp nhận); giải thích phải nêu cả hai. Nhóm chọn-N (`multi-answer-group`) KHÔNG hỗ trợ key thay thế → mơ hồ thì bỏ bài.
- Tỉ lệ nhận Giai đoạn C ~55–65%. Lý do bỏ hay gặp: đoạn văn bị cắt/mất câu mà câu hỏi dựa vào, key mini sai không có nguồn độc lập, phương án lựa chọn vô nghĩa, < 13 câu.

1. Các lô tiếp theo — kế hoạch lấy hết. Cả 340 bài đã tải + extract (`web/mini/all_ids.json`). Phân loại bằng `web/mini/triage.json` (clean / minor / diagram / heavy; tạo lại: dedupe `ORDER=web/mini/order_every.txt` → lọc → convert + check, xem lịch sử phiên).
   **Số liệu 2026-10-01:** 340 bài = **74 đã nhập** + 87 đã bỏ (`web/mini/rejected.txt`) + **179 còn lại**: 30 trùng ngân hàng (bỏ), 39 hỏng (`web/mini/broken.txt`), **12 có hình** (Giai đoạn B: 1520 1419 1388 1377 1357 1285 1251 1203 1075 1095 1192 1049), **94 heavy** (Giai đoạn C), **4 minor chưa xem** (1270 964 1183 1138 — làm đầu tiên). Việc thật sự còn cho AI: 4 + 12 + 94 = **110 bài** (+ thử lại 39 bài hỏng). Tỉ lệ đạt dự kiến ~30–40% → khoảng 35–45 bài nữa.
   - ✅ **Giai đoạn A xong** (2026-09-30): lô 7 xét 38 bài nhận 10, lô 8 xét 13 bài nhận 4 (1204 1210 1338 1324). Lô 8 bỏ: 1269 Meteorite lake (đoạn A mất chữ, Q31 mơ hồ, tóm tắt hỏng — hình Q32–35 thì rõ), 1258 Termite mounds (đoạn E/G mất câu, Q40 mơ hồ), 1264 + 1220 (nhóm MC rỗng), 1143 + 1148 (mất danh sách heading), 1035 (word bank rỗng), 1275 (2 nhóm không xử lý được), 1186 (11 câu). Tỉ lệ đạt ~25–50%.
   - **Giai đoạn B** — 12 bài có hình còn lại (1269, 1258 đã xét ở lô 8 và bỏ): chạy lại `mini_extract.py` (extractor cũ không lấy hình), xem hình kỹ.
   - **Giai đoạn C** — 94 bài "heavy" (gồm các bài có nhóm MC rỗng như 1029 1230 965 1379 1264 1220 — converter chưa tách được lựa chọn): nâng converter (word bank trong bảng, lựa chọn tách dòng, nhóm lạ) rồi mới rà.
   - 39 bài hỏng: thử tải lại trang đáp án một lần, không được thì bỏ.
   Bài có hình trong câu hỏi mà extract trước khi sửa extractor (1404, 1357, 1388, 1520, 1419…) phải chạy lại `mini_extract.py` để lấy hình rồi mới xét. Khi bài bị đánh số lại, converter tự thêm ghi chú "Trên hình, ô 5–9 tương ứng với câu 31–35" vì hình vẫn giữ số gốc — kiểm tra hình có đủ rõ để trả lời không.
2. ✅ **XONG 2026-10-01** — giải thích tiếng Việt cho cả 74 bài mini (Dịch / Vị trí / Trích / Phân tích), dữ liệu `../data/miniIeltsReading/explanations/<passageId>.json`, ghi bằng `../setMiniExplanations.js` (kiểm: đủ câu, câu trích có nguyên văn trong bài, kết luận khớp key; `--local` kiểm với dump). **Bài mới nhập phải viết thêm file giải thích** (`node expl_show.js --todo` liệt kê bài còn thiếu; `node expl_show.js <id>` in bài + câu hỏi). Khi viết đã rà key lần hai và sửa 5 key (trường `key` + `why` trong file): Mind Music Q20 unoccupied→entertained; Ensuring our future food supply Q10/Q11 thêm biến thể; Knowledge in medicine Q32 thêm "experience"; Assessing the risk Q40 "C / A" (nguồn đáp án mâu thuẫn). Kèm `../fixMiniContentTypos.js`: nhãn `{A}` ở The success of cellulose, "Modem" ở The history of glass. Màn hình xem lại (reading-v2.js) giờ tô đúng khi key có nhiều đáp án "C / A".
3. ✅ **XONG 2026-10-01** — 118/118 bài cũ có ảnh bìa (CC0/PD, chọn bằng mắt; danh sách + nguồn trong `../data/passageCovers.json`). Admin có ô "Ảnh bìa" (modal sửa bài: xem trước 2:1, dán link, tải ảnh lên, xoá). Bài trùng: "The Step Pyramid of Djoser" ×2 (cùng văn bản, 2 bộ câu hỏi khác nhau; bản P2 nằm trong Actual Mocktest 5) và "Jewels from the sea" ×2 (cùng câu hỏi, nằm ở Mocktest 33 và 29) — KHÔNG ẩn được vì đề full chỉ tải passage `isActive:true`; chờ thầy quyết. Mô tả gốc: thầy yêu cầu 2026-09-30 "thêm ảnh đại diện cho từng bài" ở danh sách luyện đề. Đã có (commit 61ed52e2, đang chạy trên prod): list API trả `thumbnail` = `Passage.thumbnailUrl` nếu có, không thì ảnh `<img>` đầu tiên trong content (crop Cloudinary 480×240); card hiện ảnh, không có ảnh thì giữ logo Daniel. 60 bài mini đã có ảnh; 118 bài cũ chưa có.
   Việc cần làm: viết `backend/scripts/setPassageThumbnail.js <passageId> <file|url>` (đưa ảnh lên Cloudinary `reading/covers/<slug>`, set `thumbnailUrl`, cập nhật có điều kiện `updatedAt` như `--image`); gom ứng viên Wikimedia theo tên bài (API search như mục 4 bước 9), **chỉ lấy CC0 / Public domain** (card không có chỗ ghi công nên không dùng CC BY/BY-SA), dựng contact sheet ~10 bài/lần, xem bằng mắt rồi chọn; bài không tìm được ảnh phù hợp thì để logo. **Không sửa `content`** của bài cũ (chỉ set `thumbnailUrl`). Kiểm tra: gọi `/api/reading/practice/list` (qua `apiFetch` trong Playwright) đếm `thumbnail`, chụp màn hình trang danh sách. Có thể thêm ô "Ảnh bìa" trong admin (`routes/admin/passages.js` PUT hiện chưa nhận `thumbnailUrl`).
4. Ghi chú kỹ thuật: dump prod (`dump_passages.js`) đôi khi chậm >2 phút — chạy nền. `dotenv` nằm ở `backend/node_modules` (script chạy từ gốc repo phải `require('./backend/node_modules/dotenv')`).
