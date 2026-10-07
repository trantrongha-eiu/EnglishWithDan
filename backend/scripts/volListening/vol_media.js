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

// mp3 of a part (original file when it is already mp3), cached under web/vol<V>/audio/
function audioFor(draft) {
  const src = path.join(volDir(draft._vol), draft._audio);
  if (/\.mp3$/i.test(src)) return src;
  const out = path.join(__dirname, 'web', `vol${draft._vol}`, 'audio', `t${draft._test}p${draft.partNumber}.mp3`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (!fs.existsSync(out)) execFileSync(ffmpeg(), ['-y', '-loglevel', 'error', '-i', src, '-vn', '-ac', '2', '-ar', '44100', '-b:a', '128k', out]);
  return out;
}

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
  const dir = path.join(volDir(draft._vol), `test ${draft._test}`);
  const pdf = path.join(dir, fs.readdirSync(dir).find(f => /\.pdf$/i.test(f)));
  execFileSync('py', [path.join(__dirname, 'crop.py'), pdf, String(c.page), ...c.box.map(String), out], { stdio: 'pipe' });
  return out;
}

module.exports = { volDir, audioFor, durationOf, cropFor };
