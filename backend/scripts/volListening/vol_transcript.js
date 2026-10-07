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

module.exports = { splitParts, cleanPart, fromWhisper };

if (require.main === module) {
  // node vol_transcript.js <vol> <test> [part]  → print the cleaned parts (no speaker map)
  const [vol, test, part] = process.argv.slice(2);
  const ex = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', `vol${vol}`, 'extract.json'), 'utf8')).files;
  const key = Object.keys(ex).find(k => k.startsWith(`test ${test}/`) && ex[k].type === 'docx');
  const parts = splitParts(ex[key].text);
  for (const [n, raw] of Object.entries(parts)) if (!part || +part === +n) console.log(`\n===== PART ${n} =====\n` + cleanPart(raw));
}
