// Put the book pictures the theory cards use (charts, maps, process diagrams,
// the book's own tables drawn as images) on R2 and record their URLs in
// bookImages.json — buildBookTheory.js reads that map.
//
//   node backend/scripts/bookTheory/buildBookTheory.js --writing wbook.json --dry --missing need.json
//   node backend/scripts/bookTheory/uploadBookImages.js "task 1 grammar/AcademicWritingFull_DanielHa.docx" need.json
//
// Keys are the docx media names ("media/image8.png"); already-mapped names are
// skipped, so re-runs only upload new pictures.
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const [docx, needFile] = process.argv.slice(2);
if (!docx || !needFile) {
  console.error('Usage: node scripts/bookTheory/uploadBookImages.js <book.docx> <need.json>');
  process.exit(1);
}
const MAP = path.join(__dirname, 'bookImages.json');
const FOLDER = 'course-theory/' + path.basename(docx, '.docx').replace(/[^A-Za-z0-9]+/g, '-').toLowerCase();

(async () => {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });
  const r2 = require('../../services/r2Service');
  if (!r2.isConfigured()) throw new Error('R2 chưa cấu hình (.env R2_*)');
  const map = fs.existsSync(MAP) ? JSON.parse(fs.readFileSync(MAP, 'utf8')) : {};
  const need = JSON.parse(fs.readFileSync(needFile, 'utf8')).filter((n) => !map[n]);
  for (const name of need) {
    const buf = execFileSync('unzip', ['-p', docx, 'word/' + name], { maxBuffer: 1 << 28 });
    const up = await r2.uploadImageFrom(buf, `${FOLDER}/${path.basename(name).replace(/\.[a-z]+$/i, '')}`, { maxWidth: 1400 });
    map[name] = up.secure_url;
    fs.writeFileSync(MAP, JSON.stringify(map, null, 2) + '\n');
    console.log(`  ↑ ${name} → ${up.secure_url}`);
  }
  console.log(`Xong: ${need.length} ảnh mới, ${Object.keys(map).length} ảnh trong bookImages.json`);
})().catch((e) => { console.error(e); process.exit(1); });
