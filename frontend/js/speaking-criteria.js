/* ═══════════════════════════════════════════════════════
   speaking-criteria.js — renders a "speaking-v2" AI analysis: one card per
   IELTS criterion (band, why this band, descriptor match, what went well,
   what to improve, evidence quoted from the answer, errors + corrections,
   how to improve), plus the lexical-feature and grammar-structure panels,
   the top-3 priorities and the provisional-score note.

   Shared by the practice result, the topic/full-mock session result and
   the History modal (js/speaking.js). Pure string rendering — every value
   from the AI is escaped. Older "speaking-v1" results (no `criteria`)
   simply render nothing here and keep the existing flat cards.
═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bandTone(b) {
    if (b == null) return 'na';
    return b >= 7 ? 'hi' : b >= 5.5 ? 'mid' : 'lo';
  }
  function fmtBand(b) { return b == null ? 'N/A' : String(b); }

  var CRITERIA = [
    { key: 'fluencyCoherence', en: 'Fluency & Coherence', vi: 'Độ trôi chảy & mạch lạc', icon: 'fa-wave-square' },
    { key: 'lexicalResource', en: 'Lexical Resource', vi: 'Vốn từ vựng', icon: 'fa-book' },
    { key: 'grammaticalRangeAccuracy', en: 'Grammatical Range & Accuracy', vi: 'Ngữ pháp', icon: 'fa-diagram-project' },
    { key: 'pronunciation', en: 'Pronunciation', vi: 'Phát âm', icon: 'fa-volume-high' },
  ];
  var LEVEL_VI = { low: 'Thấp', moderate: 'Trung bình', high: 'Cao' };
  var LEX_GROUPS = [
    ['lowFrequency', 'Từ ít phổ biến'],
    ['idioms', 'Thành ngữ / cụm cố định'],
    ['phrasalVerbs', 'Phrasal verbs'],
    ['collocations', 'Collocations'],
    ['paraphrasing', 'Paraphrase'],
  ];
  var PATTERN_VI = { none: 'gần như không có lỗi', occasional: 'lỗi thỉnh thoảng', frequent: 'lỗi thường xuyên', systematic: 'lỗi lặp lại có hệ thống' };

  function list(items, cls) {
    if (!items || !items.length) return '';
    return '<ul class="spc-list ' + (cls || '') + '">' + items.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
  }
  function section(title, icon, inner) {
    if (!inner) return '';
    return '<div class="spc-sec"><div class="spc-sec-title"><i class="fas ' + icon + '"></i> ' + title + '</div>' + inner + '</div>';
  }

  function levels(c) {
    var parts = [['Phạm vi', c.rangeLevel], ['Độ chính xác', c.accuracyLevel], ['Linh hoạt', c.flexibilityLevel], ['Phù hợp', c.appropriacyLevel]]
      .filter(function (p) { return LEVEL_VI[p[1]]; })
      .map(function (p) { return '<span class="spc-level spc-level-' + p[1] + '">' + p[0] + ': ' + LEVEL_VI[p[1]] + '</span>'; });
    return parts.length ? '<div class="spc-levels">' + parts.join('') + '</div>' : '';
  }

  function evidence(items) {
    if (!items || !items.length) return '';
    return items.map(function (e) {
      return '<div class="spc-ev ' + (e.positive === false ? 'spc-ev-neg' : 'spc-ev-pos') + '">'
        + '<div class="spc-quote">“' + esc(e.studentQuote) + '”</div>'
        + '<div class="spc-ev-meta"><span class="spc-mark">' + (e.positive === false ? '✗' : '✓') + '</span>'
        + (e.feature ? '<span class="spc-tag">' + esc(e.feature) + '</span>' : '')
        + (e.evaluation ? '<span class="spc-ev-text">' + esc(e.evaluation) + '</span>' : '') + '</div></div>';
    }).join('');
  }

  function limitations(items) {
    if (!items || !items.length) return '';
    return items.map(function (l) {
      return '<div class="spc-fix">'
        + (l.studentQuote ? '<div class="spc-fix-row"><span class="spc-wrong">' + esc(l.studentQuote) + '</span>'
          + (l.correction ? '<span class="spc-arrow">→</span><span class="spc-right">' + esc(l.correction) + '</span>' : '') + '</div>' : '')
        + (l.problem ? '<div class="spc-fix-problem">' + esc(l.problem) + '</div>' : '')
        + (l.explanation ? '<div class="spc-fix-tip">💡 ' + esc(l.explanation) + '</div>' : '')
        + '</div>';
    }).join('');
  }

  function lexicalFeatures(f) {
    if (!f) return '';
    var groups = LEX_GROUPS.map(function (g) {
      var items = f[g[0]] || [];
      if (!items.length) return '';
      return '<div class="spc-feat-group"><div class="spc-feat-name">' + g[1] + '</div>'
        + items.map(function (i) {
          var ok = i.natural !== false;
          return '<div class="spc-feat ' + (ok ? 'spc-feat-ok' : 'spc-feat-bad') + '">'
            + '<span class="spc-quote-inline">“' + esc(i.studentQuote) + '”</span>'
            + '<span class="spc-feat-verdict">' + (ok ? '✓ Tự nhiên · đúng ngữ cảnh' : '✗ Gượng / chưa đúng') + '</span>'
            + (i.assessment ? '<div class="spc-feat-note">' + esc(i.assessment) + '</div>' : '') + '</div>';
        }).join('') + '</div>';
    }).join('');
    var rep = (f.repetition || []).map(function (r) {
      return '<div class="spc-feat spc-feat-rep"><span class="spc-quote-inline">“' + esc(r.word) + '”</span>'
        + '<span class="spc-feat-verdict">lặp ~' + esc(r.count) + ' lần</span>'
        + (r.alternatives && r.alternatives.length ? '<div class="spc-feat-note">Thử thay bằng: ' + r.alternatives.map(esc).join(', ') + '</div>' : '') + '</div>';
    }).join('');
    if (rep) groups += '<div class="spc-feat-group"><div class="spc-feat-name">Lặp từ</div>' + rep + '</div>';
    return groups ? section('Ngôn ngữ được AI phát hiện', 'fa-magnifying-glass', '<div class="spc-feats">' + groups + '</div>') : '';
  }

  function grammarStructures(c) {
    var html = '';
    if (c.structures && c.structures.length) {
      html += '<div class="spc-structs">' + c.structures.map(function (s) {
        return '<span class="spc-struct ' + (s.correct === false ? 'spc-struct-bad' : 'spc-struct-ok') + '" title="' + esc(s.studentQuote || '') + '">'
          + (s.correct === false ? '✗ ' : '✓ ') + esc(s.type) + '</span>';
      }).join('') + '</div>';
    }
    var d = c.errorDensity;
    if (d && d.clauses > 0) {
      html += '<div class="spc-density">≈ ' + esc(d.errors) + ' lỗi / ' + esc(d.clauses) + ' mệnh đề'
        + (PATTERN_VI[d.pattern] ? ' — ' + PATTERN_VI[d.pattern] : '')
        + ' <span class="spc-muted">(chỉ số tham khảo, không phải công thức chấm)</span></div>';
    }
    return html ? section('Cấu trúc ngữ pháp được phát hiện', 'fa-sitemap', html) : '';
  }

  function card(meta, c, open) {
    if (!c) return '';
    var na = meta.key === 'pronunciation' && c.assessable === false;
    var body = '';
    if (na) {
      body = '<div class="spc-na">' + esc(c.reason || 'Chưa đánh giá được phát âm.') + '</div>'
        + (c.nextStep ? section('Cách để được chấm phát âm', 'fa-microphone', '<p class="spc-text">' + esc(c.nextStep) + '</p>') : '');
    } else {
      body = (c.feedback ? '<p class="spc-why"><b>Vì sao được band này:</b> ' + esc(c.feedback) + '</p>' : '')
        + (c.descriptorMatch && c.descriptorMatch.length
          ? '<div class="spc-desc"><span class="spc-desc-label">Khớp mô tả band IELTS:</span>' + c.descriptorMatch.map(function (d) { return '<span class="spc-chip">' + esc(d) + '</span>'; }).join('') + '</div>' : '')
        + levels(c)
        + section('Điểm bạn làm tốt', 'fa-thumbs-up', list(c.strengths, 'spc-good'))
        + section('Cần cải thiện', 'fa-triangle-exclamation', list(c.weaknesses, 'spc-bad'))
        + section('Bằng chứng từ câu trả lời của bạn', 'fa-quote-left', evidence(c.evidence))
        + (meta.key === 'lexicalResource' ? lexicalFeatures(c.features) : '')
        + (meta.key === 'grammaticalRangeAccuracy' ? grammarStructures(c) : '')
        + section(meta.key === 'pronunciation' ? 'Âm cần sửa' : 'Lỗi & cách sửa', 'fa-pen-to-square', limitations(c.limitations))
        + section('Cách cải thiện để lên band', 'fa-arrow-trend-up', c.nextStep ? '<p class="spc-text">' + esc(c.nextStep) + '</p>' : '');
    }
    return '<details class="spc-card spc-tone-' + bandTone(na ? null : c.band) + '"' + (open ? ' open' : '') + '>'
      + '<summary><span class="spc-card-icon"><i class="fas ' + meta.icon + '"></i></span>'
      + '<span class="spc-card-names"><span class="spc-card-en">' + meta.en + '</span><span class="spc-card-vi">' + meta.vi + '</span></span>'
      + '<span class="spc-card-band">' + fmtBand(na ? null : c.band) + '</span>'
      + '<i class="fas fa-chevron-down spc-caret"></i></summary>'
      + '<div class="spc-card-body">' + body + '</div></details>';
  }

  /**
   * @param {object} fb  a feedback object (live response or stored
   *                     aiFeedback) carrying `criteria` (speaking-v2)
   * @param {object} [opts] { compact: bool } — History modal: cards closed
   * @returns {string} HTML, or '' for an older result without criteria
   */
  function render(fb, opts) {
    if (!fb || !fb.criteria) return '';
    opts = opts || {};
    var html = '<div class="spc">';
    html += '<div class="spc-head"><i class="fas fa-list-check"></i> Phân tích chi tiết theo 4 tiêu chí IELTS'
      + '<span class="spc-head-sub">Bấm vào từng tiêu chí để xem vì sao được band đó</span></div>';
    if (fb.provisional) {
      html += '<div class="spc-provisional"><i class="fas fa-circle-info"></i> Band tổng là <b>tạm tính</b> từ 3 tiêu chí — phát âm chưa được chấm vì không có bản ghi âm.</div>';
    }
    if (fb.priorityImprovements && fb.priorityImprovements.length) {
      html += '<div class="spc-priorities"><div class="spc-sec-title"><i class="fas fa-bullseye"></i> 3 ưu tiên để lên band tiếp theo</div><ol>'
        + fb.priorityImprovements.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></div>';
    }
    html += '<div class="spc-cards">' + CRITERIA.map(function (m, i) {
      return card(m, fb.criteria[m.key], !opts.compact && i === 0);
    }).join('') + '</div>';
    if (fb.memorisedLanguage && fb.memorisedLanguage.length) {
      html += section('Có thể là câu học thuộc', 'fa-clone', fb.memorisedLanguage.map(function (m) {
        return '<div class="spc-feat"><span class="spc-quote-inline">“' + esc(m.studentQuote) + '”</span>'
          + (m.note ? '<div class="spc-feat-note">' + esc(m.note) + '</div>' : '') + '</div>';
      }).join(''));
    }
    if (fb.partAnalysis && fb.partAnalysis.length) {
      html += section('Nhận xét theo từng Part', 'fa-layer-group', fb.partAnalysis.map(function (p) {
        return '<div class="spc-part"><b>Part ' + esc(p.part) + ':</b> ' + esc(p.comment) + '</div>';
      }).join(''));
    }
    html += '<div class="spc-disclaimer">Điểm AI dựa trên mô tả band chính thức của IELTS và những gì bạn thực sự nói — chỉ mang tính tham khảo, không phải điểm thi chính thức.</div>';
    return html + '</div>';
  }

  // A stored SpeakingAttempt.aiFeedback → the live-response shape
  // renderFeedback() expects (mistakes/improvements were persisted as
  // corrections/suggestions).
  function feedbackFromAttempt(aiFeedback) {
    var fb = Object.assign({}, aiFeedback || {});
    fb.mistakes = (fb.corrections || []).map(function (c) { return { original: c.original, corrected: c.corrected, reason: c.explanation }; });
    fb.improvements = fb.suggestions || [];
    return fb;
  }

  window.SpeakingCriteria = { render: render, feedbackFromAttempt: feedbackFromAttempt };
})();
