// What a dictation check teaches back (pages/Dictation.jsx):
//   analyzeMistakes — each wrong word sorted into a kind of listening
//                     mistake (ending -s, weak form, th-sound, teen/ty…)
//   linkingGuide    — how the sentence links when spoken (nối âm)
// All rule-based from spelling, so it works offline and instantly; the
// sound rules are approximations of standard British speech, shown as tips.

import { normWord } from './dictation';

// The mistake kinds. `tip` is the default advice; some mistakes bring a
// more specific `note` of their own (which two sounds were confused).
export const MISTAKE_TYPES = {
  case: { label: 'Viết hoa tên riêng', icon: '🔠', tip: 'Tên riêng phải viết hoa chữ cái đầu. Mẹo: bật Caps Lock suốt bài thi Listening — viết IN HOA toàn bộ thì không bao giờ sai.' },
  ending_s: { label: 'Âm cuối -s / -es', icon: '🐍', tip: 'Âm /s/ /z/ /ɪz/ cuối từ rất nhẹ — để ý danh từ số nhiều và động từ ngôi thứ ba số ít.' },
  ending_ed: { label: 'Âm cuối -ed', icon: '⏪', tip: '-ed đọc /t/ /d/ /ɪd/ và hay nối sang từ sau — dựa vào ngữ pháp (quá khứ, bị động) để điền.' },
  final_sound: { label: 'Mất âm cuối', icon: '✂️', tip: 'Người bản xứ đọc phụ âm cuối (t, d, k, p…) rất nhẹ. Nghe ở tốc độ 0.75× và chú ý cuối từ.' },
  weak_form: { label: 'Từ đọc nhẹ (dạng yếu)', icon: '🪶', tip: 'to, of, and, a, the, for, can… đọc rất nhẹ (/tə/, /əv/, /ən/…). Câu thiếu ngữ pháp là dấu hiệu bạn sót từ nhỏ.' },
  linking: { label: 'Dính từ do nối âm', icon: '🔗', tip: 'Phụ âm cuối nối sang nguyên âm đầu từ sau ("pick‿up" nghe như "pi-ckup") — tách lại từ theo nghĩa.' },
  homophone: { label: 'Từ đồng âm', icon: '👯', tip: 'Hai từ đọc giống nhau (there/their, to/two…) — chọn theo nghĩa và ngữ pháp của câu.' },
  sound: { label: 'Nghe nhầm âm', icon: '👂', tip: 'Hai âm gần nhau — nghe lại chậm và so sánh khẩu hình.' },
  number: { label: 'Số -teen / -ty', icon: '🔢', tip: '-teen (13–19) nhấn âm cuối, kéo dài /tiːn/; -ty (30–90) nhấn âm đầu, /ti/ ngắn.' },
  digits: { label: 'Thiếu / thừa / sai chữ số', icon: '📞', tip: 'Viết theo nhóm 3–4 số trong lúc nghe; "double 5" = 55, "oh" = 0.' },
  double: { label: 'Chữ / số đôi (double)', icon: '✌️', tip: '"double P" = PP, "triple 5" = 555 — đừng chỉ ghi một chữ.' },
  letter: { label: 'Nhầm tên chữ cái', icon: '🔤', tip: 'Ôn bảng chữ cái: A /eɪ/, E /iː/, I /aɪ/, G /dʒiː/, J /dʒeɪ/, R /ɑː/, Y /waɪ/.' },
  spelling: { label: 'Sai chính tả', icon: '✏️', tip: 'Nghe đúng từ nhưng viết sai — chép lại từ đúng 2–3 lần cho nhớ mặt chữ.' },
  missed: { label: 'Bỏ sót từ', icon: '🕳️', tip: 'Nghe lại (Ctrl) và đếm số từ; từ chưa chắc cứ viết thử, đừng bỏ trống.' },
  wrong_word: { label: 'Nghe nhầm sang từ khác', icon: '🔀', tip: 'Dựa vào nghĩa cả câu để đoán lại từ nghe được.' },
  extra: { label: 'Thêm từ thừa', icon: '➕', tip: 'Chỉ ghi những gì nghe được — đừng thêm từ theo thói quen.' },
};

// Short words said in their weak form inside a sentence
export const WEAK_FORMS = {
  a: '/ə/', an: '/ən/', the: '/ðə/', to: '/tə/', of: '/əv/', and: '/ən/', for: '/fə/', from: '/frəm/',
  at: '/ət/', as: '/əz/', can: '/kən/', could: '/kəd/', was: '/wəz/', were: '/wə/', are: '/ə/',
  have: '/həv/', has: '/həz/', had: '/həd/', do: '/də/', does: '/dəz/', some: '/səm/', them: '/ðəm/',
  than: '/ðən/', but: '/bət/', that: '/ðət/', your: '/jə/', you: '/jə/', been: '/bɪn/', will: '/əl/',
  would: '/wəd/', should: '/ʃəd/', must: '/məs/', or: '/ə/', there: '/ðə/', him: '/ɪm/', her: '/ə/',
};
const FUNCTION_WORDS = new Set([...Object.keys(WEAK_FORMS), 'in', 'on', 'is', 'be', 'it', 'its', "it's", 'by', 'up', 'we', 'he', 'she', 'they', 'i', 'my', 'our', 'his', 'their', 'this', 'these', 'those', 'not', 'so', 'if', 'all', 'into', 'with', 'about', 'am', "i'm", "it's", "that's", "there's"]);

const HOMOPHONES = [
  ['there', 'their', "they're"], ['to', 'too', 'two'], ['for', 'four'], ['right', 'write'], ['hear', 'here'],
  ['know', 'no'], ['knew', 'new'], ['see', 'sea'], ['weather', 'whether'], ['its', "it's"], ['your', "you're"],
  ['by', 'buy', 'bye'], ['which', 'witch'], ['whole', 'hole'], ['weak', 'week'], ['meet', 'meat'], ['flower', 'flour'],
  ['one', 'won'], ['eight', 'ate'], ['sun', 'son'], ['piece', 'peace'], ['fair', 'fare'], ['mail', 'male'],
  ['sale', 'sail'], ['wait', 'weight'], ['road', 'rode'], ['hour', 'our'], ['allowed', 'aloud'], ['break', 'brake'],
  ['course', 'coarse'], ['principal', 'principle'], ['stationary', 'stationery'], ['wear', 'where'], ['whose', "who's"],
];
const HOMO = new Map();
HOMOPHONES.forEach((g) => g.forEach((w) => HOMO.set(w, g)));

const TEEN_TY = [['thirteen', 'thirty'], ['fourteen', 'forty'], ['fifteen', 'fifty'], ['sixteen', 'sixty'], ['seventeen', 'seventy'], ['eighteen', 'eighty'], ['nineteen', 'ninety']];
const TEEN_TY_DIGITS = TEEN_TY.map((_, k) => [`1${k + 3}`, `${k + 3}0`]);

// How each letter's name is said — "Nhầm chữ G ↔ J"
const LETTER_IPA = {
  a: '/eɪ/', b: '/biː/', c: '/siː/', d: '/diː/', e: '/iː/', f: '/ef/', g: '/dʒiː/', h: '/eɪtʃ/', i: '/aɪ/',
  j: '/dʒeɪ/', k: '/keɪ/', l: '/el/', m: '/em/', n: '/en/', o: '/əʊ/', p: '/piː/', q: '/kjuː/', r: '/ɑː/',
  s: '/es/', t: '/tiː/', u: '/juː/', v: '/viː/', w: '/ˈdʌbəl juː/', x: '/eks/', y: '/waɪ/', z: '/zed/',
};

// Two sounds that are easy to mix up, found by the letters that differ
const SOUND_PAIRS = [
  { test: (x, y) => /th/.test(x) && /^(t|d|s|f|z|v|)$/.test(y), note: 'Âm /θ/ /ð/ (th): đầu lưỡi đặt giữa hai hàm răng — khác /t/ /d/ /s/.' },
  { test: (x, y) => /^(v|w|b|f)$/.test(x) && /^(v|w|b|f)$/.test(y) && (x === 'v' || y === 'v' || x === 'w' || y === 'w'), note: 'Âm /v/ – /w/ – /b/: /v/ môi dưới chạm răng trên, /w/ tròn môi, /b/ mím môi bật hơi.' },
  { test: (x, y) => /^(l|r|ll|rr)$/.test(x) && /^(l|r|ll|rr)$/.test(y), note: 'Âm /l/ – /r/: /l/ đầu lưỡi chạm lợi trên, /r/ lưỡi cong, không chạm.' },
  { test: (x, y) => /^(s|ss|sh|ch|c|z|x|tch)$/.test(x) && /^(s|ss|sh|ch|c|z|x|tch)$/.test(y), note: 'Âm /s/ – /ʃ/ – /tʃ/ (s / sh / ch): /ʃ/ tròn môi, hơi dày; /tʃ/ bật mạnh.' },
  { test: (x, y) => /^(p|b|t|d|k|g|c|ck)$/.test(x) && /^(p|b|t|d|k|g|c|ck)$/.test(y), note: 'Âm vô thanh – hữu thanh (p/b, t/d, k/g): đặt tay lên cổ, hữu thanh thì cổ rung.' },
  { test: (x, y) => /^(n|ng|m|nn|mm)$/.test(x) && /^(n|ng|m|nn|mm)$/.test(y), note: 'Âm mũi /n/ – /ŋ/ – /m/ ở cuối từ: /ŋ/ (ng) phát ra từ cuống lưỡi.' },
  { test: (x, y) => /^[aeiouy]+$/.test(x) && /^[aeiouy]+$/.test(y), note: 'Nguyên âm gần nhau (ship/sheep, full/fool, bed/bad): chú ý âm dài – ngắn, miệng mở rộng hay hẹp.' },
];

// The differing middle of two words: "think" / "sink" → "th" / "s"
function diffCore(a, b) {
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p += 1;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s += 1;
  return [a.slice(p, a.length - s), b.slice(p, b.length - s)];
}

function endingKind(a, b) {
  const pair = (long, short) => long === `${short}s` || long === `${short}es` || long === `${short}'s` || long === `${short}s'`
    || (short.endsWith('y') && long === `${short.slice(0, -1)}ies`);
  if (pair(a, b) || pair(b, a)) return 'ending_s';
  const ed = (long, short) => long === `${short}ed` || long === `${short}d` || (short.endsWith('y') && long === `${short.slice(0, -1)}ied`)
    || (long.endsWith('ed') && long === `${short}${short.slice(-1)}ed`);
  if (ed(a, b) || ed(b, a)) return 'ending_ed';
  return '';
}

function teenTy(a, b) {
  return TEEN_TY.some(([t, y]) => (a === t && b === y) || (a === y && b === t))
    || (a.length === b.length && TEEN_TY_DIGITS.some(([t, y]) => (a.includes(t) && b.includes(y)) || (a.includes(y) && b.includes(t))));
}

// One wrong word of a sentence: typed `a` where the sentence has `b`
function classifyWord(typedRaw, wordRaw, typo) {
  const a = normWord(typedRaw);
  const b = normWord(wordRaw);
  const digits = /^\d+$/.test(a) && /^\d+$/.test(b);
  if (teenTy(a, b)) return { type: 'number' };
  if (digits) return { type: a.length === b.length ? 'digits' : doubled(a, b) ? 'double' : 'digits' };
  const ending = endingKind(a, b);
  if (ending) return { type: ending };
  if (HOMO.get(a)?.includes(b)) return { type: 'homophone', note: `"${wordRaw}" và "${typedRaw}" đọc giống nhau — câu này cần "${wordRaw}".` };
  if (FUNCTION_WORDS.has(a) && FUNCTION_WORDS.has(b)) {
    return { type: 'weak_form', note: WEAK_FORMS[b] ? `"${b}" đọc nhẹ thành ${WEAK_FORMS[b]} nên dễ nghe nhầm.` : '' };
  }
  if (b.length - a.length <= 2 && b.length > a.length && b.startsWith(a) && a.length >= 2) {
    return { type: 'final_sound', note: `Thiếu "${b.slice(a.length)}" ở cuối — âm cuối đọc rất nhẹ.` };
  }
  // "sink" for "think": the rest of the word is the same, only a sound differs
  const [x, y] = diffCore(a, b);
  if ((x || y) && x.length <= 3 && y.length <= 3 && Math.min(a.length, b.length) >= 2) {
    const pair = SOUND_PAIRS.find((sp) => sp.test(x, y) || sp.test(y, x));
    if (pair) return { type: 'sound', note: pair.note };
  }
  return { type: typo ? 'spelling' : 'wrong_word' };
}

// "5" for "55", "kipax" for "kippax"
function doubled(a, b) {
  for (let k = 0; k < b.length - 1; k++) {
    if (b[k] === b[k + 1] && b.slice(0, k) + b.slice(k + 1) === a) return true;
  }
  return false;
}

// A drill answer (a name spelled out, a phone number, a code)
function classifyDrillWord(typedRaw, wordRaw) {
  const a = normWord(typedRaw);
  const b = normWord(wordRaw);
  if (teenTy(a, b)) return { type: 'number' };
  if (doubled(a, b)) return { type: 'double', note: `"${wordRaw}" có chữ đôi — nghe "double…" thì viết hai lần.` };
  if (/^\d+$/.test(b) || /^\d+$/.test(a)) return { type: 'digits' };
  if (a.length === b.length) {
    const swaps = [];
    for (let k = 0; k < b.length; k++) {
      if (a[k] !== b[k] && LETTER_IPA[a[k]] && LETTER_IPA[b[k]]) swaps.push(`${b[k].toUpperCase()} ${LETTER_IPA[b[k]]} ↔ ${a[k].toUpperCase()} ${LETTER_IPA[a[k]]}`);
    }
    if (swaps.length && swaps.length <= 2) return { type: 'letter', note: `Nhầm chữ ${swaps.join(', ')}.` };
  }
  return { type: 'spelling' };
}

// The mistakes of one check (`r` = diffSentence's result): one row per
// wrong word, { type, typed, word, note }.
export function analyzeMistakes(r, sentence) {
  if (!r || r.perfect) return [];
  return collectMistakes(r, sentence).map((m) => ({ ...m, typed: bare(m.typed), word: bare(m.word) }));
}
// "it." → "it" for showing
const bare = (w) => String(w || '').replace(/^[^\w'’]+|[^\w'’]+$/g, '');

function collectMistakes(r, sentence) {
  const isDrill = !!sentence?.answer;
  const out = [];
  for (const c of r.caseErrors || []) {
    out.push({ type: 'case', typed: c.typed, word: c.word, note: `Viết "${c.word}", không phải "${c.typed}".` });
  }
  for (const t of r.tokens) {
    if (t.kind === 'ok' || t.kind === 'case') continue;
    if (t.kind === 'typo' || t.kind === 'wrong') {
      if (t.linking) { out.push({ type: 'linking', typed: t.typed, word: t.word, note: `Bạn nghe "${t.typed}" — thực ra là "${t.word}" đọc nối vào nhau.` }); continue; }
      const k = isDrill ? classifyDrillWord(bare(t.typed), bare(t.word)) : classifyWord(bare(t.typed), bare(t.word), t.kind === 'typo');
      out.push({ type: k.type, typed: t.typed, word: t.word, note: k.note || '' });
    } else if (t.kind === 'miss') {
      const w = normWord(t.word);
      if (isDrill) out.push({ type: /^\d+$/.test(w) ? 'digits' : 'missed', word: t.word, typed: '', note: '' });
      else if (WEAK_FORMS[w] || FUNCTION_WORDS.has(w)) out.push({ type: 'weak_form', word: t.word, typed: '', note: WEAK_FORMS[w] ? `"${w}" đọc lướt thành ${WEAK_FORMS[w]} nên rất dễ sót.` : `"${w}" đọc lướt nên dễ sót.` });
      else out.push({ type: 'missed', word: t.word, typed: '', note: '' });
    } else if (t.kind === 'extra') {
      out.push({ type: isDrill && /^\d+$/.test(normWord(t.typed)) ? 'digits' : 'extra', typed: t.typed, word: '', note: '' });
    }
  }
  return out;
}

// { type: count } over many checks' mistakes, biggest first
export function tallyMistakes(lists) {
  const n = {};
  lists.flat().forEach((m) => { if (m?.type) n[m.type] = (n[m.type] || 0) + 1; });
  return Object.entries(n).sort((x, y) => y[1] - x[1]).map(([type, count]) => ({ type, count }));
}

// ── Nối âm ─────────────────────────────────────────────────────────────

const VOWEL = /[aeiou]/;
const clean = (w) => w.toLowerCase().replace(/[’‘ʼ`´]/g, "'").replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '').replace(/'/g, '');

// How a word ends, sound-wise: C (consonant, with which), J / W (a vowel
// that glides into /j/ or /w/ before another vowel), R (British r, only
// said before a vowel), V (another vowel — no linking sound)
function endSound(w) {
  if (!/^[a-z]+$/.test(w)) return null;
  if (['he', 'she', 'we', 'me', 'be', 'the'].includes(w)) return { t: 'J' };
  if (w === 'a') return { t: 'V' };
  if (/(igh|eigh)$/.test(w) || /(ay|ey|oy|ee|ie|y)$/.test(w) || w === 'i') return { t: 'J' };
  if (/(ough)$/.test(w)) return /^(through|though|although|dough)$/.test(w) ? { t: 'W' } : { t: 'C', c: 'f' };
  if (/(ow|ew|oo|ue|oe|o|u)$/.test(w)) return { t: 'W' };
  if (/[aeiou]re$|[aeiou]r$|rr$/.test(w)) return { t: 'R' };
  if (/(aw|a|ah|oh)$/.test(w)) return { t: 'V' };
  if (/e$/.test(w) && w.length >= 3 && !VOWEL.test(w[w.length - 2])) {
    // silent e: "make" ends in /k/ — head "ma", tail "k"
    if (/the$/.test(w)) return { t: 'C', c: 'ð', head: w.slice(0, -3), tail: 'th' };
    const k = w[w.length - 2];
    return { t: 'C', c: { c: 's', g: 'dʒ', s: 'z' }[k] || k, head: w.slice(0, -2), tail: k };
  }
  if (/[aeiou]e$/.test(w)) return { t: 'V' };
  const m = w.match(/(ck|ng|th|sh|ch|ph|ll|ss|ff|tt|dd|zz|[b-df-hj-np-tv-z])$/);
  if (!m) return null;
  const c = { ck: 'k', ph: 'f', ll: 'l', ss: 's', ff: 'f', tt: 't', dd: 'd', zz: 'z', c: 'k', x: 'ks' }[m[1]] || m[1];
  return { t: 'C', c, head: w.slice(0, -m[1].length), tail: m[1] };
}

function startSound(w) {
  if (!/^[a-z]/.test(w)) return null;
  if (/^(hour|honest|honou?r|heir)/.test(w)) return { t: 'V' };
  if (/^(one|once)$/.test(w)) return { t: 'C', c: 'w' };
  if (/^(uni|use|usu|ur[aeiou]|eu|ewe)/.test(w)) return { t: 'C', c: 'j' };
  if (/^[aeiou]/.test(w)) return { t: 'V' };
  if (/^y/.test(w)) return { t: 'C', c: 'j' };
  const m = w.match(/^(th|sh|ch|ph|wh|kn|wr|qu|c[eiy]|c|x|[b-df-hj-np-tv-z])/);
  const c = { ph: 'f', wh: 'w', kn: 'n', wr: 'r', qu: 'k', c: 'k', x: 'z' }[m[1]] || (/^c[eiy]/.test(m[1]) ? 's' : m[1]);
  return { t: 'C', c };
}

const PAUSE_AFTER = /[.,;:!?…—–)"”]$/;

// The sentence's links, word by word: words[i].link = how word i joins
// word i+1 (null = no special link), plus a note per link and the weak forms.
export function linkingGuide(text) {
  const raw = String(text || '').split(/\s+/).filter(Boolean);
  const words = raw.map((w) => ({ text: w, link: null }));
  const notes = [];
  for (let i = 0; i < raw.length - 1; i++) {
    if (PAUSE_AFTER.test(raw[i])) continue;
    const w1 = clean(raw[i]);
    const w2 = clean(raw[i + 1]);
    const e = endSound(w1);
    const s = startSound(w2);
    if (!e || !s) continue;
    let link = null;
    if (e.t === 'C' && s.t === 'C' && /^(t|d)$/.test(e.c) && w2[0] === 'y' && /^(you|your|yet|year|yesterday)/.test(w2)) {
      const rest = w2 === 'you' ? 'u' : w2.slice(1);
      link = e.c === 't'
        ? { kind: 'tj', say: `${w1.slice(0, -1)}-ch${rest}`, why: '/t/ + /j/ hoà thành /tʃ/ ("ch").' }
        : { kind: 'dj', say: `${w1.slice(0, -1)}-j${rest}`, why: '/d/ + /j/ hoà thành /dʒ/ ("j").' };
    } else if (e.t === 'C' && s.t === 'C' && /^(him|her|his)$/.test(w2)) {
      link = { kind: 'h', say: `${w1}-${w2.slice(1)}`, why: `"${w2}" đứng sau phụ âm thường mất âm /h/, rồi nối luôn vào từ trước.` };
    } else if (e.t === 'C' && s.t === 'V') {
      link = { kind: 'cv', say: `${e.head}-${e.tail}${w2}`, why: `phụ âm cuối /${e.c}/ nối sang nguyên âm đầu của "${w2}".` };
    } else if (e.t === 'R' && s.t === 'V') {
      const base = w1.replace(/e$/, '');
      link = { kind: 'r', say: `${base.slice(0, -1)}-r${w2}`, why: 'chữ r cuối (giọng Anh vốn không đọc) được đọc lên khi từ sau bắt đầu bằng nguyên âm.' };
    } else if (e.t === 'J' && s.t === 'V') {
      link = { kind: 'j', say: `${w1}-y${w2}`, why: `chèn âm /j/ nhẹ giữa hai nguyên âm${w1 === 'the' ? ' — "the" trước nguyên âm đọc /ði/' : ''}.` };
    } else if (e.t === 'W' && s.t === 'V') {
      link = { kind: 'w', say: `${w1}-w${w2}`, why: 'chèn âm /w/ nhẹ giữa hai nguyên âm.' };
    } else if (e.t === 'C' && s.t === 'C' && e.c === s.c) {
      link = { kind: 'same', say: `${e.head}‿${w2}`, why: `hai âm /${e.c}/ liền nhau chỉ đọc một lần, hơi kéo dài.` };
    } else if (e.t === 'C' && s.t === 'C' && /^(t|d)$/.test(e.c) && /[^aeiou](t|d)$/.test(w1) && w1.length > 2 && !/^(and)$/.test(w1)) {
      link = { kind: 'elide', say: `${w1.slice(0, -1)}(${w1.slice(-1)}) ${w2}`, why: `/${e.c}/ kẹp giữa hai phụ âm thường bị nuốt.` };
    }
    if (link) {
      words[i].link = link.kind;
      notes.push({ pair: `${raw[i].replace(/[^\w'’-]+$/, '')}‿${raw[i + 1].replace(/^[^\w]+|[^\w'’-]+$/g, '')}`, ...link });
    }
  }
  const seen = new Set();
  const weak = [];
  raw.forEach((w, i) => {
    const c = clean(w);
    // the last word of a sentence keeps its strong form
    if (WEAK_FORMS[c] && i < raw.length - 1 && !PAUSE_AFTER.test(w) && !seen.has(c)) { seen.add(c); weak.push({ word: c, ipa: WEAK_FORMS[c] }); }
  });
  return { words, notes: notes.slice(0, 6), weak: weak.slice(0, 8) };
}
