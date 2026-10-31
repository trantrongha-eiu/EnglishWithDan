/* ══════════════════════════════════════════════════════════════════════
   SynonymPrompt — staff-only "Copy prompt" button on Listening/Reading
   test cards (full tests + single parts / passages).

   One click copies a ready-to-paste AI prompt: instructions to list every
   synonym / paraphrase pair between the questions and the passage /
   transcript (format "word : paraphrase/synonyms"), followed by the full
   passage/transcript and all questions with their correct answers.

   Data comes from the existing admin endpoints (auth + teacherOnly on the
   server), so the button is only rendered for admin/teacher accounts and
   the server refuses everyone else anyway.

   Kinds:
     ls-test     ListeningTest       GET /admin/listening/tests/:id
     ls-section  ListeningSection    GET /admin/listening/sections/:id
     rd-test     ReadingTest         GET /admin/tests/:id → its passageIds
     rd-passage  Passage             GET /admin/passages/:id
══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var _cache = {};

  function isStaff() {
    try { return !!(window.AuthService && window.AuthService.isStaff && window.AuthService.isStaff()); }
    catch (e) { return false; }
  }

  function api() { return (window.AuthService && window.AuthService.API) || 'https://englishwithdan.onrender.com/api'; }

  function getJson(path) {
    var headers = (window.AuthService && window.AuthService.authHeader) ? window.AuthService.authHeader() : {};
    return fetch(api() + path, { headers: headers }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok || data.success === false) throw new Error(data.message || ('HTTP ' + res.status));
        return data;
      });
    });
  }

  // ── text helpers ──────────────────────────────────────────────────────
  function blanks(s) { return String(s || '').replace(/__Q(\d+)__/g, '($1) ________'); }

  function htmlToText(html) {
    var s = blanks(html);
    if (!s) return '';
    if (!/[<&]/.test(s)) return s.trim();
    var doc = new DOMParser().parseFromString('<div>' + s + '</div>', 'text/html');
    doc.querySelectorAll('br').forEach(function (b) { b.replaceWith('\n'); });
    doc.querySelectorAll('li').forEach(function (el) { el.prepend('- '); });
    doc.querySelectorAll('td,th').forEach(function (el) { el.append(' | '); });
    doc.querySelectorAll('p,div,h1,h2,h3,h4,h5,h6,li,tr,blockquote,section').forEach(function (el) { el.append('\n'); });
    return (doc.body.textContent || '')
      .replace(/ /g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function stripLetter(opt) { return String(opt || '').replace(/^\s*[A-Za-z][.)]\s*/, '').trim() || String(opt || ''); }

  function letteredList(items) {
    return (items || []).filter(Boolean).map(function (o, i) {
      return '   ' + (LETTERS[i] || '?') + '. ' + htmlToText(stripLetter(o));
    }).join('\n');
  }

  // questionText of template-based groups is often a placeholder like
  // "Question 37" / "Q1" — the real sentence lives in the group's config.
  function isPlaceholderText(t) { return !t || /^\s*(q|question|câu)?\s*\d+\s*$/i.test(t); }

  // Matching-information options are often just the paragraph letters.
  function optionList(items) {
    var xs = (items || []).filter(Boolean).map(function (o) { return htmlToText(o); });
    if (xs.length && xs.every(function (x) { return x.length <= 4; })) return '   Options: ' + xs.join(', ');
    return letteredList(items);
  }

  // ── question groups → plain text ─────────────────────────────────────
  function groupToText(g) {
    var out = [];
    if (g.groupTitle) out.push(htmlToText(g.groupTitle));
    if (g.instruction) out.push(htmlToText(g.instruction));

    var tc = g.tableConfig;
    if (tc && ((tc.headers && tc.headers.length) || (tc.rows && tc.rows.length))) {
      if (tc.headers && tc.headers.length) out.push('| ' + tc.headers.map(htmlToText).join(' | ') + ' |');
      (tc.rows || []).forEach(function (r) { out.push('| ' + (r || []).map(htmlToText).join(' | ') + ' |'); });
    }
    var nc = g.noteConfig;
    if (nc && ((nc.lines && nc.lines.length) || nc.title)) {
      if (nc.title) out.push(htmlToText(nc.title));
      (nc.lines || []).forEach(function (l) { out.push(htmlToText(l)); });
    }
    var bc = g.bulletConfig;
    if (bc && bc.items && bc.items.length) bc.items.forEach(function (it) { out.push('- ' + htmlToText(it)); });

    var sc = g.summaryConfig;
    if (sc && (sc.text || (sc.wordBank && sc.wordBank.length))) {
      if (sc.text) out.push(htmlToText(sc.text));
      if (sc.wordBank && sc.wordBank.length) {
        out.push('Word bank:');
        sc.wordBank.forEach(function (w, i) { out.push('   ' + (w.letter || LETTERS[i]) + '. ' + htmlToText(w.word)); });
      }
    }
    var dd = g.dragDropConfig;
    if (dd && (dd.text || (dd.words && dd.words.length))) {
      if (dd.text) out.push(htmlToText(dd.text));
      if (dd.words && dd.words.length) out.push('Options: ' + dd.words.map(htmlToText).join(' / '));
    }
    var hc = g.headingsConfig;
    if (hc && hc.headings && hc.headings.length) {
      out.push('List of headings:');
      hc.headings.forEach(function (h) { out.push('   ' + (h.numeral || '') + '. ' + htmlToText(h.text)); });
    }
    if (g.matchingOptions && g.matchingOptions.length) {
      if (g.matchingOptionsTitle) out.push(htmlToText(g.matchingOptionsTitle));
      out.push(optionList(g.matchingOptions));
    }
    var ec = g.endingsConfig;
    if (ec && ec.endings && ec.endings.length) {
      out.push('Endings:');
      ec.endings.forEach(function (e, i) { out.push('   ' + (e.letter || LETTERS[i]) + '. ' + htmlToText(e.text)); });
    }
    if (g.groupType === 'map' || g.imageUrl) out.push('[Có hình map/diagram — không kèm trong bản copy]');

    (g.questions || []).forEach(function (q) {
      var txt = htmlToText(q.questionText);
      var ans = q.correctAnswer ? '→ Đáp án: ' + htmlToText(q.correctAnswer) : '';
      if (isPlaceholderText(txt)) { out.push(q.questionNumber + '. ' + ans); return; }
      out.push(q.questionNumber + '. ' + txt);
      if (q.options && q.options.length) out.push(optionList(q.options));
      if (q.wordBank && q.wordBank.length) out.push('   Word bank: ' + q.wordBank.map(htmlToText).join(' / '));
      if (ans) out.push('   ' + ans);
    });
    return out.filter(function (s) { return s && String(s).trim(); }).join('\n');
  }

  function groupsOf(doc) {
    if (doc.questionGroups && doc.questionGroups.length) return doc.questionGroups;
    // Legacy passages: a flat questions[] with the group fields on the doc.
    if (doc.questions && doc.questions.length) {
      return [{
        instruction: doc.instruction, tableConfig: doc.tableConfig, noteConfig: doc.noteConfig,
        bulletConfig: doc.bulletConfig, questions: doc.questions,
      }];
    }
    return [];
  }

  function questionsText(doc) {
    var gs = groupsOf(doc);
    if (!gs.length) return '(Chưa có câu hỏi)';
    return gs.map(groupToText).join('\n\n');
  }

  function rangeLabel(doc) {
    var r = doc.questionRange;
    if (r && r.start && r.end) return 'QUESTIONS ' + r.start + '–' + r.end;
    var nums = [];
    groupsOf(doc).forEach(function (g) { (g.questions || []).forEach(function (q) { nums.push(q.questionNumber); }); });
    if (!nums.length) return 'QUESTIONS';
    return 'QUESTIONS ' + Math.min.apply(null, nums) + '–' + Math.max.apply(null, nums);
  }

  // ── prompt ────────────────────────────────────────────────────────────
  function buildPrompt(skill, title) {
    var src = skill === 'listening' ? 'transcript' : 'passage';
    return [
      'Bạn là giáo viên IELTS ' + (skill === 'listening' ? 'Listening' : 'Reading') + ' giàu kinh nghiệm. Bên dưới là đề "' + title + '" gồm ' + src + ' và các câu hỏi (kèm đáp án đúng).',
      '',
      'NHIỆM VỤ: Tạo list các SYNONYMS và PARAPHRASE giữa các câu hỏi trong bài và ' + src + '.',
      '',
      'YÊU CẦU:',
      '1. Đi lần lượt theo từng câu hỏi (Question 1, Question 2, ...), mỗi câu là một mục.',
      '2. Mỗi dòng là một cặp, đúng format:',
      '   word : paraphrase/synonyms',
      '   - Bên trái: từ/cụm từ trong câu hỏi (gồm cả các lựa chọn A, B, C..., headings, bảng/note/summary).',
      '   - Bên phải: từ/cụm từ tương ứng trong ' + src + ', chép đúng nguyên văn.',
      '   - Nhiều paraphrase cho cùng một từ thì ngăn cách bằng " / ".',
      '3. Ưu tiên các cặp giúp tìm ra đáp án đúng. Nếu một lựa chọn sai (distractor) cũng được nhắc tới/paraphrase trong ' + src + ', thêm "(distractor)" ở cuối dòng.',
      '4. Nếu đáp án xuất hiện nguyên văn, không có paraphrase, ghi: word : (giữ nguyên)',
      '5. Chỉ liệt kê, không giải thích, không dịch nghĩa.',
      '',
      'VÍ DỤ:',
      'Question 5',
      '- decline : drop / fall',
      '- a large number of : a great many',
      '- children : youngsters (distractor)',
      '',
    ].join('\n');
  }

  function wrap(skill, title, blocks) {
    return buildPrompt(skill, title) + '\n========== BẮT ĐẦU ĐỀ: ' + title + ' ==========\n\n' +
      blocks.join('\n\n') + '\n\n========== HẾT ĐỀ ==========\n';
  }

  function listeningPartBlocks(part, label) {
    return [
      '===== ' + label + ' — TRANSCRIPT =====\n' + (htmlToText(part.transcript) || '(Chưa có transcript)'),
      '===== ' + label + ' — ' + rangeLabel(part) + ' =====\n' + questionsText(part),
    ];
  }

  function passageBlocks(p, label) {
    return [
      '===== ' + label + ': ' + (p.title || '') + ' =====\n' + (htmlToText(p.content) || '(Chưa có nội dung)'),
      '===== ' + label + ' — ' + rangeLabel(p) + ' =====\n' + questionsText(p),
    ];
  }

  var BUILDERS = {
    'ls-test': function (id) {
      return getJson('/admin/listening/tests/' + encodeURIComponent(id)).then(function (d) {
        var t = d.test || {};
        var parts = (t.sections || []).slice().sort(function (a, b) { return (a.partNumber || 0) - (b.partNumber || 0); });
        var blocks = [];
        parts.forEach(function (s) { blocks = blocks.concat(listeningPartBlocks(s, 'PART ' + s.partNumber)); });
        if (!blocks.length) throw new Error('Đề này chưa có part nào');
        return wrap('listening', t.name || 'Listening test', blocks);
      });
    },
    'ls-section': function (id) {
      return getJson('/admin/listening/sections/' + encodeURIComponent(id)).then(function (d) {
        var s = d.section || {};
        return wrap('listening', s.title || 'Listening', listeningPartBlocks(s, 'PART ' + (s.partNumber || '')));
      });
    },
    'rd-passage': function (id) {
      return getJson('/admin/passages/' + encodeURIComponent(id)).then(function (d) {
        var p = d.passage || {};
        var n = { passage1: 1, passage2: 2, passage3: 3 }[p.category];
        return wrap('reading', p.title || 'Reading', passageBlocks(p, 'READING PASSAGE' + (n ? ' ' + n : '')));
      });
    },
    'rd-test': function (id) {
      return getJson('/admin/tests/' + encodeURIComponent(id)).then(function (d) {
        var t = d.test || {};
        var ids = (t.passageIds || []).map(function (p) { return (p && p._id) || p; }).filter(Boolean);
        if (!ids.length) throw new Error('Bộ đề này random passage, không có passage cố định — hãy copy từng bài lẻ');
        return Promise.all(ids.map(function (pid) { return getJson('/admin/passages/' + encodeURIComponent(pid)); }))
          .then(function (rs) {
            var blocks = [];
            rs.forEach(function (r, i) { blocks = blocks.concat(passageBlocks(r.passage || {}, 'READING PASSAGE ' + (i + 1))); });
            return wrap('reading', t.name || 'Reading test', blocks);
          });
      });
    },
  };

  function build(kind, id) {
    var key = kind + ':' + id;
    if (!_cache[key]) {
      _cache[key] = BUILDERS[kind](id).catch(function (e) { delete _cache[key]; throw e; });
    }
    return _cache[key];
  }

  // ── clipboard ─────────────────────────────────────────────────────────
  // The text arrives after a fetch, so the click's user activation may be
  // gone by the time it is ready. ClipboardItem accepts a promise and keeps
  // the activation; writeText is the fallback; a textarea dialog is last.
  function writeClipboard(textPromise) {
    var viaItem = Promise.reject();
    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      try {
        var item = new ClipboardItem({
          'text/plain': textPromise.then(function (t) { return new Blob([t], { type: 'text/plain' }); }),
        });
        viaItem = navigator.clipboard.write([item]);
      } catch (e) { /* fall through */ }
    }
    return viaItem.then(function () { return true; }, function () {
      return textPromise.then(function (text) {
        if (!navigator.clipboard || !navigator.clipboard.writeText) return false;
        return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
      });
    });
  }

  function showManualCopy(text) {
    var ov = document.createElement('div');
    ov.className = 'syn-prompt-overlay';
    ov.innerHTML = '<div class="syn-prompt-dialog" role="dialog" aria-label="Copy prompt">' +
      '<div class="syn-prompt-dialog-head">Không tự copy được — bấm "Copy" hoặc chọn hết rồi copy</div>' +
      '<textarea readonly></textarea>' +
      '<div class="syn-prompt-dialog-actions"><button type="button" class="syn-prompt-copy">Copy</button>' +
      '<button type="button" class="syn-prompt-close">Đóng</button></div></div>';
    var ta = ov.querySelector('textarea');
    ta.value = text;
    function close() { ov.remove(); }
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('.syn-prompt-close').onclick = close;
    ov.querySelector('.syn-prompt-copy').onclick = function () {
      ta.focus(); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
      if (ok) { notify('Đã copy prompt + nội dung đề', 'success'); close(); }
    };
    document.body.appendChild(ov);
    ta.focus(); ta.select();
  }

  function notify(msg, type) {
    var fn = window.showToast || window.toast;
    if (typeof fn === 'function') fn(msg, type);
  }

  function copy(kind, id, btn) {
    if (!BUILDERS[kind] || !id) return;
    if (btn && btn.classList.contains('is-loading')) return;
    if (btn) btn.classList.add('is-loading');
    var textPromise = build(kind, id);
    writeClipboard(textPromise).then(function (ok) {
      if (ok) { notify('Đã copy prompt + nội dung đề — dán vào AI để tạo list synonyms/paraphrase', 'success'); return; }
      return textPromise.then(showManualCopy);
    }).catch(function (e) {
      notify('Không lấy được nội dung đề: ' + ((e && e.message) || 'lỗi'), 'error');
    }).then(function () {
      if (btn) btn.classList.remove('is-loading');
    });
  }

  function btnHtml(kind, id, variant) {
    if (!isStaff() || !id) return '';
    return '<button type="button" class="syn-prompt-btn' + (variant ? ' syn-prompt-btn--' + variant : '') + '"' +
      ' onclick="event.stopPropagation();SynonymPrompt.copy(\'' + kind + '\',\'' + String(id).replace(/[^\w-]/g, '') + '\',this)"' +
      ' title="Copy prompt AI: list synonyms/paraphrase giữa câu hỏi và ' + (kind.indexOf('ls-') === 0 ? 'transcript' : 'passage') + ' (kèm nội dung đề). Chỉ admin/teacher thấy nút này.">' +
      '<i class="fas fa-wand-magic-sparkles"></i><span>Prompt</span></button>';
  }

  // Styles live here so the two pages need only the script tag.
  function injectCss() {
    if (document.getElementById('syn-prompt-css')) return;
    var st = document.createElement('style');
    st.id = 'syn-prompt-css';
    st.textContent =
      '.syn-prompt-btn{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 10px;border-radius:13px;border:none;' +
      'background:rgba(255,255,255,.22);color:#fff;font:600 11px/1 Inter,system-ui,sans-serif;cursor:pointer;transition:background .15s,transform .1s}' +
      '.syn-prompt-btn:hover{background:rgba(255,255,255,.36)}.syn-prompt-btn:active{transform:scale(.96)}' +
      '.syn-prompt-btn.is-loading{opacity:.6;pointer-events:none}.syn-prompt-btn.is-loading i{animation:synSpin 1s linear infinite}' +
      '@keyframes synSpin{to{transform:rotate(360deg)}}' +
      '.syn-prompt-btn--cover{position:absolute;top:8px;left:40px;z-index:5;background:rgba(0,0,0,.35)}' +
      '.syn-prompt-btn--cover:hover{background:rgba(0,0,0,.5)}' +
      '.syn-prompt-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px}' +
      '.syn-prompt-dialog{background:#fff;color:#111;border-radius:12px;width:min(720px,100%);max-height:90vh;display:flex;flex-direction:column;gap:10px;padding:16px}' +
      '.syn-prompt-dialog-head{font-weight:600;font-size:14px}' +
      '.syn-prompt-dialog textarea{flex:1;min-height:50vh;width:100%;font:12px/1.45 ui-monospace,Consolas,monospace;border:1px solid #d1d5db;border-radius:8px;padding:8px;resize:vertical}' +
      '.syn-prompt-dialog-actions{display:flex;gap:8px;justify-content:flex-end}' +
      '.syn-prompt-dialog-actions button{padding:8px 16px;border-radius:8px;border:1px solid #d1d5db;background:#f3f4f6;cursor:pointer;font-weight:600}' +
      '.syn-prompt-dialog-actions .syn-prompt-copy{background:#2563eb;border-color:#2563eb;color:#fff}' +
      '[data-theme="dark"] .syn-prompt-dialog{background:#1f2937;color:#f3f4f6}' +
      '[data-theme="dark"] .syn-prompt-dialog textarea{background:#111827;color:#f3f4f6;border-color:#374151}';
    (document.head || document.documentElement).appendChild(st);
  }
  injectCss();

  window.SynonymPrompt = { isStaff: isStaff, btnHtml: btnHtml, copy: copy, build: build, _groupToText: groupToText };
})();
