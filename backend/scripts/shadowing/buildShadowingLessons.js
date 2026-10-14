/**
 * Builds backend/scripts/data/shadowingLessons.json — the segment data for
 * the Shadowing / Dictation player (frontend/shadowing.html) — from YouTube
 * caption files. The videos themselves are never downloaded: the player
 * embeds them with the YouTube IFrame API and seeks to each segment's
 * start/end, so all this script needs is timed text.
 *
 * Step 1 — fetch captions (needs `py -m pip install yt-dlp`), into any
 * scratch folder, one run per video id listed in LESSONS below:
 *
 *   py -m yt_dlp --skip-download --write-subs --write-auto-subs \
 *     --sub-langs "en-GB,en,en-orig" --sub-format json3 \
 *     -o "%(id)s.%(ext)s" "https://www.youtube.com/watch?v=<id>"
 *
 *   Manual (human-written) captions give the TEXT; YouTube's auto captions
 *   (`*.en-orig.json3`) carry per-word timings and are used — when present —
 *   only for WHERE each word starts/ends. Without them, timings are
 *   interpolated inside each manual caption line by character length, which
 *   is fine for channels whose captions already break at sentence ends
 *   (BBC) but drifts for ones that break mid-sentence (English Pro Tips).
 *
 * Step 2 — build:   node scripts/shadowing/buildShadowingLessons.js <subsDir>
 * Step 3 — translate: add each new sentence's Vietnamese to
 *                    scripts/data/shadowingTranslations.json (keyed by
 *                    slug, then by the exact English sentence)
 * Step 4 — seed:    node scripts/seedShadowingLessons.js
 *
 * To add a lesson: append to LESSONS (clipStart/clipEnd pick the 2–3 min
 * window of the video; only whole sentences inside it are kept), fetch its
 * captions, re-run step 2, check the printed segments, then steps 3–4.
 * Lessons whose caption files aren't in <subsDir> are carried over
 * unchanged from the current shadowingLessons.json, so only the new
 * videos' captions need fetching.
 *
 * Caption sources: a manual track (en-GB / en-US) is best. Where a channel
 * only has auto captions, YouTube's newer ones are punctuated and usable —
 * yt-dlp saves them as `<id>.en.json3` (same as en-orig); unpunctuated ones
 * can't be split into sentences, so skip those videos.
 *
 * Per-lesson options: `stripSpeakers: true` drops "Feifei:" / "Rob:" style
 * speaker labels (BBC The English We Speak captions); `useAutoText: true`
 * takes the text from the punctuated auto captions (en-orig) when they are
 * closer to what is actually said than the uploaded track.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// The English We Speak episode titles on YouTube are "<phrase>: The English We Speak".
const TEWS_PHRASE = {
  'tews-my-bad': 'My bad', 'tews-step-on-it': 'Step on it', 'tews-so-done-with': 'So done with',
  'tews-wing-it': 'Wing it', 'tews-take-the-biscuit': 'Take the biscuit', 'tews-fomo': 'FOMO',
  'tews-cut-a-long-story-short': 'To cut a long story short',
};

const LESSONS = [
  {
    slug: 'keith-part1-home-city',
    youtubeId: 'FUNeZlSQhRY',
    title: 'Part 1: Where you live — simple vs better answers',
    sourceTitle: 'Most Common IELTS Speaking Part 1 Questions and Answers',
    channel: 'English Speaking Success (Keith)',
    category: 'ielts-part1',
    level: 'B2',
    clipStart: 83, clipEnd: 263,
    description: 'Keith trả lời 2 câu hỏi Part 1 (nhà ở, thành phố) — một câu trả lời đơn giản và một câu trả lời hay hơn, kèm giải thích vì sao.',
  },
  {
    slug: 'keith-part1-common-mistakes',
    youtubeId: '0PMSzsCnsgQ',
    title: 'Part 1: Don\'t give generic or one-word answers',
    sourceTitle: 'Improve your IELTS Speaking Part 1 Answers',
    channel: 'English Speaking Success (Keith)',
    category: 'ielts-part1',
    level: 'B1',
    clipStart: 79, clipEnd: 202.5,
    description: 'Hai lỗi Part 1 phổ biến nhất: trả lời chung chung thay vì nói về bản thân, và trả lời cụt một từ. Keith sửa từng câu và gợi ý độ dài lý tưởng.',
  },
  {
    slug: 'keith-part1-hometown-sample',
    youtubeId: 'row-gEm1S80',
    title: 'Part 1: Describe your hometown — Keith\'s sample answer',
    sourceTitle: 'How to Talk About Your Hometown in IELTS Speaking',
    channel: 'English Speaking Success (Keith)',
    category: 'ielts-part1',
    level: 'B2',
    clipStart: 995, clipEnd: 1158,
    description: 'Cụm "crop up", "there\'s not a day goes by…" rồi nghe trọn bài nói mẫu của Keith về quê hương Manchester: born and bred, on the outskirts, tourists flock…',
  },
  {
    slug: 'ept-part1-difficult-question',
    youtubeId: 'dSOWHQIcO_s',
    title: 'Part 1: A tricky question — can handwriting show personality?',
    sourceTitle: '8 Difficult IELTS Speaking Part 1 Questions (And How to Answer Them)',
    channel: 'English Pro Tips',
    category: 'ielts-part1',
    level: 'B2',
    clipStart: 258, clipEnd: 432, useAutoText: true,
    description: 'Cách trả lời câu hỏi Part 1 khó mà bạn chưa từng nghĩ tới: dùng "to some extent", "might give the impression", ví dụ thật — kèm câu trả lời mẫu.',
  },
  {
    slug: 'ept-part1-describe-home',
    youtubeId: 'n0BqPRD0adM',
    title: 'Part 1: Vocabulary to describe your home',
    sourceTitle: 'Essential Vocabulary for IELTS Speaking Part 1',
    channel: 'English Pro Tips',
    category: 'ielts-part1',
    level: 'B1',
    clipStart: 24, clipEnd: 201,
    description: 'Từ vựng tả nhà ở cho Part 1: well-organised, lots of natural light, overlooking the main street, close proximity to… kèm câu trả lời mẫu.',
  },
  {
    slug: 'ept-part1-examples-past-present',
    youtubeId: 'n9IX00H7JCY',
    title: 'Part 1: Give examples & compare past and present',
    sourceTitle: 'Give Better Answers in IELTS Speaking',
    channel: 'English Pro Tips',
    category: 'ielts-part1',
    level: 'B1',
    clipStart: 28, clipEnd: 200,
    description: 'Hai kỹ thuật kéo dài câu trả lời Part 1 tự nhiên: đưa ví dụ (for instance, such as…) và so sánh quá khứ – hiện tại (used to, would, these days…).',
  },
  {
    slug: 'englishprotips-part2-story',
    youtubeId: 'PXkSj-F6g-8',
    title: 'Part 2: Turn any topic into a story — the "but… so…" rule',
    sourceTitle: 'IELTS Speaking Part 2: Turn Any Topic Into a Story',
    channel: 'English Pro Tips',
    category: 'ielts-part2',
    level: 'B2',
    clipStart: 391, clipEnd: 569,
    description: 'Cựu giám khảo IELTS hướng dẫn kỹ thuật "but… so…" để biến bài Part 2 thành một câu chuyện, kèm bài nói mẫu "a special day which didn\'t cost much".',
  },
  {
    slug: 'keith-part2-book',
    youtubeId: 'TovkGUi7Hxk',
    title: 'Part 2: Describe a book you recently read',
    sourceTitle: 'IELTS Speaking Sample Answer Part 2 - A book you recently read',
    channel: 'English Speaking Success (Keith)',
    category: 'ielts-part2',
    level: 'B2',
    clipStart: 15, clipEnd: 176,
    description: 'Trọn bài nói Part 2 mẫu của Keith về một cuốn sách phiêu lưu: captivating, couldn\'t put it down, on the edge of my seat, aimed at teenagers…',
  },
  {
    slug: 'ept-part2-examiner-story',
    youtubeId: '4eJqU7U1R5w',
    title: 'Part 2: An ex-examiner\'s 2-minute story',
    sourceTitle: 'IELTS Speaking Part 2 | The Essential Guide',
    channel: 'English Pro Tips',
    category: 'ielts-part2',
    level: 'B2',
    clipStart: 98, clipEnd: 248.5,
    description: 'Nghe một bài Part 2 nói đủ 2 phút theo cấu trúc mở – thân – kết, rồi phân tích vì sao kể chuyện giúp bạn nói trôi chảy hơn.',
  },
  {
    slug: 'bbc-6min-scared-to-speak',
    youtubeId: 'YAsDeXcYyTg',
    title: 'Scared to speak English?',
    sourceTitle: 'Scared to speak English? 6 Minute English',
    channel: 'BBC Learning English',
    category: '6-minute-english',
    level: 'B1',
    clipStart: 99, clipEnd: 260,
    description: 'Vì sao nói tiếng Anh lại khiến ta lo lắng? Nghe câu chuyện của nhà báo Hanan Razek và ý kiến chuyên gia về "speaking anxiety".',
  },
  ...[
    ['Y681hXWwhQY', 'bbc-6min-doing-nothing', 'The benefits of doing nothing', 105, 270,
      'Vì sao nhiều loài vật dành phần lớn thời gian… không làm gì? Kiến lười, sư tử và lợi ích bất ngờ của sự nhàm chán: "boredom is the mother of invention".'],
    ['7F1iJZr-p4E', 'bbc-6min-drinking-water', 'Are you drinking enough water?', 96, 262,
      'Có thật mỗi ngày phải uống 2 lít nước? Chuyên gia giải thích con số "ballpark figure" này và dấu hiệu mất nước.'],
    ['C830bmzNjDc', 'bbc-6min-breakfast', 'Is breakfast the most important meal of the day?', 120, 285,
      '"Breakfast like a king, dine like a pauper" — ăn sáng nhiều có tốt hơn? Từ vựng: metabolism, spike, skip a meal, lean.'],
    ['j2PdEQpu5js', 'bbc-6min-good-sleep', 'Why you need a good night\'s sleep', 80, 246,
      'Ngủ giúp não ghi nhớ và giải quyết vấn đề ("sleep on it"); thiếu ngủ gây stress và knock-on effects.'],
    ['D9jZMLm72a8', 'bbc-6min-housework', 'Who does the housework?', 132, 296,
      'Ai làm việc nhà? Câu chuyện từ đảo Rote (Indonesia) và Croatia: domestic chores, division of labour, pull your weight.'],
    ['-XcALxwXJVY', 'bbc-6min-language-apps', 'Can apps teach you a language?', 55, 222,
      'Học ngoại ngữ bằng app như Duolingo có hiệu quả? Implicit vs explicit learning, full immersion và kết quả một nghiên cứu.'],
    ['2lxvNnGkdTo', 'bbc-6min-favourite-snack', 'What\'s your favourite snack?', 122, 290,
      'Vì sao chúng ta thích ăn vặt? Snack là "affordable luxury", ăn "on the go" và xu hướng đồ ăn vặt "functional".'],
  ].map(([youtubeId, slug, title, clipStart, clipEnd, description]) => ({
    slug, youtubeId, title, sourceTitle: `${title} 6 Minute English`, channel: 'BBC Learning English',
    category: '6-minute-english', level: 'B1', clipStart, clipEnd, description,
  })),
  // BBC "The English We Speak": 2–3 minute comic sketches built around one
  // everyday phrase — the whole episode is the clip.
  ...[
    ['Ki1BWV_vr3Q', 'tews-my-bad', 'My bad!', 'A2', 7, 147,
      'Rob đến muộn mà không chịu nói "sorry" — chỉ nói "my bad". Cụm từ lóng để nhận lỗi một cách nhẹ nhàng.'],
    ['u5vTi-nrMnI', 'tews-step-on-it', 'Step on it!', 'A2', 8, 138,
      'Rob đau chân, bảo Feifei "step on it" — và cô ấy… giẫm lên chân anh ấy thật! "Step on it" nghĩa là nhanh lên.'],
    ['4SWSI5tJTUE', 'tews-so-done-with', 'I\'m so done with this!', 'A2', 7, 100,
      'Neil chán ngấy bản báo cáo: "I\'m so done with…" — cách nói bạn đã quá mệt mỏi, chán ngán việc gì đó.'],
    ['PrYU7hY0MYM', 'tews-wing-it', 'Just wing it!', 'B1', 7, 118,
      'Feifei làm mất kịch bản, Neil bảo "wing it" — và cô ấy bắt đầu giả làm chim! "Wing it" nghĩa là ứng biến.'],
    ['kcrDi8mdVeA', 'tews-take-the-biscuit', 'That takes the biscuit!', 'B1', 8, 155,
      'Feifei dùng hết cà phê của Rob rồi mua bánh quy "chuộc lỗi"… "That takes the biscuit" = thật quá đáng / khó tin!'],
    ['cBrN1O6Ku7s', 'tews-fomo', 'FOMO — fear of missing out', 'B1', 8, 168,
      'Rob đi xem rock mà không rủ Feifei — ai mới là người có FOMO? Kết thúc bất ngờ, rất vui.'],
    ['-DDUTu7mX8M', 'tews-cut-a-long-story-short', 'To cut a long story short…', 'B1', 8, 169,
      'Rob về nhà lúc 2 giờ sáng và chỉ kể "to cut a long story short…" — nhưng Feifei đã biết hết sự thật!'],
  ].map(([youtubeId, slug, title, level, clipStart, clipEnd, description]) => ({
    slug, youtubeId, title, sourceTitle: `${TEWS_PHRASE[slug]}: The English We Speak`, channel: 'BBC Learning English',
    category: 'fun-shorts', level, clipStart, clipEnd, description, stripSpeakers: true, minWords: 3,
  })),
];

// Caption-file typos / artefacts, fixed before segmentation.
const TEXT_FIXES = [
  [/\bIELTSTS\b/g, 'IELTS'],
  [/like Hanan$/, 'like Hanan.'], // BBC caption line is missing its full stop
  // Auto-caption mishearings (English Pro Tips, Keith)
  [/\bIELS\b/g, 'IELTS'],
  [/\bQ card\b/g, 'cue card'],
  [/\bSettl?eers\b/g, 'Settlers'],
  [/\bKatan\b/g, 'Catan'],
  [/\b20ies\b/g, '20s'],
  [/\bfarflung\b/g, 'far-flung'],
  [/\bdodle\b/g, 'doddle'],
  [/\bcliffhers\b/g, 'cliffhangers'],
  [/generic Answer:/g, 'generic answer.'],
];

// Fixes that span two caption lines, applied to the finished sentence.
const SEGMENT_FIXES = [
  [/\bSonia Toxfig\b/g, 'Sandi Toksvig'],
];

const MAX_WORDS = 24;      // longer sentences are split at a comma
const MIN_SPLIT_WORDS = 8; // …but never into a piece shorter than this
const MIN_WORDS = 5;       // "Right?", "All of a sudden." get merged into a neighbour
const MIN_TURN_WORDS = 2;  // dialogue: a one-word turn ("What?") joins the next
const PAUSE_SPLIT = 2.5;   // seconds of silence that count as a turn change
const LAST_WORD_MS = 1000; // auto captions: max length of a caption line's last word
const LEAD_IN = 0.15;      // seconds of air before / after a segment
const TAIL = 0.3;

const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '');

function readJson3(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8')).events || [];
}

// "Feifei: Welcome…", "Examples : I need…" → the label becomes a TURN
// marker, so manualWords() can flag where one speaker hands over.
const SPEAKER_LABEL = /(^|\s)[A-Z][a-z]+\s?:\s+/g;
const TURN = '¶';

function cleanText(t, { stripSpeakers } = {}) {
  let s = t.replace(/\n/g, ' ');
  for (const [re, rep] of TEXT_FIXES) s = s.replace(re, rep);
  if (stripSpeakers) s = s.replace(SPEAKER_LABEL, `$1${TURN} `);
  return s
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ') // (upbeat pop music), [Laughs]
    .replace(/^\s*-\s+/, '')               // speaker-change dash
    .replace(/\s+/g, ' ')
    .trim();
}

// Manual captions → one entry per word, with its caption line's time span.
// Start/end are first filled in by character-proportional interpolation
// inside that line (the fallback when no auto captions exist).
function manualWords(events, opts) {
  const words = [];
  for (const ev of events) {
    if (!ev.segs || ev.aAppend) continue;
    const text = cleanText(ev.segs.map((s) => s.utf8 || '').join(''), opts);
    if (!text) continue;
    const start = ev.tStartMs / 1000;
    const end = start + (ev.dDurationMs || 0) / 1000;
    // A bare "–" / "…" isn't a word, but dropping it ran clauses together
    // ("women's work a negative term") — keep it on the word before.
    const toks = [];
    let turn = false;
    for (const w of text.split(' ')) {
      if (w === TURN) turn = true;
      else if (norm(w)) { toks.push({ w, turn }); turn = false; }
      else if (/^[–—-]+$|^…$|^\.\.\.$/.test(w)) {
        if (turn) continue; // "Rob: ... Oh!" — belongs to nobody's sentence
        if (toks.length) toks[toks.length - 1].w += ' ' + w;
        else if (words.length) words[words.length - 1].text += ' ' + w;
      }
    }
    const totalChars = toks.reduce((n, t) => n + t.w.length + 1, 0);
    let acc = 0;
    toks.forEach(({ w, turn: t }) => {
      const s = start + ((end - start) * acc) / totalChars;
      acc += w.length + 1;
      const e = start + ((end - start) * acc) / totalChars;
      words.push({ text: w, start: s, end: e, ...(t && { turn: true }) });
    });
  }
  return words;
}

// Auto captions (`en-orig`) → one entry per word with ASR timings.
function autoWords(events) {
  const words = [];
  for (const ev of events) {
    if (!ev.segs || ev.aAppend) continue;
    const base = ev.tStartMs;
    const evEnd = base + (ev.dDurationMs || 0);
    ev.segs.forEach((sg, i) => {
      const w = (sg.utf8 || '').trim();
      if (!norm(w)) return;
      const s = base + (sg.tOffsetMs || 0);
      const next = ev.segs[i + 1];
      // A line's last word "lasts" until the rolling caption line is
      // replaced — often seconds into the next sentence — so cap it.
      const e = next ? base + (next.tOffsetMs || 0) : Math.min(evEnd, s + LAST_WORD_MS);
      words.push({ n: norm(w), start: s / 1000, end: Math.max(s, e) / 1000 });
    });
  }
  return words;
}

// LCS-align manual words to auto words (inside a window around the clip so
// the DP table stays small) and copy over the ASR timings of every match.
function applyAutoTimings(mWords, aWords, from, to) {
  const mIdx = [], aIdx = [];
  mWords.forEach((w, i) => { if (w.end >= from && w.start <= to) mIdx.push(i); });
  aWords.forEach((w, i) => { if (w.end >= from && w.start <= to) aIdx.push(i); });
  const n = mIdx.length, m = aIdx.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = 1; i <= n; i++) {
    const a = norm(mWords[mIdx[i - 1]].text);
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a === aWords[aIdx[j - 1]].n
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  let i = n, j = m, matched = 0;
  while (i > 0 && j > 0) {
    const mw = mWords[mIdx[i - 1]], aw = aWords[aIdx[j - 1]];
    if (norm(mw.text) === aw.n) {
      mw.start = aw.start; mw.end = aw.end; mw.timed = true;
      matched++; i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  // Unmatched words: spread them evenly between their timed neighbours.
  for (let k = 0; k < n; k++) {
    if (mWords[mIdx[k]].timed) continue;
    let r = k;
    while (r < n && !mWords[mIdx[r]].timed) r++;
    const prevEnd = k > 0 ? mWords[mIdx[k - 1]].end : mWords[mIdx[k]].start;
    const nextStart = r < n ? mWords[mIdx[r]].start : mWords[mIdx[r - 1]].end;
    const step = (nextStart - prevEnd) / (r - k);
    for (let q = k; q < r; q++) {
      mWords[mIdx[q]].start = prevEnd + step * (q - k);
      mWords[mIdx[q]].end = prevEnd + step * (q - k + 1);
    }
    k = r - 1;
  }
  return n ? matched / n : 0;
}

const endsSentence = (w) => /[.?!]["'”’]?$/.test(w);

// Dialogue (stripSpeakers): each speaker turn is split on its own, so a
// practice sentence never mixes two voices. A turn too short to stand
// alone ("What?", "Bye.") still joins the next turn.
function toSentences(words, { minWords = MIN_WORDS } = {}) {
  // A long pause (music, a cut) also ends a turn, so a short line before it
  // ("So stick around.") isn't glued onto what comes after.
  const turns = [];
  let prev = null;
  for (const w of words) {
    if (w.turn || !turns.length || w.start - prev.end > PAUSE_SPLIT) turns.push([]);
    turns[turns.length - 1].push(w);
    prev = w;
  }
  if (turns.length < 2) return turnSentences(words, minWords);
  const out = [];
  let carry = [];
  for (const t of turns) {
    const sents = turnSentences(t, minWords);
    if (carry.length) sents[0] = carry.concat(sents[0]);
    carry = [];
    if (sents.length === 1 && sents[0].length < MIN_TURN_WORDS) { carry = sents[0]; continue; }
    out.push(...sents);
  }
  if (carry.length) {
    if (out.length) out[out.length - 1] = out[out.length - 1].concat(carry);
    else out.push(carry);
  }
  return out;
}

function turnSentences(words, minWords) {
  const out = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (endsSentence(w.text)) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);

  // Split overlong sentences at the comma closest to their middle.
  const split = [];
  for (const s of out) {
    let rest = s;
    while (rest.length > MAX_WORDS) {
      let best = -1;
      for (let k = MIN_SPLIT_WORDS - 1; k < rest.length - MIN_SPLIT_WORDS; k++) {
        if (/[,;:]$/.test(rest[k].text) &&
            (best < 0 || Math.abs(k - rest.length / 2) < Math.abs(best - rest.length / 2))) best = k;
      }
      if (best < 0) break;
      split.push(rest.slice(0, best + 1));
      rest = rest.slice(best + 1);
    }
    split.push(rest);
  }

  // Fragments too short to practise on their own ("Right?", or a phrase
  // label like "The problem was." that the example sentence after it then
  // repeats) are carried FORWARD into the next sentence; a short tail at
  // the very end goes back into the previous one instead.
  const merged = [];
  let carry = [];
  for (const s of split) {
    const cur = carry.concat(s);
    if (cur.length < minWords) { carry = cur; continue; }
    merged.push(cur);
    carry = [];
  }
  if (carry.length) {
    if (merged.length) merged[merged.length - 1] = merged[merged.length - 1].concat(carry);
    else merged.push(carry);
  }
  return merged;
}

function buildLesson(spec, subsDir) {
  const find = (suffixes) => suffixes
    .map((sfx) => path.join(subsDir, `${spec.youtubeId}.${sfx}.json3`))
    .find((f) => fs.existsSync(f));
  const manualFile = find(spec.useAutoText ? ['en-orig'] : ['en-GB', 'en-US', 'en']);
  if (!manualFile) return null;
  const words = manualWords(readJson3(manualFile), { stripSpeakers: spec.stripSpeakers });

  const autoFile = find(['en-orig']);
  let timing = 'interpolated';
  if (autoFile) {
    const ratio = applyAutoTimings(words, autoWords(readJson3(autoFile)), spec.clipStart - 15, spec.clipEnd + 15);
    timing = `auto-aligned (${Math.round(ratio * 100)}% words matched)`;
  }

  // Keep only whole sentences inside the clip window.
  const sentences = toSentences(words, { minWords: spec.minWords }).filter((s) =>
    s[0].start >= spec.clipStart - 0.5 && s[s.length - 1].end <= spec.clipEnd + 0.5);
  const segments = sentences.map((s, i) => {
    const next = sentences[i + 1];
    const start = Math.max(0, s[0].start - LEAD_IN);
    let end = s[s.length - 1].end + TAIL;
    // Never run into the next segment's lead-in.
    if (next) end = Math.max(s[s.length - 1].end, Math.min(end, next[0].start - LEAD_IN));
    return {
      start: Math.round(start * 100) / 100,
      end: Math.round(end * 100) / 100,
      text: SEGMENT_FIXES.reduce((t, [re, rep]) => t.replace(re, rep), s.map((w) => w.text).join(' ')),
    };
  });
  // A word the LCS paired with the wrong ASR token (e.g. a quoted "Right."
  // matched to the next line's "right") can still push an end past the
  // next start — clamp so segments never overlap.
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i].end > segments[i + 1].start) segments[i].end = segments[i + 1].start;
  }
  const { clipStart, clipEnd, stripSpeakers, useAutoText, minWords, ...meta } = spec;
  return {
    ...meta,
    clipStart: segments.length ? segments[0].start : clipStart,
    clipEnd: segments.length ? segments[segments.length - 1].end : clipEnd,
    segments,
    _timing: timing,
  };
}

if (require.main === module) {
  const subsDir = process.argv[2];
  if (!subsDir) {
    console.error('Usage: node scripts/shadowing/buildShadowingLessons.js <subsDir>');
    process.exit(1);
  }
  const out = path.join(__dirname, '..', 'data', 'shadowingLessons.json');
  const existing = new Map((fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : []).map((l) => [l.slug, l]));
  const lessons = LESSONS.map((spec, order) => {
    const l = buildLesson(spec, subsDir);
    if (!l) {
      const prev = existing.get(spec.slug);
      if (!prev) throw new Error(`${spec.slug}: no manual caption file in ${subsDir} and not in ${path.basename(out)} yet`);
      console.log(`\n== ${spec.slug} — no captions in ${subsDir}, kept from ${path.basename(out)}`);
      // Metadata (title, level, description…) still follows LESSONS.
      const { clipStart, clipEnd, stripSpeakers, useAutoText, minWords, ...meta } = spec;
      return { ...prev, ...meta, order };
    }
    console.log(`\n== ${l.slug} — ${l.segments.length} segments, ${(l.clipEnd - l.clipStart).toFixed(0)}s, ${l._timing}`);
    l.segments.forEach((s, i) => console.log(`  ${String(i + 1).padStart(2)} ${s.start.toFixed(2)}-${s.end.toFixed(2)}  ${s.text}`));
    delete l._timing;
    return { ...l, order };
  });
  fs.writeFileSync(out, JSON.stringify(lessons, null, 2) + '\n');
  console.log(`\nWrote ${lessons.length} lessons → ${path.relative(process.cwd(), out)}`);
}

module.exports = { buildLesson, toSentences, LESSONS };
