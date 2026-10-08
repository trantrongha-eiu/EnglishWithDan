// Preview the Otter+Whisper merged transcript of a Vol 2+ part (what vol_build.js will use), with the stretches taken
// from Otter (Whisper dropped them) listed for checking, and Otter's speaker numbers per turn when no map is given.
//   node merge_preview.js <vol> <test> <part> [specFile]
const fs = require('fs'), path = require('path');
const { otterToRaw, mergeOtterWhisper } = require('./vol_transcript');
const [vol, test, part, specFile] = process.argv.slice(2);
const W = (f, v = vol) => path.join(__dirname, "web", `vol${v}`, f);

function otterPages(vol, test, part) {
  const ex = JSON.parse(fs.readFileSync(W("extract.json", vol), 'utf8')).files;
  const key = Object.keys(ex).find(k => new RegExp(`^listening/test ${test}/.*(?:\\bp ?${part}|section ${part}\\b[^/]*trans)\\.pdf$`, 'i').test(k));
  return key ? ex[key].pages : null;
}

function merged(vol, test, part, s = {}) {
  const pages = s.otter === false ? null : otterPages(vol, test, part);
  const wh = JSON.parse(fs.readFileSync(W(`whisper/t${test}p${part}.json`, vol), 'utf8'));
  const raw = pages ? otterToRaw(pages) : `Speaker 1 [0:00] `;
  return mergeOtterWhisper(raw, wh, { speakers: s.speakers === undefined ? { default: null } : s.speakers, fix: s.fix || [] });
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
