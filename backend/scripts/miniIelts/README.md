# Nhập đề lẻ Reading từ mini-ielts.com — hướng dẫn tiếp tục

Tài liệu bàn giao cho phiên AI sau (và cho thầy Hà). Cập nhật 2026-09-30.

## 1. Bối cảnh

- Nguồn: https://mini-ielts.com/reading?c=recent-actual-tests — 29 trang, ~340 bài; ~300 bài không trùng với ngân hàng của mình.
- Thầy Hà đã được báo rủi ro bản quyền/điều khoản (lấy nội dung của site khác đưa lên site thu phí) và vẫn quyết định làm, theo từng lô.
- YouPass (youpass.vn) **không lấy**: có lớp chống bot Bunny Shield (403). Không tìm cách vượt.
- Quy ước đã chốt: bài nhập vào ở trạng thái **ẩn** (`isActive:false`, tag `mini-ielts`), thầy duyệt trong Admin → Passages rồi bật; tự xếp Passage 1/2/3; kèm ảnh minh hoạ.

## 2. Trạng thái hiện tại

30 bài đã nhập (ẩn, đủ ảnh, 0 cảnh báo ở admin, render đúng 100% qua Playwright) — pilot + batch2 + batch3 (lô 3 nhập 2026-09-30):

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

Đã xem nhưng **bỏ** (đừng làm lại trừ khi có nguồn chuẩn khác): 1528 Insect decision-making, 1529 Fear of the Unknown, 1521 E-training (không có nhãn đoạn A–H dù đề hỏi "Which paragraph"); 1513 fluoridation (lựa chọn B là chữ rác, là đáp án Q36); 1510 Global Warming NZ 2, 1497 Maori Fish Hooks, 1494 Beginning of intelligence, 1489 Sense of flavour 2, 1488 Volatility Kills, 1480 Lighting up the lies, 1456 Olive Oil, 1496 Sunny Days for Silicon, 1482 Digital diet (đáp án mini sai/mơ hồ hàng loạt hoặc parse hỏng); 1516 The importance of law (trang đáp án lỗi 500). Lô 3: 1404 History of timekeeping (câu hỏi dựa trên hình, đề hỏng), 1396 Researcher on the Tree Crown (đoạn E mất câu đầu, đáp án Alan Smith không có trong bài), 1393 Elnino and Seabirds (bài ghép nhiều nguồn, lẫn trích dẫn), 1390 Coral reefs (chỉ 12 câu, Q16 mơ hồ B/C), 1383 Brunel (đoạn D mất câu, Q19/Q23/Q25 sai), 1413/1395 Adolescence + 1410 Personality + 1382 Foot health (trùng ngân hàng); chưa xem kỹ (WARN converter): 1419, 1421, 1415, 1416, 1414, 1411, 1399, 1392, 1391, 1409, 1407, 1387, 1385, 1384, 1375, 1376, 1359. Trùng với ngân hàng: xem `node mini_dedupe.js`.

Lưu ý: 30 bài này **chưa có giải thích đáp án** (bài cũ có giải thích tiếng Việt).

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
| `../importMiniIeltsReading.js <data.json> [--apply]` | Nhập vào DB (ẩn), chống trùng (tên + 8-gram ≥15%), đưa ảnh lên Cloudinary `reading/mini-ielts/<slug>`. `--image <passageId> <url|file> "<ghi công>"` để thêm ảnh thay thế. |
| `../data/miniIeltsReading/pilot.json`, `batch2.json`, `batch3.json` | Dữ liệu 3 lô đã nhập. |

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

## 6. Việc còn lại

1. Các lô tiếp theo: trang 9–16 (`web/mini/order3.txt`) còn ứng viên chưa xem: 1379, 1374, 1373, 1372, 1371, 1381, 1380, 1389 và các id ≤1370; trang 17–29 đã tải danh sách nhưng chưa extract.
2. Viết giải thích tiếng Việt cho câu hỏi các bài mini (giống bài cũ).
3. Gắn ảnh Wikimedia Commons (giấy phép tự do) cho 118 bài cũ (không có công cụ tạo ảnh AI).
4. Chưa commit: `backend/scripts/importMiniIeltsReading.js`, `backend/scripts/data/miniIeltsReading/`, `backend/scripts/miniIelts/`, `.gitignore`. Chỉ commit/push khi thầy yêu cầu.
