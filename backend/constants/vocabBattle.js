'use strict';

// ⚔️ Đấu trường từ vựng — rules (services/vocabBattleService.js).

// Question kinds of a 'quiz' room. `label` is what the create form and the
// review screen show; `limit` is the seconds a player gets per question.
const QUESTION_TYPES = {
  synonym: { label: 'Đồng nghĩa',         limit: 15 },
  antonym: { label: 'Trái nghĩa',         limit: 15 },
  meaning: { label: 'Nghĩa của từ',       limit: 15 },
  image:   { label: 'Nhìn hình đoán từ',  limit: 15 },
  match:   { label: 'Nối từ – nghĩa',     limit: 45 },
  order:   { label: 'Ghép câu',           limit: 45 },
  listen:  { label: 'Nghe & điền từ',     limit: 30 },
  spell:   { label: 'Nghe & gõ từ',       limit: 25 },
};
const TYPE_KEYS = Object.keys(QUESTION_TYPES);

// Where the words come from (services/vocabBattleBank.js loadPools). `types`
// = the question kinds that source can feed — antonyms come from the
// built-in list, so every source can have them; pictures exist in Vocab
// Topics and "Từ có hình ảnh"; Đồng nghĩa needs paraphrase pairs.
//   paraphrase  Học Paraphrase (Cambridge Reading text ↔ question wording)
//   topics      Vocab Topics lessons
//   writing     Task 2 topic vocab (Luyện đề tuần)
//   readlisten  Học Paraphrase + Listening glossaries + words students
//               saved from Reading / Listening tests
//   dictionary  the site dictionary: collocations + phrase alternatives
//   pictures    "Nhìn hình đoán từ" words (BattleWord kind 'picture':
//               Fluent Emoji pictures, scripts/vocabBattlePictures)
//   wikt        Từ điển mở — ~6k common words the site doesn't teach, meaning
//               from Vietnamese Wiktionary (BattleWord kind 'dict',
//               scripts/vocabBattleDict) + words admins add
// `sets` = the kinds of word set it reads (null = every set): topics,
// writing, para, listening, saved, dictionary, pictures, wikt
// (vocabBattleBank loadPools).
const SOURCES = {
  all:        { label: 'Tất cả',               sets: null, types: TYPE_KEYS },
  topics:     { label: 'Vocab Topics',         sets: ['topics'], types: ['antonym', 'meaning', 'image', 'match', 'order', 'listen', 'spell'] },
  readlisten: { label: 'Reading & Listening',  sets: ['para', 'listening', 'saved'], types: ['synonym', 'antonym', 'meaning', 'match', 'order', 'listen', 'spell'] },
  writing:    { label: 'Writing Task 2',       sets: ['writing'], types: ['antonym', 'meaning', 'match', 'order', 'listen', 'spell'] },
  paraphrase: { label: 'Học Paraphrase',       sets: ['para'], types: ['synonym', 'antonym', 'meaning', 'match'] },
  dictionary: { label: 'Từ điển',              sets: ['dictionary'], types: ['synonym', 'antonym', 'meaning', 'match', 'order', 'listen', 'spell'] },
  pictures:   { label: 'Từ có hình ảnh',       sets: ['pictures'], types: ['image', 'meaning', 'match', 'spell'] },
  wikt:       { label: 'Từ điển mở (Wiktionary)', sets: ['wikt'], types: ['antonym', 'meaning', 'match', 'order', 'listen', 'spell'] },
};

const COUNTS = [5, 10, 15, 20, 30];          // quiz: questions; chain: words in the whole game
const MAX_PLAYERS = 4;                       // host + 3
const MAX_OPEN = 5;                          // open/playing rooms one student can be in
const MIN_STAKE = 5;
const MAX_STAKE = 100;                       // 0 = trận giao hữu (friendly)
const INVITE_HOURS = 24;                     // quiz: time to accept AND play; chain: lobby lifetime
const GRACE_MS = 3000;                       // network slack on a question's time limit
const SPEED_BONUS = 50;                      // on top of 100 per fully-right question

// Nối chữ
const TURN_SECONDS = [10, 15, 20, 30];
const LIVES = [1, 2, 3];
const CHAIN_MIN_LEN = 3;
const CHAIN_BANK_BONUS = 10;                 // word taught on the site (Topics/Paraphrase)
const CHAIN_SURVIVOR_BONUS = 30;             // last one standing

// Chơi một mình
const SOLO_HOURS = 3;                        // an abandoned solo run closes after this
const BOT = { id: '000000000000000000000b07', name: 'Lulu 🤖' };
const BOT_MS = 1600;                         // the bot "thinks" this long before its word
const BOT_FAIL = [0.04, 0.02];               // chance it misses: base + per word it has played

// Trận giao hữu (no stake): the winner gets a little 🔥, capped per VN day so
// two friends can't farm the wallet by losing to each other on purpose.
const FRIENDLY_WIN_FLAMES = 3;
const FRIENDLY_DAILY_WINS = 3;

// Admin "⚔️ Đấu trường" → Cài đặt (services/vocabBattleSettings.js) changes
// the values above in place (this object), so every rule is read as R.X at
// the time it's used. These two exist only as settings:
const ENABLED = true;                        // false = no new rooms (running ones finish)
const DISABLED_TYPES = [];                   // question kinds switched off
const DISABLED_SOURCES = [];                 // word sources switched off
const BLOCKED_WORDS = new Set();             // Nối chữ: words admins took out

module.exports = {
  QUESTION_TYPES, TYPE_KEYS, SOURCES, COUNTS, MAX_PLAYERS, MAX_OPEN,
  MIN_STAKE, MAX_STAKE, INVITE_HOURS, GRACE_MS, SPEED_BONUS,
  TURN_SECONDS, LIVES, CHAIN_MIN_LEN, CHAIN_BANK_BONUS, CHAIN_SURVIVOR_BONUS,
  FRIENDLY_WIN_FLAMES, FRIENDLY_DAILY_WINS, SOLO_HOURS, BOT, BOT_MS, BOT_FAIL,
  ENABLED, DISABLED_TYPES, DISABLED_SOURCES, BLOCKED_WORDS,
};
