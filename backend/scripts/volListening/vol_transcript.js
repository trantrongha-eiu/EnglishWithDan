// Split a VOL test's machine transcript (.docx → extract.json: "Speaker N [hh:mm:ss] text" paragraphs for the
// whole test) into its 4 parts and clean each one for the student-facing transcript:
//   • exam narration removed ("Part two, you will hear…", "you have some time to look at questions…",
//     "That is the end of part…", the test intro) — it is in the audio but not part of the recording's script
//   • "Speaker N" → the role names given per part (spec.speakers = { 1: 'Agent', 2: 'Customer' }); parts with
//     a single voice (talks/lectures) get no labels
//   • one sentence per line (like the other bank transcripts), "Label:" on its own line before each turn
//   • spec.fix = [[from, to], …] plain replacements applied to the raw part text first (ASR errors)
const fs = require('fs'), path = require('path');

const NUM = '(one|two|three|four|1|2|3|4)';
const PART_START = new RegExp(`(?:Now turn to (?:part|section) ${NUM}\\.?\\s*)?(?:Part|Section|PART|SECTION) ${NUM}[.,]?\\s+(?:you|You) will hear`, 'g');
const NARRATION = [
  /^.*?(?:listening test|This is the|Test (?:one|two|three|four|\d+)\b)[^.]*\.\s*/i, // test intro (first part only, handled below)
  /(?:Now turn to (?:part|section) \w+\.?\s*)?(?:Part|Section) \w+[.,]?\s+you will hear[^.]*\.\s*/gi,
  /(?:First,?\s*)?you have (?:some time|\d+ seconds|half a minute|a minute|one minute) to (?:look at|read)[^.]*\.(?:\s*\d+\s*to\s*\d+\.)?\s*/gi,
  /Now listen (?:carefully )?and answer questions?\.?\s*\d+\s*(?:to|and)\s*\d+\.\s*/gi,
  /Before you hear the rest of the [a-z]+,?[^.]*\.(?:\s*\d+\s*to\s*\d+\.)?\s*/gi,
  /That is the end of (?:part|section) \w+\.\s*/gi,
  /You now have (?:\w+ )+to check your answers to (?:part|section) \w+\.\s*/gi,
  /You will see that there is an example[^.]*\.\s*/gi,
  /(?:On this occasion,? )?[Oo]nly the conversation relating to this will be played first\.\s*/g,
  /Now we shall begin\.\s*/g,
  /You should answer the questions as you listen,? because you will not hear the recording a second time\.\s*/g,
];
const INTRO = /^[\s\S]*?(?:transfer your answers to (?:the|an) answer sheet\.\s*)/i;

function splitParts(text) {
  const t = text.replace(/^Audio Test[^\n]*\n/i, '').replace(/^-{5,}\s*$/gm, '');
  const marks = [...t.matchAll(PART_START)].map(m => ({ i: m.index, n: ({ one: 1, two: 2, three: 3, four: 4 })[m[2].toLowerCase()] || +m[2] }));
  const out = {};
  marks.forEach((m, k) => { if (!out[m.n]) out[m.n] = t.slice(m.i, k + 1 < marks.length ? marks[k + 1].i : t.length); });
  return out;
}

function cleanPart(raw, { speakers = null, fix = [] } = {}) {
  let t = raw;
  for (const [a, b] of fix) {
    if (!t.includes(a)) throw new Error(`transcript fix not found: ${a}`);
    t = t.split(a).join(b);
  }
  t = t.replace(INTRO, '');
  // turns: "Speaker N [hh:mm:ss] text"; text before the first marker belongs to the narrator/monologue speaker
  const turns = [];
  const re = /Speaker (\d+) \[[\d:]+\]\s*/g;
  let last = 0, who = null, m;
  while ((m = re.exec(t))) { turns.push({ who, text: t.slice(last, m.index) }); who = +m[1]; last = re.lastIndex; }
  turns.push({ who, text: t.slice(last) });
  const lines = [];
  let prev = undefined;
  for (const tu of turns) {
    let s = tu.text.replace(/\s+/g, ' ');
    for (const r of NARRATION.slice(1)) s = s.replace(r, '');
    s = s.trim();
    if (!s) continue;
    const label = speakers ? (speakers[tu.who] || speakers.default || null) : null;
    if (label && label !== prev) lines.push(`${label}:`);
    if (label) prev = label;
    lines.push(...s.split(/(?<=[.?!])\s+(?=[A-Z0-9"‘“'])/).map(x => x.trim()).filter(Boolean));
  }
  return lines.join('\n');
}

// ── Whisper-based transcript (preferred) ────────────────────────────────────────────────────────────
// Text = Whisper sentences of the part file (accurate); speaker of each sentence = the docx turn it lines up
// with (docx turns carry "Speaker N"); exam narration sentences dropped; in Part 1 the example that is
// played first and then again is kept once (everything from "there is an example" to "Now we shall begin").
const NARR_SENT = [
  /\byou will hear\b.*\b(?:recordings|conversation|talk|lecture|discussion|student|man|woman|guide|member|tutor|speaker|people|radio|presentation|interview)/i,
  /^(?:now,? )?(?:turn to|look at) (?:part|section)/i,
  /\byou have (?:some time|\d+ seconds|half a minute|a minute|one minute|\w+ seconds) to (?:look at|read|check)/i,
  /^(?:now,? )?listen (?:carefully )?and answer questions?/i,
  /^before you hear the rest/i,
  /^that is the end of (?:part|section)/i,
  /\bto check your answers\b/i,
  /^(?:part|section) (?:one|two|three|four|\d)\.?$/i,
  /\b(?:ielts|isles|science)? ?listening test\b/i,
  /^there will be time for you to read/i,
  /^all the recordings will be played/i,
  /^the test is in four (?:parts|sections)/i,
  /^at the end of the test/i,
  /^(?:write|you will be given 10 minutes)/i,
  /^you should answer the questions as you listen/i,
  /^questions? \d+ (?:to|and) \d+\.?$/i,
  /^(?:test|version) [\w ]+\.?$/i,
];
const toks = s => String(s).toLowerCase().replace(/[’']/g, '').match(/[a-z0-9]+/g) || [];

function fromWhisper(wh, rawPart, { speakers = null, wfix: fix = [], keepFrom = null } = {}) {
  // sentences from the whole text (segments break mid-sentence)
  let text = wh.segments.map(s => s.text).join(' ').replace(/\s+/g, ' ');
  let sents = text.split(/(?<=[.?!])\s+(?=[A-Z0-9"‘“'£$€])/).map(s => s.trim()).filter(Boolean);
  // example played first, then the whole conversation: keep only the full run
  const ex = sents.findIndex(s => /there is an example/i.test(s));
  const begin = sents.findIndex(s => /now we shall begin/i.test(s));
  if (ex >= 0 && begin > ex) sents.splice(ex, begin - ex + 1);
  if (keepFrom) { const k = sents.findIndex(s => s.includes(keepFrom)); if (k > 0) sents = sents.slice(k); }
  sents = sents.filter(s => !NARR_SENT.some(r => r.test(s)));
  // docx word stream with speaker per word
  const stream = [];
  const re = /Speaker (\d+) \[[\d:]+\]\s*/g;
  let last = 0, who = null, m;
  const pieces = [];
  while ((m = re.exec(rawPart))) { pieces.push([who, rawPart.slice(last, m.index)]); who = +m[1]; last = re.lastIndex; }
  pieces.push([who, rawPart.slice(last)]);
  for (const [w, t] of pieces) for (const x of toks(t)) stream.push({ x, w });
  let ptr = 0;
  const lines = [];
  let prev;
  for (const s of sents) {
    let label = null;
    if (speakers) {
      const st = toks(s);
      let best = { score: -1, i: ptr };
      for (let i = Math.max(0, ptr - 30); i < Math.min(stream.length, ptr + 600); i++) {
        let sc = 0;
        for (let k = 0; k < Math.min(st.length, 12); k++) if (stream[i + k] && stream[i + k].x === st[k]) sc++;
        if (sc > best.score) best = { score: sc, i };
      }
      const win = stream.slice(best.i, best.i + Math.max(1, st.length));
      const count = {};
      win.forEach(t => { count[t.w] = (count[t.w] || 0) + 1; });
      const w = +Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
      if (best.score >= Math.min(3, st.length)) ptr = best.i + st.length;
      label = speakers[w] || speakers.default || null;
      if (label && label !== prev) lines.push(`${label}:`);
      if (label) prev = label;
    }
    lines.push(s);
  }
  let out = lines.join('\n');
  for (const [a, b] of fix) {
    if (!out.includes(a)) throw new Error(`transcript fix not found: ${a}`);
    out = out.split(a).join(b);
  }
  return out;
}

// ── Otter.ai transcript PDFs (Vol 2+: one "pN.pdf" per part) ────────────────────────────────────────
// Page text: header (GROUP / SUMMARY KEYWORDS / SPEAKERS), then blocks "<n>\nSpeaker <n>\n<m:ss>\n<text>" or, when
// Otter did not name the speaker, " \n<m:ss>\n<text>". An unnamed block is a turn change in practice (one
// voice → the other), so it gets the other speaker of the last two named ones. Output = the .docx shape
// ("Speaker N [m:ss] text …") so cleanPart / fromWhisper / spec.fix work unchanged.
// oneSpeaker (spec has hand turns, Vol 3): Otter's speaker numbers are ignored — every block is speaker 1
function otterToRaw(pages, { oneSpeaker = false } = {}) {
  let text = pages.map(p => p.replace(/^\s*GROUP:[^\n]*\n/im, '')).join('\n');
  // Vol 4 export: "Speaker 1 (00:32):" before each block → the "Speaker n" / "m:ss" lines below
  text = text.replace(/^\s*Speaker (\d+) \((\d+:\d\d(?::\d\d)?)\):\s*$/gm, 'Speaker $1\n$2');
  // header: SUMMARY KEYWORDS … SPEAKERS <list>; without a SPEAKERS line (Vol 3) it ends at the first timestamp
  text = /SPEAKERS\s*\n/.test(text) ? text.replace(/^[\s\S]*?SPEAKERS\s*\n[^\n]*\n/, '')
    : text.replace(/^[\s\S]*?SUMMARY KEYWORDS[\s\S]*?(?=^\s*\d+:\d\d(?::\d\d)?\s*$)/m, '');
  const lines = text.split('\n').map(l => l.trim());
  const blocks = [];
  let cur = null, pendingSpeaker = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^Speaker \d+$/.test(l)) { pendingSpeaker = +l.split(' ')[1]; continue; }
    if (/^\d+$/.test(l) && /^Speaker \d+$/.test(lines[i + 1] || '')) continue; // avatar digit before "Speaker n"
    if (/^\d+:\d\d(?::\d\d)?$/.test(l)) { cur = { who: pendingSpeaker, time: l, text: [] }; blocks.push(cur); pendingSpeaker = null; continue; }
    if (!l) continue;
    if (!cur) { cur = { who: null, time: '0:00', text: [] }; blocks.push(cur); }
    cur.text.push(l);
  }
  if (oneSpeaker) blocks.forEach(b => { b.who = 1; });
  // unnamed block → the other speaker
  let last = null, other = null;
  for (const b of blocks) {
    if (b.who == null) b.who = other != null ? other : (last != null ? last + 1 : 1);
    if (b.who !== last) { other = last; last = b.who; }
  }
  return blocks.map(b => `Speaker ${b.who} [${b.time}] ${b.text.join(' ').replace(/(\w)- (\w)/g, '$1-$2')}`).join('\n');
}

// ── Otter + Whisper merge (Vol 2+ base transcript) ──────────────────────────────────────────────────
// Whisper has the better words (names, numbers, "patient form? Sure." where Otter has "patient for sure") but drops
// whole passages at pauses (often leaving a hallucinated "Thank you.") and single words ("eye strain" → "eye");
// Otter is complete but garbled. Token LCS of the two: matched tokens and short disagreements take Whisper's
// surface; a stretch only Otter has (or where Otter is much longer) takes Otter's. Turns (speaker changes) come from
// Otter's blocks (otterToRaw). Narration is dropped afterwards, spec.fix ([[from, to], …]) applied to the result.
const ABBR = /(?<!\b(?:Dr|Mr|Mrs|Ms|St|Prof)\.)/;
const SENT = new RegExp(`${ABBR.source}(?<=[.?!])\\s+(?=[A-Z0-9"‘“'£$€])`);
const nrm = s => s.toLowerCase().replace(/[’']/g, '').replace(/(\d),(\d)/g, '$1$2').replace(/[^a-z0-9]/g, '');

function mergeOtterWhisper(otterRaw, wh, { speakers = null, fix = [] } = {}) {
  const O = [];
  const re = /Speaker (\d+) \[[\d:]+\]\s*/g;
  let last = 0, who = null, m, blk = 0;
  const pieces = [];
  while ((m = re.exec(otterRaw))) { pieces.push([who, otterRaw.slice(last, m.index)]); who = +m[1]; last = re.lastIndex; }
  pieces.push([who, otterRaw.slice(last)]);
  for (const [w, t] of pieces) { blk++; for (const s of t.split(/\s+/).filter(Boolean)) { const n = nrm(s); if (n) O.push({ s, n, who: w, blk }); else if (O.length) O[O.length - 1].s += ' ' + s; } }
  // Whisper tokens; "A-T-K-I-N" split into letters (joined back with "-") so they line up with Otter's "A T K I N"
  const Wt = [];
  for (const s of wh.segments.map(x => x.text).join(' ').split(/\s+/).filter(Boolean)) {
    const sub = /^[A-Za-z0-9](?:-[A-Za-z0-9])+[^A-Za-z0-9]*$/.test(s) ? s.split('-') : [s];
    sub.forEach((x, i) => { const n = nrm(x); if (n) Wt.push({ s: x, n, join: i < sub.length - 1 ? '-' : ' ' }); else if (Wt.length) Wt[Wt.length - 1].s += x; });
  }
  const n = O.length, mm = Wt.length;
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(mm + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = mm - 1; j >= 0; j--) L[i][j] = O[i].n === Wt[j].n ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; // { s, who, join }
  const stats = { otterSpans: [], dropped: [] };
  let i = 0, j = 0, curWho = O.length ? O[0].who : null;
  while (i < n || j < mm) {
    if (i < n && j < mm && O[i].n === Wt[j].n) {
      curWho = O[i].who;
      // Whisper often runs sentences together without punctuation: borrow Otter's trailing mark then
      let s = Wt[j].s;
      const op = (O[i].s.match(/[.?!,;:]+["”’]?$/) || [''])[0];
      let borrowed = false;
      if (op && !/[.?!,;:]["”’]?$/.test(s) && Wt[j].join === ' ') { s += op; borrowed = true; }
      out.push({ s, who: curWho, join: Wt[j].join, borrowed }); i++; j++; continue;
    }
    const i0 = i, j0 = j;
    while ((i < n || j < mm) && !(i < n && j < mm && O[i].n === Wt[j].n)) { if (j >= mm || (i < n && L[i + 1][j] >= L[i][j + 1])) i++; else j++; }
    const os = O.slice(i0, i), ws = Wt.slice(j0, j);
    const wsText = ws.map(x => x.n).join(' ');
    // Whisper cut a word short ("don" / "don't", "it" / "it's"): Otter's
    const truncated = os.length === 1 && ws.length === 1 && os[0].n.startsWith(ws[0].n) && os[0].n.length - ws[0].n.length <= 2 && /['’]/.test(os[0].s);
    if (os.length && (!ws.length || truncated || os.length >= 2 * ws.length + 6 || /^(thank you|thanks for watching|you)$/.test(wsText))) {
      os.forEach(x => out.push({ s: x.s, who: x.who, join: ' ' }));
      stats.otterSpans.push(os.map(x => x.s).join(' ') + (ws.length ? `   [whisper: ${ws.map(x => x.s).join(' ')}]` : ''));
      curWho = os[os.length - 1].who;
    } else if (ws.length) {
      if (!os.length && /^(thank you|thanks for watching|you)$/.test(wsText)) { stats.dropped.push(wsText); continue; }
      const w0 = os.length ? os[0].who : curWho;
      ws.forEach(x => out.push({ s: x.s, who: w0, join: x.join }));
    }
  }
  // unpunctuated Whisper run left over ("a souvenir We encourage you", "compass, Even though"): Whisper still
  // capitalises sentence starts, so a capitalised function word after an unclosed word starts a sentence
  for (let k = 0; k + 1 < out.length; k++) {
    const a = out[k], b = out[k + 1];
    // …and a full stop Otter put mid-sentence ("outside the park. but you can") goes
    if (/[a-z0-9][.?!]$/.test(a.s) && (a.borrowed || /\.$/.test(a.s)) && !/^(?:Dr|Mr|Mrs|Ms|St|Prof|etc|vs)\.$/i.test(a.s) && /^[a-z]/.test(b.s)) { a.s = a.s.slice(0, -1); continue; }
    if (a.join !== ' ' || /[.?!]["”’]?$/.test(a.s) || !/^[A-Z]/.test(b.s) || !STARTERS.has(nrm(b.s))) continue;
    a.s = a.s.replace(/[,;:]$/, '') + '.';
  }
  // turns → narration removed → labelled lines, one sentence per line
  const turns = [];
  for (const t of out) {
    if (!turns.length || turns[turns.length - 1].who !== t.who) turns.push({ who: t.who, text: '' });
    const cur = turns[turns.length - 1];
    cur.text += t.s + t.join;
  }
  const lines = [];
  let prev;
  for (const tu of turns) {
    let s = tu.text.replace(/\s+/g, ' ');
    for (const r of NARRATION.slice(1)) s = s.replace(r, '');
    let sents = s.trim().split(SENT).map(x => x.trim()).filter(Boolean).filter(x => !NARR_SENT.some(r => r.test(x)) && !NARR_EXTRA.some(r => r.test(x)));
    if (!sents.length) continue;
    sents = sents.map(x => x.charAt(0).toUpperCase() + x.slice(1));
    const label = speakers ? (speakers[tu.who] || speakers.default || null) : null;
    if (label && label !== prev) lines.push(`${label}:`);
    if (label) prev = label;
    lines.push(...sents);
  }
  let text = lines.join('\n');
  for (const [a, b] of fix) {
    if (!text.includes(a)) { stats.missingFix = (stats.missingFix || []).concat(a); continue; }
    text = text.split(a).join(b);
  }
  return { text, stats };
}
const STARTERS = new Set('the a an we you they he she it its this that these those there theres here heres and but so or of in on at for if when what where why how who which well oh hmm yes no ok okay right sure great good fine now then also as after before please dont do does did is are was were can could would will shall should may might must lets let my our your their his her even although though because first next finally last thanks thank'.split(' '));
// narration as Whisper/Otter write it with number words or odd breaks ("questions one to four", "Five to 10.")
const NARR_EXTRA = [
  /^(?:now,? )?listen(?: carefully)?,? and answer questions?\b/i,
  /^(?:questions? )?(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven) (?:to|and) (?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\.?\??$/i,
  /\bbefore you listen(?: again)?,? you have\b/i,
  /^before you (?:listen|hear) (?:to )?the rest of the/i,
  /^(?:you will )?now hear\b.*\b(?:conversation|talk|lecture|discussion)\b/i,
  /^(?:part|section) (?:one|two|three|four|\d)\b[^.]*\byou will hear\b/i,
  /^that(?: is|'s) the end of (?:the )?(?:part|section|listening test)/i,
  /^in the ielts test,? you would now have/i,
];

// ── Speaker turns by hand (Vol 3: Otter names no speakers, one block holds both voices) ──────────────
// turns = [[label, phrase], …] in order: each phrase (verbatim, found after the previous one) starts a turn of that
// speaker → "Label:" line before it (breaking the line when the turn starts mid-line). Missing phrases → stats.missingFix.
function applyTurns(text, turns, stats = {}) {
  let t = text, pos = 0, prev = null;
  for (const [label, phrase] of turns) {
    const i = t.indexOf(phrase, pos);
    if (i < 0) { stats.missingFix = (stats.missingFix || []).concat(`turn ${label}: ${phrase}`); continue; }
    if (label === prev) stats.missingFix = (stats.missingFix || []).concat(`turn ${label} twice in a row: ${phrase}`);
    const ins = `\n${label}:\n`;
    t = t.slice(0, i) + ins + t.slice(i);
    pos = i + ins.length + phrase.length;
    prev = label;
  }
  return t.split('\n').map(l => l.trim()).filter(Boolean).join('\n');
}

module.exports = { splitParts, cleanPart, fromWhisper, otterToRaw, mergeOtterWhisper, applyTurns };

if (require.main === module) {
  // node vol_transcript.js <vol> <test> [part]  → print the cleaned parts (no speaker map)
  const [vol, test, part] = process.argv.slice(2);
  const ex = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', `vol${vol}`, 'extract.json'), 'utf8')).files;
  const key = Object.keys(ex).find(k => k.startsWith(`test ${test}/`) && ex[k].type === 'docx');
  const parts = splitParts(ex[key].text);
  for (const [n, raw] of Object.entries(parts)) if (!part || +part === +n) console.log(`\n===== PART ${n} =====\n` + cleanPart(raw));
}
