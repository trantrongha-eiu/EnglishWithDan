'use strict';
// ⚔️ Đấu trường — "Nhìn hình đoán từ" picture words (pictures.txt) → R2 →
// data/vocabBattle/pictureWords.json (read by services/vocabBattleBank.js).
//
//   node scripts/vocabBattlePictures/build.js            download + check + contact sheets (shots/)
//   node scripts/vocabBattlePictures/build.js --upload   … + upload new pictures to R2, write the JSON
//
// Pictures = Microsoft Fluent Emoji 3D (MIT licence): one PNG per emoji at
// raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/<Name>/3D/…
// (people: <Name>/Default/3D/…). The repo tree is read once (GitHub API) to
// find each folder's file. Downloads are cached in shots/cache/, uploaded
// URLs in data/pictureUploads.json, so a re-run only uploads new lines.
// R2 objects are immutable: a key is never overwritten (random suffix).
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const UPLOAD = process.argv.includes('--upload');
const SRC = path.join(__dirname, 'pictures.txt');
const CACHE = path.join(__dirname, 'shots', 'cache');
const SHOTS = path.join(__dirname, 'shots');
const UPLOADS = path.join(__dirname, '..', 'data', 'pictureUploads.json');
const OUT = path.join(__dirname, '..', '..', 'data', 'vocabBattle', 'pictureWords.json');
const TREE = 'https://api.github.com/repos/microsoft/fluentui-emoji/git/trees/main?recursive=1';
const RAW = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/';

function parse() {
  const sets = [];
  let set = null;
  const errors = [];
  for (const [n, raw] of fs.readFileSync(SRC, 'utf8').split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line || (line.startsWith('#') && !line.startsWith('##'))) continue;
    let m;
    if ((m = /^## (\w+) \| (.+)$/.exec(line))) { set = { id: m[1], title: m[2].trim(), words: [], near: [] }; sets.push(set); continue; }
    if (!set) { errors.push(`line ${n + 1}: before any set`); continue; }
    if (line.startsWith('~')) { set.near.push(line.slice(1).split(',').map((s) => s.trim()).filter(Boolean)); continue; }
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length !== 3 || parts.some((p) => !p)) { errors.push(`line ${n + 1}: "${line}"`); continue; }
    set.words.push({ emoji: parts[0], word: parts[1], meaning: parts[2] });
  }
  // checks: unique words, near groups only name words of the set
  const seen = new Map();
  for (const s of sets) {
    const inSet = new Set(s.words.map((w) => w.word.toLowerCase()));
    for (const w of s.words) {
      const k = w.word.toLowerCase();
      if (seen.has(k)) errors.push(`"${w.word}" twice (${seen.get(k)} + ${s.id})`);
      seen.set(k, s.id);
    }
    for (const g of s.near) for (const x of g) if (!inSet.has(x.toLowerCase())) errors.push(`${s.id}: near "${x}" is not a word of the set`);
  }
  return { sets, errors };
}

async function fetchBuf(url, tries = 4) {
  for (let i = 0; ; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': 'EnglishWithDan-vocab-battle/1.0' } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (i >= tries - 1) throw new Error(`${res.status} ${url}`);
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
}

async function folderFiles() {
  const tree = JSON.parse((await fetchBuf(TREE)).toString('utf8'));
  const map = new Map(); // lower-case folder → file path (3D, default skin tone)
  for (const x of tree.tree) {
    const m = /^assets\/([^/]+)\/(?:Default\/)?3D\/[^/]+\.png$/.exec(x.path);
    if (m && !map.has(m[1].toLowerCase())) map.set(m[1].toLowerCase(), x.path);
  }
  return map;
}

// 6×N grid of the pictures with their word, to check by eye
async function contactSheets(items) {
  const CELL = 170;
  const COLS = 8;
  const PER = 48;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  for (let p = 0; p * PER < items.length; p++) {
    const page = items.slice(p * PER, (p + 1) * PER);
    const rows = Math.ceil(page.length / COLS);
    const comps = [];
    for (const [i, it] of page.entries()) {
      const x = (i % COLS) * CELL;
      const y = Math.floor(i / COLS) * CELL;
      comps.push({ input: await sharp(it.buf).resize(120, 120).png().toBuffer(), left: x + 25, top: y + 5 });
      const svg = `<svg width="${CELL}" height="40" xmlns="http://www.w3.org/2000/svg"><text x="${CELL / 2}" y="16" font-size="15" font-family="Arial" text-anchor="middle" fill="#000">${esc(it.word)}</text><text x="${CELL / 2}" y="34" font-size="12" font-family="Arial" text-anchor="middle" fill="#555">${esc(it.set)}</text></svg>`;
      comps.push({ input: Buffer.from(svg), left: x, top: y + 128 });
    }
    await sharp({ create: { width: COLS * CELL, height: rows * CELL, channels: 3, background: '#ffffff' } })
      .composite(comps).png().toFile(path.join(SHOTS, `sheet_${p}.png`));
  }
}

(async () => {
  const { sets, errors } = parse();
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  const total = sets.reduce((n, s) => n + s.words.length, 0);
  console.log(`${sets.length} sets, ${total} words`);
  fs.mkdirSync(CACHE, { recursive: true });
  const files = await folderFiles();
  const items = [];
  const missing = [];
  for (const s of sets) {
    for (const w of s.words) {
      const file = files.get(w.emoji.toLowerCase());
      if (!file) { missing.push(`${s.id}: ${w.emoji}`); continue; }
      const local = path.join(CACHE, `${w.emoji.replace(/[^a-z0-9]+/gi, '_')}.png`);
      if (!fs.existsSync(local)) fs.writeFileSync(local, await fetchBuf(RAW + file.split('/').map(encodeURIComponent).join('/')));
      items.push({ set: s.id, word: w.word, w, buf: fs.readFileSync(local) });
    }
  }
  if (missing.length) { console.error(`no Fluent picture for:\n  ${missing.join('\n  ')}`); process.exit(1); }
  await contactSheets(items);
  console.log(`contact sheets → ${SHOTS}`);
  if (!UPLOAD) { console.log('dry run — re-run with --upload.'); return; }

  const r2 = require('../../services/r2Service');
  if (!r2.isConfigured()) throw new Error('R2_* env vars missing — see services/r2Service.js');
  const done = fs.existsSync(UPLOADS) ? JSON.parse(fs.readFileSync(UPLOADS, 'utf8')) : {};
  let n = 0;
  for (const it of items) {
    const k = it.w.emoji.toLowerCase();
    if (done[k]) continue;
    const out = await sharp(it.buf).resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 86 }).toBuffer();
    const slug = k.replace(/[^a-z0-9]+/g, '-');
    done[k] = await r2.putObject(`vocab-battle/pictures/${slug}-${crypto.randomBytes(4).toString('hex')}.webp`, out, 'image/webp');
    n += 1;
    if (n % 25 === 0) { fs.writeFileSync(UPLOADS, JSON.stringify(done, null, 1)); console.log(`  ${n} uploaded…`); }
  }
  fs.writeFileSync(UPLOADS, JSON.stringify(done, null, 1));
  console.log(`${n} new uploads`);

  const json = {
    credit: 'Pictures: Microsoft Fluent Emoji (MIT) — github.com/microsoft/fluentui-emoji',
    sets: sets.map((s) => ({
      id: s.id, title: s.title,
      words: s.words.map((w) => ({
        word: w.word, meaning: w.meaning, imageUrl: done[w.emoji.toLowerCase()],
        near: s.near.filter((g) => g.some((x) => x.toLowerCase() === w.word.toLowerCase())).flat()
          .filter((x) => x.toLowerCase() !== w.word.toLowerCase()),
      })),
    })),
  };
  fs.writeFileSync(OUT, JSON.stringify(json));
  console.log(`→ ${path.relative(process.cwd(), OUT)} (${total} words)`);
})().catch((e) => { console.error(e); process.exit(1); });
