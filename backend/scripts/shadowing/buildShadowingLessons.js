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
 * Step 3 — seed:    node scripts/seedShadowingLessons.js
 *
 * To add a lesson: append to LESSONS (clipStart/clipEnd pick the 2–3 min
 * window of the video; only whole sentences inside it are kept), fetch its
 * captions, re-run step 2, check the printed segments, then step 3.
 */
'use strict';

const fs = require('fs');
const path = require('path');

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
];

// Caption-file typos / artefacts, fixed before segmentation.
const TEXT_FIXES = [
  [/\bIELTSTS\b/g, 'IELTS'],
  [/like Hanan$/, 'like Hanan.'], // BBC caption line is missing its full stop
];

const MAX_WORDS = 24;      // longer sentences are split at a comma
const MIN_SPLIT_WORDS = 8; // …but never into a piece shorter than this
const MIN_WORDS = 5;       // "Right?", "All of a sudden." get merged into a neighbour
const LEAD_IN = 0.15;      // seconds of air before / after a segment
const TAIL = 0.3;

const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '');

function readJson3(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8')).events || [];
}

function cleanText(t) {
  let s = t.replace(/\n/g, ' ');
  for (const [re, rep] of TEXT_FIXES) s = s.replace(re, rep);
  return s
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ') // (upbeat pop music), [Laughs]
    .replace(/^\s*-\s+/, '')               // speaker-change dash
    .replace(/\s+/g, ' ')
    .trim();
}

// Manual captions → one entry per word, with its caption line's time span.
// Start/end are first filled in by character-proportional interpolation
// inside that line (the fallback when no auto captions exist).
function manualWords(events) {
  const words = [];
  for (const ev of events) {
    if (!ev.segs) continue;
    const text = cleanText(ev.segs.map((s) => s.utf8 || '').join(''));
    if (!text) continue;
    const start = ev.tStartMs / 1000;
    const end = start + (ev.dDurationMs || 0) / 1000;
    const toks = text.split(' ').filter((w) => norm(w));
    const totalChars = toks.reduce((n, w) => n + w.length + 1, 0);
    let acc = 0;
    toks.forEach((w) => {
      const s = start + ((end - start) * acc) / totalChars;
      acc += w.length + 1;
      const e = start + ((end - start) * acc) / totalChars;
      words.push({ text: w, start: s, end: e });
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
      const e = next ? base + (next.tOffsetMs || 0) : evEnd;
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

function toSentences(words) {
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
    if (cur.length < MIN_WORDS) { carry = cur; continue; }
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
  const manualFile = find(['en-GB', 'en-US', 'en']);
  if (!manualFile) throw new Error(`${spec.slug}: no manual caption file in ${subsDir}`);
  const words = manualWords(readJson3(manualFile));

  const autoFile = find(['en-orig']);
  let timing = 'interpolated';
  if (autoFile) {
    const ratio = applyAutoTimings(words, autoWords(readJson3(autoFile)), spec.clipStart - 15, spec.clipEnd + 15);
    timing = `auto-aligned (${Math.round(ratio * 100)}% words matched)`;
  }

  // Keep only whole sentences inside the clip window.
  const sentences = toSentences(words).filter((s) =>
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
      text: s.map((w) => w.text).join(' '),
    };
  });
  // A word the LCS paired with the wrong ASR token (e.g. a quoted "Right."
  // matched to the next line's "right") can still push an end past the
  // next start — clamp so segments never overlap.
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i].end > segments[i + 1].start) segments[i].end = segments[i + 1].start;
  }
  const { clipStart, clipEnd, ...meta } = spec;
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
  const lessons = LESSONS.map((spec, order) => {
    const l = buildLesson(spec, subsDir);
    console.log(`\n== ${l.slug} — ${l.segments.length} segments, ${(l.clipEnd - l.clipStart).toFixed(0)}s, ${l._timing}`);
    l.segments.forEach((s, i) => console.log(`  ${String(i + 1).padStart(2)} ${s.start.toFixed(2)}-${s.end.toFixed(2)}  ${s.text}`));
    delete l._timing;
    return { ...l, order };
  });
  const out = path.join(__dirname, '..', 'data', 'shadowingLessons.json');
  fs.writeFileSync(out, JSON.stringify(lessons, null, 2) + '\n');
  console.log(`\nWrote ${lessons.length} lessons → ${path.relative(process.cwd(), out)}`);
}

module.exports = { buildLesson, toSentences, LESSONS };
