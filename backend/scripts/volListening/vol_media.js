// Local media for VOL drafts: the vol folder, a part's audio as mp3 (mp4/m4a/wma → mp3 via ffmpeg), and map crops
// from the scanned PDF (group._crop = { page, box: [x0,y0,x1,y1] in PDF points }).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

let ffPath;
const ffmpeg = () => ffPath || (ffPath = execFileSync('py', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim());

function volDir(vol) {
  const root = path.join(__dirname, '..', '..', '..');
  const outer = fs.readdirSync(root).find(d => new RegExp(`^VOL ${vol}\\b.*ORIGINAL EXAMS`, 'i').test(d) && fs.statSync(path.join(root, d)).isDirectory());
  const o = path.join(root, outer);
  return path.join(o, fs.readdirSync(o).find(d => fs.statSync(path.join(o, d)).isDirectory()));
}

// a file of the vol by its path; when it does not exist as written, the one in that folder whose name ENDS with the
// given name (Vol 2+ files carry a mojibake "Bản sao của Bản sao của " prefix: spec says 'listening/test 1/part 1.mp3')
function findFile(vol, rel) {
  const full = path.join(volDir(vol), rel);
  if (fs.existsSync(full)) return full;
  const dir = path.dirname(full), base = path.basename(full).toLowerCase();
  const hit = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(base) && /[^a-z0-9]$/i.test(f.slice(0, f.length - base.length) || ' '));
  if (hit.length !== 1) throw new Error(`file ${rel}: ${hit.length} matches`);
  return path.join(dir, hit[0]);
}

// mp3 of a part (original file when it is already mp3), cached under web/vol<V>/audio/. clip = [from, to] seconds
// (spec part.clip): that stretch only — Vol 3 Test 1–2 come as one whole-test file, and a part file's tail of
// answer-transfer silence is cut the same way (1 s fade-out)
function partFile(vol, test, part, audio, clip) {
  const src = findFile(vol, audio);
  if (!clip && /\.mp3$/i.test(src)) return src;
  const out = path.join(__dirname, 'web', `vol${vol}`, 'audio', `t${test}p${part}${clip ? `_${clip.join('-')}` : ''}.mp3`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const cut = clip ? ['-ss', String(clip[0]), '-to', String(clip[1])] : [];
  const fade = clip ? ['-af', `afade=t=out:st=${clip[1] - clip[0] - 1}:d=1`] : [];
  if (!fs.existsSync(out)) execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', ...cut, '-i', src, '-vn', ...fade, '-ac', '1', '-ar', '44100', '-b:a', '64k', out]);
  return out;
}
const audioFor = draft => partFile(draft._vol, draft._test, draft.partNumber, draft._audio, draft._clip);

function durationOf(file) {
  let txt = '';
  try { execFileSync(ffmpeg(), ['-i', file], { stdio: 'pipe' }); } catch (e) { txt = String(e.stderr); }
  const m = txt.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? Math.round(+m[1] * 3600 + +m[2] * 60 + +m[3]) : 0;
}

// PNG crop of a map group, cached under web/vol<V>/maps/
function cropFor(draft, gi) {
  const c = draft.questionGroups[gi]._crop;
  const out = path.join(__dirname, 'web', `vol${draft._vol}`, 'maps', `t${draft._test}p${draft.partNumber}_g${gi}.png`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // Vol 1: test <T>/<one pdf>; Vol 2+: listening/test <T>/Test <T>.pdf (beside per-part transcript pdfs)
  let dir = path.join(volDir(draft._vol), `test ${draft._test}`);
  if (!fs.existsSync(dir)) dir = path.join(volDir(draft._vol), 'listening', `test ${draft._test}`);
  const pdfs = fs.readdirSync(dir).filter(f => /\.pdf$/i.test(f));
  // c.pdf: the question paper by its path in the vol (Vol 4 names vary: "listening- up.pdf", "test 2- listening (2).pdf")
  const pdf = c.pdf ? findFile(draft._vol, c.pdf) : path.join(dir, pdfs.find(f => /^Test ?\d+(?:\s*-\s*up)?\s*\.pdf$/i.test(f)) || pdfs[0]);
  execFileSync('py', [path.join(__dirname, 'crop.py'), pdf, String(c.page), ...c.box.map(String), out], { stdio: 'pipe' });
  return out;
}

module.exports = { volDir, findFile, partFile, audioFor, durationOf, cropFor };
