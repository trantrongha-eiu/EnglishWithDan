// Preview the Otter+Whisper merged transcript of a Vol 2+ part (what vol_build.js will use), with the stretches taken
// from Otter (Whisper dropped them) listed for checking, and Otter's speaker numbers per turn when no map is given.
//   node merge_preview.js <vol> <test> <part> [specFile]
const fs = require('fs'), path = require('path');
const { otterToRaw, mergeOtterWhisper, applyTurns } = require('./vol_transcript');
const [vol, test, part, specFile] = process.argv.slice(2);
const W = (f, v = vol) => path.join(__dirname, "web", `vol${v}`, f);

function otterPages(vol, test, part, files) {
  const ex = JSON.parse(fs.readFileSync(W("extract.json", vol), 'utf8')).files;
  // Vol 4: spec names the part's Otter PDF(s) (`otter: ['listening/test 3/Part 2 Cau 11 - 16.pdf', …]`, in order)
  if (files) return files.flatMap(f => { if (!ex[f]) throw new Error(`otter file not in extract.json: ${f}`); return ex[f].pages; });
  // Vol 2: listening/test T/…pP.pdf; Vol 3: listening/transcript/test T/section P.pdf
  const key = Object.keys(ex).find(k => new RegExp(`^listening/test ${test}/.*(?:\\bp ?${part}|section ${part}\\b[^/]*trans)\\.pdf$`, 'i').test(k)
    || new RegExp(`^listening/transcript/test ${test}/section ${part}\\.pdf$`, 'i').test(k));
  if (key) return ex[key].pages;
  // Vol 3: one Otter PDF for the whole test (listening/transcript/test T[ (1)].pdf) → this part's stretch, from its
  // "(Now turn to) section N" to the next part's
  const whole = Object.keys(ex).find(k => new RegExp(`^listening/transcript/test ?${test}(?: \\(\\d\\))?\\.pdf$`, 'i').test(k));
  if (!whole) return null;
  const text = ex[whole].pages.join('\n').replace(/^\s*group:[^\n]*\n/gim, '');
  const N = n => `(?:section|part) (?:${['one', 'two', 'three', 'four'][n - 1]}|${n})`;
  const find = re => { const m = new RegExp(re, 'i').exec(text); return m ? m.index : -1; };
  // a part starts at "Now turn to section N" / "Section N, you will hear"; when Otter lost that, at "end of section N-1"
  const at = n => {
    const s = find(`now turn to ${N(n)}\\b|(?<!end of )${N(n)}[.,]?\\s+(?:you will hear|on page)`);
    return s >= 0 || n === 1 ? s : find(`end of ${N(n - 1)}\\b|${N(n - 1)}\\. You now have`);
  };
  const from = at(+part), to = +part < 4 ? at(+part + 1) : text.length;
  if (from < 0 || to < from) throw new Error(`whole-test Otter ${whole}: part ${part} not found`);
  return [text.slice(from, to)];
}

function merged(vol, test, part, s = {}) {
  const pages = s.otter === false ? null : otterPages(vol, test, part, Array.isArray(s.otter) ? s.otter : undefined);
  const wh = JSON.parse(fs.readFileSync(W(`whisper/t${test}p${part}.json`, vol), 'utf8'));
  const raw = pages ? otterToRaw(pages, { oneSpeaker: !!s.turns }) : `Speaker 1 [0:00] `;
  const r = mergeOtterWhisper(raw, wh, { speakers: s.speakers === undefined ? { default: null } : s.speakers, fix: s.fix || [] });
  if (s.turns) r.text = applyTurns(r.text, s.turns, r.stats);
  return r;
}
module.exports = { otterPages, merged };

if (require.main === module) {
  const spec = specFile ? require(path.resolve(specFile)) : null;
  const s = spec ? spec.sections.find(x => x.part === +part) : {};
  const sp = s.speakers || new Proxy({}, { get: (_, k) => k === 'default' ? undefined : `S${k}` });
  const { text, stats } = merged(vol, test, part, { ...s, speakers: sp });
  console.log(text);
  console.log(`\n--- taken from Otter (${stats.otterSpans.length}):\n` + stats.otterSpans.map(x => '  ' + x).join('\n'));
  if (stats.dropped.length) console.log(`--- dropped whisper: ${stats.dropped.join(' | ')}`);
}
