// Convert downloaded DOL sections (web/dol/<id>.json) into ListeningSection drafts (web/draft/<id>.json).
// Prints WARN lines for anything that needs a human look. Map/diagram images are NOT uploaded here:
// the draft keeps `_mapSource` ({ url, spots }) and dol_import.js renders + uploads the labelled image.
//
//   node dol_convert.js [id …]        (no ids = every downloaded file)
const fs = require('fs'), path = require('path');
const IN = path.join(__dirname, 'web', 'dol'), OUT = path.join(__dirname, 'web', 'draft');
fs.mkdirSync(OUT, { recursive: true });

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const clean = s => String(s || '').replace(/ /g, ' ').replace(/[\t ]+/g, ' ').trim();

// ── Slate editor value → HTML-ish lines ─────────────────────────────────────
function leafHtml(n) {
  let t = esc(String(n.text || '').replace(/\u00a0/g, ' ').replace(/\t+/g, ' ').replace(/￡/g, '£')).replace(/ *\n */g, '<br>');
  if (!t) return '';
  if (n.bold) t = `<strong>${t}</strong>`;
  if (n.italic) t = `<em>${t}</em>`;
  if (n.underline) t = `<u>${t}</u>`;
  return t;
}
function inline(n, ctx) {
  if (Array.isArray(n)) return n.map(x => inline(x, ctx)).join('');
  if (!n || typeof n !== 'object') return '';
  if (n.type === 'blank') return ' ' + ctx.blank(n.id) + ' ';
  if (n.type === 'editable-blank-void') return ' ' + ctx.blank((n.children || []).map(c => c.blankId).find(Boolean)) + ' ';
  if (!n.type && 'text' in n) return leafHtml(n);
  if (n.type === 'br') return '<br>';
  if (n.type === 'ul' || n.type === 'ol') { ctx.warn('nested list inside inline'); return inline(n.children, ctx); }
  return inline(n.children || [], ctx);   // p, paragraph, align_*, hyperLink, li …
}
const tidy = h => h.replace(/<\/strong>(\s*)<strong>/g, '$1').replace(/<strong>\s*<\/strong>/g, '').replace(/\s{2,}/g, ' ')
  .replace(/(__Q\d+__) ([.,;:?!)’”'])/g, '$1$2').replace(/([(‘“]) (__Q\d+__)/g, '$1$2').trim();

// Block-level walk for note/form/sentence completion → noteConfig.lines
function blocksToLines(nodes, ctx, depth = 0) {
  const lines = [];
  for (const n of nodes || []) {
    if (!n || typeof n !== 'object') continue;
    if (n.type === 'ul' || n.type === 'ol') {
      for (const li of n.children || []) {
        const inner = (li.children || []);
        const textParts = inner.filter(c => c.type !== 'ul' && c.type !== 'ol');
        const sub = inner.filter(c => c.type === 'ul' || c.type === 'ol');
        const h = tidy(inline(textParts, ctx));
        if (h) lines.push((depth > 0 ? '>>' : '') + '• ' + h);
        lines.push(...blocksToLines(sub, ctx, depth + 1));
      }
    } else if (['bulleted-list', 'numbered-list', 'list-item'].includes(n.type) && (n.children || []).every(c => c.type)) {
      lines.push(...blocksToLines(n.children, ctx, depth));
    } else if (n.type === 'table') {
      ctx.warn('table inside note-completion');
      lines.push(tableHtml(n, ctx));
    } else if (/^align_/.test(n.type || '') && (n.children || []).some(c => c.type === 'ul' || c.type === 'p' || c.type === 'paragraph')) {
      lines.push(...blocksToLines(n.children, ctx, depth));
    } else {
      const h = tidy(inline(n, ctx));
      lines.push((depth > 0 ? '>>' : '') + h);
    }
  }
  // collapse runs of empty lines, trim ends
  const out = [];
  for (const l of lines) { if (l === '' && (out.length === 0 || out[out.length - 1] === '')) continue; out.push(l); }
  while (out.length && out[out.length - 1] === '') out.pop();
  return out;
}

function tableRows(t) {
  return (t.children || []).filter(r => r.type === 'tr').map(r => (r.children || []).filter(c => !c.hidden));
}
function tableHtml(t, ctx) {
  const rows = tableRows(t).map(cells => '<tr>' + cells.map(c => {
    const tag = c.type === 'th' ? 'th' : 'td';
    const span = (c.colSpan > 1 ? ` colspan="${c.colSpan}"` : '') + (c.rowSpan > 1 ? ` rowspan="${c.rowSpan}"` : '');
    return `<${tag}${span}>${tidy(cellHtml(c, ctx))}</${tag}>`;
  }).join('') + '</tr>');
  return `<table class="group-table">${rows.join('')}</table>`;
}
function cellHtml(c, ctx) {
  // paragraphs / list items inside a cell → <br>-separated
  const parts = [];
  const visit = nodes => {
    for (const n of nodes || []) {
      if (n.type === 'ul' || n.type === 'ol') (n.children || []).forEach(li => parts.push('• ' + tidy(inline(li, ctx))));
      else if (/^align_/.test(n.type || '')) visit(n.children);
      else parts.push(tidy(inline(n, ctx)));
    }
  };
  visit(c.children);
  return parts.filter(Boolean).join('<br>');
}

// Table → tableConfig {headers, rows}. Needs a rectangular grid once hidden (merged) cells are
// blanked; a first row that is a single cell spanning the table becomes a bold caption row.
function tableToConfig(t, ctx) {
  const raw = (t.children || []).filter(r => r.type === 'tr');
  const width = Math.max(...raw.map(r => (r.children || []).length));
  const grid = raw.map(r => (r.children || []).map(c => c.hidden ? '' : tidy(cellHtml(c, ctx))));
  if (grid.some(r => r.length !== width)) ctx.warn('ragged table');
  const isHeadRow = r => (r.children || []).filter(c => !c.hidden).every(c => c.type === 'th') && (r.children || []).filter(c => !c.hidden).length > 1;
  let headers = [], body = grid;
  const noTags = c => c.replace(/<(?!br>)[^>]+>/g, '');
  if (raw.length && /^example\b/i.test(noTags(grid[0][0] || ''))) {
    // the worked example row was typed as the header: 'E<em>xample</em><br>Type of …' | 'hall of residence'
    grid[0] = grid[0].map((c, k) => k === 0 ? '<em>Example:</em> ' + noTags(c).replace(/^example(<br>|:|\s)*/i, '') : c);
  } else if (raw.length && isHeadRow(raw[0]) && !/__Q\d+__/.test(grid[0].join(' '))) {
    headers = grid[0].map(h => h.replace(/<[^>]+>/g, '').trim());
    body = grid.slice(1);
  }
  const rowSpans = raw.some(r => (r.children || []).some(c => c.rowSpan > 1));
  if (rowSpans) ctx.warn('table has rowspan (merged cells blanked)');
  return { headers, rows: body.map(r => r.map(c => c)) };
}

function guidelineText(g) {
  const blocks = (g && g.content) || [];
  return blocks.map(b => clean((b.children || []).map(c => c.text || (c.children || []).map(x => x.text || '').join('')).join(''))).filter(Boolean).join('\n');
}

// DOL's older transcripts were typed carelessly: "Yes,of course.Can i …", full-width "￡".
const fixText = t => clean(t).replace(/￡/g, '£')
  .replace(/([a-z])([.?!])([A-Z])/g, '$1$2 $3')
  .replace(/([A-Za-z]),(?=[A-Za-z])/g, '$1, ')
  .replace(/(^|\s)i(?=\s|[’'](?:m|d|ve|ll)\b|[,.?!])/g, '$1I')
  .replace(/\s{2,}/g, ' ').trim();

// "DW30 7YZ / DW307YZ" → "DW30 7YZ/DW307YZ"
const normAnswer = v => clean(v).split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean).join('/');

function convert(file) {
  const src = JSON.parse(fs.readFileSync(path.join(IN, file), 'utf8'));
  const d = src.data, warns = [];
  const ctx = { warn: m => warns.push(m) };
  const part = +((d.sectionType || '').match(/\d/) || (src.listing.url.match(/section-(\d)/) || [])[1] || 0);
  if (!part) warns.push('unknown part');
  let num = (part - 1) * 10 + 1;
  const groups = [];

  for (const g of d.questionGroups) {
    const qt = g.questionType.replace(/_V2$/, '');
    const instruction = guidelineText(g.guideline);
    const startNum = num;
    const G = { groupType: 'plain', groupTitle: '', instruction, questions: [] };

    if (qt === 'SINGLE_ANSWER') {
      for (const q of g.questions) {
        const opts = (q.options || []).sort((a, b) => a.key - b.key);
        const ck = (q.correctOptions || [])[0];
        const idx = ck ? opts.findIndex(o => o.key === ck.key) : -1;
        if (idx < 0) warns.push(`Q${num} no correct option`);
        if (q.isImageIncluded) warns.push(`Q${num} options include images`);
        G.questions.push({ questionNumber: num++, type: 'multiple-choice', questionText: clean(q.question), options: opts.map(o => clean(o.value)), correctAnswer: LETTERS[idx] || '', _t: (ck && ck.explanation && ck.explanation.startTimeInSeconds) });
      }
    } else if (qt === 'MULTIPLE_ANSWER') {
      for (const q of g.questions) {
        const opts = (q.options || []).sort((a, b) => a.key - b.key);
        const keys = (q.correctOptions || []).map(c => opts.findIndex(o => o.key === c.key)).sort((a, b) => a - b);
        const n = q.maxSelectedOptions || keys.length;
        if (keys.length !== n || keys.some(k => k < 0)) warns.push(`Q${num} multi: ${keys.length} keys for choose ${n}`);
        for (const k of keys) G.questions.push({ questionNumber: num++, type: 'multi-answer-group', questionText: clean(q.question), options: opts.map(o => clean(o.value)), checkboxCount: n, correctAnswer: LETTERS[k] || '', _t: q.correctOptions[0] && q.correctOptions[0].explanation && q.correctOptions[0].explanation.startTimeInSeconds });
      }
    } else if (['MATCHING_DRAG_DROP', 'MATCHING', 'MATCHING_FEATURE_NAME', 'MATCHING_ENDING'].includes(qt)) {
      if (g.questions.length !== 1) warns.push(`matching group with ${g.questions.length} question blocks`);
      const q = g.questions[0];
      const opts = (q.options || []).sort((a, b) => a.key - b.key);
      const feats = (q.featureNames || q.endingOptions || []).sort((a, b) => a.key - b.key);
      G.groupType = 'matching-options';
      G.matchingOptions = opts.map(o => clean(o.value));
      G.matchingReuseAllowed = /more than once/i.test(instruction);
      if ((q.correctOptions || []).length !== feats.length) warns.push(`matching: ${q.correctOptions.length} keys / ${feats.length} items`);
      feats.forEach((f, i) => {
        const c = q.correctOptions[i];
        const idx = c ? opts.findIndex(o => o.key === c.key) : -1;
        G.questions.push({ questionNumber: num++, type: 'matching-info', questionText: clean(f.value), correctAnswer: LETTERS[idx] || '', _t: c && c.explanation && c.explanation.startTimeInSeconds });
      });
    } else if (qt === 'DRAG_OUT') {
      if (g.questions.length !== 1) warns.push(`DRAG_OUT with ${g.questions.length} blocks`);
      const q = g.questions[0];
      const spots = q.spots || [];
      G.groupType = 'map';
      G._mapSource = { url: q.image && q.image.url, width: q.image && q.image.width, height: q.image && q.image.height, spots };
      if (!G._mapSource.url) warns.push('map without image');
      (q.questions || []).forEach((label, i) => {
        const c = (q.correctOptions || [])[i];
        const spot = c && spots[c.key];
        if (!spot) warns.push(`Q${num} map key ${c && c.key} has no spot`);
        G.questions.push({ questionNumber: num++, type: 'map-labelling', questionText: clean(label), correctAnswer: spot ? clean(spot.text) : '', _t: c && c.explanation && c.explanation.startTimeInSeconds });
      });
      if (spots.some(s => !/^[A-Z]$/.test(clean(s.text)))) warns.push('map spots are not single letters: ' + spots.map(s => s.text).join('|'));
      // DOL's guideline here is often generic ("Drag your answers…") or left over from another type
      const lab = (instruction.match(/Label the [\w ,/]+? below\.?/i) || [])[0];
      const L = spots.map(s => clean(s.text)).sort();
      G.instruction = `${lab ? lab.replace(/\.?$/, '.') : 'Label the map below.'}\nWrite the correct letter, ${L[0]}–${L[L.length - 1]}, next to Questions ${startNum}–${num - 1}.`;
    } else if (qt === 'SHORT_ANSWER') {
      for (const q of g.questions) {
        const byKey = new Map((q.correctAnswers || []).map(a => [a.key, a]));
        for (const s of (q.sentences || []).sort((a, b) => a.key - b.key)) {
          const a = byKey.get(s.key);
          if (!a) warns.push(`Q${num} short answer without key`);
          G.questions.push({ questionNumber: num++, type: 'fill-blank', questionText: clean(s.text), correctAnswer: a ? normAnswer(a.value) : '', _t: a && a.explanation && a.explanation.startTimeInSeconds });
        }
      }
    } else if (qt === 'DRAG_IN') {
      // numbered boxes on an image, a word list to drag in → map group in drag-drop mode
      if (g.questions.length !== 1) warns.push(`DRAG_IN with ${g.questions.length} blocks`);
      const q = g.questions[0];
      const words = (q.options || []).map(clean);
      const boxes = q.questions || [];
      G.groupType = 'map';
      G.dragDropConfig = { text: '', words };
      G._mapSource = { url: q.image && q.image.url, width: q.image && q.image.width, height: q.image && q.image.height, spots: boxes.map((b, i) => ({ ...b, text: String(startNum + i) })), numbered: true };
      boxes.forEach((b, i) => {
        const c = (q.correctOptions || [])[i];
        const w = c ? words[c.key] : '';
        if (!w) warns.push(`Q${num} drag-in key missing`);
        G.questions.push({ questionNumber: num, type: 'map-labelling', questionText: `Question ${num++}`, correctAnswer: w || '', _t: c && c.explanation && c.explanation.startTimeInSeconds });
      });
    } else if (qt === 'DIAGRAM_LABEL_COMPLETION') {
      // fill-in boxes on an image → map group, text inputs, numbers drawn on the image
      if (g.questions.length !== 1) warns.push(`DIAGRAM_LABEL with ${g.questions.length} blocks`);
      const q = g.questions[0];
      const ni = q.nodeImage || {};
      const spots = ni.spots || [];
      const byBlank = new Map((q.correctAnswers || []).map(a => [a.blankId, a]));
      G.groupType = 'map';
      G._mapSource = { url: ni.image && ni.image.url, width: ni.width, spots: spots.map((s, i) => ({ ...s, text: String(startNum + i) })), numbered: true, centered: true };
      spots.forEach(sp => {
        const a = byBlank.get(sp.id);
        if (!a) warns.push(`Q${num} diagram spot without answer`);
        G.questions.push({ questionNumber: num, type: 'fill-blank', questionText: `Question ${num++}`, correctAnswer: a ? normAnswer(a.value) : '', _t: a && a.explanation && a.explanation.startTimeInSeconds });
      });
      if (spots.length !== byBlank.size) warns.push(`diagram: ${spots.length} spots / ${byBlank.size} answers`);
    } else if (/COMPLETION|FILL|SENTENCE_COMPLETE|FLOW_?CHART/.test(qt)) {
      const multi = g.questions.length > 1;
      for (const q of g.questions) {
        const startNum = num;
        const H = multi ? { groupType: 'plain', groupTitle: '', instruction, questions: [] } : G;
        let ev;
        if (q.sentences) {
          // one editor per sentence / flow-chart box
          const flow = /FLOW_?CHART/.test(qt);
          ev = [];
          q.sentences.forEach((s, i) => {
            if (flow && i) ev.push({ type: 'p', children: [{ text: '↓' }] });
            // all paragraphs of one sentence / box → one line, joined by <br>
            const paras = JSON.parse(s.editorValue || '[]');
            const kids = [];
            paras.forEach((p, j) => { if (j) kids.push({ type: 'br' }); kids.push(p); });
            ev.push({ type: 'p', children: kids });
          });
        } else ev = JSON.parse(q.editorValue || (q.paragraph && q.paragraph.editorValue) || '[]');
        const ans = q.correctAnswers || [];
        const byBlank = new Map(ans.map(a => [a.blankId, a]));
        const order = [];
        const blank = id => {
          if (!byBlank.has(id)) { warns.push('blank without answer ' + id); return '____'; }
          let i = order.indexOf(id);
          if (i < 0) { order.push(id); i = order.length - 1; }
          return `__Q${startNum + i}__`;
        };
        const bctx = { ...ctx, blank };
        const tables = ev.filter(n => n.type === 'table');
        if (tables.length === 1 && ev.filter(n => n.type !== 'table' && tidy(inline(n, { ...bctx, blank: () => 'X' }))).length === 0) {
          H.groupType = 'table';
          H.tableConfig = tableToConfig(tables[0], bctx);
          if (q.heading) H.noteConfig = { title: clean(q.heading), lines: [] };
        } else {
          H.groupType = 'note-form';
          H.noteConfig = { title: clean(q.heading || ''), lines: blocksToLines(ev, bctx) };
        }
        if (q.options && q.options.length) {
          // word box to drag from (flow-chart / summary with options) → drag-drop group, word answers
          const words = q.options.slice().sort((a, b) => a.key - b.key).map(o => clean(o.value));
          const nc = H.noteConfig || { title: '', lines: [] };
          const body = nc.lines.map(l => l === '↓' ? '<div style="text-align:center;font-size:18px;line-height:1.2">↓</div>'
            : `<div style="${/FLOW/.test(qt) ? 'border:1px solid #94a3b8;border-radius:6px;padding:8px 12px;' : ''}margin:4px 0">${l.replace(/^>>/, '')}</div>`).join('');
          H.groupType = 'drag-drop';
          H.dragDropConfig = { text: (nc.title ? `<p><strong>${esc(nc.title)}</strong></p>` : '') + body, words };
          delete H.noteConfig;
          for (const a of ans) if (!words.includes(clean(a.value))) warns.push(`drag-drop answer "${a.value}" not in word box`);
        }
        if (order.length !== ans.length) warns.push(`${qt}: ${order.length} blanks in text, ${ans.length} answers`);
        order.forEach((id, i) => {
          const a = byBlank.get(id);
          H.questions.push({ questionNumber: startNum + i, type: 'fill-blank', questionText: `Q${startNum + i}`, correctAnswer: normAnswer(a.value), _t: a.explanation && a.explanation.startTimeInSeconds });
        });
        num = startNum + order.length;
        if (multi) { H.groupTitle = `Questions ${startNum}-${num - 1}`; groups.push(H); }
      }
      if (multi) continue;
    } else {
      warns.push('UNSUPPORTED question type ' + qt);
      continue;
    }
    G.groupTitle = `Questions ${startNum}-${num - 1}`;
    groups.push(G);
  }
  const total = num - ((part - 1) * 10 + 1);
  if (total !== 10) warns.push(`total questions ${total}`);

  // transcript (cue text, speaker names for conversations)
  const s = d.script || {};
  const cues = (Array.isArray(s.subtitle) ? s.subtitle : JSON.parse(s.subtitle || '[]')).filter(c => c.type === 'cue' && c.data);
  const names = new Map((s.characters || []).map(c => [c.id, clean(c.name)]));
  const pretty = n => n ? n.charAt(0) + n.slice(1).toLowerCase() : '';
  const lines = ['❓ Transcript', clean(d.name)];
  let lastSpeaker = null;
  for (const c of cues) {
    const text = fixText(c.data.text);
    if (!text) continue;
    const sp = names.get(c.character);
    if (sp && s.type !== 'MONOLOG') { if (sp !== lastSpeaker) lines.push(pretty(sp) + ':'); lastSpeaker = sp; }
    lines.push(text);
  }
  if (cues.length < 5) warns.push(`transcript has only ${cues.length} cues`);

  const audioPath = s.audio && s.audio.path;
  if (!audioPath) warns.push('no audio');
  const draft = {
    _dolId: d.id, _dolSectionId: d.testSectionId, _source: d.examSource, _url: 'https://tuhoc.dolenglish.vn/' + src.solutionUrl,
    _audio: audioPath ? 'https://media.dolenglish.vn/' + audioPath : '',
    _cues: cues.map(c => ({ start: c.data.start / 1000, end: c.data.end / 1000, text: fixText(c.data.text), speaker: names.get(c.character) || '' })),
    partNumber: part, title: clean(d.name), description: '',
    questionRange: { start: (part - 1) * 10 + 1, end: num - 1 },
    transcript: lines.join('\n'),
    questionGroups: groups,
    isActive: false, isActualTest: ['CAMBRIDGE', 'ACTUAL_TEST'].includes(d.examSource),
  };
  // DOL capitalises many typed answers ("White", "Office"): use the transcript's lower-case form when
  // the word is spoken as an ordinary word there (names keep their capital).
  const tr = ' ' + cues.map(c => c.text).join(' ') + ' ';
  for (const g of groups) for (const q of g.questions) {
    if (q.type !== 'fill-blank') continue;
    q.correctAnswer = q.correctAnswer.split('/').map(v => {
      if (!/^[A-Z][a-z]/.test(v)) return v;
      const lo = v.charAt(0).toLowerCase() + v.slice(1);
      return new RegExp(`[^A-Za-z]${lo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^A-Za-z]`).test(tr) ? lo : v;
    }).join('/');
  }
  // hand fixes found while reviewing (dol_patches.js)
  const patch = require('./dol_patches')[d.id];
  if (patch) {
    const qs = groups.flatMap(g => g.questions);
    for (const [n, k] of Object.entries(patch.keys || {})) {
      const q = qs.find(x => x.questionNumber === +n);
      if (!q) warns.push(`patch: no Q${n}`); else q.correctAnswer = k;
    }
    if (patch.fn) patch.fn(draft, warns);
    // a renamed section keeps its transcript header in step
    draft.transcript = draft.transcript.replace(`❓ Transcript\n${clean(d.name)}\n`, `❓ Transcript\n${draft.title}\n`);
  }
  let out = JSON.stringify(draft, null, 1);
  // text: [[from, to], …] — plain-string replacements everywhere (transcript, cues, questions)
  for (const [from, to] of (patch && patch.text) || []) {
    const a = JSON.stringify(from).slice(1, -1), b = JSON.stringify(to).slice(1, -1);
    if (!out.includes(a)) warns.push(`patch text not found: ${from}`);
    out = out.split(a).join(b);
  }
  fs.writeFileSync(path.join(OUT, d.id + '.json'), out);
  return { id: d.id, name: d.name, part, source: d.examSource, warns };
}

if (require.main === module) {
  const ids = process.argv.slice(2);
  const files = ids.length ? ids.map(i => i + '.json') : fs.readdirSync(IN).filter(f => f.endsWith('.json'));
  let bad = 0;
  for (const f of files) {
    try {
      const r = convert(f);
      if (r.warns.length) { bad++; console.log(`WARN ${r.id} P${r.part} ${r.name}: ${r.warns.join(' | ')}`); }
    } catch (e) { bad++; console.log('FAIL', f, e.message); }
  }
  console.log(`converted ${files.length}, with warnings ${bad}`);
}
module.exports = { convert };
