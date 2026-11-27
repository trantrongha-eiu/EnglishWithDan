'use strict';
// Cambridge Listening sections that DOL does not have, built from ieltstrainingonline.com (thầy 2026-11-27: "bài nào thiếu
// hay lỗi thì dùng trang ieltstrainingonline.com"): per-section mp3, questions, answer key and the audioscript page.
//   node ito_sections.js build  [c13t1s2 …]       → web/ito/draft/<id>.json + checks (10 questions, keys, quotes in transcript)
//   node ito_sections.js import [c13t1s2 …] [--apply]   → HIDDEN ListeningSection (audio + map → R2), web/ito/imported.json
//   node ito_sections.js activate [ids] [--apply]       → isActive (refuses without explanations / audio / transcript / cover)
// Spec: ito/<id>.js = { book, test, part, title, groups (vol_build helpers), expl: { n: { v, t, p } }, fix: [[from, to]],
//   map: { group: <index>, file: 'web/ito/<file>' } }. Pages: web/ito/l<B>t<T>.html (questions + key) and l<B>t<T>_as.html
//   (audioscript, "NAME:  text" lines with "(Qn)" markers); audio web/ito/c<B>t<T>s<P>.mp3.
// Source mark: audioFileName "ito_CAM<B>_L<T>_S<P>.mp3" — orphan_sections.js reads book/test/section from it, so
// build_full_tests.js can assemble "Quýt B - Test T" once all four sections exist.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const W = (...p) => path.join(__dirname, 'web', 'ito', ...p);
const [cmd, ...rest] = process.argv.slice(2);
const apply = rest.includes('--apply');
const ALL = fs.readdirSync(path.join(__dirname, 'ito')).filter(f => /^c\d+t\ds\d\.js$/.test(f)).map(f => f.replace(/\.js$/, ''));
const ids = rest.filter(a => !a.startsWith('--')).length ? rest.filter(a => !a.startsWith('--')) : ALL;
const IMPORTED = W('imported.json');
const imported = fs.existsSync(IMPORTED) ? JSON.parse(fs.readFileSync(IMPORTED, 'utf8')) : {};

const ent = s => s.replace(/&#8217;|&rsquo;/g, '’').replace(/&#8216;|&lsquo;/g, '‘').replace(/&#8220;|&ldquo;/g, '“').replace(/&#8221;|&rdquo;/g, '”')
  .replace(/&#8211;|&ndash;/g, '–').replace(/&#8212;|&mdash;/g, '—').replace(/&#8230;|&hellip;/g, '…').replace(/&nbsp;|&#160;/g, ' ')
  .replace(/&amp;|&#038;/g, '&').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n));
function pageText(file) {
  let h = fs.readFileSync(file, 'utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  h = h.slice(h.indexOf('<h1'));
  return ent(h.replace(/<br\s*\/?>/g, '\n').replace(/<\/(p|h\d|li|tr|div)>/g, '\n').replace(/<[^>]+>/g, ''))
    .replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{2,}/g, '\n');
}
// audioscript of one section → "Name:\ntext" turns (monologue: plain lines), markers and separator lines removed
function transcriptOf(spec) {
  const t = pageText(W(`l${spec.book}t${spec.test}_as.html`));
  const a = t.lastIndexOf(`SECTION ${spec.part}\n`, t.indexOf(`SECTION ${spec.part + 1}\n`) > 0 ? t.indexOf(`SECTION ${spec.part + 1}\n`) : t.length);
  let b = t.indexOf(`SECTION ${spec.part + 1}\n`, a);
  if (b < 0) b = t.search(/\nAdvertisements\n|\nCam \d+ Listening/);
  let body = t.slice(a + `SECTION ${spec.part}\n`.length, b);
  for (const [x, y] of spec.fix || []) { if (!body.includes(x)) throw new Error(`${spec.id}: fix not found: ${x}`); body = body.split(x).join(y); }
  const out = [];
  let prev = null;
  for (let l of body.split('\n')) {
    l = l.replace(/\s*\((?:Q\d+|Example)\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    l = l.replace(/ - /g, ' – ').replace(/ ([.,;:?!])/g, '$1');
    if (!l || /^-{3,}$/.test(l) || /^https?:/.test(l) || /^Advertisements$/.test(l)) continue;
    const m = l.match(/^([A-Z][A-Z .']{1,20}):\s*(.*)$/);
    if (m) {
      const who = m[1].trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) + ':';
      if (who !== prev) out.push(who);
      prev = who;
      if (m[2]) out.push(m[2]);
    } else out.push(l);
  }
  return out.join('\n');
}

const norm = s => ' ' + String(s || '').toLowerCase().replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—−]/g, '-').replace(/…/g, '...').replace(/\s+/g, ' ') + ' ';
const quotes = t => (Array.isArray(t) ? t : [t]).filter(Boolean);
const compose = e => [`Vị trí: ${e.v}`, `Transcript: ${quotes(e.t).map(x => `“${x}”`).join(' … ')}`, `Phân tích: ${e.p}`].join('\n\n');
const tagOf = s => `ito_CAM${s.book}_L${s.test}_S${s.part}`;
const specOf = id => ({ id, ...require(path.join(__dirname, 'ito', `${id}.js`)) });

function build(id) {
  const spec = specOf(id), problems = [];
  const transcript = transcriptOf(spec);
  const groups = spec.groups.map(g => ({ ...g, questions: g.questions.map(q => ({ ...q })) }));
  const qs = groups.flatMap(g => g.questions);
  const want = Array.from({ length: 10 }, (_, i) => (spec.part - 1) * 10 + 1 + i);
  if (qs.map(x => x.questionNumber).sort((a, b) => a - b).join() !== want.join()) problems.push(`question numbers ${qs.map(x => x.questionNumber).join(',')}`);
  for (const g of groups) for (const x of g.questions) {
    if (!x.correctAnswer) problems.push(`Q${x.questionNumber}: no key`);
    if (['multiple-choice', 'multi-answer-group', 'map-labelling', 'matching-info'].includes(x.type) && !/^[A-Z]$/.test(x.correctAnswer)) problems.push(`Q${x.questionNumber}: letter key "${x.correctAnswer}"`);
    if (x.options.length && /^[A-Z]$/.test(x.correctAnswer) && x.correctAnswer.charCodeAt(0) - 65 >= x.options.length) problems.push(`Q${x.questionNumber}: key beyond options`);
    if (g.groupType === 'matching-options' && x.correctAnswer.charCodeAt(0) - 65 >= g.matchingOptions.length) problems.push(`Q${x.questionNumber}: matching key beyond options`);
    const e = (spec.expl || {})[x.questionNumber];
    if (!e) { problems.push(`Q${x.questionNumber}: no explanation`); continue; }
    for (const t of quotes(e.t)) if (!norm(transcript).includes(norm(t).trim())) problems.push(`Q${x.questionNumber}: quote not in transcript: "${t.slice(0, 70)}"`);
    const variants = String(x.correctAnswer).split('/').map(v => norm(v).trim());
    if (!String(e.p).includes('→') || !variants.some(v => norm(String(e.p).split('→').pop()).includes(v))) problems.push(`Q${x.questionNumber}: analysis must end "→ ${x.correctAnswer.split('/')[0]}"`);
    x.explanation = compose(e);
    if (x.type === 'fill-blank' && !variants.some(v => norm(transcript.replace(/\b[A-Z](?:-[A-Z])+\b/g, m => m.replace(/-/g, ''))).includes(v) || norm(transcript).includes(v)))
      problems.push(`Q${x.questionNumber}: key "${x.correctAnswer}" not in transcript (check)`);
  }
  if (spec.map && !fs.existsSync(path.join(__dirname, spec.map.file))) problems.push(`map image missing ${spec.map.file}`);
  const draft = {
    partNumber: spec.part, title: spec.title, description: '', transcript,
    questionRange: { start: want[0], end: want[9] }, questionGroups: groups,
    isActive: false, isActualTest: true, audioFileName: `${tagOf(spec)}.mp3`,
  };
  fs.mkdirSync(W('draft'), { recursive: true });
  fs.writeFileSync(W('draft', `${id}.json`), JSON.stringify(draft, null, 1));
  console.log(`${problems.length ? '✗' : '✓'} ${id} Quýt ${spec.book} T${spec.test} S${spec.part} ${spec.title} (${transcript.split(/\s+/).length} words)${problems.length ? '\n   ' + problems.join('\n   ') : ''}`);
  return problems.length;
}

const ffmpeg = () => execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
function durationOf(ff, file) {
  let txt = '';
  try { execFileSync(ff, ['-i', file], { stdio: 'pipe' }); } catch (e) { txt = String(e.stderr); }
  const m = txt.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? Math.round(+m[1] * 3600 + +m[2] * 60 + +m[3]) : 0;
}

async function importAll() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../../models/ListeningSection');
  const { uploadAudio, uploadImageFrom } = require('../../services/r2Service');
  const ff = ffmpeg();
  await mongoose.connect(process.env.MONGO_URI);
  try {
    for (const id of ids) {
      const spec = specOf(id), d = JSON.parse(fs.readFileSync(W('draft', `${id}.json`), 'utf8'));
      const dup = await ListeningSection.findOne({ audioFileName: d.audioFileName }).select('_id').lean();
      if (dup || imported[id]) { console.log(`SKIP ${id}: already in DB (${dup ? dup._id : imported[id]})`); continue; }
      // same 64k mono mp3 as the other sections
      const mp3 = W(`${id}_64k.mp3`);
      if (!fs.existsSync(mp3)) execFileSync(ff, ['-y', '-loglevel', 'error', '-i', W(`${id}.mp3`), '-vn', '-ac', '1', '-ar', '44100', '-b:a', '64k', mp3]);
      const dur = durationOf(ff, mp3);
      console.log(`${apply ? 'IMPORT' : 'DRY'} ${id} P${d.partNumber} ${d.title} — audio ${dur}s${spec.map ? ', map' : ''}`);
      if (!apply) continue;
      const tag = tagOf(spec);
      const au = await uploadAudio(mp3, { folder: 'listening-sections', public_id: tag });
      if (spec.map) d.questionGroups[spec.map.group].imageUrl = (await uploadImageFrom(path.join(__dirname, spec.map.file), `listening-maps/${tag}_g${spec.map.group}`)).secure_url;
      const s = await ListeningSection.create({ ...d, audioUrl: au.secure_url, audioDuration: dur || Math.round(au.duration || 0), isActive: false });
      imported[id] = String(s._id);
      fs.writeFileSync(IMPORTED, JSON.stringify(imported, null, 1));
      console.log(`  ✓ ${s._id} ${au.secure_url}`);
    }
  } finally { await mongoose.disconnect(); }
}

async function activate() {
  const mongoose = require('mongoose');
  const ListeningSection = require('../../models/ListeningSection');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    for (const id of ids) {
      const s = imported[id] && await ListeningSection.findById(imported[id]);
      if (!s) { console.log(`✗ ${id}: not imported`); continue; }
      const qs = s.questionGroups.flatMap(g => g.questions);
      const why = [];
      if (qs.length !== 10 || qs.some(q => !q.explanation || q.explanation.length < 20)) why.push('questions/explanations');
      if (!s.audioUrl) why.push('audio');
      if (!s.transcript || s.transcript.length < 500) why.push('transcript');
      if (!s.thumbnailUrl) why.push('cover');
      if (s.questionGroups.some(g => g.groupType === 'map' && !g.imageUrl)) why.push('map image');
      console.log(`${why.length ? '✗' : '✓'} ${id} ${s.title}${why.length ? ' — missing ' + why.join(', ') : ''}`);
      if (!why.length && apply) { s.isActive = true; await s.save(); }
    }
  } finally { await mongoose.disconnect(); }
}

if (cmd === 'build') { let bad = 0; for (const id of ids) bad += build(id); process.exitCode = bad ? 1 : 0; }
else if (cmd === 'import') importAll();
else if (cmd === 'activate') activate();
else console.log('usage: node ito_sections.js build|import|activate [ids] [--apply]');
