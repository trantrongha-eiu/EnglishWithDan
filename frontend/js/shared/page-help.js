/* ══════════════════════════════════════════════════════════════════════
   page-help.js — the nav's Lulu button: a per-page "how to use this page"
   panel, presented by Lulu (the mascot from js/shared/playful.js).

   nav.js renders the #globalHelpBtn trigger on every page that has the
   global nav and only loads this file on the first click (the guide text
   is the bulk of it, and most visits never open it). Self-contained like
   onboarding-tour.js: builds its own DOM + <style>, no page markup needed.

   Content rule (same as onboarding-tour.js): describe only features that
   really exist on that page. When a page also has a step-by-step tour
   (window.EWSTour.has(page)), the panel offers to replay it, and a page can
   add its own extra buttons via `actions` (e.g. the vocab notebook's
   existing detailed-guide modal).
══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.PageHelp) return;

  // ── Which page are we on? Clean URLs (/reading/test/…, /vocabulary,
  // /writing/templates, …) are served from the .html file without changing
  // the address bar, so map them back to it. ─────────────────────────────
  var CLEAN_PREFIX = [
    [/^\/writing\/practice(\/|$)/, 'writing-practice.html'],
    [/^\/writing\/templates?(\/|$)/, 'task2-template.html'],
    [/^\/writing\/task1-course(\/|$)/, 'writing-task1.html'],
    [/^\/writing\/(task2-course|task2-foundations|advanced-sentences)(\/|$)/, 'writing-task2-course.html'],
    [/^\/writing(\/|$)/, 'writing.html'],
    [/^\/speaking\/course(\/|$)/, 'speaking-course.html'],
    [/^\/speaking(\/|$)/, 'speaking.html'],
    [/^\/reading(\/|$)/, 'reading.html'],
    [/^\/listening(\/|$)/, 'listening.html'],
    [/^\/(dashboard|vocabulary|vocab)(\/|$)/, 'dashboard.html'],
    [/^\/(entrance-test|test-dau-vao)(\/|$)/, 'entrance-test.html'],
    [/^\/essential-grammar(\/|$)/, 'essential-grammar.html'],
    [/^\/dictation(\/|$)/, 'dictation.html'],
    [/^\/shadowing(\/|$)/, 'shadowing.html'],
    [/^\/task2-practice(\/|$)/, 'task2-practice.html'],
    [/^\/profile(\/|$)/, 'profile.html'],
    [/^\/inbox(\/|$)/, 'inbox.html'],
    [/^\/tuition(\/|$)/, 'tuition.html'],
  ];
  function pageKey() {
    var path = location.pathname.replace(/\/+$/, '');
    var last = path.split('/').pop() || '';
    if (/\.html$/.test(last)) return last;
    for (var i = 0; i < CLEAN_PREFIX.length; i++) {
      if (CLEAN_PREFIX[i][0].test(path)) return CLEAN_PREFIX[i][1];
    }
    return '';
  }

  function kbd(k) { return '<kbd>' + k + '</kbd>'; }

  // Shared by Reading + Listening (same exam engine, same toolbar).
  var EXAM_MODES = {
    icon: '🎯', title: 'Luyện tập hay Test Simulation?',
    items: [
      'Trước khi bắt đầu, hệ thống hỏi bạn chọn chế độ. <b>Luyện tập</b>: được tra từ, dịch, không giám sát — để học và ôn.',
      '<b>Test Simulation</b>: giống thi thật, không tra từ/dịch, có giám sát. Rời màn hình hoặc chuyển tab = 1 gậy; <b>5 gậy</b> bài bị huỷ và khoá 5 phút. Trên máy tính phải chia sẻ toàn màn hình.',
      'Với Full đề, bạn có thể bấm <b>Chọn phần làm</b> để chỉ làm một vài phần thay vì cả đề.',
    ],
  };
  var REVIEW_AFTER = {
    icon: '🔍', title: 'Sau khi nộp bài',
    items: [
      'Xem điểm, đáp án đúng/sai và bấm <b>Xem giải thích chi tiết</b> để hiểu vì sao sai.',
      'Bấm <b>Làm lại</b> để làm lại các câu sai, hoặc <b>Lịch sử</b> để mở lại các bài cũ (vết bôi màu được lưu lại).',
      'Bài đang làm dở có thể mở lại bằng <b>Tiếp tục làm</b> ở đầu danh sách đề.',
    ],
  };

  // ── Per-page guides ─────────────────────────────────────────────────────
  // { title, intro, sections: [{ icon, title, items: [html] }], keys: [[key, what]],
  //   actions: [{ label, icon, run }] }
  var GUIDES = {
    'dashboard.html': {
      title: 'Sổ từ vựng & Vocab',
      intro: 'Nơi lưu và ôn từ vựng của bạn, kèm các bài học Paraphrase Cambridge và Vocab Topics.',
      sections: [
        { icon: '📒', title: 'Sổ từ vựng', items: [
          'Bạn có 5 sổ cố định (Sổ 1 – Sổ 5) — giáo viên giao bài theo số sổ. Mỗi sổ tối đa 500 từ.',
          'Thêm từ: bấm <b>+ Add word</b>, hoặc <b>Nhập hàng loạt</b> rồi dán danh sách dạng <code>word: nghĩa</code> — hệ thống tự tra ví dụ và phát âm.',
          'Khi làm Reading, Listening, Writing… <b>double-click vào một từ</b> để tra nghĩa và lưu thẳng vào sổ.',
          'Đánh dấu mức nhớ từng từ: <b>Not yet</b> → <b>So-so</b> → <b>Mastered</b>.',
        ] },
        { icon: '🧠', title: 'Các chế độ học', items: [
          '<b>Flashcard</b> (lật thẻ, tự đánh giá), <b>Quiz</b> (4 lựa chọn), <b>Listen</b> (nghe rồi gõ từ), <b>Translate</b> (nhìn nghĩa, gõ từ tiếng Anh), <b>Mixed</b> (trộn ngẫu nhiên).',
          '<b>Ôn lại từ hay sai</b> hiện ra khi sổ có từ bạn sai nhiều lần — luyện riêng những từ đó.',
        ] },
        { icon: '📚', title: 'Paraphrase & Vocab Topics', items: [
          'Mở từ menu <b>Vocab</b>: <b>Học Paraphrase</b> (cụm paraphrase trong đề Cambridge 15–20) và <b>Học Vocab Topics</b> (từ vựng theo chủ đề), học theo từng Unit.',
          'Học trọn 1 Paraphrase Unit đúng ≥ 90% để nhận <b>Búa Daniel</b> — dùng trong 3 ngày để khôi phục streak lỡ mất.',
        ] },
        { icon: '🔥', title: 'Streak', items: [
          'Luyện từ vựng, làm Reading hoặc Listening đúng ≥ 80% được +1 🔥, ≥ 90% được +2 🔥 (tối đa +5 🔥/ngày). Bỏ học trọn 1 ngày sẽ mất streak.',
        ] },
      ],
      actions: [{ label: 'Hướng dẫn chi tiết Sổ từ vựng', icon: 'fa-book-open', run: function () { if (typeof window.openGuideModal === 'function') window.openGuideModal(); }, when: function () { return typeof window.openGuideModal === 'function'; } }],
    },

    'reading.html': {
      title: 'Reading',
      intro: 'Luyện IELTS Reading với đề Full, bài lẻ từng passage và Reading Tips.',
      sections: [
        { icon: '🧭', title: 'Chọn chế độ', items: [
          '<b>Full đề</b>: 3 passages, 40 câu, 60 phút — tính band như thi thật.',
          '<b>Bài lẻ</b>: luyện riêng Passage 1, 2, 3 hoặc <b>Đề thật</b>.',
          '<b>Reading Tips</b>: chiến lược làm từng dạng câu hỏi, có bài tập đi kèm.',
          'Lọc <b>Đã làm / Chưa làm</b> và gõ tên đề vào ô tìm kiếm để tìm nhanh.',
        ] },
        EXAM_MODES,
        { icon: '🛠️', title: 'Công cụ khi làm bài', items: [
          '<b>Bôi màu</b>: bôi đậm từ khoá trong bài đọc và câu hỏi.',
          '<b>Tra từ</b> (chỉ ở chế độ Luyện tập / xem lại): bấm vào từ để xem nghĩa và lưu vào Sổ từ vựng.',
          '<b>Dịch</b>: bôi đen một đoạn rồi bấm Dịch để xem nghĩa tiếng Việt.',
          'Đổi cỡ chữ <b>S / M / L</b> trong phần cài đặt cho dễ đọc.',
        ] },
        REVIEW_AFTER,
      ],
      keys: [['H', 'Bật công cụ bôi màu'], ['D', 'Bật tra từ (Luyện tập / xem lại)'], ['T', 'Dịch đoạn đang bôi đen'], ['1 2 3', 'Chuyển Passage'], ['Esc', 'Tắt công cụ / đóng popup']],
    },

    'listening.html': {
      title: 'Listening',
      intro: 'Luyện IELTS Listening với đề Full, bài lẻ từng section và Listening Tips.',
      sections: [
        { icon: '🧭', title: 'Chọn chế độ', items: [
          '<b>Full đề</b>: 4 sections, 40 câu, khoảng 30 phút nghe — tính band như thi thật.',
          '<b>Bài lẻ</b>: luyện riêng Section 1–4 hoặc <b>Actual Tests</b>.',
          '<b>Listening Tips</b>: chiến lược nghe theo từng dạng câu hỏi.',
          'Muốn luyện nghe chi tiết từng câu? Vào <b>Listening → Dictation</b> trên menu.',
        ] },
        EXAM_MODES,
        { icon: '🎧', title: 'Khi làm bài', items: [
          'Trước mỗi phần có thời gian đọc câu hỏi — tranh thủ gạch chân từ khoá.',
          'Dùng <b>Bôi màu</b>, <b>Tra từ</b> (chỉ Luyện tập / xem lại) và <b>Dịch</b> giống trang Reading.',
          'Khi xem lại, transcript hiện bên cạnh để bạn đối chiếu chỗ nghe sai.',
        ] },
        REVIEW_AFTER,
      ],
      keys: [['H', 'Bật công cụ bôi màu'], ['D', 'Bật tra từ (Luyện tập / xem lại)'], ['T', 'Dịch đoạn đang bôi đen'], ['Esc', 'Tắt công cụ / đóng popup']],
    },

    'writing.html': {
      title: 'Writing',
      intro: 'Làm đề Writing Task 1 & Task 2, nhận chấm điểm và nhận xét, xem bài mẫu và tips.',
      sections: [
        { icon: '📝', title: 'Các lựa chọn', items: [
          '<b>Bắt đầu làm bài</b>: thi thử đầy đủ Task 1 + Task 2, đề ngẫu nhiên, 60 phút.',
          '<b>Luyện tập lẻ</b>: chọn đề Task 1 hoặc Task 2 để luyện riêng, có <b>Bài mẫu từ Daniel</b> và nút <b>Lưu nháp</b>.',
          '<b>Xem lịch sử</b>: điểm band và nhận xét của các bài đã nộp.',
          '<b>Tài liệu mẫu</b> (bài mẫu theo quý) và <b>Writing Tips</b> (chiến lược từng dạng bài).',
        ] },
        { icon: '⏱️', title: 'Khi viết bài', items: [
          'Bài được <b>tự động lưu</b> trong lúc viết — mất mạng hay lỡ đóng tab vẫn mở lại được bằng <b>Tiếp tục làm</b>.',
          'Ở chế độ luyện tập, bạn có thể double-click để tra từ và dùng ô <b>Tra từ vựng</b> (Việt ↔ Anh) để tìm cách diễn đạt.',
          'Chế độ Test Simulation có giám sát như thi thật: không tra từ, rời màn hình bị tính gậy.',
        ] },
        { icon: '✅', title: 'Sau khi nộp', items: [
          'AI chấm sơ bộ, sau đó giáo viên xác nhận và gửi feedback — trạng thái hiện là <b>Chờ chấm</b> / <b>Đã chấm</b>.',
          'Bài đã chấm có thể <b>Viết lại</b> dựa trên nhận xét, và tải về dạng .txt hoặc ảnh .png.',
        ] },
      ],
    },

    'writing-practice.html': {
      title: 'Viết câu giao tiếp',
      intro: 'Luyện viết câu tiếng Anh từ cơ bản theo chủ đề quen thuộc, tích XP và combo.',
      sections: [
        { icon: '🧭', title: 'Bắt đầu', items: [
          'Chọn <b>Luyện tập</b> (có gợi ý, phản hồi sau mỗi câu) hoặc <b>Thi thử</b> (bộ đề ngẫu nhiên, xem đáp án sau khi nộp).',
          'Chọn <b>Cấp độ</b>, <b>Chủ đề</b> và dạng bài ở thanh bên rồi bấm bắt đầu.',
        ] },
        { icon: '⚡', title: 'XP & combo', items: [
          'Trả lời đúng liên tiếp sẽ kích hoạt combo thưởng thêm XP.',
          'Số XP, streak và số bài làm hiện ở góc trên trang.',
        ] },
      ],
    },

    'task1-practice.html': {
      title: 'Task 1 Grammar',
      intro: 'Luyện ngữ pháp dùng trong Writing Task 1: noun phrase, mô tả số liệu, so sánh, xu hướng…',
      sections: [
        { icon: '🧭', title: 'Bắt đầu', items: [
          'Chọn <b>Luyện tập</b> (có gợi ý, phản hồi ngay) hoặc <b>Thi thử</b> (không gợi ý, giống thi thật).',
          'Chọn kỹ năng cụ thể ở thanh bên, hoặc <b>Tất cả</b> để luyện ngẫu nhiên, rồi bấm bắt đầu.',
        ] },
      ],
    },

    'task2-practice.html': {
      title: 'Task 2 Luyện đề tuần',
      intro: 'Mỗi tuần là một bộ câu hỏi Task 2 theo chủ đề + dạng bài cụ thể.',
      sections: [
        { icon: '📅', title: 'Cách học', items: [
          'Bấm vào một tuần để bắt đầu. Tiến độ được <b>tự động lưu</b> — lần sau mở lại sẽ học tiếp từ chỗ dừng.',
          'Muốn nghỉ giữa chừng, chọn <b>Thoát và lưu tiến độ</b> (chọn <b>Dừng lại</b> sẽ không lưu).',
          'Xem các tuần đã hoàn thành ở phần <b>Lịch sử</b>.',
        ] },
      ],
    },

    'task2-template.html': {
      title: 'Task 2 Templates',
      intro: 'Học thuộc mẫu câu (template) chuẩn cho 7 dạng bài Task 2.',
      sections: [
        { icon: '🧭', title: 'Bắt đầu', items: [
          'Chọn dạng bài (Discuss Both Views, Advantages/Disadvantages, Problem/Solution…), rồi chọn <b>Band 6+</b> hoặc <b>Band 7+</b>.',
          'Bấm <b>Xem đầy đủ</b> để đọc trọn bộ mẫu câu của dạng bài đó.',
        ] },
        { icon: '🧩', title: 'Các chế độ luyện', items: [
          '<b>Cloze</b>: điền từ còn thiếu vào mẫu câu.',
          '<b>Dịch câu</b>, <b>Chunks</b>, <b>Build</b> (ghép câu) và <b>Dictation</b> (nghe – chép) để nhớ chắc hơn.',
          '<b>Thi thử</b>: tự kiểm tra không có gợi ý. Xem lại kết quả ở <b>Lịch sử</b>.',
        ] },
      ],
    },

    'writing-task1.html': {
      title: 'Khóa học Task 1 Writing',
      intro: 'Khóa học theo lộ trình: 5 module, 22 buổi học + 5 bài kiểm tra — biểu đồ, bản đồ và quy trình.',
      sections: [
        { icon: '🗺️', title: 'Cách học', items: [
          'Học theo thứ tự <b>Module → Buổi học → Bài tập</b>. Mỗi buổi có phần lý thuyết, cụm từ quan trọng và bài tập.',
          'Buổi sau chỉ <b>mở khoá</b> khi bạn hoàn thành buổi trước đạt yêu cầu điểm (hoặc nhập mã do giáo viên cấp).',
          '<b>Bài kiểm tra</b> cuối module cần <b>mã mở khoá</b> từ giáo viên.',
          'Double-click vào từ để tra nghĩa và lưu vào Sổ từ vựng.',
        ] },
      ],
    },

    'writing-task2-course.html': {
      title: 'Khóa học Task 2 Writing',
      intro: 'Khóa học Task 2 theo lộ trình module, từ nền tảng đến 7 dạng đề.',
      sections: [
        { icon: '🗺️', title: 'Cách học', items: [
          'Học theo thứ tự <b>Module → Buổi học → Bài tập</b>; buổi sau mở khoá khi buổi trước đạt yêu cầu điểm (hoặc có mã của giáo viên).',
          '<b>Bài kiểm tra</b> cần <b>mã mở khoá</b> do giáo viên cấp.',
          'Các buổi về 7 dạng đề có liên kết sang <b>Task 2 Templates</b> để luyện thêm mẫu câu của dạng đó.',
        ] },
      ],
    },

    'task2-foundations.html': {
      title: 'Task 2 — Nền tảng',
      intro: 'Tài liệu nền tảng Task 2: tiêu chí chấm, khác biệt Band 6 – 7, 12 cấu trúc câu và các lỗi hay mất điểm.',
      sections: [
        { icon: '📖', title: 'Cách đọc', items: [
          'Bấm vào từng mục để mở ra đọc. Nên đọc lần lượt từ A1 → A4 rồi tới 12 cấu trúc câu.',
          'Dùng <b>Checklist ba phút cuối giờ</b> để tự soát bài trước khi nộp.',
        ] },
      ],
    },

    'advanced-sentences.html': {
      title: 'Câu nâng cao Task 2',
      intro: 'Luyện các cấu trúc câu nâng band cho Task 2 theo tuần.',
      sections: [
        { icon: '📅', title: 'Cách học', items: [
          'Chọn tuần, rồi chọn nhóm câu để luyện.',
          'Muốn nghỉ giữa chừng, chọn <b>Thoát & lưu tiến độ</b> để lần sau học tiếp.',
        ] },
      ],
    },

    'essential-grammar.html': {
      title: 'Essential Grammar',
      intro: 'Các bài ngữ pháp thiết yếu cho IELTS, chia theo chủ đề, mỗi bài có lý thuyết + bài tập.',
      sections: [
        { icon: '📚', title: 'Cách học', items: [
          'Chọn bài ở danh sách bên trái (trên điện thoại: bấm nút danh sách ở góc dưới). Gõ vào ô tìm kiếm để tìm nhanh.',
          'Đọc lý thuyết rồi làm bài tập: trắc nghiệm, điền từ, sửa lỗi, dịch câu, viết lại câu…',
          'Đạt từ <b>80%</b> trở lên thì bài được tính là hoàn thành. Trang nhớ bài bạn học gần nhất.',
        ] },
      ],
    },

    'speaking.html': {
      title: 'Speaking',
      intro: 'Luyện Speaking theo bộ đề forecast: ghi âm câu trả lời và nhận phân tích từ AI.',
      sections: [
        { icon: '🎤', title: 'Luyện tập', items: [
          'Chọn <b>Part 1 / 2 / 3</b>, nhóm chủ đề và chủ đề — hoặc bấm <b>Random</b>.',
          'Bấm ghi âm và trả lời. Xong bấm <b>Phân tích với Gemini AI</b> để nhận chấm điểm và góp ý.',
          'Cần ý tưởng? Bấm <b>Hints</b>, <b>Sample Answer</b> hoặc <b>Xem bản Band 7-8</b>.',
          'Part 2: có thời gian chuẩn bị và ô ghi chú ý — bấm <b>Bỏ qua — Bắt đầu nói ngay</b> nếu đã sẵn sàng.',
        ] },
        { icon: '🎯', title: 'Khác', items: [
          '<b>Thi thử đầy đủ</b>: Part 1, 2, 3 với đề ngẫu nhiên, AI chấm toàn bài.',
          '<b>Lịch sử</b>, <b>Tài liệu</b> và <b>Speaking Tips</b> nằm ngay trên trang này.',
          'Hãy cho phép trình duyệt dùng <b>micro</b>. Nếu trình duyệt không nhận dạng giọng nói (hay gặp trên Brave/Firefox), bản ghi âm vẫn được lưu — bạn gõ lại lời thoại vào ô Transcript.',
        ] },
      ],
    },

    'speaking-course.html': {
      title: 'Khóa học Speaking',
      intro: 'Khóa học Speaking theo lộ trình module: học lý thuyết, ghi âm trả lời và nhận band điểm từ AI.',
      sections: [
        { icon: '🗺️', title: 'Cách học', items: [
          'Học theo thứ tự <b>Module → Buổi học → Bài tập</b>; buổi sau mở khoá khi buổi trước đạt yêu cầu (hoặc có mã của giáo viên).',
          'Bài nói: có đếm ngược chuẩn bị, rồi bấm micro để ghi âm. Thanh độ dài gợi ý thời lượng nên nói (Part 1: 15–25 giây, Part 2: 1 phút 30 – 2 phút, Part 3: 45–90 giây).',
          'Nếu trình duyệt không tự chép lời, hãy gõ lại câu trả lời vào ô transcript trước khi nộp.',
          '<b>Bài kiểm tra</b> cần <b>mã mở khoá</b> từ giáo viên.',
        ] },
      ],
    },

    'dictation.html': {
      title: 'Dictation',
      intro: 'Nghe từng câu trong bài Listening và gõ lại chính xác những gì bạn nghe được.',
      sections: [
        { icon: '⌨️', title: 'Cách luyện', items: [
          'Chọn một bài, bấm ▶ để nghe câu hiện tại — nghe lại bao nhiêu lần cũng được.',
          'Gõ câu vào ô rồi bấm <b>Kiểm tra</b> (hoặc Enter). Từ đúng/sai được tô màu để bạn sửa.',
          'Đổi tốc độ phát bằng nút <b>1x</b>; bấm <b>Làm lại</b> để làm lại câu đó.',
          'Không dán văn bản vào ô được — hãy nghe và tự gõ.',
        ] },
      ],
      keys: [['Enter', 'Kiểm tra câu']],
    },

    'shadowing.html': {
      title: 'Shadowing',
      intro: 'Luyện nghe – nói theo video YouTube: mở bài nào cũng được chọn 1 trong 3 chế độ — Xem video (có phụ đề), Shadowing (nói theo từng câu) hoặc Dictation (gõ lại).',
      sections: [
        { icon: '🎬', title: 'Chọn bài', items: [
          'Lọc theo chủ đề (Speaking Part 1–3, Truyện kể BBC, BBC 6 Minute English, TED, Everyday English…) và trình độ A2 – C2.',
          'Mẹo: xem <b>1 video nhiều lần</b> hiệu quả hơn xem nhiều video 1 lần.',
        ] },
        { icon: '📺', title: 'Xem video', items: [
          'Video chạy liền mạch từ đầu đến cuối, phụ đề Anh – Việt hiện ngay trên video. Bấm <b>Tạm dừng</b> / <b>Space</b> khi muốn dừng.',
          'Bấm một câu trong transcript để xem từ câu đó. Tắt <b>Phụ đề trên video</b> hoặc <b>Hiện tiếng Việt</b> nếu muốn thử thách.',
        ] },
        { icon: '🗣️', title: 'Shadowing', items: [
          'Video tự dừng sau mỗi câu. Bấm <b>Nói theo</b> để ghi âm, hệ thống so từng từ với câu gốc. Bấm <b>Câu tiếp</b> (hoặc →) là phát luôn câu sau.',
          'Bấm <b>Giọng của tôi</b> để nghe lại và so với bản gốc.',
          'Tuỳ chọn: <b>Tự ghi âm sau khi nghe xong</b>, <b>Ẩn câu</b> (thử thách), <b>Hiện tiếng Việt</b>.',
          '<b>Phát liên tục</b> để xem video chạy tiếp, transcript tự chạy theo.',
        ] },
        { icon: '⌨️', title: 'Dictation', items: [
          'Nghe câu, gõ lại, bấm <b>Kiểm tra</b> rồi <b>Câu tiếp</b>. Chép đúng cả câu sẽ hiện nghĩa tiếng Việt. Bí thì bấm <b>Hỏi Lulu</b>.',
        ] },
      ],
      keys: [['Space', 'Phát / dừng câu hiện tại (Xem video: xem / tạm dừng)'], ['← →', 'Câu trước / câu sau (tự phát)'], ['1 2 3', 'Chọn chế độ khi vừa mở bài'], ['R', 'Bắt đầu / dừng ghi âm (Shadowing)'], ['Ctrl + Space', 'Phát câu khi đang gõ'], ['Enter', 'Kiểm tra / sang câu tiếp (Dictation)']],
    },

    'reading-listening-strategy.html': {
      title: 'Chiến lược luyện đề',
      intro: 'Bài hướng dẫn cách luyện đề Reading & Listening hiệu quả và lộ trình 7 tuần trước kỳ thi.',
      sections: [
        { icon: '📖', title: 'Cách dùng', items: [
          'Mở <b>Mục lục</b> để nhảy nhanh tới phần cần đọc.',
          'Ở phần lộ trình, chọn <b>Mục tiêu Band 6.0</b> hoặc <b>Band 7.0+</b> để xem kế hoạch phù hợp.',
          'Cuối bài có <b>Tóm tắt cực ngắn</b> để xem lại nhanh.',
        ] },
      ],
    },

    'goal.html': {
      title: 'Mục tiêu & Kế hoạch',
      intro: 'Đặt mục tiêu IELTS để hệ thống gợi ý kế hoạch học mỗi ngày và mỗi tuần.',
      sections: [
        { icon: '🎯', title: 'Đặt mục tiêu', items: [
          'Điền band hiện tại (không bắt buộc), <b>band mục tiêu</b>, <b>ngày thi</b>, số phút học mỗi tuần, mỗi buổi và chọn <b>các ngày học</b> trong tuần.',
          'Bấm <b>Lưu mục tiêu</b>. Có thể sửa lại bất cứ lúc nào.',
        ] },
        { icon: '📅', title: 'Theo dõi', items: [
          '<b>Học hôm nay</b> và <b>Kế hoạch học tuần này</b> được tạo từ mục tiêu của bạn — làm theo từng mục để bám lộ trình.',
        ] },
      ],
    },

    'mock-test.html': {
      title: 'Full Mock Test',
      intro: 'Thi thử đầy đủ 4 kỹ năng IELTS với đề ngẫu nhiên, có giám sát.',
      sections: [
        { icon: '🧭', title: 'Cách thi', items: [
          'Bấm <b>Bắt đầu thi thử</b>. Listening → Reading → Writing làm liền mạch, Speaking làm sau.',
          'Xem các lần thi trước ở <b>Lịch sử thi thử</b>.',
        ] },
        { icon: '🚨', title: 'Quy định giám sát', items: [
          'Rời màn hình, chuyển tab/cửa sổ, đóng hoặc tải lại trang = <b>1 gậy</b>. Đủ <b>5 gậy</b> lượt thi bị huỷ và phải chờ khoảng 5 phút.',
          'Trên máy tính phải chia sẻ toàn màn hình trước mỗi kỹ năng; mỗi lần vi phạm hệ thống chụp 1 ảnh gửi giáo viên.',
          'Đừng bấm <b>Ẩn</b> / <b>Dừng chia sẻ</b> trên thanh chia sẻ màn hình trong lúc làm bài.',
        ] },
      ],
    },

    'entrance-test.html': {
      title: 'Test đầu vào',
      intro: 'Bài kiểm tra đầu vào giúp giáo viên đánh giá trình độ của bạn.',
      sections: [
        { icon: '🧭', title: 'Cách làm', items: [
          'Điền <b>Thông tin thí sinh</b>, bấm <b>Tiếp tục</b> rồi <b>Bắt đầu làm bài</b>.',
          'Bài gồm nhiều phần, mỗi phần có thời gian riêng. Làm xong bấm <b>Nộp phần này</b>; hết giờ hệ thống tự nộp.',
          'Bài có giám sát: không rời màn hình hay chuyển tab trong lúc làm.',
          'Làm xong bạn xem được trang <b>Kết quả</b>.',
        ] },
      ],
    },

    'review-history.html': {
      title: 'Lịch sử Review',
      intro: 'Tổng hợp các lỗi sai của bạn để ôn lại.',
      sections: [
        { icon: '📝', title: 'Cách dùng', items: [
          '<b>My Mistakes</b>: các câu sai trong bài Reading/Listening (Full test và Practice). Lọc theo loại bài, khoảng ngày và loại lỗi.',
          '<b>Thi thử Full test</b>: kết quả các lượt Full Mock Test.',
          'Dùng nút <b>← Trước</b> / <b>Sau →</b> để chuyển trang.',
        ] },
      ],
    },

    'profile.html': {
      title: 'Trang cá nhân',
      intro: 'Thông tin tài khoản, thành tích và đồ đã mua của bạn.',
      sections: [
        { icon: '🗂️', title: 'Các tab', items: [
          '<b>Tổng quan</b>: streak, huy hiệu và điểm các bài đã làm.',
          '<b>Chỉnh sửa</b>: họ tên, giới thiệu, motto, band mục tiêu, ngày thi, màu chủ đề — nhớ bấm <b>Lưu thay đổi</b>.',
          '<b>Bảo mật</b>: đổi mật khẩu.',
          '<b>Lịch sử</b>: các bài đã làm.',
          '<b>Kho đồ</b>: đồ mua ở Cửa hàng lửa — <b>Dùng</b> vật phẩm, dắt linh thú đi dạo, dùng Búa Daniel. Bán lại được hoàn một nửa giá.',
        ] },
      ],
    },

    'inbox.html': {
      title: 'Hộp thư',
      intro: 'Thông báo và tin nhắn từ giáo viên và hệ thống.',
      sections: [
        { icon: '✉️', title: 'Cách dùng', items: [
          'Bấm vào một tin để đọc nội dung đầy đủ. Số tin chưa đọc hiện trên biểu tượng phong bì ở thanh menu.',
          'Kéo xuống cuối danh sách để tải thêm tin cũ.',
        ] },
      ],
    },

    'tuition.html': {
      title: 'Học phí',
      intro: 'Xem các khoản học phí và báo đã chuyển khoản.',
      sections: [
        { icon: '💸', title: 'Cách đóng học phí', items: [
          'Chuyển khoản theo <b>Thông tin chuyển khoản</b> trên trang.',
          'Sau khi chuyển, bấm <b>💸 Đã chuyển khoản</b> ở khoản tương ứng — trạng thái chuyển sang <b>⏳ Đang xác nhận</b>.',
          'Khi giáo viên xác nhận, khoản đó hiện <b>✅ Đã đóng</b>. Bấm <b>Xem học phí đã đóng</b> để xem lại các khoản cũ.',
        ] },
      ],
    },

    'vocab-leaderboard.html': {
      title: 'Bảng xếp hạng',
      intro: 'Top 10 streak và Top 10 bài Vocab Lesson của cả lớp.',
      sections: [
        { icon: '🏆', title: 'Cách xem', items: [
          'Ô <b>Vị trí của bạn</b> cho biết hạng hiện tại của bạn ở mỗi bảng.',
          'Bấm vào tên một bạn để xem hồ sơ, nhắn tin hoặc báo cáo.',
          'Có bánh kem 🎂 từ Cửa hàng lửa? Bấm nút 🎂 cạnh tên để "úp bánh" vui một bạn.',
        ] },
      ],
    },

    'shop.html': {
      title: 'Cửa hàng lửa',
      intro: 'Dùng 🔥 kiếm được khi học để mua vật phẩm và linh thú.',
      sections: [
        { icon: '🔥', title: 'Ví lửa', items: [
          'Mỗi 🔥 bạn kiếm được khi học được cộng vào cả <b>chuỗi streak</b> lẫn <b>ví lửa</b>.',
          'Mua sắm chỉ trừ <b>ví</b> — streak và hạng trên bảng xếp hạng vẫn giữ nguyên.',
        ] },
        { icon: '🛍️', title: 'Mua & dùng', items: [
          'Chọn <b>Vật phẩm đua top</b>, <b>Linh thú</b> hoặc <b>Vĩ thú</b> rồi bấm mua.',
          'Đồ đã mua nằm trong <b>Trang cá nhân → Kho đồ</b>: dùng vật phẩm, dắt linh thú đi dạo, hoặc bán lại (hoàn một nửa giá).',
        ] },
      ],
    },
  };

  // Shown under every page's own guide.
  var COMMON = {
    icon: '💡', title: 'Mẹo dùng trên mọi trang',
    items: [
      'Bôi đen một câu (từ 4 từ trở lên) → bấm biểu tượng nhỏ hiện ra để <b>dịch cả câu</b>.',
      'Ở các trang bài học, <b>double-click một từ</b> để tra nghĩa và lưu vào Sổ từ vựng.',
      'Nút <i class="fas fa-gear"></i> <b>Tiện ích</b> trên thanh menu: bật/tắt âm thanh, giao diện tối/sáng, đổi ngôn ngữ VI/EN.',
      'Bấm <i class="fas fa-search"></i> để tìm nhanh đề Reading, Listening, bài học từ vựng.',
    ],
  };
  var GENERIC = {
    title: 'EnglishWithDan',
    intro: 'Dùng menu phía trên để vào từng kỹ năng: Reading, Listening, Writing, Speaking, Vocab và Mocktest. Trên điện thoại, bấm ☰ để mở menu.',
    sections: [],
  };

  // ── Panel ───────────────────────────────────────────────────────────────
  var overlay = null, lastFocus = null, prevOverflow = '';

  function injectStyle() {
    if (document.getElementById('ews-help-style')) return;
    var s = document.createElement('style');
    s.id = 'ews-help-style';
    s.textContent = [
      '#ews-help-overlay{position:fixed;inset:0;z-index:9500;background:rgba(15,23,42,.45);display:flex;justify-content:flex-end;opacity:0;transition:opacity .18s ease;}',
      '#ews-help-overlay.open{opacity:1;}',
      '#ews-help-panel{--h-bg:#fff;--h-text:#111827;--h-muted:#6b7280;--h-soft:#f3f4f6;--h-border:#e5e7eb;--h-accent:#6366f1;',
        'background:var(--h-bg);color:var(--h-text);width:min(440px,100vw);height:100%;display:flex;flex-direction:column;',
        'box-shadow:-16px 0 48px rgba(0,0,0,.18);transform:translateX(24px);transition:transform .2s ease;font-family:inherit;}',
      '#ews-help-overlay.open #ews-help-panel{transform:none;}',
      '[data-theme="dark"] #ews-help-panel{--h-bg:#1a1b26;--h-text:#e5e7eb;--h-muted:#9ca3af;--h-soft:#24263a;--h-border:#2f3247;--h-accent:#a5b4fc;}',
      '.ews-help-head{display:flex;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid var(--h-border);}',
      '.ews-help-head h2{margin:0;font-size:17px;line-height:1.3;color:var(--h-text);}',
      '.ews-help-lulu{display:flex;align-items:flex-end;gap:10px;margin:0 0 16px;}',
      '.ews-help-lulu-pic{width:72px;flex-shrink:0;}',
      '.ews-help-lulu-pic .dan-svg{width:100%;height:auto;display:block;}',
      '.ews-help-bubble{position:relative;margin:0 0 14px;padding:10px 14px;border-radius:14px 14px 14px 4px;background:var(--h-soft);border:1px solid var(--h-border);color:var(--h-text);}',
      '.ews-help-bubble::before{content:"";position:absolute;left:-7px;bottom:10px;width:12px;height:12px;background:var(--h-soft);border-left:1px solid var(--h-border);border-bottom:1px solid var(--h-border);transform:rotate(45deg);}',
      '.ews-help-head small{display:block;font-size:12px;color:var(--h-muted);font-weight:500;}',
      '.ews-help-close{margin-left:auto;width:34px;height:34px;border-radius:50%;border:none;background:var(--h-soft);color:var(--h-text);cursor:pointer;font-size:18px;line-height:1;}',
      '.ews-help-close:hover{filter:brightness(.95);}',
      '.ews-help-body{flex:1;overflow-y:auto;padding:16px 20px 8px;font-size:14px;line-height:1.6;}',
      '.ews-help-intro{margin:0 0 14px;color:var(--h-muted);}',
      '.ews-help-sec{margin:0 0 16px;}',
      '.ews-help-sec h3{margin:0 0 6px;font-size:14.5px;color:var(--h-text);}',
      '.ews-help-sec ul{margin:0;padding-left:20px;}',
      '.ews-help-sec li{margin:0 0 6px;}',
      '.ews-help-sec code{background:var(--h-soft);padding:1px 5px;border-radius:5px;font-size:12.5px;}',
      '.ews-help-keys{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;align-items:center;}',
      '.ews-help-keys kbd{display:inline-block;min-width:22px;text-align:center;padding:2px 7px;border-radius:6px;border:1px solid var(--h-border);border-bottom-width:2px;background:var(--h-soft);font:600 12px/1.5 ui-monospace,Consolas,monospace;color:var(--h-text);white-space:nowrap;}',
      '.ews-help-common{margin:4px 0 16px;border:1px solid var(--h-border);border-radius:12px;padding:10px 14px;}',
      '.ews-help-common summary{cursor:pointer;font-weight:600;}',
      '.ews-help-common ul{margin:8px 0 0;padding-left:20px;}',
      '.ews-help-common li{margin:0 0 6px;}',
      '.ews-help-foot{display:flex;flex-wrap:wrap;gap:8px;padding:14px 20px calc(14px + env(safe-area-inset-bottom));border-top:1px solid var(--h-border);}',
      '.ews-help-foot button{flex:1 1 auto;min-height:40px;padding:8px 14px;border-radius:10px;font:600 14px/1.2 inherit;font-family:inherit;cursor:pointer;border:1px solid var(--h-border);background:var(--h-soft);color:var(--h-text);}',
      '.ews-help-foot .ews-help-primary{background:var(--h-accent);border-color:var(--h-accent);color:#fff;}',
      '[data-theme="dark"] .ews-help-foot .ews-help-primary{color:#1a1b26;}',
      '@media (max-width:600px){',
        '#ews-help-overlay{align-items:flex-end;}',
        '#ews-help-panel{width:100%;height:auto;max-height:88vh;border-radius:18px 18px 0 0;transform:translateY(24px);box-shadow:0 -12px 40px rgba(0,0,0,.2);}',
        '.ews-help-head{padding:16px;} .ews-help-body{padding:14px 16px 6px;} .ews-help-foot{padding-left:16px;padding-right:16px;}',
      '}',
      '@media (prefers-reduced-motion:reduce){#ews-help-overlay,#ews-help-panel{transition:none;}}',
    ].join('');
    document.head.appendChild(s);
  }

  function sectionHtml(sec) {
    return '<section class="ews-help-sec"><h3>' + sec.icon + ' ' + sec.title + '</h3><ul>' +
      sec.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') + '</ul></section>';
  }

  function luluLine(g) {
    return 'Chào bạn, tớ là <b>Lulu</b>! 🍊 ' + (g.intro || '') + ' Xem cách dùng ở dưới nhé!';
  }

  function hasTour(key) {
    return !!(key && window.EWSTour && typeof window.EWSTour.has === 'function' && window.EWSTour.has(key));
  }

  function build(key) {
    var g = GUIDES[key] || GENERIC;
    var html =
      '<div id="ews-help-panel" role="dialog" aria-modal="true" aria-labelledby="ews-help-title">' +
        '<div class="ews-help-head">' +
          '<h2 id="ews-help-title"><small>Lulu hướng dẫn</small>' + g.title + '</h2>' +
          '<button type="button" class="ews-help-close" data-help-close aria-label="Đóng hướng dẫn">×</button>' +
        '</div>' +
        '<div class="ews-help-body">' +
          // Lulu (js/shared/playful.js) introduces the page in a speech
          // bubble; a plain paragraph if the mascot isn't loaded.
          (window.Mascot && window.Mascot.svg
            ? '<div class="ews-help-lulu">' +
                '<div class="ews-help-lulu-pic" aria-hidden="true">' + window.Mascot.svg('excited', { label: 'Lulu' }) + '</div>' +
                '<p class="ews-help-bubble">' + luluLine(g) + '</p>' +
              '</div>'
            : (g.intro ? '<p class="ews-help-intro">' + g.intro + '</p>' : '')) +
          g.sections.map(sectionHtml).join('') +
          (g.keys && g.keys.length
            ? '<section class="ews-help-sec"><h3>⌨️ Phím tắt (máy tính)</h3><div class="ews-help-keys">' +
                g.keys.map(function (k) {
                  return '<span>' + k[0].split(' ').map(kbd).join(' ') + '</span><span>' + k[1] + '</span>';
                }).join('') +
              '</div></section>'
            : '') +
          '<details class="ews-help-common"><summary>' + COMMON.icon + ' ' + COMMON.title + '</summary><ul>' +
            COMMON.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') +
          '</ul></details>' +
        '</div>' +
        '<div class="ews-help-foot" id="ews-help-foot"></div>' +
      '</div>';

    overlay = document.createElement('div');
    overlay.id = 'ews-help-overlay';
    overlay.innerHTML = html;
    // Translated by i18n.js like the rest of the page — the guide copy is
    // Vietnamese source text, same as every other UI string.
    document.body.appendChild(overlay);

    var foot = overlay.querySelector('#ews-help-foot');
    function addBtn(label, primary, onClick) {
      var b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = label;
      if (primary) b.className = 'ews-help-primary';
      b.addEventListener('click', onClick);
      foot.appendChild(b);
    }
    if (hasTour(key)) {
      addBtn('<i class="fas fa-route"></i> Xem hướng dẫn từng bước', false, function () {
        close();
        window.EWSTour.start(key);
      });
    }
    (g.actions || []).forEach(function (a) {
      if (a.when && !a.when()) return;
      addBtn('<i class="fas ' + a.icon + '"></i> ' + a.label, false, function () { close(); a.run(); });
    });
    addBtn('Đã hiểu', true, close);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('[data-help-close]')) close();
    });
  }

  function onKey(e) {
    if (!overlay) return;
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key !== 'Tab') return;
    // Keep Tab inside the panel while it's open.
    var f = overlay.querySelectorAll('button, summary, a[href], [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open() {
    if (overlay) return;
    injectStyle();
    lastFocus = document.activeElement;
    build(pageKey());
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey, true);
    requestAnimationFrame(function () {
      if (!overlay) return;
      overlay.classList.add('open');
      var c = overlay.querySelector('.ews-help-close');
      if (c) c.focus();
    });
  }

  function close() {
    if (!overlay) return;
    var el = overlay;
    overlay = null;
    document.removeEventListener('keydown', onKey, true);
    document.body.style.overflow = prevOverflow;
    el.classList.remove('open');
    setTimeout(function () { el.remove(); }, 200);
    if (lastFocus && typeof lastFocus.focus === 'function') { try { lastFocus.focus(); } catch (e) {} }
  }

  window.PageHelp = { open: open, close: close, pageKey: pageKey };
})();
