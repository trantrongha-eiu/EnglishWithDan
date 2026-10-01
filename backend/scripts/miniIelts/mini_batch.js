// Build ../data/miniIeltsReading/<name>.json = [{source, imageUrl, doc}] from web/mini/final_<id>.json + x_<id>.json,
// and download each candidate cover image (x.imgs[0]) to shots/cover_<id>.<ext> so it can be checked by eye.
// Usage: node mini_batch.js <name> <ids…> [--no-download]     (imageUrl overrides: set to null by hand afterwards)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const [name, ...rest] = process.argv.slice(2);
const ids = rest.filter(a => !a.startsWith('--'));
const out = [];
for (const id of ids) {
  const x = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'mini', `x_${id}.json`), 'utf8'));
  const doc = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'mini', `final_${id}.json`), 'utf8'));
  const imageUrl = x.imgs && x.imgs[0] ? x.imgs[0].replace(/&amp;/g, '&') : null;
  out.push({ source: `https://mini-ielts.com/${id}/reading/${x.slug}`, imageUrl, doc });
  if (imageUrl && !rest.includes('--no-download')) {
    const ext = (imageUrl.match(/\.(jpe?g|png|gif|webp)(\?|$)/i) || [, 'jpg'])[1];
    try { execFileSync('curl', ['-sL', '-m', '30', '-A', 'Mozilla/5.0', imageUrl, '-o', path.join(__dirname, 'shots', `cover_${id}.${ext}`)]); } catch (e) { console.log(`  ${id}: download failed`); }
  }
  console.log(`${id} ${doc.title} | ${imageUrl || '(no image)'}`);
}
const file = path.join(__dirname, '..', 'data', 'miniIeltsReading', `${name}.json`);
fs.writeFileSync(file, JSON.stringify(out, null, 1));
console.log(`\nwrote ${file} (${out.length} passages)`);
