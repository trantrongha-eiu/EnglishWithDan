// @ts-check
/**
 * Task 2 Luyện đề tuần in the React app (/app/task2-practice) against its old
 * static page (task2-practice.html?legacy=1).
 *
 * The API is a mock built from the repo's own seed data
 * (backend/scripts/seedTask2Exercises.js topics + backend/scripts/data/task2/
 * typeGuides.js); the template text is the real js/task2-generic-templates.js.
 * Production is never touched. Each screen is opened both ways with the same
 * data and compared: the text, the box and main styles of every element, and
 * what each action sends.
 *
 * Run: npx playwright test e2e/student-app-task2practice.spec.js --workers=1
 *      E2E_FRONTEND=<dir> serves another build, E2E_SHOTS=<dir> saves screenshots.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.resolve(process.env.E2E_FRONTEND || path.join(ROOT, 'frontend'));
const SHOTS = process.env.E2E_SHOTS || '';
const PORT = 3141 + 100 * Number(process.env.TEST_PARALLEL_INDEX || 0);
const BASE = `http://localhost:${PORT}`;
const GUIDES = require(path.join(ROOT, 'backend', 'scripts', 'data', 'task2', 'typeGuides.js'));
const SEED = require(path.join(ROOT, 'backend', 'scripts', 'seedTask2Exercises.js')).topics;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
};
let server;
test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    if (p.startsWith('/app/') && !p.startsWith('/app/assets/')) p = '/app/index.html';
    const file = path.join(FRONTEND, p);
    if (!file.startsWith(FRONTEND) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(PORT, r));
});
test.afterAll(() => new Promise((r) => server.close(r)));

// ── mock data ──
const TOPICS = SEED.map((t) => ({ ...t, _id: `tp${t.week}x${t.orderIndex}`, writingTask2Id: t.week % 2 ? `wt${t.week}x${t.orderIndex}` : undefined }));
const byId = Object.fromEntries(TOPICS.map((t) => [t._id, t]));
const TOPIC = TOPICS.find((t) => t.week === 5);
const TID = TOPIC._id;
const WBW = new Set(['translation', 'paraphrase', 'short_writing']);
const active = (t) => (t.questions || []).filter((q) => q.isActive !== false);
function sanitize(q, hints = true) {
  const { correctAnswer, modelAnswer, ...rest } = q;
  if (q.type === 'rearrange' && !(rest.baseWords || []).length && correctAnswer) rest.baseWords = correctAnswer.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
  if (!hints) { delete rest.fallbackKeywords; delete rest.hints; delete rest.promptVi; }
  if (hints && WBW.has(q.type) && q.type !== 'short_writing' && (correctAnswer || modelAnswer)) rest.translationAnswer = correctAnswer || modelAnswer;
  return rest;
}
const topicRow = (t) => { const { questions, vocabularyList, ...rest } = t; return rest; };
const sentencesOf = (t, done = 0, correct = done) => active(t).filter((q) => WBW.has(q.type))
  .sort((a, b) => (a.type === 'short_writing') - (b.type === 'short_writing') || (a.orderIndex || 0) - (b.orderIndex || 0))
  .map((q, i) => ({ questionId: q.questionId, type: q.type, questionText: q.questionText, model: q.correctAnswer || '', en: i < done ? (q.correctAnswer || 'x') : '', isCorrect: i < done ? i < correct : null }));
const T = '2026-11-20T09:00:00.000Z';
const USER = { _id: 'me1', id: 'me1', username: 'hocvien', firstName: 'An', lastName: 'Trần', role: 'student', plan: 'premium' };
const FREE = { ...USER, plan: 'free', createdAt: '2020-01-01T00:00:00.000Z' };
const vocabDone = (t = TOPIC) => ({ topicId: t._id, savedTerms: [...new Set(t.vocabularyList.map((v) => v.term))], quizBest: 84 });
const DRAFTS = [{ topicId: TOPICS[2]._id, topicName: TOPICS[2].topicName, week: TOPICS[2].week, questionIds: ['a', 'b', 'c', 'd'], currentIdx: 1, sessionDone: 1, savedAt: T }];
const PROGRESS = [{ topicId: TOPICS[0]._id, written: 4, submitted: true }, { topicId: TOPICS[1]._id, written: 2, submitted: false }];
const HISTORY = [
  { _id: 'h1', sessionType: 'practice', topicName: TOPIC.topicName, week: 5, correctCount: 15, totalQuestions: 20, scorePercentage: 75, completedAt: T },
  { _id: 'h2', sessionType: 'exam', topicName: 'Tuần 4', week: 4, correctCount: 4, totalQuestions: 10, scorePercentage: 40, completedAt: T },
];
// Unlocked lesson: vocab done, 15/20 translated right, intro + body1 written
function unlocked(s, { done = 16, correct = 15, sections } = {}) {
  s.vocabProgress = [vocabDone()];
  s.lesson = {
    [TID]: {
      work: { sections: sections || { intro: 'Stress is rising.', body1: 'One major cause of this problem is work pressure.', body2: '', conclusion: '' }, brainstorm: ['work pressure\nsocial media', ''], updatedAt: T },
      sentences: sentencesOf(TOPIC, done, correct),
    },
  };
}

async function open(page, url, state = {}) {
  const log = [];
  const user = state.user || USER;
  await page.addInitScript(([u, theme]) => {
    Math.random = () => 0;
    if (theme) localStorage.setItem('theme', theme);
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('lastLoginAt', String(Date.now()));
    localStorage.setItem('ews_seen_streak35_notice', '1');
    localStorage.setItem('ews_page_help_seen', '1');
    localStorage.setItem('ews_onboarding_tour_v1_dashboard.html', '1');
    localStorage.setItem('ews_onboarding_tour_v1_task2-practice.html', '1');
    localStorage.setItem('t2_progress', JSON.stringify({ xp: 120, streak: 3 }));
    localStorage.setItem('t2_vocab_synced', '1');
    window.speechSynthesis && (window.speechSynthesis.speak = () => {});
    window.__go = (route) => { history.pushState(null, '', '/app' + route); window.dispatchEvent(new PopStateEvent('popstate')); };
  }, [user, state.theme || '']);
  await page.route(/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|media\.ieltsthayha\.com/, (r) => r.abort());
  await page.route('https://englishwithdan.onrender.com/**', (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const p = u.pathname.replace(/^\/api/, '');
    const m = req.method();
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });
    if (m === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    const body = () => { try { return JSON.parse(req.postData() || '{}'); } catch { return {}; } };
    // (the empty vocab-progress sync on page load is not an action)
    if (p.startsWith('/task2/') && m !== 'GET' && !p.startsWith('/task2/cowrite') && !(p === '/task2/vocab-progress/sync' && /"items":\[\]/.test(req.postData() || ''))) {
      log.push(`${m} ${p} ${(req.postData() || '').replace(/"savedAt":"[^"]+"/g, '"savedAt":"T"')}`);
    }
    if (p === '/task2/weeks') {
      const weeks = [...new Set(TOPICS.map((t) => t.week))].map((w) => ({ week: w, topicCount: TOPICS.filter((t) => t.week === w).length }));
      return json({ success: true, weeks });
    }
    if (p === '/task2/sessions') return json({ success: true, sessions: TOPICS.map((t) => ({ _id: t._id, week: t.week, topicName: t.topicName, topicEmoji: t.topicEmoji, essayType: t.essayType })) });
    if (p === '/task2/drafts') return json({ success: true, drafts: state.drafts || [] });
    if (p === '/task2/lessons/progress') return json({ success: true, progress: state.progress || [] });
    if (p === '/task2/vocab-progress/sync') return json({ success: true, progress: state.vocabProgress || [] });
    let mm;
    if ((mm = p.match(/^\/task2\/topics\/week\/(\d+)$/))) return json({ success: true, topics: TOPICS.filter((t) => t.week === Number(mm[1])).map(topicRow) });
    if ((mm = p.match(/^\/task2\/wrong-questions\/(.+)$/))) return json({ success: true, wrongIds: (state.wrong || {})[mm[1]] || [] });
    if ((mm = p.match(/^\/task2\/draft\/(.+)$/))) return json({ success: true, draft: m === 'GET' ? ((state.draft || {})[mm[1]] || null) : undefined });
    if ((mm = p.match(/^\/task2\/topic-stats\/(.+)$/))) return json({ success: true, stats: (state.stats || {})[mm[1]] || { practiced: false, bestScore: 0 } });
    if ((mm = p.match(/^\/task2\/vocabulary\/(.+)$/))) return json({ success: true, vocabularyList: byId[mm[1]]?.vocabularyList || [] });
    if ((mm = p.match(/^\/task2\/lesson\/(.+)$/))) {
      if (m !== 'GET') return json({ success: true });
      const L = (state.lesson || {})[mm[1]];
      return json({ success: true, work: L ? L.work : null, sentences: L ? L.sentences : sentencesOf(byId[mm[1]]), legacyPassed: false });
    }
    if (p === '/task2/type-guides') return json({ success: true, guides: GUIDES });
    if ((mm = p.match(/^\/task2\/questions\/topic\/(.+)$/))) return json({ success: true, questions: active(byId[mm[1]]).map((q) => sanitize(q)) });
    if (p === '/task2/check') {
      const b = body();
      const q = active(byId[b.topicId]).find((x) => x.questionId === b.questionId) || {};
      const ok = String(b.userAnswer || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();
      return json({ success: true, isCorrect: ok, score: ok ? 100 : 30, modelAnswer: q.correctAnswer || '', feedbackVi: ok ? 'Tốt lắm!' : 'Chưa đúng — xem đáp án mẫu.', explanationVi: q.explanationVi || '', aiGraded: q.type === 'short_writing' });
    }
    if (p === '/task2/exam') {
      const w = Number(u.searchParams.get('week'));
      const n = Number(u.searchParams.get('count')) || 10;
      const list = TOPICS.filter((t) => t.week === w).flatMap((t) => active(t).filter((q) => q.type !== 'translation').map((q) => ({ ...sanitize(q, false), topicId: t._id, topicName: t.topicName, prompt: t.prompt })));
      return json({ success: true, questions: list.slice(0, n) });
    }
    if (p === '/task2/exam/submit') {
      const answers = body().answers || [];
      const results = answers.map((a, i) => ({ isCorrect: i % 2 === 0, type: 'fill_blank', level: 'beginner', topicName: TOPIC.topicName, questionText: 'Câu ' + (i + 1), userAnswer: a.userAnswer, modelAnswer: 'answer', explanationVi: i === 0 ? 'Giải thích' : '' }));
      const correct = results.filter((r) => r.isCorrect).length;
      return json({ success: true, score: answers.length ? Math.round(correct / answers.length * 100) : 0, correct, total: answers.length, results });
    }
    if (p === '/task2/history') return json({ success: true, attempts: state.history || [] });
    if ((mm = p.match(/^\/task2\/attempt\/(.+)$/))) {
      return json({ success: true, attempt: { ...HISTORY[0], questions: [{ index: 1, type: 'translation', isCorrect: false, score: 30, questionText: 'Dịch câu', userAnswer: 'abc', modelAnswer: 'def', explanationVi: 'vì…' }, { index: 2, type: 'fill_blank', isCorrect: true, userAnswer: 'x' }] } });
    }
    if (p.startsWith('/task2/cowrite/online')) return json({ success: true, students: [{ _id: 'u2', name: 'Bình Lê', classmate: true }, { _id: 'u3', name: 'Chi Võ', inRoom: 'invited' }] });
    if (p.startsWith('/task2/cowrite/topic')) return json({ success: true, room: null });
    if (p === '/task2/save-attempt' || p === '/task2/draft') return json({ success: true });
    return json({ success: true });
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + url);
  await page.addStyleTag({ content: 'body{margin:0} *,*::before,*::after{animation:none!important;transition:none!important} #pcw-root,.nav-corner-dock,#ews-pet-layer,.ews-mascot-dock,.ask-lulu-bubble,#nav-vocab-goal-nudge,#writing-rewrite-banner{display:none!important}' });
  return { log, errors };
}

function fingerprint(page, sel) {
  return page.evaluate((s) => {
    const root = document.querySelector(s);
    const base = root.getBoundingClientRect();
    const top = base.y + (getComputedStyle(root).position === 'fixed' ? 0 : window.scrollY);
    const out = [{ k: 'ROOT', box: [base.width, base.x, top].map(Math.round) }];
    const PROPS = ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'borderTopWidth', 'borderTopLeftRadius', 'display', 'textAlign', 'paddingLeft', 'paddingTop'];
    for (const el of root.querySelectorAll('*')) {
      if (el.closest('.lh-mascot, .ews-react, .mascot-react, .t2-coach-lulu, .t2-lulu-peek, .t2-tg-lulu') && !el.matches('.lh-mascot, .ews-react, .mascot-react, .t2-coach-lulu, .t2-lulu-peek, .t2-tg-lulu')) continue;
      if (el.closest('svg')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'contents' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      out.push({ k: `${el.tagName.toLowerCase()}.${[...el.classList].filter((c) => !/^(is-enter|is-say|is-jump|is-pop|just-done)$/.test(c)).sort().join('.')}`, box: [r.x - base.x, r.y - base.y, r.width, r.height].map(Math.round), css: PROPS.map((p) => cs[p]).join('|') });
    }
    return out;
  }, sel);
}
function diffPrints(a, b) {
  const out = [];
  if (a.length !== b.length) out.push(`element count ${a.length} (old) vs ${b.length} (new)`);
  for (let i = 0; i < Math.min(a.length, b.length) && out.length < 12; i++) {
    const x = a[i]; const y = b[i];
    if (x.k !== y.k) { out.push(`#${i} ${x.k} vs ${y.k}`); break; }
    if (x.box.some((v, j) => Math.abs(v - y.box[j]) > 2)) out.push(`#${i} ${x.k} box ${x.box} vs ${y.box}`);
    const looks = (e) => (/^(button|input|textarea)\./.test(e.k) ? e.css.split('|').slice(0, -2).join('|') : e.css);
    if (looks(x) !== looks(y)) out.push(`#${i} ${x.k} css ${x.css} vs ${y.css}`);
  }
  return out;
}
const text = async (page, sel) => (await page.locator(sel).innerText()).replace(/\s+/g, ' ').replace(/⏱ \d\d:\d\d/g, '⏱ mm:ss').trim();

// ── steps used on both versions ──
const hub = async (p) => { await p.locator('#t2-step-vocab').waitFor(); await p.locator('.t2-coach-prog').waitFor(); };
const hubReady = async (p) => { await hub(p); await p.locator('#t2-step-vocab .t2-vtasks, #t2-step-vocab .t2-step-desc').first().waitFor(); };
async function startTranslate(p) {
  await hubReady(p);
  await p.locator('#t2-step-translate .t2-primary').click();
  await p.locator('#qcard').waitFor();
}
// Jump with the progress dots to the first question drilled as `cls` (m-mcq …)
async function toMode(p, cls) {
  const dots = p.locator('#q-dots .t2-q-dot');
  const n = await dots.count();
  for (let i = 0; i < n; i++) {
    if (await p.locator(`.wp-exercise-meta .t2-mode.${cls}`).count()) return;
    await dots.nth(i).click();
    await p.waitForTimeout(60);
  }
  await p.locator(`.wp-exercise-meta .t2-mode.${cls}`).waitFor();
}

// Vocab done, nothing translated yet: every drill format comes up
const fresh = (s) => unlocked(s, { done: 0, correct: 0 });
const openRef = async (p) => { const t = p.locator('.t2c-ref-toggle'); if (await t.isVisible()) await t.click(); };
const W = `?week=${TOPIC.week}&topicId=${TID}`;
const PAGES = {
  weeks: { url: '', ready: async (p) => { await p.locator('#t2w-grid .t2w-sess').first().waitFor(); } },
  weeksWorked: { url: '', patch: (s) => { s.drafts = DRAFTS; s.progress = PROGRESS; }, ready: async (p) => { await p.locator('.t2w-continue-row').waitFor({ state: 'attached' }); await p.locator('#t2w-grid .t2w-sess').first().waitFor(); } },
  topics: { url: `?week=${TOPIC.week}`, ready: async (p) => { await p.locator('.t2-topic-card').first().waitFor(); } },
  hubLocked: { url: W, ready: hubReady },
  hubVocabOpen: { url: W, ready: async (p) => { await hubReady(p); await p.locator('#t2-step-vocab .t2-info-btn').click(); } },
  hubUnlocked: { url: W, patch: (s) => unlocked(s, { done: 5, correct: 3, sections: { intro: '', body1: '', body2: '', conclusion: '' } }), ready: async (p) => { await hubReady(p); await p.locator('#t2-step-translate .t2-wc-row').waitFor(); } },
  hubWriting: {
    url: W, patch: (s) => { unlocked(s); s.wrong = { [TID]: ['w5ms_q03'] }; s.draft = { [TID]: { questionIds: ['a', 'b', 'c'], sessionDone: 1, currentIdx: 1, savedAt: T } }; s.stats = { [TID]: { practiced: true, bestScore: 64 } }; },
    ready: async (p) => { await hubReady(p); await p.locator('#t2-step-home .t2-wc-row').waitFor(); await p.locator('.t2-draft-banner').waitFor(); await p.locator('#t2-step-guide .t2-role-para').waitFor(); },
  },
  hubAllInfo: {
    url: W, patch: (s) => unlocked(s), root: '.t2-hub',
    ready: async (p) => { await hubReady(p); await p.locator('#t2-step-home .t2-wc-row').waitFor(); for (const b of await p.locator('.t2-hub .t2-info-btn').all()) await b.click(); await p.locator('.t2-more > summary').click(); await p.locator('.t2-brainstorm-reveal > summary').click(); },
  },
  vocabQuiz: { url: W, ready: async (p) => { await hubReady(p); await p.locator('#t2-step-vocab .t2-secondary, #t2-step-vocab .t2-primary', { hasText: 'quiz' }).first().click(); await p.locator('.t2-quiz-opt').first().waitFor(); } },
  vocabQuizWrong: {
    url: W, ready: async (p) => {
      await hubReady(p); await p.locator('#t2-step-vocab button', { hasText: 'quiz' }).first().click();
      await p.locator('.t2-quiz-opt').nth(3).click(); await p.locator('.t2-quiz-fb').waitFor();
    },
  },
  vocabQuizDone: {
    url: W, ready: async (p) => {
      await hubReady(p); await p.locator('#t2-step-vocab button', { hasText: 'quiz' }).first().click();
      for (let i = 0; i < 30 && !(await p.locator('.t2-quiz-done').count()); i++) {
        await p.locator('.t2-quiz-opt').nth(3).click();
        const nx = p.locator('.t2-quiz-foot .t2-primary');
        if (await nx.count()) await nx.click(); else await p.waitForTimeout(800);
      }
      await p.locator('.t2-quiz-done').waitFor();
    },
  },
  practiceMcq: { url: W, patch: (s) => fresh(s), ready: async (p) => { await startTranslate(p); await toMode(p, 'm-mcq'); } },
  practiceGap: { url: W, patch: (s) => fresh(s), ready: async (p) => { await startTranslate(p); await toMode(p, 'm-gap'); await p.locator('.t2-gf-in').first().fill('wrong'); await p.locator('#submit-btn').click(); } },
  practiceListen: { url: W, patch: (s) => fresh(s), ready: async (p) => { await startTranslate(p); await toMode(p, 'm-listen'); await p.locator('.t2-listen-bar .t2-link').click(); } },
  practiceType: { url: W, patch: (s) => fresh(s), ready: async (p) => { await startTranslate(p); await toMode(p, 'm-type'); await p.locator('#wbw-input').pressSequentially('Sx'); } },
  practiceOrder: { url: W, patch: (s) => unlocked(s), ready: async (p) => { await startTranslate(p); await toMode(p, 'm-order'); await p.locator('#ord-bank .wp-word-chip').first().click(); await p.locator('#ord-bank .wp-word-chip').first().click(); } },
  practiceWrite: { url: W, patch: (s) => unlocked(s), ready: async (p) => { await startTranslate(p); await toMode(p, 'm-write'); await p.locator('.t2-concl-ta').fill('In conclusion, stress is rising. If companies acted, people would be happier.'); } },
  // The sent-back copy counts at once on the new page (old: on the next question)
  feedbackWrong: { drop: '.wp-ex-counter, #q-dots, .wp-progress-bar-wrap',
    url: W, patch: (s) => fresh(s),
    ready: async (p) => { await startTranslate(p); await toMode(p, 'm-mcq'); const opts = p.locator('.t2-gf-opts .t2-mc-option'); for (let i = 0; i < 4; i++) { if (!(await p.locator('#feedback-card').count()) || !(await p.locator('#feedback-card').isVisible())) await opts.nth(i).click(); } await p.locator('#feedback-card').waitFor(); },
  },
  fullPractice: { url: W, patch: (s) => unlocked(s), ready: async (p) => { await hubReady(p); await p.locator('.t2-more > summary').click(); await p.locator('.t2-more .t2-link').first().click(); await p.locator('#qcard').waitFor(); } },
  quitBox: {
    url: W, patch: (s) => fresh(s), root: '.t2-quit-box',
    ready: async (p) => { await startTranslate(p); await toMode(p, 'm-mcq'); await p.locator('.t2-gf-opts .t2-mc-option').first().click(); await p.locator('#feedback-card').waitFor(); await p.locator('.t2-back-btn').click(); await p.locator('.t2-quit-box').waitFor(); },
  },
  done: {
    url: W, patch: (s) => fresh(s),
    ready: async (p) => { await startTranslate(p); await toMode(p, 'm-mcq'); await p.locator('.t2-gf-opts .t2-mc-option').first().click(); await p.locator('#feedback-card').waitFor(); await p.locator('.t2-back-btn').click(); await p.locator('#t2-quit-leave-btn').click(); await p.locator('.t2-done').waitFor(); },
  },
  compose: { url: W + '&write=1', drop: '.t2c-sec-en', patch: (s) => unlocked(s), ready: async (p) => { await p.locator('.t2c-ta').first().waitFor(); await p.locator('.t2cw-bar').waitFor(); } },
  composeHome: { drop: '.t2c-sec-en',
    url: W + '&write=1', patch: (s) => unlocked(s),
    ready: async (p) => { await p.locator('.t2c-ta').first().waitFor(); await p.locator('.t2c-top .t2-seg button').nth(1).click(); await openRef(p); await p.locator('.t2c-tab').nth(3).click();
      // the old page redraws the tab row on a click (scrolled back to the start)
      await p.locator('.t2c-tabs').evaluate((el) => { el.scrollLeft = 0; }); await p.locator('.t2c-tplsec').first().waitFor(); },
  },
  composeTpl: { drop: '.t2c-sec-en',
    url: W + '&write=1', patch: (s) => unlocked(s),
    ready: async (p) => { await p.locator('.t2c-ta').first().waitFor(); await p.locator('#t2c-tpl-btn').click(); await p.locator('#pw-tpl-body .gtpl-sec, #pw-tpl-body > *').first().waitFor(); await p.locator('#pw-tpl-vi-btn').click(); await openRef(p); await p.locator('.t2c-tab').nth(1).click(); },
  },
  teacherGuide: { url: W, root: '.t2-tg-modal', ready: async (p) => { await hubReady(p); await p.locator('.t2-guide-btn').click(); await p.locator('.t2-tg-step').first().waitFor(); await p.locator('#t2-tg-body .t2-flow').first().waitFor(); } },
  history: { url: '', root: '.t2-hist-modal', patch: (s) => { s.history = HISTORY; }, ready: async (p) => { await p.locator('#t2w-hist-btn').click(); await p.locator('.t2-hist-entry').first().waitFor(); } },
  historyDetail: { url: '', root: '.t2-hist-modal', patch: (s) => { s.history = HISTORY; }, ready: async (p) => { await p.locator('#t2w-hist-btn').click(); await p.locator('.t2-hist-entry').first().click(); await p.locator('.wp-wr-item').first().waitFor(); } },
  preview: { url: W, patch: (s) => unlocked(s), root: '.t2-hist-modal', ready: async (p) => { await hubReady(p); await p.locator('.t2-more > summary').click(); await p.locator('.t2-opts-row .t2-link', { hasText: 'Xem trước' }).click(); await p.locator('#t2-preview-body .t2-hist-entry').first().waitFor(); } },
  exam: { url: W, drop: '#exam-timer', ready: async (p) => { await hubReady(p); await p.locator('#t2-step-exam .t2-secondary').click(); await p.locator('#exam-timer').waitFor(); } },
  examDone: {
    url: W, ready: async (p) => {
      await hubReady(p); await p.locator('#t2-step-exam .t2-seg button').first().click(); await p.locator('#t2-step-exam .t2-secondary').click();
      for (let i = 0; i < 12 && !(await p.locator('.t2-done-score').count()); i++) {
        const mc = p.locator('.t2-mc-option'); const fill = p.locator('#fill-input, #answer-box'); const chip = p.locator('#rearrange-bank .wp-word-chip');
        if (await mc.count()) await mc.first().click(); else if (await chip.count()) await chip.first().click(); else if (await fill.count()) await fill.first().fill('abc');
        if (!(await p.locator('.wp-card .wp-submit-btn').count())) break;
        await p.locator('.wp-card .wp-submit-btn').click();
        await p.waitForTimeout(150);
      }
      await p.locator('.t2-done-score').waitFor();
    },
  },
};

async function compare(browser, name, label, { viewport = { width: 1280, height: 900 }, patch = () => {} } = {}) {
  test.setTimeout(120 * 1000);
  const cfg = PAGES[name];
  const root = cfg.root || '#app';
  const snap = async (url, tag) => {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const state = {};
    cfg.patch?.(state);
    patch(state);
    const { errors } = await open(page, url, state);
    await cfg.ready(page);
    if (cfg.drop) await page.locator(cfg.drop).evaluateAll((els) => els.forEach((e) => e.remove()));
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
    const print = await fingerprint(page, root);
    const words = await text(page, root);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `t2p-${name}-${label}-${tag}.png`), fullPage: true });
    await ctx.close();
    return { print, words, errors };
  };
  const old = await snap('/task2-practice.html' + (cfg.url ? cfg.url + '&legacy=1' : '?legacy=1'), 'old');
  const now = await snap('/app/task2-practice' + cfg.url, 'new');
  expect(now.errors).toEqual([]);
  let at = 0;
  while (at < old.words.length && old.words[at] === now.words[at]) at += 1;
  expect(now.words.slice(Math.max(0, at - 40), at + 60)).toBe(old.words.slice(Math.max(0, at - 40), at + 60));
  expect(diffPrints(old.print, now.print)).toEqual([]);
}

const ONLY = process.env.T2P_ONLY ? process.env.T2P_ONLY.split(',') : null;
for (const name of Object.keys(PAGES)) {
  if (ONLY && !ONLY.includes(name)) continue;
  test(`${name} looks the same as the old page (desktop)`, ({ browser }) => compare(browser, name, 'desktop'));
  test(`${name} looks the same as the old page (phone)`, ({ browser }) => compare(browser, name, 'phone', { viewport: { width: 390, height: 844 } }));
  test(`${name} looks the same as the old page (dark)`, ({ browser }) => compare(browser, name, 'dark', { patch: (s) => { s.theme = 'dark'; } }));
}

// ── what each action sends ──
const FLOWS = {
  brainstorm: {
    url: W, patch: (s) => unlocked(s),
    flow: async (p, log) => { await hubReady(p); await p.locator('#t2-idea-1').fill('less sleep'); await expect.poll(() => log.length, { timeout: 6000 }).toBe(1); },
  },
  practice: {
    url: W, patch: (s) => fresh(s),
    flow: async (p, log) => {
      await startTranslate(p);
      await toMode(p, 'm-mcq');
      await p.locator('.t2-gf-opts .t2-mc-option').first().click();
      await p.locator('#feedback-card').waitFor();
      await expect.poll(() => log.length).toBe(1);
      await p.locator('.t2-back-btn').click();
      await p.locator('#t2-quit-save-btn').click();
      await expect.poll(() => log.length).toBe(2);
    },
  },
  practiceTypeAndCheck: {
    url: W, patch: (s) => unlocked(s),
    flow: async (p, log) => {
      await startTranslate(p);
      await toMode(p, 'm-write');
      await p.locator('.t2-concl-ta').fill('In conclusion, stress is a serious problem today. If companies acted, people would be happier and healthier.');
      await p.locator('#submit-btn').click();
      await p.locator('#feedback-card').waitFor();
      await expect.poll(() => log.length).toBe(2);
    },
  },
  compose: { drop: '.t2c-sec-en',
    url: W + '&write=1', patch: (s) => unlocked(s),
    flow: async (p, log) => { await p.locator('#t2c-ta-body2').waitFor(); await p.locator('#t2c-ta-body2').fill('Another cause is social media.'); await expect.poll(() => log.length, { timeout: 6000 }).toBe(1); },
  },
  exam: {
    url: W,
    flow: async (p, log) => {
      await hubReady(p); await p.locator('#t2-step-exam .t2-secondary').click();
      for (let i = 0; i < 12 && !(await p.locator('.t2-done-score').count()); i++) {
        const mc = p.locator('.t2-mc-option'); const fill = p.locator('#fill-input, #answer-box'); const chip = p.locator('#rearrange-bank .wp-word-chip');
        if (await mc.count()) await mc.first().click(); else if (await chip.count()) await chip.first().click(); else if (await fill.count()) await fill.first().fill('abc');
        if (!(await p.locator('.wp-card .wp-submit-btn').count())) break;
        await p.locator('.wp-card .wp-submit-btn').click();
        await p.waitForTimeout(150);
      }
      await p.locator('.t2-done-score').waitFor();
      await expect.poll(() => log.length).toBe(1);
    },
  },
  vocabQuiz: {
    url: W,
    flow: async (p, log) => {
      await hubReady(p); await p.locator('#t2-step-vocab button', { hasText: 'quiz' }).first().click();
      for (let i = 0; i < 30 && !(await p.locator('.t2-quiz-done').count()); i++) {
        await p.locator('.t2-quiz-opt').nth(3).click();
        const nx = p.locator('.t2-quiz-foot .t2-primary');
        if (await nx.count()) await nx.click(); else await p.waitForTimeout(800);
      }
      await expect.poll(() => log.length).toBe(1);
    },
  },
};
for (const [name, f] of Object.entries(FLOWS)) {
  if (ONLY && !ONLY.includes(name)) continue;
  test(`${name}: every action sends the same requests as the old page`, async ({ browser }) => {
    test.setTimeout(120 * 1000);
    const go = async (url) => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await ctx.newPage();
      const state = {};
      f.patch?.(state);
      const { log, errors } = await open(page, url, state);
      await f.flow(page, log);
      await page.waitForTimeout(400);
      await ctx.close();
      return { log, errors };
    };
    const old = await go('/task2-practice.html' + (f.url ? f.url + '&legacy=1' : '?legacy=1'));
    const now = await go('/app/task2-practice' + f.url);
    expect(now.errors).toEqual([]);
    expect(now.log).toEqual(old.log);
  });
}

test.describe('inside the React app', () => {
  test('the old address forwards with week, topic and writer', async ({ page }) => {
    const s = {}; unlocked(s);
    await open(page, `/task2-practice.html${W}&write=1`, s);
    await page.waitForURL(`**/app/task2-practice${W}&write=1`);
    await page.locator('#t2c-ta-intro').waitFor();
    await expect(page.locator('#t2c-ta-intro')).toHaveValue('Stress is rising.');
  });

  test('a topic link without its week finds the week; /task2-practice/<id> works too', async ({ page }) => {
    await open(page, `/app/task2-practice?topicId=${TID}`);
    await hub(page);
    await expect(page).toHaveURL(new RegExp(`[?]week=${TOPIC.week}&topicId=${TID}$`));
    await page.evaluate((id) => window.__go('/task2-practice/' + id), TID);
    await hub(page);
  });

  test('list → week → lesson → writer live in the address; Back walks them back', async ({ page }) => {
    const s = {}; unlocked(s);
    await open(page, '/app/task2-practice', s);
    await page.locator(`#t2w-grid .t2w-sess[data-topic="${TID}"]`).click();
    await hubReady(page);
    await expect(page).toHaveURL(new RegExp(`[?]week=${TOPIC.week}&topicId=${TID}$`));
    await page.locator('#t2-step-class .t2-primary').click();
    await page.locator('#t2c-ta-intro').waitFor();
    await expect(page).toHaveURL(/&write=1$/);
    await page.goBack();
    await hubReady(page);
    await page.goBack();
    await page.locator('#t2w-grid').waitFor();
  });

  test('Back mid-practice asks first; staying keeps the question, leaving returns to the lesson', async ({ page }) => {
    const s = {}; fresh(s);
    await open(page, `/app/task2-practice${W}`, s);
    await startTranslate(page);
    await toMode(page, 'm-mcq');
    await page.locator('.t2-gf-opts .t2-mc-option').first().click();
    await page.locator('#feedback-card').waitFor();
    await page.goBack();
    await page.locator('.t2-quit-box').waitFor();
    await page.locator('#t2-quit-continue-btn').click();
    await expect(page.locator('#feedback-card')).toBeVisible();
    await page.waitForTimeout(500); // the router puts the address back first
    await page.goBack();
    await page.locator('#t2-quit-leave-btn').click();
    await hubReady(page);
    await expect(page.locator('#qcard')).toHaveCount(0);
  });

  test('a writer link before the translate gate opens the lesson with a note', async ({ page }) => {
    const s = {}; unlocked(s, { done: 4, correct: 2 });
    await open(page, `/app/task2-practice${W}&write=1`, s);
    await hubReady(page);
    await expect(page).toHaveURL(new RegExp(`topicId=${TID}$`));
    await expect(page.locator('#t2-step-class.is-locked')).toBeVisible();
  });

  test('a free student gets the upgrade popup instead of a lesson', async ({ page }) => {
    await open(page, '/app/task2-practice', { user: FREE });
    await page.locator(`#t2w-grid .t2w-sess[data-topic="${TID}"]`).click();
    await page.locator('#um-overlay').waitFor();
    await expect(page).toHaveURL(/task2-practice$/);
  });
});
