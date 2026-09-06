'use strict';

// Drop dictation sentences that hinge on a proper name a learner can't
// realistically spell just from hearing it — invented place names, foreign
// town/person names, brand names ("Bishlama", "Wivenhoe", "Antikythera",
// "Santander", "Prensky") — and anything spelled out letter by letter
// ("J-A-M-I-E-S-O-N"). Ordinary spellable proper nouns are kept: countries,
// nationalities, days, months, common first names, well-known cities, and
// real English words that only look like a name because they sit inside a
// title (Southern Hemisphere, Prescription Drug Assistance, Motor Show…).
//
// Test for "unspellable", per capitalised word used mid-sentence (i.e. not
// merely sentence-initial): it's a hard name if it is NOT a real English
// word (an-array-of-english-words) AND NOT in the KNOWN_PROPER allowlist
// below AND (when a corpus lexicon is supplied) never seen lowercase there.

let ENGLISH;
try {
  ENGLISH = new Set(require('an-array-of-english-words'));
} catch (_) {
  ENGLISH = new Set(); // dependency missing → fall back to allowlist + lexicon only
}

// letter-by-letter spelling: "W-O-O-D", "W O O D", "K-I-double-P-A-X"
const SPELLED_OUT = /\b[A-Za-z](?:[ .\-–][A-Za-z]){2,}\b|\bdouble[ -][A-Za-z]\b/i;

const MONTHS = 'january february march april may june july august september october november december';
const DAYS = 'monday tuesday wednesday thursday friday saturday sunday';
const COUNTRIES = `england scotland wales ireland britain uk usa america australia canada
  france spain germany italy portugal greece netherlands holland belgium denmark norway
  sweden finland iceland poland russia ukraine austria switzerland hungary romania croatia
  china japan korea vietnam thailand cambodia laos myanmar malaysia singapore indonesia
  philippines india pakistan bangladesh nepal afghanistan iran iraq syria turkey israel
  lebanon jordan arabia qatar kuwait oman yemen egypt libya morocco tunisia algeria sudan
  kenya nigeria ghana somalia uganda tanzania rwanda ethiopia zambia zimbabwe namibia
  madagascar mauritius seychelles botswana senegal cameroon
  brazil argentina chile peru bolivia ecuador venezuela colombia uruguay paraguay
  mexico guatemala cuba jamaica haiti panama
  samoa tonga fiji tahiti vanuatu dubai zealand newzealand hongkong kong`;
const NATIONALITIES = `english scottish welsh irish british american australian canadian
  french spanish german italian portuguese greek dutch belgian danish norwegian swedish
  finnish polish russian austrian swiss hungarian romanian croatian
  chinese japanese korean vietnamese cambodian thai malaysian indonesian filipino
  indian pakistani bangladeshi nepali nepalese iranian iraqi turkish israeli arab
  egyptian moroccan tunisian algerian kenyan nigerian ghanaian ethiopian somali
  brazilian argentine argentinian chilean peruvian bolivian colombian venezuelan
  mexican cuban jamaican madagascan madagascans malagasy
  european asian african scandinavian polynesian melanesian
  maori aboriginal aborigine`;
const CONTINENTS = 'europe asia africa antarctica oceania americas pacific atlantic arctic indian mediterranean caribbean scandinavia';
// well-known cities/regions a learner may reasonably know (and spell)
const CITIES = `london paris berlin madrid barcelona rome milan venice florence naples
  amsterdam rotterdam brussels vienna zurich geneva munich frankfurt hamburg cologne
  prague warsaw budapest athens lisbon porto dublin edinburgh glasgow manchester
  liverpool birmingham leeds bristol sheffield newcastle nottingham oxford cambridge
  cardiff belfast aberdeen brighton york bath canterbury
  moscow kiev istanbul cairo nairobi lagos casablanca
  beijing shanghai tokyo osaka kyoto seoul busan bangkok singapore hanoi jakarta
  manila mumbai delhi bangalore chennai kolkata karachi lahore dhaka kathmandu
  dubai doha riyadh tehran
  sydney melbourne brisbane perth adelaide canberra auckland wellington christchurch
  toronto montreal vancouver ottawa
  newyork chicago boston philadelphia washington miami atlanta houston dallas
  losangeles sanfrancisco seattle denver phoenix vegas
  texas california florida ontario quebec queensland tasmania`;
// generic words capitalised only because they're inside a name/title
const TITLE_WORDS = `street road avenue lane drive way close court square crescent terrace
  gardens park green common heath moor dale vale glen
  centre center hall house home inn lodge cottage cabin farm villa manor cottage
  apartment building block tower wing room floor level suite office shop store studio
  market mall arcade plaza
  school college university academy institute faculty department division
  library museum gallery theatre theater cinema stadium arena club pavilion
  bar cafe restaurant bistro bakery brasserie kitchen
  pharmacy hospital clinic surgery practice
  station airport terminal harbour harbor port dock quay wharf pier jetty marina
  bridge tunnel gate roundabout junction
  church cathedral chapel abbey priory temple mosque synagogue shrine
  castle palace fort tower monument memorial obelisk
  river lake loch pond mere reservoir stream brook canal falls
  bay beach cove strand shore coast cliff headland point ness
  hill mount mountain peak ridge fell tor down downs
  wood woods forest grove copse thicket
  island isle islet peninsula cape reserve sanctuary
  garden orchard vineyard nursery allotment
  north south east west northern southern eastern western central upper lower middle inner outer
  new old great little grand royal national international regional local
  city town village hamlet borough county state province region district
  department division section unit team group panel board committee
  society association federation union league guild trust foundation institute council
  company limited corporation enterprises holdings partners associates group
  services solutions systems networks technologies industries
  festival exhibition fair fete carnival gala pageant conference convention summit
  forum expo showcase awards prize
  radio television press news media magazine journal review gazette herald times post
  spring summer autumn fall winter
  day night eve morning afternoon evening weekend
  saint mount lake port cape fort`;
const TITLES = 'mr mrs ms miss dr prof professor sir madam dame lord lady rev reverend father sister brother captain colonel sergeant';
// common English given names (spellable)
const NAMES = `james john robert michael william david richard joseph thomas charles chris
  christopher daniel dan matthew matt anthony tony mark donald steven steve paul andrew andy
  josh joshua kenneth ken kevin brian george edward ed ronald ron timothy tim jason
  jeffrey jeff ryan gary jacob jake nicholas nick eric jonathan jon stephen larry justin
  scott brandon frank francis benjamin ben gregory greg samuel sam raymond ray patrick pat
  jack dennis jerry tyler aaron jose adam nathan nate henry zachary zach douglas doug kyle
  noah ethan jeremy jerry walter wally christian keith roger terry austin sean shaun shawn
  gerald carl harold dylan arthur art lawrence lawrie jordan jesse bryan bryce billy bruce
  gabriel gabe joe joey logan alan allan albert al willie elijah wayne randy vincent vince
  mason roy ralph bobby russell russ bradley brad philip phil phillip eugene marcus marc
  marco todd nick rob rick mick mike dean basil fergus angus hamish callum ian iain evan
  johnson johnston williams brown miller davis wilson taylor moore martin clark walker
  hall young king wright hill baker carter phillips evans turner parker campbell murphy
  cooper cook morris bell bailey ward watson jackson gray grey barker marsh reed
  mary patricia pat jennifer jenny linda elizabeth liz beth barbara susan sue suzy susie
  jessica jess sarah sara karen nancy lisa betty margaret meg sandra sandy ashley kim
  kimberly emily donna michelle dorothy dot carol carole amanda mandy melissa deborah deb
  debbie stephanie steph rebecca becky becca sharon shannon cynthia cindy kathleen kathy
  amy shirley angela angie helen brenda pamela pam nicole nikki emma samantha katherine
  kate katie catherine cathy debra rachel carolyn janet jan julie julia joyce victoria vicky
  kelly christina tina joan evelyn lauren judith judy megan cheryl andrea andie hannah
  jacqueline jackie martha gloria teresa theresa ann anne anna nina sara madison frances fran
  kathryn janice jean abigail abby alice grace denise gemma marilyn beverly bev danielle
  diana di brittany natalie nat sophia sophie isabella bella charlotte lottie yvonne annie
  molly lucy daisy ellie holly poppy erica jane jeanne tiffany madeleine maddie marissa
  eleanor nora nadia leo leigh morgan gordon`;

const KNOWN_PROPER = new Set(
  [MONTHS, DAYS, COUNTRIES, NATIONALITIES, CONTINENTS, CITIES, TITLE_WORDS, TITLES, NAMES]
    .join(' ').split(/\s+/).filter(Boolean)
);

// lowercase lexicon from a corpus (transcripts / sentences): a word seen
// written lowercase somewhere is a real word, not an opaque name.
function buildLexicon(texts) {
  const lex = new Set();
  for (const t of texts) {
    for (const m of String(t || '').split(/\s+/)) {
      const w = m.replace(/[^A-Za-z’'-]/g, '');
      if (w.length > 1 && w === w.toLowerCase()) lex.add(w.toLowerCase().replace(/[’']/g, "'"));
    }
  }
  return lex;
}

function tokenize(text) {
  return String(text || '').split(/[\s—–]+/).filter(Boolean);
}

function known(key) {
  return KNOWN_PROPER.has(key) || KNOWN_PROPER.has(key.replace(/s$/, ''));
}

function isRealWord(key, lexicon) {
  if (ENGLISH.has(key) || ENGLISH.has(key.replace(/'s$/, '')) || ENGLISH.has(key.replace(/s$/, ''))) return true;
  if (lexicon && lexicon.has(key)) return true;
  // hyphenated compound whose every part is a single letter or a real/known
  // word ("X-rays", "T-shirt", "L-shaped", "Die-back", "Bell-miner" —
  // spellable, not opaque names)
  if (key.includes('-')) {
    const parts = key.split('-').filter(Boolean);
    const partOk = p => p.length === 1
      || ENGLISH.has(p) || ENGLISH.has(p.replace(/s$/, '')) || known(p) || (lexicon && lexicon.has(p));
    if (parts.length > 1 && parts.every(partOk)) return true;
  }
  return false;
}

// Reason string if this sentence leans on an unspellable name, else ''.
function nameFlag(text, lexicon) {
  if (SPELLED_OUT.test(text)) return 'spelled-out letters';
  const words = tokenize(text);
  for (let i = 0; i < words.length; i++) {
    // strip surrounding punctuation AND stray quote marks
    const bare = words[i]
      .replace(/^[^A-Za-z]+/, '')
      .replace(/[^A-Za-z]+$/, '')
      .replace(/^[’']+|[’']+$/g, '');
    if (!/^[A-Z][a-z’'-]+$/.test(bare)) continue;           // simple Capitalised word only
    if (/[’'](s|ll|ve|re|d|m|t)$/i.test(bare)) continue;    // contraction tail
    const prev = words[i - 1] || '';
    const atSentenceStart = i === 0 || /[.!?:]["'”’)]?$/.test(prev) || /^[-–—]+$/.test(prev);
    if (atSentenceStart) continue;
    const key = bare.toLowerCase().replace(/[’']/g, "'");
    if (known(key)) continue;
    if (isRealWord(key, lexicon)) continue;
    return `proper name "${bare}"`;
  }
  return '';
}

// units: [{text,start,end}] → { kept, dropped:[{text,reason}] }.
// Pass a corpus-wide `lexicon` (buildLexicon) for best precision; without
// one it's built from the units themselves.
function dropNameHeavySentences(units, lexicon) {
  const lex = lexicon || buildLexicon((units || []).map(u => u.text));
  const kept = [], dropped = [];
  for (const u of units || []) {
    const reason = nameFlag(u.text, lex);
    if (reason) dropped.push({ text: u.text, reason });
    else kept.push(u);
  }
  return { kept, dropped };
}

module.exports = {
  SPELLED_OUT, KNOWN_PROPER, buildLexicon, nameFlag, dropNameHeavySentences,
};
