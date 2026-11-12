// scripts/seedMindsetMedia.js
// Step 1 of seeding a Mindset course (step 2 = scripts/seedCourse.js <key>):
//
//   node scripts/seedMindsetMedia.js mindset0          # upload + upsert
//   node scripts/seedMindsetMedia.js mindset0 --dry    # validate only
//   node scripts/seedMindsetMedia.js mindset0 --upload-only  # R2 only, no DB writes
//
// 1. Uploads to R2 every local file the course data points at, once:
//      - Listening audio  (sections[].audioFile, from AUDIO_DIR below)
//      - book pictures    (data/<dir>/img/*.jpg — cut from the Student's Book)
//    The public URLs are cached in data/<dir>/media.json (commit it), so a
//    re-run never re-uploads. seedCourse.js swaps any "media:<file>" string in
//    lessons*/exercises-* for that URL.
// 2. Upserts the course's Reading passages / Listening sections from
//    data/<dir>/practice-*.json  ({ passages: [], sections: [] }) by
//    `courseRef`, so they open in the normal reading.html / listening.html
//    UI but stay out of every practice list (utils/courseContent.js).
//    Re-running keeps each doc's _id (lesson links stay valid) and never
//    touches student attempts.
'use strict';

const fs = require('fs');
const path = require('path');

const COURSES = {
  mindset0: {
    dir: 'mindset0',
    r2Folder: 'mindset/foundation',
    audioDir: path.join(__dirname, '..', '..', 'Mindset curriculum', 'mindset 0 au'),
  },
};

const key = process.argv.slice(2).find((a) => !a.startsWith('--'));
const COURSE = COURSES[key];
if (!COURSE) {
  console.error('Usage: node scripts/seedMindsetMedia.js <' + Object.keys(COURSES).join('|') + '> [--dry]');
  process.exit(1);
}
const DRY = process.argv.includes('--dry');
const DATA_DIR = path.join(__dirname, 'data', COURSE.dir);
const IMG_DIR = path.join(DATA_DIR, 'img');
const MEDIA_FILE = path.join(DATA_DIR, 'media.json');

function loadPractice() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => /^practice-.*\.json$/.test(f)).sort();
  let passages = [];
  let sections = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
    passages = passages.concat(j.passages || []);
    sections = sections.concat(j.sections || []);
  }
  return { files, passages, sections };
}

// Every "media:<file>" string anywhere in the course JSON.
function mediaRefs() {
  const out = new Set();
  for (const f of fs.readdirSync(DATA_DIR).filter((x) => x.endsWith('.json') && x !== 'media.json')) {
    const raw = fs.readFileSync(path.join(DATA_DIR, f), 'utf8');
    for (const m of raw.matchAll(/media:([A-Za-z0-9_.-]+\.(?:jpg|png|webp))/g)) out.add(m[1]);
  }
  return [...out];
}

function validate({ passages, sections }) {
  const errs = [];
  const refs = new Set();
  const qCheck = (owner, groups) => {
    for (const g of groups || []) {
      for (const q of g.questions || []) {
        if (!q.correctAnswer) errs.push(`${owner} Q${q.questionNumber}: thiếu correctAnswer`);
        if (q.type === 'multiple-choice' && !(q.options || []).length) errs.push(`${owner} Q${q.questionNumber}: MCQ thiếu options`);
        if (q.type === 'multiple-choice' && !/^[A-Z]$/.test(q.correctAnswer)) errs.push(`${owner} Q${q.questionNumber}: đáp án MCQ phải là 1 chữ cái`);
      }
    }
  };
  for (const p of passages) {
    if (!p.courseRef) errs.push(`passage "${p.title}": thiếu courseRef`);
    if (refs.has(p.courseRef)) errs.push(`trùng courseRef ${p.courseRef}`);
    refs.add(p.courseRef);
    if (!p.content) errs.push(`${p.courseRef}: thiếu content`);
    qCheck(p.courseRef, p.questionGroups);
  }
  for (const s of sections) {
    if (!s.courseRef) errs.push(`section "${s.title}": thiếu courseRef`);
    if (refs.has(s.courseRef)) errs.push(`trùng courseRef ${s.courseRef}`);
    refs.add(s.courseRef);
    if (!s.audioFile) errs.push(`${s.courseRef}: thiếu audioFile`);
    else if (!fs.existsSync(path.join(COURSE.audioDir, s.audioFile))) errs.push(`${s.courseRef}: không thấy file audio ${s.audioFile}`);
    qCheck(s.courseRef, s.questionGroups);
  }
  for (const f of mediaRefs()) if (!fs.existsSync(path.join(IMG_DIR, f))) errs.push(`media:${f} — không có file ${path.join('img', f)}`);
  return errs;
}

// Question range from the numbered questions (Passage/ListeningSection require it).
function rangeOf(groups) {
  const nums = (groups || []).flatMap((g) => (g.questions || []).map((q) => q.questionNumber));
  return nums.length ? { start: Math.min(...nums), end: Math.max(...nums) } : { start: 1, end: 1 };
}

async function main() {
  const data = loadPractice();
  const errs = validate(data);
  console.log(`[${key}] ${data.passages.length} passage · ${data.sections.length} section · ${mediaRefs().length} ảnh (${data.files.join(', ') || 'chưa có practice-*.json'})`);
  if (errs.length) {
    console.error('\n❌ Lỗi dữ liệu:\n' + errs.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }
  console.log('✅ Validate xong');
  if (DRY) return;

  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
  const r2 = require('../services/r2Service');
  if (!r2.isConfigured()) throw new Error('R2 chưa cấu hình (.env R2_*)');
  const media = fs.existsSync(MEDIA_FILE) ? JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf8')) : {};
  const saveMedia = () => fs.writeFileSync(MEDIA_FILE, JSON.stringify(media, null, 2) + '\n');

  // ── uploads (cached) ──
  for (const s of data.sections) {
    const k = 'audio/' + s.audioFile;
    if (media[k]) continue;
    const up = await r2.uploadAudio(path.join(COURSE.audioDir, s.audioFile), {
      folder: COURSE.r2Folder + '/audio',
      public_id: s.audioFile.replace(/\.mp3$/i, '') + '_' + Date.now(),
    });
    media[k] = { url: up.secure_url, duration: Math.round(up.duration || 0) };
    saveMedia();
    console.log(`  ↑ audio ${s.audioFile} → ${up.secure_url}`);
  }
  for (const f of mediaRefs()) {
    if (media[f]) continue;
    const up = await r2.uploadImageFrom(path.join(IMG_DIR, f), `${COURSE.r2Folder}/img/${f.replace(/\.[a-z]+$/, '')}`, { maxWidth: 1400 });
    media[f] = up.secure_url;
    saveMedia();
    console.log(`  ↑ img ${f} → ${up.secure_url}`);
  }
  // --upload-only: put audio/images on R2 now, write the DB later (e.g. after
  // the code that hides courseRef docs from the practice lists is deployed).
  if (process.argv.includes('--upload-only')) { console.log('\nĐã upload xong (--upload-only, chưa ghi DB).'); return; }
  const resolve = (v) => JSON.parse(JSON.stringify(v).replace(/media:([A-Za-z0-9_.-]+\.(?:jpg|png|webp))/g, (m, f) => media[f] || m));

  // ── DB upserts ──
  const mongoose = require('mongoose');
  const Passage = require('../models/Passage');
  const ListeningSection = require('../models/ListeningSection');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    for (const p of data.passages) {
      const doc = resolve({
        title: p.title, category: p.category || 'passage1', content: p.content,
        questionGroups: p.questionGroups, questions: [], questionRange: rangeOf(p.questionGroups),
        difficulty: p.difficulty || 'easy', tags: p.tags || ['mindset'], isActive: true,
        thumbnailUrl: p.thumbnailUrl || '', courseRef: p.courseRef,
      });
      await Passage.findOneAndUpdate({ courseRef: p.courseRef }, { $set: doc }, { upsert: true, setDefaultsOnInsert: true, runValidators: true });
      console.log(`  ✓ passage ${p.courseRef} — ${p.title}`);
    }
    for (const s of data.sections) {
      const a = media['audio/' + s.audioFile];
      const doc = resolve({
        partNumber: s.partNumber || 1, title: s.title, description: s.description || '',
        audioUrl: a.url, audioFileName: s.audioFile, audioDuration: a.duration || 0,
        transcript: s.transcript || '', questionRange: rangeOf(s.questionGroups),
        questionGroups: s.questionGroups, isActive: true, thumbnailUrl: s.thumbnailUrl || '',
        courseRef: s.courseRef,
      });
      await ListeningSection.findOneAndUpdate({ courseRef: s.courseRef }, { $set: doc }, { upsert: true, setDefaultsOnInsert: true, runValidators: true });
      console.log(`  ✓ section ${s.courseRef} — ${s.title}`);
    }
  } finally {
    await mongoose.disconnect();
  }
  console.log('\nXong. Tiếp theo: node scripts/seedCourse.js ' + key);
}

main().catch((e) => { console.error(e); process.exit(1); });
