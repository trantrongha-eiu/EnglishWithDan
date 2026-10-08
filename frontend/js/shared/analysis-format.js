/* "Phân tích đề" formatter (writing.html left panel, Task 1 + Task 2).
 *
 * analysisSections[].content is plain text written by teachers in a loose
 * but consistent shape (see backend/scripts/seedWritingTask1.js /
 * seedWritingTask2.js):
 *
 *   Overview nên nói gì? …:          ← heading line (ends with ":")
 *   - London: CAO NHẤT (550→1650)     ← bullet, CAPS = emphasis
 *   Topic sentence:                   ← heading for an English model line
 *   London recorded by far …          ← model sentence (no Vietnamese)
 *   Cấu trúc hay (…):
 *   - rise dramatically, from X to Y  ← English bullet = useful phrase
 *     Sales in London rose …          ← indented line = its example
 *   BODY 1: hạng mục dẫn đầu …        ← plan step
 *   ① Overview có nêu …?              ← checklist item
 *
 * html() turns that into colour-coded blocks that reuse the model-answer
 * palette (css/task2-highlight.css variables — the container carries
 * .t2hl-root). Anything it doesn't recognise renders as a plain paragraph,
 * so an admin edit can never break the panel. Styles: writing.css
 * (.an-*).
 */
(function () {
  'use strict';

  const VI_RE = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  const CHECK_RE = /^([①②③④⑤⑥⑦⑧⑨⑩])\s*(.*)$/;
  // "BODY 1: …", "MỞ BÀI: …", "OVERVIEW: …" — an all-caps label.
  const STEP_RE = /^(\p{Lu}[\p{Lu}0-9 ]{1,18}):\s+(.+)$/u;
  // "Nên viết: …", "Ý chính: …", "Dạng bài: …" — a short lead-in.
  const KV_RE = /^([^:]{2,24}):\s+(.+)$/;
  // Upper-case words that are just acronyms, not "look at this" emphasis.
  const NOT_EMPHASIS = new Set(['USD', 'UK', 'US', 'USA', 'LA', 'EU', 'UAE', 'IELTS', 'VS', 'TV', 'IT', 'GDP', 'CO2', 'VĐV', 'O', 'N', 'X', 'Y']);

  // Heading → kind (colour + icon + model-sentence label).
  const KINDS = [
    { key: 'overview', re: /overview/i,                         icon: 'fa-binoculars',   label: 'Overview' },
    { key: 'thesis',   re: /thesis/i,                           icon: 'fa-bullseye',     label: 'Thesis' },
    { key: 'topic',    re: /topic sentence|câu chủ đề/i,        icon: 'fa-heading',      label: 'Topic' },
    { key: 'phrase',   re: /cấu trúc hay|cụm từ|collocation|từ vựng|structure/i, icon: 'fa-puzzle-piece', label: 'Phrase' },
    { key: 'check',    re: /checklist/i,                        icon: 'fa-list-check',   label: 'Check' },
    { key: 'formula',  re: /công thức|chỉ cần làm|dàn bài|outline/i, icon: 'fa-route', label: 'Plan' },
  ];
  const NOTE = { key: 'note', icon: 'fa-lightbulb', label: 'Mẫu' };

  // Plan-step label → role colour of the model-answer palette.
  function stepRole(label) {
    const l = label.toUpperCase();
    if (/OVERVIEW/.test(l)) return 'overview';
    if (/MỞ BÀI|INTRO/.test(l)) return 'paraphrase';
    if (/KẾT BÀI|CONCLU/.test(l)) return 'restate';
    if (/BODY\s*2|THÂN BÀI\s*2/.test(l)) return 'compare';
    if (/BODY|THÂN BÀI/.test(l)) return 'topic';
    return 'final';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  const isVi = s => VI_RE.test(s);
  const isEnglishLine = s => !isVi(s) && /[a-z]/i.test(s) && s.trim().split(/\s+/).length >= 3;
  const kindOf = heading => KINDS.find(k => k.re.test(heading)) || NOTE;

  // Inline marks on Vietnamese prose: "550→1650" figures, a lone "→",
  // ALL-CAPS emphasis ("CAO NHẤT", "DUY NHẤT") and quoted English
  // ("with the exception of"). Everything else is escaped as-is.
  const INLINE_RE = new RegExp([
    '(\\d(?:[\\d.,]*\\d)?%?\\s*→\\s*\\d(?:[\\d.,]*\\d)?%?)',        // 1: figures
    '(→)',                                                          // 2: arrow
    '"([^"\\n]{2,80})"',                                            // 3: quote
    '(?<!\\p{L})(\\p{Lu}{2,}(?:[ \\-](?:\\d+[ \\-])?\\p{Lu}{2,})*)(?!\\p{L})', // 4: CAPS ("CHỌN 1 PHE")
  ].join('|'), 'gu');

  function inline(text) {
    const src = String(text);
    let out = '', pos = 0, m;
    INLINE_RE.lastIndex = 0;
    while ((m = INLINE_RE.exec(src))) {
      out += esc(src.slice(pos, m.index));
      if (m[1]) {
        out += `<span class="an-num">${esc(m[1]).replace('→', '<i>→</i>')}</span>`;
      } else if (m[2]) {
        out += '<span class="an-arrow">→</span>';
      } else if (m[3]) {
        out += `<q class="an-q">${esc(m[3])}</q>`;
      } else if (m[4]) {
        const word = m[4];
        out += NOT_EMPHASIS.has(word) || /\d/.test(word) ? esc(word) : `<mark class="an-em">${esc(word)}</mark>`;
      }
      pos = m.index + m[0].length;
    }
    return out + esc(src.slice(pos));
  }

  // Irregular verbs that keep showing up in Task 1/2 phrase lists.
  const IRREGULAR = {
    be: 'is|are|was|were|been|being', have: 'has|had|having',
    rise: 'rose|risen', fall: 'fell|fallen', grow: 'grew|grown', see: 'saw|seen',
    make: 'made', take: 'took|taken', give: 'gave|given', become: 'became',
    lead: 'led', go: 'went|gone', keep: 'kept', spend: 'spent', find: 'found',
    overtake: 'overtook|overtaken', stand: 'stood', catch: 'caught', bring: 'brought',
    show: 'shown', put: 'put', cast: 'cast', split: 'split', meet: 'met', build: 'built',
  };
  const PLACEHOLDER_RE = /\s*(?:\/|\+|,|\(|\)|\.\.\.|…|\b[A-Z]\b|\b(?:V(?:-ing|-ed)?|Ved|O|adj(?:ective)?|noun|verb|sb|sth)\b)\s*/;

  // Bold the bits of a useful phrase that show up in its example sentence
  // ("with the exception of" → "…, with the exception of Singapore.").
  // Placeholders (X, Y, A, B, N, O, V-ing, adjective) and "+"/"/"/","
  // split the phrase into chunks. Each chunk matches loosely: inflections
  // (rise ≈ rises/rose, be ≈ was) and one extra word in between
  // ("remain stable" ≈ "remained relatively stable").
  function markExample(example, phrase) {
    const chunks = String(phrase).split(PLACEHOLDER_RE)
      .map(c => (c || '').trim())
      .filter(c => c.length >= 5 || c.split(/\s+/).length >= 2);
    let html = esc(example);
    for (const c of chunks) {
      const words = esc(c).split(/\s+/).map(w => {
        const base = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const irr = IRREGULAR[w.toLowerCase()];
        return '(?:' + base.replace(/e$/, 'e?') + '(?:s|es|d|(?:[a-z])?(?:ed|ing))?' + (irr ? '|' + irr : '') + ')';
      });
      const re = new RegExp('\\b(' + words.join('(?:\\s+[\\w&#;-]+)?\\s+') + ')(?![\\w])', 'i');
      if (re.test(html)) { html = html.replace(re, '<b class="an-hit">$1</b>'); }
    }
    return html;
  }

  // One section body → HTML.
  function html(content) {
    const lines = String(content == null ? '' : content).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let kind = NOTE;          // kind of the latest heading
    let list = null;          // open <ul> type: 'bullet' | 'phrase' | 'check' | 'step'
    const closeList = () => { if (list) { out.push(list === 'phrase' ? '</div>' : '</ul>'); list = null; } };
    const openList = (type) => {
      if (list === type) return;
      closeList();
      out.push(type === 'phrase' ? '<div class="an-phrases">' : `<ul class="an-list an-list--${type}">`);
      list = type;
    };

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();
      if (!line) { closeList(); kind = NOTE; continue; }

      // Indented line right after a phrase bullet = its example (handled
      // by the bullet below); a stray one is just a paragraph.
      const bullet = /^[-•*]\s+(.*)$/.exec(line);
      if (bullet) {
        const text = bullet[1];
        if (!isVi(text) && (kind.key === 'phrase' || /^\s+\S/.test(lines[i + 1] || ''))) {
          openList('phrase');
          const examples = [];
          while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1]) && !/^\s*[-•*]\s/.test(lines[i + 1])) {
            examples.push(lines[++i].trim());
          }
          out.push(`<div class="an-phrase"><span class="an-phrase-chip">${esc(text)}</span>` +
            examples.map(ex => `<div class="an-example">${markExample(ex, text)}</div>`).join('') + '</div>');
          continue;
        }
        openList('bullet');
        const kv = /^([^:]{2,28}):\s+(.+)$/.exec(text);
        out.push(kv
          ? `<li><b class="an-key">${inline(kv[1])}</b> ${inline(kv[2])}</li>`
          : `<li>${inline(text)}</li>`);
        continue;
      }

      const check = CHECK_RE.exec(line);
      if (check) {
        openList('check');
        out.push(`<li class="an-check" role="button" tabindex="0" onclick="this.classList.toggle('is-done')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.classList.toggle('is-done')}">` +
          `<span class="an-check-num">${'①②③④⑤⑥⑦⑧⑨⑩'.indexOf(check[1]) + 1}</span><span class="an-check-txt">${inline(check[2])}</span></li>`);
        continue;
      }

      const step = STEP_RE.exec(line);
      if (step && (isVi(step[2]) || /^(BODY|OVERVIEW|MỞ BÀI|KẾT BÀI|THÂN BÀI|INTRO)/.test(step[1]))) {
        openList('step');
        out.push(`<li class="an-step an-step--${stepRole(step[1])}"><span class="an-step-tag">${esc(step[1])}</span><span>${inline(step[2])}</span></li>`);
        continue;
      }

      closeList();

      // Heading: a short line ending with ":" (the lead-in for a model
      // sentence, a phrase list, a checklist…).
      if (/:$/.test(line) && line.length <= 110) {
        kind = kindOf(line);
        out.push(`<div class="an-head an-head--${kind.key}"><i class="fas ${kind.icon}" aria-hidden="true"></i><span>${inline(line.slice(0, -1))}</span></div>`);
        continue;
      }

      // English sentence on its own line = a model sentence to imitate.
      if (isEnglishLine(line)) {
        const role = ['overview', 'thesis', 'topic'].includes(kind.key) ? kind.key : 'note';
        out.push(`<div class="an-model an-model--${role}" data-label="${esc(role === 'note' ? NOTE.label : kind.label)}">${esc(line)}</div>`);
        continue;
      }

      const kv = KV_RE.exec(line);
      if (kv && isVi(kv[1]) && !/[.?!]/.test(kv[1])) {
        out.push(`<p class="an-p"><b class="an-key">${inline(kv[1])}</b> ${inline(kv[2])}</p>`);
        continue;
      }
      out.push(`<p class="an-p">${inline(line)}</p>`);
    }
    closeList();
    return out.join('');
  }

  // Section title "2. Body 1 – London …" → number badge + icon + text.
  function title(t) {
    const m = /^\s*(\d+)[.)]\s*(.*)$/.exec(String(t || ''));
    const num = m ? m[1] : '';
    const text = m ? m[2] : String(t || '');
    const icon = /body\s*2/i.test(text) ? 'fa-layer-group'
      : /body/i.test(text) ? 'fa-align-left'
      : /công thức|formula/i.test(text) ? 'fa-route'
      : /phân tích|analys/i.test(text) ? 'fa-magnifying-glass-chart'
      : /mở bài|intro/i.test(text) ? 'fa-door-open'
      : /kết bài|conclu/i.test(text) ? 'fa-flag-checkered'
      : 'fa-bookmark';
    const tone = /body\s*2/i.test(text) ? 'b2' : /body/i.test(text) ? 'b1' : /công thức|formula/i.test(text) ? 'plan' : 'intro';
    return { tone, html: (num ? `<span class="an-badge">${esc(num)}</span>` : `<span class="an-badge"><i class="fas ${icon}"></i></span>`) +
      `<span class="an-title-txt">${inline(text)}</span>` + (num ? `<i class="fas ${icon} an-title-ico" aria-hidden="true"></i>` : '') };
  }

  window.AnalysisFormat = { html, title, inline };
})();
