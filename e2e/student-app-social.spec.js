// @ts-check
/**
 * BXH vocab, Cửa hàng lửa and Hộp thư in the React app (/app/leaderboard,
 * /shop, /inbox) against their old static pages (?legacy=1).
 *
 * The API is a stateful mock (production is never touched). Each page is
 * opened both ways with the same data, then compared: the text, the box and
 * main styles of every element, and what each user action sends to the server.
 *
 * Run: npm run test:e2e -- student-app-social
 *      E2E_FRONTEND=<dir> serves another build, E2E_SHOTS=<dir> saves screenshots.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const FRONTEND = path.resolve(process.env.E2E_FRONTEND || path.join(ROOT, 'frontend'));
const SHOTS = process.env.E2E_SHOTS || '';
const PORT = 3137 + 100 * Number(process.env.TEST_PARALLEL_INDEX || 0); // one static server per worker
const BASE = `http://localhost:${PORT}`;
const { ITEMS, PETS } = require(path.join(ROOT, 'backend', 'constants', 'shop.js'));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
};
let server;

// 20 seconds of silence, so the Dictation player has a real file to seek in
function silentWav() {
  const rate = 8000;
  const bytes = rate * 20;
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + bytes, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate, 28);
  h.writeUInt16LE(1, 32); h.writeUInt16LE(8, 34); h.write('data', 36); h.writeUInt32LE(bytes, 40);
  return Buffer.concat([h, Buffer.alloc(bytes, 128)]);
}

// Stands in for the YouTube IFrame API; window.__yt lists the players made
const FAKE_YOUTUBE = `
window.__yt = [];
window.YT = { PlayerState: { PLAYING: 1, PAUSED: 2 }, Player: function (el, o) {
  var host = typeof el === 'string' ? document.getElementById(el) : el;
  var frame = document.createElement('iframe');
  frame.id = 'yt-player';
  host.replaceWith(frame);
  var self = this, timer = null;
  self.t = o.playerVars.start || 0; self.calls = []; self.videoId = o.videoId; self.rate = 1; self.destroyed = false;
  self.getCurrentTime = function () { return self.t; };
  self.seekTo = function (t) { self.t = t; self.calls.push('seek:' + t); };
  self.setPlaybackRate = function (r) { self.rate = r; };
  self.playVideo = function () {
    self.calls.push('play');
    clearInterval(timer);
    timer = setInterval(function () { self.t += 0.05; }, 50);
    o.events.onStateChange({ data: 1 });
  };
  self.pauseVideo = function () { self.calls.push('pause'); clearInterval(timer); o.events.onStateChange({ data: 2 }); };
  self.destroy = function () { self.destroyed = true; clearInterval(timer); frame.remove(); };
  self.unloadModule = function () {};
  window.__yt.push(self);
  setTimeout(function () { o.events.onReady(); }, 0);
} };
if (window.onYouTubeIframeAPIReady) window.onYouTubeIframeAPIReady();`;

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/test-audio.wav') { res.writeHead(200, { 'Content-Type': 'audio/wav' }); res.end(silentWav()); return; }
    // The host serves these clean paths from the page's own file
    const clean = p.match(/^\/(dictation|shadowing|essential-grammar)\/[^/]+\/?$/);
    if (clean) p = `/${clean[1]}.html`;
    if (p.endsWith('/')) p += 'index.html';
    // The host's rewrite: every /app path is the app
    if (p.startsWith('/app/') && !p.startsWith('/app/assets/')) p = '/app/index.html';
    const file = path.join(FRONTEND, p);
    if (!file.startsWith(FRONTEND) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(PORT, r));
});
test.afterAll(() => new Promise((r) => server.close(r)));

const NOW = Date.now();
const inHours = (h) => new Date(NOW + h * 3600000).toISOString();
const USER = { _id: 'me1', id: 'me1', username: 'hocvien', firstName: 'An', lastName: 'Trần', role: 'student', plan: 'premium' };
const daysAgo = (d) => new Date(NOW - d * 86400000).toISOString();
const dayKey = (d) => {
  const x = new Date(NOW - d * 86400000);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

function makeProfile() {
  return {
    _id: 'me1', username: 'hocvien', email: 'an@example.test', firstName: 'An', lastName: 'Trần', role: 'student',
    bio: 'Mỗi ngày một ít', studyMotto: 'Cố lên', targetBand: 7, targetExamDate: new Date(NOW + 30 * 86400000).toISOString(),
    plan: 'premium', createdAt: daysAgo(200), planStartedAt: daysAgo(70), planExpiresAt: new Date(NOW + 20 * 86400000).toISOString(),
    avatar: '', hasPassword: true,
  };
}

function makeStats() {
  const scored = (n, band) => Array.from({ length: n }, (_, i) => ({ _id: `a${i}`, bandScore: band - (i % 3) * 0.5, createdAt: daysAgo(i * 2 + 1) }));
  return {
    streak: 12,
    reading: { total: 11, avgBand: '6.5', history: scored(11, 7) },
    listening: { total: 3, avgBand: '7.0', history: scored(3, 7.5) },
    writing: {
      total: 2, avgBand: '5.5',
      history: [
        { _id: 'w1', wordCount1: 160, wordCount2: 260, createdAt: daysAgo(3), grading: { overallBand: 5.5 } },
        { _id: 'w2', wordCount1: null, wordCount2: 255, createdAt: daysAgo(5) },
      ],
    },
    speaking: {
      total: 2, avgBand: '6.0',
      history: [{ _id: 's1', createdAt: daysAgo(4), aiFeedback: { overallBand: 6 } }, { _id: 's2', createdAt: daysAgo(6) }],
    },
  };
}

function makeBadges() {
  const b = (id, category, earned, current) => ({
    id, category, earned, icon: '🏅', name: `Huy hiệu ${id}`, description: `Mô tả ${id}`, progress: { current, target: 10 },
  });
  return {
    success: true, earnedCount: 1, totalCount: 3,
    categories: [{ id: 'study', name: 'Học tập', icon: '📚' }, { id: 'fun', name: 'Vui', icon: '🎉' }],
    badges: [b('b1', 'study', true, 10), b('b2', 'study', false, 4), b('b3', 'fun', false, 0)],
  };
}

const GRAMMAR_BLOCKS = [
  { type: 'overview', data: { text: 'Thì hiện tại đơn.' } },
  { type: 'formula', data: { forms: [{ label: 'Khẳng định', structure: 'S + V(s)', example: 'She works.' }] } },
  { type: 'usage', data: { points: [{ title: 'Thói quen', description: 'Việc lặp lại' }] } },
  { type: 'signal_words', data: { words: ['always', 'often'] } },
  { type: 'image', data: { src: '/img/buaDaniel.jpg', caption: 'Minh họa' } },
  { type: 'examples', data: { items: [{ en: 'I read.', vi: 'Tôi đọc.' }] } },
  { type: 'common_mistakes', data: { items: [{ wrong: 'He go', right: 'He goes', note: 'Thêm -es' }] } },
  { type: 'ielts_tips', data: { tips: ['Dùng khi nói về sự thật.'] } },
  { type: 'comparison', data: { title: 'So sánh thì', headers: ['A', 'B'], rows: [['1', '2']] } },
  { type: 'video', data: { videos: [{ youtubeId: 'abcdefghijk', title: 'Bài giảng', channel: 'Kênh A', duration: '5:00', label: 'Phần 1' }] } },
  { type: 'verb_forms', data: { target: 'past', items: [{ base: 'go', meaning: 'đi', past: ['went'], pastParticiple: ['gone'], note: 'Bất quy tắc' }, { base: 'work', meaning: 'làm', past: ['worked'], pastParticiple: ['worked'] }] } },
  { type: 'conjugation_drill', data: { items: [{ sentence: 'She ___ every day.', answers: ['works'], explanation: 'Ngôi 3 số ít' }] } },
  { type: 'translation_drill', data: { items: [{ vi: 'Tôi không biết.', answers: ["I don't know."], hint: 'Dùng do not' }] } },
  { type: 'practice_exercises', data: { exercises: [
    { type: 'multiple_choice', question: 'He ___ tea.', options: ['drink', 'drinks'], answerIndex: 1, explanation: 'Thêm s' },
    { type: 'fill_blank', question: 'She ___\nhome.', answer: 'goes', explanation: 'Ngôi 3' },
    { type: 'translation_vn_en', question: 'Tôi đi', answer: 'I go', explanation: 'Đơn giản' },
  ] } },
  { type: 'quiz', data: { questions: [
    { question: 'We ___ here.', options: ['live', 'lives'], answerIndex: 0, explanation: 'Số nhiều' },
    { question: 'It ___.', options: ['rain', 'rains'], answerIndex: 1, explanation: 'Ngôi 3' },
  ] } },
  { type: 'summary', data: { text: 'Nhớ thêm s.' } },
];
// Viết câu nâng cao: two weeks, the first with two structure groups
const ADV_GROUPS = [
  { _id: 'ag1', week: 1, emoji: '🔗', nameEn: 'Relative clauses', nameVi: 'Mệnh đề quan hệ', targetStructure: 'N + which/who + V', sentenceCount: 3 },
  { _id: 'ag2', week: 1, emoji: '🔄', nameEn: 'Inversion', nameVi: 'Đảo ngữ', targetStructure: 'Not only + aux + S + V', sentenceCount: 2 },
];
const ADV_SENTENCES = {
  ag1: [
    { _id: 'as1', promptVi: 'Cuốn sách mà tôi đọc rất hay.', translationAnswer: 'The book is good.', hintWords: ['which', 'read'], structureNote: 'which' },
    { _id: 'as2', promptVi: 'Người đàn ông sống ở đây là bác sĩ.', translationAnswer: 'He is a doctor.', hintWords: [] },
    { _id: 'as3', promptVi: 'Câu tự do không có đáp án gõ.', hintWords: ['free'] },
  ],
  ag2: [
    { _id: 'as4', promptVi: 'Không những anh ấy học giỏi.', translationAnswer: 'Not only is he smart.' },
    { _id: 'as5', promptVi: 'Hiếm khi tôi thấy cảnh này.', translationAnswer: 'Rarely do I see this.' },
  ],
};
const ADV_EXAM = [
  { _id: 'as1', groupId: 'ag1', groupName: 'Mệnh đề quan hệ', promptVi: 'Cuốn sách mà tôi đọc rất hay.' },
  { _id: 'as4', groupId: 'ag2', groupName: 'Đảo ngữ', promptVi: 'Không những anh ấy học giỏi.' },
];

// Luyện viết câu giao tiếp: topic 'myself' has one exercise of each kind
const WP_EXERCISES = [
  { _id: 'w1', type: 'translation', level: 'beginner', topic: 'myself', grammarPoint: 'To be', question: 'Tôi là học sinh.', translationAnswer: 'I am a student.', explanation: 'Chủ ngữ I đi với am.' },
  { _id: 'w2', type: 'translation', level: 'beginner', topic: 'myself', grammarPoint: 'Hiện tại đơn', question: 'Tôi thích đọc sách.', hints: ['like', 'reading'], answerWordCount: 4, answerLetterHint: 'I l____ r______ b____' },
  { _id: 'w3', type: 'rearrange', level: 'beginner', topic: 'myself', grammarPoint: 'Trật tự từ', question: 'Cô ấy chơi quần vợt mỗi ngày.', baseWords: ['She', 'plays', 'tennis', 'daily'] },
  { _id: 'w4', type: 'fill_blank', level: 'beginner', topic: 'myself', grammarPoint: 'Giới từ', instruction: 'Chọn từ đúng:', question: 'I live ___ Hanoi.', options: ['in', 'on', 'at'] },
  { _id: 'w5', type: 'expand', level: 'beginner', topic: 'myself', grammarPoint: 'Mở rộng', baseText: 'I like music.', question: 'I like music.', instruction: 'Viết dài hơn:' },
  { _id: 'w6', type: 'combine', level: 'beginner', topic: 'myself', grammarPoint: 'Liên từ', sentences: ['It rained.', 'We stayed home.'], connector: 'so', answerWordCount: 5, answerLetterHint: 'I_ r_____, s_ w_ s_____ h___' },
];
const WP_SAMPLES = { w1: 'I am a student.', w2: 'I like reading books.', w3: 'She plays tennis daily', w4: 'in', w5: 'I really like pop music.', w6: 'It rained, so we stayed home.' };
const WP_META = { success: true, counts: { beginner: { _total: 6, myself: 6, family: 0 }, elementary: { _total: 2, food: 2 } } };

// Task 1 Grammar: one exercise of each kind; t3/t4 have charts and the "Khi nào dùng?" box
const T1_EXERCISES = [
  { _id: 't1', type: 'translation', skillType: 'noun_phrase', level: 'beginner', tags: ['set1'], xpReward: 10, grammarPoint: 'Cụm danh từ', instruction: 'Dịch sang tiếng Anh:', questionVi: 'Số người dùng tăng.', translationAnswer: 'The number of users rose.', dataContext: { subject: 'Users', year: '2020', value: '50', unit: '%' } },
  { _id: 't2', type: 'data_transform', skillType: 'data_description', level: 'beginner', tags: ['set1'], grammarPoint: 'Danh từ hoá', instruction: 'Viết lại câu:', questionEn: 'Sales went up by 10%.', hints: ['increase', 'by'], answerWordCount: 6, answerLetterHint: 'T____ w__ a_ i_______ o_ 10%' },
  { _id: 't3', type: 'rearrange', skillType: 'comparison', level: 'beginner', tags: ['set1', 'chart:static'], grammarPoint: 'So sánh nhất', questionVi: 'Trung Quốc đứng đầu.', baseWords: ['China', 'topped', 'the', 'list'], chart: { kind: 'bar', labels: ['China', 'India'], series: [{ name: '2020', values: [40, 30] }], unit: '%' } },
  { _id: 't4', type: 'fill_blank', skillType: 'trend_language', level: 'elementary', tags: ['set2', 'chart:dynamic'], grammarPoint: 'from … to …', instruction: 'Điền giới từ', sentenceWithBlanks: 'The figure rose ___ 20% ___ 35%.', hints: ['from', 'to', 'by'], answerWordCount: 2, dataContext: { subject: 'Car sales', year: '2000–2010', value: '20 → 35', unit: '%', additionalData: { note: 'mốc đầu và mốc cuối' } }, chart: { kind: 'line', labels: ['2000', '2010'], series: [{ name: 'Cars', values: [20, 35] }], unit: '%' } },
  { _id: 't5', type: 'multiple_choice', skillType: 'overview', level: 'elementary', tags: ['set2'], grammarPoint: 'Overview', instruction: 'Chọn câu overview tốt nhất:', questionEn: 'Which sentence is the best overview?', options: ['Sales were 20% in 2000.', 'Overall, sales rose steadily.', 'Sales rose by 1% in 2001.'] },
  { _id: 't6', type: 'error_correction', skillType: 'paraphrase', level: 'beginner', tags: ['set1'], grammarPoint: 'Chia động từ', instruction: 'Sửa lỗi sai:', sentenceWithBlanks: 'The number of people increase.', questionVi: 'Viết lại câu đúng:', answerWordCount: 5, answerLetterHint: 'T__ n_____ o_ p_____ i________' },
];
const T1_SAMPLES = { t1: 'The number of users rose.', t2: 'There was an increase of 10%', t3: 'China topped the list', t4: 'from, to', t5: 'Overall, sales rose steadily.', t6: 'The number of people increased.' };
const T1_COUNTS = (list) => list.reduce((c, e) => { c._total += 1; c[e.skillType] = (c[e.skillType] || 0) + 1; return c; }, { _total: 0 });
const T1_META = {
  success: true,
  counts: { beginner: { _total: 4 }, elementary: { _total: 2 }, intermediate: { _total: 0 }, all: T1_COUNTS(T1_EXERCISES) },
  setCounts: { set1: T1_COUNTS(T1_EXERCISES.filter((e) => e.tags.includes('set1'))), set2: T1_COUNTS(T1_EXERCISES.filter((e) => e.tags.includes('set2'))) },
};

const GRAMMAR_LESSONS = () => [
  { _id: 'g1', category: 'Thì', lessonKey: 'present-simple', title: 'Hiện tại đơn', icon: '⏰', orderIndex: 1, blocks: GRAMMAR_BLOCKS },
  { _id: 'g2', category: 'Thì', lessonKey: 'past-simple', title: 'Quá khứ đơn', orderIndex: 2, blocks: [{ type: 'overview', data: { text: 'Quá khứ.' } }] },
  { _id: 'g3', category: 'Câu', lessonKey: 'passive', title: 'Câu bị động', icon: '🔁', orderIndex: 1, blocks: [
    { type: 'practice_exercises', data: { exercises: [{ type: 'multiple_choice', question: 'It ___ made.', options: ['is', 'are'], answerIndex: 0, explanation: 'Số ít' }] } },
  ] },
];

function makeState() {
  const owned = { cake: 2, lens: 1, towel: 1, iceShield: 2 };
  return {
    profile: makeProfile(),
    stats: makeStats(),
    badges: makeBadges(),
    danielHammer: { count: 1, canUse: true, previousStreak: 9 },
    wallet: 200,
    owned,
    pets: new Set(['meo']),
    gift: 'ready',
    failBuy: false,
    messages: Array.from({ length: 60 }, (_, i) => ({
      _id: `m${i}`,
      subject: i === 3 ? '' : `Tin nhắn số ${i}`,
      body: `Nội dung tin ${i}. `.repeat(i === 0 ? 12 : 2).trim(),
      fromName: i % 5 === 4 ? '' : 'Thầy Dan',
      isBroadcast: i === 1,
      isRead: i > 2 && i !== 55,
      createdAt: new Date(NOW - [0.5, 30, 300, 2000, 20000][i % 5] * 60000).toISOString(),
      giftClaimed: false,
      ...(i === 0 ? { giftHammers: 2, giftStreakDays: 3 } : {}),
      ...(i === 2 ? { giftItem: { key: 'cake', name: 'Bánh Kem Úp Mặt', emoji: '🎂', qty: 2 }, giftPet: { id: 'shiba', name: 'Shiba Lì Xì' } } : {}),
    })),
    mustRead: 0,
    unreadCount: 3,
    grammarLessons: GRAMMAR_LESSONS(),
    grammarHistory: [{ _id: 'h1', score: 75, correct: 3, total: 4, answered: 3, timeSpent: 95, createdAt: daysAgo(2) }],
    grammarProgress: [{ lessonId: 'g2', bestScore: 90, score: 90, lastAttempt: daysAgo(3) }],
    assignments: [],
    advDrafts: [{ groupId: 'ag2', groupName: 'Đảo ngữ', week: 1, mode: 'practice', sentenceIds: ['as4', 'as5'], currentIdx: 1, sentenceStatus: ['correct'], sessionAttempts: [{ sentenceId: 'as4', userAnswer: 'Not only is he smart.', isCorrect: true, score: 100 }] }],
    t1History: [
      { _id: 'th1', sessionId: 's1', skillType: 'comparison', isCorrect: true, xpEarned: 10, createdAt: daysAgo(1) },
      { _id: 'th2', sessionId: 's1', skillType: 'overview', isCorrect: false, xpEarned: 1, createdAt: daysAgo(1) },
      { _id: 'th3', skillType: 'noun_phrase', isCorrect: true, xpEarned: 10, createdAt: daysAgo(5) },
    ],
    wpHistory: [
      { _id: 'wh1', level: 'beginner', types: ['translation', 'rearrange'], totalItems: 6, correctItems: 4, xpEarned: 70, createdAt: daysAgo(1) },
      { _id: 'wh2', level: 'elementary', type: 'fill_blank', xpEarned: 15, createdAt: daysAgo(3) },
    ],
    pendingRewrites: 0,
    advHistory: [
      { _id: 'at1', sessionType: 'practice', week: 1, groupName: 'Mệnh đề quan hệ', correctCount: 2, totalQuestions: 3, scorePercentage: 66.7, completedAt: daysAgo(1) },
      { _id: 'at2', sessionType: 'exam', week: 1, groupName: 'Thi thử Tuần 1', correctCount: 1, totalQuestions: 2, scorePercentage: 50, completedAt: daysAgo(4) },
      { sessionType: 'practice', week: 2, groupName: 'Câu điều kiện', correctCount: 0, totalQuestions: 4, scorePercentage: 0, completedAt: daysAgo(9) },
    ],
    goal: { hasGoal: true, currentBand: 5.5, targetBand: 8, examDate: '2030-01-15T00:00:00.000Z', weeklyStudyMinutes: 240, preferredSessionMinutes: 60, studyDays: ['mon', 'wed'], currentBandSource: 'self_assessed', gapBands: 2.5, daysRemaining: 100, feasibility: { level: 'tight', message: 'Hơi gấp' } },
    fees: [
      { _id: 'f1', feeType: 'monthly', month: 11, year: 2026, amount: 1500000, note: 'Giảm 10% <đợt 1>', isPaid: false },
      { _id: 'f2', feeType: 'course', courseName: 'IELTS <7.0>', amount: 6000000, isPaid: false, studentNotified: true },
      { _id: 'f3', feeType: 'monthly', month: 10, year: 2026, amount: 1500000, isPaid: true, paidDate: daysAgo(30) },
    ],
    feeSettings: {
      bankName: 'Vietcombank', accountName: 'TRAN VAN A', bankAccount: '0123456789', defaultMonthlyFee: 1500000,
      paymentNote: 'Ghi rõ họ tên\nvà tháng đóng', qrImageUrl: '/img/buaDaniel.jpg',
    },
    tuitionSummary: { success: true, unpaidCount: 2, monthCount: 0, dueCount: 0 },
    reviews: Array.from({ length: 25 }, (_, i) => ({
      _id: `r${i}`,
      attemptType: i % 2 ? 'listening-practice' : 'reading',
      completedAt: daysAgo(i + 1),
      mistakes: [
        { questionNumber: i + 1, questionType: 'Matching', errorCategory: i % 3 ? 'Từ vựng' : 'Ngữ pháp', errorReason: 'Không biết <từ>', retryResult: 'correct', note: 'Nhớ kỹ', learningPoint: { content: 'Đọc lại câu hỏi' } },
        { questionNumber: i + 2, retryResult: 'wrong' },
      ],
    })),
    mocks: Array.from({ length: 12 }, (_, i) => ({
      _id: `t${i}`,
      createdAt: daysAgo(i + 1),
      status: ['completed', 'in-progress', 'disqualified', 'grading'][i % 4],
      overallBand: i % 4 === 0 ? 6.5 : null,
      proctor: i % 4 === 2 ? { violated: true, violationCount: 5 } : {},
      steps: { listening: { band: 7, attemptId: `l${i}` }, reading: { band: i % 4 === 3 ? null : 6.5, attemptId: `g${i}` }, writing: {}, speaking: {} },
    })),
    dictSections: [
      { _id: 's1', title: 'Cam 18 Test 1 Part 1', partNumber: 1, sentenceCount: 3, audioDuration: 125 },
      { _id: 's2', title: 'Festival talk', partNumber: 4, sentenceCount: 2 },
      { _id: 's3', title: 'Actual flights', partNumber: 2, isActualTest: true, sentenceCount: 2 },
    ],
    dictDrills: [
      { _id: 'dr1', slug: 'spelling-1', title: 'Tên riêng 1', category: 'spelling', itemCount: 2 },
      { _id: 'dr2', slug: 'numbers-1', title: 'Số điện thoại 1', category: 'numbers', itemCount: 2 },
    ],
    shadowLessons: Array.from({ length: 30 }, (_, i) => ({
      slug: `l${i}`, youtubeId: `vid${i}`, title: `Bài video ${i}`, description: i % 2 ? '' : `Mô tả bài ${i}`, channel: 'Kênh A',
      category: ['ielts-part1', 'fun-shorts', 'spelling-numbers'][i % 3], level: i % 2 ? 'C1' : 'B1',
      duration: 125 + i, segmentCount: 3,
      progress: i === 0 ? { shadowing: 90, dictation: 40 } : {}, answered: i === 0 ? { shadowing: 3, dictation: 1 } : {},
    })),
    duels: {
      success: true,
      rules: { min: 5, max: 100, maxOpen: 3, pendingHours: 24 },
      open: [
        { id: 'd1', status: 'pending', role: 'opponent', stake: 10, pot: 20, rival: { name: 'Bình' }, expiresAt: inHours(5.5) },
        { id: 'd2', status: 'pending', role: 'challenger', stake: 15, pot: 30, rival: { name: 'Chi' }, expiresAt: inHours(3.5) },
      ],
      // ended 5 days ago: older than 2 days, so its "Kết quả thách đấu" popup doesn't cover the page
      recent: [{ id: 'd3', status: 'done', result: 'win', myScore: 8, rivalScore: 3, stake: 5, pot: 10, rival: { name: 'Dũng' }, endsAt: new Date(Date.now() - 5 * 86400000).toISOString() }],
    },
  };
}

function shopBody(s) {
  return {
    success: true,
    wallet: s.wallet,
    streak: 12,
    items: ITEMS.map((i) => ({ ...i, owned: s.owned[i.key] || 0, sellPrice: Math.floor(i.price / 2) })),
    pets: PETS.map((p) => ({ ...p, owned: s.pets.has(p.id), sellPrice: Math.floor(p.price / 2) })),
    danielHammer: s.danielHammer,
    activePet: 'meo',
    pet: { id: 'meo', name: 'Mèo Quýt', skill: { icon: '🍀', name: 'Thần Tài', text: 'Thêm quà mỗi ngày' }, gift: s.gift, guard: { max: 2, used: 1, reflect: false } },
    effects: {
      hope: { base: 3, quota: 10, penalty: 5 },
      crownUntil: inHours(47.5), invisibleUntil: inHours(3.5), cakedUntil: inHours(0.4), cakedBy: 'Bình',
    },
    ...(s.shopPatch || {}),
  };
}

function board(kind, limit) {
  const total = kind === 'streak' ? 35 : 12;
  const rows = Array.from({ length: Math.min(limit, total) }, (_, i) => {
    const base = { name: `Học viên ${i + 1}`, avatar: '' };
    const decor = i === 0 ? { crown: true, pet: 'meo' } : i === 1 ? { cakedBy: 'Chi' } : {};
    if (kind === 'quiz') return { ...base, ...decor, userId: `q${i}`, score: 99 - i, timeSpent: 60 + i };
    if (i === 2) return { ...base, _id: `u${i}`, streak: null, hidden: true };
    return { ...base, ...decor, _id: `u${i}`, streak: 40 - i, revealed: i === 3 };
  });
  const me = kind === 'streak'
    ? { rank: 40, total: 45, streak: 2, nextStreak: 3 }
    : { rank: 2, total: 12, score: 98, attempts: 7, timeSpent: 61, nextScore: 99 };
  return { success: true, leaderboard: rows, total, me };
}

async function open(page, url, state = makeState()) {
  const log = [];
  await page.addInitScript(([u, theme, fixedRandom, fakeSpeech, advScores]) => {
    if (fixedRandom) Math.random = () => 0;
    // Hears the sentence on screen, read back perfectly
    if (fakeSpeech) {
      window.SpeechRecognition = function () {
        const self = this;
        self.start = () => setTimeout(() => {
          const said = Object.assign([{ transcript: document.getElementById('sh-sentence').textContent }], { isFinal: true });
          self.onresult({ results: [said] });
        }, 50);
        self.stop = () => {};
      };
    }
    if (theme) localStorage.setItem('theme', theme);
    if (advScores) localStorage.setItem('as_group_scores', JSON.stringify({ ag1: { best: 90, completed: true } }));
    if (advScores) localStorage.setItem('wp_topic_scores', JSON.stringify({ family: { bestScore: 85, latestScore: 85, completed: true } }));
    if (advScores) localStorage.setItem('wp_progress', JSON.stringify({ xp: 120, streak: 4, lastDate: new Date().toISOString().slice(0, 10) }));
    if (!window.__keepWpTour) localStorage.setItem('ews_onboarding_tour_v1_writing-practice.html', '1');
    if (!window.__keepT1Tour) localStorage.setItem('ews_onboarding_tour_v1_task1-practice.html', '1');
    if (advScores) localStorage.setItem('t1_skill_scores', JSON.stringify({ comparison: { bestScore: 90, latestScore: 90, completed: true } }));
    if (advScores) localStorage.setItem('t1_progress', JSON.stringify({ xp: 75, lastDate: new Date().toISOString().slice(0, 10) }));
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('lastLoginAt', String(Date.now()));
    localStorage.setItem('ews_seen_streak35_notice', '1');
    localStorage.setItem('ews_page_help_seen', '1');
    localStorage.setItem('ews_onboarding_tour_v1_dashboard.html', '1');
    if (!window.__keepGrammarTour) localStorage.setItem('ews_onboarding_tour_v1_essential-grammar.html', '1');
    // Change route the way the browser's Back button does
    window.__go = (route) => { history.pushState(null, '', '/app' + route); window.dispatchEvent(new PopStateEvent('popstate')); };
  }, [state.user || USER, state.theme || '', !!state.fixedRandom, !!state.fakeSpeech, !!state.advScores]);
  await page.route(/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|media\.ieltsthayha\.com|i\.ytimg\.com/, (r) => r.abort());
  await page.route('https://www.youtube.com/iframe_api', (r) => r.fulfill({ contentType: 'application/javascript', body: FAKE_YOUTUBE }));
  await page.route('https://englishwithdan.onrender.com/**', (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const p = u.pathname.replace(/^\/api/, '');
    const json = (body, status = 200) => route.fulfill({
      status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body),
    });
    if (req.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    }
    if (req.method() !== 'GET' && !p.startsWith('/activity') && !p.includes('visit')) {
      log.push(`${req.method()} ${p} ${req.postData() || ''}`);
    }
    const limit = Number(u.searchParams.get('limit') || 10);
    const boardReply = (kind) => (state.failBoards
      ? json({ success: false, message: 'Lỗi máy chủ' }, 500)
      : json({ ...board(kind, limit), ...(state.boardPatch?.[kind] || {}) }));
    if (p === '/user/streak-leaderboard') return boardReply('streak');
    if (p === '/vocabulary-lessons/leaderboard') return boardReply('quiz');
    if (p === '/shop' && req.method() === 'GET') return state.failShop ? json({ success: false }, 500) : json(shopBody(state));
    if (p === '/shop/duels' && req.method() === 'GET') return json(state.duels);
    if (p === '/goals' && req.method() === 'PUT') {
      const b = req.postDataJSON();
      Object.assign(state.goal, b, { hasGoal: true });
      state.profile.targetBand = b.targetBand;
      return json({ success: true, goal: state.goal });
    }
    if (p === '/goals') { state.goalCalls = (state.goalCalls || 0) + 1; return json({ success: true, goal: state.goal }); }
    if (p === '/goals/ai-plan') { state.aiCalls = (state.aiCalls || 0) + 1; return json({ success: true, aiPlan: 'Tuần đầu ôn từ vựng.\n\nTuần sau luyện đề.' }); }
    if (p === '/learning/today') return json({ success: true, hasGoal: true, hasPlan: true, isStudyDay: true, totalMinutes: 30, sessions: [{ category: 'reading', minutes: 30, reason: 'Điểm yếu nhất', action: 'Luyện Reading', practiceUrl: 'reading.html' }] });
    if (p === '/study-plan/current') return json({ success: true, hasPlan: true, weekStart: '2026-11-16', weekEnd: '2026-11-22', totalMinutes: 60, scheduledMinutes: 30, allocation: [{ category: 'reading', minutes: 30 }], sessions: [{ day: 'mon', date: '2026-11-16', totalMinutes: 30, items: [{ category: 'reading', reason: 'Điểm yếu', minutes: 30 }] }] });
    if (p === '/shop/gift-recipients') return json({ success: true, users: [{ _id: 'u9', name: 'Giang', username: 'giang' }] });
    if (p === '/shop/feed') return json({ success: true, feed: [], announce: [] });
    if (p === '/shop/pet') return json({ success: true, pet: null, activePet: state.activePet || '' });
    if (p === '/shop/buy') {
      const b = req.postDataJSON();
      if (state.failBuy) return json({ success: false, message: 'Ví không đủ lửa' }, 400);
      if (b.kind === 'pet') { state.pets.add(b.key); state.wallet -= PETS.find((x) => x.id === b.key).price; return json({ success: true, activePet: b.key }); }
      state.owned[b.key] = (state.owned[b.key] || 0) + b.qty;
      state.wallet -= ITEMS.find((x) => x.key === b.key).price * b.qty;
      return json({ success: true });
    }
    if (p === '/shop/pet-gift') {
      if (state.failGift) return json({ success: false, message: 'Chưa mở được quà' }, 500);
      state.gift = 'claimed'; state.wallet += 4;
      return json({ success: true, petName: 'Mèo Quýt', flames: 4 });
    }
    if (p === '/user/profile' && req.method() === 'GET') return state.failProfile ? json({ success: false, message: 'Lỗi' }, 500) : json({ success: true, user: state.profile });
    if (p === '/user/profile') {
      const b = req.postDataJSON();
      if (b.firstName === 'Sai') return json({ success: false, message: 'Tên không hợp lệ' }, 400);
      Object.assign(state.profile, b);
      return json({ success: true, user: state.profile });
    }
    if (p === '/user/stats') return state.failStats ? json({ success: false }, 500) : json({ success: true, stats: state.stats });
    if (p === '/badges') return json(state.badges);
    if (p === '/user/activity-heatmap') return json({ success: true, activity: [{ date: dayKey(1), count: 1 }, { date: dayKey(2), count: 3 }, { date: dayKey(9), count: 6 }] });
    if (p === '/user/change-password') {
      if (req.postDataJSON().currentPassword === 'sai-mat-khau') return json({ success: false, message: 'Mật khẩu hiện tại không đúng' }, 400);
      state.profile.hasPassword = true;
      return json({ success: true, message: 'Đã đổi mật khẩu thành công', token: 'new-token' });
    }
    if (p === '/user/avatar') { state.profile.avatar = '/img/buaDaniel.jpg'; return json({ success: true, avatar: '/img/buaDaniel.jpg' }); }
    if (p === '/shop/use' || p === '/shop/sell' || p === '/shop/gift' || p === '/user/streak/use-hammer') return json({ success: true, streak: 9, activePet: 'meo', targetName: 'Giang' });
    if (p === '/shop/pet' && req.method() === 'PUT') return json({ success: true, activePet: req.postDataJSON().petId });
    if (p === '/shop/cake') { state.owned.cake -= 1; return json({ success: true, outcome: 'hit' }); }
    if (p === '/shop/lens') { state.owned.lens -= 1; return json({ success: true }); }
    if (p === '/shop/duels') return json({ success: true });
    if (/^\/shop\/duels\/d\d\/decline$/.test(p)) { state.duels.open = state.duels.open.filter((d) => !p.includes(d.id)); return json({ success: true }); }
    if (/^\/user\/peer\/[^/]+\/profile$/.test(p)) return json({ success: true, profile: { name: 'Bạn học', username: 'ban', streak: 3, badges: [] } });
    if (p === '/user/messages/unread-count') return json({ success: true, count: state.unreadCount, mustReadCount: state.mustRead });
    if (p === '/user/messages/must-read') return json({ success: true, messages: state.messages.filter((m) => m._id === 'm55') });
    if (p === '/user/messages') {
      if (state.failInbox) return json({ success: false, message: 'Lỗi máy chủ' }, 500);
      const pg = Number(u.searchParams.get('page') || 1);
      return json({ success: true, total: state.messages.length, messages: state.messages.slice((pg - 1) * limit, pg * limit) });
    }
    let m = p.match(/^\/user\/messages\/(m\d+)\/read$/);
    if (m) { state.messages.find((x) => x._id === m[1]).isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); return json({ success: true }); }
    m = p.match(/^\/user\/messages\/(m\d+)\/reply$/);
    if (m) return json({ success: true });
    m = p.match(/^\/user\/messages\/(m\d+)\/claim$/);
    if (m) {
      const x = state.messages.find((y) => y._id === m[1]);
      if (x.giftClaimed) return json({ success: false, message: 'Đã nhận' }, 409);
      x.giftClaimed = true;
      return json({ success: true, giftHammers: x.giftHammers, giftStreakDays: x.giftStreakDays, item: x.giftItem ? { ...x.giftItem } : null, pet: x.giftPet || null, activePet: 'shiba' });
    }
    m = p.match(/^\/user\/messages\/(m\d+)$/);
    if (m && req.method() === 'DELETE') { state.messages = state.messages.filter((x) => x._id !== m[1]); return json({ success: true }); }
    if (p === '/tuition/my/summary') return json(state.tuitionSummary);
    if (p === '/tuition/my') return state.failTuition ? json({ success: false, message: 'Lỗi máy chủ' }, 500) : json({ success: true, fees: state.fees, settings: state.feeSettings });
    m = p.match(/^\/tuition\/(f\d)\/notify$/);
    if (m) { state.fees.find((f) => f._id === m[1]).studentNotified = true; return json({ success: true, message: 'Đã báo admin' }); }
    const pageOf = (list) => {
      const pg = Number(u.searchParams.get('page') || 1);
      return json({ success: true, items: list.slice((pg - 1) * limit, pg * limit), total: list.length, page: pg, limit });
    };
    if (p === '/review/history') {
      if (state.failReviews) return json({ success: false, message: 'Lỗi' }, 500);
      const type = u.searchParams.get('attemptType');
      return pageOf(type ? state.reviews.filter((r) => r.attemptType === type) : state.reviews);
    }
    if (p === '/mock-test/history') return pageOf(state.mocks);
    if (p === '/essential-grammar/lessons') return state.failGrammar ? json({ success: false }, 500) : json({ success: true, lessons: state.grammarLessons.map(({ blocks, ...l }) => l) });
    if (p === '/essential-grammar/my-progress') return json({ success: true, progress: state.grammarProgress });
    if (p === '/assignments/mine') return json({ success: true, assignments: state.assignments });
    m = p.match(/^\/essential-grammar\/lessons\/(\w+)$/);
    if (m) return state.failBlocks === m[1] ? json({ success: false }, 500) : json({ success: true, lesson: state.grammarLessons.find((l) => l._id === m[1]) });
    m = p.match(/^\/essential-grammar\/(\w+)\/attempt\/history$/);
    if (m) return json({ success: true, history: state.grammarHistory });
    m = p.match(/^\/essential-grammar\/(\w+)\/attempt$/);
    if (m) {
      if (state.failAttempt) return json({ success: false, message: 'Lỗi' }, 500);
      state.grammarHistory = [{ _id: 'h2', score: 100, correct: 3, total: 3, answered: 3, timeSpent: 9, createdAt: new Date(NOW).toISOString() }, ...state.grammarHistory];
      return json({ success: true });
    }
    if (p === '/writing-practice/meta') return json(WP_META);
    if (p === '/writing-practice/exercises') {
      if (state.user?.plan === 'free') return json({ success: false, message: 'Premium', requiresPremium: true }, 403);
      const topic = u.searchParams.get('topic');
      const type = u.searchParams.get('type');
      const list = WP_EXERCISES.filter((e) => (topic === 'all' || e.topic === topic) && (type === 'all' || e.type === type) && u.searchParams.get('level') === 'beginner');
      return json({ success: true, exercises: list });
    }
    if (p === '/writing-practice/check') {
      if (state.failWpCheck) return json({ success: false, message: 'Lỗi máy chủ' }, 500);
      const b = JSON.parse(req.postData());
      const sample = WP_SAMPLES[b.exerciseId];
      const ok = !/wrong/i.test(b.userAnswer);
      return json({ success: true, xpEarned: ok ? 15 : 5, sampleAnswer: sample, feedback: { isCorrect: ok, feedbackVi: ok ? 'Câu đúng ngữ pháp.' : 'Sai thì của động từ.' } });
    }
    if (p === '/writing-practice/test-questions') return json({ success: true, exercises: WP_EXERCISES.slice(1, 4) });
    if (p === '/writing-practice/check-test') {
      const { answers } = JSON.parse(req.postData());
      const results = answers.map((a, i) => {
        const e = WP_EXERCISES.find((x) => x._id === a.exerciseId);
        return { ...e, userAnswer: a.userAnswer, sampleAnswer: WP_SAMPLES[e._id], isCorrect: i !== 1, isExpand: false, explanation: i === 2 ? 'Dùng in với thành phố.' : '' };
      });
      return json({ success: true, results, correct: results.filter((r) => r.isCorrect).length, countable: results.length, score: Math.round((results.filter((r) => r.isCorrect).length / results.length) * 100) });
    }
    if (p === '/writing-practice/history') return json({ success: true, attempts: state.wpHistory });
    if (p === '/task1/meta') return json(T1_META);
    if (p === '/task1/exercises') {
      if (state.user?.plan === 'free') return json({ success: false, message: 'Premium', requiresPremium: true }, 403);
      const sk = u.searchParams.get('skillType');
      const tag = u.searchParams.get('tag');
      return json({ success: true, exercises: T1_EXERCISES.filter((e) => (sk === 'all' || e.skillType === sk) && (!tag || e.tags.includes(tag))) });
    }
    if (p === '/task1/check') {
      if (state.failT1Check) return json({ success: false, message: 'Lỗi máy chủ' }, 500);
      const b = JSON.parse(req.postData());
      const e = T1_EXERCISES.find((x) => x._id === b.exerciseId);
      const mc = e.type === 'multiple_choice';
      const ok = mc ? b.userAnswer === '1' : !/wrong/i.test(b.userAnswer);
      return json({
        success: true, isCorrect: ok, score: ok ? 100 : 0, xpEarned: ok ? 10 : 1,
        feedbackVi: ok ? '✅ Chính xác!' : '❌ Chưa đúng — xem đáp án mẫu bên dưới.',
        sampleAnswer: T1_SAMPLES[e._id], correctOptionIndex: mc ? 1 : undefined,
        grammarPoint: e.grammarPoint, explanation: e._id === 't2' ? 'Dùng danh từ increase.' : undefined,
      });
    }
    if (p === '/task1/test-questions') return json({ success: true, exercises: T1_EXERCISES.slice(1, 5).map(({ translationAnswer, ...e }) => e) });
    if (p === '/task1/check-test') {
      const { answers } = JSON.parse(req.postData());
      const results = answers.map((a, i) => {
        const e = T1_EXERCISES.find((x) => x._id === a.exerciseId);
        return { exerciseId: e._id, type: e.type, skillType: e.skillType, instruction: e.instruction, questionVi: e.questionVi, questionEn: e.questionEn, userAnswer: a.userAnswer, sampleAnswer: T1_SAMPLES[e._id], isCorrect: i !== 1, grammarPoint: e.grammarPoint };
      });
      const correct = results.filter((r) => r.isCorrect).length;
      return json({ success: true, results, correct, total: results.length, score: Math.round((correct / results.length) * 100) });
    }
    if (p === '/task1/history') return json({ success: true, attempts: state.t1History });
    if (p === '/writing/pending-rewrites') return json({ success: true, count: state.pendingRewrites, max: 2, blocked: false, items: state.pendingRewrites ? [{ _id: 'r1' }] : [] });
    if (p === '/adv-sentence/weeks') return json({ success: true, weeks: [
      { week: 1, groupNames: ['Mệnh đề quan hệ', 'Đảo ngữ'], sentenceCount: 5, groupCount: 2 },
      { week: 2, groupNames: ['Câu điều kiện'], sentenceCount: 4, groupCount: 1 },
    ] });
    if (p === '/adv-sentence/drafts') return json({ success: true, drafts: state.advDrafts });
    m = p.match(/^\/adv-sentence\/groups\/week\/(\d+)$/);
    if (m) return json({ success: true, groups: ADV_GROUPS.filter((g) => g.week === Number(m[1])) });
    m = p.match(/^\/adv-sentence\/group\/(\w+)$/);
    if (m) {
      const group = ADV_GROUPS.find((g) => g._id === m[1]);
      return group ? json({ success: true, group, sentences: ADV_SENTENCES[m[1]] }) : json({ success: false, message: 'Không có' }, 404);
    }
    m = p.match(/^\/adv-sentence\/draft\/(\w+)$/);
    if (m) {
      if (req.method() === 'DELETE') { state.advDrafts = state.advDrafts.filter((d) => d.groupId !== m[1]); return json({ success: true }); }
      return json({ success: true, draft: state.advDrafts.find((d) => d.groupId === m[1]) || null });
    }
    if (p === '/adv-sentence/check') {
      const b = JSON.parse(req.postData());
      const all = Object.values(ADV_SENTENCES).flat();
      const model = all.find((x) => x._id === b.sentenceId)?.translationAnswer || 'Model answer here.';
      const ok = !/wrong/.test(b.userAnswer);
      return json({ success: true, isCorrect: ok, score: ok ? 100 : 30, modelAnswer: model, feedbackVi: ok ? 'Chính xác, rất tốt!' : 'Chưa đúng cấu trúc <which>.' });
    }
    if (p === '/adv-sentence/exam') return json({ success: true, questions: ADV_EXAM });
    if (p === '/adv-sentence/exam/submit') {
      const { answers } = JSON.parse(req.postData());
      const results = answers.map((a, i) => ({
        sentenceId: a.sentenceId, userAnswer: a.userAnswer, isCorrect: i === 0, score: i === 0 ? 100 : 0,
        promptVi: ADV_EXAM[i].promptVi, groupName: ADV_EXAM[i].groupName, structureNote: i ? 'Not only' : '', modelAnswer: 'Model ' + (i + 1),
      }));
      return json({ success: true, results, correct: 1, total: results.length, score: 50 });
    }
    if (p === '/adv-sentence/history') return json({ success: true, attempts: state.advHistory });
    m = p.match(/^\/adv-sentence\/attempt\/(\w+)$/);
    if (m) return json({ success: true, attempt: { ...state.advHistory.find((a) => a._id === m[1]), targetStructure: 'N + which/who + V', sentences: m[1] === 'at2' ? [] : [
      { index: 1, isCorrect: true, promptVi: 'Cuốn sách mà tôi đọc rất hay.', userAnswer: 'The book is good.', structureNote: 'which' },
      { index: 2, isCorrect: false, promptVi: 'Người đàn ông sống ở đây.', userAnswer: '', modelAnswer: 'He is a doctor.' },
    ] } });
    if (p === '/listening/dictation/list') return state.failDictList ? json({ success: false }, 500) : json({ success: true, sections: state.dictSections, drills: state.dictDrills, reportConfig: state.dictReport === undefined ? { enabled: true, thankOnFix: true, reasons: [{ key: 'wrong_text', label: 'Đáp án sai chữ' }, { key: 'cut_audio', label: 'Audio bị cắt' }, { key: 'other', label: 'Lỗi khác' }] } : state.dictReport });
    if (p === '/listening/dictation/report') return json({ success: true, message: 'Đã gửi báo lỗi — cảm ơn bạn!' });
    if (p === '/listening/dictation/my-mistakes') return json({ success: true, ...(state.dictHabits || { sentences: 0, types: [] }) });
    m = p.match(/^\/listening\/dictation\/section\/(\w+)\/translations$/);
    if (m) return json({ success: true, translations: ['Xin chào bạn tôi.', 'Hôm nay trời đẹp.', ''] });
    m = p.match(/^\/listening\/dictation\/section\/(\w+)$/);
    if (m) {
      if (m[1] === 'bad') return json({ success: false, message: 'Không có' }, 404);
      return json({ success: true, section: {
        _id: m[1], title: 'Cam 18 Test 1 Part 1', partNumber: 1, audioUrl: `${BASE}/test-audio.wav`, transcript: 'Dòng một.\nDòng hai.',
        dictationSentences: [
          { text: 'Hello there, my friend.', start: 0, end: 2 },
          { text: 'It is a lovely day.', start: 2, end: 4 },
          { text: 'See you soon.', start: 4, end: 6 },
        ],
      } });
    }
    m = p.match(/^\/listening\/dictation\/drill\/([\w-]+)$/);
    if (m) {
      return json({ success: true, drill: {
        _id: 'dr1', slug: m[1], title: 'Tên riêng 1', category: m[1].startsWith('spelling') ? 'spelling' : 'numbers',
        items: [
          { text: 'My number is 0491 577 248.', answer: '0491 577 248', start: 0, end: 2, audioUrl: `${BASE}/test-audio.wav`, sourceTitle: 'Cam 17 Part 1' },
          { text: 'It is spelled S-M-I-T-H.', answer: 'Smith', start: 2, end: 4, audioUrl: `${BASE}/test-audio.wav`, sourceTitle: 'Cam 16 Part 1' },
        ],
      } });
    }
    if (p === '/shadowing/lessons') return state.failShadowList ? json({ success: false }, 500) : json({ success: true, lessons: state.shadowLessons });
    m = p.match(/^\/shadowing\/lessons\/([\w-]+)$/);
    if (m) {
      const l = state.shadowLessons.find((x) => x.slug === m[1]);
      if (!l) return json({ success: false, message: 'Không có' }, 404);
      return json({ success: true, lesson: {
        ...l, clipStart: 10, sourceTitle: 'Video gốc A', burnedInCaptions: false,
        segments: [
          { text: 'Hello there, my friend.', vi: 'Xin chào bạn tôi.', start: 10, end: 11 },
          { text: 'It is a lovely day.', vi: 'Hôm nay trời đẹp.', start: 11.2, end: 12 },
          { text: 'See you soon.', vi: 'Hẹn sớm gặp lại.', start: 12.2, end: 13, answer: l.category === 'spelling-numbers' ? 'soon' : undefined },
        ],
      } });
    }
    return json({ success: true });
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + url);
  await page.addStyleTag({ content: 'body{margin:0} *,*::before,*::after{animation:none!important;transition:none!important} #pcw-root,.nav-corner-dock,#ews-pet-layer,.ews-mascot-dock{display:none!important}' });
  return { log, errors, state };
}

// Every visible element under `sel`: its box (relative to the root) and looks
function fingerprint(page, sel) {
  return page.evaluate((s) => {
    const root = document.querySelector(s);
    const base = root.getBoundingClientRect();
    // Where the page starts counts too (a dialog is placed on the screen, not the page)
    const top = base.y + (getComputedStyle(root).position === 'fixed' ? 0 : window.scrollY);
    const out = [{ k: 'ROOT', box: [base.width, base.x, top].map(Math.round) }];
    const PROPS = ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'borderTopWidth', 'borderTopLeftRadius', 'display', 'textAlign', 'paddingLeft', 'paddingTop'];
    for (const el of root.querySelectorAll('*')) {
      if (el.closest('.lh-mascot, .vlb-lulu, .ews-pet, .vlb-top-lulu, .pet-badge') && !el.matches('.lh-mascot, .vlb-lulu, .ews-pet, .vlb-top-lulu')) continue;
      if (el.closest('svg')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'contents' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      out.push({
        k: `${el.tagName.toLowerCase()}.${[...el.classList].sort().join('.')}`,
        box: [r.x - base.x, r.y - base.y, r.width, r.height].map(Math.round),
        css: PROPS.map((p) => cs[p]).join('|'),
      });
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
    // Fixed-size steppers: the browser's default padding can't show (same box)
    const looks = (e) => (/^(button|input)\./.test(e.k) ? e.css.split('|').slice(0, -2).join('|') : e.css);
    if (looks(x) !== looks(y)) out.push(`#${i} ${x.k} css ${x.css} vs ${y.css}`);
  }
  return out;
}

// (Lulu or Lumi speaks at random, with a random emoji)
const text = async (page, sel) => (await page.locator(sel).innerText()).replace(/\s+/g, ' ').replace(/\b(Lulu|Lumi) \S+ /g, 'Lulu ').trim();
const toastSeen = (page, t) => expect(page.locator('.toast-msg', { hasText: t }).first()).toBeVisible();
const petsReady = (page) => page.waitForFunction(() => !!window.Pets);

const PAGES = {
  leaderboard: {
    legacy: '/vocab-leaderboard.html?legacy=1', app: '/app/leaderboard', root: '.vlb-shell',
    ready: async (p) => {
      await petsReady(p);
      await p.locator('#dan-lb-list .dan-lb-row').nth(9).waitFor();
      await p.locator('#quiz-lb-list .dan-lb-row').nth(9).waitFor();
      await p.locator('.vlb-duel-btn').first().waitFor();
      await p.locator('#vlb-lulu > *').first().waitFor();
      await p.locator('.pet-badge, .dan-lb-row .ews-pet-badge, .dan-lb-row svg').first().waitFor();
    },
  },
  shop: {
    legacy: '/shop.html?legacy=1', app: '/app/shop', root: '.shop-shell',
    ready: async (p) => {
      await petsReady(p);
      await p.locator('#shop-items h3').first().waitFor();
      await p.locator('#shop-susano h3').first().waitFor();
      await p.locator('#shop-duels .duel-intro').waitFor();
      await p.locator('#shop-pets svg').first().waitFor();
    },
  },
  inbox: {
    legacy: '/inbox.html?legacy=1', app: '/app/inbox', root: '.inbox-layout',
    ready: async (p) => {
      await petsReady(p);
      await p.locator('.msg-item').nth(49).waitFor();
      await p.locator('.msg-item[data-id="m2"]').click();
      await p.locator('#replyText').waitFor();
      await p.locator('.gift-pet-art svg').waitFor();
    },
  },
  profile: {
    legacy: '/profile.html?legacy=1', app: '/app/profile', root: '.profile-layout',
    ready: async (p) => {
      await petsReady(p);
      await p.locator('#profileName:has-text("An Trần")').waitFor();
      await p.locator('#badgesCard .badge-item').first().waitFor();
      await p.locator('#heatmapCard').waitFor();
      await p.locator('#bandTrendChartWrap svg').waitFor();
      await p.locator('#recentActivity .activity-item').first().waitFor();
      await p.locator('.pfp-cover-dan svg').waitFor();
    },
  },
  tuition: {
    legacy: '/tuition.html?legacy=1', app: '/app/tuition', root: '.tuition-layout',
    ready: async (p) => {
      await p.locator('.fee-card').first().waitFor();
      await p.locator('#qrImg').waitFor();
      await p.locator('.tuition-hero .lh-mascot').waitFor();
    },
  },
  reviewHistory: {
    legacy: '/review-history.html?legacy=1', app: '/app/review-history', root: '.rh-layout',
    ready: async (p) => {
      await p.locator('#rhList .rh-item').nth(9).waitFor();
      await p.locator('#rhPagination').waitFor();
      await p.locator('.rh-hero .lh-mascot').waitFor();
    },
  },
  reviewHistoryMock: {
    legacy: '/review-history.html?legacy=1&view=mock', app: '/app/review-history?view=mock', root: '.rh-layout',
    ready: async (p) => {
      await p.locator('#mockList .rh-item').nth(9).waitFor();
      await p.locator('#mockPagination').waitFor();
      await p.locator('.rh-hero .lh-mascot').waitFor();
    },
  },
  dictation: {
    legacy: '/dictation.html?legacy=1', app: '/app/dictation', root: '.dict-wrap',
    ready: async (p) => {
      await p.locator('.dict-card').nth(9).waitFor();
      await p.locator('.dict-picker-head .lh-mascot').waitFor();
    },
  },
  // dictationPractice / dictationDrill: the React practice screen was
  // redesigned (word-by-word check, sentence player) — covered by the
  // dictation tests further down instead of a look-alike check.
  shadowing: {
    legacy: '/shadowing.html?legacy=1', app: '/app/shadowing', root: '.sh-wrap',
    ready: async (p) => {
      await p.locator('.sh-card').nth(23).waitFor();
      await p.locator('.pg-wrap').waitFor();
      await p.locator('.sh-head .lh-mascot').waitFor();
    },
  },
  grammar: {
    legacy: '/essential-grammar.html?legacy=1&lesson=present-simple', app: '/app/essential-grammar?lesson=present-simple', root: '.eg-layout',
    ready: grammarReady,
  },
  advWeeks: {
    legacy: '/advanced-sentences.html?legacy=1', app: '/app/advanced-sentences', root: '#app',
    ready: (p) => p.locator('.as-week-card.has-draft').waitFor(),
  },
  advWeeksFree: {
    legacy: '/advanced-sentences.html?legacy=1', app: '/app/advanced-sentences', root: '#app', patch: (s) => { s.user = { ...USER, plan: 'free' }; },
    ready: (p) => p.locator('.as-premium-banner').waitFor(),
  },
  advGroups: {
    legacy: '/advanced-sentences.html?legacy=1&week=1', app: '/app/advanced-sentences?week=1', root: '#app', patch: (s) => { s.advScores = true; },
    ready: async (p) => {
      await p.locator('.as-group-card').nth(1).waitFor();
      await p.locator('.as-group-card.has-draft').waitFor();
      await p.locator('.as-group-done').waitFor();
    },
  },
  advPractice: {
    legacy: '/advanced-sentences.html?legacy=1&week=1&groupId=ag1', app: '/app/advanced-sentences?week=1&groupId=ag1', root: '#app',
    ready: async (p) => {
      await p.locator('.wbwd-input').waitFor();
      await p.locator('#as-hint-btn').click();
      await p.locator('.as-hint-chip').waitFor();
    },
  },
  shadowingChooser: { legacy: '/shadowing.html?legacy=1&lesson=l0', app: '/app/shadowing?lesson=l0', root: '.sh-wrap', ready: shadowReady('.sh-choice.last') },
  shadowingPractice: { legacy: '/shadowing.html?legacy=1&lesson=l0&mode=shadowing', app: '/app/shadowing?lesson=l0&mode=shadowing', root: '.sh-wrap', ready: shadowReady('#sh-play') },
  shadowingWatch: { legacy: '/shadowing.html?legacy=1&lesson=l0&mode=watch', app: '/app/shadowing?lesson=l0&mode=watch', root: '.sh-wrap', ready: shadowReady('#wt-play') },
  shadowingDictation: { legacy: '/shadowing.html?legacy=1&lesson=l0&mode=dictation', app: '/app/shadowing?lesson=l0&mode=dictation', root: '.sh-wrap', ready: shadowReady('#dc-play') },
  wpWelcome: {
    legacy: '/writing-practice.html?legacy=1', app: '/app/writing-practice', root: '.wp-layout', patch: (s) => { s.advScores = true; },
    ready: wpReady(),
  },
  wpWelcomeFree: {
    legacy: '/writing-practice.html?legacy=1', app: '/app/writing-practice', root: '.wp-layout', patch: (s) => { s.user = { ...USER, plan: 'free' }; },
    ready: async (p) => { await wpReady()(p); await p.locator('#premium-promo-banner').waitFor(); },
  },
  wpDrill: {
    legacy: '/writing-practice.html?legacy=1&level=beginner&topic=myself&type=all', app: '/app/writing-practice?level=beginner&topic=myself&type=all', root: '.wp-layout',
    ready: wpReady(async (p) => { await typeWbw(p, 'Ia'); await p.locator('.wbw-word.is-done').first().waitFor(); }),
  },
  wpFeedback: {
    legacy: '/writing-practice.html?legacy=1&level=beginner&topic=myself&type=translation', app: '/app/writing-practice?level=beginner&topic=myself&type=translation', root: '.wp-layout',
    ready: wpReady(async (p) => {
      await typeWbw(p, 'Iamastudent');
      await p.locator('#feedback-card').waitFor();
      await p.keyboard.press('Enter');
      await p.locator('#vocab-hint-btn').click();
      await p.locator('#vocab-hint-btn').click();
      await p.locator('#answer-box').fill('I like wrong book');
      await p.locator('#submit-btn').click();
      await p.locator('#feedback-card .wp-diff-err').first().waitFor();
      await settle(p);
    }),
  },
  wpCombine: {
    legacy: '/writing-practice.html?legacy=1&level=beginner&topic=all&type=combine', app: '/app/writing-practice?level=beginner&topic=all&type=combine', root: '.wp-layout',
    ready: wpReady((p) => p.locator('#combine-answer-box').waitFor()),
  },
  wpRearrange: {
    legacy: '/writing-practice.html?legacy=1&level=beginner&topic=all&type=rearrange', app: '/app/writing-practice?level=beginner&topic=all&type=rearrange', root: '.wp-layout',
    patch: (s) => { s.fixedRandom = true; },
    ready: wpReady((p) => p.locator('#rearrange-bank .wp-word-chip', { hasText: 'plays' }).click()),
  },
  wpDone: {
    legacy: '/writing-practice.html?legacy=1&level=beginner&topic=myself&type=fill_blank', app: '/app/writing-practice?level=beginner&topic=myself&type=fill_blank', root: '.wp-layout',
    patch: (s) => { s.advScores = true; },
    ready: wpReady(async (p) => {
      await p.locator('#fill-options .wp-option-btn', { hasText: 'on' }).click();
      await p.locator('#fill-input').fill('wrong');
      await p.locator('#submit-btn').click();
      await p.locator('#wp-next-btn').click();
      await p.locator('.wp-wr-item').waitFor();
      await p.locator('#done-icon > *').first().waitFor();
      await p.evaluate(() => { document.querySelectorAll('.wp-done-stats span:last-child').forEach((e) => { e.textContent = '⏱ 0:01'; }); });
    }),
  },
  wpTest: {
    legacy: '/writing-practice.html?legacy=1', app: '/app/writing-practice', root: '.wp-layout', patch: (s) => { s.fixedRandom = true; },
    ready: wpReady(async (p) => {
      await wpStartTest(p, '15');
      await p.locator('#test-answer-box').fill('I like reading books.');
      await p.locator('#test-next-btn').click();
      await p.locator('#test-rearrange-bank .wp-word-chip').first().waitFor();
      await p.evaluate(() => { document.getElementById('test-timer').textContent = '⏱ 04:29'; });
    }),
  },
  wpTestResults: {
    legacy: '/writing-practice.html?legacy=1', app: '/app/writing-practice', root: '.wp-layout', patch: (s) => { s.fixedRandom = true; },
    ready: wpReady(async (p) => {
      await wpStartTest(p);
      await p.locator('#test-answer-box').fill('I like reading books.');
      await p.locator('#test-next-btn').click();
      for (const w of ['She', 'plays', 'tennis', 'daily']) await p.locator('#test-rearrange-bank .wp-word-chip', { hasText: w }).click();
      await p.locator('#test-next-btn').click();
      await p.locator('#test-fill-options .wp-option-btn', { hasText: 'in' }).click();
      await p.locator('#test-next-btn').click();
      await p.locator('.wp-test-big-score').waitFor();
      await p.locator('.wp-review-item').nth(2).waitFor();
    }),
  },
  wpHistory: {
    legacy: '/writing-practice.html?legacy=1', app: '/app/writing-practice', root: '.t1-hist-modal',
    ready: wpReady(async (p) => {
      await p.locator('.t1-hist-open-btn').click();
      await p.locator('.t1-hist-row').nth(1).waitFor();
    }),
  },
  wpQuit: {
    legacy: '/writing-practice.html?legacy=1&level=beginner&topic=myself&type=translation', app: '/app/writing-practice?level=beginner&topic=myself&type=translation', root: '.wp-quit-box',
    ready: wpReady(async (p) => {
      await typeWbw(p, 'Iamastudent');
      await p.locator('#feedback-card').waitFor();
      await p.locator('#state-exercise .wp-stop-btn').click();
      await p.locator('#wp-quit-results').waitFor();
    }),
  },
  t1Welcome: {
    legacy: '/task1-practice.html?legacy=1', app: '/app/task1-practice', root: '.wp-layout', patch: (s) => { s.advScores = true; },
    ready: t1Ready(),
  },
  t1Set2: {
    legacy: '/task1-practice.html?legacy=1&skill=trend_language&set=set2', app: '/app/task1-practice?skill=trend_language&set=set2', root: '.wp-layout',
    ready: t1Ready(),
  },
  t1Translation: {
    legacy: '/task1-practice.html?legacy=1&skill=noun_phrase', app: '/app/task1-practice?skill=noun_phrase', root: '.wp-layout',
    ready: t1Ready(async (p) => { await t1Start(p); await typeWbw(p, 'Thenu'); await p.locator('.wbw-word.is-done').first().waitFor(); }),
  },
  t1Transform: {
    legacy: '/task1-practice.html?legacy=1&skill=data_description', app: '/app/task1-practice?skill=data_description', root: '.wp-layout',
    ready: t1Ready(async (p) => {
      await t1Start(p);
      await p.locator('#vocab-hint-btn').click();
      await p.locator('.t1-hint-chip').waitFor();
    }),
  },
  t1Feedback: {
    legacy: '/task1-practice.html?legacy=1&skill=data_description', app: '/app/task1-practice?skill=data_description', root: '.wp-layout',
    ready: t1Ready(async (p) => {
      await t1Start(p);
      await p.locator('#answer-box').fill('There was a wrong increase');
      await p.locator('#submit-btn').click();
      await p.locator('#feedback-card .wp-diff-err').first().waitFor();
      await settle(p);
    }),
  },
  t1Chart: {
    legacy: '/task1-practice.html?legacy=1&skill=comparison', app: '/app/task1-practice?skill=comparison', root: '.wp-layout',
    patch: (s) => { s.fixedRandom = true; },
    ready: t1Ready(async (p) => { await t1Start(p); await p.locator('#t1-chart svg').waitFor(); await p.locator('#rearrange-bank .wp-word-chip', { hasText: 'topped' }).click(); }),
  },
  t1Fill: {
    legacy: '/task1-practice.html?legacy=1&skill=trend_language', app: '/app/task1-practice?skill=trend_language', root: '.wp-layout',
    ready: t1Ready(async (p) => { await t1Start(p); await p.locator('#t1-chart svg').waitFor(); await p.locator('#fill-input').fill('from, to'); await p.evaluate(() => window.scrollTo(0, 0)); }),
  },
  t1Mc: {
    legacy: '/task1-practice.html?legacy=1&skill=overview', app: '/app/task1-practice?skill=overview', root: '.wp-layout',
    ready: t1Ready(async (p) => { await t1Start(p); await p.locator('#mc-options .t1-mc-option').nth(2).click(); }),
  },
  t1Error: {
    legacy: '/task1-practice.html?legacy=1&skill=paraphrase', app: '/app/task1-practice?skill=paraphrase', root: '.wp-layout',
    ready: t1Ready(async (p) => { await t1Start(p); await p.locator('#error-orig-text').waitFor(); }),
  },
  t1Done: {
    legacy: '/task1-practice.html?legacy=1&skill=paraphrase', app: '/app/task1-practice?skill=paraphrase', root: '.wp-layout',
    patch: (s) => { s.advScores = true; },
    ready: t1Ready(async (p) => {
      await t1Start(p);
      await p.locator('#answer-box').fill('The number of people wrong.');
      await p.locator('#submit-btn').click();
      await p.locator('#next-btn-practice').click();
      await p.locator('.wp-wr-item').waitFor();
      await p.locator('#done-icon > *').first().waitFor();
    }),
  },
  t1Test: {
    legacy: '/task1-practice.html?legacy=1', app: '/app/task1-practice', root: '.wp-layout', patch: (s) => { s.fixedRandom = true; },
    ready: t1Ready(async (p) => {
      await wpStartTest(p, '15');
      await p.locator('#test-answer-box').fill('There was an increase of 10%');
      await p.locator('#test-next-btn').click();
      await p.locator('#test-rearrange-bank .wp-word-chip').first().waitFor();
      await p.locator('#test-chart svg').waitFor();
      await p.evaluate(() => { document.getElementById('test-timer').textContent = '⏱ 05:59'; });
    }),
  },
  t1TestResults: {
    legacy: '/task1-practice.html?legacy=1', app: '/app/task1-practice', root: '.wp-layout', patch: (s) => { s.fixedRandom = true; },
    ready: t1Ready(async (p) => {
      await wpStartTest(p);
      await p.locator('#test-answer-box').fill('There was an increase of 10%');
      await p.locator('#test-next-btn').click();
      for (const w of ['China', 'topped', 'the', 'list']) await p.locator('#test-rearrange-bank .wp-word-chip', { hasText: w }).click();
      await p.locator('#test-next-btn').click();
      await p.locator('#test-fill-input').fill('from, to');
      await p.locator('#test-next-btn').click();
      await p.locator('#test-mc-options .t1-mc-option').nth(1).click();
      await p.locator('#test-next-btn').click();
      await p.locator('#test-review-list > div').nth(3).waitFor();
    }),
  },
  t1History: {
    legacy: '/task1-practice.html?legacy=1', app: '/app/task1-practice', root: '.t1-hist-modal',
    ready: t1Ready(async (p) => {
      await p.locator('.t1-hist-open-btn').first().click();
      await p.locator('.t1-hist-row').nth(1).waitFor();
    }),
  },
  t1Quit: {
    legacy: '/task1-practice.html?legacy=1&skill=data_description', app: '/app/task1-practice?skill=data_description', root: '.wp-quit-box',
    ready: t1Ready(async (p) => {
      await t1Start(p);
      await p.locator('#answer-box').fill('There was an increase of 10%');
      await p.locator('#submit-btn').click();
      await p.locator('#feedback-card').waitFor();
      await p.locator('#state-exercise .wp-stop-btn').click();
      await p.locator('#quit-title').waitFor();
    }),
  },
};

// Task 1 Grammar: the skill counts are in, then the given steps
function t1Ready(steps) {
  return async (p) => {
    await p.locator('.t1-skill-tab .wp-lc-badge').first().waitFor({ state: 'attached' });
    if (steps) await steps(p);
  };
}
// "Bắt đầu luyện tập", then the first exercise is on screen
async function t1Start(p) {
  await p.locator('.wp-welcome-start').click();
  await p.locator('#exercise-card').waitFor();
}

// Luyện viết câu giao tiếp: the filter counts are in, then the given steps
function wpReady(steps) {
  return async (p) => {
    await p.locator('.wp-topic-btn .wp-lc-badge').first().waitFor({ state: 'attached' });
    await p.locator('.wp-level-btn .wp-lc-badge').first().waitFor({ state: 'attached' });
    if (steps) await steps(p);
  };
}
// Thi thử from the sidebar, or on a phone from the settings sheet
async function wpStartTest(p, count) {
  const phone = !(await p.locator('#btn-mode-test').isVisible());
  if (phone) { await p.locator('#wp-mob-fab').click(); await p.locator('#sheet-btn-mode-test').click(); await p.locator('#wp-mob-fab').click(); }
  else await p.locator('#btn-mode-test').click();
  const box = phone ? '#sheet-test-setup' : '#test-setup';
  if (count) await p.locator(box + ' [data-tcount="' + count + '"]').click();
  await p.locator(box + ' .wp-start-test-btn').click();
}
const typeWbw = (page, letters) => page.locator('.wbw-input').pressSequentially(letters, { delay: 15 });
// A smooth scrollIntoView has come to rest
const settle = (p) => p.evaluate(() => new Promise((done) => {
  let last = -1;
  const timer = setInterval(() => {
    if (window.scrollY === last) { clearInterval(timer); done(); }
    last = window.scrollY;
  }, 200);
}));

async function grammarReady(p) {
  await p.locator('.eg-hero .lh-mascot').waitFor();
  await p.locator('.eg-hist-row').first().waitFor();
  await p.locator('.eg-lesson-item .wp-item-done-icon').first().waitFor({ state: 'attached' });
}

function shadowReady(sel) {
  return async (p) => {
    await p.locator('#sh-list .sh-item').nth(2).waitFor();
    await p.locator('iframe#yt-player').waitFor({ state: 'attached' });
    await p.locator(sel).waitFor();
  };
}

// Open one tab of the profile, on either version of the page
const profileTab = (name, sel) => async (p) => {
  await PAGES.profile.ready(p);
  await p.locator(`.tab-btn[data-tab="${name}"]`).click();
  await p.locator(sel).first().waitFor();
  // The click scrolls smoothly, and the sticky sidebar moves with it
  await p.evaluate(() => new Promise((done) => {
    let last = -1;
    const timer = setInterval(() => {
      if (window.scrollY === last) { clearInterval(timer); done(); }
      last = window.scrollY;
    }, 200);
  }));
};

async function compare(browser, name, label, { viewport = { width: 1280, height: 900 }, patch = () => {}, ready, root } = {}) {
  const cfg = { ...PAGES[name], root: root || PAGES[name].root };
  const snap = async (url, tag) => {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const state = makeState();
    cfg.patch?.(state);
    patch(state);
    const { errors } = await open(page, url, state);
    await (ready || cfg.ready)(page);
    // Tabs only the new Hồ sơ has
    await page.locator('.tab-btn[data-tab="goal"]').evaluateAll((els) => els.forEach((e) => e.remove()));
    await page.mouse.move(0, 0); // the layout moved: nothing should stay hovered by accident
    const print = await fingerprint(page, cfg.root);
    const words = await text(page, cfg.root);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${name}-${label}-${tag}.png`.replace(/\s+/g, '-')), fullPage: true });
    await ctx.close();
    return { print, words, errors };
  };
  const old = await snap(cfg.legacy, 'old');
  const now = await snap(cfg.app, 'new');
  expect(now.errors).toEqual([]);
  let at = 0;
  while (at < old.words.length && old.words[at] === now.words[at]) at += 1;
  expect(now.words.slice(Math.max(0, at - 40), at + 60)).toBe(old.words.slice(Math.max(0, at - 40), at + 60));
  expect(diffPrints(old.print, now.print)).toEqual([]);
}

for (const name of Object.keys(PAGES)) {
  test(`${name} looks the same as the old page (desktop)`, ({ browser }) => compare(browser, name, 'desktop'));
  test(`${name} looks the same as the old page (phone)`, ({ browser }) => compare(browser, name, 'phone', { viewport: { width: 390, height: 844 } }));
  test(`${name} looks the same as the old page (dark)`, ({ browser }) => compare(browser, name, 'dark', { patch: (s) => { s.theme = 'dark'; } }));
}

// Every kind of result on screen at once, on either version of the page
const grammarWorked = async (p) => {
  await grammarReady(p);
  const rows = p.locator('.eg-vf-row .eg-drill-input');
  await rows.nth(0).fill('went');
  await rows.nth(1).fill('wrong');
  await p.locator('.eg-drill-actions .eg-ex-reveal-btn').first().click();
  await p.locator('.eg-vf-row.eg-drill-bad').waitFor();
  await p.locator('.eg-conj-input').fill('work');
  await p.locator('.eg-drill-actions .eg-ex-reveal-btn').nth(1).click();
  await p.locator('.eg-conj-row.eg-drill-bad').waitFor();
  await p.locator('.eg-tr-input').fill('I know');
  await p.locator('.eg-tr-actions .eg-ex-reveal-btn').click();
  await p.locator('.eg-tr-head-bad').waitFor();
  await p.locator('.eg-tr-actions .ask-lulu').click();
  await p.locator('.eg-tr-hint.vis').waitFor();
  await p.locator('.eg-ex-item input.eg-ex-input').fill('goes');
  await p.locator('.eg-ex-item:has(input.eg-ex-input) .eg-ex-reveal-btn').click();
  await p.locator('.eg-ex-answer-panel.vis').waitFor();
  await p.locator('.eg-quiz-q .eg-quiz-option').first().click();
  await p.locator('#eg-grade-footer button').waitFor();
  await p.locator('.ews-lulu-say, .ask-lulu-bubble').first().waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
  await p.mouse.move(0, 0);
};
test('grammar with every drill answered matches the old page', ({ browser }) => compare(browser, 'grammar', 'worked', { ready: grammarWorked }));
test('grammar with every drill answered matches the old page (phone)', ({ browser }) => compare(browser, 'grammar', 'worked phone', { ready: grammarWorked, viewport: { width: 390, height: 844 } }));
test('grammar with every drill answered matches the old page (dark)', ({ browser }) => compare(browser, 'grammar', 'worked dark', { ready: grammarWorked, patch: (s) => { s.theme = 'dark'; } }));

const shopReady = async (p) => {
  await petsReady(p);
  await p.locator('#shop-items h3').first().waitFor();
  await p.locator('#shop-pets svg').first().waitFor();
  await p.locator('#shop-duels .duel-intro').waitFor();
};
const boardsReady = async (p) => {
  await petsReady(p);
  await p.locator('#dan-lb-list[aria-busy]').waitFor({ state: 'detached' });
  await p.locator('#quiz-lb-list[aria-busy]').waitFor({ state: 'detached' });
  await p.locator('#vlb-lulu > *').first().waitFor();
};
const inboxReady = (sel) => (p) => p.locator(sel).first().waitFor();

const VARIANTS = [
  ['shop', 'new student who won the hammer bet', shopReady, (s) => {
    s.pets = new Set();
    s.shopPatch = { pet: null, activePet: '', effects: { hopeLast: { day: '2026-11-17', success: true, base: 12 } } };
  }],
  ['shop', 'pet at home, lost bet, caked without a towel', shopReady, (s) => {
    s.owned.towel = 0;
    s.shopPatch = { pet: null, activePet: '', effects: { hopeLast: { day: '2026-11-16', success: false, base: 2, penalty: 5 }, cakedUntil: inHours(5.5) } };
  }],
  ['shop', 'gift not earned yet, quota reached', shopReady, (s) => {
    s.gift = null;
    s.wallet = 3;
    s.shopPatch = { effects: { hope: { base: 12, quota: 10, penalty: 5 } } };
  }],
  ['shop', 'load failed', (p) => p.locator('#shop-items .shop-empty').waitFor(), (s) => { s.failShop = true; }],
  ['leaderboard', 'first place, nobody on the quiz board', boardsReady, (s) => {
    s.boardPatch = {
      streak: { me: { rank: 1, total: 45, streak: 40, hidden: true } },
      quiz: { leaderboard: [], total: 0, me: { rank: null, total: 0 } },
    };
  }],
  ['leaderboard', 'staff account shape, no shop', boardsReady, (s) => {
    s.failShop = true;
    s.boardPatch = { streak: { me: null }, quiz: { me: null } };
  }],
  ['leaderboard', 'tied with the rank above', boardsReady, (s) => {
    s.boardPatch = {
      streak: { me: { rank: 7, total: 45, streak: 34 } },
      quiz: { me: { rank: 5, total: 12, score: 95, attempts: 3, timeSpent: 70, nextScore: 95 } },
    };
  }],
  ['leaderboard', 'boards failed', (p) => p.locator('#quiz-lb-list .dan-lb-empty').waitFor(), (s) => { s.failBoards = true; }],
  ['inbox', 'empty', inboxReady('.empty-state'), (s) => { s.messages = []; }],
  ['inbox', 'load failed', inboxReady('.empty-state p:has-text("Lỗi máy chủ")'), (s) => { s.failInbox = true; }],
  ['inbox', 'claimed gift in a broadcast', async (p) => {
    await p.locator('.msg-item[data-id="m1"]').click();
    await p.locator('.gift-claimed-label').waitFor();
  }, (s) => { Object.assign(s.messages[1], { giftHammers: 1, giftClaimed: true }); }],
  ['profile', 'edit tab', profileTab('edit', '#editFirstName'), () => {}],
  ['profile', 'security tab', profileTab('security', '#secNewPass'), () => {}],
  ['profile', 'security tab of a Google account', profileTab('security', '#secSocialNote'), (s) => { s.profile.hasPassword = false; }],
  ['profile', 'history tab', profileTab('history', '#readingHistory tr'), () => {}],
  ['profile', 'inventory tab', profileTab('inventory', '.inv-pet svg'), () => {}],
  ['profile', 'empty inventory', profileTab('inventory', '.inv-empty'), (s) => {
    s.pets = new Set(); s.owned = {}; s.danielHammer = { count: 0, canUse: false };
  }],
  ['profile', 'free account with nothing done yet', async (p) => {
    await petsReady(p);
    await p.locator('#profileName:has-text("An Trần")').waitFor();
    await p.locator('#bandTrendChartWrap div').waitFor();
    await p.locator('#planUpgradeBtn').waitFor();
  }, (s) => {
    Object.assign(s.profile, { plan: 'free', planExpiresAt: null, planStartedAt: null, bio: '', studyMotto: '', targetBand: null, targetExamDate: null });
    s.stats = { streak: 0 };
    s.badges = { success: true, badges: [], earnedCount: 0, totalCount: 0 };
  }],
  ['profile', 'Premium ending in 3 days', async (p) => {
    await p.locator('#planUpgradeBtn').waitFor();
  }, (s) => { s.profile.planExpiresAt = new Date(NOW + 2.5 * 86400000).toISOString(); }],
  ['profile', 'expired Premium', async (p) => {
    await p.locator('.plan-tag--expired').waitFor();
  }, (s) => { s.profile.planExpiresAt = daysAgo(2); }],
];

for (const [name, label, ready, patch] of VARIANTS) {
  test(`${name} matches the old page: ${label}`, ({ browser }) => compare(browser, name, label, { ready, patch }));
}

for (const [tab, sel] of [['edit', '#editFirstName'], ['security', '#secNewPass'], ['history', '#readingHistory tr'], ['inventory', '.inv-pet svg']]) {
  const ready = profileTab(tab, sel);
  test(`profile ${tab} tab matches the old page (dark)`, ({ browser }) => compare(browser, 'profile', `${tab} dark`, { ready, patch: (s) => { s.theme = 'dark'; } }));
  test(`profile ${tab} tab matches the old page (phone)`, ({ browser }) => compare(browser, 'profile', `${tab} phone`, { ready, viewport: { width: 390, height: 844 } }));
}

for (const theme of ['light', 'dark']) {
  const patch = (s) => { s.theme = theme; };
  test(`buy dialog matches the old page (${theme})`, ({ browser }) => compare(browser, 'shop', `buy dialog ${theme}`, {
    patch,
    root: '.shop-qty-modal',
    ready: async (p) => { await shopReady(p); await p.locator('[data-buy="cake"]').click(); await p.locator('.shop-qty-input').waitFor(); },
  }));
  test(`duel dialog from the shop matches the old page (${theme})`, ({ browser }) => compare(browser, 'shop', `duel dialog ${theme}`, {
    patch,
    root: '.duel-modal',
    ready: async (p) => { await shopReady(p); await p.locator('[data-duel-new]').click(); await p.locator('.duel-modal [data-pick="u9"]').waitFor(); },
  }));
  test(`duel dialog from the board matches the old page (${theme})`, ({ browser }) => compare(browser, 'leaderboard', `duel dialog ${theme}`, {
    patch,
    root: '.duel-modal',
    ready: async (p) => { await PAGES.leaderboard.ready(p); await p.locator('[data-duel="u5"]').click(); await p.locator('.duel-modal [data-ok]').waitFor(); },
  }));
  test(`gift dialog matches the old page (${theme})`, ({ browser }) => compare(browser, 'profile', `gift dialog ${theme}`, {
    patch,
    root: '.inv-gift-modal',
    ready: async (p) => {
      await profileTab('inventory', '[data-inv-gift-item="cake"]')(p);
      await p.locator('[data-inv-gift-item="cake"]').click();
      await p.locator('.inv-gift-modal [data-gift-to="u9"]').click();
    },
  }));
}

async function leaderboardFlow(page, log) {
  await PAGES.leaderboard.ready(page);
  await expect(page.locator('#dan-lb-list .dan-lb-row')).toHaveCount(11); // top 10 + my pinned row
  await expect(page.locator('.vlb-more[data-more="streak"]')).toContainText('+20');
  await page.locator('.vlb-more[data-more="streak"]').click();
  await expect(page.locator('#dan-lb-list .dan-lb-row')).toHaveCount(31);
  await expect(page.locator('.vlb-more[data-more="streak"]')).toContainText('+5');

  await page.locator('#dan-lb-list .dan-lb-row').nth(4).locator('.dan-lb-name').click();
  await expect(page.locator('#modal-peer-profile')).toBeVisible();
  await page.evaluate(() => window.closePeerProfile());

  // 🎂 / 🔍 / ⚔️ must not open the row's profile
  await page.locator('[data-cake="u0"]').click();
  await expect(page.locator('#shared-confirm-modal')).toBeVisible();
  await expect(page.locator('#modal-peer-profile')).toBeHidden();
  await page.locator('#shared-confirm-ok').click();
  await toastSeen(page, 'dính đầy kem');
  await expect(page.locator('.vlb-shop-bits')).toContainText('Bạn có 1 🎂');
  await expect(page.locator('#dan-lb-list .dan-lb-row')).toHaveCount(31); // "Xem thêm" survives the refresh

  await page.locator('[data-lens="u2"]').click();
  await page.locator('#shared-confirm-ok').click();
  await toastSeen(page, 'đã rách');
  await expect(page.locator('[data-lens]')).toHaveCount(0);

  await page.locator('[data-duel="u5"]').click();
  await expect(page.locator('.duel-modal')).toBeVisible();
  await expect(page.locator('#modal-peer-profile')).toBeHidden();
  await page.locator('.duel-modal [data-set="20"]').click();
  await page.locator('.duel-modal [data-ok]').click();
  await toastSeen(page, 'Đã gửi lời thách');
  await expect(page.locator('.duel-modal')).toHaveCount(0);
  expect(log).toHaveLength(3);
}

async function shopFlow(page, log, state) {
  await PAGES.shop.ready(page);
  await expect(page.locator('[data-buy="iceShield"]')).toBeDisabled();
  await expect(page.locator('[data-buy="iceShield"]')).toHaveText('Đã đầy');

  const dlg = page.locator('.shop-qty-modal');
  await page.locator('[data-buy="cake"]').click();
  await expect(dlg.locator('.shop-qty-input')).toBeFocused();
  await expect(dlg.locator('[data-step="-1"]')).toBeDisabled();
  await dlg.locator('[data-step="1"]').click();
  await expect(dlg.locator('.shop-qty-total')).toContainText('2 × 🔥 10 = 🔥 20');
  await dlg.locator('[data-set="10"]').click();
  await expect(dlg.locator('[data-ok]')).toHaveText('Mua 10 · 🔥 100');
  await dlg.locator('.shop-qty-input').fill('500');
  await expect(dlg.locator('[data-ok]')).toHaveText('Mua 20 · 🔥 200');
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveCount(0);

  await page.locator('[data-buy="cake"]').click();
  await dlg.locator('.shop-qty-input').fill('3');
  await page.keyboard.press('Enter');
  await toastSeen(page, 'Đã mua 3 Bánh Kem');
  await expect(page.locator('#shop-wallet-value')).toHaveText('170');

  await page.locator('[data-buy-pet="shiba"]').click();
  await expect(page.locator('#shared-confirm-title')).toContainText('Shiba');
  await page.locator('#shared-confirm-ok').click();
  await toastSeen(page, 'đã về nhà với bạn');
  await expect(page.locator('#shop-wallet-value')).toHaveText('140');

  await page.locator('[data-pet-gift]').click();
  await toastSeen(page, 'mang về +4');
  await expect(page.locator('.shop-gift-done')).toBeVisible();

  state.failBuy = true;
  await page.locator('[data-buy="towel"]').click();
  await dlg.locator('[data-ok]').click();
  await toastSeen(page, 'Ví không đủ lửa');
  state.failBuy = false;

  await page.locator('[data-duel-decline="d1"]').click();
  await toastSeen(page, 'Đã từ chối');
  await expect(page.locator('[data-duel-decline]')).toHaveCount(0);

  await page.locator('[data-duel-new]').click();
  await page.locator('.duel-modal [data-pick="u9"]').click();
  await page.locator('.duel-modal [data-ok]').click();
  await toastSeen(page, 'Đã gửi lời thách');
  expect(log).toHaveLength(6);
}

async function profileFlow(page, log, state, isApp) {
  await PAGES.profile.ready(page);
  await expect(page.locator('.tab-btn.active')).toHaveAttribute('data-tab', 'overview');
  await expect(page.locator('#streakCount')).toHaveText('12 ngày');
  await expect(page.locator('#planBadge')).toContainText('Premium');

  await page.locator('.tab-btn[data-tab="edit"]').click();
  await expect(page.locator('#editFirstName')).toHaveValue('An');
  await expect(page.locator('#editTargetBand')).toHaveValue('7');
  await expect(page.locator('#bioCount')).toHaveText('15');
  await page.locator('#editFirstName').fill('Sai');
  await page.locator('#tab-edit .btn-primary').click();
  await expect(page.locator('#editMsg')).toHaveText('Tên không hợp lệ');
  await page.locator('#editFirstName').fill('Bình');
  await page.locator('#editMotto').fill('Học đều');
  await page.locator('#editTargetBand').selectOption('7.5');
  await page.locator('#editLastName').press('Enter');
  await expect(page.locator('#editMsg')).toHaveText('Đã lưu thay đổi thành công!');
  await expect(page.locator('#profileName')).toHaveText('Bình Trần');
  await expect(page.locator('#mottoText')).toHaveText('Học đều');
  await expect(page.locator('#targetBandDisplay')).toHaveText('7.5');
  await page.locator('.accent-swatch[data-primary="#10b981"]').click();
  await expect(page.locator('.accent-swatch.active')).toHaveAttribute('data-primary', '#10b981');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('profileAccent')).primary)).toBe('#10b981');
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--brand'))).toBe('#10b981');

  await page.locator('.tab-btn[data-tab="security"]').click();
  const submit = page.locator('#tab-security .btn-primary');
  await submit.click();
  await expect(page.locator('#secMsg')).toHaveText('Vui lòng nhập mật khẩu hiện tại');
  await page.locator('#secCurrentPass').fill('mat-khau-cu');
  await page.locator('#secNewPass').fill('ngan');
  await submit.click();
  await expect(page.locator('#secMsg')).toHaveText('Mật khẩu phải có ít nhất 8 ký tự');
  await page.locator('#secNewPass').fill('mat-khau-moi');
  await page.locator('#secConfirmPass').fill('khac-han-nhe');
  await submit.click();
  await expect(page.locator('#secMsg')).toHaveText('Mật khẩu xác nhận không khớp');
  await page.locator('#secCurrentPass').fill('sai-mat-khau');
  await page.locator('#secConfirmPass').fill('mat-khau-moi');
  await submit.click();
  await expect(page.locator('#secMsg')).toHaveText('Mật khẩu hiện tại không đúng');
  await page.locator('#secCurrentPass').fill('mat-khau-cu');
  await page.locator('#secConfirmPass').press('Enter');
  await expect(page.locator('#secMsg')).toHaveText('Đã đổi mật khẩu thành công');
  await expect(page.locator('#secNewPass')).toHaveValue('');
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBe('new-token');

  await page.locator('.tab-btn[data-tab="history"]').click();
  await expect(page.locator('#readingHistory tr:visible')).toHaveCount(9);
  await page.locator('#readingHistory button').click();
  await expect(page.locator('#readingHistory tr:visible')).toHaveCount(12);
  await expect(page.locator('#readingHistory button')).toHaveText('Thu gọn');

  await page.locator('#avatarInput').setInputFiles({
    name: 'a.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'),
  });
  await expect(page.locator('img#avatarDisplay')).toHaveAttribute('src', /buaDaniel/);
  // (the old page has no account dock, so no menu avatar to update)
  if (isApp) await expect(page.locator('#navAvatar img')).toHaveAttribute('src', /buaDaniel/);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('user')).avatar)).toContain('buaDaniel');

  await page.locator('.tab-btn[data-tab="inventory"]').click();
  await page.locator('[data-inv-use="crown"], [data-inv-use="towel"]').first().waitFor();
  await page.locator('[data-inv-use="towel"]').click();
  await page.locator('#shared-confirm-ok').click();
  await toastSeen(page, 'Lau sạch bong');
  await page.locator('[data-inv-sell-item="cake"]').click();
  await page.locator('#shared-confirm-ok').click();
  await toastSeen(page, 'Đã bán');
  await page.locator('[data-inv-daniel]').click();
  await page.locator('#shared-confirm-ok').click();
  await toastSeen(page, 'Đã khôi phục chuỗi 9');
  await page.locator('[data-inv-pet=""]').click();
  await toastSeen(page, 'Linh thú đã về nghỉ');
  await page.locator('[data-inv-gift-item="cake"]').click();
  const gift = page.locator('.inv-gift-modal');
  await expect(gift.locator('[data-ok]')).toBeDisabled();
  await gift.locator('[data-gift-to="u9"]').click();
  await gift.locator('[data-step="1"]').click();
  await expect(gift.locator('[data-ok]')).toHaveText('🎁 Tặng 2 cho Giang');
  await gift.locator('[data-ok]').click();
  await toastSeen(page, 'Đã gửi 2');
  await expect(gift).toHaveCount(0);
  expect(log.filter((l) => !l.startsWith('POST /user/avatar'))).toHaveLength(9);
}

async function inboxFlow(page, log, state, isApp) {
  await page.locator('.msg-item').nth(49).waitFor();
  await expect(page.locator('#unreadBadge')).toHaveText('3');
  await page.locator('.msg-item[data-id="m0"]').click();
  await expect(page.locator('.detail-subject')).toHaveText('Tin nhắn số 0');
  await expect(page.locator('#unreadBadge')).toHaveText('2');
  await expect(page.locator('.msg-item[data-id="m0"]')).toHaveClass(/selected/);
  await expect(page.locator('.msg-item[data-id="m0"] .dot-unread')).toHaveCount(0);

  await page.locator('#replySendBtn').click();
  await expect(page.locator('#replyText')).toBeFocused();
  await page.locator('#replyText').fill('Em cảm ơn thầy');
  await page.locator('#replySendBtn').click();
  await toastSeen(page, 'Đã gửi phản hồi');
  await expect(page.locator('#replyText')).toHaveValue('');

  await page.locator('#claimGiftBtn').click();
  await toastSeen(page, 'Đã nhận quà: 2 búa, 3 lửa');
  await expect(page.locator('.gift-claimed-label')).toBeVisible();

  await page.locator('.msg-item[data-id="m2"]').click();
  await expect(page.locator('.detail-subject')).toHaveText('Tin nhắn số 2');
  await page.locator('.detail-actions .btn-danger').click();
  await expect(page.locator('#shared-confirm-msg')).toContainText('còn quà chưa nhận');
  await page.locator('#shared-confirm-ok').click();
  await expect(page.locator('.msg-item[data-id="m2"]')).toHaveCount(0);
  await expect(page.locator('.detail-placeholder')).toBeVisible();

  await expect(page.locator('#loadMoreBtn')).toContainText('Xem thêm (49/59)');
  await page.locator('#loadMoreBtn').click();
  // The delete shifts the server's pages by one: the old page then misses a
  // message, the app reads the shifted page again and shows all 59.
  await expect(page.locator('.msg-item')).toHaveCount(isApp ? 59 : 58);
  expect(log.length).toBe(5);
}

async function tuitionFlow(page) {
  await PAGES.tuition.ready(page);
  await page.locator('#nbtn-f1').click();
  await expect(page.locator('#fcard-f1 .status-notified')).toBeVisible(); // the old page gets there by reloading
}

async function dictationFlow(page, log) {
  await page.locator('.dict-card', { hasText: 'Cam 18 Test 1' }).click();
  await page.locator('.dict-num-btn').nth(2).waitFor();
  await page.fill('#dict-input', 'hello wrong');
  await page.click('#dict-check-btn');
  await expect(page.locator('#dict-status')).toContainText('Incorrect');
  await page.fill('#dict-input', 'Hello there, my friend.');
  await page.keyboard.press('Enter');
  await expect(page.locator('#dict-status')).toContainText('Correct!');
  await page.click('.dict-back-btn');
  await page.locator('.dict-card').first().waitFor();
  await expect.poll(() => log.length).toBe(1);
}

async function shadowingFlow(page, log) {
  await page.locator('.sh-card[data-slug="l0"]').click();
  await page.locator('.sh-choice[data-mode="dictation"]').click();
  await page.fill('#dc-input', 'Hello there my friend');
  await page.keyboard.press('Enter');
  await expect(page.locator('#dc-score')).toContainText('Chính xác');
  await page.click('.sh-back');
  await page.locator('.sh-card').first().waitFor();
  await expect.poll(() => log.length).toBe(1);
}

async function grammarFlow(page, log) {
  await grammarReady(page);
  await page.locator('.eg-ex-item[data-ref] .eg-quiz-option').nth(1).click();
  await page.locator('.eg-quiz-q').nth(0).locator('.eg-quiz-option').nth(1).click();
  await page.locator('.eg-quiz-q').nth(1).locator('.eg-quiz-option').nth(1).click();
  await expect(page.locator('#eg-quiz-result')).toContainText('67%');
  await expect.poll(() => log.length).toBe(1);
  log[0] = log[0].replace(/"timeSpent":\d+/, '"timeSpent":1');
}

// Types a sentence into the "gõ từng chữ" drill, letters only
const typeDrill = (page, letters) => page.locator('.wbwd-input').pressSequentially(letters, { delay: 15 });
async function advFlow(page, log) {
  await page.locator('.as-week-card[data-week="1"]').click();
  await page.locator('.as-group-card[data-id="ag1"]').click();
  await typeDrill(page, 'Thebookisgood');
  await expect(page.locator('#as-fb')).toContainText('Chính xác');
  await page.locator('#as-next-btn').click();
  // three wrong letters on one word fail the sentence
  for (const ch of 'xxx') { await page.locator('.wbwd-input').press(ch); await page.waitForTimeout(320); }
  await expect(page.locator('#as-fb')).toContainText('gõ sai từ “He” 3 lần');
  await page.locator('#as-next-btn').click();
  await page.locator('#as-fallback').fill('A wrong free answer');
  await page.locator('#as-submit-btn').click();
  await expect(page.locator('#as-fb')).toContainText('Chưa đúng cấu trúc <which>.');
  await page.locator('#as-next-btn').click(); // the failed sentence, again
  await expect(page.locator('.as-counter')).toContainText('4 / 4 câu · 🔁 Làm lại');
  await page.locator('#as-quit-btn').click();
  await page.locator('#as-quit-save').click();
  await page.locator('.as-week-card').first().waitFor();
  await page.locator('.as-week-card[data-week="1"]').click();
  await page.locator('#as-exam-btn').click();
  await page.locator('#as-exam-input').fill('The book I read is good.');
  await page.locator('#as-exam-next').click();
  await page.locator('#as-exam-input').fill('Not only he smart');
  await page.locator('#as-exam-next').click();
  await expect(page.locator('.as-result-score')).toHaveText('50%');
  await page.locator('#as-exam-done').click();
  await page.locator('#as-hist-btn').click();
  await page.locator('.as-hist-entry.clickable').first().click();
  await expect(page.locator('#as-hist-body')).toContainText('He is a doctor.');
  await expect.poll(() => log.length).toBe(8);
}

async function wpFlow(page, log) {
  const fb = page.locator('#feedback-card');
  await typeWbw(page, 'Iamastudent');
  await expect(fb).toContainText('Câu đúng ngữ pháp.');
  await page.keyboard.press('Enter');
  await page.locator('#vocab-hint-btn').click();
  await page.locator('#answer-box').fill('I like wrong books');
  await page.locator('#answer-box').press('Enter');
  await expect(fb).toContainText('Sai thì của động từ.');
  await page.locator('#wp-next-btn').click();
  for (const w of ['She', 'plays', 'tennis', 'daily']) await page.locator('#rearrange-bank .wp-word-chip', { hasText: w }).click();
  await page.locator('#submit-btn').click();
  await expect(fb).toContainText('Câu đúng');
  await page.locator('#wp-next-btn').click();
  await page.locator('#skip-btn').click(); // the blank comes back at the end
  await page.locator('#answer-box').fill('I really like music a lot.');
  await page.locator('#submit-btn').click();
  await expect(page.locator('#result-banner')).toHaveText('📖 Xem câu mẫu để so sánh');
  await page.locator('#wp-next-btn').click();
  await page.locator('#combine-answer-box').fill('It rained, so we stayed home.');
  await page.locator('#combine-answer-box').press('Enter');
  await expect(fb).toBeVisible();
  await page.locator('#wp-next-btn').click();
  await expect(page.locator('#type-tag')).toHaveText('✏️ Điền chỗ trống');
  await page.locator('#fill-input').fill('in');
  await page.locator('#fill-input').press('Enter');
  await expect(fb).toBeVisible();
  await page.locator('#wp-next-btn').click();
  await expect(page.locator('#done-summary')).toHaveText('Bạn đã hoàn thành 6 bài và kiếm được 80 XP!');
  // Thi thử: switching mode asks first
  await page.locator('#btn-mode-test').click();
  await page.locator('#wp-quit-leave-btn').click();
  await page.locator('#test-setup .wp-start-test-btn').click();
  await page.locator('#test-answer-box').fill('I like reading books.');
  await page.locator('#test-next-btn').click();
  for (const w of ['She', 'plays', 'tennis', 'daily']) await page.locator('#test-rearrange-bank .wp-word-chip', { hasText: w }).click();
  await page.locator('#test-next-btn').click();
  await page.locator('#test-fill-options .wp-option-btn', { hasText: 'in' }).click();
  await page.locator('#test-next-btn').click();
  await expect(page.locator('.wp-test-big-score')).toContainText('67%');
  // Back to practice, start over: three wrong letters fail the sentence without a check
  await page.locator('#test-results .wp-more-btn').click();
  await page.locator('#state-done .wp-restart-btn').click();
  for (const ch of 'xxx') { await page.locator('.wbw-input').press(ch); await page.waitForTimeout(320); }
  await expect(fb).toContainText('Bạn gõ sai từ “I” 3 lần');
  await page.locator('#state-exercise .wp-stop-btn').click();
  await expect(page.locator('#wp-quit-ring-pct')).toHaveText('0%');
  await page.locator('#wp-quit-leave-btn').click();
  await expect(page.locator('#done-summary')).toHaveText('Bạn đã hoàn thành 1 bài và kiếm được 5 XP!');
  await expect.poll(() => log.length).toBe(9);
}

async function t1Flow(page, log) {
  const fb = page.locator('#feedback-card');
  const next = page.locator('#next-btn-practice');
  await t1Start(page);
  await typeWbw(page, 'Thenumberofusersrose');
  await expect(fb).toContainText('Chính xác');
  await page.keyboard.press('Enter');
  await page.locator('#vocab-hint-btn').click();
  await page.locator('#answer-box').fill('There was a wrong increase');
  await page.locator('#answer-box').press('Enter');
  await expect(fb).toContainText('Dùng danh từ increase.');
  await next.click();
  for (const w of ['China', 'topped', 'the', 'list']) await page.locator('#rearrange-bank .wp-word-chip', { hasText: w }).click();
  await page.locator('#submit-btn').click();
  await expect(page.locator('#result-banner')).toHaveText('✅ Chính xác!');
  await next.click();
  await page.locator('#skip-btn').click(); // the blank comes back at the end
  await page.locator('#mc-options .t1-mc-option').nth(1).click();
  await page.locator('#submit-btn').click();
  await expect(fb).toBeVisible();
  await next.click();
  await page.locator('#answer-box').fill('The number of people increased.');
  await page.locator('#answer-box').press('Enter');
  await expect(fb).toBeVisible();
  await next.click();
  await expect(page.locator('#type-tag')).toHaveText('✏️ Điền chỗ trống');
  await page.locator('#fill-input').fill('from, to');
  await page.locator('#fill-input').press('Enter');
  await expect(fb).toBeVisible();
  await next.click();
  await expect(page.locator('#done-summary')).toHaveText('Hoàn thành 6 câu — tỉ lệ đúng 83%');
  // only the wrong one again
  await page.locator('#done-retry-wrong-btn').click();
  await expect(page.locator('#ex-counter')).toHaveText('1 / 1');
  await page.locator('#answer-box').fill('There was an increase of 10%');
  await page.locator('#submit-btn').click();
  await next.click();
  await expect(page.locator('#done-summary')).toHaveText('Hoàn thành 1 câu — tỉ lệ đúng 100%');
  // Thi thử: switching mode asks first
  await page.locator('#btn-mode-test').click();
  await page.locator('#quit-leave-btn').click();
  await page.locator('#test-setup .wp-start-test-btn').click();
  await page.locator('#test-answer-box').fill('There was an increase of 10%');
  await page.locator('#test-next-btn').click();
  for (const w of ['China', 'topped', 'the', 'list']) await page.locator('#test-rearrange-bank .wp-word-chip', { hasText: w }).click();
  await page.locator('#test-next-btn').click();
  await page.locator('#test-fill-input').fill('from, to');
  await page.locator('#test-fill-input').press('Enter');
  await page.locator('#test-mc-options .t1-mc-option').nth(1).click();
  await page.locator('#test-next-btn').click();
  await expect(page.locator('#test-score-header h2')).toHaveText('75%');
  // Back to practice, start over: three wrong letters fail the sentence without a check
  await page.locator('#test-results .wp-more-btn').click();
  await page.locator('#state-done .wp-restart-btn:not(#done-retry-wrong-btn)').click();
  for (const ch of 'xxx') { await page.locator('.wbw-input').press(ch); await page.waitForTimeout(320); }
  await expect(fb).toContainText('Bạn gõ sai từ “The” 3 lần');
  await page.locator('#state-exercise .wp-stop-btn').click();
  await expect(page.locator('#quit-title')).toHaveText('Dừng luyện tập?');
  await page.locator('#quit-leave-btn').click();
  await expect(page.locator('#done-summary')).toHaveText('Hoàn thành 1 câu — tỉ lệ đúng 0%');
  await expect.poll(() => log.length).toBe(11);
}

const FLOWS = { t1Welcome: t1Flow, wpDrill: wpFlow, advSentences: advFlow, grammar: grammarFlow, leaderboard: leaderboardFlow, shop: shopFlow, inbox: inboxFlow, profile: profileFlow, tuition: tuitionFlow, dictation: dictationFlow, shadowing: shadowingFlow };

for (const [name, flow] of Object.entries(FLOWS)) {
  test(`${name}: every action sends the same requests as the old page`, async ({ browser }) => {
    const run = async (url) => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await ctx.newPage();
      const { log, state, errors } = await open(page, url);
      await flow(page, log, state, url.startsWith('/app/'));
      await ctx.close();
      // (the picture itself is re-encoded by each browser run)
      return { log: log.map((l) => l.replace(/^(POST \/user\/avatar) .*/, '$1').replace(/"sessionId":"[^"]+"/, '"sessionId":"x"')), errors };
    };
    const old = await run((PAGES[name] || PAGES.advWeeks).legacy);
    const now = await run((PAGES[name] || PAGES.advWeeks).app);
    expect(now.errors).toEqual([]);
    expect(now.log).toEqual(old.log);
  });
}

test.describe('inside the React app', () => {
  test.beforeEach(({ page }) => page.setViewportSize({ width: 1280, height: 900 }));

  for (const [from, to] of [
    ['/vocab-leaderboard.html', '/app/leaderboard'], ['/shop.html', '/app/shop'],
    ['/inbox.html', '/app/inbox'], ['/inbox.html?msg=m7', '/app/inbox?msg=m7'],
    ['/profile.html', '/app/profile'], ['/profile.html#inventory', '/app/profile?tab=inventory'],
    ['/profile.html#plan', '/app/profile?focus=plan'],
    ['/tuition.html', '/app/tuition'], ['/goal.html', '/app/profile?tab=goal'],
    ['/essential-grammar.html?lesson=passive', '/app/essential-grammar?lesson=passive'], ['/essential-grammar/passive', '/app/essential-grammar?lesson=passive'],
    ['/review-history.html', '/app/review-history'], ['/review-history.html?view=mock', '/app/review-history?view=mock'],
    ['/dictation.html?sectionId=s1', '/app/dictation?sectionId=s1'], ['/dictation/s1', '/app/dictation?sectionId=s1'],
    ['/shadowing.html?lesson=l0&mode=watch', '/app/shadowing?lesson=l0&mode=watch'], ['/shadowing/l0', '/app/shadowing?lesson=l0'],
    ['/advanced-sentences.html?week=1&groupId=ag1', '/app/advanced-sentences?week=1&groupId=ag1'],
    ['/writing-practice.html', '/app/writing-practice?level=beginner&topic=all&type=all'],
    ['/writing-practice.html?topic=family', '/app/writing-practice?level=beginner&topic=family&type=all'],
    ['/task1-practice.html', '/app/task1-practice?skill=all&mode=practice'],
    ['/task1-practice.html?skill=comparison&set=set2', '/app/task1-practice?skill=comparison&set=set2&mode=practice'],
  ]) {
    test(`${from} forwards to ${to}`, async ({ page }) => {
      await open(page, from);
      await page.waitForURL(BASE + to);
    });
  }

  test('?msg= finds a message on a later page and marks it read', async ({ page }) => {
    const { log } = await open(page, '/app/inbox?msg=m55');
    await expect(page.locator('.detail-subject')).toHaveText('Tin nhắn số 55');
    await expect(page.locator('.msg-item[data-id="m55"]')).toHaveClass(/selected/);
    expect(log).toEqual(['PATCH /user/messages/m55/read ']);
  });

  test('moves between pages without a reload; each page stylesheet leaves with it', async ({ page }) => {
    await open(page, '/app/shop');
    await PAGES.shop.ready(page);
    await page.evaluate(() => { window.__sameDocument = true; });
    await expect(page.locator('.nav-dropdown > a[href="/app/leaderboard"]')).toHaveClass(/active/);
    await page.locator('.shop-wallet-side a').click();
    await PAGES.leaderboard.ready(page);
    await expect(page).toHaveTitle(/BXH Vocab/);
    await page.locator('a[href="/app/inbox"]').first().click();
    await page.locator('.msg-item').first().waitFor();
    await expect(page).toHaveTitle(/Hộp thư/);
    expect(await page.evaluate(() => [...document.querySelectorAll('link[href*="/css/"]')].some((l) => /css\/(shop|vocab-leaderboard|entrance-test)\.css/.test(l.href)))).toBe(false);
    await page.evaluate(() => { window.__go('/classroom'); });
    await page.waitForFunction(() => !document.querySelector('.inbox-layout'));
    expect(await page.evaluate(() => [...document.querySelectorAll('link[href*="/css/"]')].some((l) => /css\/(inbox|pf-pages)\.css/.test(l.href)))).toBe(false);
    expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
  });

  test('leaving the shop stops the duel board and closes its dialog', async ({ page }) => {
    await open(page, '/app/shop');
    await PAGES.shop.ready(page);
    await page.locator('[data-duel-new]').click();
    await expect(page.locator('.duel-modal')).toBeVisible();
    await page.evaluate(() => { window.__go('/classroom'); });
    await expect(page.locator('.duel-modal')).toHaveCount(0);
    let calls = 0;
    page.on('request', (r) => { if (r.url().endsWith('/shop/duels')) calls += 1; });
    await page.evaluate(() => window.Duel.reload());
    await page.waitForTimeout(200);
    expect(calls).toBe(0);
  });

  test('reading a message refreshes the nav badge at once', async ({ page }) => {
    await open(page, '/app/inbox');
    await expect(page.locator('#navInboxBadge')).toHaveText('3');
    await page.locator('.msg-item[data-id="m0"]').click();
    await expect(page.locator('#navInboxBadge')).toHaveText('2');
  });

  test('must-read popup: never on the inbox; its link opens the message in place', async ({ page }) => {
    const state = makeState();
    state.mustRead = 1;
    await open(page, '/app/inbox', state);
    await page.locator('.msg-item').first().waitFor();
    await page.waitForTimeout(600);
    await expect(page.locator('#nav-mustread-overlay')).toHaveCount(0);

    await page.evaluate(() => { window.__go('/classroom'); });
    await page.evaluate(() => window.refreshInboxBadge());
    await expect(page.locator('#nav-mustread-overlay')).toBeVisible();
    await page.evaluate(() => { window.__sameDocument = true; });
    await page.locator('#nav-mustread-overlay a').first().click();
    await expect(page.locator('#nav-mustread-overlay')).toHaveCount(0);
    await expect(page.locator('.detail-subject')).toHaveText('Tin nhắn số 55');
    expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
  });

  test('page guide and activity tracking know the route', async ({ page }) => {
    await open(page, '/app/shop');
    await PAGES.shop.ready(page);
    await page.locator('#globalHelpBtn').click();
    await page.waitForFunction(() => !!window.PageHelp);
    expect(await page.evaluate(() => window.PageHelp.pageKey())).toBe('shop.html');
    await page.evaluate(() => { window.PageHelp.close(); window.__go('/leaderboard'); });
    await page.waitForFunction(() => window.PageHelp.pageKey() === 'vocab-leaderboard.html');
  });

  test('on a phone an opened message comes into view, and Back returns to its row', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/app/inbox');
    await page.locator('.msg-item[data-id="m20"]').click();
    await expect(page.locator('.detail-subject')).toBeInViewport();
    await page.locator('.mobile-back-btn').click();
    await expect(page.locator('.msg-item[data-id="m20"]')).toBeInViewport();
  });

  test('the account dock belongs to the vocab home only', async ({ page }) => {
    const errors = (await open(page, '/app/shop')).errors;
    await PAGES.shop.ready(page);
    const dock = () => page.evaluate(() => ({
      shown: document.getElementById('navCornerDock').style.display !== 'none',
      cls: document.body.classList.contains('has-corner-dock'),
    }));
    expect(await dock()).toEqual({ shown: false, cls: false });
    await page.locator('.nav-dropdown > a[href="/app/dashboard"]').click();
    await page.locator('.dash-vocab-hero').waitFor();
    expect(await dock()).toEqual({ shown: true, cls: true });
    await page.locator('.dash-vocab-hero-lb').evaluate((a) => a.click()); // a popup may cover it
    await PAGES.leaderboard.ready(page);
    expect(await dock()).toEqual({ shown: false, cls: false });
    expect(errors).toEqual([]);
  });

  for (const [from, to] of [
    ['/app/#/shop', '/app/shop'], ['/app/#/inbox?msg=m7', '/app/inbox?msg=m7'], ['/app/#/profile?tab=edit', '/app/profile?tab=edit'], ['/app/', '/app/dashboard'],
  ]) {
    test(`the old address ${from} becomes ${to}`, async ({ page }) => {
      await open(page, from);
      await page.waitForURL(BASE + to);
    });
  }

  test('a deep link survives a reload, and Back returns to the page before', async ({ page }) => {
    await open(page, '/app/shop');
    await PAGES.shop.ready(page);
    await page.locator('.shop-wallet-side a').click();
    await PAGES.leaderboard.ready(page);
    await expect(page).toHaveURL(BASE + '/app/leaderboard');
    await page.reload();
    await PAGES.leaderboard.ready(page);
    await page.goBack();
    await PAGES.shop.ready(page);
    await expect(page).toHaveURL(BASE + '/app/shop');
    await expect(page.locator('.nav-dropdown > a[href="/app/leaderboard"]')).toHaveClass(/active/);
  });

  test('a pet gift that failed can be tried again', async ({ page }) => {
    const state = makeState();
    state.failGift = true;
    await open(page, '/app/shop', state);
    await PAGES.shop.ready(page);
    await page.locator('[data-pet-gift]').click();
    await toastSeen(page, 'Chưa mở được quà');
    await expect(page.locator('[data-pet-gift]')).toBeEnabled();
    state.failGift = false;
    await page.locator('[data-pet-gift]').click();
    await expect(page.locator('.shop-gift-done')).toBeVisible();
  });

  test('a message that arrives between pages does not show a row twice', async ({ page }) => {
    const state = makeState();
    const { errors } = await open(page, '/app/inbox', state);
    await page.locator('.msg-item').nth(49).waitFor();
    state.messages.unshift({ ...state.messages[5], _id: 'm999', subject: 'Tin mới' });
    await page.locator('#loadMoreBtn').click();
    await expect(page.locator('.msg-item')).toHaveCount(60);
    const ids = await page.locator('.msg-item').evaluateAll((els) => els.map((e) => e.dataset.id));
    expect(new Set(ids).size).toBe(60);
    // the count says 61, but the server has nothing further: no dead button
    await page.locator('#loadMoreBtn').click();
    await expect(page.locator('#loadMoreBtn')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('profile: tabs and sections open from the address, and the menu goes there in place', async ({ page }) => {
    await open(page, '/app/profile?tab=history');
    await page.locator('#profileName:has-text("An Trần")').waitFor();
    await expect(page.locator('.tab-btn.active')).toHaveAttribute('data-tab', 'history');
    await expect(page).toHaveTitle(/Hồ sơ/);
    await page.evaluate(() => { window.__sameDocument = true; window.__go('/profile?focus=plan'); });
    await expect(page.locator('#plan')).toHaveClass(/highlight-pulse/);
    await expect(page.locator('.tab-btn.active')).toHaveAttribute('data-tab', 'overview');
    await page.evaluate(() => { window.__go('/profile?focus=speakingHistoryCard'); });
    await expect(page.locator('.tab-btn.active')).toHaveAttribute('data-tab', 'history');
    await page.locator('.tab-btn[data-tab="edit"]').click();
    await expect(page).toHaveURL(/\/app\/profile\?tab=edit$/);
    await page.evaluate(() => { window.__go('/shop'); });
    await PAGES.shop.ready(page);
    expect(await page.evaluate(() => [...document.querySelectorAll('link[href*="/css/"]')].some((l) => /css\/(profile|pf-profile|inventory)\.css/.test(l.href)))).toBe(false);
    await page.locator('.shop-card-actions a[href*="profile"]').first().click();
    await expect(page.locator('.tab-btn.active')).toHaveAttribute('data-tab', 'inventory');
    expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
    expect(await page.evaluate(() => window.PageHelp ? window.PageHelp.pageKey() : 'profile.html')).toBe('profile.html');
  });

  test('profile: a new name reaches the BXH without a reload', async ({ page }) => {
    const state = makeState();
    await open(page, '/app/profile?tab=edit', state);
    await expect(page.locator('#editFirstName')).toHaveValue('An');
    await page.locator('#editFirstName').fill('Bình');
    await page.locator('#tab-edit .btn-primary').click();
    await expect(page.locator('#profileName')).toHaveText('Bình Trần');
    await page.evaluate(() => { window.__go('/leaderboard'); });
    await PAGES.leaderboard.ready(page);
    await expect(page.locator('#dan-lb-list .dan-lb-row.is-me .dan-lb-name')).toHaveText('Bình Trần (Bạn)');
  });

  test('profile: a failed part leaves the rest on screen', async ({ page }) => {
    const state = makeState();
    state.failStats = true;
    await open(page, '/app/profile', state);
    await page.locator('#profileName:has-text("An Trần")').waitFor();
    await toastSeen(page, 'Không thể tải số liệu thống kê');
    await expect(page.locator('#statReading')).toHaveText('-');
  });

  test('profile: staff have no Kho đồ', async ({ page }) => {
    await page.addInitScript(() => { window.__staff = true; });
    await page.addInitScript((u) => {
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) { return set.call(this, k, k === 'user' ? JSON.stringify(u) : v); };
    }, { ...USER, role: 'admin' });
    const state = makeState();
    state.profile.role = 'admin';
    await open(page, '/app/profile?tab=inventory', state);
    await page.locator('#profileRole:has-text("Quản trị viên")').waitFor();
    await expect(page.locator('.tab-btn[data-tab="inventory"]')).toHaveCount(0);
    await expect(page.locator('#inventory-body')).toContainText('chỉ dành cho học sinh và giáo viên');
  });

  test('a failed load offers a retry', async ({ page }) => {
    await open(page, '/app/shop', { ...makeState(), failShop: true });
    await expect(page.locator('#shop-items .shop-empty')).toContainText('Không tải được cửa hàng');
    await expect(page.locator('#shop-duels .shop-empty')).toBeVisible();
  });

  test('tuition: "Đã chuyển khoản" updates the card without a reload', async ({ page }) => {
    const { log } = await open(page, '/app/tuition');
    await PAGES.tuition.ready(page);
    await page.evaluate(() => { window.__sameDocument = true; });
    await expect(page.locator('.nav-links > a[href="/app/tuition"]')).toHaveClass(/nav-link-tuition.*active|active.*nav-link-tuition/);
    await expect(page.locator('.fee-note')).toHaveText('Giảm 10% <đợt 1>');
    await page.locator('#nbtn-f1').click();
    await expect(page.locator('#fcard-f1')).toHaveClass(/notified/);
    await expect(page.locator('.debt-sub')).toContainText('2 kỳ đang chờ xác nhận');
    await expect(page.locator('#nbtn-f1')).toHaveCount(0);
    await toastSeen(page, 'Đã báo admin');
    await page.waitForTimeout(1700); // the old page reloaded after 1.5s
    expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
    expect(log).toEqual(['POST /tuition/f1/notify ']);

    await expect(page.locator('#paidList')).toHaveCount(0);
    await page.locator('.paid-toggle').click();
    await expect(page.locator('#paidList .fee-card')).toHaveCount(1);
    await expect(page.locator('#paidToggleLabel')).toHaveText('Ẩn học phí đã đóng');
  });

  test('tuition: a failed load can be retried; no fees shows the empty state', async ({ page }) => {
    const state = makeState();
    state.failTuition = true;
    await open(page, '/app/tuition', state);
    await expect(page.locator('#debtBanner')).toContainText('Lỗi máy chủ');
    state.failTuition = false;
    state.fees = [];
    await page.locator('#debtBanner button').click();
    await expect(page.locator('#emptyState')).toBeVisible();
    await expect(page.locator('#debtBanner')).toContainText('Không có thông tin học phí nào');
  });

  test('tuition reminder: never on the tuition page; its link opens the page in place', async ({ page }) => {
    const state = makeState();
    state.tuitionSummary = { success: true, unpaidCount: 2, monthCount: 1, monthTotal: 1500000, dueCount: 1 };
    await open(page, '/app/tuition', state);
    await PAGES.tuition.ready(page);
    await page.waitForTimeout(600);
    await expect(page.locator('#nav-tuition-popup-overlay')).toHaveCount(0);

    await page.goto(`${BASE}/app/shop`);
    await expect(page.locator('#nav-tuition-popup-overlay')).toBeVisible();
    await page.evaluate(() => { window.__sameDocument = true; });
    await page.locator('#nav-tuition-popup-go').click();
    await expect(page.locator('#nav-tuition-popup-overlay')).toHaveCount(0);
    await page.locator('.fee-card').first().waitFor();
    await expect(page).toHaveURL(`${BASE}/app/tuition`);
    expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
  });

  test('review history: filters restart at page 1, the category list follows the page', async ({ page }) => {
    await open(page, '/app/review-history');
    await PAGES.reviewHistory.ready(page);
    await expect(page.locator('#rhPrevBtn')).toBeDisabled();
    await page.locator('#rhNextBtn').click();
    await expect(page.locator('#rhPageLabel')).toHaveText('Trang 2/3');
    await page.locator('#rhFilterType').selectOption('reading');
    await expect(page.locator('#rhPageLabel')).toHaveText('Trang 1/2');
    await expect(page.locator('#rhList .badge').first()).toHaveText('Reading (Full test)');

    await page.locator('#rhFilterCategory').selectOption('Ngữ pháp');
    const rows = page.locator('#rhList .rh-item');
    expect(await rows.count()).toBeLessThan(10);
    for (const row of await rows.all()) await expect(row).toContainText('Ngữ pháp');
  });

  test('review history: the tabs keep their place in the address', async ({ page }) => {
    await open(page, '/app/review-history');
    await PAGES.reviewHistory.ready(page);
    await page.locator('#rhTabMock').click();
    await expect(page).toHaveURL(`${BASE}/app/review-history?view=mock`);
    await page.locator('#mockList .rh-item').first().waitFor();
    await expect(page.locator('#rhList')).toBeHidden();
    await expect(page.locator('.rh-filters')).toBeHidden();
    await expect(page.locator('#rhPagination')).toHaveCount(0);
    await expect(page.locator('#mockList a', { hasText: 'Tiếp tục thi thử' }).first()).toHaveAttribute('href', '/mock-test.html');
    await page.locator('#rhTabMistakes').click();
    await expect(page).toHaveURL(`${BASE}/app/review-history`);
    await expect(page.locator('#rhList')).toBeVisible();
    await expect(page.locator('#mockList')).toBeHidden();
  });

  test('review history: a failed list says so', async ({ page }) => {
    await open(page, '/app/review-history', { ...makeState(), failReviews: true });
    await expect(page.locator('#rhList .rh-empty')).toHaveText('Lỗi tải lịch sử review.');
  });

  test('dictation: a wrong try is marked word by word, a right one shows the meaning, then moves on', async ({ page }) => {
    await open(page, '/app/dictation?sectionId=s1');
    await page.locator('.dict-num-btn').nth(2).waitFor();
    await page.fill('#dict-input', 'hello thera');
    await page.keyboard.press('Enter');
    // Hello there, my friend. → hello ✓, thera = misspelt there, my + friend missing
    await expect(page.locator('#dict-diff .dx-ok')).toHaveText(['Hello']);
    await expect(page.locator('#dict-diff .dx-bad.typo')).toHaveText('thera');
    // the right words of the mistakes stay hidden until it's typed right
    await expect(page.locator('#dict-diff .dx-fix')).toHaveCount(0);
    await expect(page.locator('#dict-diff .dx-miss')).toHaveText(['＿＿', '＿＿']);
    await expect(page.locator('#dict-vi')).toHaveCount(0);
    await expect(page.locator('#dict-score')).toContainText('Đúng 1/4 từ (25%)');
    await expect(page.locator('#dict-score')).toContainText('1 từ sai chữ');
    await expect(page.locator('#dict-score')).toContainText('2 từ thiếu');
    await expect(page.locator('#dict-status')).toContainText('chưa đạt 80%');
    await page.fill('#dict-input', 'hello there my friend');
    await page.keyboard.press('Enter');
    await expect(page.locator('#dict-status')).toContainText('Correct!');
    await expect(page.locator('#dict-vi')).toContainText('Xin chào bạn tôi.');
    await expect(page.locator('#dict-session-score')).toHaveText('1/3 ✓');
    await expect(page.locator('.dict-num-btn').first()).toHaveClass(/done/);
    await expect(page.locator('#dict-cur-num')).toHaveText('2', { timeout: 4000 });
    await expect(page.locator('#dict-input')).toHaveValue('');
  });

  test('dictation: 🚩 every sentence can be reported (panel + transcript), with a reason and a note', async ({ page }) => {
    const { log } = await open(page, '/app/dictation?sectionId=s1');
    await page.locator('.dict-num-btn').nth(2).waitFor();
    await page.fill('#dict-input', 'hello there my fiend');
    await page.click('#dict-report-btn');
    const dlg = page.locator('.modal-box[role=dialog]');
    await expect(dlg).toContainText('Báo lỗi câu 1');
    await expect(dlg.locator('.dx-report-reason')).toHaveCount(3);
    // a reason has to be picked; "Lỗi khác" needs a note
    await page.click('#dict-report-send');
    expect(log.filter((l) => l.includes('/dictation/report'))).toHaveLength(0);
    await dlg.locator('.dx-report-reason', { hasText: 'Lỗi khác' }).click();
    await page.click('#dict-report-send');
    expect(log.filter((l) => l.includes('/dictation/report'))).toHaveLength(0);
    await dlg.locator('.dx-report-reason', { hasText: 'Đáp án sai chữ' }).click();
    await page.fill('#dict-report-note', 'audio says "mate"');
    await page.click('#dict-report-send');
    await expect(dlg).toBeHidden();
    await expect(page.locator('#dict-report-btn')).toHaveClass(/sent/);
    await expect(page.locator('#dict-report-btn')).toContainText('Đã báo lỗi');
    const sent = log.find((l) => l.startsWith('POST /listening/dictation/report'));
    expect(JSON.parse(sent.slice(sent.indexOf('{')))).toEqual({ sectionId: 's1', sentenceIndex: 0, reason: 'wrong_text', note: 'audio says "mate"', typedText: 'hello there my fiend' });
    // the next sentence isn't marked; the transcript has a 🚩 per line
    await page.click('#dict-next-btn');
    await expect(page.locator('#dict-report-btn')).not.toHaveClass(/sent/);
    await page.click('.dx-tab[data-tab="transcript"]');
    await expect(page.locator('.dict-t-report')).toHaveCount(3);
    await page.locator('.dict-t-report').nth(2).click({ force: true });
    await expect(dlg).toContainText('Báo lỗi câu 3');
    await dlg.locator('.dx-report-reason', { hasText: 'Audio bị cắt' }).click();
    await page.click('#dict-report-send');
    await expect(dlg).toBeHidden();
    await expect(page.locator('.dict-t-report').nth(2)).toHaveClass(/sent/);
    expect(log.filter((l) => l.includes('/dictation/report')).at(-1)).toContain('"sentenceIndex":2,"reason":"cut_audio"');
  });

  test('dictation: no 🚩 button when the admin turned reports off', async ({ page }) => {
    await open(page, '/app/dictation?sectionId=s1', { ...makeState(), dictReport: { enabled: false, reasons: [] } });
    await page.locator('.dict-num-btn').nth(2).waitFor();
    await expect(page.locator('#dict-report-btn')).toHaveCount(0);
  });

  test('dictation: 80% of the words is enough — Enter then goes on, a fix can be re-checked', async ({ page }) => {
    const { log } = await open(page, '/app/dictation?sectionId=s1');
    await page.locator('.dict-num-btn').nth(2).waitFor();
    await page.fill('#dict-input', 'hello there my frend'); // 3/4 = 75%
    await page.keyboard.press('Enter');
    await expect(page.locator('#dict-status')).toContainText('Incorrect');
    await page.fill('#dict-input', 'hello there my friend extra');
    await page.keyboard.press('Enter');
    // every word right + one extra: 100% of the words, not perfect → passed, stays
    await expect(page.locator('#dict-status')).toContainText('câu đã xong');
    await expect(page.locator('#dict-diff .dx-extra')).toHaveText('extra');
    await expect(page.locator('.dict-num-btn').first()).toHaveClass(/done/);
    await expect(page.locator('#dict-cur-num')).toHaveText('1');
    await expect(page.locator('#dict-next-sentence-btn')).toBeVisible();
    await page.click('#dict-recheck-btn');
    await page.fill('#dict-input', 'hello there my friend');
    await expect(page.locator('#dict-diff')).toHaveClass(/stale/);
    await page.keyboard.press('Enter');
    await expect(page.locator('#dict-status')).toContainText('Correct!');
    await page.evaluate(() => window.__go('/classroom'));
    await expect.poll(() => log.length).toBe(1);
    expect(log[0]).toContain('"sentenceIndex":0,"isCorrect":true,"matchedWords":4,"totalWords":4');
  });

  test('dictation: no "Hiện đáp án" — the answer shows only once typed right; Hỏi Lulu gives the meaning, then words', async ({ page }) => {
    const { log } = await open(page, '/app/dictation?sectionId=s1');
    await page.locator('.dict-num-btn').nth(2).waitFor();
    await expect(page.locator('#dict-reveal-btn')).toHaveCount(0);
    await expect(page.locator('#opt-show-answer')).toHaveCount(0);
    await expect(page.locator('.dict-correct-en')).toHaveCount(0);
    // no meaning until asked
    await expect(page.locator('#dict-vi-hint')).toHaveCount(0);
    await expect(page.locator('#dict-lulu-btn')).toHaveText(/Hỏi Lulu \(3\)/);
    await page.click('#dict-lulu-btn');
    await expect(page.locator('#dict-lulu-hint')).toContainText('Nghĩa: Xin chào bạn tôi.');
    // then a word not typed right yet — the longest content word
    await page.fill('#dict-input', 'hello');
    await page.keyboard.press('Enter');
    await page.click('#dict-lulu-btn');
    await expect(page.locator('#dict-lulu-hint .dx-lulu-word')).toHaveText(['friend']);
    await page.click('#dict-lulu-btn');
    await expect(page.locator('#dict-lulu-hint .dx-lulu-word')).toHaveText(['friend', 'there']);
    await expect(page.locator('#dict-lulu-btn')).toBeDisabled();
    // the transcript doesn't give it away either
    await page.click('.dx-tab[data-tab="transcript"]');
    await expect(page.locator('#dict-transcript-list li').first()).toContainText('Chưa chép đúng');
    await expect(page.locator('#dict-transcript-list')).not.toContainText('Hello there');
    await expect(page.locator('#dict-full-text')).toContainText('Transcript hiện khi bạn chép đúng hết 3 câu');
    await page.click('.dx-tab[data-tab="dictation"]');
    await page.fill('#dict-input', 'Hello there, my friend.');
    await page.click('#dict-check-btn');
    await expect(page.locator('.dict-correct-en')).toHaveText('Hello there, my friend.');
    await expect(page.locator('#dict-vi')).toHaveText('Nghĩa: Xin chào bạn tôi.');
    await expect(page.locator('#dict-lulu-btn')).toHaveCount(0);
    await page.click('.dx-tab[data-tab="transcript"]');
    await expect(page.locator('#dict-transcript-list li').first()).toContainText('Hello there, my friend.');
    await expect(page.locator('.dict-t-vi').first()).toHaveText('Xin chào bạn tôi.');
    // hints don't take the sentence away: it's saved as right
    await page.evaluate(() => window.__go('/classroom'));
    await expect.poll(() => log.length).toBe(1);
    expect(log[0]).toContain('"sentenceIndex":0,"isCorrect":true');
  });

  test('dictation: a drill ignores digit grouping; pasting is refused', async ({ page }) => {
    await open(page, '/app/dictation?drill=numbers-1');
    await page.locator('.dict-num-btn').nth(1).waitFor();
    await expect(page.locator('#dict-media-src')).toHaveText('🎧 Cam 17 Part 1');
    await page.locator('#dict-input').evaluate((el) => el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true })));
    await toastSeen(page, 'Không thể dán văn bản');
    await page.fill('#dict-input', '0491577248');
    await page.keyboard.press('Enter');
    await expect(page.locator('.dict-reveal-answer')).toHaveText('0491 577 248');
    await expect(page.locator('#dict-check-btn')).toHaveCount(0);
    await expect(page.locator('#dict-next-sentence-btn')).toBeVisible();
  });

  test('dictation: on a drill Lulu shows the first letters, never more than half', async ({ page }) => {
    await open(page, '/app/dictation?drill=spelling-1');
    await page.locator('.dict-num-btn').nth(1).waitFor();
    await page.locator('.dict-num-btn').nth(1).click();
    await page.click('#dict-lulu-btn');
    await expect(page.locator('#dict-lulu-hint .dx-lulu-mask')).toHaveText('S _ _ _ _');
    await expect(page.locator('#dict-lulu-hint')).toContainText('5 chữ cái');
    await page.click('#dict-lulu-btn');
    await page.click('#dict-lulu-btn');
    await expect(page.locator('#dict-lulu-hint .dx-lulu-mask')).toHaveText('S m _ _ _');
    // a report never shows the answer of a sentence not typed right yet
    await page.click('#dict-report-btn');
    await expect(page.locator('.dx-report-hint')).toHaveCount(0);
  });

  test('dictation: a check shows the meaning, what kind of mistakes, and how the sentence links', async ({ page }) => {
    await open(page, '/app/dictation?sectionId=s1');
    await page.locator('.dict-num-btn').nth(2).waitFor();
    await page.click('#dict-gear-btn');
    await page.locator('#opt-autonext').uncheck();
    await page.click('#dict-gear-btn');
    await page.fill('#dict-input', 'hello dere my');
    await page.keyboard.press('Enter');
    await expect(page.locator('#dict-status')).toContainText('Incorrect');
    // not typed right yet: no meaning, no right words in the analysis
    await expect(page.locator('#dict-vi')).toHaveCount(0);
    await expect(page.locator('#dict-mistakes')).not.toContainText('there');
    await expect(page.locator('#dict-mistakes li[data-type="sound"]')).toContainText('dere');
    await expect(page.locator('#dict-mistakes li[data-type="sound"]')).toContainText('/θ/ /ð/');
    await expect(page.locator('#dict-mistakes li[data-type="missed"]')).toHaveCount(1);
    await expect(page.locator('#dict-linking')).toHaveCount(0);
    await expect(page.locator('.dx-tally')).toContainText('Nghe nhầm âm');
    // the second sentence links "It‿is‿a"
    await page.locator('.dict-num-btn').nth(1).click();
    await page.fill('#dict-input', 'it is a lovely day');
    await page.keyboard.press('Enter');
    // typed right: the meaning + how it links
    await expect(page.locator('#dict-vi')).toHaveText('Nghĩa: Hôm nay trời đẹp.');
    await expect(page.locator('#dict-linking .dx-link-notes')).toContainText('It‿is');
    await expect(page.locator('#dict-linking .dx-link-notes')).toContainText('i-tis');
  });

  test('dictation: a name must start with a capital; ALL CAPS is fine', async ({ page }) => {
    await open(page, '/app/dictation?drill=spelling-1');
    await page.locator('.dict-num-btn').nth(1).waitFor();
    await expect(page.locator('.dx-foot-caps')).toContainText('Caps Lock');
    await page.locator('.dict-num-btn').nth(1).click();
    await page.fill('#dict-input', 'smith');
    await page.keyboard.press('Enter');
    await expect(page.locator('#dict-status')).toContainText('viết hoa chữ cái đầu');
    await expect(page.locator('#dict-status')).toContainText('smith → Smith');
    await expect(page.locator('#dict-caps-tip')).toContainText('Caps Lock');
    await expect(page.locator('#dict-diff .dx-bad.case')).toHaveText('smith');
    await page.fill('#dict-input', 'SMITH');
    await page.keyboard.press('Enter');
    await expect(page.locator('#dict-status')).toContainText('Correct!');
  });

  test('dictation: the list shows what the student often mishears', async ({ page }) => {
    await open(page, '/app/dictation', { ...makeState(), dictHabits: { sentences: 12, types: [
      { type: 'ending_s', count: 5, examples: [{ typed: 'book', word: 'books' }] },
      { type: 'weak_form', count: 3, examples: [{ typed: '', word: 'of' }] },
    ] } });
    await expect(page.locator('#dict-habits')).toContainText('Bạn hay nghe sai');
    await expect(page.locator('#dict-habits .dx-habit')).toHaveCount(2);
    await expect(page.locator('#dict-habits .dx-habit').first()).toContainText('Âm cuối -s / -es ×5');
    await expect(page.locator('#dict-habits .dx-habit').first()).toContainText('book → books');
  });

  test('dictation: leaving stops the audio; a bad link returns to the list', async ({ page }) => {
    await open(page, '/app/dictation?sectionId=bad');
    await toastSeen(page, 'Không tải được bài này');
    await expect(page).toHaveURL(`${BASE}/app/dictation`);
    await page.locator('.dict-card').first().waitFor();

    await page.locator('.dict-card', { hasText: 'Cam 18 Test 1' }).click();
    await expect(page).toHaveURL(`${BASE}/app/dictation?sectionId=s1`);
    await page.locator('.dict-num-btn').nth(2).waitFor();
    await page.evaluate(() => { window.__audio = document.getElementById('dict-audio'); window.__audio.muted = true; return window.__audio.play().catch(() => {}); });
    await page.click('.dict-back-btn');
    await expect(page).toHaveURL(`${BASE}/app/dictation`);
    // (React runs the cleanup just after the screen changes)
    await expect.poll(() => page.evaluate(() => window.__audio.paused)).toBe(true);
    await expect(page.locator('#screen-practice')).toHaveCount(0);
  });

  test('dictation and shadowing: without Premium a lesson asks to upgrade', async ({ page }) => {
    const state = makeState();
    state.user = { ...USER, plan: 'free', createdAt: daysAgo(30) };
    await open(page, '/app/dictation?sectionId=s1', state);
    await expect(page.locator('#premium-promo-banner')).toBeVisible();
    await expect(page.locator('#screen-practice')).toHaveCount(0);
    await page.goto(`${BASE}/app/shadowing`);
    await page.locator('.sh-card').first().click();
    await expect(page.locator('#screen-practice')).toHaveCount(0);
    await expect(page).toHaveURL(`${BASE}/app/shadowing`);
  });

  test('shadowing: the picker starts the video; the address follows the mode', async ({ page }) => {
    await open(page, '/app/shadowing');
    await page.locator('.sh-card[data-slug="l0"]').click();
    await expect(page).toHaveURL(`${BASE}/app/shadowing?lesson=l0`);
    await expect(page.locator('#sh-chooser')).toBeVisible();
    await expect(page.locator('.sh-choice.last')).toBeFocused();
    await page.locator('.sh-choice[data-mode="watch"]').click();
    await expect(page.locator('#sh-chooser')).toBeHidden();
    await expect(page).toHaveURL(`${BASE}/app/shadowing?lesson=l0&mode=watch`);
    await expect(page.locator('#wt-play')).toContainText('Tạm dừng');
    expect(await page.evaluate(() => window.__yt[0].calls.slice(0, 2))).toEqual(['seek:10', 'play']);
    // The subtitle and the transcript follow the video
    await expect(page.locator('#sh-subtitle')).toContainText('Hello there');
    await expect(page.locator('#sh-cur')).toHaveText('2');
    await expect(page.locator('#sh-subtitle')).toContainText('It is a lovely day.');
    await expect(page.locator('#wt-done')).toContainText('Xem hết bài rồi', { timeout: 6000 });
    await page.locator('.sh-mode[data-mode="shadowing"]').click();
    await expect(page).toHaveURL(`${BASE}/app/shadowing?lesson=l0`);
  });

  test('shadowing: a mode in the first address does not skip the picker of the next lesson', async ({ page }) => {
    await open(page, '/app/shadowing?lesson=l0&mode=watch');
    await page.waitForFunction(() => window.__yt?.length === 1);
    await expect(page.locator('#sh-chooser')).toBeHidden();
    await page.click('.sh-back');
    await page.locator('.sh-card[data-slug="l1"]').click();
    await expect(page.locator('#sh-chooser')).toBeVisible();
  });

  test('shadowing: a sentence stops at its end; keys move and play', async ({ page }) => {
    await open(page, '/app/shadowing?lesson=l0&mode=shadowing');
    await page.locator('iframe#yt-player').waitFor({ state: 'attached' });
    await page.locator('#sh-play').waitFor();
    await page.waitForFunction(() => window.__yt?.length === 1);
    await page.keyboard.press('Space');
    await expect(page.locator('#sh-play')).toContainText('Dừng');
    await expect(page.locator('#sh-play')).toContainText('Nghe', { timeout: 3000 });
    expect(await page.evaluate(() => window.__yt[0].calls.at(-1))).toBe('pause');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#sh-cur')).toHaveText('2');
    await expect(page.locator('#sh-sentence')).toHaveText('It is a lovely day.');
    await page.locator('#opt-hide').check();
    await expect(page.locator('#sh-sentence')).toHaveText('I_ i_ a l_____ d__.');
    await expect(page.locator('.sh-item').first().locator('.sh-item-text')).toHaveText('•••');
    await page.locator('#sh-speed').click();
    await expect(page.locator('#sh-speed')).toHaveText('0.75x');
    expect(await page.evaluate(() => window.__yt[0].rate)).toBe(0.75);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ews_shadowing_prefs')))).toMatchObject({ hide: true, speedIdx: 1 });
  });

  test('shadowing: speaking the sentence is scored, and saved on leaving', async ({ page }) => {
    const state = makeState();
    state.fakeSpeech = true;
    const { log } = await open(page, '/app/shadowing?lesson=l0&mode=shadowing', state);
    await page.waitForFunction(() => window.__yt?.length === 1);
    await page.locator('#sh-rec').click();
    await expect(page.locator('#sh-rec')).toContainText('Dừng');
    await expect(page.locator('#sh-score')).toContainText('100%', { timeout: 4000 });
    await expect(page.locator('#sh-sentence .w-match')).toHaveCount(4);
    await expect(page.locator('.sh-item').first().locator('.sh-item-score')).toHaveText('100%');
    await expect(page.locator('#sh-progress')).toHaveText('1/3 câu');
    await page.click('.sh-back');
    await expect.poll(() => log.length).toBe(1);
    expect(log[0]).toContain('"mode":"shadowing"');
    expect(await page.evaluate(() => window.__yt[0].destroyed)).toBe(true);
    await page.locator('.sh-card').first().waitFor();
  });

  test('shadowing: dictation mode covers the video, Enter checks then moves on', async ({ page }) => {
    await open(page, '/app/shadowing?lesson=l0&mode=dictation');
    await page.waitForFunction(() => window.__yt?.length === 1);
    await expect(page.locator('#sh-chooser')).toBeHidden();
    await expect(page.locator('.sh-video-cover')).toBeVisible();
    await page.locator('.sh-video-cover button').click();
    await expect(page.locator('.sh-video-cover')).toBeHidden();
    await page.locator('#dc-hint-btn').click();
    await expect(page.locator('#dc-hint')).toHaveText('4 từ · H____ t____, m_ f_____.');
    await page.fill('#dc-input', 'hello friend extra');
    await page.keyboard.press('Enter');
    await expect(page.locator('#dc-score')).toContainText('Đúng 2/4 từ');
    await expect(page.locator('#dc-diff .w-extra')).toHaveText('extra');
    await expect(page.locator('#dc-vi')).toHaveText('');
    await page.keyboard.press('Enter');
    await expect(page.locator('#sh-cur')).toHaveText('2');
    await expect(page.locator('#dc-input')).toHaveValue('');
    await expect(page.locator('#dc-hint')).toBeHidden();
    await expect(page.locator('#dc-play')).toContainText('Dừng');
  });

  test('shadowing: filters, pages and the progress on the cards', async ({ page }) => {
    await open(page, '/app/shadowing');
    await PAGES.shadowing.ready(page);
    await expect(page.locator('.sh-card')).toHaveCount(24);
    await expect(page.locator('.sh-card[data-slug="l0"] .sh-pill.good')).toContainText('90%');
    await page.locator('.pg-btn:text-is("2")').click();
    await expect(page.locator('.sh-card')).toHaveCount(6);
    await page.locator('#sh-filters .sh-chip[data-cat="fun-shorts"]').click();
    await expect(page.locator('.sh-card')).toHaveCount(10);
    await expect(page.locator('#sh-filters .sh-chip[data-cat="comedy"]')).toBeHidden();
    await page.locator('#sh-levels .sh-chip[data-level="C1"]').click();
    await expect(page.locator('.sh-card')).toHaveCount(5);
    await page.locator('#sh-tips summary').click();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('ews_shadowing_prefs'))?.tipsClosed)).toBe(true);
  });

  test('the spelling videos listed on Dictation open in Shadowing, in place', async ({ page }) => {
    await open(page, '/app/dictation');
    await page.locator('.dict-chip[data-part="spell"]').click();
    await page.evaluate(() => { window.__sameDocument = true; });
    await page.locator('.dict-card').first().click();
    await expect(page).toHaveURL(`${BASE}/app/shadowing?lesson=l2&mode=dictation`);
    await expect(page.locator('#dc-input')).toHaveAttribute('placeholder', /Nhập những gì/);
    await expect(page.locator('#sh-chooser')).toBeHidden();
    expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
    await expect(page.locator('.nav-dd-menu a[href="/app/shadowing"]').first()).toHaveClass(/active/);
    await expect(page.locator('.nav-dropdown > a[href="/speaking.html"]')).toHaveClass(/active/);
    await expect(page.locator('.nav-dropdown > a[href="/listening.html"]')).not.toHaveClass(/active/);
  });

  test('goal tab: nothing loads until it opens; saving sends what the old page sent', async ({ browser, page }) => {
    const state = makeState();
    const { log } = await open(page, '/app/profile', state);
    await PAGES.profile.ready(page);
    expect(state.aiCalls || 0).toBe(0);
    await page.locator('.tab-btn[data-tab="goal"]').click();
    await expect(page).toHaveURL(`${BASE}/app/profile?tab=goal`);
    await expect(page.locator('#f-target')).toHaveValue('8');
    await expect(page.locator('#f-target option:checked')).toContainText('8.0');
    await expect(page.locator('#ai-plan-content p')).toHaveCount(2);
    await expect(page.locator('.today-start-btn')).toHaveAttribute('href', 'reading.html');
    await expect(page.locator('#plan-content .goal-hint.warn')).toContainText('30/60');
    await expect(page.locator('#summary-stats .goal-stat')).toHaveCount(6);
    await expect(page.locator('#schedule-hint')).toContainText('2 ngày × 60 phút = 120 phút/tuần');
    if (SHOTS) {
      await page.screenshot({ path: path.join(SHOTS, 'goal-tab.png'), fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: path.join(SHOTS, 'goal-tab-phone.png'), fullPage: true });
      await page.setViewportSize({ width: 1280, height: 900 });
    }

    await page.locator('.goal-day-chip[data-day="fri"]').click();
    await page.locator('.goal-day-chip[data-day="mon"]').click();
    await page.selectOption('#f-target', '7');
    await page.fill('#f-weekly', '90');
    await page.click('#goal-save-btn');
    await expect(page.locator('#goal-msg')).toHaveText('Đã lưu!');
    await expect(page.locator('#targetBandDisplay')).toHaveText('7');
    await expect.poll(() => state.aiCalls).toBe(2);
    expect(log).toHaveLength(1);

    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const old = await ctx.newPage();
    const { log: oldLog } = await open(old, '/goal.html?legacy=1');
    await expect(old.locator('#f-target')).toHaveValue('8');
    await old.locator('.goal-day-chip[data-day="fri"]').click();
    await old.locator('.goal-day-chip[data-day="mon"]').click();
    await old.selectOption('#f-target', '7');
    await old.fill('#f-weekly', '90');
    await old.click('#goal-save-btn');
    await expect(old.locator('#goal-msg')).toHaveText('Đã lưu!');
    expect(log).toEqual(oldLog);
    await ctx.close();
  });

  test('goal tab: a draft survives other tabs; a saved change elsewhere shows up', async ({ page }) => {
    const state = makeState();
    await open(page, '/app/profile?tab=goal', state);
    await expect(page.locator('#f-target')).toHaveValue('8');
    await page.fill('#f-session', '45');
    await page.locator('.tab-btn[data-tab="edit"]').click();
    await page.locator('.tab-btn[data-tab="goal"]').click();
    await expect(page.locator('#f-session')).toHaveValue('45');
    await page.click('#goal-save-btn');
    await expect(page.locator('#goal-msg')).toHaveText('Đã lưu!');
    state.goal.targetBand = 6.5;
    await page.locator('.tab-btn[data-tab="edit"]').click();
    await page.locator('.tab-btn[data-tab="goal"]').click();
    await expect(page.locator('#f-target')).toHaveValue('6.5');
  });

  test('goal tab: a target is required; without Premium it asks to upgrade', async ({ page }) => {
    const state = makeState();
    state.goal = { hasGoal: false };
    await open(page, '/app/profile?tab=goal', state);
    await expect(page.locator('#ai-plan-card')).toHaveCount(0);
    await page.waitForFunction(() => document.querySelector('#today-content .today-start-btn'));
    await page.click('#goal-save-btn');
    await expect(page.locator('#goal-msg')).toContainText('Hãy chọn band mục tiêu');

    const free = makeState();
    free.user = { ...USER, plan: 'free', createdAt: daysAgo(30) };
    await page.context().clearCookies();
    const other = await page.context().newPage();
    await open(other, '/app/profile?tab=goal', free);
    await expect(other.locator('#tab-goal')).toContainText('Nâng cấp Premium');
    expect(free.goalCalls || 0).toBe(0);
  });

  test('grammar: finishing a lesson scores it, saves it and offers a retry', async ({ page }) => {
    const { log } = await open(page, '/app/essential-grammar?lesson=present-simple');
    await grammarReady(page);
    await expect(page.locator('#header-eg-progress')).toHaveText(/1\/3/);
    await page.locator('.eg-ex-item[data-ref] .eg-quiz-option').nth(1).click();
    await expect(page.locator('.eg-ex-item[data-ref] .eg-quiz-explanation')).toHaveClass(/vis/);
    await expect(page.locator('.eg-quiz-progress')).toHaveText('Đã trả lời: 1/3 câu (toàn bài)');
    await expect(page.locator('#eg-grade-now-label')).toContainText('2 câu bỏ trống');
    await page.locator('.eg-quiz-q').nth(0).locator('.eg-quiz-option').nth(0).click();
    await page.locator('.eg-quiz-q').nth(1).locator('.eg-quiz-option').nth(1).click();
    await expect(page.locator('#eg-quiz-result')).toContainText('100%');
    await expect(page.locator('#eg-hero-status')).toContainText('Đã hoàn thành');
    await expect(page.locator('#header-eg-progress')).toHaveText(/2\/3/);
    await expect(page.locator('.eg-hist-row')).toHaveCount(2);
    expect(log).toHaveLength(1);
    expect(JSON.parse(log[0].slice(log[0].indexOf('{'))).answers).toEqual([{ ref: 'ex:13:0', chosen: 1 }, { ref: 'q:14:0', chosen: 0 }, { ref: 'q:14:1', chosen: 1 }]);
    await page.locator('.eg-retry-btn').click();
    await expect(page.locator('.eg-quiz-progress')).toHaveText('Đã trả lời: 0/3 câu (toàn bài)');
    await expect(page.locator('.eg-quiz-option:disabled')).toHaveCount(0);
  });

  test('grammar: grading early locks the blanks; a lesson without a quiz can retry too', async ({ page }) => {
    await open(page, '/app/essential-grammar?lesson=present-simple');
    await grammarReady(page);
    await page.locator('.eg-quiz-q').nth(0).locator('.eg-quiz-option').nth(0).click();
    await page.click('#eg-grade-now-btn');
    await expect(page.locator('#eg-quiz-result')).toContainText('33%');
    await expect(page.locator('.eg-quiz-option:not(:disabled)')).toHaveCount(0);
    await page.locator('.eg-nav-btn').click();
    await expect(page).toHaveURL(`${BASE}/app/essential-grammar?lesson=past-simple`);
    await page.goBack();
    await expect(page).toHaveURL(`${BASE}/app/essential-grammar?lesson=present-simple`);
    await expect(page.locator('.eg-quiz-option:disabled')).toHaveCount(0);
    await page.locator('#eg-sidebar .eg-lesson-item', { hasText: 'Câu bị động' }).click();
    await page.locator('.eg-quiz-option').first().click();
    await toastSeen(page, 'Bạn đạt 100%');
    await page.locator('#eg-grade-now-btn', { hasText: 'Làm lại bài' }).click();
    await expect(page.locator('.eg-quiz-option:disabled')).toHaveCount(0);
  });

  test('grammar: the drills check answers, Enter moves on, retry shuffles the verbs clear', async ({ page }) => {
    await open(page, '/app/essential-grammar?lesson=present-simple');
    await grammarReady(page);
    const inputs = page.locator('.eg-vf-row .eg-drill-input');
    await inputs.nth(0).fill('went');
    await inputs.nth(0).press('Enter');
    await expect(inputs.nth(1)).toBeFocused();
    await inputs.nth(1).fill('worked');
    await inputs.nth(1).press('Enter');
    await expect(page.locator('.eg-drill-score').first()).toHaveText('Đúng 2/2 🎉');
    await page.locator('.eg-drill-btn-ghost', { hasText: 'xáo trộn' }).click();
    await expect(page.locator('.eg-vf-row.eg-drill-ok')).toHaveCount(0);
    await expect(inputs.nth(0)).toHaveValue('');
    await expect(inputs.nth(0)).toBeFocused();
    // "don't" and "do not" are the same answer
    await page.locator('.eg-tr-input').fill('I do not know');
    await page.locator('.eg-tr-input').press('Control+Enter');
    await expect(page.locator('.eg-tr-head-ok')).toBeVisible();
    await page.locator('.eg-video-poster').click();
    await expect(page.locator('.eg-video-frame iframe')).toHaveAttribute('src', /youtube-nocookie.com\/embed\/abcdefghijk/);
  });

  test('grammar: address, last lesson, missing lessons, homework and search', async ({ page }) => {
    const state = makeState();
    state.assignments = [{ title: 'BTVN 1', resources: [{ resourceType: 'grammar', resourceId: 'g2', completed: false }] }];
    await open(page, '/app/essential-grammar?lesson=khong-co', state);
    await toastSeen(page, 'không còn tồn tại');
    await expect(page).toHaveURL(`${BASE}/app/essential-grammar?lesson=present-simple`);
    await page.locator('.eg-search-input').first().fill('bi dong');
    await expect(page.locator('#eg-sidebar .eg-lesson-item')).toHaveCount(1);
    await page.locator('.eg-search-input').first().fill('');
    await page.locator('#eg-sidebar .eg-cat-header').first().click();
    await expect(page.locator('#eg-sidebar .eg-cat-group').first()).toHaveClass(/collapsed/);
    await page.locator('#eg-sidebar .eg-cat-header').first().click();
    await page.locator('#eg-sidebar .eg-lesson-item', { hasText: 'Quá khứ đơn' }).click();
    await expect(page.locator('#eg-hw-banner')).toContainText('BTVN 1');
    await page.evaluate(() => window.__go('/shop'));
    await page.evaluate(() => window.__go('/essential-grammar'));
    await expect(page).toHaveURL(`${BASE}/app/essential-grammar?lesson=past-simple`);
    await expect(page.locator('.eg-hero-title')).toContainText('Quá khứ đơn');
    await expect(page.locator('.nav-dropdown > a[href="/writing.html"]')).toHaveClass(/active/);
  });

  test('grammar: failures say so and the lesson can be opened again', async ({ page }) => {
    const state = makeState();
    state.failBlocks = 'g2';
    state.failAttempt = true;
    await open(page, '/app/essential-grammar?lesson=past-simple', state);
    await expect(page.locator('#eg-main-content')).toContainText('Không tải được bài học này');
    state.failBlocks = '';
    await page.locator('#eg-sidebar .eg-lesson-item', { hasText: 'Câu bị động' }).click();
    await page.locator('.eg-quiz-option').first().click();
    await toastSeen(page, 'Chưa lưu được kết quả');
    await page.locator('#eg-sidebar .eg-lesson-item', { hasText: 'Quá khứ đơn' }).click();
    await expect(page.locator('.eg-overview-text')).toHaveText('Quá khứ.');
  });

  test('grammar: the first-visit tour runs, but not from a homework link', async ({ page }) => {
    await page.addInitScript(() => { window.__keepGrammarTour = true; });
    await open(page, '/app/essential-grammar?lesson=passive');
    await page.locator('.eg-hero-title').waitFor();
    await page.waitForTimeout(1200);
    await expect(page.locator('#ews-tour-tip')).toHaveCount(0);
    await page.goto(`${BASE}/app/essential-grammar`);
    await expect(page.locator('#ews-tour-tip')).toContainText('Danh sách bài học', { timeout: 4000 });
  });

  test('the pet stays off Dictation but comes back on the next page', async ({ page }) => {
    const state = makeState();
    state.activePet = 'meo';
    await open(page, '/app/dictation', state);
    await page.locator('.dict-card').first().waitFor();
    const shown = () => page.evaluate(() => document.getElementById('ews-pet-layer')?.style.display);
    await expect.poll(shown).toBe('none');
    await page.evaluate(() => window.__go('/shadowing'));
    await page.locator('.sh-card').first().waitFor();
    await expect.poll(shown).toBe('');
  });

  test('advanced sentences: a draft asks first, then resumes where it stopped or starts over', async ({ page }) => {
    const { log } = await open(page, '/app/advanced-sentences?week=1');
    await page.locator('.as-group-card[data-id="ag2"]').click();
    await expect(page.locator('#as-resume-overlay')).toContainText('Đã làm 1/2 câu');
    await page.locator('#as-resume-yes').click();
    await expect(page.locator('.as-counter')).toHaveText('2 / 2 câu');
    await expect(page.locator('.as-dot').first()).toHaveClass(/ok/);
    await page.goBack();
    await page.locator('.as-group-card[data-id="ag2"]').click();
    await page.locator('#as-resume-no').click();
    await expect(page.locator('.as-counter')).toHaveText('1 / 2 câu');
    expect(log).toEqual(['DELETE /adv-sentence/draft/ag2 ']);
  });

  test('advanced sentences: finishing a group scores it and ticks it; hints follow the mode', async ({ page }) => {
    const state = makeState();
    state.advDrafts = [];
    const { log } = await open(page, '/app/advanced-sentences?week=1', state);
    await page.locator('.as-toggle[data-hints="0"]').click();
    await page.locator('.as-group-card[data-id="ag1"]').click();
    await page.locator('.wbwd-input').waitFor();
    await expect(page.locator('#as-hint-btn')).toHaveCount(0);
    await expect(page.locator('.as-struct-reminder')).toHaveCount(0);
    await typeDrill(page, 'Thebookisgood');
    await page.locator('#as-next-btn').click();
    await typeDrill(page, 'Heisadoctor');
    await page.locator('#as-next-btn').click();
    await page.locator('#as-fallback').fill('Free answer');
    await page.locator('#as-submit-btn').click();
    await expect(page.locator('#as-next-btn')).toHaveText(/Xem kết quả/);
    await page.locator('#as-next-btn').click();
    await expect(page.locator('.as-result-score')).toHaveText('100%');
    expect(log.filter((l) => l.startsWith('POST /adv-sentence/save-attempt'))).toHaveLength(1);
    await page.locator('#as-done').click();
    await page.locator('.as-week-card[data-week="1"]').click();
    await expect(page.locator('.as-group-card[data-id="ag1"] .as-group-done')).toBeVisible();
    await expect(page.locator('.as-toggle[data-hints="0"]')).toHaveClass(/active/);
  });

  test('advanced sentences: a failed check can be retried; a reload drops out of the exam', async ({ page }) => {
    let failOnce = true;
    await open(page, '/app/advanced-sentences?week=1&groupId=ag1');
    await page.route('https://englishwithdan.onrender.com/api/adv-sentence/check', (r) => {
      if (failOnce && r.request().method() === 'POST') { failOnce = false; return r.abort(); }
      return r.fallback();
    });
    await typeDrill(page, 'Thebookisgood');
    await toastSeen(page, 'Không chấm được');
    await page.locator('#as-submit-btn', { hasText: 'Thử lại' }).click();
    await expect(page.locator('#as-fb')).toContainText('Chính xác');
    await page.locator('#as-quit-btn').click();
    await page.locator('#as-quit-leave').click();
    await page.locator('.as-week-card[data-week="1"]').click();
    await page.locator('#as-exam-btn').click();
    await expect(page).toHaveURL(`${BASE}/app/advanced-sentences?week=1&mode=exam`);
    await expect(page.locator('#as-exam-timer')).toHaveText(/^0[23]:\d\d$/);
    await page.reload();
    await expect(page).toHaveURL(`${BASE}/app/advanced-sentences?week=1`);
    await page.locator('.as-group-card').first().waitFor();
  });

  test('advanced sentences: history lists sessions and opens one; the guide knows the page', async ({ page }) => {
    await open(page, '/app/advanced-sentences');
    await page.locator('#as-hist-btn').click();
    await expect(page.locator('.as-hist-stat .n')).toHaveText(['3', '3/9', '39%']);
    await expect(page.locator('.as-hist-entry.clickable')).toHaveCount(2);
    await page.locator('.as-hist-entry.clickable').nth(1).click();
    await expect(page.locator('#as-hist-body')).toContainText('Lượt này được lưu trước khi');
    await page.locator('#as-hist-back').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#as-hist-overlay')).toHaveCount(0);
    expect(await page.evaluate(() => document.title)).toBe('Viết câu nâng cao – EnglishWithDan');
    await page.locator('#globalHelpBtn').click();
    await page.waitForFunction(() => !!window.PageHelp);
    expect(await page.evaluate(() => window.PageHelp.pageKey())).toBe('advanced-sentences.html');
  });
  test('writing practice: Back between filter sets reloads that set; the address keeps the filters', async ({ page }) => {
    const { log } = await open(page, '/app/writing-practice');
    await expect(page).toHaveURL(`${BASE}/app/writing-practice?level=beginner&topic=all&type=all`);
    await page.locator('#practice-filters .wp-type-btn[data-type="combine"]').click();
    await expect(page).toHaveURL(`${BASE}/app/writing-practice?level=beginner&topic=all&type=combine`);
    await page.locator('#combine-answer-box').fill('It rained, so we stayed home.');
    await page.locator('#submit-btn').click();
    await page.locator('#feedback-card').waitFor();
    await page.locator('#practice-filters .wp-type-btn[data-type="fill_blank"]').click();
    await expect(page.locator('#wp-quit-title')).toHaveText('Đổi dạng bài?');
    await page.locator('#wp-quit-leave-btn').click();
    await expect(page.locator('#type-tag')).toHaveText('✏️ Điền chỗ trống');
    await expect.poll(() => log.filter((l) => l.startsWith('POST /writing-practice/save-batch')).length).toBe(1);
    await page.goBack();
    await expect(page.locator('#type-tag')).toHaveText('🔗 Nối câu');
    await expect(page.locator('#practice-filters .wp-type-btn.active')).toHaveAttribute('data-type', 'combine');
  });

  test('writing practice: a free student is asked to upgrade, from a link too', async ({ page }) => {
    const state = makeState();
    state.user = { ...USER, plan: 'free', createdAt: '2020-01-01T00:00:00.000Z' };
    await open(page, '/app/writing-practice?topic=myself', state);
    await expect(page.locator('#um-overlay')).toBeVisible();
    await expect(page.locator('#state-welcome')).toBeVisible();
  });

  test('writing practice: a test survives leaving the page and resumes where it was', async ({ page }) => {
    await open(page, '/app/writing-practice');
    await page.locator('#btn-mode-test').click();
    await page.locator('#test-setup .wp-start-test-btn').click();
    await page.locator('#test-answer-box').fill('I like reading books.');
    await page.locator('#test-next-btn').click();
    await page.locator('#test-rearrange-bank .wp-word-chip').first().waitFor();
    await page.evaluate(() => window.__go('/shop'));
    await page.locator('.shop-shell').waitFor();
    await page.evaluate(() => window.__go('/writing-practice'));
    await page.locator('#btn-mode-test').click();
    await expect(page.locator('#test-resume-banner')).toContainText('câu 2/3');
    await page.locator('#test-resume-banner button', { hasText: 'Tiếp tục thi' }).click();
    await expect(page.locator('#test-counter')).toHaveText('2 / 3');
  });

  test('writing practice: the rewrite reminder shows on the page only; the guide and menu know it', async ({ page }) => {
    const state = makeState();
    state.pendingRewrites = 1;
    await open(page, '/app/writing-practice', state);
    await expect(page.locator('#writing-rewrite-banner')).toContainText('1');
    expect(await page.evaluate(() => document.title)).toBe('Luyện viết câu giao tiếp – EnglishWithDan');
    await expect(page.locator('.nav-dd-menu a[href="/app/writing-practice"]').first()).toHaveClass(/active/);
    await page.evaluate(() => window.__go('/shop'));
    await page.locator('.shop-shell').waitFor();
    await expect(page.locator('#writing-rewrite-banner')).toHaveCount(0);
    await page.evaluate(() => window.__go('/writing-practice'));
    await page.locator('#writing-rewrite-banner').waitFor();
    await page.locator('#globalHelpBtn').click();
    await page.waitForFunction(() => !!window.PageHelp);
    expect(await page.evaluate(() => window.PageHelp.pageKey())).toBe('writing-practice.html');
  });
  test('task 1 grammar: the address keeps skill, set and mode; Back goes to the set before', async ({ page }) => {
    const { log } = await open(page, '/app/task1-practice?skill=comparison');
    await expect(page).toHaveURL(`${BASE}/app/task1-practice?skill=comparison&mode=practice`);
    await expect(page.locator('#state-welcome')).toBeVisible(); // a link only selects the skill
    await expect(page.locator('#practice-filters .t1-skill-tab.active')).toHaveAttribute('data-skill', 'comparison');
    await page.locator('#practice-filters .t1-set-tab[data-set="set2"]').click();
    await expect(page).toHaveURL(`${BASE}/app/task1-practice?skill=comparison&set=set2&mode=practice`);
    await expect(page.locator('#state-empty')).toBeVisible(); // Bộ 2 has no So sánh
    await expect(page.locator('#practice-filters .t1-skill-tab[data-skill="trend_language"] .wp-lc-badge')).toHaveText('1');
    await page.locator('#practice-filters .t1-skill-tab[data-skill="trend_language"]').click();
    await page.locator('#fill-input').fill('from, to');
    await page.locator('#fill-input').press('Enter');
    await page.locator('#feedback-card').waitFor();
    await page.locator('#practice-filters .t1-set-tab[data-set=""]').click();
    await expect(page.locator('#quit-title')).toHaveText('Đổi bộ bài?');
    await page.locator('#quit-leave-btn').click();
    await expect(page).toHaveURL(`${BASE}/app/task1-practice?skill=trend_language&mode=practice`);
    await expect.poll(() => log.filter((l) => l.startsWith('POST /task1/save-batch')).length).toBe(1);
    await page.goBack();
    await expect(page).toHaveURL(`${BASE}/app/task1-practice?skill=trend_language&set=set2&mode=practice`);
    await expect(page.locator('#practice-filters .t1-set-tab.active')).toHaveAttribute('data-set', 'set2');
    await expect(page.locator('#ex-counter')).toHaveText('1 / 1');
    await page.locator('#btn-mode-test').click();
    await expect(page).toHaveURL(`${BASE}/app/task1-practice?skill=trend_language&set=set2&mode=test`);
    await page.reload();
    await expect(page.locator('#test-intro')).toBeVisible();
  });

  test('task 1 grammar: a free student is asked to upgrade', async ({ page }) => {
    const state = makeState();
    state.user = { ...USER, plan: 'free', createdAt: '2020-01-01T00:00:00.000Z' };
    const { log } = await open(page, '/app/task1-practice?skill=overview', state);
    await page.locator('.wp-welcome-start').click();
    await expect(page.locator('#um-overlay')).toBeVisible();
    await expect(page.locator('#state-welcome')).toBeVisible();
    expect(log).toEqual([]);
  });

  test('task 1 grammar: a multiple-choice answer shows the options with the right one marked', async ({ page }) => {
    await open(page, '/app/task1-practice?skill=overview');
    await t1Start(page);
    await page.locator('#mc-options .t1-mc-option').nth(2).click();
    await page.locator('#submit-btn').click();
    const opts = page.locator('#mc-feedback-options .t1-mc-option');
    await expect(opts.nth(2)).toHaveClass(/wrong/);
    await expect(opts.nth(1)).toHaveClass(/correct/);
    await expect(page.locator('#grammar-explanation-text')).toHaveText('Overview');
  });

  test('task 1 grammar: leaving Thi thử stops its clock; the guide, menu and tour know the page', async ({ page }) => {
    await page.addInitScript(() => { window.__keepT1Tour = true; });
    await open(page, '/app/task1-practice');
    await expect(page.locator('#ews-tour-tip')).toContainText('Luyện tập hay Thi thử', { timeout: 4000 });
    await page.evaluate(() => document.querySelectorAll('#ews-tour-tip, #ews-tour-hole').forEach((e) => e.remove()));
    expect(await page.evaluate(() => document.title)).toBe('Task 1 Grammar – EnglishWithDan');
    await expect(page.locator('.nav-dd-menu a[href="/app/task1-practice"]').first()).toHaveClass(/active/);
    await page.locator('#btn-mode-test').click();
    await page.locator('#test-setup .wp-start-test-btn').click();
    await page.locator('#test-answer-box').waitFor();
    await page.locator('#btn-mode-practice').click(); // nothing answered yet: no question asked
    await expect(page.locator('#state-welcome')).toBeVisible();
    await page.waitForTimeout(1200);
    await page.locator('#btn-mode-test').click();
    await expect(page.locator('#test-intro')).toBeVisible();
    await page.locator('#globalHelpBtn').click();
    await page.waitForFunction(() => !!window.PageHelp);
    expect(await page.evaluate(() => window.PageHelp.pageKey())).toBe('task1-practice.html');
  });
});

