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
 * window of the video — 6 Minute English takes the whole episode; only
 * whole sentences inside it are kept), fetch its
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
 * Per-lesson options: `stripSpeakers: true` drops "Feifei:" / "Rob:" / "A:"
 * style speaker labels (BBC The English We Speak captions); `useAutoText:
 * true` takes the text from the punctuated auto captions (en-orig) when they
 * are closer to what is actually said than the uploaded track (English Pro
 * Tips' "en" track is often a rewritten script); `dropFillers: true` removes
 * "um" / "uh" from unscripted speech (mock-test candidates); `pauseSplit`
 * overrides how many seconds of silence end a turn (a comic pause before a
 * punchline shouldn't split the sentence); `fixCaps: true` turns the ALL-CAPS
 * lines of stand-up auto captions back into sentence case; `skip: [n, …]`
 * drops 1-based segments the captions mangled (a bleeped word, a 0.3 s blip);
 * `join: [n, …]` glues segment n to n + 1 where an overlong sentence was cut
 * mid-phrase ("I came across like a" | "while ago…"). Both use the numbers
 * the build log prints. `transcript: '…'` replaces the caption text with a
 * hand-punctuated transcript when the auto captions have no punctuation —
 * en-orig still times every word; `endAt: { n: seconds }` fixes segment n's
 * end where the ASR put its last word far too late.
 *
 * Captions: fetch only `en-orig` (or `en-GB` for BBC) — asking yt-dlp for the
 * auto `en` track pulls YouTube's translated tracks and quickly hits HTTP 429.
 * Stand-up / crowd-work captions silently DROP bleeped words ("who the are
 * you?"), so every comedy clip has to be read in full before it goes in.
 *
 * Spelling & Numbers lessons are hand-timed instead: captions can't split
 * "T… H… E…" letter by letter into sentences, so `segments` lists
 * [start, end, text, answer] directly (timings read off the auto captions'
 * per-word times). `answer` is what Dictation grades — the name or number
 * an IELTS answer sheet would want — while Shadowing still uses `text`.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// The English We Speak episode titles on YouTube are "<phrase>: The English We Speak".
const TEWS_PHRASE = {
  'tews-my-bad': 'My bad', 'tews-step-on-it': 'Step on it', 'tews-so-done-with': 'So done with',
  'tews-wing-it': 'Wing it', 'tews-take-the-biscuit': 'Take the biscuit', 'tews-fomo': 'FOMO',
  'tews-cut-a-long-story-short': 'To cut a long story short',
  'tews-thatll-teach-you': 'That\'ll teach you!', 'tews-best-of-both-worlds': 'The best of both worlds',
  'tews-wake-up-call': 'A wake-up call', 'tews-walk-in-the-park': 'A walk in the park', 'tews-catch-22': 'Catch-22',
  'tews-left-on-read': 'Left on read', 'tews-not-gonna-lie': 'Not Gonna Lie',
  'tews-barking-up-the-wrong-tree': 'Barking up the wrong tree', 'tews-up-your-game': 'Up your game',
  'tews-rub-it-in': 'Rub it in', 'tews-have-a-go': 'Have a go',
  'tews-taste-of-your-own-medicine': 'A taste of your own medicine', 'tews-out-of-the-loop': 'Out of the loop',
  'tews-crunch-time': 'Crunch time', 'tews-thought-that-counts': 'It\'s the thought that counts',
};

// Hand-timed BBC Storytellers segments, { slug: [[start, end, text], …] }.
const STORYTELLERS = require('./storytellersSegments.json');

const KEITH = 'English Speaking Success (Keith)';
const EPT = 'English Pro Tips';
const JIMMY = 'Jimmy English Home';

const CS_ADVANCED = new Set([
  'cs-intrusive-r', 'cs-elision-d', 'cs-twinning-t', 'cs-assim-d-b', 'cs-assim-n-m', 'cs-assim-t-k',
  'cs-assim-d-g', 'cs-would-you', 'cs-unreleased-stops', 'cs-weak-have',
]);

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
  // BBC 6 Minute English — the WHOLE episode is the lesson (2026-10-28:
  // the user wanted full videos, not a 2–3 min window), so ~70 sentences each.
  ...[
    ['YAsDeXcYyTg', 'bbc-6min-scared-to-speak', 'Scared to speak English?',
      'Vì sao nói tiếng Anh lại khiến ta lo lắng? Nghe câu chuyện của nhà báo Hanan Razek và ý kiến chuyên gia về "speaking anxiety".'],
    ['Y681hXWwhQY', 'bbc-6min-doing-nothing', 'The benefits of doing nothing',
      'Vì sao nhiều loài vật dành phần lớn thời gian… không làm gì? Kiến lười, sư tử và lợi ích bất ngờ của sự nhàm chán: "boredom is the mother of invention".'],
    ['7F1iJZr-p4E', 'bbc-6min-drinking-water', 'Are you drinking enough water?',
      'Có thật mỗi ngày phải uống 2 lít nước? Chuyên gia giải thích con số "ballpark figure" này và dấu hiệu mất nước.'],
    ['C830bmzNjDc', 'bbc-6min-breakfast', 'Is breakfast the most important meal of the day?',
      '"Breakfast like a king, dine like a pauper" — ăn sáng nhiều có tốt hơn? Từ vựng: metabolism, spike, skip a meal, lean.'],
    ['j2PdEQpu5js', 'bbc-6min-good-sleep', 'Why you need a good night\'s sleep',
      'Ngủ giúp não ghi nhớ và giải quyết vấn đề ("sleep on it"); thiếu ngủ gây stress và knock-on effects.',
      337], // stop at "Goodbye" — a podcast promo follows
    ['D9jZMLm72a8', 'bbc-6min-housework', 'Who does the housework?',
      'Ai làm việc nhà? Câu chuyện từ đảo Rote (Indonesia) và Croatia: domestic chores, division of labour, pull your weight.'],
    ['-XcALxwXJVY', 'bbc-6min-language-apps', 'Can apps teach you a language?',
      'Học ngoại ngữ bằng app như Duolingo có hiệu quả? Implicit vs explicit learning, full immersion và kết quả một nghiên cứu.'],
    ['2lxvNnGkdTo', 'bbc-6min-favourite-snack', 'What\'s your favourite snack?',
      'Vì sao chúng ta thích ăn vặt? Snack là "affordable luxury", ăn "on the go" và xu hướng đồ ăn vặt "functional".'],
    // 2026-10-15: +14
    ['_PIlvBI9rXY', 'bbc-6min-reading-brain', 'How reading shapes your brain',
      'Đọc sách không "tự nhiên" như nói: não phải "co-opt" nhiều vùng khác nhau. Câu chuyện người đọc được tiếng Anh nhưng mất khả năng đọc tiếng Trung.'],
    ['QdE63sYqwd8', 'bbc-6min-stressed', 'Why are we all so stressed?',
      'Căng thẳng trước kỳ thi có thể giúp bạn làm bài tốt hơn ("nerves sharpen the mind"). Mẹo giảm stress: không có giải pháp "one-size-fits-all".'],
    ['9ifQ3xRz4hM', 'bbc-6min-multiple-languages', 'Learning multiple languages',
      'Biết nhiều ngôn ngữ là "a brain workout": trẻ em "tune in", "juggle" nhiều thứ tiếng; câu chuyện nhà báo nói 5 thứ tiếng.'],
    ['hb1CBEENiPQ', 'bbc-6min-cycle-more', 'Should we cycle more?',
      'Xe đạp "deeply ingrained" trong văn hóa Hà Lan; Dubai xây 600 km đường xe đạp vì "quality of life" và "liveability".'],
    ['m7IlyBEyi3c', 'bbc-6min-screen-time', 'Limiting screen time for children',
      'Không cấm hẳn công nghệ, mà dùng "intentional" hơn và "set the bar higher" — chuyên gia khuyên cha mẹ quản lý thời gian dùng màn hình của con.'],
    ['vOuhs1mA0xo', 'bbc-6min-advertisers', 'How advertisers make us spend money',
      'Vì sao gọi món qua màn hình cảm ứng khiến ta tiêu nhiều hơn? "Upsell", "basket spend", "nudge theory" và "think outside the box".'],
    ['LZYCjqAOhEE', 'bbc-6min-quieter-cities', 'Making cities feel quieter',
      'Mumbai ồn đến 80 decibel; ở Montreal, nghệ sĩ thêm tiếng sóng biển vào công viên để nó "nghe" yên tĩnh hơn — thật "counterintuitive"!'],
    ['d6BGuntMwCM', 'bbc-6min-zoos', 'Should animals be kept in zoos?',
      'Tranh luận hai phía về sở thú: giáo dục bảo tồn, cứu loài nguy cấp vs "zoochosis" — hợp với IELTS Writing Task 2 và Speaking Part 3.'],
    ['Mn0mXeor0ug', 'bbc-6min-play', 'How important is play?',
      'Sân chơi "phiêu lưu" đầy đồ bỏ đi giúp trẻ tự tin và "resilient": vì sao vui chơi tự do quan trọng "by far" hơn ta nghĩ.'],
    ['eabT4z25qxE', 'bbc-6min-say-sorry', 'How do you say sorry?',
      'Người Ghana, Pakistan, Nga và Hàn Quốc xin lỗi thế nào? "Forgiveness Sunday", cúi chào, và vì sao "sorry seems to be the hardest word".'],
    ['wCgPjVzREqs', 'bbc-6min-fast-food', 'How the world learned to love fast food',
      'Đồ ăn nhanh và "giấc mơ Mỹ": "a can-do attitude", "at the heart of" — và vì sao Iceland không còn cửa hàng McDonald\'s nào.'],
    ['Xbv4IIqwW-4', 'bbc-6min-best-schools', 'Which country has the best schools?',
      'Bảng xếp hạng PISA: các nước nhỏ như Singapore, Estonia "outpace" và "outperform" các nước lớn châu Âu nhờ không "segregate" học sinh.'],
    ['MXCrPmVuXjs', 'bbc-6min-robot-companion', 'Would you like a robot companion?',
      'Abi — robot bạn đồng hành "sassy", có mắt to biểu cảm và biết thổi bong bóng, mang niềm vui cho người già. Bạn có muốn một robot như vậy?'],
    ['CrwwsrWfYDk', 'bbc-6min-twins', 'What\'s it like to be a twin?',
      'Làm sinh đôi có "plain sailing" không? "Nature vs nurture" và câu chuyện kỳ lạ về cặp song sinh Jim bị chia cắt từ lúc sinh.'],
    // 2026-10-28: +10
    ['26PrgjTboVQ', 'bbc-6min-following-dreams', 'Are you following your dreams?',
      'Daisy sống trong một cộng đồng chia sẻ mọi thứ ở New Zealand, gia đình Zapp lái xe cổ vòng quanh thế giới 22 năm. Từ vựng: utopia, outlandish, humble, "a grain of sand".'],
    ['vq2x7k_nofw', 'bbc-6min-exercise-lazy', 'Exercise for the lazy',
      'Tập ít nhất bao nhiêu mà vẫn khoẻ? Tập ngắn nhưng "push yourself", đi bộ nhanh hơn, "easy wins" cho dân văn phòng và "more bang for your buck".'],
    ['SC_opiKLohg', 'bbc-6min-driverless-cars', 'Sharing the road with driverless cars',
      'Không có tài xế để "eye contact" hay vẫy tay — xe tự lái báo hiệu cho người đi bộ, đi xe đạp thế nào? Từ vựng: alert, glance, jaywalking.'],
    ['h_pvijqmolQ', 'bbc-6min-books-not-screens', 'Why read books, not screens?',
      'Đọc trên màn hình khiến ta "skim" ở "surface level"; đọc sách giấy rèn "deep reading", suy luận và thấu cảm. Mỗi ngày ta đọc tới 100.000 từ!'],
    ['g8q-Nq-ajx8', 'bbc-6min-social-media-teens', 'Social media and teenage health',
      'Thuật toán "feed" nội dung gây nghiện cho thanh thiếu niên vì doanh thu đến từ quảng cáo. Từ vựng: adolescent, algorithm, revenue, the onus, a losing battle.'],
    ['pEO9-iPZQWA', 'bbc-6min-extreme-weather', 'Climate and extreme weather',
      'Nhà khí tượng BBC giải thích weather vs climate, hurricane/cyclone/typhoon, storm surge, landslide — và vì sao chỉ 1°C nóng lên đã gây nhiều thời tiết cực đoan.'],
    ['V2eW5jGQe8I', 'bbc-6min-unhappy-at-work', 'Are you unhappy at work?',
      'Sếp "breathing down your neck", "presenteeism" và burnout — vì sao người Anh không vui khi đi làm, và cách làm việc theo nhiệm vụ giúp cân bằng work-life.',
      9999, { join: [16] }], // "B. a bartender? or C." | "A traffic warden?"
    ['we4KiShNjlA', 'bbc-6min-improving-memory', 'Improving your memory',
      'Vẽ giúp nhớ tốt hơn viết! Các kiểu học visual, auditory, kinaesthetic; từ vựng: encode, contextual, intuitive — và món ăn nào tốt cho trí nhớ.',
      9999, { stripSpeakers: true }], // captions carry "Neil:" / "Rob:" labels
    ['vP3VOKBcloo', 'bbc-6min-procrastinate', 'Why do we procrastinate?',
      'Vì sao ta cứ để việc đến phút chót? Trì hoãn là phản ứng cảm xúc từ thời tổ tiên "impulsive". Từ vựng: under pressure, gratification, oodles of time.'],
    ['s1HxJVusR2w', 'bbc-6min-future-of-work', 'What is the future of work?',
      'AI có lấy hết việc làm? Tuần làm việc 4 ngày? Hãy "take predictions with a pinch of salt". Từ vựng: track record, come to pass, dystopian, crop up.'],
  ].map(([youtubeId, slug, title, description, clipEnd = 9999, opts]) => ({
    slug, youtubeId, title, sourceTitle: `${title} 6 Minute English`, channel: 'BBC Learning English',
    category: '6-minute-english', level: 'B1', clipStart: 0, clipEnd, description, ...opts,
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
  // ── 2026-10-15: A2–C2, YouTube Shorts, Part 3 ───────────────────────
  // English Pro Tips' "en" track is a rewritten script, so their lessons
  // take the text from the punctuated auto captions (useAutoText).
  {
    slug: 'keith-part1-drive-a-lot', youtubeId: 'pD3l7zbm6Hk',
    title: 'Part 1: "Do you drive a lot?" — from simple to better',
    sourceTitle: 'Do you drive a lot?', channel: KEITH, category: 'ielts-part1', level: 'A2',
    clipStart: 0, clipEnd: 61.5, useAutoText: true,
    description: 'Video ngắn: Keith trả lời cùng một câu hỏi Part 1 ba lần, mỗi lần một hay hơn — từ "I drive to work every day" đến "commute", "a day trip", "a full tank of petrol".',
  },
  {
    slug: 'ept-part1-band-ladder-desserts', youtubeId: 'EBzRkYneAS8',
    title: 'Part 1: Desserts — Band 1 to Band 9 answers',
    sourceTitle: 'IELTS Band 1-9 | What desserts do people eat in your country?', channel: EPT,
    category: 'ielts-part1', level: 'B1', clipStart: 0, clipEnd: 129, useAutoText: true,
    description: 'Video ngắn vui: một câu hỏi Part 1, chín câu trả lời từ Band 1 ("Desserts?") đến Band 9 ("quintessentially British", "piping hot"). Nghe từng bậc nâng cấp từ vựng thế nào.',
  },
  {
    slug: 'ept-part1-band-ladder-weekends', youtubeId: 'g92HLI2WsVM',
    title: 'Part 1: Weekends — Band 1 to Band 9 answers',
    sourceTitle: 'Band 1-9 in IELTS. What do you like doing at the weekend?', channel: EPT,
    category: 'ielts-part1', level: 'B1', clipStart: 0, clipEnd: 89.2, useAutoText: true,
    description: 'Video ngắn vui: "What do you like doing on weekends?" — từ "Weekends. I like weekends." đến "sleep in", "at a leisurely pace", "to my heart\'s content".',
  },
  {
    slug: 'keith-part1-friends-family-routine', youtubeId: 'WSvoxPMOUy4',
    title: 'Part 1: Friends or family? & your morning routine',
    sourceTitle: '15 Most Common IELTS Speaking Questions (with Answers)', channel: KEITH,
    category: 'ielts-part1', level: 'B1', clipStart: 927, clipEnd: 1057.8,
    description: 'Hai câu Part 1 rất hay gặp, Keith trả lời mẫu rồi giải thích: to tell you the truth, strive, neglect, a brisk walk, without fail, on my own vs by myself.',
  },
  {
    slug: 'ept-part1-band9-nurse', youtubeId: 'YsvM5RecPd4',
    title: 'Part 1: Work — when you KNOW you are Band 9',
    sourceTitle: 'When you KNOW you are IELTS Band 9', channel: EPT,
    category: 'ielts-part1', level: 'C1', clipStart: 0, clipEnd: 66.3, useAutoText: true,
    description: 'Video ngắn vui: thí sinh trả lời ngắn, rồi tự "nâng cấp" thành câu Band 9 — my student days are behind me, a fulfilling job, the night shift, all messed up.',
  },
  {
    slug: 'ept-part1-real-band9-candidate', youtubeId: 'pi7XthH4zHQ',
    title: 'Part 1: A real Band 9 candidate — hometown & happiness',
    sourceTitle: 'Real IELTS Band 9 Candidate answers Part 1 Questions', channel: EPT,
    category: 'ielts-part1', level: 'C2', clipStart: 0, clipEnd: 89.1, useAutoText: true,
    description: 'Thí sinh Band 9 thật (Romania) trả lời Part 1 tự nhiên: I\'m inclining towards yes, absolutely adore, making up scenarios, feel at ease, serene.',
  },
  {
    slug: 'ept-part1-band9-cafes', youtubeId: 'LE_F9u-DYe0',
    title: 'Part 1: Cafés — a 17-year-old Band 9 candidate',
    sourceTitle: 'Incredible Band 9 Speaking Test (she\'s only 17!)', channel: EPT,
    category: 'ielts-part1', level: 'C2', clipStart: 144.6, clipEnd: 274.6, useAutoText: true, dropFillers: true,
    description: 'Trích bài thi thử Band 9 của Sia (17 tuổi): the hum of background conversations, word-of-mouth recommendations, a loyal clientele, media presence.',
  },
  {
    slug: 'ept-part2-lie-in-ielts', youtubeId: 'zrkxyOMb9BA',
    title: 'Part 2: What happens if you LIE in IELTS?',
    sourceTitle: 'What happens if you LIE in IELTS?!', channel: EPT,
    category: 'ielts-part2', level: 'B2', clipStart: 0, clipEnd: 54.2, useAutoText: true,
    description: 'Video ngắn vui: thí sinh định "bịa" chuyến đi Nhật với samurai thật… Có được nói dối trong IELTS không? Lời khuyên: kể chuyện thật rồi thêm chi tiết.',
  },
  {
    slug: 'keith-part2-tool-model-answer', youtubeId: 'N3x1cvJoy38',
    title: 'Part 2: Describe a tool you use at home — model answer',
    sourceTitle: '3 Steps to a Perfect IELTS Speaking Part 2 Answer', channel: KEITH,
    category: 'ielts-part2', level: 'B2', clipStart: 610.3, clipEnd: 775.5,
    description: 'Cách kết bài Part 2 thật ngắn, rồi nghe trọn bài mẫu của Keith về chiếc kéo: ergonomic handle, come in really handy, I\'d go as far as to say…, kept out of reach.',
  },
  {
    slug: 'ept-part2-band9-swiss-alps', youtubeId: 'LE_F9u-DYe0',
    title: 'Part 2: A place with beautiful views — Band 9 answer',
    sourceTitle: 'Incredible Band 9 Speaking Test (she\'s only 17!)', channel: EPT,
    category: 'ielts-part2', level: 'C2', clipStart: 344.6, clipEnd: 452.7, useAutoText: true, dropFillers: true,
    description: 'Bài Part 2 Band 9 về dãy Alps (Thụy Sĩ): sprung to my mind, densely populated, virgin forests, lost for words, picturesque scenery.',
  },
  {
    slug: 'ept-part3-dont-talk-about-yourself', youtubeId: 'C2hmPeVV-x0',
    title: 'Part 3: Don\'t do this! — talk about people, not you',
    sourceTitle: 'IELTS Part 3: Don\'t do this!', channel: EPT,
    category: 'ielts-part3', level: 'B2', clipStart: 0, clipEnd: 58.7, useAutoText: true,
    description: 'Video ngắn vui: thí sinh chỉ nói "I don\'t like computer games" — sai cách! Part 3 hỏi về người khác; nghe câu trả lời đúng: unwind, quite sociable.',
  },
  {
    slug: 'keith-part3-generation-gap', youtubeId: 'VIK3C8YHutY',
    title: 'Part 3: Phrases for the generation gap',
    sourceTitle: 'The Generation Gap', channel: KEITH,
    category: 'ielts-part3', level: 'B2', clipStart: 0.4, clipEnd: 80.6, useAutoText: true,
    description: 'Video ngắn: cụm từ nói về người già – người trẻ cho Part 3: older people (không nói old people), struggle to relate, see eye to eye, set in your ways, bridge the gap.',
  },
  {
    slug: 'ept-part3-ree-opinion', youtubeId: 'fzegwutPz60',
    title: 'Part 3: Opinion questions — the REE method',
    sourceTitle: 'How to Answer ANY IELTS Speaking Part 3 Question', channel: EPT,
    category: 'ielts-part3', level: 'B2', clipStart: 40.2, clipEnd: 176.6,
    description: 'Cựu giám khảo hướng dẫn trả lời câu hỏi ý kiến bằng REE: Respond – Elaborate – Example, kèm bài mẫu "Should children have homework every day?".',
  },
  {
    slug: 'ept-part3-power-of-two', youtubeId: 'fzegwutPz60',
    title: 'Part 3: Effects questions — "the power of two"',
    sourceTitle: 'How to Answer ANY IELTS Speaking Part 3 Question', channel: EPT,
    category: 'ielts-part3', level: 'C1', clipStart: 368.7, clipEnd: 531.1,
    description: 'Câu hỏi về hậu quả, ảnh hưởng: chỉ cần 2 ý phát triển tốt. Cụm this can lead to, as a result, in the long term — bài mẫu về công nghệ và giao tiếp.',
  },
  {
    slug: 'ept-part3-robots-jobs', youtubeId: 'j6nGSqkCf9k',
    title: 'Part 3: Could robots do all of today\'s jobs?',
    sourceTitle: 'Latest Part 3 IELTS Speaking Questions + Answers', channel: EPT,
    category: 'ielts-part3', level: 'C1', clipStart: 276.2, clipEnd: 431.7, useAutoText: true,
    description: 'Không rành chủ đề vẫn trả lời tốt: I\'m no expert, but…, as far as I know — cùng từ vựng emotional intelligence, empathy, a long-term therapist.',
  },
  {
    slug: 'ept-part3-band9-beauty', youtubeId: 'LE_F9u-DYe0',
    title: 'Part 3: The beauty industry — Band 9 discussion',
    sourceTitle: 'Incredible Band 9 Speaking Test (she\'s only 17!)', channel: EPT,
    category: 'ielts-part3', level: 'C2', clipStart: 482.1, clipEnd: 621.2, useAutoText: true, dropFillers: true,
    description: 'Part 3 Band 9: quảng cáo mỹ phẩm và trẻ em — overhyped, a genuine purpose, insecurities, cognitive processes, vulnerable to aggressive marketing.',
  },
  {
    slug: 'ept-short-gladiator', youtubeId: 'q6idE061v30',
    title: 'How (not) to start your IELTS test — Gladiator!',
    sourceTitle: 'How (not) to start your IELTS test', channel: EPT,
    category: 'fun-shorts', level: 'B1', clipStart: 2.6, clipEnd: 80.2, useAutoText: true, dropFillers: true, pauseSplit: 3,
    description: 'Thí sinh giới thiệu bản thân như phim Gladiator: "Father to a band four son…" 😄 rồi xem cách mở đầu bài thi đơn giản, đúng chuẩn.',
  },
  ...[
    ['7G09ElS_2-A', 'tews-thatll-teach-you', 'That\'ll teach you!', 'A2', 7, 160,
      'Feifei đi chơi khuya, sáng ngủ quên, đến muộn và luộm thuộm. "That\'ll teach you!" = đáng đời, lần sau chừa nhé!'],
    ['XRZMlJRqhvw', 'tews-walk-in-the-park', 'A walk in the park', 'A2', 7, 147,
      'Neil tự tin chạy 5 km "dễ như đi dạo trong công viên"… rồi về đích thở không ra hơi. "A walk in the park" = rất dễ.'],
    ['fidjyJOjcXA', 'tews-left-on-read', 'Left on read', 'A2', 9, 166,
      'Roy đọc tin nhắn mà không trả lời vì… đang ăn chuối. Đến khi biết tin nhắn mời đi xem nhạc miễn phí thì đã muộn!'],
    ['tzaYt9N6J2I', 'tews-best-of-both-worlds', 'The best of both worlds', 'B1', 8, 150,
      'Rob khoe được cả nhịp sống thành phố lẫn bình yên ở quê — cho đến khi tàu về làng bị huỷ. "The best of both worlds" = vẹn cả đôi đường.'],
    ['LLI4JWe7yGg', 'tews-wake-up-call', 'A wake-up call', 'B1', 9, 157,
      'Rob đi muộn, thở hổn hển vì chạy ra ga. Feifei bảo đây là "a wake-up call" — không phải chuông báo thức đâu, mà là lời cảnh tỉnh!'],
    ['KA0FWnFw4Hk', 'tews-catch-22', 'Catch-22', 'B1', 8, 155,
      'Feifei trượt phỏng vấn vì thiếu kinh nghiệm — nhưng không có việc thì sao có kinh nghiệm? "Catch-22" = tình huống không lối thoát.'],
    ['qUAOipD_eME', 'tews-not-gonna-lie', 'Not gonna lie', 'B1', 7, 153,
      '"Not gonna lie, you look tired" — tiếng lóng để nói thật lòng (hoặc tự khen). Neil và Feifei tranh nhau làm "best presenter".'],
    ['gXIpQ5nfnKw', 'tews-barking-up-the-wrong-tree', 'Barking up the wrong tree', 'B1', 8, 155,
      'Feifei nghi Rob mách sếp chuyện cô làm đổ cà phê. Rob: "You\'re barking up the wrong tree!" = nghi nhầm người rồi.'],
    ['SuV-uETO1hc', 'tews-up-your-game', 'Up your game', 'B1', 7, 145,
      'Neil nhờ Feifei viết tin nhắn mời bạn gái đi cà phê: "you need to up your emoji game!" = phải nâng trình lên. Kết thúc bất ngờ!'],
    // 2026-10-15: +6
    ['7kQkkto7igU', 'tews-rub-it-in', 'Don\'t rub it in!', 'A2', 8.8, 124.6,
      'Feifei bảo Neil "don\'t rub it in" (đừng nhắc mãi nữa) — và Neil… không thoa kem chống nắng. Về như con tôm luộc!'],
    ['BiaUB9bz8jc', 'tews-have-a-go', 'Why are you having a go at me?', 'B1', 6.6, 116.4,
      'Áo chưa là, dính sốt cà chua, chưa cạo râu… Feifei "has a go at" Neil (chê trách). "Have a go" còn có nghĩa là "thử làm".'],
    ['hf0I6VwS0YE', 'tews-taste-of-your-own-medicine', 'A taste of your own medicine', 'B1', 7.1, 148.3,
      'Feifei bị cảm và uống thuốc vị "dâu" kinh khủng. "A taste of your own medicine" = gậy ông đập lưng ông — và ai mới là người hay sai bảo?'],
    ['_4ZmQA6OiUc', 'tews-out-of-the-loop', 'Out of the loop', 'B1', 7, 148,
      'Neil bỏ lỡ cuộc họp về chính sách "làm việc lành mạnh": không được ngồi, không cà phê… "Out of the loop" = không nắm thông tin.'],
    ['rfIY5aMMo2s', 'tews-crunch-time', 'It\'s crunch time!', 'B1', 8.8, 153.4,
      'Rob nói "crunch time", Feifei tưởng là "lunch time" và lấy khoai tây chiên ra nhai rôm rốp. Hóa ra dự án quan trọng là… chọn bánh quy!'],
    ['GLyLyzzw2tc', 'tews-thought-that-counts', 'It\'s the thought that counts', 'A2', 5.3, 158.2,
      'Neil tặng Feifei quà Giáng sinh sớm: kính Harry Potter! "It\'s the thought that counts" = quý ở tấm lòng — cách khen lịch sự món quà mình không thích.'],
  ].map(([youtubeId, slug, title, level, clipStart, clipEnd, description]) => ({
    slug, youtubeId, title, sourceTitle: `${TEWS_PHRASE[slug]}: The English We Speak`, channel: 'BBC Learning English',
    category: 'fun-shorts', level, clipStart, clipEnd, description, stripSpeakers: true, minWords: 3,
  })),
  // ── Spelling & Numbers (IELTS Listening Part 1) ─────────────────────
  {
    slug: 'spell-names-yana', youtubeId: 'zLH3DHr8Ezc',
    title: 'Spelling names: 10 first names & surnames',
    sourceTitle: 'IELTS Listening Practice – Spelling Names and Surnames', channel: 'Yana | IELTS Trainer',
    category: 'spelling-numbers', level: 'A2',
    description: 'Nghe tên rồi nghe đánh vần từng chữ cái, gõ lại đúng chính tả như Listening Part 1. Cẩn thận bẫy: nghe "Sophia" nhưng đánh vần S-O-F-I-A; "double R", "double L".',
    segments: [
      [34.2, 47.6, "Name one. Ethan Barrow. That's E-T-H-A-N for Ethan, and B-A-R-R-O-W for Barrow.", 'Ethan Barrow'],
      [59.4, 70.8, "Name two. Maya Khan. That's M-A-Y-A for Maya, and K-H-A-N for Khan.", 'Maya Khan'],
      [79.2, 90.6, "Name three. Oliver Kempsey. That's O-L-I-V-E-R for Oliver, and K-E-M-P-S-E-Y for Kempsey.", 'Oliver Kempsey'],
      [101.4, 111.6, "Name four. Sofia Martins. That's S-O-F-I-A for Sofia, and M-A-R-T-I-N-S for Martins.", 'Sofia Martins'],
      [123.1, 135.4, "Name five. Noah Fernandes. That's N-O-A-H for Noah, and F-E-R-N-A-N-D-E-S for Fernandes.", 'Noah Fernandes'],
      [146.7, 157.9, "Name six. Rohan Ellis. That's R-O-H-A-N for Rohan, and E-L-L-I-S for Ellis.", 'Rohan Ellis'],
      [169.6, 180.9, "Name seven. Greta Morrison. That's G-R-E-T-A for Greta, and M-O-double R-I-S-O-N for Morrison.", 'Greta Morrison'],
      [192.4, 203.6, "Name eight. Callum Jeffers. That's C-A-double L-U-M for Callum, and J-E-F-F-E-R-S for Jeffers.", 'Callum Jeffers'],
      [215.4, 232.2, "Name nine. Shirley Fitzgerald. That's S-H-I-R-L-E-Y for Shirley, and F-I-T-Z-G-E-R-A-L-D for Fitzgerald.", 'Shirley Fitzgerald'],
      [247.2, 260.2, "Name ten. Nathan Wallace. That's N-A-T-H-A-N for Nathan, and W-A-double L-A-C-E for Wallace.", 'Nathan Wallace'],
    ],
  },
  {
    slug: 'spell-names-actors', youtubeId: 'y3XbLFxnRnQ',
    title: 'Spelling names: famous actors',
    sourceTitle: 'IELTS Listening Skills E1 - Spelling names - Actors and actresses', channel: 'IELTS with Vic',
    category: 'spelling-numbers', level: 'A2',
    description: 'Nghe đánh vần tên 10 diễn viên nổi tiếng (Helen Mirren, Maggie Smith, Tom Hardy…) và gõ lại đúng chính tả. Luyện "double R", "double G", "double L".',
    segments: [
      [36.9, 47.6, 'H-E-L-E-N Helen, M-I-double R-E-N Mirren.', 'Helen Mirren'],
      [65.5, 77.6, 'A-L-A-N Alan, R-I-C-K-M-A-N Rickman.', 'Alan Rickman'],
      [92.3, 102.9, 'M-A-double G-I-E Maggie, S-M-I-T-H Smith.', 'Maggie Smith'],
      [113.0, 123.9, 'G-A-R-Y Gary, O-L-D-M-A-N Oldman.', 'Gary Oldman'],
      [133.3, 145.2, 'T-I-L-D-A Tilda, S-W-I-N-T-O-N Swinton.', 'Tilda Swinton'],
      [153.5, 164.4, 'I-A-N Ian, M-C-K-E-double L-E-N McKellen.', 'Ian McKellen'],
      [173.4, 184.0, 'K-A-T-E Kate, W-I-N-S-L-E-T Winslet.', 'Kate Winslet'],
      [194.0, 204.1, 'I-D-R-I-S Idris, E-L-B-A Elba.', 'Idris Elba'],
      [212.6, 223.8, 'E-M-I-L-Y Emily, B-L-U-N-T Blunt.', 'Emily Blunt'],
      [233.4, 242.0, 'T-O-M Tom, H-A-R-D-Y Hardy.', 'Tom Hardy'],
    ],
  },
  {
    slug: 'spell-names-politicians', youtubeId: 'UzmUo-rMQjY',
    title: 'Spelling names: British politicians',
    sourceTitle: 'IELTS Listening Skills E2 - Spelling names - politicians', channel: 'IELTS with Vic',
    category: 'spelling-numbers', level: 'B1',
    description: 'Khó hơn: chỉ nghe các chữ cái, không nghe trước cái tên. Gõ lại tên 10 chính trị gia Anh (Theresa May, Boris Johnson, Margaret Thatcher…).',
    segments: [
      [42.0, 55.5, 'T-H-E-R-E-S-A, M-A-Y.', 'Theresa May'],
      [82.2, 96.0, 'N-I-C-K, C-L-E-double G.', 'Nick Clegg'],
      [114.2, 130.0, 'D-I-A-N-E, A-double B-O-double T.', 'Diane Abbott'],
      [149.3, 171.0, 'B-O-R-I-S, J-O-H-N-S-O-N.', 'Boris Johnson'],
      [186.4, 213.5, 'N-I-C-O-L-A, S-T-U-R-G-E-O-N.', 'Nicola Sturgeon'],
      [226.7, 247.5, 'G-O-R-D-O-N, B-R-O-W-N.', 'Gordon Brown'],
      [261.2, 274.5, 'L-I-Z, T-R-U-double S.', 'Liz Truss'],
      [286.8, 309.5, 'D-A-V-I-D, C-A-M-E-R-O-N.', 'David Cameron'],
      [323.4, 351.5, 'M-A-R-G-A-R-E-T, T-H-A-T-C-H-E-R.', 'Margaret Thatcher'],
      [366.7, 383.8, 'J-O-H-N, M-A-J-O-R.', 'John Major'],
    ],
  },
  {
    slug: 'numbers-13-or-30', youtubeId: 'rgIjmos4yDE',
    title: 'Numbers: 13 or 30? Teen vs -ty',
    sourceTitle: 'Listening Practice Numbers 13 or 30', channel: 'The IELTS Coach',
    category: 'spelling-numbers', level: 'A2',
    description: 'Phân biệt 13–30, 14–40… nghe trọng âm: "-teen" nhấn âm cuối và kéo dài, "-ty" nhấn âm đầu. Mẹo: dùng logic — "bà tôi 17 tuổi" chắc là 70!',
    // The uploaded track paraphrases what is said — text follows the audio.
    segments: [
      [7.0, 11.9, "Hello and welcome to today's IELTS listening practice lesson."],
      [12.0, 18.4, "And today we're going to listen to the different sounds with certain numbers."],
      [18.5, 24.8, 'So the numbers are 13 and 30, 14 and 40.'],
      [24.9, 31.5, "So we'll see how they are pronounced differently and how you can listen to them and write them down correctly."],
      [32.4, 41.5, "So let's look at the two groups. We have \"teen\", which is a longer sound, and then \"ty\", which is short, and it is a different vowel sound."],
      [42.8, 52.4, 'And also, the difference in pronouncing these two different sets of numbers is, for the teen numbers, the last syllable is stressed.'],
      [52.5, 58.2, 'But for 30, 40, the first syllable is stressed.'],
      [58.3, 64.5, 'Okay, so there is a difference in the stress as well as a difference in the sound and the length of the sound.'],
      [64.6, 81.5, "So now let's have a look and say the teen numbers: 13, 14, 15, 16, 17, 18, 19."],
      [82.1, 87.9, "It's really easy: making it long in the second syllable, and that's the stressed syllable."],
      [88.0, 91.8, "We know it's the \"teen\" and not the other form of the number."],
      [91.9, 106.5, 'Now I will say the other numbers: 30, 40, 50, 60, 70, 80, 90.'],
      [107.1, 112.0, 'So the first part, the first syllable, is longer and stressed.'],
      [112.1, 120.5, 'Okay, now I will say them together so you can hear the difference, and this is what you need to be aware of in the listening exam.'],
      [120.8, 140.8, '13, 30, 14, 40, 15, 50, 16, 60, 17, 70.'],
      [141.4, 147.3, '18, 80, 19, 90.'],
      [147.4, 153.0, "Okay, there's quite a big difference, so you can use this when you speak to show which number you're saying."],
      [153.1, 158.0, "Make it clear. They should be different. They don't sound the same. They are quite different."],
      [158.1, 168.3, "And of course, use this in the listening exam when you're listening for the number: think, which number did they say, as well as listening for the actual sounds."],
      [168.4, 171.0, 'Also, think about the logic.'],
      [171.1, 177.5, "Okay, if someone says, \"My grandmother is 17 years old\", that's probably not true."],
      [177.6, 180.7, "It's not 17, it will be 70."],
      [180.8, 187.3, 'Okay, so think about the logic as well as the sounds: the stress, which syllable is stressed.'],
    ],
  },
  {
    slug: 'numbers-reference-codes', youtubeId: 'V7V8xOTrEDg',
    title: 'Numbers: room, reference & phone numbers',
    sourceTitle: 'Part 1 of IELTS Listening Skills - NUMBERS', channel: 'IELTS with Vic',
    category: 'spelling-numbers', level: 'A2',
    description: 'Nghe 10 câu có dãy số (số phòng, mã tham chiếu, số điện thoại, mã khóa…) và chỉ cần gõ lại con số — đọc chậm, rõ, hợp để bắt đầu.',
    segments: [
      [32.3, 39.8, 'Number one. She lives in room 1207.', '1207'],
      [40.0, 52.8, 'Two. My reference number is 1387 9645.', '1387 9645'],
      [53.2, 63.3, 'Three. Their phone number is 776 521.', '776 521'],
      [63.6, 76.8, 'Four. The lock number is 912 816 32.', '912 816 32'],
      [77.2, 89.5, 'Five. The invoice number is 476 928.', '476 928'],
      [121.0, 130.5, 'Six. Our phone number is 312 876.', '312 876'],
      [130.8, 137.5, 'Seven. His applicant number is 912.', '912'],
      [137.8, 145.4, 'Eight. The door code is 7642.', '7642'],
      [145.7, 154.9, 'Nine. My receipt number is 529763.', '529763'],
      [155.2, 167.5, 'Ten. The ID number is 12 72 64 87.', '12 72 64 87'],
    ],
  },
  {
    slug: 'numbers-phone-natural-speed', youtubeId: 'yXvVHq6LT5g',
    title: 'Numbers: phone numbers at natural speed',
    sourceTitle: 'IELTS Listening Practice - Telephone Numbers', channel: 'Woodward English',
    category: 'spelling-numbers', level: 'B1',
    description: 'Số điện thoại đọc tốc độ thật như trong bài thi: "oh" = 0, "double five", và bẫy sửa số giữa chừng ("549… oops, I mean 569…"). Chỉ cần gõ lại dãy số.',
    segments: [
      [105.0, 116.5, "Number one. I found his number. It's 48461329.", '48461329'],
      [116.6, 128.5, 'Number two. My personal number is 0121 9510687.', '0121 9510687'],
      [130.4, 144.5, 'Number three. My phone number is 549… Oops, I mean 569 8301 247.', '569 8301 247'],
      [145.8, 161.5, "Number four. What's their phone number? Ah, here it is. It's 0412 159 07 43.", '0412 159 07 43'],
      [163.0, 176.0, 'Number five. You can get hold of me at 151 709 6010.', '151 709 6010'],
      [177.6, 187.0, 'Number six. My number is 8401 3590.', '8401 3590'],
      [188.5, 200.0, "Number seven. John's number is 0171 502993.", '0171 502993'],
      [202.4, 215.0, 'Number eight. You can request it at the following number. 02081963757.', '02081963757'],
      [216.8, 228.0, 'Number nine. Our home phone number is 525 4333.', '525 4333'],
      [229.7, 241.5, 'Number ten. Call us now at 01851 703 088.', '01851 703 088'],
      [243.4, 256.0, 'Number eleven. Their fax number is 0207 035 4745.', '0207 035 4745'],
      [257.9, 269.5, 'Number twelve. You can receive more information by calling 9182 7364.', '9182 7364'],
    ],
  },
  // ── Grammar (BBC Learning English) — same topics as essential-grammar.html
  ...[
    // Tenses
    ['VY5nh_-1phQ', 'grammar-present-perfect-past-simple', 'Present perfect or past simple? — 4 differences', 'B1', 0, 209.1,
      '\'I\'ve done\' or \'I did\'?', 'Ask BBC Learning English',
      '4 điểm khác nhau giữa hiện tại hoàn thành và quá khứ đơn: kết quả ở hiện tại, mốc thời gian đã kết thúc/chưa kết thúc, việc vẫn còn đúng đến nay, và trải nghiệm.'],
    ['pvoqkQHb3lo', 'grammar-present-perfect-continuous', 'Present perfect simple or continuous?', 'B2', 0, 162.1,
      'Present perfect simple or continuous?', 'Ask BBC Learning English',
      '"I\'ve chopped the onions" hay "I\'ve been chopping onions"? Năm điểm khác nhau: hoàn thành vs đang tiếp diễn, kết quả vs quá trình, bao nhiêu vs bao lâu, động từ chỉ trạng thái.'],
    ['8c20lS2t8f0', 'grammar-past-simple-past-perfect', 'Past simple or past perfect?', 'B1', 12.9, 154.1,
      'The past simple and past perfect tenses', 'English Learners\' Questions',
      'Dan giải đáp: "When was the last time you ate here?" — khi nào dùng quá khứ đơn, khi nào dùng quá khứ hoàn thành ("the film had already started").'],
    ['De_54szvmFM', 'grammar-future-will-going-to', 'Future plans: present continuous, going to or will?', 'B1', 12.3, 135.9,
      'Future tenses: present continuous, \'be going to\', \'will\'', 'English Learners\' Questions',
      'Câu chuyện ở sân bay: "I\'m flying to Spain" (đã có vé), "I\'m going to fly to Australia" (kế hoạch), "I will fly to Russia" (quyết định tức thời).'],
    ['MGLedoA3SSE', 'grammar-gameshow-past-continuous', 'The Grammar Gameshow: past continuous', 'B1', 52.3, 231.5,
      'The Past Continuous Tense', 'The Grammar Gameshow Episode 9',
      'Gameshow ngữ pháp vui nhộn: hai thí sinh "đấu" câu hỏi về thì quá khứ tiếp diễn — was/were + V-ing, "when" vs "while", hành động dài bị cắt ngang.'],
    ['GiI3wjFWSXQ', 'grammar-choose-the-right-tense', 'How to choose the correct tense — it\'s all about aspect', 'C1', 0.3, 210.9,
      'How to choose the correct tense in English', 'BBC English Masterclass',
      'Mọi thì trong tiếng Anh = thời gian + "aspect" (simple, continuous, perfect). Hiểu "tính cách" của từng aspect để chọn đúng thì.'],
    // Conditionals
    ['RGmKMInQZG8', 'grammar-zero-conditional', 'The zero conditional — facts, habits & rules', 'A2', 0, 191.1,
      'The zero conditional', 'Grammar: Conditionals with Georgie',
      'If + hiện tại đơn, hiện tại đơn: sự thật khoa học, thói quen cá nhân ("If I don\'t sleep well, I\'m grumpy") và quy định ("If you don\'t buy a ticket, you get a fine").'],
    ['kpDaqFQ1YCM', 'grammar-first-conditional', 'The first conditional — likely future situations', 'B1', 0.3, 153.5,
      'The first conditional', 'Grammar: Conditionals with Georgie',
      'If + hiện tại đơn, will + V: kế hoạch phụ thuộc thời tiết, tàu bị huỷ thì làm gì, và đưa ra dự đoán.'],
    ['0bHeJbPkAHA', 'grammar-second-conditional', 'The second conditional — imagine & give advice', 'B1', 0, 173.9,
      'The second conditional', 'Grammar: Conditionals with Georgie',
      'If + quá khứ đơn, would + V: trúng một triệu bảng, lạc trên đảo hoang, và lời khuyên "If I were you, I\'d…".'],
    ['pbm9IWNQmuM', 'grammar-third-conditional', 'The third conditional — a different past, regrets, blame', 'B2', 0, 204.0,
      'The third conditional', 'Grammar: Conditionals with Georgie',
      'If + quá khứ hoàn thành, would have + V3: tưởng tượng quá khứ khác đi, nói về tiếc nuối ("I wish I\'d…") và đổ lỗi ("If you\'d told me…").'],
    ['e7-qXZiesbc', 'grammar-mixed-conditional', 'Mixed conditional — past cause, present result', 'B2', 0, 148.8,
      'Mixed conditional 1', 'Grammar: Conditionals with Georgie',
      'If + quá khứ hoàn thành, would + V: việc trong quá khứ ảnh hưởng hiện tại — "If I\'d slept properly, I wouldn\'t be so tired now."'],
    // Directions
    ['SHXPpsIJTb0', 'grammar-asking-giving-directions', 'Asking for and giving directions', 'A2', 2.3, 144.8,
      'Asking for and giving directions', 'Easy English Conversations Episode 5',
      'Hỏi và chỉ đường đơn giản: "Where is the train station?" — go straight, go past the school, turn left/right, it\'s next to / opposite the park.'],
  ].map(([youtubeId, slug, title, level, clipStart, clipEnd, src, series, description]) => ({
    slug, youtubeId, title, sourceTitle: `${src} - ${series}`, channel: 'BBC Learning English',
    category: 'grammar', level, clipStart, clipEnd, description,
  })),
  // ── Grammar Shorts (2026-10-28): ~1-minute grammar tips, whole Short.
  // BBC's own grammar Shorts have no captions at all, so these come from
  // channels with en-orig auto captions; where those are unpunctuated (or
  // the ASR garbled a word), `transcript` gives the punctuated text.
  ...[
    ['xuSFg2La7b4', 'grammar-short-present-perfect-continuous', 'Present perfect continuous: "I\'ve been living here for 10 years"', 'B1', EPT,
      'Use the Present Perfect Continuous in IELTS',
      'have/has + been + V-ing cho việc bắt đầu trong quá khứ và vẫn còn đúng đến nay, thường đi với "for" và "since" — kèm câu trả lời IELTS Part 1 mẫu.'],
    ['rNwqHFgc648', 'grammar-short-articles', 'Articles: a, an, the or no article?', 'B1', EPT,
      'Don\'t make mistakes with Articles | IELTS Writing and Speaking',
      'Khi nào không dùng mạo từ (nói chung chung), khi nào dùng "the" (cụ thể, "the rich"), "a" hay "an" (âm phụ âm / nguyên âm) — ví dụ về chủ đề thi cử.',
      'Avoid these mistakes to improve your accuracy when speaking and in writing. Articles: a and the, and the zero article. Don\'t use an article when describing things in general. Exams put a lot of pressure on students. Use the when you\'re talking about something specific. The exams that students do in the final year of high school can shape their whole life. Use the with an adjective to describe groups. The rich are getting richer every year. Use a with words that start with a consonant sound. A large number of students study abroad every year. Use an with words that start with a vowel sound. Regular exams are an important feature of secondary school education.', { endAt: { 12: 46.2 } }],
    ['iaflvynbvvg', 'grammar-short-question-tags', 'Question tags: "It\'s a gorgeous day, isn\'t it?"', 'B1', 'English with Lucy',
      'How to use question tags in English',
      'Câu khẳng định → đuôi phủ định và ngược lại, trợ động từ phải khớp; ngữ điệu xuống (đã biết câu trả lời) vs lên (hỏi thật); "aren\'t I?", "will you?" sau câu mệnh lệnh và "innit".',
      'You need to learn how to use question tags in English. You\'re not sure how to use question tags, are you? See what I did there? Question tags are short phrases like \'are you\' that we add to the end of statements to make them into questions. If the statement is positive, use a negative question tag. It\'s a gorgeous day, isn\'t it? If the statement is negative, you guessed it, use a positive tag. You didn\'t forget the snacks, did you? The auxiliaries in the statements and questions match. Is, isn\'t. Didn\'t, did. Falling intonation means we already know the answer. You haven\'t told anyone, have you? I trust you. Rising intonation is more like a real question. You haven\'t told anyone, have you? I\'m panicking. But what tag would you use here? Shut the window. It\'s \'will you\' or \'would you\' after an imperative. How about here? I\'m invited. Aren\'t I? Not \'amn\'t I\'. English is wild, innit? Innit is a very popular question tag in the UK. It\'s casual. Okay, write a sentence using a question tag in the comments and let\'s see if you can get it right.'],
    ['untUvCSNfMo', 'grammar-short-uncountable-nouns', 'Furniture or furnitures? Uncountable nouns', 'A2', 'English with Lucy',
      'Is it furniture or furnitures?',
      'Furniture, luggage, baggage, equipment, research, accommodation — những danh từ không đếm được không bao giờ thêm "s". Và nhớ: "do research", không phải "make research".'],
    ['4WNeQqwRoXA', 'grammar-short-adjective-order', 'Adjective order: big blue sea, not blue big sea', 'B1', 'English with Lucy',
      'Is it BIG BLUE sea or BLUE BIG sea?',
      'Trật tự tính từ: opinion → size → age → shape → colour → origin → material → purpose. "A beautiful small old round brown Italian wooden cooking spoon".'],
    ['EbHOMSbmuXE', 'grammar-short-dependent-prepositions', 'Married to, proud of, good at — prepositions after words', 'A2', 'English with Lucy',
      'Is it \'married to\' or \'married with\'?',
      'Giới từ đi kèm động từ và tính từ: married to, proud of, interested in, good at, pay for, depend on, excited about, aware of, belong to, laugh at, listen to.',
      'You need to know these prepositions in English. I\'m going to go fast. Are you ready? Married to: I\'m married to Will. Proud of: I\'m so proud of you. Interested in: She\'s interested in baseball. Good or bad at: My dad\'s good at cooking. Pay for: I\'ll pay for dinner. Depend on: We might go for a picnic. It depends on the weather. Excited about: I\'m really excited about my trip to Japan. Wrong with: What\'s wrong with Pete? Aware of: Imogen\'s aware of the problem. Belong to: Who does this jacket belong to? Laugh at: Don\'t laugh at me. Listen to: Are you listening to me? Which of those prepositions do you use accurately? Let me know in the comments.'],
    ['_7RnQZ4yp_k', 'grammar-short-make-or-do', 'Make or do? Outcome vs action', 'A2', 'English with Lucy',
      'MAKE or DO - Which should you use?',
      '"Make" = tạo ra, chú ý vào kết quả (made the cake); "do" = thực hiện hành động (did the shopping, did a great job).',
      'Should you say make or do? What is the difference? To make is to create or prepare something. When we use make, we generally focus more on the outcome, or the product that has been made. She made her own wedding invitations. Do is to perform an action. However, when we use do in a noun or noun phrase, we focus more on the action rather than the outcome of the action. You did a great job last week. Think of do as the action, and make as the outcome. She did the shopping, but I made the cake.'],
    ['V6d8erAPL5w', 'grammar-short-in-or-on-transport', 'In or on a bus, train or taxi?', 'A2', 'English with Lucy',
      'IN or ON a train/bus/taxi? Use my easy trick to know every time!',
      'Mẹo nhớ mãi: đứng thẳng bước lên được thì dùng "on" (on a bus, a train, a plane); phải cúi người ngồi vào thì dùng "in" (in a car, a taxi, a helicopter).',
      'In a train or on a train? In a taxi or on a taxi? I will teach you how to know the correct answer every single time. If you can walk onto the vehicle standing up on your feet, then it\'s on. You get on a plane, you get on a train, you get on a bus, on a tram. If you have to crouch down and sit in the vehicle, if you have to make yourself smaller, you get in the vehicle. You get in a car, you get in a taxi, you get in a helicopter. You never have to think about it ever again. You are welcome.'],
    ['h2ZNCKp44R8', 'grammar-short-by-from-of', 'A book by, from or of someone?', 'B1', 'mmmEnglish',
      'BY FROM OF - what\'s the difference? English prepositions',
      'Một giới từ nhỏ đổi cả nghĩa câu: a book by James Clear (ông ấy viết), from James Clear (ông ấy tặng), of James Clear\'s (sách của ông ấy), a book of poetry (tập thơ).',
      'So let\'s go a little bit deeper into those moments where you need to choose between by, from and of. A book by James Clear is a book written by James Clear. He wrote this book. It\'s a book by him. But a book from James Clear is a book that James Clear gave me. So in this case, he is the starting point of the book. It\'s where it came from. But a book of James Clear\'s is a book that belongs to James Clear. Maybe he lent it to me because he wanted me to read it. A book of James Clear\'s is a book that belongs to him. A book of poetry, meaning this book is a collection of poetry, or it contains poetry. Do you see how changing something as small and insignificant as a little preposition can actually completely change the meaning of a sentence?'],
    ['1g4s3WTzwL4', 'grammar-short-because-alternatives', 'Advanced alternatives to "because"', 'B2', 'mmmEnglish',
      'Don\'t always use \'BECAUSE\' in English',
      'Thay "because" bằng thanks to, owing to the fact that, as a result of, given that, in light of — rất hữu ích cho IELTS Writing và Speaking.',
      'Because is a conjunction that connects two phrases, and it means \'for the reason that\'. I\'m wet because I got caught in the rain. But because is an extremely common English word. It\'s used all the time, and if you want to avoid repeating yourself, I\'ve got some advanced alternatives for you. Thanks to the rain, I\'m soaked. My shoes are wet owing to the fact that I stepped in a puddle. As a result of the downpour, my washing got soaked. Given that the forecast looks like rain, I\'ll go for my run tomorrow. In light of this atrocious weather, let\'s cancel our plans and stay home. Share a sentence using one of these new expressions down in the comments below.'],
    ['uU36YYstNLU', 'grammar-short-giving-advice', 'Giving advice: should, if I were you, why don\'t you…?', 'B1', 'mmmEnglish',
      'DOs & DON\'Ts for Giving Advice In English',
      'Tránh "you must", "we should" và câu mệnh lệnh; thay vào đó dùng câu điều kiện "If I were you, I would…", "You should try…", "Why don\'t you…?", "Have you ever thought about…?".'],
  ].map(([youtubeId, slug, title, level, channel, sourceTitle, description, transcript, opts]) => ({
    slug, youtubeId, title, sourceTitle, channel, category: 'grammar', level,
    clipStart: 0, clipEnd: 9999, useAutoText: true, description, ...(transcript && { transcript }), ...opts,
  })),
  // ── TED / TEDx Shorts (2026-10-15): ~1-minute talk excerpts, punctuated
  // auto captions. [youtubeId, slug, title, level, clipEnd, channel, sourceTitle, description]
  ...[
    ['_LhxnnltylA', 'ted-change-your-habits', 'How to actually change your habits', 'B2', 99, 'TEDx Talks',
      'How to actually change your habits',
      'Vì sao biết phải làm gì vẫn không đủ để thay đổi thói quen? Bí quyết nằm ở "identity" — bạn nghĩ mình là người thế nào.'],
    ['1xS116SvV60', 'ted-healthy-perfectionism', 'Can perfectionism ever be healthy?', 'B1', 99, 'TEDx Talks',
      'Can perfectionism ever be healthy?',
      'Cầu toàn "lành mạnh" và cầu toàn "có hại" khác nhau thế nào? Học cách "dial down" và thôi tự chỉ trích bản thân.'],
    ['r_lRaLhlvE0', 'ted-imposter-syndrome', 'Struggling with imposter syndrome?', 'B2', 99, 'TEDx Talks',
      'Struggling with imposter syndrome?',
      'Sợ nói sai trong lớp, sợ bị đánh giá — "stereotype threat" là gì, và lời khuyên thay đổi tất cả: chỉ so sánh bạn với chính bạn.'],
    ['6xngcgwuooM', 'ted-paper-towel', 'How to use ONE paper towel', 'B1', 99, 'TEDx Talks',
      'How to use a paper towel',
      'Bài nói vui nổi tiếng: lau tay chỉ cần MỘT tờ giấy — "Shake… fold"! Nghe và đếm theo diễn giả.'],
    ['Zx1xYXbFK90', 'ted-first-impression', 'How to make a good first impression', 'B2', 99, 'TEDx Talks',
      'How to make a good first impression',
      'Vài giây đầu gặp ai đó định hình cả sự nghiệp. Cách tạo ấn tượng tự nhiên: một lời khen bất ngờ, một câu chuyện để họ kể lại.'],
    ['gMIENROmamU', 'ted-increase-confidence', 'How to increase your confidence — 3, 2, 1, go!', 'B2', 99, 'TEDx Talks',
      'How to increase your confidence',
      'Muốn tự tin, hãy thay đổi hành động trước: đếm "3, 2, 1, go" rồi bước tới — câu chuyện cuộc nói chuyện khó xử trên sân bóng chày.'],
    ['YBN_xM7aqVg', 'ted-content-killed-creativity', 'How "creating content" killed my creativity', 'B2', 99, 'TEDx Talks',
      'How "creating content" killed my creativity',
      'Một YouTuber đăng video liên tục theo thuật toán… và kênh "chết". Khi thôi ám ảnh lượt xem, anh ấy lại thành công.'],
    ['NrARzmzUGds', 'ted-one-true-calling', 'Why you might not have one true calling', 'B2', 99, 'TEDx Talks',
      'Why you might not have one true calling',
      'Bạn thích nhiều thứ và chưa tìm được "đam mê duy nhất"? Không sao cả — bạn là một "multipotentialite".'],
    ['-OiCXpYQIWI', 'ted-introduce-yourself-hired', 'How to introduce yourself — and get hired', 'B2', 66, 'TEDx Talks',
      'How to introduce yourself—and get hired',
      'Giới thiệu bản thân trong 20 từ: "soundbite, not data dump". Đừng nói về bạn, hãy nói bạn làm được gì cho người nghe.'],
    ['huHi6D_MI7U', 'ted-decisions-poker', 'How to make decisions like a poker pro', 'C1', 99, 'TEDx Talks',
      'How to make decisions like a poker pro',
      'Thua một ván không có nghĩa là quyết định sai. Nghĩ theo xác suất thay vì tuyệt đối — bài học từ poker cho cuộc sống.'],
    ['fVEsPruv_Kc', 'ted-why-we-love-bluey', 'Why we love Bluey', 'B2', 99, 'TEDx Talks',
      'Why we love Bluey',
      'Vì sao phim hoạt hình Bluey được cả trẻ em lẫn bố mẹ yêu thích? Người lớn cũng mắc lỗi — và câu nói "You\'re doing great."'],
    ['twQB0A-QOgk', 'ted-actor-confidence', 'An actor\'s secret for confidence: the leader stance', 'B2', 99, 'TEDx Talks',
      'An actor\'s tips on confidence',
      'Bí quyết của diễn viên: "leader stance" — đứng thẳng, ánh mắt vững vàng, cử động chậm và chiếm không gian.'],
    ['-2Hb5ykxMUE', 'ted-kermit-creativity', 'Kermit the Frog talks creativity', 'B2', 99, 'TEDx Talks',
      'Kermit the Frog talks creativity',
      'Ếch Kermit (The Muppets) lên sân khấu TEDx nói về sáng tạo: "a conspiracy of craziness". Vui và dễ thương!'],
    ['N6O8b7U6Ti8', 'ted-move-every-hour', 'Move for 1 minute every hour — the challenge', 'B1', 99, 'TED',
      'Good news: Even moving as little as 1 minute every 60 minutes can have health benefits',
      'Ngồi cả ngày có hại thế nào? Nhóm TED thử thử thách vận động vài phút mỗi giờ — nghe họ chấm điểm "7 out of 10".'],
    ['DBhAROQM51E', 'ted-adult-friendships', 'Why do adult friendships feel so hard?', 'B1', 60.6, 'TED',
      'Is this why adult friendships feel so hard?',
      'Kết bạn khi lớn lên sao khó thế? Chuyên gia chia ra 3 lý do — và thử nghiệm vui: nhắn tin trước cho bạn bè (kèm ảnh bánh pudding).'],
    ['wMAtRRCKtbE', 'ted-learn-a-language', 'You don\'t need a special talent to learn a language', 'B1', 99, 'TED',
      'You don\'t need a special talent to learn a new language',
      'Một người học ngôn ngữ mới mỗi 2 năm chia sẻ bí quyết: phương pháp hiệu quả, hệ thống, và kiên nhẫn học từng chút mỗi ngày.'],
    ['BsqFxyU37HY', 'ted-read-books-yourself', 'If you want more people to read, read books yourself', 'B2', 120, 'TED',
      'If you want more people to read, read books yourself',
      'Muốn con đọc sách, hãy để con thấy bạn đọc sách. Tiểu thuyết dạy ta sự thấu cảm và giữ cho ta một "long format brain".'],
    ['dEBhiP1yZZY', 'ted-tell-me-about-yourself', '"Tell me about yourself" — 5 formulas in 20 words', 'B2', 140, 'TED',
      'No more panicking when someone says, "Tell me about yourself"',
      'Năm công thức giới thiệu bản thân dưới 20 từ: I help…, …without…, I\'m passionate about…, I\'m known for…, I\'m on a mission to…'],
    ['ix7zi1s2uD0', 'ted-better-conversations', 'Better conversations: stop waiting for your turn to speak', 'B2', 99, 'TED',
      'The secret to better conversations? Stop waiting for your turn to speak',
      'Nghe người khác như nghe một bài hát — đừng "hát bài khác trong đầu". Gật đầu, im lặng chủ động và đừng kéo chuyện về mình.'],
    ['UiiR5MwI2wI', 'ted-julian-treasure-rasa', 'Julian Treasure: RASA — listen better', 'B2', 99, 'TED',
      'Want to get better at listening (and speaking)? Try this trick from Julian Treasure',
      'RASA = Receive, Appreciate, Summarize, Ask: công cụ giúp cuộc trò chuyện trôi chảy, kèm ví dụ thực tế dùng từ "So…".'],
    ['ZmZkQ-YvM1g', 'ted-favourite-toy', 'What was your favourite toy growing up?', 'B2', 120, 'TED',
      'What was your favorite toy growing up?',
      'Barbie thay đổi theo từng thế hệ thế nào? Và đồ chơi yêu thích hồi nhỏ nói gì về con người bạn hôm nay. (Gợi ý cho Part 2!)'],
    ['Q-pnqCPpNFw', 'ted-reach-out-connect', 'Compliment a stranger — you do more good than you think', 'C1', 99, 'TED',
      'Compliment a stranger or reach out to a loved one. You may do more good than you think',
      'Ta thường ngại bắt chuyện, ngại cảm ơn, ngại hỏi han. Hơn 100 thí nghiệm cho thấy: kết nối với người khác tốt hơn ta tưởng.'],
    ['1LZX3l8TKl4', 'ted-lonelier-than-ever', 'More connected than ever — so why lonelier?', 'B2', 99, 'TED',
      'We\'re more connected than ever — so why are we lonelier than ever?',
      'Chỉ có bạn thân và người lạ, không có gì ở giữa? Vì sao xếp lịch mọi thứ khiến ta cô đơn hơn.'],
    ['DyHGGbmtmz8', 'ted-rats-drive-cars', 'I taught rats to drive cars', 'B2', 120, 'TED',
      '"I taught rats to drive cars, but they taught me to enjoy the ride"',
      'Nhà khoa học dạy chuột lái xe để lấy bánh Fruit Loops — và phát hiện chúng chọn "đi đường vòng cho vui". Rất thú vị!'],
    ['botYt9uElQs', 'ted-play-with-your-cat', 'Would your cat give you a good review?', 'B1', 99, 'TED',
      'Would your cat give you a paw-sitive review?',
      'Mèo thích kiểu chơi nào: "rabbit", "mouse" hay "moth"? Chỉ vài phút chơi mỗi ngày giúp mèo vui hơn và bớt săn mồi.'],
  ].map(([youtubeId, slug, title, level, clipEnd, channel, sourceTitle, description]) => ({
    slug, youtubeId, title, sourceTitle, channel, category: 'ted-shorts', level,
    clipStart: 0, clipEnd, description, useAutoText: true, dropFillers: true,
  })),
  // ── Stand-up comedy (2026-10-15): Max Amini crowd-work Shorts ───────
  // Hand-picked for a classroom: no profanity (YouTube's captions silently
  // drop bleeped words, so every clip was read in full), no sexual jokes.
  // Auto captions shout in CAPS — fixCaps normalises them.
  // [youtubeId, slug, title, level, clipEnd, description]
  ...[
    ['yBmkkGuqQWs', 'max-tall-and-single', 'Tall and single in Dubai', 'B1', 999,
      'Anh chàng cao 1m98 không nhớ mình có mấy anh chị em… và lý do vợ cũ bị đau cổ. Hỏi – đáp: How tall are you? How many brothers and sisters?'],
    ['vfUWWgLamJY', 'max-adopted-belgian', 'Adopted by Belgian parents at 30', 'B2', 999,
      'Hassan 30 tuổi được bố mẹ người Bỉ "nhận nuôi" — và vẫn chưa chịu dọn ra ở riêng. Nghe cách Max trêu khéo: move out, favorite kid.'],
    ['PUVqd-IA2gs', 'max-world-cup-debate', 'Spain vs Argentina: who wins the World Cup?', 'B2', 999,
      'Fan Tây Ban Nha và Argentina "đấu khẩu": a young team, great passes, more experience — rồi Max đưa ra câu trả lời ngoại giao.',
      { skip: [18] }], // 0.3 s — too short to play
    ['Jf_hukHUOCw', 'max-84-and-single', '84 years old and single!', 'B1', 999,
      'Cụ bà 84 tuổi vỗ tay hưởng ứng "Who\'s single?" — Age is just a number! Cụm hay: clap if you\'re single, good for you.'],
    ['TzjSlFyT-Ew', 'max-focused-german', 'The very focused German', 'B2', 999,
      'Khán giả người Đức tập trung đến mức… không cười: "I will laugh later." Max trêu anh ấy là gián điệp chính phủ.'],
    ['uAOuOlTpFtA', 'max-laugh-every-day', 'Find a reason to laugh every day', 'B1', 999,
      'Một khoảnh khắc ấm áp: Max cảm ơn khán giả đang điều trị bệnh vì vẫn tự tin đến xem hài — "find an excuse to laugh every single day".'],
    ['ieaUwoWJKpI', 'max-fbi-agent', 'The guy in the suit is… an FBI agent?!', 'B1', 999,
      'Max đùa anh chàng mặc vest trông như đặc vụ FBI — và anh ấy là đặc vụ thật! Từ vựng: underdressed, intimidating, show your badge.'],
    ['i6aJrtTktTE', 'max-nepal-traveller', 'She travelled all the way from Nepal', 'B1', 999,
      'Cô gái Nepal đi công tác khắp nơi nhưng vẫn bay đến xem Max diễn — "You must be the luckiest husband… your wife is never home!"'],
    ['oYjaixZWs9M', 'max-giant-hockey-player', 'The 6\'6" hockey player', 'B1', 999,
      'Anh chàng cao 1m98 chơi khúc côn cầu và "làm cho chính phủ"… Max đoán ngay: immigration! How tall are you? What do you do?'],
    ['x8h50InUtEc', 'max-new-step-dad', '"Make fun of my mom!"', 'B1', 999,
      'Cậu con trai muốn Max trêu mẹ mình — nhưng Max lại muốn… nhận cậu ấy làm con nuôi. Câu hỏi hay: Are you out of your mind?'],
    ['oGwveuxQlD0', 'max-worst-airline', 'They lost my suitcase — twice!', 'B1', 999,
      'Max bị hãng bay làm thất lạc vali hai lần — và người ngồi hàng đầu lại làm cho chính hãng đó! Từ vựng: lost my suitcase, customer service, sorry for the inconvenience.',
      { skip: [21, 22] }], // 0.3 s each — too short to play
    ['PYfUHDXf9k4', 'max-north-korean-boyfriend', 'A long-distance boyfriend in North Korea?', 'B2', 999,
      'Cô gái yêu xa một anh chàng "ở Triều Tiên"… hay Hàn Quốc? Max: "You fell for an internet scam, my love!" — long distance relationship.'],
    ['JRDuQf3RaMc', 'max-its-complicated', '"How long have you been together?" — It\'s complicated', 'B1', 999,
      'Hỏi một cặp đôi "Are you together?" và cả hai nhìn nhau ngại ngùng… "Complicated is the best comedy material!"'],
    ['S9u92ZrqXP4', 'max-louis-vuitton-couple', 'The Louis Vuitton couple', 'B2', 999,
      'Thắt lưng, giày, kính… tất cả đều Louis Vuitton — và vợ anh ấy cũng vậy! Max trêu cặp đôi "matching" cực vui.'],
    ['TMBIMgXJ6gI', 'max-grim-to-grin', 'He hasn\'t smiled once — until now', 'B1', 71,
      'Kevin bị vợ kéo đi xem hài và nhất quyết không cười… cho đến khi Max ra tay. "It\'s comedy, we\'re joking!"',
      { skip: [17] }], // "I'll show you who's the…" — a bleeped word
    ['1LdHUm7d3i0', 'max-single-one-week', 'Single for… one whole week', 'B1', 43.5,
      'Hỏi khán giả Toronto: "How long have you been single?" — "One week." Max: "You\'re such a player!"'],
    ['H8KxnRBQajQ', 'max-millionaire-match', 'They met on "Millionaire Match"', 'B1', 999,
      'Cặp đôi quen nhau trên ứng dụng hẹn hò… dành cho triệu phú! Cả khán phòng phản ứng thế nào? Từ vựng: dating app, fiancé.'],
    ['vvpDfWEcwgY', 'max-flew-from-japan', 'He flew from Japan to see the show', 'B1', 999,
      'Khán giả bay từ Nhật sang Ấn Độ xem Max diễn… trong khi tuần sau Max diễn ở Nhật! "I wasted all my money!"'],
    ['lCU2h4sK69w', 'max-magic-of-india', 'What I love about India', 'B1', 999,
      'Một đoạn ngắn tích cực: hơn 121 ngôn ngữ, nhiều tôn giáo, mọi người sống hòa thuận "under the same roof" — hợp làm ý cho Speaking Part 3.'],
    ['2ZoY_EILTgg', 'max-alaska-car-restorer', 'From Alaska: "I restore cars"', 'B1', 999,
      'Anh chàng từ Alaska đến San Diego vì… ấm áp. Nghề phục chế ô tô — vì ở Alaska xe vừa đến là đóng băng! Câu hỏi: What brought you to…?'],
    ['c_tNB3BlLn0', 'max-disaster-date', 'Setting up a date… that goes wrong', 'B1', 999,
      'Max mai mối chàng trai 19 tuổi với cô gái 18 tuổi ngay giữa buổi diễn — và bị từ chối phũ phàng. "You snooze, you lose!"'],
    ['RP87r569P6A', 'max-couple-fight', 'They had a fight on the way to the show', 'B1', 999,
      'Cặp đôi cãi nhau trên đường đến xem hài vì cô vợ khen Max "funny". Ai mới hài hơn? Cụm hay: it happens to the best of us.'],
    ['wzPN8ZJ-cHg', 'max-be-authentic', 'Being authentic is a superpower', 'B2', 999,
      'Không phải tiểu phẩm mà là lời chia sẻ của Max: vì sao sự chân thật (authenticity) giúp người khác kết nối với bạn — "being honest is a superpower".'],
    ['P5ZWXUEbq-w', 'max-star-and-moon', '"My name is Star." — "My name is Moon."', 'B1', 999,
      'Khán giả tên Star, Max tự xưng là Moon 😄 — rồi cô ấy mời Max diễn tuần sau ở một nơi mà… Max không hề diễn. "You don\'t even know who I am, do you?"'],
    ['7QlwYmkVXbI', 'max-volunteer-coordinator', 'The volunteer coordinator', 'B1', 999,
      'Nghề "điều phối tình nguyện viên" — được trả lương để quản lý những người làm không công! Max: "I bought two mansions by just volunteering."'],
    ['SqQaCpt2G6g', 'max-follow-your-dreams', '"What do you want to do when you grow up?"', 'A2', 999,
      'Cậu bé 18 tuổi bị bố ép học kỹ sư nhưng không giỏi toán, không giỏi đại số… Max khuyên: "You should become a comedian!"'],
    ['bO4lBQjtErs', 'max-lottery-prank', 'Pranking the boss with fake lottery tickets', 'A2', 999,
      'Nhân viên tặng Max vé số giả — "I won $50,000!" — và Max tin thật. Câu ngắn, dễ nhại: How much did I win? Are you pranking me?'],
    ['KmZDtGxAG-s', 'max-swiss-road-trip', 'She drove from Switzerland to see the show', 'B1', 999,
      'Khán giả lái xe từ Thụy Sĩ đến xem diễn. Max định trả tiền xăng — nhưng cô ấy đi xe Tesla! "So I owe you nothing!"'],
    ['hyvjnSS5IOI', 'max-tax-advice', 'Tax advice from the IRS', 'B1', 999,
      'Khán giả làm ở Sở Thuế Mỹ (IRS) — Max xin "mẹo" tránh thuế và nhận được lời khuyên đơn giản nhất: "Pay your taxes."'],
    ['a5_FWW3MERk', 'max-tajikistan-pride', 'Two fans from Tajikistan', 'B1', 46.4,
      'Hai khán giả đến từ Tajikistan bất ngờ gặp nhau trong khán phòng! Max đùa: "I came with my horse." — "What colour is your horse?"'],
    ['rjZZrTQgLZ8', 'max-taekwondo-champion', 'Meeting a Taekwondo world champion', 'B1', 72,
      'Nhà vô địch Taekwondo thế giới Kimia Alizadeh ngồi ngay hàng ghế khán giả — "the most dangerous person in the audience to roast"!'],
  ].map(([youtubeId, slug, title, level, clipEnd, description, extra]) => ({
    slug, youtubeId, title, sourceTitle: `${title} — Max Amini Stand-up Comedy`, channel: 'Max Amini', category: 'comedy', level,
    clipStart: 0, clipEnd, description, useAutoText: true, dropFillers: true, fixCaps: true, minWords: 3, ...extra,
  })),
  // ── Speaking Part 2 & 3 (2026-10-15) ────────────────────────────────
  // Full Band 9 mock tests (IELTS Advantage, Keith) cut into their Part 2
  // talk and Part 3 discussions; English Pro Tips' Part 3 methods video.
  // [youtubeId, slug, title, category, level, clipStart, clipEnd, channel, sourceTitle, description]
  ...[
    ['gdzrv2N40II', 'adv-part2-did-something-in-a-hurry', 'Part 2: A time you had to do something in a hurry', 'ielts-part2', 'C1', 342, 437.4, 'IELTS Advantage',
      'Shadow This Band 9 IELTS Speaking Test (Word for Word)',
      'Bài Part 2 Band 9: dọn nhà sang nước khác chỉ trong một tuần — pack my whole life into two suitcases, last minute, anxiety-inducing, a team effort.'],
    ['ZITN5qjA2Kk', 'adv-part2-something-for-home', 'Part 2: Something you bought for your home', 'ielts-part2', 'B2', 350.8, 446.7, 'IELTS Advantage',
      'This Student Made Band 9 Speaking Look Easy',
      'Kệ sách mua online trở thành "thư viện mini": I was a bit hesitant, it turned out to be…, it brings me a lot of joy, gives an insight into my personality.'],
    ['YWqU_QwCYCQ', 'adv-part2-website-bought-from', 'Part 2: A website you bought something from', 'ielts-part2', 'C1', 376.4, 466.5, 'IELTS Advantage',
      'IELTS Speaking Test- Perfect Band 9',
      'Mua giường cho chó trên Etsy: customizable, small businesses, stay-at-home moms, needless to say… — câu trả lời Band 9 rất tự nhiên.'],
    ['A53fe3e0PcE', 'keith-part2-foreign-food', 'Part 2: A foreign food you have tried and liked', 'ielts-part2', 'C1', 325.9, 478.5, KEITH,
      'IELTS Speaking test Band 8.5 (with feedback)',
      'Bài thi thật với Keith: đề "describe a kind of foreign food you have had and liked" — nghe cả lời giám khảo giao đề và bài nói 2 phút.'],
    ['gDkpbrFS7VU', 'keith-part2-family-business', 'Part 2: A family-run business', 'ielts-part2', 'B2', 0, 125, KEITH,
      'IELTS Speaking Sample Answer Part 2 - A Family Run Business',
      'Bài mẫu của Keith về nhà hàng của anh họ: a family-run business, a saturated market, a niche, on a shoestring budget, word of mouth, it\'s taken off.'],
    ['XHbxia6PUpE', 'ept-part2-special-day-cheap', 'Part 2: A special day that didn\'t cost much — before & after', 'ielts-part2', 'B1', 0, 140, EPT,
      'Do this in IELTS part 2',
      'Câu trả lời "and then… and then…" chỉ được 20 giây — và cách sửa: kể thành câu chuyện, lập sơ đồ ý, nói về tương lai khi hết ý. Nghe lại bài mẫu sau khi sửa.'],
    ['vWiGOKI6tJM', 'ept-part2-beautiful-city-almaty', 'Part 2: A beautiful place — my hometown Almaty', 'ielts-part2', 'C1', 365.8, 522, EPT,
      'Best IELTS Speaking Test?',
      'Bài Part 2 xuất sắc về Almaty (Kazakhstan): picturesque scenery, multifaceted, cloud-piercing skyscrapers, a vintage feel, lush meadows, breathtaking.'],
    ['vWiGOKI6tJM', 'ept-part3-tall-buildings', 'Part 3: Why do modern cities have tall buildings?', 'ielts-part3', 'C1', 520.4, 671, EPT,
      'Best IELTS Speaking Test?',
      'Vì sao thành phố hiện đại nhiều nhà cao tầng? Có phải mọi thành phố đều giống nhau? Thành phố tương lai sẽ ra sao? — a double-edged sword.'],
    ['vWiGOKI6tJM', 'ept-part3-city-vs-countryside', 'Part 3: City or countryside — which is better?', 'ielts-part3', 'C1', 669.9, 852.8, EPT,
      'Best IELTS Speaking Test?',
      'Chất lượng sống ở thành phố và nông thôn, người thành phố có xa rời thiên nhiên không, đô thị hóa ảnh hưởng thế nào — climb the corporate ladder, lose touch with nature.'],
    ['LE_F9u-DYe0', 'ept-part3-band9-beauty-success', 'Part 3: Beauty, youth and success — Band 9', 'ielts-part3', 'C2', 621.2, 763.5, EPT,
      'Incredible Band 9 Speaking Test (she\'s only 17!)',
      'Vì sao người ta đánh đồng cái đẹp với tuổi trẻ? Ngoại hình có ảnh hưởng đến thành công không? — evolution, the media, conventionally beautiful, counterparts.'],
    ['gdzrv2N40II', 'adv-part3-arriving-late', 'Part 3: Is it acceptable to arrive late?', 'ielts-part3', 'C1', 437.5, 539.9, 'IELTS Advantage',
      'Shadow This Band 9 IELTS Speaking Test (Word for Word)',
      'Part 3 Band 9 về quản lý thời gian: đến muộn khi gặp bạn bè, đi làm muộn có nên bị phạt — unforeseen circumstances, time is money, reprimand.'],
    ['gdzrv2N40II', 'adv-part3-study-time', 'Part 3: Long study sessions or short chunks?', 'ielts-part3', 'C1', 539.9, 624.7, 'IELTS Advantage',
      'Shadow This Band 9 IELTS Speaking Test (Word for Word)',
      'Học liền mạch hay chia nhỏ? Có nên kết hợp giải trí với học tập? — short-form media, motivation, go hand in hand.'],
    ['ZITN5qjA2Kk', 'adv-part3-creating-a-nice-home', 'Part 3: Why do people buy lots of things for their home?', 'ielts-part3', 'B2', 446.6, 590.3, 'IELTS Advantage',
      'This Student Made Band 9 Speaking Look Easy',
      'Vì sao có người thích mua sắm đồ trang trí nhà, có người lại không quan tâm nhà trông thế nào? Trả lời bằng cảm xúc và ví dụ thật.'],
    ['ZITN5qjA2Kk', 'adv-part3-apartment-or-house', 'Part 3: Apartment or house? Homes in the future', 'ielts-part3', 'B2', 590.3, 701.5, 'IELTS Advantage',
      'This Student Made Band 9 Speaking Look Easy',
      'Sống chung cư hay nhà riêng tốt hơn? Nhà ở sẽ thay đổi thế nào trong tương lai? — it depends where you\'re located, I would lean more towards…'],
    ['Ayuy4zGnfkQ', 'adv-part3-monuments-architecture', 'Part 3: Monuments, statues & architecture', 'ielts-part3', 'B2', 357.9, 501.6, 'IELTS Advantage',
      'IELTS Speaking Test- Perfect Band 9.0',
      'Vì sao có nhiều tượng người nổi tiếng? Có nên bảo tồn mọi công trình cổ? Kiến trúc ảnh hưởng tâm trạng ra sao? — chủ đề rất hay gặp.'],
    ['YWqU_QwCYCQ', 'adv-part3-shopping-online', 'Part 3: Shopping online in your country', 'ielts-part3', 'C1', 466.4, 614.9, 'IELTS Advantage',
      'IELTS Speaking Test- Perfect Band 9',
      'Người dân nước bạn mua gì online? Ưu – nhược điểm của mua sắm trực tuyến — câu trả lời Band 9 có ví dụ cụ thể và so sánh.'],
    ['YWqU_QwCYCQ', 'adv-part3-future-of-shops', 'Part 3: Will shopping malls survive? Online-only businesses', 'ielts-part3', 'C1', 614.9, 782.2, 'IELTS Advantage',
      'IELTS Speaking Test- Perfect Band 9',
      'Có công bằng không khi mua tại cửa hàng đắt hơn online? Trung tâm thương mại còn phổ biến? Ngân hàng, đại lý du lịch sẽ chỉ còn online?'],
    ['A53fe3e0PcE', 'keith-part3-eating-habits', 'Part 3: Eating habits — phones at the table', 'ielts-part3', 'C1', 478.5, 628.6, KEITH,
      'IELTS Speaking test Band 8.5 (with feedback)',
      'Thói quen ăn uống ở nước bạn, dùng điện thoại trong bữa ăn, trò chuyện với gia đình khi ăn — thí sinh Band 8.5+ trả lời cùng Keith.'],
    ['A53fe3e0PcE', 'keith-part3-healthy-diets', 'Part 3: Healthy diets — why don\'t people eat well?', 'ielts-part3', 'C1', 628.6, 807.7, KEITH,
      'IELTS Speaking test Band 8.5 (with feedback)',
      'Thế nào là chế độ ăn lành mạnh? Vì sao nhiều người không ăn uống lành mạnh? Chính phủ nên làm gì? — strike a balance, on several levels.'],
    ['4Fspx4fXFQM', 'ept-part3-hedging', 'Part 3: Hedging — sound less absolute', 'ielts-part3', 'C1', 195.8, 426.6, EPT,
      '5 Methods to Develop Answers in IELTS Part 3',
      'Kỹ thuật "hedging" của band 7+: tend to, may/might, many people believe, often — kèm câu trả lời mẫu về làm việc nhóm, mạng xã hội, chính phủ và ăn uống.'],
    ['4Fspx4fXFQM', 'ept-part3-multiple-perspectives', 'Part 3: The multiple perspectives method', 'ielts-part3', 'C1', 426.6, 607.1, EPT,
      '5 Methods to Develop Answers in IELTS Part 3',
      'Nhìn vấn đề từ 2–3 góc độ: from an employee\'s perspective, from an employer\'s point of view… — mẫu về làm việc từ xa, lương vs sự hài lòng, thế hệ và môi trường.'],
    ['4Fspx4fXFQM', 'ept-part3-rule-of-two', 'Part 3: The rule of two', 'ielts-part3', 'C1', 607.1, 780.6, EPT,
      '5 Methods to Develop Answers in IELTS Part 3',
      'Chỉ cần hai lý do được phát triển tốt: There are two main reasons… Firstly… Secondly… — mẫu về sống ở thành phố, du lịch, làm việc tại nhà.'],
    ['4Fspx4fXFQM', 'ept-part3-it-depends', 'Part 3: The two most useful words — "It depends"', 'ielts-part3', 'C1', 780.6, 997.9, EPT,
      '5 Methods to Develop Answers in IELTS Part 3',
      '"It depends" + giải thích phụ thuộc vào điều gì: đi du lịch một mình hay cùng người khác, trẻ lớn lên ở thành phố hay nông thôn, đại học miễn phí.',
      { skip: [9, 10, 11, 12, 13, 14] }], // on-screen template phrases, read with gaps
  ].map(([youtubeId, slug, title, category, level, clipStart, clipEnd, channel, sourceTitle, description, extra]) => ({
    slug, youtubeId, title, sourceTitle, channel, category, level,
    clipStart, clipEnd, description, useAutoText: true, dropFillers: true, ...extra,
  })),
  // ── Speaking Part 1 (2026-10-15): +8 shorts ─────────────────────────
  ...[
    ['XmE08wV3h9U', 'ept-part1-daily-routine-band7', 'Part 1: Daily routine — Band 5/6 vs Band 7+ vocabulary', 'B1', 0, 86, EPT,
      'Band 5/6 vs. Band 7+ Vocabulary for talking about your Daily Routine in IELTS',
      'Mỗi câu nói hai lần: bản Band 5/6 rồi bản Band 7+ — at the crack of dawn, head to work, squeeze in a walk, wrap things up, doze off, potter around.'],
    ['-dEWcWZ_6s4', 'ept-part1-first-minute', 'Part 1: The first minute — walking in & your name', 'B1', 14, 123, EPT,
      'How to introduce yourself in IELTS Speaking',
      'Phút đầu tiên trong phòng thi: không bắt tay giám khảo, nói tên, "You can call me…", đưa giấy tờ tùy thân — và câu hỏi đầu tiên "Do you work or are you a student?"'],
    ['RoWFGJnIy2E', 'keith-part1-where-from', 'Part 1: "Where are you from?" — from simple to better', 'A2', 0, 43.1, KEITH,
      'Where are you from?',
      'Cùng một câu hỏi, bốn câu trả lời hay dần: I\'m from England → I grew up in… → I was born and bred in…, where I\'ve been living for…'],
    ['MREF14eyZ5A', 'keith-part1-closest-family', 'Part 1: Who are you closest to in your family?', 'B1', 0, 88.8, KEITH,
      'Who are you closest to in your family?',
      'Ba cụm làm "khung" câu trả lời: I would say the person I\'m closest to is…, mainly because he\'s…, whenever we get together, we just hit it off.'],
    ['D2ThgRJmv0c', 'keith-part1-free-time', 'Part 1: Free time — 3 phrases for any hobby', 'B1', 0, 79.6, KEITH,
      'Free time Part 1 Answer',
      'Ba cụm dùng được cho mọi sở thích: One thing I love doing is…, I find it helps me unwind, I try to make time for this whenever I can.'],
    ['92xspbQVqXU', 'keith-part1-friends', 'Part 1: Friends — "we go way back"', 'B1', 0, 44.1, KEITH,
      'IELTS Speaking Part 1 Topic Friends',
      'Câu trả lời đơn giản mà tự nhiên về bạn bè: I get on well with…, we go way back, we have a good laugh / a good chat.'],
    ['8tNUGeOQIU4', 'keith-part1-your-subject', 'Part 1: "Do you like your subject?"', 'B1', 0, 57.5, KEITH,
      'Do you like your subject?',
      'Chủ đề học tập: I love it to bits, it\'s just so fascinating, I\'ve been interested in it since I was a teenager, useful for my future career.'],
    ['ghX_B2ThCi0', 'keith-part1-favourite-animal', 'Part 1: What\'s your favourite animal?', 'A2', 0, 48.9, KEITH,
      'What\'s your favourite animal?',
      'Từ "I like dogs" đến "I reckon I like dogs the best… they\'re a big responsibility… they keep me company." — nâng cấp từng bước.'],
  ].map(([youtubeId, slug, title, level, clipStart, clipEnd, channel, sourceTitle, description]) => ({
    slug, youtubeId, title, sourceTitle, channel, category: 'ielts-part1', level,
    clipStart, clipEnd, description, useAutoText: true, dropFillers: true,
  })),
  // ── Everyday English (2026-10-15) ──────────────────────────────────
  // BBC Easy English Conversations (A2): one clean stretch of dialogue per
  // episode, skipping the quiz pauses and "click here" asides.
  ...[
    ['on_1sS6Ii8M', 'everyday-hometown', 'What is there in your town?', 10, 93.6, 'How to talk about your home town: Easy English Conversations Episode 3',
      'Hỏi – đáp về thành phố của bạn: "What is there in Brighton?" — "There\'s a beach… There are lots of shops." Is there…? No, there isn\'t.'],
    ['bq6GBbh3uhU', 'everyday-daily-routine', 'What do you do every day?', 118.5, 207.8, 'How to talk about your daily routine: Easy English Conversations Episode 4',
      'Kể thói quen hằng ngày bằng thì hiện tại đơn: I wake up, I have a shower, I walk to work, I go to sleep.'],
    ['sMg4vj6ugSs', 'everyday-weather', 'How\'s the weather?', 10.3, 101, 'Describing the weather where you are: Easy English Conversations Episode 8',
      'Gọi điện cho bạn bè khắp thế giới: "Where are you? What are you doing? How\'s the weather?" — It\'s hot and sunny / raining / snowing.'],
    ['gCs4knrlnD4', 'everyday-habits', 'How often do you…? Talking about habits', 126.8, 220.9, 'Talk about your habits with Easy English Conversations Episode 12',
      'Trạng từ tần suất: always, usually, often, sometimes, occasionally, hardly ever, never — Georgie và Tim kể thói quen của mình.'],
    ['kTf0V4HyFtM', 'everyday-last-weekend', 'What did you do at the weekend?', 10.4, 138, 'Talk about what you did last weekend: Easy English Conversations Episode 13',
      'Kể về cuối tuần bằng thì quá khứ đơn: I went hiking, I made a cake, I had an ice cream — và Tim không được ăn bánh!'],
    ['v9EU41cuhHY', 'everyday-family', 'Who\'s in your family?', 10.3, 113.8, 'How to describe your family: Easy English Conversations Episode 15',
      'Giới thiệu gia đình qua cây phả hệ: my parents, grandparents, aunt and uncle, niece and nephew, older/younger brother.'],
    ['2mnL9jPVzsk', 'everyday-clothes-shopping', 'Clothes shopping: "Do you have this in a smaller size?"', 243.2, 353.9, 'Talking about clothes shopping: Easy English Conversations Episode 19',
      'Mua quần áo: How do these shoes look? They\'re a bit big. Do you have them in a smaller size / in black? I\'ll take them.'],
    ['Te-UyphkKRk', 'everyday-home-furniture', 'What do I need in my new home?', 90.2, 200.3, 'Describing your home: Easy English Conversations Episode 20',
      'Georgie có nhà mới nhưng trống trơn! Từ vựng đồ đạc: bed, lamp, wardrobe, drawers, fridge, cupboards, oven, microwave.'],
    ['osDr7To4Ml4', 'everyday-personality', 'What\'s your friend like?', 95.2, 174.4, 'How to talk about personality in English! Easy English Conversations Episode 16',
      'Tả tính cách: grumpy, brave, talkative, quiet, hardworking, lazy — và cách nói từ trái nghĩa "the opposite of…".'],
  ].map(([youtubeId, slug, title, clipStart, clipEnd, sourceTitle, description]) => ({
    slug, youtubeId, title, sourceTitle, channel: 'BBC Learning English', category: 'everyday-english',
    level: 'A2', clipStart, clipEnd, description, minWords: 4,
  })),
  // BBC Real Easy English (B1): two presenters chatting naturally — the
  // first ~2.5 minutes of the conversation, after the intro.
  ...[
    ['BFJsSnEEGrI', 'everyday-coffee', 'How do you take your coffee?', 52, 225.2, 'How do you take your coffee? Real Easy English',
      'Neil và Georgie trò chuyện về cà phê: take your coffee black/white, decaf, caffeine, cut down on — rất tự nhiên.'],
    ['_5x_h23rXWE', 'everyday-lunch', 'Talking about lunch', 29.2, 196.7, 'Talking about lunch: Real Easy English',
      'Trưa nay ăn gì? leftovers, skip lunch, hangry (đói + cáu), brunch, working lunch, I\'d rather…'],
    ['bVRIpmjTSxM', 'everyday-restaurants', 'Talking about restaurants', 25.9, 188.2, 'Talking about restaurants: Real Easy English',
      'Bạn có hay đi nhà hàng không? Gọi món, đặt bàn, nhà hàng yêu thích — hội thoại đời thường của Neil và Georgie.'],
    ['lrTRNbC3BDQ', 'everyday-weekend-plans', 'Talking about weekend plans', 26, 182.9, 'Talking about weekend plans: Real Easy English',
      'Cuối tuần này bạn định làm gì? Cách nói kế hoạch: I\'m going to…, I\'m planning to…, nothing special.'],
    ['Fxi4uYmCrPo', 'everyday-public-transport', 'Talking about public transport', 27.7, 186, 'Talking about public transport: Real Easy English',
      'Đi làm bằng gì? Tàu, xe buýt, đi bộ — chuyện trễ tàu, đông người và commute hằng ngày.'],
    ['sJ7sRSK2in4', 'everyday-routines', 'Talking about routines', 25.9, 177.3, 'Talking about routines: Real Easy English',
      'Một ngày của bạn thế nào? Buổi sáng, đi làm, buổi tối — từ vựng thói quen hằng ngày trong hội thoại thật.'],
    ['0UIcwcYrPek', 'everyday-pets', 'Talking about pets', 26, 178, 'Talking about pets: Real Easy English',
      'Bạn thích chó hay mèo? Neil và Georgie kể về thú cưng — rất hợp cho Speaking Part 1 chủ đề animals/pets.'],
  ].map(([youtubeId, slug, title, clipStart, clipEnd, sourceTitle, description]) => ({
    slug, youtubeId, title, sourceTitle, channel: 'BBC Learning English', category: 'everyday-english',
    level: 'B1', clipStart, clipEnd, description,
  })),
  // Keith's everyday-English shorts.
  ...[
    ['lFARSxVyDdc', 'everyday-keith-well', 'Phrases natives use every day: "Well…"', 0, 61, 'Phrases Native Speakers Use Everyday - Part 1',
      '"Well…" — từ người bản xứ dùng mỗi ngày để có thời gian suy nghĩ và làm câu trả lời nhẹ nhàng hơn. Ví dụ vui: "Do you like my new dress?"'],
    ['rsF8AqPm6IU', 'everyday-keith-actually', 'Phrases natives use every day: "Actually…"', 0, 66.3, 'Phrases Native Speakers Use Everyday! - Part 2',
      '"Actually" để sửa lời người khác ("Actually, I live in Spain") hoặc thêm một sự thật bất ngờ — chú ý ngữ điệu xuống-lên.'],
    ['z-usNyco4h0', 'everyday-keith-right', 'Phrases natives use every day: "Right…"', 0, 83.4, 'Phrases Native Speakers Use Everyday! - Part 3',
      '"Right" rất "British": thể hiện đã hiểu, chuyển sang việc khác ("Right. Let\'s go.") và ngạc nhiên nhẹ ("Oh, right.").'],
    ['FXk51v150Vc', 'everyday-keith-late-for-meeting', 'Late for a meeting — what do you say to your boss?', 0, 34, 'What would you say to an angry boss?',
      'Đến muộn và sếp hỏi "What time do you call this?" — cách xin lỗi: I got caught in traffic, something urgent came up, this won\'t happen again.'],
    ['VN7KLN-vOhw', 'everyday-keith-dinner-gift', 'A friend brings you a gift — what do you say?', 0, 32, 'Friend comes round for dinner',
      'Bạn đến ăn tối và tặng quà: "Oh, you shouldn\'t have!", "You needn\'t have bothered", "That\'s so kind" — nói cảm ơn tự nhiên như người bản xứ.'],
  ].map(([youtubeId, slug, title, clipStart, clipEnd, sourceTitle, description]) => ({
    slug, youtubeId, title, sourceTitle, channel: KEITH, category: 'everyday-english',
    level: 'B1', clipStart, clipEnd, description, useAutoText: true, dropFillers: true,
  })),
  // ── Jimmy English Home (2026-10-15): Speaking Part 1 ────────────────
  // Hand-timed: the older videos' auto captions have no punctuation, and the
  // Band 5→8 Shorts read a "Band five…" label before each answer. Text is the
  // punctuated transcript (labels, "Model two", slow re-readings and Vietnamese
  // asides left out); timings come from the auto captions' per-word times.
  {
    slug: 'jimmy-part1-accommodation', youtubeId: 'TYlhePoe_Y0',
    title: 'Part 1: Home & accommodation — house or flat?',
    sourceTitle: 'IELTS SPEAKING PART 1 - HOME/ACCOMMODATION', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Chủ đề Accommodation hay gặp ngay đầu bài thi: house or flat, nhà trông thế nào, nhìn ra cửa sổ thấy gì, có định ở lâu không — rented room, three-storey terraced house, airy and spacious, cramped, up in the air.',
    segments: [
      [37.5, 40.5, "Do you live in a house or a flat?"],
      [41.4, 44.8, "Currently, I'm living in a rented room in Go Vap District."],
      [44.8, 48.5, "It's on the second floor of a three-storey building."],
      [49.5, 53.2, "Currently, I'm living in a three-storey terraced house in Phu Nhuan District."],
      [56.4, 62.4, "Currently, I'm living on the 20th floor of a block of flats in District 10."],
      [63.0, 65.0, "What does it look like?"],
      [65.9, 72.6, "Oh, it's pretty nice. It's not so big, but it has enough space for me and my roommates to move around comfortably."],
      [72.6, 77.8, "However, sometimes when we have guests, it can be a little cramped."],
      [79.1, 85.1, "Oh, it's quite airy and spacious. I live with my family and each of us has our own room."],
      [85.1, 93.5, "It also has a small garden at the front where I can grow some potted plants and flowers to add some greenery to my house."],
      [94.6, 102.6, "Oh, it's fairly spacious but a bit old. My parents bought it many years ago and I've been living there since I was born."],
      [102.6, 110.2, "Hopefully, in the future, I can earn more money in order to have it rebuilt, or at least have it redecorated."],
      [110.8, 114.8, "What can you see when you look out the window of your room?"],
      [115.4, 117.0, "Nothing much, to be honest."],
      [117.0, 127.5, "I live in a populated area, so all I can see out of my window is just long lines of houses stretching for miles, which is kind of boring to me."],
      [127.5, 132.9, "I prefer a view of nature, such as the park view or the ocean view."],
      [133.9, 141.7, "Unfortunately, my room doesn't have any windows. Sometimes I wish it had one so that I could enjoy the view out of it."],
      [142.8, 154.3, "My room's window overlooks a river, a bridge and many tall buildings, so the view from there is wonderful, especially in the evening when the city lights are lit up."],
      [154.3, 158.2, "I think I can look at it all day without getting bored."],
      [158.4, 161.5, "Do you plan to live there for a long time?"],
      [162.2, 171.0, "Well, I'm not sure yet. On the one hand, I love my parents and I want to stay with them so that I can take care of them in case they get sick."],
      [171.0, 176.7, "On the other hand, I'd like to move out and live on my own so that I can have more privacy."],
      [176.7, 180.9, "My final decision is still up in the air at the moment."],
      [182.6, 190.8, "No, not really. I don't really like my current accommodation and I can't picture myself living there for the next one or two years."],
      [190.8, 198.2, "As soon as my rental agreement expires, I'll pack my bags and move out right away."],
      [199.1, 209.4, "Yeah, I guess so. I love almost everything about my current apartment, so there's no good reason for me to change my accommodation in the not-too-distant future."],
      [209.4, 214.8, "I think I'll continue living there for the next four or five years at least."],
      [215.8, 227.4, "No, I don't think so. I don't want to live with my parents, so perhaps in the future I'll move to another place to live, especially after I graduate and get a job."],
    ],
  },
  {
    slug: 'jimmy-part1-area-you-live', youtubeId: 'H7Mf2pDyVT0',
    title: 'Part 1: The area you live in — do you like it?',
    sourceTitle: 'THE AREA YOU LIVE IN - Bài mẫu IELTS Speaking Part 1', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Bạn có thích khu mình sống không, hay đi đâu ở đó? Hai hướng trả lời: close to the city center, an ideal place to reside — hoặc a complicated area, robberies, my rental agreement expires.',
    segments: [
      [69.6, 73.4, "Do you like the area that you live in?"],
      [102.8, 105.9, "Yeah, I really enjoy living in my current neighborhood."],
      [105.9, 113.4, "It's close to the city center, so it's quite convenient for different activities, whether it's work or entertainment."],
      [113.4, 120.4, "Also, the people there are pretty warm and friendly, making it an ideal place to reside."],
      [189.7, 198.2, "No, not really. It's quite a complicated area, with people coming from different regions, religions and working classes."],
      [198.2, 203.7, "On top of that, robberies often take place and my neighbors are not so friendly."],
      [203.7, 210.0, "To tell you the truth, I'm thinking of moving to another place after my rental agreement expires."],
      [261.6, 265.0, "Where do you like to go in that area?"],
      [273.4, 280.7, "Probably the park. It has lots of green trees and open spaces, so it's suitable for a wide range of activities."],
      [280.7, 289.4, "I can do some exercise, play sports or simply take a stroll around the place to relax after long hours of studying or working."],
      [289.4, 295.8, "Also, there are many people who go there, making it a good spot for socializing."],
      [359.9, 366.3, "Probably the mall. It's a huge dining and shopping complex, making it a fun place to visit."],
      [366.3, 371.9, "In fact, I usually head there on weekends with my friends or family to unwind."],
      [371.9, 381.2, "We can walk around, take pictures and then enjoy some food and drinks from the food court sections, which is great."],
    ],
  },
  {
    slug: 'jimmy-part1-neighbours', youtubeId: 'H7Mf2pDyVT0',
    title: 'Part 1: The area you live in — do you know your neighbours?',
    sourceTitle: 'THE AREA YOU LIVE IN - Bài mẫu IELTS Speaking Part 1', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Hàng xóm có thân thiện không? greet me with a warm smile, keep their doors shut, let alone talk to them, cold and distant, kind and approachable.',
    segments: [
      [662.0, 665.0, "Do you know any of your neighbors?"],
      [672.0, 679.9, "Yeah, I know many of them. In fact, most people in my neighborhood are quite friendly and easy to talk to, so I get along well with them."],
      [679.9, 688.9, "They usually greet me with a warm smile on their face whenever they see me and invite me to their homes for parties if they hold one."],
      [721.5, 724.2, "Yeah, but only those who live next to my house."],
      [724.2, 729.1, "I'm currently living in Ho Chi Minh City and the people here are quite busy with their work."],
      [729.1, 736.5, "Also, when they get home, they usually keep their door shut, making it hard to talk to them."],
      [782.3, 793.7, "I have to say no. I'm quite busy with my studies or work and I spend most of my time at school or my company, so I don't see them often, let alone talk to them."],
      [816.7, 820.6, "Are the people in your neighborhood nice and friendly?"],
      [828.5, 834.7, "Yeah, I can say most of them are. They usually greet me with a bright smile whenever they see me."],
      [834.7, 841.0, "Sometimes they even bring me vegetables or fruits that they have grown, or invite me to their parties."],
      [841.0, 848.7, "In fact, it's one of the things that I love most about my neighborhood: almost everyone is kind and approachable."],
      [919.5, 924.8, "Sadly, no. Most of them are cold and distant, and some are even mean to others."],
      [924.8, 929.0, "They usually keep their doors shut and rarely go out to socialize."],
      [929.0, 935.7, "In fact, it's one of the things that I don't like about my neighborhood. My neighbors are kind of unfriendly."],
    ],
  },
  {
    slug: 'jimmy-part1-student-or-work', youtubeId: 'R2ICa9K-8No',
    title: 'Part 1: Work or study? — university student (Band 5 → 8)',
    sourceTitle: 'Are you a student or do you work? Samples band 5-6-7-8', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Câu hỏi đầu tiên của bài thi, trả lời ở 4 mức Band 5 → 8 cho sinh viên năm 3: I\'m majoring in…, the curriculum can be quite demanding, practical knowledge I can apply in the real world.',
    segments: [
      [0.0, 2.4, "Are you a student or do you work?"],
      [2.9, 8.4, "I'm a student. I study business at university. I'm in my third year now."],
      [8.4, 12.0, "I'm currently a third-year student at a university in Ho Chi Minh City."],
      [12.0, 19.3, "My major is business administration and I learn about different fields like marketing, HR or finance."],
      [20.1, 26.4, "Well, I'm currently a third-year student majoring in business administration at a private university in Ho Chi Minh City."],
      [26.4, 31.0, "I'm learning about different fields like marketing, finance, and even management."],
      [31.0, 37.6, "The study program can be a bit challenging sometimes, but overall, I think it's really useful and practical."],
      [38.1, 44.2, "I'm currently in my third year studying business administration at a private university in Ho Chi Minh City."],
      [44.2, 49.5, "So far, I've covered a wide range of subjects like marketing, finance, and management."],
      [49.5, 58.9, "Although the curriculum can be quite demanding at times, I find it really rewarding because it gives me practical knowledge I can apply in the real world."],
    ],
  },
  {
    slug: 'jimmy-part1-high-school-student', youtubeId: 'i7zq2_B60a0',
    title: 'Part 1: Work or study? — high school student (Band 5 → 8)',
    sourceTitle: 'Are you a student or do you work? Samples band 5-6-7-8 for high school students', channel: JIMMY,
    category: 'ielts-part1', level: 'A2',
    description: 'Phiên bản cho học sinh lớp 11: an 11th grader, university entrance exams, if all goes as planned, pursue something related to business — câu trả lời dài và hay dần qua từng band.',
    segments: [
      [0.0, 2.4, "Are you a student or do you work?"],
      [2.6, 8.6, "I'm a student in high school. I study in grade 11. I will go to university next year."],
      [9.0, 13.0, "I'm an 11th grade student at a private high school in Ho Chi Minh City."],
      [13.0, 19.5, "It's a bit stressful now because we are preparing for exams. I hope I can go to university next year."],
      [20.1, 24.3, "I'm currently an 11th grader at a private high school in Ho Chi Minh City."],
      [24.3, 29.5, "It's quite a busy year because we're starting to prepare for university entrance exams."],
      [29.5, 33.6, "If everything goes well, I'll go to university next year."],
      [33.9, 37.9, "I'm currently an 11th grader at a private high school in Ho Chi Minh City."],
      [37.9, 43.5, "It's a pretty demanding year since we have just begun preparing for university entrance exams."],
      [43.5, 51.1, "Hopefully, if all goes as planned, I'll start university next year and pursue something related to business or economics."],
    ],
  },
  {
    slug: 'jimmy-part1-work-realtor', youtubeId: 'QkKsrrOxtT8',
    title: 'Part 1: Work or study? — people who work (Band 5 → 8)',
    sourceTitle: 'Are you a student or do you work? Samples band 5-6-7-8 for workers', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Phiên bản cho người đi làm (môi giới bất động sản): I work as a realtor, my role mainly involves…, a competitive field, connect with people from different backgrounds.',
    segments: [
      [0.0, 2.6, "Are you a student or do you work?"],
      [2.7, 6.6, "I work. I sell houses. I work for a company."],
      [6.9, 13.5, "I work as a realtor. I help people buy and sell houses. I work for a real estate company in the city."],
      [14.0, 18.0, "I'm working as a realtor for a real estate company in Ho Chi Minh City."],
      [18.0, 22.5, "My job involves helping clients find homes or sell their properties."],
      [22.5, 26.2, "It's a competitive field, but I find it really interesting."],
      [26.5, 31.2, "I currently work as a realtor at a real estate company based in Ho Chi Minh City."],
      [31.2, 37.5, "My role mainly involves guiding clients through the process of buying, selling, or renting properties."],
      [37.5, 43.5, "It can be quite demanding at times, but I enjoy the chance to connect with people from different backgrounds."],
    ],
  },
  {
    slug: 'jimmy-part1-childhood-things', youtubeId: 'ODKLDrxWnso',
    title: 'Part 1: Have you kept things from your childhood? (Band 5 → 8)',
    sourceTitle: 'Have you kept a lot of things from your childhood? Samples band 5-6-7-8', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Đồ vật thời thơ ấu: remote control car, teddy bear, handmade cards — they bring back special memories, evoke a deep sense of nostalgia, they\'re priceless to me.',
    segments: [
      [0.2, 3.0, "Have you kept a lot of things from your childhood?"],
      [3.4, 8.6, "Yes, I still keep some toys and books at home. They make me happy when I see them."],
      [9.0, 14.1, "Yeah, I have kept a few things from my childhood, such as photo albums and some old toys."],
      [14.1, 18.8, "I don't play with them anymore, but I still keep them in my closet."],
      [19.2, 27.1, "Yeah, I have. I still keep a few meaningful things like a remote control car, some storybooks, and even an old school notebook."],
      [27.1, 33.7, "They're not just random items. They bring back special memories and help me feel connected to my childhood."],
      [34.1, 44.6, "Absolutely. I've kept a small collection of childhood items, including my favorite teddy bear, some handmade cards from friends, and a few drawings I made in kindergarten."],
      [44.6, 54.5, "Every time I look at them, they evoke a deep sense of nostalgia and remind me of how simple and joyful life used to be. They're priceless to me."],
    ],
  },
  {
    slug: 'jimmy-part1-wear-a-watch', youtubeId: 'z0PD7ZVIS2k',
    title: 'Part 1: Do you usually wear a watch? (Band 5 → 8)',
    sourceTitle: 'Do you usually wear a watch now? Samples band 5-6-7-8', channel: JIMMY,
    category: 'ielts-part1', level: 'A2',
    description: 'Từ "I don\'t wear a watch now" đến "ever since I started using a smartphone, I\'ve gotten used to…" — luyện used to / get used to qua 4 mức band.',
    segments: [
      [0.1, 2.9, "Do you usually wear a watch now?"],
      [3.4, 9.3, "No, I don't wear a watch now. I just use my phone to check the time. It's easier."],
      [9.7, 15.9, "No, not really. I used to wear a watch when I was in school, but now I just use my phone to see the time."],
      [15.9, 19.2, "It's easier and more convenient for me."],
      [19.8, 22.7, "To be honest, I don't really wear a watch these days."],
      [22.7, 29.8, "I used to wear one a lot when I was in high school, but after I got a smartphone, I started checking the time on that instead."],
      [29.8, 33.2, "It's just more convenient and quicker for me now."],
      [33.7, 36.4, "To be honest, I don't really wear a watch anymore."],
      [36.4, 45.1, "I used to wear one all the time back in high school, but ever since I started using a smartphone, I've gotten used to checking the time on that instead."],
      [45.1, 48.2, "It just feels quicker and more convenient."],
    ],
  },
  {
    slug: 'jimmy-part1-study-morning-afternoon', youtubeId: 'dkxmMx24gFM',
    title: 'Part 1: Study in the morning or the afternoon? (Band 5 → 8)',
    sourceTitle: 'IELTS SPEAKING PART 1 Samples band 5-8: Do you prefer to study in the morning or in the afternoon?', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Học buổi sáng hay buổi chiều? my mind is clearer, most alert and productive, lose focus, feel a bit sluggish, leave lighter tasks for later.',
    segments: [
      [0.0, 3.4, "Do you prefer to study in the morning or in the afternoon?"],
      [3.9, 9.0, "I like to study in the morning. I feel fresh. In the afternoon, I feel sleepy."],
      [9.4, 13.2, "I prefer studying in the morning because my mind is clearer."],
      [13.2, 17.9, "In the afternoon, I usually feel tired and can't focus well."],
      [17.9, 22.8, "I usually prefer to study in the morning. That's when I feel most alert and productive."],
      [22.8, 26.5, "In the afternoon, I tend to lose focus more easily."],
      [26.9, 34.7, "I definitely prefer studying in the mornings, especially right after breakfast when my energy level is high and my mind is sharp."],
      [34.7, 41.9, "In the afternoons, I often feel a bit sluggish, so I try to leave lighter tasks for later in the day."],
    ],
  },
  {
    slug: 'jimmy-part1-favourite-thing-at-home', youtubeId: '6g83sr0zWJs',
    title: 'Part 1: What do you like most in your home? (Band 5 → 8)',
    sourceTitle: 'What\'s the thing you like the most in your home? Band 5-6-7-8', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Món đồ yêu thích nhất trong nhà: chiếc giường! soft and comfy, a lie-down, browsing social media, getting lost in a good book — cùng một ý, nói hay dần qua từng band.',
    segments: [
      [0.0, 2.7, "What's the thing you like the most in your home?"],
      [3.1, 7.5, "The thing I like the most in my home is my bed. It's soft and comfortable."],
      [7.5, 10.5, "I usually use it to sleep or go online."],
      [11.0, 16.3, "I like my bed the most at home. It's soft and comfortable, so I feel good when I lie on it."],
      [16.3, 23.1, "I usually use it to sleep, watch movies, or surf the internet on my phone. It's very relaxing."],
      [23.7, 27.1, "Well, the favorite item in my home is definitely my bed."],
      [27.1, 37.2, "It's really soft and comfy, which makes it great for a lie-down or doing some relaxing activities such as browsing social media, watching movies, or reading books."],
      [37.7, 45.1, "Off the top of my head, I'd say it's my bed. It's spacious and has a soft mattress that provides excellent comfort."],
      [45.1, 57.4, "That's why it's perfect not only for a lie-down, but also for recreational activities like scrolling through social media, streaming my favorite movies or TV shows, or getting lost in a good book."],
    ],
  },
  {
    slug: 'jimmy-part1-swimming', youtubeId: 'drGASYVl_nk',
    title: 'Part 1: Do you like swimming? (Band 5 → 8)',
    sourceTitle: 'Do you like swimming? Band 5-6-7-8', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Bơi lội: stay fit, unwind after long hours of studying, a swimming enthusiast, "Not only does it help me stay in shape…" — có cả đảo ngữ ở Band 8.',
    segments: [
      [0.3, 2.4, "Do you like swimming?"],
      [2.9, 10.0, "Yes, I like swimming. I often go swimming with my friends on weekends. Swimming is good for my health."],
      [10.6, 16.3, "Yes, I really like swimming. I often swim with my friends on weekends at a pool near my home."],
      [16.3, 20.8, "It helps me stay fit and relax after long hours of studying."],
      [21.5, 29.9, "Yeah, I'm a fan of swimming, to be honest. I usually swim about once a week, mostly with my friends on weekends at a pool near my home."],
      [29.9, 36.4, "It not only helps me stay fit, but it's also a great way to unwind after long hours of studying."],
      [36.8, 41.5, "Yeah, I'm a swimming enthusiast. To be honest, for me, it's great exercise."],
      [41.5, 49.6, "Not only does it help me stay in shape and improve my fitness, but it's also an effective way to clear my mind after long study sessions."],
      [49.6, 55.3, "In fact, I usually go for a swim with my friends about once a week on weekends."],
    ],
  },
  {
    slug: 'jimmy-part1-barbecue', youtubeId: 'SROohUbFzo8',
    title: 'Part 1: Barbecue',
    sourceTitle: 'IELTS SPEAKING PART 1 MODEL ANSWERS - BARBECUE', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Người Việt có thích đồ nướng không? packed with customers, book a table in advance, makes my mouth water, healthy appetites — mỗi câu hỏi có 2–3 câu trả lời mẫu.',
    segments: [
      [27.9, 30.7, "Do Vietnamese people like barbecue?"],
      [31.0, 36.1, "Yeah, I guess so. We have a lot of barbecue places all across the country,"],
      [36.1, 41.5, "and they are often packed with customers, especially in the evening or on weekends."],
      [41.5, 46.8, "Sometimes, if you want to get a table, you even have to book it in advance."],
      [46.9, 50.3, "What kind of food do you like to eat for barbecue?"],
      [51.6, 59.3, "Well, I don't know about other people, but I really love to eat grilled seafood, especially octopuses and shrimps."],
      [59.3, 61.2, "They are so tasty to me."],
      [61.2, 64.9, "Well, just speaking of it already makes my mouth water."],
      [67.1, 72.0, "All types of meat, to be honest, be it pork, beef, or chicken."],
      [72.0, 78.9, "I love them all. I don't really have a favorite, because for me, everything tastes better when it's barbecued."],
      [80.9, 82.5, "Nothing, to be honest."],
      [82.5, 86.8, "Unlike many people out there, I'm not really a big fan of barbecue food."],
      [86.8, 92.0, "It usually takes a long time to be well cooked, while I hate to wait when I'm hungry."],
      [92.0, 95.2, "Also, it doesn't look so healthy to me."],
      [95.2, 98.5, "Would you like to have barbecue with your family or your friends?"],
      [99.1, 101.6, "I would say I prefer to have it with my friends."],
      [101.6, 104.8, "It seems more fun and more comfortable to me."],
      [104.8, 109.9, "We can eat as much food as we want, because all of us have healthy appetites."],
      [109.9, 115.1, "On top of that, I tend to have more stories to catch up on when I'm with them."],
      [116.0, 119.1, "I guess I prefer to have it with my family members."],
      [119.1, 126.9, "I can eat as much food as I want without worrying much about money because my parents are usually the ones who pay."],
      [126.9, 133.5, "Besides, it's also a great way to spend some quality time with those who I love the most."],
      [133.5, 136.8, "Did you have barbecue when you were a child?"],
      [137.3, 140.3, "No, not pretty often to be honest."],
      [140.3, 144.9, "When I was a kid, having a barbecue wasn't as popular as it is now."],
      [144.9, 151.6, "Instead of eating food cooked over the fire, I usually went for some hot pot or stir-fry."],
      [151.7, 158.0, "I didn't have to wait for a long time to enjoy my food, which was a real blessing to me back then."],
      [158.8, 160.5, "Yeah, every now and then."],
      [160.5, 163.3, "My mother is a huge fan of barbecue."],
      [163.3, 169.0, "So, when I was a little boy, I got to eat grilled food from time to time."],
      [169.0, 174.8, "I guess that has unexpectedly aroused my interest in this kind of food."],
    ],
  },
  {
    slug: 'jimmy-part1-new-year', youtubeId: '6ttNYGDjowk',
    title: 'Part 1: New Year — how do you celebrate it?',
    sourceTitle: 'IELTS SPEAKING PART 1 - NEW YEAR', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Tết của bạn: go back to my parents\' home, exchange greetings, cook banh chung, a change of scenery, kill my boredom — và vì sao năm mới là một khởi đầu mới.',
    segments: [
      [23.7, 26.3, "How do you celebrate New Year?"],
      [28.3, 35.9, "Well, if you're referring to Vietnamese New Year, I usually go back to my parents' home and spend some quality time with them."],
      [35.9, 41.1, "Together, we clean up our house and redecorate it to welcome a new year."],
      [41.1, 47.0, "We also pay a visit to our relatives and exchange greetings with each other."],
      [48.6, 53.6, "Well, most of the time, I stay home and spend some quality time with my parents."],
      [53.6, 58.3, "We usually do a lot of eating and drinking during this time of the year."],
      [58.3, 66.4, "Sometimes I also go away, or simply go out with friends for coffee to unwind after a busy year."],
      [66.4, 70.0, "Do you still remember a New Year that you celebrated?"],
      [70.9, 73.7, "Yeah, it was the 2020 celebration."],
      [73.7, 79.4, "Due to the recent pandemic, I couldn't go to different places as I did in the previous years."],
      [79.4, 86.0, "So it was kind of boring. I spent most of the time staying at home and watching TV to kill my boredom."],
      [89.2, 100.1, "Yeah, it was back in 2016. Instead of staying home like we usually do every year, my family decided to spend a few days away for a change of scenery."],
      [100.1, 106.9, "We had a wonderful time together and it was a pretty memorable New Year's celebration to me."],
      [106.9, 111.9, "Do you have any ceremonies to celebrate a new year in your country?"],
      [111.9, 120.8, "Yes, my family and I usually get around a big pot to cook banh chung, which is a savory sticky rice cake with mung beans and pork."],
      [120.8, 129.7, "It's a really fun and meaningful activity for me because it allows me to have some bonding time with people who mean the most to me."],
      [129.9, 133.4, "Why do people think New Year is a new beginning?"],
      [133.4, 139.3, "Well, I don't know about other countries, but in Vietnam, we have a pretty long holiday to celebrate the New Year."],
      [139.3, 148.6, "So it enables us to have plenty of time to reflect on what we have done in the previous year and make plans for a new year to come."],
      [148.6, 154.2, "The change in the year number itself also signals a new start."],
    ],
  },
  {
    slug: 'jimmy-part1-special-costumes', youtubeId: '-Hz6lnE8Kzs',
    title: 'Part 1: Special costumes',
    sourceTitle: 'IELTS SPEAKING PART 1 MODEL ANSWERS - SPECIAL COSTUMES', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Hóa trang: Naruto, Goku, Power Rangers, Joker — dress up as, have a whale of a time, I\'m not really one for costumes, reduce stress. Mỗi câu hỏi có 2–3 cách trả lời.',
    segments: [
      [37.0, 40.0, "Do you like to wear special costumes?"],
      [41.0, 49.7, "Well, not too much now, but when I was a kid, I was really into some cartoon character costumes like Naruto or Goku."],
      [49.7, 55.3, "I usually asked my mom to buy this costume for me whenever I saw one."],
      [56.3, 61.4, "No, not really, partly because I find these costumes a bit too hard to wear."],
      [61.4, 65.1, "Why? I'm the kind of person who gets sweaty quite easily."],
      [65.1, 71.4, "With the scorching weather in Ho Chi Minh City, it would be a real nightmare to have them on for many hours."],
      [71.4, 78.2, "I guess I prefer watching other people in costume instead of me doing it."],
      [78.9, 81.3, "Yeah, I love it an awful lot."],
      [81.3, 89.4, "Every year on Halloween, I always have plans to dress up as some of my favorite characters in comic books or in movies."],
      [89.4, 94.4, "It's really fun and it's a great way to unwind and reduce stress."],
      [94.4, 98.7, "Did you try any special costumes when you were young?"],
      [99.1, 106.7, "I did. I remember one time when I was at the street market with my mom, I saw a pretty cool Power Rangers costume."],
      [106.7, 113.4, "I asked my mom to buy it for me and she did. I can't tell you how happy I was when I put it on."],
      [113.4, 117.0, "Just speaking of it brings back so many great memories."],
      [118.7, 126.1, "Yeah, a lot, actually. When I was a little girl, my parents usually bought me different special costumes."],
      [126.1, 130.8, "They took loads of photos of me in such costumes and then put them in an album."],
      [130.8, 137.8, "And every now and then, we take a look back at those photos and have a great time reminiscing about the past."],
      [139.2, 148.5, "No, I didn't. Unlike many kids in my neighborhood who were into wearing a special costume to go out, I wasn't really interested in it."],
      [148.5, 153.4, "My parents did buy me some costumes back then, but I never put them on."],
      [153.4, 157.0, "When was your last time wearing special costumes?"],
      [158.0, 162.2, "Well, if I'm not mistaken, it was almost 6 years ago."],
      [162.2, 169.1, "At the time, I was still a second-year student at university and I took part in a prom night."],
      [169.1, 177.1, "I dressed up as Joker, who is my favorite character in DC Comics, and I had a whale of a time that night."],
      [178.0, 187.9, "If memory serves, it was almost two years ago. At the time, I took part in a Halloween party at my company and I dressed up as a black witch."],
      [187.9, 190.7, "I had a lot of fun that day with my colleagues."],
      [190.7, 196.3, "Too bad I couldn't do so last Halloween due to the COVID-19 pandemic."],
      [196.3, 202.0, "And with everything going on now, I don't think I can do that again this Halloween either."],
      [203.7, 211.5, "As we previously discussed, I'm not really one for costumes, so I can't recall the last time I had one on."],
      [211.5, 215.9, "As a matter of fact, I don't think I have ever done that before."],
      [216.3, 219.5, "Do you ever buy special costumes?"],
      [220.6, 228.9, "Yeah, but mostly when I was a little boy. Now I rarely shop for one because I think I'm a little too old for that."],
      [228.9, 234.2, "That said, one day when I have kids, I'll definitely buy one for them."],
      [235.9, 242.6, "Yeah, almost every year, especially on special occasions like Halloween or Christmas."],
      [242.6, 248.3, "I love the idea of dressing up as someone I admire and then trying to be them for a day."],
      [248.3, 256.3, "It's such a wonderful way to relax and reduce stress after some tiring days at school."],
      [257.6, 262.7, "No, I don't think I ever do so. It's my parents who did that when I was a child."],
      [262.7, 270.5, "But as soon as they realized I wasn't really crazy about the whole costume thing, they stopped doing that for good."],
    ],
  },
  {
    slug: 'jimmy-part1-cooking', youtubeId: '9CgHTS5NS5o',
    title: 'Part 1: Cooking & baking — Jimmy and Jenny',
    sourceTitle: 'IELTS SPEAKING PART 1 MODEL ANSWERS - COOKING', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Hội thoại hai người: Jenny mê nấu nướng, Jimmy thì không. culinary skills, my favorite pastime, every once in a while, it does wonders for our health, gravitate towards home-cooked meals.',
    segments: [
      [17.9, 21.2, "Hey Jenny, did you learn to cook when you were a child?"],
      [21.2, 26.7, "Yeah, my mom is a really good cook and she taught me how to cook when I was just a little girl."],
      [26.7, 35.3, "At first, I didn't expect to enjoy doing it, but it turned out to be really fun and interesting making tasty dishes for other people."],
      [35.3, 42.1, "I don't want to brag, but my culinary skills are quite good. How about you, Jimmy?"],
      [42.7, 52.2, "Well, I must confess that cooking has never been my favorite pastime, so when I was a kid, I didn't care much about it."],
      [52.2, 62.8, "My younger sister was really passionate about it and she usually spent time in the kitchen preparing meals with my mother, but I wasn't interested at all."],
      [62.8, 66.4, "Okay, second question. Do you often bake?"],
      [66.4, 70.0, "Yeah, I really love baking. I have an oven at home."],
      [70.0, 78.6, "And every once in a while, especially on weekends, I spend around one to two hours baking some desserts for my family."],
      [78.6, 83.4, "I usually go online to look for some baking recipes and then try them."],
      [83.4, 89.4, "Sometimes it works, sometimes it doesn't, but it brings me a lot of joy. And you?"],
      [89.4, 94.4, "Well, you may find it hard to believe, but never have I baked anything before."],
      [94.4, 100.5, "As I said earlier, I'm not a fan of cooking and I don't have an oven at home either."],
      [100.5, 110.0, "Besides, based on my observation, baking is not really a popular cooking technique in Vietnam, especially for home cooking."],
      [110.0, 114.9, "The third question. What kind of things are baked in your country?"],
      [115.0, 122.6, "Well, I guess just like other parts of the world, the Vietnamese usually bake bread or desserts."],
      [122.6, 127.7, "Sometimes you may see people bake chicken or pork, but it's kind of uncommon."],
      [127.7, 138.6, "For things like meat, fish or vegetables, we prefer using other cooking techniques such as stir-frying, simmering or grilling."],
      [141.5, 147.0, "All right, fourth question. Do you think baking is a healthy method of cooking?"],
      [147.0, 158.2, "Well, as a person who is really passionate about cooking and spends a lot of time reading articles about cooking techniques, I can say that baking is one of the healthiest cooking methods."],
      [158.2, 167.0, "Scientifically speaking, it requires little or no added oil, so it does wonders for our health. What do you think?"],
      [167.0, 172.8, "Well, just to be clear, I'm not a culinary expert, so I'm not quite sure about this."],
      [172.8, 184.4, "But I remember reading an article on the internet and it said that baking is considered one of the healthiest ways of cooking. So I think, yeah, it is."],
      [185.0, 190.9, "Okay, last question. Do you prefer eating home-cooked meals or eating out?"],
      [190.9, 195.9, "In fact, I love both of them, but I tend to gravitate towards home-cooked meals."],
      [195.9, 206.3, "It is mainly because for me, homemade dishes are usually cheaper, safer and healthier than street foods or even foods in a restaurant."],
      [206.3, 213.3, "When you eat at home, you don't need to worry about things like food hygiene or food poisoning."],
      [213.7, 219.6, "How about you? Well, I don't cook, so I enjoy going out to eat more."],
      [219.8, 230.2, "I can save lots of time on preparing the food or cooking, and I also don't have to do the dishes afterwards, which is a wonderful thing to me."],
    ],
  },
  {
    slug: 'jimmy-part1-insects', youtubeId: 'r20EGqVFheU',
    title: 'Part 1: Insects — love them or hate them?',
    sourceTitle: 'IELTS SPEAKING PART 1 MODEL ANSWERS - INSECTS', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Một người mê côn trùng, một người sợ: put me in awe, gives me goosebumps, an abundance of insects, fireflies lighting up the night, pollinate flowers.',
    segments: [
      [25.9, 30.0, "Okay, first question. How do you like insects?"],
      [30.0, 36.4, "Believe it or not, I love them an awful lot. In fact, I'm into all creatures on the planet."],
      [36.4, 42.1, "I've watched a lot of documentaries about insects and their wonderful features always put me in awe."],
      [42.2, 47.5, "And you, Jimmy? Well, I don't like most insects, to be honest."],
      [47.5, 54.7, "For me, they are terrible creatures. They look ugly and scary. Some of them are really dirty and smelly."],
      [54.7, 58.5, "Just the thought of touching them already gives me goosebumps."],
      [58.5, 64.5, "Insects like bees or mosquitoes can sting you and make you hurt or itchy."],
      [64.8, 69.1, "Okay, second question. Are there many different insects where you live?"],
      [69.1, 73.5, "Well, I come from the countryside, so there's an abundance of insects there."],
      [73.5, 79.9, "During the day, you can see different species of butterflies flying around, and they're beautifully colorful."],
      [79.9, 87.4, "At night, you can hear the buzzing sound of cicadas and watch the fireflies lighting up the night."],
      [87.4, 95.9, "And you, Jimmy? Well, I live in Ho Chi Minh, which is a big city, so I don't have a lot of time to see different types of insects."],
      [95.9, 104.2, "The most common ones that I encounter are probably mosquitoes or cockroaches because they usually appear in my house."],
      [104.2, 111.8, "Sometimes when I go out, I also see some flying insects like dragonflies or butterflies."],
      [111.8, 115.1, "All right, last question. Do you think insects are useful?"],
      [115.1, 122.2, "Yeah, for sure. I believe that every creature plays an important role in our lives and the ecosystem."],
      [122.2, 128.0, "For example, bees help pollinate flowers and provide humans with honey."],
      [128.0, 133.9, "For other species, at least they can be a part of the food chain. What do you think?"],
      [133.9, 144.8, "Well, to tell you the truth, I'm not really interested in insects or animals in general, so to my knowledge, I'm not sure if they are useful or not."],
      [144.8, 150.4, "The only benefit that I can think of right now is we can make honey from honeybees."],
    ],
  },
  {
    slug: 'jimmy-part1-farming', youtubeId: '2fKsMzfOOiA',
    title: 'Part 1: Farming',
    sourceTitle: 'IELTS SPEAKING PART 1 - FARMING', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Bạn đã đến nông trại chưa? a cacao farm in Dalat, livestock, the backbone of the economy, born and raised in a rural area, food additives.',
    segments: [
      [31.4, 33.9, "Have you ever visited a farm?"],
      [35.7, 43.9, "Yeah, I have. Fortunately, a few years ago, I went on a trip with my family to Dalat and we paid a visit to a cacao farm."],
      [43.9, 51.2, "We got a chance to learn about the process of making cocoa and were offered a hot cup of cocoa right on site."],
      [51.2, 53.9, "It was a really wonderful experience."],
      [56.0, 61.0, "Well, you may find it hard to believe, but I've never been on a farm before."],
      [61.0, 65.8, "I've spent my entire life living in the city and I rarely travel to a new place."],
      [65.8, 71.5, "So I absolutely have no idea what a farm looks like in reality."],
      [71.5, 74.3, "What kind of farm do you like?"],
      [74.7, 81.7, "I think I prefer a mixed farm where I can see different types of livestock, cattle and crops altogether."],
      [93.4, 97.4, "Well, just the thought of it already makes me feel so excited."],
      [99.4, 107.2, "Well, as we previously discussed, I've never set foot in any farms before, so it's kind of hard to say which one I like."],
      [107.2, 119.3, "But if I were to choose one, it would be a fruit farm, simply because I love fruit and I think it would be great if I could eat some fresh fruit straight from the farm."],
      [120.2, 122.9, "What can you do on a farm?"],
      [123.5, 131.4, "I guess there are plenty of things to do. If you visit a fruit farm, you can water the trees or pick the fruit."],
      [131.4, 142.0, "If you are on a livestock farm, you can collect the eggs, milk the cows or simply feed the animals there."],
      [142.0, 144.7, "Do you think farming is important?"],
      [144.7, 150.7, "Yeah, no doubt about that. It provides food and jobs for people all over the world."],
      [150.7, 155.5, "Almost everything we eat on a daily basis is related to farming."],
      [155.6, 163.5, "For an agriculture-based country where farming is like the backbone of the economy, it's even more important."],
      [164.0, 167.4, "Did you do farm work when you were young?"],
      [167.4, 175.0, "Well, believe it or not, even though I was born and raised in a rural area, I didn't have to do any farm work when I was a child."],
      [175.0, 178.3, "It's my mother who had to do it when she was young."],
      [178.3, 186.8, "After she gave birth to me, my family no longer had a farm, so I've never had a chance to experience the life of a farmer."],
      [187.9, 195.1, "No, not at all. I was born and raised in a big city, so I didn't have to do anything related to farming when I was younger."],
      [195.1, 200.9, "It's OK for me, I guess, because I'm not really interested in farm work anyway."],
      [201.1, 204.0, "Are there any farms in your hometown?"],
      [205.4, 212.7, "My hometown has witnessed drastic changes over the past few years, so there are not so many farms left now."],
      [212.7, 219.4, "You can still see a few farms there, but most of them are family-run and are quite small."],
      [221.4, 225.9, "Yeah, I come from the countryside, so there are loads of farms there."],
      [225.9, 235.3, "I remember when I was a kid, sometimes after school, I would go to the green field with my friends to play some traditional outdoor games."],
      [237.0, 241.2, "Well, just speaking of it brings back so many great memories."],
      [241.7, 245.2, "Do you care much about the process of making food?"],
      [245.2, 252.6, "Yeah, I really do, especially in this day and age where food chemicals and food additives are widely used."],
      [252.6, 256.6, "I have to pay more attention to the things that I put in my mouth."],
      [256.6, 266.5, "As a matter of fact, I have seen quite a few videos about the process of making certain kinds of food and they were really fascinating to me."],
    ],
  },
  {
    slug: 'jimmy-part1-recycling', youtubeId: '8m97C_DuhT4',
    title: 'Part 1: Recycling',
    sourceTitle: 'IELTS SPEAKING PART 1 MODEL ANSWERS - RECYCLE', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Tái chế: got into the habit of recycling, repurpose glass jars, the least of my concern, decompose, raise people\'s awareness, prevent landfills from getting overloaded.',
    segments: [
      [61.0, 63.4, "Do you recycle now?"],
      [66.1, 71.4, "It's kind of embarrassing to say this, but I don't have a habit of recycling things."],
      [71.4, 77.1, "Partly because it's not a common routine in Vietnam, and I don't know how to do it."],
      [77.1, 83.4, "More often than not, I just put things in a trash bag after I finish using them."],
      [101.3, 105.8, "Yeah, I can probably say that I've got into the habit of recycling."],
      [105.8, 112.5, "More often than not, I reuse plastic bags for future groceries or as garbage bags."],
      [112.5, 125.0, "Sometimes, I also repurpose glass jars and bottles into something useful, like a new container for other household items or a planter for my flowers."],
      [129.4, 133.0, "Did you recycle when you were a kid?"],
      [136.4, 139.3, "No, I almost never did."],
      [139.3, 148.8, "When I was a kid, all I could think of was doing my homework and then going out to play some traditional outdoor games with my childhood friends."],
      [148.8, 154.5, "The thought of reusing things was the least of my concern back then."],
      [164.9, 172.2, "Yeah, believe it or not, I did. My parents taught me to recycle things from a very young age."],
      [172.2, 185.2, "So, unlike other kids in my neighborhood who never seemed to care about it, I always try to come up with ways to reuse recyclable items for my own home use."],
      [189.7, 192.5, "Will you recycle in the future?"],
      [192.7, 202.7, "Yeah, I think I will. Environmental pollution is a big thing now, so I'll be willing to change my routine for the sake of the environment."],
      [202.7, 209.5, "I guess I'll start by doing some research on the internet on how to recycle things effectively."],
      [212.3, 217.0, "Can you name products and materials that are commonly recycled?"],
      [218.4, 227.1, "I guess, just like other parts of the world, Vietnamese people usually have things made of plastic and glass material recycled,"],
      [227.1, 233.9, "mainly because these materials may take thousands of years to decompose in the environment."],
      [233.9, 239.4, "Batteries are also a common type of products in this category."],
      [244.2, 250.8, "Why have people's attitudes towards recycling changed over the last several years?"],
      [252.0, 259.0, "In my opinion, one of the main reasons is that environmental pollution is a pressing problem nowadays."],
      [259.0, 264.5, "And the press and the media have been talking a lot about this topic over the past few years."],
      [264.5, 270.2, "So it has helped raise people's awareness of recycling in general."],
      [274.1, 277.0, "Do you think recycling is important?"],
      [277.6, 287.7, "Yeah, no doubt about that. If everyone can develop a habit of recycling, it will help reduce the amount of waste produced"],
      [287.7, 296.3, "and prevent landfills from getting extremely overloaded, which in turn makes the environment become cleaner."],
    ],
  },
  {
    slug: 'jimmy-part1-your-major', youtubeId: 'K0jfWYru6_0',
    title: 'Part 1: Study — what is your major?',
    sourceTitle: 'IELTS SPEAKING PART 1 MODEL ANSWERS - STUDY', channel: JIMMY,
    category: 'ielts-part1', level: 'B1',
    description: 'Dành cho sinh viên: I\'m majoring in…, writing and cracking codes, I must confess, without thinking twice, has never crossed my mind, go back to square one.',
    segments: [
      [168.1, 170.8, "What is your major?"],
      [172.0, 175.2, "I'm majoring in business administration."],
      [175.3, 184.1, "Most of the time, I study about different aspects of a business like accounting, marketing or human resources."],
      [184.1, 187.9, "It's hard work, but I find it pretty intriguing."],
      [238.9, 246.5, "I'm an IT major and I spend most of my time sitting in front of the screen writing and cracking codes."],
      [246.5, 251.2, "It's a difficult major and it can be pretty stressful at times."],
      [291.0, 294.1, "Why did you choose to study that major?"],
      [295.9, 302.7, "I must confess, when I was a high school student, I didn't know what I wanted to do with my life."],
      [302.7, 309.9, "So I asked my parents for advice and they told me to choose this major."],
      [360.8, 367.0, "From a very young age, I already knew that I was gonna be a doctor when I grew up."],
      [367.0, 374.0, "I have always wanted to help improve everyone's health or even save their lives."],
      [374.0, 378.6, "That's why I went for this major without thinking twice."],
      [415.4, 419.6, "Would you like to change your major if you got the chance?"],
      [421.6, 433.1, "No, definitely not. I really enjoy what I've been studying, so the thought of switching to another major has never crossed my mind."],
      [484.4, 491.4, "Yeah, I think I would. I find my current major pretty dull and boring,"],
      [491.4, 500.7, "so it would be great if I could switch to another one, even though it means I have to go back to square one and start over."],
    ],
  },
  // ── Jimmy English Home: funny Shorts ─────────────────────────────────
  {
    slug: 'jimmy-fun-funny-or-happy', youtubeId: 'W3Aq9XDFMOI',
    title: 'Fun, funny or happy?',
    sourceTitle: 'Fun, funny và happy, đều là sự khác nhau?', channel: JIMMY,
    category: 'fun-shorts', level: 'A2',
    description: 'Tiểu phẩm vui: "I feel so funny when I\'m with him" — sai rồi! Phân biệt fun (vui, dễ chịu), funny (buồn cười) và happy. Còn "I feel funny" lại nghĩa là thấy hơi ốm.',
    segments: [
      [0.2, 2.6, "Hey, what do you think of Jimmy?"],
      [2.6, 8.8, "He's a very fun guy. He usually tells jokes and makes me laugh. I feel so funny when I'm with him."],
      [8.8, 15.6, "I see. I think what you really meant was he's a funny guy and you feel happy when you're with him."],
      [15.6, 19.0, "Huh? Oh yeah. So what's the difference between them?"],
      [19.0, 24.3, "Hmm, that's simple. You use the word \"funny\" to describe a person who usually tells jokes and makes you laugh."],
      [24.3, 29.4, "You use the word \"fun\" to describe a person who you enjoy being with."],
      [31.3, 37.7, "For example, Jimmy is a fun guy to be with because he knows many interesting stories."],
      [37.7, 44.0, "When it comes to feelings, you don't use either the word \"funny\" or \"fun\", but instead you use the word \"happy\"."],
      [44.0, 46.7, "\"I feel happy staying at home all day.\""],
      [46.7, 51.8, "If you say you feel funny, it means that you're slightly ill or sick."],
      [51.8, 55.4, "And that's enough for today's video. Follow for more."],
    ],
  },
  {
    slug: 'jimmy-fun-coffee-handsome-face', youtubeId: 'xDYDpr1EtNo',
    title: 'Coffee? Not for my handsome face! (Band 5 → 8)',
    sourceTitle: 'Do you often drink coffee? Band 5-6-7-8 samples', channel: JIMMY,
    category: 'fun-shorts', level: 'B1',
    description: 'Câu hỏi Part 1 "Do you often drink coffee?" trả lời 4 mức band với lý do… bảo vệ khuôn mặt đẹp trai: allergic to caffeine, jittery, break out, a nightmare.',
    segments: [
      [0.0, 2.2, "Do you often drink coffee?"],
      [2.9, 7.1, "No, I rarely drink coffee. I feel uncomfortable when I drink it."],
      [7.1, 11.5, "It can make my skin look bad and affect my handsome face."],
      [12.0, 19.8, "No, I rarely drink coffee because it makes my stomach uncomfortable. If I drink it, I'll have to go to the toilet right away."],
      [19.8, 26.0, "On top of that, it's not good for my skin because it can make acne appear on my handsome face."],
      [26.7, 30.7, "No, I almost never drink coffee as I'm allergic to caffeine."],
      [30.7, 37.2, "Whenever I have a sip, my stomach feels uneasy and I have to rush to the bathroom, which is terrible."],
      [37.2, 43.7, "Besides, drinking coffee can cause acne on my handsome face, and I definitely don't want that."],
      [44.2, 52.2, "No, absolutely not. Coffee is the last thing I'd ever want to drink, to be honest. Mainly because I'm allergic to caffeine."],
      [52.2, 59.0, "Even just a small sip makes me feel jittery and sends me rushing to the bathroom, which is honestly a nightmare."],
      [59.0, 65.3, "On top of that, it makes me break out and I really don't want anything messing up my handsome face."],
    ],
  },
  {
    slug: 'jimmy-fun-remember-names', youtubeId: '5XGgUBO3cOY',
    title: 'Remembering names — only the pretty ones? (Band 5 → 8)',
    sourceTitle: 'Can you remember people\'s names? Band 5-6-7-8', channel: JIMMY,
    category: 'fun-shorts', level: 'B1',
    description: 'Nhớ tên con gái thì nhanh, tên con trai thì quên ngay — "maybe my brain is just biased". Luyện it depends, when it comes to…, it\'s a different story.',
    segments: [
      [0.0, 2.4, "Can you remember people's names?"],
      [2.9, 9.2, "It depends. I can remember girls' names really fast, but I can't remember boys' names."],
      [9.9, 14.8, "It depends. I can remember girls' names really quickly, especially if they're pretty,"],
      [14.8, 20.4, "but when it comes to boys' names, I usually struggle a lot. I don't know why."],
      [21.0, 26.7, "Well, I think it depends. I can remember girls' names really quickly, especially if they're pretty."],
      [26.7, 34.4, "But when it comes to boys' names, I always struggle. I tend to forget them right away. I have no idea why."],
      [35.0, 37.4, "Well, it sort of depends on the situation."],
      [37.4, 45.4, "When it comes to girls, especially the pretty ones, I can remember their names really quickly, but it's a different story with boys' names."],
      [45.4, 53.7, "For some reason, I always struggle to remember them and often forget almost instantly. Maybe my brain is just biased."],
    ],
  },
  {
    slug: 'jimmy-fun-time-management', youtubeId: 'eA_u-DsSvmI',
    title: 'Time management: eight dates in one day (Band 5 → 8)',
    sourceTitle: 'Are you good at time management? Band 5-6-7-8', channel: JIMMY,
    category: 'fun-shorts', level: 'B1',
    description: 'Khoe kỹ năng quản lý thời gian bằng một ví dụ "khó đỡ": hẹn hò 8 cô gái trong một ngày! plan ahead, get my priorities in order, I wouldn\'t be exaggerating if…',
    segments: [
      [0.1, 2.4, "Are you good at time management?"],
      [2.9, 10.2, "Yes, I'm good at time management. I can manage my time to go out with eight girls a day and to have time for myself."],
      [11.0, 16.3, "Yeah, I think my time management skills are quite good because I always plan things carefully."],
      [16.3, 22.5, "You know what? I can make time to go out with eight girls in a day and still have time for myself if I want."],
      [23.1, 30.7, "Yeah, as an organized person, I believe I excel at managing time. I always plan ahead and know how to get my priorities in order."],
      [30.7, 38.1, "A good example is that I once made time to go out with eight different girls in a single day and still had time for myself."],
      [38.6, 43.1, "Yeah, I wouldn't be exaggerating if I said I'm a master at managing time."],
      [43.1, 48.9, "I always plan ahead by making a daily to-do list and setting my priorities straight the night before."],
      [48.9, 56.0, "Believe it or not, I once managed to go out with eight different girls in a single day and still had time for myself."],
    ],
  },
  // BBC "The English We Speak" (2026-10-15): +6 for the funny-shorts set.
  // [youtubeId, slug, title, level, clipStart, clipEnd, sourceTitle, description]
  ...[
    ['C4TDI8z3Ej8', 'tews-smombie', 'Smombie — the smartphone zombie', 'B1', 8.8, 122.1, 'Smombie: The English We Speak',
      'Feifei mải nhìn điện thoại nên… đâm sầm vào cửa. "Smombie" = smartphone + zombie: người cắm mặt vào điện thoại khi đi đường, chẳng để ý gì xung quanh.'],
    ['S_1KB4PbGh0', 'tews-digital-detox', 'Digital detox', 'B1', 7.2, 167.8, 'Digital detox: The English We Speak',
      'Neil mất ngủ, mỏi mắt, đau cổ… "Bác sĩ" Feifei kê đơn: a digital detox — một thời gian tránh xa mọi thiết bị có Internet. Và chiếc điện thoại của Neil thì…'],
    ['ty33i4waFqE', 'tews-whizz-kid', 'Whizz-kid', 'B1', 8.6, 121.8, 'Whizz-kid: The English We Speak',
      'Rob mơ làm "thần đồng tài chính" — a whizz-kid: người trẻ, giỏi và thành công. Nhưng Feifei nhắc Rob không còn trẻ… có lẽ anh chỉ hợp ngồi sofa xem TV.'],
    ['aq8I8IkRBTE', 'tews-goat', 'GOAT — the greatest of all time', 'B1', 1.2, 149.1, 'GOAT - The English We Speak',
      'Feifei bị gọi là "a goat" (con dê) nên rất bực — hóa ra GOAT = Greatest Of All Time. Feifei và Roy tranh nhau xem ai mới là GOAT!'],
    ['OfIH0_1qyX4', 'tews-it-beats-me', 'It beats me!', 'A2', 6.4, 113.3, 'How to say it beats me - The English We Speak',
      'Rob nói "beats me" và… bị Feifei gõ bằng gậy! "It beats me" = tôi chịu, không hiểu nổi. Vậy ai là thủ phạm khiến văn phòng có chuột?'],
    ['JAUAzf8zBog', 'tews-have-a-pop', 'Have a pop', 'B1', 7.6, 137.7, 'Have a pop: The English We Speak',
      'Rob "have a pop" (thử) sửa máy tính cho Feifei — và xóa mất kịch bản. "Have a pop at someone" còn có nghĩa là chỉ trích, thậm chí đánh ai đó!'],
  ].map(([youtubeId, slug, title, level, clipStart, clipEnd, sourceTitle, description]) => ({
    slug, youtubeId, title, sourceTitle, channel: 'BBC Learning English',
    category: 'fun-shorts', level, clipStart, clipEnd, description, stripSpeakers: true, minWords: 3,
  })),
  // ── Jimmy English Home (2026-10-15): Part 2 + 3 Band 8 samples ──────
  // Each video is a cue-card talk followed by the Part 3 questions on the
  // same topic, read by Jimmy with punctuated auto captions; `part3At` is
  // where the first Part 3 question starts — one Part 2 + one Part 3 lesson.
  // [youtubeId, key, part2Title, part3Title, part3At, sourceTitle, part2Description, part3Description, { p2, p3 } options]
  ...[
    ['et1TtLb77D8', 'old-family-thing', 'An important old thing your family has kept', 'Why do people keep old things?', 106.6,
      'IELTS SPEAKING PART 2 + 3: Describe an important old thing that your family has kept for a long time',
      'Album ảnh gia đình — "báu vật" truyền qua ba thế hệ: an heirloom, passed down, vague memories, flip through the album, reminisce about meaningful milestones, learn about their roots.',
      'Vì sao người ta giữ đồ cũ? emotional value, hold on to, sturdy wooden furniture, mementos, sentimentally valuable — và giới trẻ ngày nay lưu kỷ niệm trên điện thoại.'],
    ['Oiz-lnpkNm0', 'clever-solution', 'Someone who found a clever solution to a problem', 'Are children born clever?', 114.3,
      'IELTS PART 2 + 3: Describe a time when someone you know found a clever solution to a problem',
      'Anh trai dùng AI làm "ảnh siêu âm có giun" để con bỏ ăn vặt — vừa buồn cười vừa thông minh: came up with a brilliant way, freaked out, worked like a charm.',
      'Trẻ sinh ra đã thông minh hay học mà thành? genius aside, mentally stimulating activities, well-rounded, an oversupply of workers, physical attributes, at the end of the day.'],
    ['jB-rXWMQFE0', 'environmental-law', 'An environmental protection law you would like to introduce', 'Protecting the environment: laws, schools & governments', 119.6,
      'IELTS SPEAKING PART 2 + 3: Describe an environmental protection law that you would like to introduce',
      'Luật môi trường bạn muốn đưa ra: phạt nặng xả rác nơi công cộng như Singapore — stricter regulations, heavy fines, think twice, notoriously strict, work hand in hand.',
      'Sáu câu hỏi về bảo vệ môi trường: pressing issues, harmful emissions, take greater responsibility, raise awareness, the brink of extinction, no ifs, ands, or buts.'],
    ['q6Bs4cTOv98', 'advert-famous-person', 'An advertisement with a famous person in it', 'Why do companies use celebrities in adverts?', 110.8,
      'IELTS SPEAKING PART 2 + 3: Describe a piece of advertisement with a famous person in it',
      'Quảng cáo dầu gội Clear Men có Cristiano Ronaldo: a commercial break, anti-dandruff, a huge fan base, grab people\'s attention, rush out and buy.',
      'Vì sao quảng cáo dùng người nổi tiếng? A-list celebrities, a paid promotion, bombarded with ads, get the message across, a false sense of need, impressionable.', { p2: { join: [5] }, p3: { join: [9] } }],
    ['jG05WMlut2Q', 'good-at-languages', 'A person who is good at learning languages', 'Learning foreign languages', 113.4,
      'IELTS SPEAKING PART 2 + 3 Band 8 Samples: Describe a person who is good at learning languages',
      'Người giỏi ngoại ngữ — thầy Jimmy, một "polyglot": put what I learned into practice, pick up natural expressions, living proof, push myself harder.',
      'Học ngoại ngữ: vì sao có người giỏi hơn, trẻ em có học nhanh hơn không, cách học tốt nhất ("no one-size-fits-all method"), công nghệ & AI, trường học có nên dạy thêm ngoại ngữ.'],
    ['eeVURE-MwXU', 'social-media-video', 'An interesting video you watched on social media', 'Online videos & social media', 118.3,
      'IELTS SPEAKING PART 2 + 3 Band 8 samples: Describe an interesting video you watched on social media',
      'Video cô gái cổ vũ World Cup hóa ra do AI tạo: scrolling through Facebook, struck by how flawless she looked, at first glance, scams or misinformation.',
      'Video trực tuyến & mạng xã hội: comedy and educational content, AI-driven algorithms, a filter bubble, self-proclaimed experts, parental supervision, highly addictive.'],
    ['HapyzgWSTWY', 'perfect-job', 'A perfect job you would like to have in the future', 'Dream jobs', 117.6,
      'IELTS PART 2 + 3 Band 8 Samples: Describe a perfect job you would like to have in the future',
      'Công việc mơ ước: online affiliate marketer — took off, tech-savvy, flexibility, a better work-life balance, build a name for myself, setbacks along the way.',
      'Nghề mơ ước của trẻ em và người lớn: meaningful and respected, attracted to fame, prestige, see life through rose-colored glasses, don\'t have what it takes.'],
    ['4c1vGJKyEJc', 'good-at-planning', 'A person who is good at planning things', 'Why do people make plans?', 105.0,
      'IELTS Speaking Part 2 + 3 Band 8 Samples: Describe a person who is good at planning things',
      'Cô bạn thân giỏi lên kế hoạch: we go way back, a daily to-do list, disciplined and punctual, on the spur of the moment, procrastination, a better version of myself.',
      'Lập kế hoạch: casual plans vs bigger plans, once-in-a-lifetime occasions, go with the flow, career planning, give them an edge, blindly follow their advice.'],
    ['Jtzu5uB_UoI', 'child-painting', 'A child you know who enjoys painting or drawing', 'Children, art & painting', 102.7,
      'IELTS SPEAKING PART 2 + 3 Band 8 Samples: Describe a child you know who enjoys painting and drawing',
      'Cháu trai 8 tuổi mê vẽ: a real passion for art, portraits, natural landscapes, sharpen his skills, you should see the look on his face.',
      'Trẻ em và hội họa: fine motor skills, creativity and imagination, express their thoughts, galleries and museums, free admission days, only to a certain extent.', { p3: { join: [9] } }],
    ['d2J1ZSJOuZM', 'proud-of-family', 'A time you felt proud of a family member', 'Pride, rewards & children', 117.3,
      'IELTS SPEAKING PART 2 + 3 Band 8 Samples: Describe a time when you felt proud of a family member',
      'Tự hào khi anh trai đậu cùng lúc hai trường đại học: exploded with joy and pride, it was a blast, blood, sweat, and tears, a role model to me.',
      'Khen thưởng & niềm tự hào: feel seen and supported, too much of a good thing, take them for granted, strike a balance, don\'t set the bar too high.'],
    ['BTS3hz13tUI', 'no-phone-allowed', 'A time you weren\'t allowed to use your phone', 'Mobile phones: friendship, photos & laws', 110.45,
      'IELTS SPEAKING PART 2 + 3 Band 8 Samples: Describe a time when you weren\'t allowed to use your phone',
      'Một tháng học quân sự không được dùng điện thoại: glued to my phone, "1 month in hell", improve my focus, bond with other students — hóa ra lại rất đáng nhớ.',
      'Điện thoại di động: người trẻ vs người già, ảnh hưởng đến tình bạn, chụp ảnh có phí thời gian không, có cần luật không — và khi điện thoại khiến ta khó chịu (downright disrespectful).'],
    ['6hOYr1t9FqA', 'unusual-meal', 'An unusual meal you had', 'Eating out, fast food & food culture', 103.3,
      'IELTS SPEAKING PART 2 + 3 Band 8 Samples: Describe an unusual meal you had',
      'Bữa buffet có thịt cá sấu ở resort Cam Ranh: caught me off guard, going back and forth in my head, nothing to write home about, bizarre.',
      'Ăn ngoài, đồ ăn nhanh và văn hóa ẩm thực Việt: order in, promo codes, it boils down to…, the social side of things, banh mi, triggered a lot of backlash.'],
    ['7Tzgn2O9pNU', 'positive-change', 'A positive change you made in your daily life', 'Changing habits & routines', 105.0,
      'IELTS SPEAKING PART 2 + 3: Describe a positive change that you have made in your daily life recently',
      'Thay đổi tích cực: bỏ thức khuya, đi ngủ sớm dậy sớm — a night owl, fight a mental battle, the snooze button, sluggish, absolutely stoked.',
      'Thói quen & thay đổi: taking a toll on their health, mindlessly scrolling, peer pressure, short-lived motivation, quit cold turkey, small consistent changes.', { p2: { join: [15] } }],
    ['8OzJ9jpROoE', 'useful-app', 'A program or app on your computer or phone', 'Are we too dependent on apps?', 112.9,
      'IELTS SPEAKING PART 2 + 3 band 8 samples: Describe a program or app on your computer or phone',
      'ChatGPT — ứng dụng dùng mỗi ngày: a global phenomenon, handle everyday requests, a kind of therapist, get back on my feet, double-check things.',
      'Ứng dụng điện thoại: convenience, designed to be addictive, take productivity up a notch, over-reliant, eye strain, social cohesion, parental guidance.'],
    ['euuAOtYGCOE', 'family-business', 'A person you know who runs a family business', 'Family businesses', 111.1,
      'IELTS SPEAKING PART 2 + 3 band 8 Samples: Describe a person you know who runs a family business',
      'Người dì mở tiệm tạp hóa gia đình ở quê: drop by, get it off the ground, relentless hard work, strong business sense, customer satisfaction.',
      'Doanh nghiệp gia đình — 9 câu hỏi Part 3: flexibility, conflicts become personal, follow in their parents\' footsteps, close-knit, cost-effective.'],
    ['-pn3MIcu59g', 'lost-your-way', 'An occasion when you lost your way', 'Maps, directions & getting lost', 114.45,
      'IELTS SPEAKING PART 2 + 3 Band 8 Samples: Describe an occasion when you lost your way',
      'Lạc đường khi đi xe máy đến Vũng Tàu vì tin Google Maps: let our hair down, the middle of nowhere, a dead end, in hindsight, what was bound to happen happened.',
      'Bản đồ, chỉ đường và lạc đường: rely too heavily on, double-check, sense of direction, off the beaten path, wind up in…, navigation skills.', { p3: { skip: [15] } }],
    ['UvfKsxszxJ4', 'music-event', 'A music event you didn\'t enjoy', 'Concerts & live music', 108.1,
      'IELTS SPEAKING PART 2 + 3 Band 8 Samples: Describe a music event that you didn\'t enjoy',
      'Một buổi diễn nhạc rock không như mong đợi: a small gig at a cafe, heavy metal, headbanging, too wild for me, not really my type of music.',
      'Sự kiện âm nhạc: the electric atmosphere, open-air concerts, music festivals, live vs recorded music, sound quality, performance fees.'],
    ['iepD_HjJECw', 'imagination', 'A time you needed to use your imagination', 'Imagination & creativity', 113.4,
      'IELTS SPEAKING PART 2 + 3 Band 8 Samples: Describe a time when you needed to use your imagination',
      'Dùng trí tưởng tượng để chuẩn bị bài thuyết trình: visualization, a self-help book, far-fetched, received several compliments, over the moon.',
      'Trí tưởng tượng & sáng tạo — 9 câu hỏi: think outside the box, precise data, forming hypotheses, reading vs cartoons, building blocks, role-playing games.'],
    ['NdR7wnCu3_U', 'sports-competition', 'A sports competition you watched', 'Competitions, prizes & sport on TV', 117.2,
      'IELTS SPEAKING PART 2 + 3 Band 8 Samples: Describe a sports competition you watched',
      'Chung kết bóng đá SEA Games 33 Việt Nam – Thái Lan: a roller coaster of emotions, conceding two early goals, an unbelievable comeback, the never-give-up spirit.',
      'Thi đấu thể thao: prizes and incentives, sportsmanship, football attracts the largest audience, broadcast on TV, a sedentary lifestyle.', { p2: { join: [7] } }],
    ['KyhH6v3FzQw', 'friends-argument', 'An argument two of your friends had', 'Arguments & disagreements', 111.8,
      'IELTS SPEAKING PART 2 + 3 BAND 8 SAMPLES: Describe an argument two of your friends had',
      'Hai cô bạn cãi nhau khi làm bài thuyết trình nhóm: critical comments, took it personally, a heated argument, act as a mediator, blocked each other on Facebook.',
      'Tranh cãi & bất đồng: talk things through, pet peeves, daily friction, in the heat of an argument, jump down each other\'s throats, a different take on it.'],
  ].flatMap(([youtubeId, key, part2Title, part3Title, part3At, sourceTitle, part2Description, part3Description, extra = {}]) => {
    const common = { youtubeId, sourceTitle, channel: JIMMY, useAutoText: true, dropFillers: true };
    return [
      { ...common, slug: `jimmy-part2-${key}`, title: `Part 2: ${part2Title}`, category: 'ielts-part2', level: 'B2',
        clipStart: 0, clipEnd: part3At, description: part2Description, ...extra.p2 },
      { ...common, slug: `jimmy-part3-${key}`, title: `Part 3: ${part3Title}`, category: 'ielts-part3', level: 'C1',
        clipStart: part3At - 1, clipEnd: 9999, description: part3Description, ...extra.p3 },
    ];
  }),
  // ── BBC Learning English: The Storytellers (Joe & Bella stories) ────
  // Whole story, hand-timed (storytellersSegments.json). The BBC videos are
  // "made for kids", so YouTube serves no captions for them. Text = the
  // official script on bbc.co.uk/learningenglish/english/features/
  // childrens-stories/<page>; timings = per-word times of the en-orig auto
  // captions on Picture Future's re-upload, whose timeline matches the BBC
  // video frame for frame (YouTube storyboards compared, 0 s shift). Only the
  // BBC original is embedded. Other episodes have no caption-bearing copy
  // with a matching timeline yet.
  ...[
    ['ikEzzuijaJ0', 'story-football-match', 'Football match', 'Football match - The Storytellers',
      'Joe được chọn vào đội bóng của trường, nhưng một cậu bé to con cứ chơi xấu — và Bella lao ra sân bênh anh! Từ vựng: pitch, referee, yellow card, trip up, bully, score a goal.'],
    ['vv8xhL7Xstg', 'story-sick-day', 'Sick day', 'Sick day - The Storytellers',
      'Bella kêu ốm để được nghỉ học — hóa ra đã ăn vụng hết hộp kẹo! Còn Joe đau khuỷu tay mà chẳng ai để ý. Từ vựng: sore, tummy, feverish, bruise, X-ray, sling.'],
    ['ZjkU4GZKaqQ', 'story-camping', 'Camping', 'Camping - The Storytellers',
      'Chuyến cắm trại đầu tiên của Bella: dựng lều, nướng marshmallow và tiếng sột soạt bí ẩn ngoài lều lúc nửa đêm. Từ vựng: tent, sleeping bag, pitch a tent, rustling, hike.'],
    ['FnxIZ3RxG7o', 'story-school-trip', 'School trip', 'School trip - The Storytellers',
      'Lớp Joe đi công viên động vật hoang dã nhưng xe hỏng giữa đường cao tốc và khu sư tử lại đóng cửa! Từ vựng: wildlife park, coach, break down, motorway, enclosure.'],
    ['4XuB_U69nAY', 'story-rainy-day', 'Rainy day', 'Rainy day - The Storytellers',
      'Mưa cả ngày, không đi biển được — Bella làm "bánh" cho chú chó Selby (thức ăn cho chó + cornflakes!). Từ vựng: pouring, sheeting down, queasy, make the best of it, sprinkles.'],
    ['jrFaxNvX2Bo', 'story-car-journey', 'Car journey', 'Car journey - The Storytellers',
      '"Are we nearly there yet?" — chuyến đi xe lên Scotland: chơi I Spy, kẹt xe, lạc đường ở ngã tư và Bella chỉ đúng hướng. Từ vựng: traffic jam, service station, crossroads, signpost.'],
  ].map(([youtubeId, slug, title, sourceTitle, description]) => ({
    slug, youtubeId, title: `Joe & Bella: ${title}`, sourceTitle, channel: 'BBC Learning English',
    category: 'kids-stories', level: 'B1', description, segments: STORYTELLERS[slug], burnedInCaptions: true,
  })),
  // ── Nối âm / connected speech (2026-10-24): BBC Tim's Pronunciation
  // Workshop — ~3-min videos, each ends with short "listen and repeat"
  // sentences. Clip = from the topic (after the "Hi, I'm Tim" intro) to the
  // last repeat (before "Well done"). Manual captions only (no en-orig), so
  // timings are interpolated. Left out: videos whose captions skip the
  // example sentences (they're only on screen) — elision of /t/, 'meet you',
  // 'white paper', 'bless you', 'sandwich', 'have to', 'from', linking /r/.
  // [youtubeId, slug, title, level, clipStart, clipEnd, sourceTitle, description, extra]
  ...[
    ['mV_CEIroJs8', 'cs-consonant-vowel', 'Consonant + vowel: "an egg" → "anegg"', 'A2', 0, 110.3,
      'Tim\'s pronunciation workshop: Consonant - vowel linking',
      'Quy tắc nối âm cơ bản nhất: từ trước kết thúc bằng PHỤ ÂM, từ sau bắt đầu bằng NGUYÊN ÂM → đọc liền như một từ. "an egg" → /ənɛg/, "He\'s in the garden", "give up", "had it in".'],
    ['cu-VK3JlgAk', 'cs-linking-w', 'Linking /w/: "the shoe is" → "the shoe-w-is"', 'B1', 0.5, 133.7,
      'Pronunciation: Linking /w/',
      'Từ trước kết thúc bằng âm /uː/ (shoe, do, clue, glue), từ sau bắt đầu bằng nguyên âm → chen một âm /w/ nhẹ: "The shoe-w-is on the wrong foot", "do-w-I", "clue-w-at all".'],
    ['2Oi0NLl5Fdg', 'cs-linking-j', 'Linking /j/: "I always" → "I-y-always"', 'B1', 25.8, 167.4,
      'Pronunciation: The linking /j/',
      'Từ trước kết thúc bằng /aɪ/, /iː/, /eɪ/, /ɔɪ/ (I, the, lie, high), từ sau bắt đầu bằng nguyên âm → chen một âm /j/ nhẹ: "I-y-always", "the-y-end", "I-y-ate", "high-y-up".'],
    ['JBugPH9wje0', 'cs-vowel-vowel', 'Vowel + vowel: "the end" → "the-y-end"', 'B1', 13.8, 203,
      'Stop Saying... Vowel to vowel linking',
      'Hai nguyên âm gặp nhau thì nối bằng /j/ hoặc /w/: sau "ee, i, a" là /j/ ("the-y-end", "another-y-day"), sau "o, oo" là /w/ ("go-w-on", "you-w-often"). Tim và "Tim" nói chuyện ở văn phòng.',
      { minWords: 2 }],
    ['DCJrFM3hdlg', 'cs-intrusive-r', 'Intrusive /r/: "law and order" → "law-r-and order"', 'B2', 30.1, 194.9,
      'Pronunciation: The intrusive /r/',
      'Giọng Anh: từ kết thúc bằng /ɔː/ hoặc /ə/ (law, draw, paw, saw) + nguyên âm → chen âm /r/ nhẹ dù không viết: "law-r-and order", "draw-r-a circle", "saw-r-a good film".'],
    ['M_tKuYaE620', 'cs-elision-d', 'Elision: the disappearing /d/ — "boiled potatoes"', 'B1', 0.4, 155.5,
      'Why does the /d/ sound sometimes disappear? Tim\'s Pronunciation Workshop',
      'Âm /d/ kẹp giữa hai phụ âm thường bị nuốt: "boiled potatoes" → "boil potatoes", "best friend", "hold back", "rolled down". Nghe khảo sát vui: khoai tây hấp hay luộc?'],
    ['BI0RTH6sA_k', 'cs-twinning-t', 'Twinning: "it takes two to tango"', 'B1', 25.1, 166.5,
      'Pronunciation: The twinning of /t/',
      'Hai âm /t/ đứng cạnh nhau ("it takes", "right to", "took the") gộp thành MỘT âm /t/ hơi mạnh hơn — không đọc hai lần. Tim và em sinh đôi Tom cùng dẫn.'],
    ['Wiz1YeLMjyA', 'cs-assim-d-b', 'Assimilation: /d/ + /b/ — "speed boat" → "speeb boat"', 'B2', 26.0, 146.9,
      'Pronunciation: Assimilation of /d/ and /b/',
      'Âm /d/ cuối từ đứng trước /b/ biến thành /b/: "speed boat" → "speeb boat", "good boy" → "goob boy", "rude before", "towed back", "should buy".'],
    ['Yrzg7DDo0ao', 'cs-assim-n-m', 'Assimilation: /n/ → /m/ — "Green Park" → "Greem Park"', 'B2', 31.1, 183.3,
      'Pronunciation: Assimilation of /n/ followed by /p/',
      'Âm /n/ cuối từ đứng trước /p/, /b/, /m/, /w/ biến thành /m/: "Green Park" → "Greem Park", "ten pairs", "on purpose", "in Paris", "on Wednesday".'],
    ['lc2eOCVJMuQ', 'cs-assim-t-k', 'Assimilation: /t/ → /k/ — "credit card"', 'B2', 25.7, 122.0,
      'Pronunciation: Assimilation of /t/ followed by /k/',
      'Âm /t/ cuối từ đứng trước /k/ biến thành /k/: "credit card" → "credik card", "get cold", "it quickly", "short cut", "that cake".'],
    ['sDDV01W20bo', 'cs-assim-d-g', 'Assimilation: /d/ → /g/ — "bad girl" → "bag girl"', 'B2', 24.8, 121.8,
      'Pronunciation: Assimilation of /d/ to /g/',
      'Âm /d/ cuối từ đứng trước /g/ hoặc /k/ biến thành /g/: "bad girl" → "bag girl", "good cook", "had guests", "hard copy", "red carpet".',
      { stripSpeakers: true }],
    ['3rXlFsd-yUA', 'cs-would-you', '"Would you…?" → "Wouldjou…?"', 'B1', 1.0, 127.6,
      'How to pronounce \'would you...?\' Tim\'s Pronunciation Workshop',
      'Âm /d/ + /j/ (you) hòa thành /dʒ/: "Would you do me a favour?" → "Wouldjou…", "Could you…", "sad you", "gold you". Chữ "you" còn có thể yếu thành "ya".'],
    ['vW77q1IGlmI', 'cs-unreleased-stops', 'Unreleased stops: "I\'d like to" — the swallowed /d/', 'B2', 26.8, 187.9,
      'Pronunciation: How fluent speakers pronounce plosives',
      'Âm bật /p b t d k g/ ở cuối từ, trước một phụ âm khác, thường chỉ "ngậm" lại mà không bật hơi: "I\'d like to", "quick chat", "should thank", "sad time", "sit down".'],
    ['KwDJnXt3ZVQ', 'cs-schwa', 'The schwa /ə/: "a piece of cake"', 'A2', 6.0, 127.4,
      'Tim\'s Pronunciation Workshop: The Schwa',
      'Âm /ə/ (schwa) là âm phổ biến nhất trong tiếng Anh — các từ nhỏ không nhấn như "a", "of", "to" đều đọc là /ə/: "a piece of cake" → "uh piece uh cake", "a cup of tea".'],
    ['m-lWwRomisk', 'cs-weak-and', 'Weak form of "and": "fish and chips" → "fish \'n\' chips"', 'A2', 0.2, 141.7,
      'Pronunciation: How do fluent speakers pronounce \'and\'?',
      '"and" không nhấn thì mất /d/ và nguyên âm yếu thành /ən/ hoặc chỉ /n/: "fish \'n\' chips", "go \'n\' get", "apples \'n\' oranges", "thinking \'n\' thinking".'],
    ['hbu6X_TYqMQ', 'cs-weak-can', 'Weak form of "can": /kæn/ → /kən/', 'A2', 25.8, 147.9,
      'Pronunciation: How fluent speakers pronounce \'can\'',
      '"can" (động từ khuyết thiếu) không nhấn đọc là /kən/: "I /kən/ speak two languages", "Can you help me…?", "How far can you throw…?" — còn "can\'t" thì giữ /ɑː/.'],
    ['psI7E_J1zPo', 'cs-weak-was-were', 'Weak forms: "was" /wəz/ and "were" /wə/', 'A2', 24.6, 158.1,
      'Tim\'s Pronunciation Workshop: \'was\' and \'were\'',
      '"was" và "were" không nhấn đọc yếu là /wəz/ và /wə/: "I /wəz/ watching a movie", "We /wə/ delighted with the results". Nghe người London kể tối qua họ làm gì.'],
    ['z7Ya1BFLRmg', 'cs-weak-have', '"I\'d have" → "I\'d\'ve": weak "have"', 'B2', 24.4, 170.0,
      'Pronunciation: How to pronounce \'have\' when it\'s an auxiliary',
      '"have" làm trợ động từ đọc yếu thành /əv/: "I\'d\'ve missed the bus", "should\'ve been", "would\'ve done", "might\'ve made" — rất hay gặp trong câu điều kiện loại 3.'],
    ['ZNsWDzoAffA', 'cs-weak-been', 'Weak form of "been": /biːn/ → /bɪn/', 'A2', 25.8, 164.0,
      'Pronunciation: How fluent speakers pronounce \'been\'',
      '"been" không nhấn đọc ngắn là /bɪn/ (như "bin"): "I\'ve /bɪn/ in London seven years", "How long have you /bɪn/ waiting?", "It\'s /bɪn/ years since…".'],
    ['CQrH4a9Tx4o', 'cs-weak-the', 'Two ways to say "the": /ðə/ and /ðiː/', 'A2', 28.3, 182.0,
      'Pronunciation: Two different ways to pronounce the English word \'the\'',
      '"the" + phụ âm đọc /ðə/ ("the blue one"), "the" + nguyên âm đọc /ðiː/ và nối /j/ ("the-y-orange one", "the apple pie", "the autumn").'],
  ].map(([youtubeId, slug, title, level, clipStart, clipEnd, sourceTitle, description, extra = {}]) => ({
    slug, youtubeId, title, sourceTitle, channel: 'BBC Learning English',
    // "Nối âm cơ bản" = linking + weak forms; "nâng cao" = sounds that
    // change or disappear (assimilation, elision, intrusion, twinning…).
    category: CS_ADVANCED.has(slug) ? 'connected-speech-advanced' : 'connected-speech',
    level, clipStart, clipEnd, description, minWords: 3, ...extra,
  })),
  // Two short drills, hand-timed off the en-orig per-word times (the auto
  // captions write the full "going to" / have no punctuation). Repeats of a
  // sentence are separate segments: model first, then the reduced version.
  {
    slug: 'cs-gonna-wanna-gotta', youtubeId: 's5c_POQLMfI',
    title: 'Gonna, wanna, gotta — shadow the American version',
    sourceTitle: 'American English Pronunciation | Gonna, Wanna & Gotta', channel: 'Speak English With Josh',
    category: 'connected-speech', level: 'A2',
    description: 'Ba dạng nói nhanh của người Mỹ: going to → gonna, want to → wanna, got to → gotta. Mỗi câu nghe bản đầy đủ trước, rồi hai lần bản rút gọn — nói theo bản rút gọn. Lưu ý: đây là văn nói, khi viết bài IELTS vẫn dùng dạng đầy đủ.',
    segments: [
      [0.0, 4.3, "Let's practice three words you'll hear Americans use all the time."],
      [4.4, 7.6, 'Gonna, wanna, and gotta.'],
      [7.7, 12.5, "I'll say the full sentence first, then listen twice and repeat the American version."],
      [12.5, 14.4, "I'm going to call her later."],
      [14.5, 16.4, "I'm gonna call her later."],
      [16.6, 18.6, "I'm gonna call her later."],
      [21.3, 23.7, 'Do you want to get some lunch?'],
      [23.9, 25.5, 'Do you wanna get some lunch?'],
      [26.2, 28.2, 'Do you wanna get some lunch?'],
      [30.9, 32.7, "I've got to go."],
      [32.9, 34.4, 'I gotta go.'],
      [34.7, 36.3, 'I gotta go.'],
      [38.8, 41.1, 'What are you going to do?'],
      [41.4, 43.0, 'What are you gonna do?'],
      [43.4, 45.1, 'What are you gonna do?'],
      [47.8, 49.8, 'Do you want to come with us?'],
      [49.9, 51.7, 'Do you wanna come with us?'],
      [51.9, 53.8, 'Do you wanna come with us?'],
      [57.1, 59.9, "Let's put them together. Shadow me."],
      [60.0, 61.8, "I'm gonna call her later."],
      [62.5, 64.4, 'Do you wanna get some lunch?'],
      [65.2, 66.6, 'I gotta go.'],
      [67.3, 69.0, 'What are you gonna do?'],
      [69.7, 71.6, 'Do you wanna come with us?'],
      [72.3, 74.9, 'Okay, one more time, a little faster.'],
      [74.9, 76.6, "I'm gonna call her later."],
      [77.4, 79.1, 'Do you wanna get some lunch?'],
      [79.8, 81.3, 'I gotta go.'],
      [82.0, 83.7, 'What are you gonna do?'],
      [84.4, 86.3, 'Do you wanna come with us?'],
    ],
  },
  {
    slug: 'cs-linking-sentences-drill', youtubeId: 'jHtebYQ1mWI',
    title: 'Linking drill: 5 sentences, find the links',
    sourceTitle: 'Test Your English Connected Speech/Linking Sounds in English Exercises', channel: 'Fluent American',
    category: 'connected-speech', level: 'B1',
    description: 'Bài luyện nối âm 80 giây: mỗi câu đọc hai lần, đoán chỗ nối rồi nói theo. Gợi ý: "isn\'t his aunt" → "isn-t-is-saunt", "left his oven on" → "lef-tis-so-ve-non", "checked her other" → "check-ter-ro-ther", "open up" → "o-pe-nup".',
    segments: [
      [0.2, 3.9, 'Welcome to a linking sound exercise with Fluent American.'],
      [4.1, 9.3, 'I will read for you a group of sentences and repeat each sentence one time.'],
      [9.7, 15.6, 'Try to identify where the linking occurs across words.'],
      [16.4, 19.2, 'If it isn\'t his aunt, then whose is it?'],
      [21.9, 24.7, 'If it isn\'t his aunt, then whose is it?'],
      [26.3, 29.5, 'He said he left his oven on.'],
      [32.0, 34.7, 'He said he left his oven on.'],
      [37.4, 40.8, 'The problem is the bank account\'s empty.'],
      [42.9, 46.3, 'The problem is the bank account\'s empty.'],
      [49.3, 53.6, 'The last time I checked, her other bag was in the office.'],
      [54.8, 59.0, 'The last time I checked, her other bag was in the office.'],
      [60.9, 63.4, 'Never open up this envelope again.'],
      [65.7, 68.2, 'Never open up this envelope again.'],
    ],
  },
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
  [/\ba\.m\. each\b/g, 'am each'], // "at 9:00 a.m. each day" — not a sentence end
  // Tim's Pronunciation Workshop: vox-pop lines with no full stops
  [/^Green Park Green Park\s*$/, 'Green Park. Green Park.'],
  [/^Green Park It's Green Park\s*$/, 'Green Park. It\'s Green Park.'],
  [/^Green Park\s*$/, 'Green Park.'],
  [/^It's Green Park\s*$/, 'It\'s Green Park.'],
  [/^Bad girl! She's a bad girl\s*$/, 'Bad girl! She\'s a bad girl.'],
  [/^The dog has been a bad girl\s*$/, 'The dog has been a bad girl.'],
  [/\b([Ss])pee\? boat/g, '$1peeb boat'],
  [/^I was playing football I was out drinking\./, 'I was playing football. I was out drinking.'],
];

// Fixes that span two caption lines, applied to the finished sentence.
const SEGMENT_FIXES = [
  // Tim's Pronunciation Workshop: IPA-only tokens (/ɪ/, /ə/…) have no a–z
  // letters, so the word splitter drops them — put them back.
  [/'is' begins with the sound But can/, "'is' begins with the sound /ɪ/. But can"],
  [/^In fluent speech, if a word ends in an sound,$/, 'In fluent speech, if a word ends in an /ɔː/ sound,'],
  [/the next word begins in an you'll/, 'the next word begins in an /ə/, you\'ll'],
  [/when one word ends in \/aɪ\/, \/eɪ\/ or\/ɔɪ\/ sound/, 'when one word ends in an /aɪ/, /iː/, /eɪ/ or /ɔɪ/ sound'],
  [/^I always becomes I always This is/, "'I always' becomes 'I-y-always'. This is"],
  [/come together and change to a sound\.$/, 'come together and change to a /dʒ/ sound.'],
  [/are both pronounced as and they/, 'are both pronounced as /ə/ and they'],
  [/^This sound is the most common sound/, 'This sound, /ə/, is the most common sound'],
  [/^\/n\/, \/d\/ - but listen again\./, '/æ/, /n/, /d/ - but listen again.'],
  [/changes to schwa:$/, 'changes to schwa: /ə/,'],
  [/made of the sounds \/w\/, z\/, isn't it\?/, "made of the sounds /w/, /ɒ/, /z/, isn't it?"],
  [/changes to a schwa - So 'was' becomes/, "changes to a schwa, /ə/. So 'was' becomes"],
  [/it's pronounced I prefer the blue one\./, "it's pronounced /ðə/. I prefer the blue one."],
  [/it's pronounced I prefer the orange one\./, "it's pronounced /ðiː/. I prefer the orange one."],
  [/when the sound is followed by a vowel sound,/, 'when the sound /iː/ is followed by a vowel sound,'],
  [/\bSonia Toxfig\b/g, 'Sandi Toksvig'],
  // BBC caption typos
  [/\bmy parent car\b/, 'my parents\' car'],
  [/the experience with doing the job/, 'the experience without doing the job'],
  [/\bI think this a wake-up call\b/, 'I think this is a wake-up call'],
  [/\bThe best of the both worlds\b/, 'The best of both worlds'],
  [/^Hello and welcome to The English I'm Feifei\./, 'Hello and welcome to The English We Speak. I\'m Feifei.'],
  [/\bmake me a nice cup up of tea\b/, 'make me a nice cup of tea'],
  [/\bthe phrase, we are teaching which is\b/, 'the phrase we are teaching, which is'],
  [/\bHe’s goes up\b/, 'He goes up'],
  // Auto-caption mishearings (English Pro Tips, Keith)
  [/^My name You already/, 'My name… You already'],
  [/^I computer games\./, 'I… computer games.'],
  [/, and Wait\.$/, ', and… wait.'],
  [/\bpicture skew\b/, 'picturesque'],
  [/\bhuskys\b/, 'huskies'],
  [/\bhumans's\b/, "humans'"],
  // TED / TEDx Shorts
  [/^Cuz we not when we get up/, 'Because when we get up'],
  [/^Which comes us to/, 'Which brings us to'],
  [/^People go 1 2 3 4 tear\.$/, 'People go 1, 2, 3, 4, tear.'],
  [/^Wet hands\. Shake\. 1 2 3 4 5 6 7 8 9 10 11 12\.$/, 'Wet hands. Shake. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.'],
  [/^Shake\. FOLD\. YOU WILL, FOR THE REST of your life/, 'Shake. Fold. You will, for the rest of your life'],
  [/\b20word\b/, '20-word'],
  [/^I called the difference/, 'I call the difference'],
  [/\bI'm on a mission too, to\b/, "I'm on a mission to"],
  [/\bTexas Holdem\b/, "Texas Hold'em"],
  [/\ballin\b/g, 'all-in'],
  [/\bis for artist\./, 'is for artists.'],
  [/\bselfdeceptive\b/, 'self-deceptive'],
  [/^She her play is grounded/, 'Her play is grounded'],
  [/^So, keep with saying what he does is he kind of/, 'So, Keith was saying what he does is he kind of'],
  [/\bThe Sanskrit word for juice, r a s a\./, 'The Sanskrit word for juice, R-A-S-A.'],
  [/^The a is appreciate\./, 'The A is appreciate.'],
  [/^The s is summarize\./, 'The S is summarize.'],
  [/^And the final a is ask\./, 'And the final A is ask.'],
  [/^And we so we taught them/, 'And so we taught them'],
  // Keith (everyday English)
  [/\bmaking them happily happy\b/, 'making them happy'],
  [/^Something relaxed and formal, ideally/, 'Something relaxed and informal, ideally'],
  // Part 2 / 3 mock tests
  [/\banxietyinducing\b/, 'anxiety-inducing'],
  [/\bthe Taj Mahul\b/, 'the Taj Mahal'],
  [/\bthe red fort\b/, 'the Red Fort'],
  [/\bI was taken a back\b/, 'I was taken aback'],
  [/\bfamily bones\b/, 'family bonds'],
  [/\bwe have cantens\b/, 'we have canteens'],
  [/\bensuring then can provide\b/, 'ensuring canteens can provide'],
  [/\byou mustn't it depends\b/, "you mustn't say it depends"],
  [/\bthere are going to be certain and drawbacks\b/, 'there are going to be certain advantages and drawbacks'],
  [/\bgaining in same popularity\b/, 'gaining in popularity'],
  // Max Amini (stand-up)
  [/\bEagloo\b/g, 'igloo'],
  [/\btajikistan\b/gi, 'Tajikistan'], // also before fixCaps sees "TAJIKISTAN"
  // Part 1 shorts (Keith, English Pro Tips)
  [/\bintro\. candidate is\b/, 'intro. Candidate is'],
  [/^IEL speaking part one topic of family\./, 'IELTS Speaking Part 1, topic of family.'],
  [/^I was speaking part one topic of friends\./, 'IELTS Speaking Part 1, topic of friends.'],
  [/^IELTS speaking part one topic of study\./, 'IELTS Speaking Part 1, topic of study.'],
  [/^Right, IELTS speaking part one topic of free time and hobbies\./, 'Right, IELTS Speaking Part 1, topic of free time and hobbies.'],
  [/\bhelps meup I find it helps me unwind\b/, 'helps me unwind'],
  [/^Don't worry try these phrases\./, "Don't worry, try these phrases."],
  // Jimmy English Home (Part 2 + 3)
  [/\bwas about let's see 5 years ago\b/, 'was about, let\'s see, 5 years ago'],
  [/\bbecause you know they were taken\b/, 'because, you know, they were taken'],
  [/\bserve as momentos\b/, 'serve as mementos'],
  [/\bsentimentally value\b/, 'sentimentally valuable'],
  [/\bbulky furniturees\b/, 'bulky furniture'],
  [/\bwhich speak volumes\b/, 'which speaks volumes'],
  [/\bharder everyday\b/, 'harder every day'],
  [/^That's it\. There are also self-proclaimed/, 'That said, there are also self-proclaimed'],
  [/^That's it\. The downside is/, 'That said, the downside is'],
  [/^That's it\. I think asking locals to make sense/, 'That said, I think asking locals can make sense'],
  [/\bmy best friend Ian, who\b/, 'my best friend Yen, who'],
  [/\bin the IOS exam\b/, 'in the IELTS exam'],
  [/\blike IS or T-OLE\b/, 'like IELTS or TOEFL'],
  [/\bweddings are usually once in a lifetime occasions\b/, 'weddings, are usually once-in-a-lifetime occasions'],
  [/\bthe venue and get list\b/, 'the venue and guest list'],
  [/\blastminute\b/g, 'last-minute'],
  [/\bwell- paid\b/g, 'well-paid'],
  [/\bhighpaying\b/g, 'high-paying'],
  [/\blowincome\b/g, 'low-income'],
  [/\bsecondyear\b/g, 'second-year'],
  [/\ba second year student\b/, 'a second-year student'],
  [/^Sometimes parent in particular\b/, 'Sometimes parents in particular'],
  [/\btheir interest and ambitions\b/, 'their interests and ambitions'],
  [/\bmy nephew who he's my older brother's first son\b/, 'my nephew, he\'s my older brother\'s first son,'],
  [/\bart related videos\b/, 'art-related videos'],
  [/^H, that's an interesting question\./, 'Hmm, that\'s an interesting question.'],
  [/^H to tell you the truth,/, 'Hmm, to tell you the truth,'],
  [/^Others, on the other hand, tend to have more hectic/, 'Adults, on the other hand, tend to have more hectic'],
  [/\blove, war, property, or\b/, 'love, war, poverty, or'],
  [/\ban important milestones\b/, 'an important milestone'],
  [/\bin academic setting whereas\b/, 'in academic settings, whereas'],
  [/\bto stay in in a building\b/, 'to stay in a building'],
  [/\bthe training sections\b/, 'the training sessions'],
  [/^And these sections took up\b/, 'And these sessions took up'],
  [/\bordering takeout simply can replace\b/, 'ordering takeout simply can\'t replace'],
  [/\bat 10:00 p\.m\. And wake up\b/, 'at 10:00 p.m. and wake up'],
  [/\bor even edit, and generate images\b/, 'or even edit and generate images'],
  [/\bor running to problems in life\b/, 'or run into problems in life'],
  [/\bspecial occasions like that or whenever\b/, 'special occasions like Tet or whenever'],
  [/\bI also forgot this name\b/, 'I also forgot its name'],
  [/\bprofessional looking slides\b/, 'professional-looking slides'],
  [/\bsituations that makes me\b/, 'situations that make me'],
  [/\bin today's world where you know innovation\b/, 'in today\'s world where, you know, innovation'],
  [/\bbecause you know they have to decide\b/, 'because, you know, they have to decide'],
  [/\bbuilt on precision data\b/, 'built on precise data'],
  [/\bforming new hypothesis\b/, 'forming new hypotheses'],
  [/\bor too unrealistic,$/, 'or too unrealistic.'],
  [/^which requires more imagination, reading or watching cartoons\.$/, 'Which requires more imagination: reading or watching cartoons?'],
  [/\bfixed roots\b/, 'fixed rules'],
  [/\brigid roots\b/, 'rigid rules'],
  [/\brole- playinging games\b/, 'role-playing games'],
  [/\bthe 33rd C Games\b/, 'the 33rd SEA Games'],
  [/\btwo early goats\b/g, 'two early goals'],
  [/\bhard to hire our disappointment\b/, 'hard to hide our disappointment'],
  [/\bmade the vis sweeter\b/, 'made the victory sweeter'],
  [/\bthe never give up spirit\b/, 'the never-give-up spirit'],
  [/^Yeah, I'd say so\. especially when athletes/, 'Yeah, I\'d say so, especially when athletes'],
  [/\bbecause prices and incentives\b/, 'because prizes and incentives'],
  [/\bfrom sportmanship\b/, 'from sportsmanship'],
  [/\bwhere you know fair play\b/, 'where, you know, fair play'],
  [/\bso I can say for sure\./, 'so I can\'t say for sure.'],
  [/\bmost of the players at a very high level\b/, 'most of the players are at a very high level'],
  [/^One of the girls, Nung, wasn't satisfied with what Hung had prepared/, 'One of the girls, Nhung, wasn\'t satisfied with what Hang had prepared'],
  [/^So Hun took it personally\./, 'So Hang took it personally.'],
  [/^From Hung's point of view, she felt she had already tried her best and that her work wasn't as bad at made it sound\./, 'From Hang\'s point of view, she felt she had already tried her best and that her work wasn\'t as bad as Nhung made it sound.'],
  [/\bSo, their worst tend to carry\b/, 'So, their words tend to carry'],
  [/\bbecause no one's like being interrupted\b/, 'because no one likes being interrupted'],
  [/\bEven so, I still like to give it a shot\b/, 'Even so, I\'d still like to give it a shot'],
  // BBC The English We Speak
  [/\ba smombie's going step out\b/, 'a smombie\'s going to step out'],
  [/^no! You have deleted my script\./, 'No! You have deleted my script.'],
  [/^furniture or furnitures\?/, 'Furniture or furnitures?'], // English with Lucy
  [/\bFive, color\./, 'Five, colour.'], // Lucy is British; the ASR spells US
  [/\bMy mom loves\b/, 'My mum loves'],
  [/^So, we can say, "I've been living/, 'So, we can say: I\'ve been living'], // English Pro Tips: unclosed quote
  [/^Daryl O'Connor: /, ''], // 6 Minute English: a two-word speaker label stripSpeakers misses
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
const CONJUNCTIONS = new Set(['because', 'but', 'and', 'so', 'which', 'whereas', 'while', 'since', 'although', 'or']);
const FILLERS = new Set(['um', 'uh', 'erm', 'er', 'ah']);

// "Um, there's…" → "There's…": drop the filler, keep any sentence-final
// punctuation it carried, and re-capitalise a sentence it used to start.
function dropFillers(words) {
  const out = [];
  let capNext = false;
  for (const w of words) {
    if (FILLERS.has(norm(w.text))) {
      const end = (w.text.match(/[.?!]$/) || [''])[0];
      if (end && out.length && !endsSentence(out[out.length - 1].text)) out[out.length - 1].text = out[out.length - 1].text.replace(/,$/, '') + end;
      if (/^[A-Z]/.test(w.text) || end) capNext = true;
      continue;
    }
    if (capNext) w.text = w.text[0].toUpperCase() + w.text.slice(1);
    capNext = false;
    out.push(w);
  }
  return out;
}

function readJson3(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8')).events || [];
}

// "Feifei: Welcome…", "Examples : I need…" → the label becomes a TURN
// marker, so manualWords() can flag where one speaker hands over.
const SPEAKER_LABEL = /(^|\s)[A-Z][a-z]*(?: and [A-Z][a-z]+)?\s?:(?=\s)/g;
const TURN = '¶';

function cleanText(t, { stripSpeakers } = {}) {
  let s = t.replace(/\n/g, ' ');
  for (const [re, rep] of TEXT_FIXES) s = s.replace(re, rep);
  if (stripSpeakers) s = s.replace(SPEAKER_LABEL, `$1${TURN}`);
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
function toSentences(words, { minWords = MIN_WORDS, pauseSplit = PAUSE_SPLIT } = {}) {
  // A long pause (music, a cut) also ends a turn, so a short line before it
  // ("So stick around.") isn't glued onto what comes after.
  const turns = [];
  let prev = null;
  for (const w of words) {
    if (w.turn || !turns.length || w.start - prev.end > pauseSplit) turns.push([]);
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

  // Split overlong sentences at the comma closest to their middle — or, in
  // unpunctuated speech (auto captions), before the conjunction closest to it.
  const split = [];
  const nearestMiddle = (rest, test) => {
    let best = -1;
    for (let k = MIN_SPLIT_WORDS - 1; k < rest.length - MIN_SPLIT_WORDS; k++) {
      if (test(k) && (best < 0 || Math.abs(k - rest.length / 2) < Math.abs(best - rest.length / 2))) best = k;
    }
    return best;
  };
  for (const s of out) {
    let rest = s;
    while (rest.length > MAX_WORDS) {
      let best = nearestMiddle(rest, (k) => /[,;:]$/.test(rest[k].text));
      if (best < 0) best = nearestMiddle(rest, (k) => CONJUNCTIONS.has(norm(rest[k + 1].text)));
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

// Stand-up auto captions SHOUT whole lines ("THANK YOU SO MUCH FOR COMING").
// Lowercase all-caps words, except acronyms and names the clip also writes
// in Title case elsewhere, then re-capitalise sentence starts and "I".
const ACRONYMS = new Set(['AI', 'USA', 'UK', 'LA', 'FBI', 'TSA', 'CEO', 'TV', 'OK', 'DJ', 'BBC', 'CNN', 'NYC', 'GPT', 'ID', 'PG', 'VIP', 'UAE', 'NBA', 'NFL', 'DNA', 'IQ', 'IRS', 'AWS']);
function fixCaps(segments) {
  const sentenceStart = (i, prev) => i === 0 || /[.?!]["'”’]?$/.test(prev);
  // Names: written in Title case mid-sentence and never in lowercase.
  const titleCase = new Set(), lowerCase = new Set();
  for (const s of segments) {
    s.text.split(' ').forEach((w, i, words) => {
      const m = w.match(/[A-Za-z']+/);
      if (!m) return;
      if (/^[a-z]/.test(m[0])) lowerCase.add(m[0]);
      else if (/^[A-Z][a-z]/.test(m[0]) && !sentenceStart(i, words[i - 1])) titleCase.add(m[0].toLowerCase());
    });
  }
  for (const w of lowerCase) titleCase.delete(w);
  for (const s of segments) {
    const words = s.text.split(' ');
    s.text = words.map((w, i) => {
      const m = w.match(/^([^A-Za-z]*)([A-Za-z']+)(.*)$/);
      if (!m) return w;
      let [, pre, core, post] = m;
      const shouted = /[A-Z]{2}/.test(core.replace(/'/g, '')) && core === core.toUpperCase();
      if ((shouted && !ACRONYMS.has(core.replace(/'S$/, ''))) || (core === 'A' && !sentenceStart(i, words[i - 1]))) {
        const lower = core.toLowerCase();
        core = titleCase.has(lower) ? lower[0].toUpperCase() + lower.slice(1) : lower;
      }
      if (/^i('|$)/.test(core)) core = 'I' + core.slice(1);
      // Sentence starts, and quoted speech: He's like, "No, I ate…"
      if ((sentenceStart(i, words[i - 1]) || /["“]$/.test(pre)) && /^[a-z]/.test(core)) core = core[0].toUpperCase() + core.slice(1);
      return pre + core + post;
    }).join(' ').replace(/\b([a-z]+)-([A-Z]{2,})\b/g, (_, a, b) => a + '-' + b.toLowerCase()); // cool-LOOKING
  }
}

// A quoted model answer spanning several segments leaves a lone " at the
// start of the first one and the end of the last — drop it.
function balanceQuotes(t) {
  if ((t.match(/"/g) || []).length % 2 === 0) return t;
  if (/^"/.test(t)) return t.slice(1);
  if (/"$/.test(t)) return t.slice(0, -1);
  return t;
}

function buildLesson(spec, subsDir) {
  if (spec.segments) {
    const { segments, ...meta } = spec;
    return {
      ...meta,
      clipStart: segments[0][0],
      clipEnd: segments[segments.length - 1][1],
      segments: segments.map(([start, end, text, answer]) => ({ start, end, text, ...(answer && { answer }) })),
      _timing: 'hand-timed',
    };
  }
  const find = (suffixes) => suffixes
    .map((sfx) => path.join(subsDir, `${spec.youtubeId}.${sfx}.json3`))
    .find((f) => fs.existsSync(f));
  let words;
  if (spec.transcript) {
    // Auto captions with no punctuation: a hand-punctuated transcript gives
    // the text, the en-orig word timings still place every word (LCS below).
    if (!find(['en-orig'])) return null;
    words = spec.transcript.split(/\s+/).filter((w) => norm(w)).map((text) => ({ text, start: 0, end: 0 }));
  } else {
    const manualFile = find(spec.useAutoText ? ['en-orig'] : ['en-GB', 'en-US', 'en']);
    if (!manualFile) return null;
    words = manualWords(readJson3(manualFile), { stripSpeakers: spec.stripSpeakers });
  }

  const autoFile = find(['en-orig']);
  let timing = 'interpolated';
  if (autoFile) {
    const ratio = applyAutoTimings(words, autoWords(readJson3(autoFile)), spec.clipStart - 15, spec.clipEnd + 15);
    timing = `auto-aligned (${Math.round(ratio * 100)}% words matched)`;
  }

  if (spec.dropFillers) words = dropFillers(words);

  // Keep only whole sentences inside the clip window.
  const sentences = toSentences(words, { minWords: spec.minWords, pauseSplit: spec.pauseSplit }).filter((s) =>
    s[0].start >= spec.clipStart - 0.5 && s[s.length - 1].end <= spec.clipEnd + 0.5);
  let segments = sentences.map((s, i) => {
    const next = sentences[i + 1];
    const start = Math.max(0, s[0].start - LEAD_IN);
    let end = s[s.length - 1].end + TAIL;
    // Never run into the next segment's lead-in.
    if (next) end = Math.max(s[s.length - 1].end, Math.min(end, next[0].start - LEAD_IN));
    return {
      start: Math.round(start * 100) / 100,
      end: Math.round(end * 100) / 100,
      text: balanceQuotes(SEGMENT_FIXES.reduce((t, [re, rep]) => t.replace(re, rep), s.map((w) => w.text).join(' '))),
    };
  });
  // A word the LCS paired with the wrong ASR token (e.g. a quoted "Right."
  // matched to the next line's "right") can still push an end past the
  // next start — clamp so segments never overlap.
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i].end > segments[i + 1].start) segments[i].end = segments[i + 1].start;
  }
  // endAt: { n: seconds } — the ASR timed a segment's last word far too
  // late (a Short's final word placed at the end of the outro music).
  for (const [n, end] of Object.entries(spec.endAt || {})) segments[n - 1].end = end;
  // join: glue segment n to n + 1; skip: leave out a line the captions
  // mangled. Both count in the original 1-based numbering.
  if (spec.join) {
    for (const n of [...spec.join].sort((a, b) => b - a)) {
      const [a, b] = [segments[n - 1], segments[n]];
      const text = SEGMENT_FIXES.reduce((t, [re, rep]) => t.replace(re, rep), `${a.text} ${b.text}`);
      segments.splice(n - 1, 2, { start: a.start, end: b.end, text }, null);
    }
  }
  if (spec.skip) segments = segments.filter((_, i) => !spec.skip.includes(i + 1));
  segments = segments.filter(Boolean);
  if (spec.fixCaps) fixCaps(segments);
  // Unscripted speech: a new sentence the ASR left lowercase ("probably
  // because…") gets its capital back.
  for (let i = 1; i < segments.length; i++) {
    if (endsSentence(segments[i - 1].text) && !/(\.\.\.|…)$/.test(segments[i - 1].text) && /^[a-z]/.test(segments[i].text)) {
      segments[i].text = segments[i].text[0].toUpperCase() + segments[i].text.slice(1);
    }
  }
  const { clipStart, clipEnd, stripSpeakers, useAutoText, transcript: _tr, endAt: _ea, minWords, dropFillers: _df, pauseSplit, fixCaps: _fc, skip: _sk, join: _jn, ...meta } = spec;
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
      const { clipStart, clipEnd, stripSpeakers, useAutoText, transcript: _tr, endAt: _ea, minWords, dropFillers: _df, pauseSplit, fixCaps: _fc, skip: _sk, join: _jn, ...meta } = spec;
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
