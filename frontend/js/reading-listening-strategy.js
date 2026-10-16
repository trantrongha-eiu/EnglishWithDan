// reading-listening-strategy.html — Chiến lược luyện đề
(function () {
  'use strict';
  if (!(window.AuthService && window.AuthService.requirePageAuth)) return;

  var API = (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api';
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  async function api(path, opts) {
    opts = opts || {};
    var token = window.AuthService && window.AuthService.getToken();
    var headers = Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}, opts.headers || {});
    var res = await fetch(API + '/exam-timetable' + path, Object.assign({}, opts, { headers: headers }));
    if (window.ApiClient && window.ApiClient.handleResponse) return window.ApiClient.handleResponse(res);
    return res.json();
  }

  var SKILL_LABEL = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking', full: 'Full Mock' };

  // Two full 7-week roadmaps in one page (see the .tt-band-toggle buttons in
  // the HTML above) rather than a second file — everything below is keyed
  // by band id ('6.0' | '7.0') so renderWeeks()/the overview table/progress
  // stats all just read from state.band. '6.0' is the original roadmap,
  // unchanged — its checklist keys ('w1-class1', etc.) stay unprefixed for
  // backward compatibility with progress already saved by real students;
  // '7.0' is new and gets a 'b7-' key prefix (via keyFor()) so its 42
  // checklist items never collide with '6.0's in the same flat
  // ExamTimetableProgress.checklist map.
  var OVERVIEW_ROWS_BY_BAND = {
    '6.0': [
      ['W1', 'Làm quen giai đoạn nước rút', 'P1–P2: dạng câu hỏi + tìm đáp án', 'S1–S2', 'P1–P2 Forecast', 'Type 01: Adv/Disadv', 'Dynamic Chart'],
      ['W2', 'Phát triển ý + xử lý bài', 'P1–P2: paraphrase + locating', 'S1–S2', 'P1–P2 Forecast', 'Type 02: Discuss Both', 'Static Chart'],
      ['W3', 'Cause/Solution', 'P1–P2: T/F/NG, Matching', 'S2–S4', 'P1–P2 Forecast', 'Type 03: Cause–Solution', 'Process'],
      ['W4', 'Effect + Cause/Effect', 'P1–P2: Matching, MC', 'S1–S2–S4', 'P1–P2 Forecast', 'Type 04 + 05', 'Map'],
      ['W5', 'Opinion + lập trường', 'P1–P2 tổng hợp', 'S1–S2–S4 tổng hợp', 'P1–P2 Forecast', 'Type 06: Agree/Disagree', 'Dynamic + Static'],
      ['W6', 'Tổng hợp 7 dạng', 'P1–P2 full practice', 'S1–S2–S4 full practice', 'P1–P2 Forecast', 'Type 07 + review', 'Process + Map'],
      ['W7', 'Final Review + Exam Simulation', 'P1–P2 + lỗi cá nhân', 'S1–S2–S4 + lỗi cá nhân', 'P1–P2 Forecast', 'Review cả 7 dạng', 'Review cả 4 dạng'],
    ],
    '7.0': [
      ['W1', 'Nâng nền tảng lên chuẩn Band 7', 'P2–P3: Matching Headings + skimming học thuật', 'S1–S4, chú trọng S3–S4', 'P1–P2–P3 Forecast', 'Type 01: Adv/Disadv (Band 7+)', 'Dynamic Chart (nhiều xu hướng)'],
      ['W2', 'Phát triển lập luận sâu', 'P2–P3: Sentence Completion', 'S3–S4 chuyên sâu', 'P1–P2–P3 Forecast', 'Type 02: Discuss Both (Band 7+)', 'Static Chart (≥4 nhóm số liệu)'],
      ['W3', 'Cause/Solution nâng cao', 'P2–P3: Y/N/NG mức khó', 'S3–S4 + distractor 2 lớp', 'P1–P2–P3 Forecast', 'Type 03: Cause–Solution', 'Process (mô tả kỹ thuật)'],
      ['W4', 'Effect + Cause/Effect nâng cao', 'Full 3 passage theo giờ thi', 'Full 4 section liền mạch', 'P1–P2–P3 Forecast', 'Type 04 + 05', 'Map (≥3 thay đổi)'],
      ['W5', 'Opinion + lập trường sắc bén', 'Full test tổng hợp', 'Full test tổng hợp', 'P1–P2–P3 Forecast', 'Type 06: Agree/Disagree', 'Dynamic + Static kết hợp'],
      ['W6', 'Tổng hợp 7 dạng ở Band 7+', 'Full test + phân tích lỗi', 'Full test + phân tích lỗi', 'P1–P2–P3 Forecast', 'Type 07 + review', 'Process + Map'],
      ['W7', 'Final Review + Exam Simulation', 'Full test + lỗi cá nhân', 'Full test + lỗi cá nhân', 'P1–P2–P3 Forecast', 'Review cả 7 dạng', 'Review cả 4 dạng'],
    ],
  };

  var TIMETABLE_WEEKS_BY_BAND = { '6.0': null, '7.0': null }; // filled in below

  TIMETABLE_WEEKS_BY_BAND['6.0'] = [
    { n: 1, title: 'Build the Foundation', goal: 'Ổn định cách làm bài, bắt đầu thói quen làm → chữa → rewrite.',
      focus: { t2: 'Type 01 – Advantages & Disadvantages', t1: 'Dynamic Chart → chọn highlights + chia nhóm số liệu.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test tuần trước', c: 'Chữa Reading P1–P2 + Listening S1–S2 của test trước. Phân tích lỗi. Rewrite câu trả lời sai ngay tại lớp.' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Reading/Listening + Type 01', c: 'Reading P1–P2: keyword, paraphrase, locating. Listening S1–S2: keyword + prediction. Writing Type 01 – Adv/Disadv.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills', c: 'Full Listening + Reading + Writing + Speaking.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading P1 + P2', c: 'Sau khi chấm: ghi lại lý do sai, không chỉ ghi đáp án.' },
        { k: 'home2', fmt: '2h tự học', t: 'Listening + Speaking', c: 'Listening S1 + S2 + check transcript. Speaking P1–P2 Forecast.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing', c: '1 Task 1 Dynamic Chart + 1 Task 2 Adv/Disadv.' },
      ] },
    { n: 2, title: 'Develop Ideas', goal: 'Phát triển ý và xử lý bài tốt hơn.',
      focus: { t2: 'Type 02 – Discuss Both Views', t1: 'Static Chart → grouping + chia Body 1/2 + chọn highlights.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test tuần 1', c: 'Chữa Reading + Listening tuần 1. Phân tích lỗi + rewrite toàn bộ câu sai quan trọng.' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Reading/Listening + Type 02', c: 'Reading P1–P2: paraphrase + locating. Listening S1–S2: prediction + distractors. Writing Type 02 – Discuss Both Views. Speaking P1–P2 Forecast.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills', c: 'Full 4 skills.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading P1–P2', c: 'Tập trung paraphrase và locating.' },
        { k: 'home2', fmt: '2h tự học', t: 'Listening + Speaking', c: 'Listening S1–S2 + Speaking P1–P2 Forecast.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing', c: 'Static Chart + Task 2 Discuss Both Views.' },
      ] },
    { n: 3, title: 'Cause & Solution', goal: 'Làm chủ dạng Cause–Solution.',
      focus: { t2: 'Type 03 – Cause–Solution', t1: 'Process → xác định stages, sequence, nhóm các bước.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test tuần 2', c: 'Chữa Reading + Listening tuần 2 + rewrite. Tổng hợp các lỗi lặp lại.' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Reading/Listening + Type 03', c: 'Reading P1–P2: T/F/NG + Matching. Listening S2–S4: prediction + keyword + signposting. Writing Type 03 – Cause–Solution.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills', c: 'Full 4 skills.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading P1–P2', c: 'T/F/NG + Matching.' },
        { k: 'home2', fmt: '2h tự học', t: 'Listening + Speaking', c: 'Listening S2 + S4 + Speaking P1–P2 Forecast.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing', c: 'Process + Task 2 Cause–Solution.' },
      ] },
    { n: 4, title: 'Effect & Cause–Effect', goal: 'Xử lý Effect–Solution và Cause–Effect.',
      focus: { t2: 'Type 04 – Effect–Solution + Type 05 – Cause–Effect', t1: 'Map → identify changes, group locations, viết overview.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test tuần 3', c: 'Chữa Reading + Listening tuần 3 + rewrite. Tập trung lỗi do paraphrase và distractor.' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Reading/Listening + Type 04+05', c: 'Reading P1–P2: Multiple Choice + Matching. Listening S1–S2–S4. Writing Type 04 + Type 05. Task 1 Map.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills', c: 'Full 4 skills.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading P1–P2', c: 'Mixed question types.' },
        { k: 'home2', fmt: '2h tự học', t: 'Listening + Speaking', c: 'Listening S1–S2–S4 + Speaking P1–P2 Forecast.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing', c: 'Map + Task 2 Cause–Effect / Effect–Solution.' },
      ] },
    { n: 5, title: 'Opinion & Position', goal: 'Vững lập trường ở dạng Agree/Disagree.',
      focus: { t2: 'Type 06 – Agree/Disagree', t1: 'Dynamic + Static Chart → grouping + body division + highlights.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test tuần 4', c: 'Chữa Reading + Listening tuần 4 + rewrite. Cá nhân hóa error log.' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Reading/Listening tổng hợp + Type 06', c: 'Reading P1–P2 tổng hợp. Listening S1–S2–S4 tổng hợp. Writing Type 06 – Agree/Disagree. Speaking P1–P2 Forecast.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills', c: 'Full 4 skills.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading full practice', c: 'Reading P1–P2 full practice + error analysis.' },
        { k: 'home2', fmt: '2h tự học', t: 'Listening + Speaking', c: 'Listening S1–S2–S4 + Speaking P1–P2 Forecast.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing', c: 'Dynamic/Static Chart + Agree/Disagree essay.' },
      ] },
    { n: 6, title: 'Master All Question Types', goal: 'Tổng hợp cả 7 dạng Task 2.',
      focus: { t2: 'Type 07 – Positive/Negative Development + review 7 dạng', t1: 'Process + Map review.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test tuần 5', c: 'Chữa Reading + Listening tuần 5 + rewrite. Tập trung lỗi cá nhân.' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Review 7 dạng + Type 07', c: 'Review toàn bộ 7 dạng Task 2. Writing Type 07 – Positive/Negative Development. Task 1 Process + Map.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills (điều kiện thi thật)', c: 'Full 4 skills dưới điều kiện thi thật.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading + Listening', c: 'Reading P1–P2 + Listening S1–S2–S4.' },
        { k: 'home2', fmt: '2h tự học', t: 'Speaking', c: 'Speaking P1–P2 Forecast + tự ghi âm và tự sửa.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing ngẫu nhiên', c: 'Chọn ngẫu nhiên 1 trong 7 dạng Task 2 + 1 Task 1 bất kỳ.' },
      ] },
    { n: 7, title: 'Final Exam Simulation', goal: 'Không học kiến thức mới — chỉ ổn định phong độ và sửa lỗi cá nhân.',
      focus: { t2: 'Review cả 7 dạng Task 2', t1: 'Review cả 4 dạng Task 1' },
      sessions: [
        { k: 'class1', fmt: 'Final Review', t: 'Chữa Mock tuần 6', c: 'Chữa Reading + Listening Mock tuần 6. Rewrite lỗi quan trọng. Ôn error log cá nhân.' },
        { k: 'class2', fmt: 'Final Review', t: 'Review Writing + Speaking', c: 'Review Writing 7 dạng + Task 1 4 dạng. Speaking P1–P2 Forecast. Chiến thuật xử lý thời gian.' },
        { k: 'class3', fmt: 'Final Mock', t: 'FINAL MOCK', c: 'Full 4 skills dưới điều kiện gần giống phòng thi thật.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading + Listening', c: 'Chỉ tập trung dạng học sinh thường sai.' },
        { k: 'home2', fmt: '2h tự học', t: 'Speaking + Writing', c: 'Speaking P1–P2 Forecast + Writing Task 2: 1 đề bất kỳ trong 7 dạng.' },
        { k: 'home3', fmt: '2h tự học', t: 'Final Light Practice', c: '1 Task 1 + review template + vocabulary + error log. Không làm quá tải.' },
      ] },
  ];

  TIMETABLE_WEEKS_BY_BAND['7.0'] = [
    { n: 1, title: 'Refine to Band 7 Standard', goal: 'Nâng chuẩn làm bài lên Band 7 — không còn sai nền tảng, bắt đầu tư duy như giám khảo.',
      focus: { t2: 'Type 01 – Advantages & Disadvantages (Band 7+ template + 12 cấu trúc câu)', t1: 'Dynamic Chart → chọn số liệu phức tạp, so sánh nhiều xu hướng cùng lúc.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test đầu vào / tuần trước', c: 'Chữa Reading full 3 passage + Listening S1–S4 của test trước. Phân tích lỗi theo tiêu chí giám khảo, không chỉ đúng/sai. Rewrite câu trả lời sai bằng chính từ vựng của bài.' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Reading/Listening nâng cao + Type 01', c: 'Reading P2–P3: Matching Headings + skimming học thuật tốc độ cao. Listening S3–S4: nhận diện paraphrase + discourse marker. Writing Type 01 ở tầng Band 7+ — câu chủ đề nêu một ý, có bằng chứng cụ thể.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills điều kiện thi thật', c: 'Full Listening + Reading + Writing + Speaking dưới áp lực thời gian thật, không dừng giữa chừng.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading P2–P3', c: 'Matching Headings + Sentence Completion. Ghi lại từ khoá paraphrase bị bỏ lỡ, không chỉ ghi đáp án đúng.' },
        { k: 'home2', fmt: '2h tự học', t: 'Listening + Speaking', c: 'Listening S3–S4 + chép lại transcript đoạn nghe sai. Speaking P1–P2–P3 Forecast — ghi âm và tự nghe lại phát âm/ngữ điệu.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing', c: '1 Task 1 Dynamic Chart (≥2 xu hướng) + 1 Task 2 Adv/Disadv, áp dụng ít nhất 3 trong 12 cấu trúc câu nâng band.' },
      ] },
    { n: 2, title: 'Deepen the Argument', goal: 'Phát triển lập luận sâu và tự nhiên hơn — không còn viết theo khung cứng.',
      focus: { t2: 'Type 02 – Discuss Both Views (Band 7+, tránh lặp cấu trúc)', t1: 'Static Chart → nhóm số liệu theo nhiều tiêu chí, viết Overview 2 câu.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test tuần 1', c: 'Chữa Reading + Listening tuần 1 dưới góc nhìn giám khảo: vì sao mất band ở Coherence & Cohesion, không chỉ Task Achievement. Rewrite toàn bộ đoạn văn có lỗi liên kết.' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Reading/Listening nâng cao + Type 02', c: 'Reading P2–P3: Sentence Completion + giới hạn số từ nghiêm ngặt. Listening S3–S4: multiple speakers + note-taking tốc độ cao. Writing Type 02 — so sánh hai quan điểm mà không lộ thiên vị quá sớm. Speaking P1–P2–P3 Forecast.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills', c: 'Full 4 skills.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading P2–P3', c: 'Tập trung Sentence Completion — luyện paraphrase ngược (từ đáp án suy ra cách đề diễn đạt).' },
        { k: 'home2', fmt: '2h tự học', t: 'Listening + Speaking', c: 'Listening S3–S4 + Speaking P1–P2–P3 Forecast, đặc biệt luyện mở rộng câu trả lời Part 3 bằng lập luận nhân–quả.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing', c: 'Static Chart (≥4 nhóm số liệu) + Task 2 Discuss Both Views, dùng câu chẻ hoặc đảo ngữ ít nhất 1 lần.' },
      ] },
    { n: 3, title: 'Cause & Solution at Band 7', goal: 'Làm chủ Cause–Solution với lập luận chặt và từ vựng học thuật.',
      focus: { t2: 'Type 03 – Cause–Solution (ưu tiên câu điều kiện + bị động học thuật)', t1: 'Process → mô tả quy trình kỹ thuật, dùng đúng thì bị động.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test tuần 2', c: 'Chữa Reading + Listening tuần 2. Tổng hợp lỗi lặp lại thành bảng lỗi cá nhân — bắt đầu theo dõi xuyên suốt 7 tuần.' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Reading/Listening nâng cao + Type 03', c: 'Reading P2–P3: Yes/No/Not Given ở mức khó (ý kiến tác giả ẩn). Listening S3–S4: distractor 2 lớp. Writing Type 03 — nguyên nhân sâu (root cause) thay vì nguyên nhân bề mặt.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills', c: 'Full 4 skills.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading P2–P3', c: 'Y/N/NG khó — phân biệt "tác giả không đề cập" và "tác giả phủ định gián tiếp".' },
        { k: 'home2', fmt: '2h tự học', t: 'Listening + Speaking', c: 'Listening S3–S4 + Speaking P1–P2–P3 Forecast, tập trung Part 3 dạng so sánh quá khứ–hiện tại.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing', c: 'Process (kỹ thuật/tự nhiên) + Task 2 Cause–Solution, bắt buộc 1 câu bị động học thuật ("It is widely believed that…").' },
      ] },
    { n: 4, title: 'Effect & Cause–Effect, Sharpened', goal: 'Xử lý Effect–Solution và Cause–Effect với chiều sâu phân tích.',
      focus: { t2: 'Type 04 – Effect–Solution + Type 05 – Cause–Effect (mệnh đề quan hệ, cụm phân từ)', t1: 'Map → mô tả thay đổi phức tạp qua nhiều mốc thời gian.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test tuần 3', c: 'Chữa Reading + Listening tuần 3. Rà lại bảng lỗi cá nhân — lỗi nào đã hết, lỗi nào vẫn lặp.' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Reading/Listening tổng hợp + Type 04+05', c: 'Reading full 3 passage dưới thời gian thi thật (60 phút). Listening full 4 section liền mạch. Writing Type 04 + Type 05, dùng cụm phân từ "…, thereby + V-ing" để nối hệ quả.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills', c: 'Full 4 skills.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading full test', c: 'Phân tích thời gian dùng cho từng passage — passage nào chậm nhất, vì sao.' },
        { k: 'home2', fmt: '2h tự học', t: 'Listening + Speaking', c: 'Listening full test + Speaking P1–P2–P3 Forecast, luyện phản xạ trả lời Part 3 trong 5 giây.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing', c: 'Map (≥3 thay đổi) + Task 2 Cause–Effect / Effect–Solution, dùng ít nhất 1 mệnh đề quan hệ rút gọn.' },
      ] },
    { n: 5, title: 'Opinion & Position, Uncompromising', goal: 'Giữ lập trường rõ ràng và nhất quán suốt bài ở dạng Agree/Disagree.',
      focus: { t2: 'Type 06 – Agree/Disagree (Partial Agreement nâng cao)', t1: 'Dynamic + Static Chart kết hợp trong cùng một bài.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test tuần 4', c: 'Chữa Reading + Listening tuần 4 + rewrite. Cá nhân hoá error log — mỗi học sinh tự xác định 2 lỗi ưu tiên sửa trước thi.' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Reading/Listening full test + Type 06', c: 'Reading full test tổng hợp mọi dạng câu hỏi. Listening full test. Writing Type 06 — Partial Agreement mà không rơi vào "an toàn hai phe". Speaking P1–P2–P3 Forecast.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills điều kiện thi thật', c: 'Full 4 skills điều kiện thi thật.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading full test', c: 'Làm dưới đúng 60 phút, không tra từ điển.' },
        { k: 'home2', fmt: '2h tự học', t: 'Listening + Speaking', c: 'Listening full test + Speaking P1–P2–P3 Forecast, tập trung ngữ điệu tự nhiên ở Part 2.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing', c: 'Dynamic + Static Chart kết hợp + Agree/Disagree essay, tự chấm theo 4 tiêu chí Band 7.' },
      ] },
    { n: 6, title: 'Master All Question Types at Band 7', goal: 'Tổng hợp cả 7 dạng Task 2 và 4 dạng Task 1 ở chuẩn Band 7.',
      focus: { t2: 'Type 07 – Positive/Negative Development + review 7 dạng (rải đều 12 cấu trúc câu)', t1: 'Process + Map review.' },
      sessions: [
        { k: 'class1', fmt: 'Chữa test', t: 'Chữa test tuần 5', c: 'Chữa Reading + Listening tuần 5 + rewrite. Tập trung lỗi Band 6→7 (không còn là lỗi ngữ pháp cơ bản).' },
        { k: 'class2', fmt: 'Kiến thức mới', t: 'Review 7 dạng + Type 07', c: 'Review toàn bộ 7 dạng Task 2 — mỗi dạng 1 câu mở đầu mẫu Band 7+. Writing Type 07. Task 1 Process + Map ôn nhanh.' },
        { k: 'class3', fmt: 'Full Mock', t: 'Full 4 skills (điều kiện thi thật)', c: 'Full 4 skills dưới điều kiện thi thật — giám sát thời gian nghiêm ngặt.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading + Listening', c: 'Làm 1 đề Cambridge mới nhất, tự chấm và so band.' },
        { k: 'home2', fmt: '2h tự học', t: 'Speaking', c: 'Speaking P1–P2–P3 Forecast + tự ghi âm, so sánh với bài ghi âm tuần 1 để thấy tiến bộ.' },
        { k: 'home3', fmt: '2h tự học', t: 'Writing ngẫu nhiên', c: 'Chọn ngẫu nhiên 1 trong 7 dạng Task 2 + 1 Task 1 bất kỳ, viết trong đúng 40 phút.' },
      ] },
    { n: 7, title: 'Final Exam Simulation', goal: 'Không học kiến thức mới — chỉ ổn định phong độ Band 7 và xoá lỗi cá nhân cuối cùng.',
      focus: { t2: 'Review cả 7 dạng Task 2 ở chuẩn Band 7+', t1: 'Review cả 4 dạng Task 1 ở chuẩn Band 7+' },
      sessions: [
        { k: 'class1', fmt: 'Final Review', t: 'Chữa Mock tuần 6', c: 'Chữa Reading + Listening Mock tuần 6. Rewrite lỗi quan trọng nhất. Ôn lại toàn bộ error log 6 tuần.' },
        { k: 'class2', fmt: 'Final Review', t: 'Review Writing + Speaking', c: 'Review Writing 7 dạng + Task 1 4 dạng bằng checklist Band 7+. Speaking P1–P2–P3 Forecast. Chiến thuật xử lý thời gian phòng thi.' },
        { k: 'class3', fmt: 'Final Mock', t: 'FINAL MOCK', c: 'Full 4 skills dưới điều kiện gần giống phòng thi thật nhất có thể.' },
        { k: 'home1', fmt: '2h tự học', t: 'Reading + Listening', c: 'Chỉ tập trung đúng dạng học sinh còn sai — không ôn tràn lan.' },
        { k: 'home2', fmt: '2h tự học', t: 'Speaking + Writing', c: 'Speaking P1–P2–P3 Forecast + Writing Task 2: 1 đề bất kỳ trong 7 dạng, viết đúng 40 phút.' },
        { k: 'home3', fmt: '2h tự học', t: 'Final Light Practice', c: '1 Task 1 + review 12 cấu trúc câu + vocabulary theo topic + error log. Không làm quá tải trước ngày thi.' },
      ] },
  ];

  var BAND_STORAGE_KEY = 'tt_band';
  var state = {
    band: (function () { try { return localStorage.getItem(BAND_STORAGE_KEY) || '6.0'; } catch (e) { return '6.0'; } })(),
    checklist: {}, testLogs: [], stats: { totalChecked: 0, totalItems: 42, totalLogs: 0, totalReviewed: 0 },
  };

  // '6.0' keeps its original unprefixed keys (real students already have
  // progress saved under these); '7.0' is namespaced so its 42 items never
  // collide with '6.0's in the same flat checklist map.
  function keyFor(weekNum, sessionKey) {
    return (state.band === '7.0' ? 'b7-w' : 'w') + weekNum + '-' + sessionKey;
  }

  // The backend's stats.totalChecked/totalItems are a flat count across the
  // WHOLE checklist map (see examTimetableService.js's computeStats) — fine
  // when only one 42-item roadmap existed, but with two bands sharing one
  // map, a student's combined progress across both would misreport as
  // "over 100%" (or as the wrong band's %) if trusted directly. Recompute
  // both numbers here, scoped to just the active band's own 42 keys.
  function activeBandStats() {
    var weeks = TIMETABLE_WEEKS_BY_BAND[state.band];
    var totalItems = 0, totalChecked = 0;
    weeks.forEach(function (w) {
      w.sessions.forEach(function (s) {
        totalItems++;
        if (state.checklist[keyFor(w.n, s.k)]) totalChecked++;
      });
    });
    return { totalItems: totalItems, totalChecked: totalChecked };
  }

  function renderStats() {
    var scoped = activeBandStats();
    var pct = scoped.totalItems ? Math.round((scoped.totalChecked / scoped.totalItems) * 100) : 0;
    var fill = document.getElementById('tt-progress-fill');
    var txt = document.getElementById('tt-progress-txt');
    if (fill) fill.style.width = pct + '%';
    if (txt) txt.textContent = scoped.totalChecked + '/' + scoped.totalItems + ' buổi (' + pct + '%)';
    var elS = document.getElementById('tt-stat-sessions'); if (elS) elS.textContent = scoped.totalChecked;
    var elT = document.getElementById('tt-stat-tests'); if (elT) elT.textContent = state.stats.totalLogs;
    var elR = document.getElementById('tt-stat-reviewed'); if (elR) elR.textContent = state.stats.totalReviewed;
  }

  function renderOverviewTable() {
    var tbody = document.getElementById('tt-overview-tbody');
    if (!tbody) return;
    var rows = OVERVIEW_ROWS_BY_BAND[state.band] || [];
    tbody.innerHTML = rows.map(function (r) {
      return '<tr><td><b>' + esc(r[0]) + '</b></td>' + r.slice(1).map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
    }).join('');
  }

  function weekDoneCount(w) {
    var n = 0;
    w.sessions.forEach(function (s) { if (state.checklist[keyFor(w.n, s.k)]) n++; });
    return n;
  }

  function renderWeeks() {
    var host = document.getElementById('tt-weeks');
    if (!host) return;
    host.innerHTML = TIMETABLE_WEEKS_BY_BAND[state.band].map(function (w) {
      var done = weekDoneCount(w);
      var countCls = done === w.sessions.length ? 'tt-week-count done' : 'tt-week-count';
      var sessionsHtml = w.sessions.map(function (s) {
        var key = keyFor(w.n, s.k);
        var checked = !!state.checklist[key];
        return '' +
          '<div class="tt-session' + (checked ? ' done' : '') + '" data-key="' + key + '">' +
            '<input type="checkbox" data-tt-check="' + key + '"' + (checked ? ' checked' : '') + '>' +
            '<div class="tt-session-body">' +
              '<div class="tt-session-format">' + esc(s.fmt) + '</div>' +
              '<div class="tt-session-title">' + esc(s.t) + '</div>' +
              '<div class="tt-session-content">' + esc(s.c) + '</div>' +
            '</div>' +
          '</div>';
      }).join('');
      return '' +
        '<details class="tt-week" id="tt-week-' + w.n + '"' + (w.n === 1 ? ' open' : '') + '>' +
          '<summary>' +
            '<span class="tt-week-badge">W' + w.n + '</span>' +
            '<span class="tt-week-head"><span class="tt-week-title">' + esc(w.title) + '</span><span class="tt-week-goal">' + esc(w.goal) + '</span></span>' +
            '<span class="' + countCls + '">' + done + '/' + w.sessions.length + '</span>' +
            '<i class="fas fa-chevron-down"></i>' +
          '</summary>' +
          '<div class="tt-week-body">' +
            sessionsHtml +
            '<div class="st-callout" style="margin-top:12px">' +
              '<div class="st-callout-t"><i class="fas fa-pen-nib"></i> Writing focus</div>' +
              '<p><b>Task 2:</b> ' + esc(w.focus.t2) + '<br><b>Task 1:</b> ' + esc(w.focus.t1) + '</p>' +
            '</div>' +
          '</div>' +
        '</details>';
    }).join('');

    host.querySelectorAll('[data-tt-check]').forEach(function (cb) {
      cb.addEventListener('change', function () { onToggleSession(cb.getAttribute('data-tt-check'), cb.checked); });
    });
  }

  // Updates one week's "x/6" badge in place, without touching innerHTML —
  // a full renderWeeks() re-render would reset every <details> back to its
  // default open/closed state, collapsing whichever week the student is
  // actually looking at right when they check something off.
  function updateWeekBadge(weekNum) {
    var w = TIMETABLE_WEEKS_BY_BAND[state.band].filter(function (x) { return x.n === weekNum; })[0];
    if (!w) return;
    var badge = document.querySelector('#tt-week-' + weekNum + ' .tt-week-count');
    if (!badge) return;
    var done = weekDoneCount(w);
    badge.textContent = done + '/' + w.sessions.length;
    badge.classList.toggle('done', done === w.sessions.length);
  }

  function applyChecklistUi(key, checked) {
    var row = document.querySelector('.tt-session[data-key="' + key + '"]');
    if (row) {
      row.classList.toggle('done', checked);
      var cb = row.querySelector('input[type="checkbox"]');
      if (cb) cb.checked = checked;
    }
    // Matches both '6.0's unprefixed 'w1-...' and '7.0's 'b7-w1-...'.
    var weekNum = parseInt((key.match(/w(\d+)-/) || [])[1], 10);
    if (weekNum) updateWeekBadge(weekNum);
  }

  async function onToggleSession(key, checked) {
    state.checklist[key] = checked;
    applyChecklistUi(key, checked);
    renderStats();
    try {
      var data = await api('/checklist/' + encodeURIComponent(key), { method: 'PUT', body: JSON.stringify({ checked: checked }) });
      if (data && data.success) { state = Object.assign(state, data); renderStats(); }
    } catch (e) {
      // Revert on failure — the optimistic UI update above shouldn't lie.
      state.checklist[key] = !checked;
      applyChecklistUi(key, !checked);
      renderStats();
      if (window.showToast) window.showToast('Không lưu được, thử lại nhé', 'error');
    }
  }

  function fmtDate(d) {
    try { return new Date(d).toLocaleDateString('vi-VN'); } catch (e) { return ''; }
  }

  function renderLogs() {
    var tbody = document.getElementById('tt-log-tbody');
    if (!tbody) return;
    if (!state.testLogs.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="tt-log-empty">Chưa có đề nào — thêm đề đầu tiên ở trên.</td></tr>';
      return;
    }
    tbody.innerHTML = state.testLogs.map(function (l) {
      return '' +
        '<tr data-log-id="' + l.id + '">' +
          '<td>' + esc(fmtDate(l.date)) + '</td>' +
          '<td>' + (l.week ? 'W' + l.week : '—') + '</td>' +
          '<td><span class="tt-log-skill-badge">' + esc(SKILL_LABEL[l.skill] || l.skill) + '</span></td>' +
          '<td>' + esc(l.label || '—') + '</td>' +
          '<td>' + esc(l.mistake || '—') + '</td>' +
          '<td><input type="checkbox" class="tt-log-reviewed" data-log-reviewed="' + l.id + '"' + (l.reviewed ? ' checked' : '') + '></td>' +
          '<td><button type="button" class="tt-log-del" data-log-del="' + l.id + '" title="Xoá"><i class="fas fa-trash"></i></button></td>' +
        '</tr>';
    }).join('');

    tbody.querySelectorAll('[data-log-reviewed]').forEach(function (cb) {
      cb.addEventListener('change', function () { onToggleReviewed(cb.getAttribute('data-log-reviewed'), cb.checked); });
    });
    tbody.querySelectorAll('[data-log-del]').forEach(function (btn) {
      btn.addEventListener('click', function () { onDeleteLog(btn.getAttribute('data-log-del')); });
    });
  }

  async function onToggleReviewed(logId, reviewed) {
    try {
      var data = await api('/logs/' + logId, { method: 'PATCH', body: JSON.stringify({ reviewed: reviewed }) });
      if (data && data.success) { state = Object.assign(state, data); renderLogs(); renderStats(); }
    } catch (e) {
      if (window.showToast) window.showToast('Không lưu được, thử lại nhé', 'error');
    }
  }

  async function onDeleteLog(logId) {
    try {
      var data = await api('/logs/' + logId, { method: 'DELETE' });
      if (data && data.success) { state = Object.assign(state, data); renderLogs(); renderStats(); }
    } catch (e) {
      if (window.showToast) window.showToast('Không xoá được, thử lại nhé', 'error');
    }
  }

  function wireLogForm() {
    var form = document.getElementById('tt-log-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var skill = document.getElementById('tt-log-skill').value;
      var week = document.getElementById('tt-log-week').value;
      var label = document.getElementById('tt-log-label').value.trim();
      var mistake = document.getElementById('tt-log-mistake').value.trim();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        var data = await api('/logs', { method: 'POST', body: JSON.stringify({ skill: skill, week: week || null, label: label, mistake: mistake }) });
        if (data && data.success) {
          state = Object.assign(state, data);
          renderLogs();
          renderStats();
          document.getElementById('tt-log-label').value = '';
          document.getElementById('tt-log-mistake').value = '';
          document.getElementById('tt-log-week').value = '';
          if (window.showToast) window.showToast('Đã thêm vào nhật ký luyện đề', 'success');
        }
      } catch (e2) {
        if (window.showToast) window.showToast('Không thêm được, thử lại nhé', 'error');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  function wireBandToggle() {
    var btns = document.querySelectorAll('.tt-band-btn');
    function applyActive() {
      btns.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-band') === state.band); });
    }
    applyActive();
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var band = b.getAttribute('data-band');
        if (band === state.band) return;
        state.band = band;
        try { localStorage.setItem(BAND_STORAGE_KEY, band); } catch (e) {}
        applyActive();
        renderOverviewTable();
        renderWeeks();
        renderStats();
      });
    });
  }

  async function init() {
    wireBandToggle();
    renderOverviewTable();
    renderWeeks();
    wireLogForm();
    try {
      var data = await api('', { method: 'GET' });
      if (data && data.success) {
        state = Object.assign(state, data);
        renderWeeks();
        renderLogs();
        renderStats();
      }
    } catch (e) {
      // Not logged in / offline — the static plan content above still
      // renders fine, just without saved progress.
      renderLogs();
    }
  }

  init();
})();
