// READ-ONLY: compare the answer keys of each Vol part (typed from the KEY page) with every bank section's keys
// (same question numbers). Re-recorded copies of one exam share ≥ 70 % of keys even when transcripts differ.
//   node vol2_keys_dedupe.js
const fs = require('fs'), path = require('path');
const bank = JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'sections.json'), 'utf8'));
const K = {
  1: ['Atkinson|EL14 2BF|Queens|1986|5|Flashing|Bright|Central|Screen|strain', 'A|B|C|family|feed the animals|adults|50 years|C|E|G', '?|shoppers|the price|?|?|A|C|B|E|D', 'preserved|trace|buried|mineral|affordable|flashing|dimension|rocks|images|sediments'],
  2: ['Individual|item|equipment|700|costs|airline|B|C|C|D', '30 years ago|?|?|glasses|?|recordings|?|?|?|?', 'A|B|C|B|A|B|C|A|C|B', 'shape|dives|soft|sleep|protein|migration|surface|power|depth|energy'],
  3: ['15|ice skating|Sunday|16th October|3|free drinks|museum|A|C|E', 'G|B|C|F|D|in the town library|local food|in the college|a housing area|a politician', 'B|A|A|C|B|B|A|C|E|F', 'satellite|radio|signals|human|head|helicopter|direct|navigate|sun|birds'],
  4: ['swimming pool|lift|kitchen|children|green|50 minutes|behind the mall|D|E|B', 'B|B|C|A|B|A|F|C|B|G', 'C|A|A|A|E|G|C|A|B|H', 'driving|coffee|meat|cooking|energy|transportation|forests|mountain|food|fishing'],
  5: ['central|address|basement|roof|lounge|Spanish|red|July|Cliffton|093036602', 'A|B|C|B|A|C|E|A|D|B', 'A|C|B|C|B|C|A|D|E|B', 'wealthy residents|food|business|large-scale|mobility|trade|B|C|F|E'],
  6: ['C|A|B|B|third|first traffic light|21 Eagle|AL2 1DY|toothache|none', 'F|B|E|A|C|shower|basement|food containers|access code|11.30 pm', 'B|B|C|C|A|A|E|D|A|B', 'volcano|smoke|flower|grass|bacteria|carpet|fossils|radio|storm|century'],
  7: ['C|A|B|A|B|C|C|A|Cotehele|SH12LLQ', 'Share ideas|Much deeper research|Mountain building|17th May|29th May|30-40 minutes|discussion|Journal|Internet|Photo copy', 'traveling|get good shoes|Wearing formal clothes|Large office|good pay|live nearly|B|C|B|A', 'Health increase|Internal clock|Light dark|Unsocial hours|Heart stomach|Depression|Mental ability|Performance|Family life|friends'],
  8: ['radio|LS142JW|hennings.co.uk|2|joint|49|The Union Bank|15 October|JYZ37|video', 'C|B|A|B|A|B|C|D|C|E', 'C|A|C|A|B|E|B|C|F|A', 'Salts|Hospitals|Slow|Health International|9|Family|Glass|12.5|Germs|collection tank'],
  9: ['front|Week|Parkhurst|personal|colour|80|normal|cheque|mail|day', 'C|A|A|C|B|J|C|B|E|F', 'B|A|C|B|A|A|D|A|E|C', 'researchers|theatre|production|army|bright|charts|stars|length|wind|building'],
  10: ['Bittens|group|23|12.50|back|wheel chair|lift|library|vegetarian|pizza', 'C|A|B|A|B|A|A|C|B|C', 'A|A|C|C|B|B|C|A|F|G', 'company|original|description|engineering|communication|language|salary|lonely|industrial|government'],
};
const n = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const bankKeys = bank.map(s => {
  const m = {};
  for (const g of s.questionGroups || []) for (const q of g.questions || []) m[q.questionNumber] = String(q.correctAnswer || '').split('/').map(n);
  return { s, m };
});
for (const [t, parts] of Object.entries(K)) parts.forEach((line, i) => {
  const keys = line.split('|'), start = i * 10 + 1;
  const words = keys.map((k, j) => [start + j, n(k)]).filter(([, k]) => k && k !== '' && k.length > 1);
  const best = bankKeys.filter(b => b.s.partNumber === i + 1).map(b => {
    let hit = 0, all = 0;
    keys.forEach((k, j) => { if (k === '?') return; all++; const v = b.m[start + j]; if (v && v.some(x => x && (x === n(k) || (x.length > 2 && n(k).includes(x)) || (n(k).length > 2 && x.includes(n(k)))))) hit++; });
    // fill-word overlap anywhere in the part (order-independent)
    const anyw = words.filter(([, k]) => Object.values(b.m).some(v => v.includes(k))).length;
    return { b, hit, all, anyw };
  }).sort((a, c) => (c.hit + c.anyw) - (a.hit + a.anyw))[0];
  const flag = (best.anyw >= 3 || best.hit >= 7) ? '  <<<< CHECK' : '';
  console.log(`T${t} P${i + 1}: best [${best.b.s.title}] pos ${best.hit}/${best.all} words ${best.anyw}/${words.length} ${best.b.s._id}${flag}`);
});
