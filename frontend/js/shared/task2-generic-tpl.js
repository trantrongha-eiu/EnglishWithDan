/* Generic Task 2 templates — fill-in sentence frames with (placeholders)
 * that fit any topic, for the 7 essay types at Band 6+ and Band 7+.
 * Used by the "Full template" pop-up on task2-template.html and the
 * "Xem template" panel on writing.html (Task 2 practice).
 *
 * The text lives in js/task2-generic-templates.js (from the Task 2 Template
 * Bank book), fetched the first time a student opens a template. html()
 * builds the reading view; Vietnamese lines are always rendered and shown or
 * hidden with setVi(), so toggling never re-renders.
 *
 * Styles: css/task2-generic-tpl.css.
 */
(function () {
  'use strict';

  const TYPES = [
    { id: 'type01', label: 'Advantages & Disadvantages' },
    { id: 'type02', label: 'Discuss Both Views' },
    { id: 'type03', label: 'Cause – Solution' },
    { id: 'type04', label: 'Effect – Solution' },
    { id: 'type05', label: 'Cause – Effect' },
    { id: 'type06', label: 'Agree / Disagree' },
    { id: 'type07', label: 'Positive / Negative' },
  ];

  let loading = null;
  function load() {
    if (window.TASK2_GENERIC_TEMPLATES) return Promise.resolve(window.TASK2_GENERIC_TEMPLATES);
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = '/js/task2-generic-templates.js?v=a07e561334';
        s.onload  = () => window.TASK2_GENERIC_TEMPLATES ? resolve(window.TASK2_GENERIC_TEMPLATES) : reject(new Error('templates'));
        s.onerror = () => { loading = null; reject(new Error('templates')); };
        document.head.appendChild(s);
      });
    }
    return loading;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Escapes the text, then marks each "(placeholder)" slot the student fills in.
  function slots(text) {
    return esc(text).replace(/\([^()]*\)/g, m => `<span class="gtpl-slot">${m}</span>`);
  }

  function getType(data, level, typeId) {
    return (data && data[level] && data[level][typeId]) || null;
  }

  function html(data, level, typeId, showVi) {
    const type = getType(data, level, typeId);
    if (!type) return '<div class="gtpl-empty">Không có dữ liệu cho dạng bài này.</div>';
    const vi = showVi ? '' : ' style="display:none"';
    const sections = type.sections.map(sec => {
      const lines = sec.lines.map(ln =>
        (ln.label ? `<div class="gtpl-label">${esc(ln.label)}</div>` : '') +
        `<div class="gtpl-en">${slots(ln.en)}</div>` +
        `<div class="gtpl-vi"${vi}>→ ${slots(ln.vi)}</div>`).join('');
      return `<div class="gtpl-sec"><div class="gtpl-sec-title">${esc(sec.title)}</div>${lines}</div>`;
    }).join('');
    return `<div class="gtpl-title">${esc(type.name)}</div>
      <div class="gtpl-hint">Phần trong ngoặc như (topic) là chỗ bạn tự điền nội dung theo đề bài.</div>${sections}`;
  }

  function setVi(root, show) {
    if (!root) return;
    root.querySelectorAll('.gtpl-vi').forEach(el => { el.style.display = show ? '' : 'none'; });
  }

  // Plain-text English version for "copy text".
  function text(data, level, typeId) {
    const type = getType(data, level, typeId);
    if (!type) return '';
    return type.sections
      .map(sec => `${sec.title}\n${sec.lines.map(ln => (ln.label ? `[${ln.label}] ` : '') + ln.en).join('\n')}`)
      .join('\n\n');
  }

  // Best guess of the essay type from the question wording, or null when the
  // wording doesn't clearly match one (e.g. two-part questions). Only used to
  // pre-select a type; the student can always pick another.
  function guessType(prompt) {
    const p = String(prompt || '').toLowerCase();
    if (/positive or (a )?negative/.test(p)) return 'type07';
    if (/disadvantage|drawback|outweigh/.test(p)) return 'type01';
    if (/discuss both/.test(p)) return 'type02';
    if (/agree or disagree|to what extent/.test(p)) return 'type06';
    // "What problems does this cause?" asks for effects, so a bare "cause"
    // verb doesn't count as asking for causes.
    const asksSolution = /solution|solve|measures|what can be done|tackle|address th/.test(p);
    const asksCause  = /\bwhy\b|causes? (of|for)|what (has )?caused|reasons?/.test(p);
    const asksEffect = /effect|impact|consequence|problems? (does|do|will|could|might|can|may)\b/.test(p);
    if (asksSolution && asksCause) return 'type03';
    if (asksSolution && (asksEffect || /problem/.test(p))) return 'type04';
    if (asksCause && asksEffect) return 'type05';
    return null;
  }

  window.Task2GenericTpl = { TYPES, load, html, setVi, text, guessType };
})();
