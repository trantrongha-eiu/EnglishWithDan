/* global document, lessonState, renderLearnTab, renderQuizQuestion, buildQuizQueue */
// Preview the idiom illustrations BEFORE deploy, without logging in: a local harness page that
// loads the working tree's CSS + js/dashboard-lesson.js and feeds it the lesson straight from
// the DB (read-only). Renders the Learn grid and one Quiz question of each type.
//   → shots/learn.png, shots/quiz_<type>.png (+ _mobile variants)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const { chromium } = require('../../../node_modules/playwright');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const FE = path.join(__dirname, '..', '..', '..', 'frontend');
const SHOTS = path.join(__dirname, 'shots');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const lesson = await mongoose.connection.collection('vocabularylessons').findOne({ title: 'IELTS Speaking – Idioms thông dụng' }, { projection: { rawImport: 0 } });
  await mongoose.disconnect();
  const css = ['tokens', 'components', 'dashboard'].map(n => `<link rel="stylesheet" href="${n}.css">`).join('');
  const html = `<!doctype html><html data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">${css}</head>
    <body style="padding:16px;background:var(--bg)"><div class="vocab-grid" id="lesson-learn-grid"></div><div id="lesson-tab-quiz"></div>
    <script>window.escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    window.shuffleArray=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
    window.speakWord=()=>{};window.API='';window.authH=()=>({});</script>
    <script src="dashboard-lesson.js"></script></body></html>`;
  const tmp = path.join(__dirname, 'web', 'preview');
  fs.mkdirSync(tmp, { recursive: true });
  fs.writeFileSync(path.join(tmp, 'index.html'), html);
  for (const n of ['tokens', 'components', 'dashboard']) fs.copyFileSync(path.join(FE, 'css', `${n}.css`), path.join(tmp, `${n}.css`));
  fs.copyFileSync(path.join(FE, 'js', 'dashboard-lesson.js'), path.join(tmp, 'dashboard-lesson.js'));

  const browser = await chromium.launch();
  for (const [suffix, vp] of [['', { width: 1500, height: 1000 }], ['_mobile', { width: 390, height: 860 }]]) {
    const page = await browser.newPage({ viewport: vp });
    page.on('pageerror', e => console.log('pageerror', e.message));
    await page.goto('file:///' + path.join(tmp, 'index.html').replace(/\\/g, '/'));
    await page.evaluate(l => { lessonState.currentLesson = l; renderLearnTab(); }, JSON.parse(JSON.stringify(lesson)));
    await page.waitForTimeout(4000);
    console.log('learn' + suffix, await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('.vocab-card-img')];
      return { cards: document.querySelectorAll('.vocab-card').length, imgs: imgs.length, loaded: imgs.filter(i => i.complete && i.naturalWidth).length };
    }));
    await page.screenshot({ path: path.join(SHOTS, `learn${suffix}.png`) });
    await page.evaluate(() => { document.getElementById('lesson-learn-grid').innerHTML = ''; });
    for (const type of ['mcq', 'translateEnVi', 'fill', 'listen', 'rearrange']) {
      await page.evaluate(t => {
        const w = lessonState.currentLesson.words;
        lessonState.quiz.queue = buildQuizQueue(w).map(q => ({ ...q, type: t }));
        lessonState.quiz.index = 0;
        renderQuizQuestion();
      }, type);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SHOTS, `quiz_${type}${suffix}.png`) });
    }
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
