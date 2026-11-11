'use strict';

// Cửa hàng lửa — catalog. Everything here is paid from User.flameWallet (the
// separate "ví lửa"), never from learningStreak itself, so buying something
// never costs a student their streak or their leaderboard rank.
//
// `key` is also the field name under User.shopItems for consumables, unless
// the item sets `field` (a top-level User path it is counted in instead).
const ITEMS = [
  {
    key: 'hopeHammer', name: 'Búa Hi Vọng', emoji: '🔨', price: 25,
    description: 'Đập búa đặt cược cho hôm nay: mọi 🔥 kiếm được sau khi đập đều ×2. '
      + 'Nhưng nếu đến hết ngày chưa kiếm thêm đủ 3 🔥 thì bị trừ 10 🔥 khỏi chuỗi!',
    usage: 'manual',
  },
  {
    // Same inventory as the hammers earned from Paraphrase units / admin
    // gifts (User.streakHammers, not shopItems), used from the Kho đồ via
    // POST /api/user/streak/use-hammer. Can't be sold back — otherwise a
    // free earned hammer would turn into 🔥.
    key: 'danielHammer', name: 'Búa Daniel', emoji: '🔨', image: '/img/buaDaniel.jpg', price: 50,
    field: 'streakHammers', sellable: false,
    description: 'Lỡ mất chuỗi? Đập Búa Daniel trong vòng 3 ngày là khôi phục lại toàn bộ chuỗi 🔥 vừa mất.',
    usage: 'restore',
  },
  {
    key: 'iceShield', name: 'Khiên Băng', emoji: '🛡️', price: 20, maxOwned: 2,
    description: 'Tự động bật khi bạn lỡ nghỉ 1 ngày: chuỗi được giữ nguyên. Giữ tối đa 2 khiên.',
    usage: 'passive',
  },
  {
    key: 'cake', name: 'Bánh Kem Úp Mặt', emoji: '🎂', price: 10,
    description: 'Ném bánh vào ảnh đại diện một bạn trên BXH — dính kem suốt 24 giờ, kèm tên người ném 😆',
    usage: 'target',
  },
  {
    key: 'towel', name: 'Khăn Lau Diệu Kì', emoji: '🧽', price: 8,
    description: 'Bị úp bánh kem? Lau một cái là ảnh đại diện sạch bong ngay, không phải chờ 24 giờ ✨',
    usage: 'manual',
  },
  {
    key: 'cloak', name: 'Áo Tàng Hình', emoji: '👻', price: 15,
    description: 'Giấu số 🔥 của bạn trên BXH trong 24 giờ — đối thủ chỉ thấy "???" và không biết bạn sắp vượt.',
    usage: 'manual',
  },
  {
    key: 'crown', name: 'Vương Miện Lửa', emoji: '👑', price: 60,
    description: 'Đội vương miện, tên bạn phát sáng vàng rực trên BXH trong 7 ngày.',
    usage: 'manual',
  },
  {
    key: 'lens', name: 'Kính Soi', emoji: '🔍', price: 12,
    description: 'Ai đang mặc Áo Tàng Hình? Soi một cái là áo rách ngay — cả BXH lại thấy số 🔥 thật của bạn ấy.',
    usage: 'target',
  },
];

// Búa Hi Vọng tuning.
const HOPE_MULTIPLIER = 2;
const HOPE_QUOTA = 3;      // base 🔥 (before ×2) to earn after activating
const HOPE_PENALTY = 10;   // 🔥 taken off learningStreak on a miss

const CAKE_HOURS = 24;
const CLOAK_HOURS = 24;
const CROWN_DAYS = 7;

// Linh thú — bought once, then one of them (activePet) walks around the
// student's non-exam pages and sits next to their name on the BXH. The
// art lives in frontend/js/shared/pets.js, keyed by the same ids.
const PETS = [
  { id: 'meo',   name: 'Mèo Quýt',      price: 30, description: 'Mèo cam lười biếng, thích nằm phơi nắng cạnh sổ từ vựng.' },
  { id: 'shiba', name: 'Shiba Lì Xì',   price: 30, description: 'Chú chó Shiba lúc nào cũng vẫy đuôi cổ vũ bạn học bài.' },
  { id: 'cut',   name: 'Cánh Cụt Bông', price: 30, description: 'Lạch bạch đi khắp màn hình, ngã cũng không khóc.' },
  { id: 'cao',   name: 'Cáo Lửa',       price: 30, description: 'Cáo một đuôi rực lửa — tinh ranh như người chủ.' },
  { id: 'rong',  name: 'Rồng Con',      price: 30, description: 'Linh thú huyền thoại, thỉnh thoảng phun ra một đốm lửa nhỏ.' },
  // Vĩ thú — chibi folklore beasts with 1..9 tails, priced 50 → 210 (+20 each).
  ...[
    ['vi1', 'Lửng Cát Nhất Vĩ', 'Chú lửng một đuôi đội lá trên đầu — bùa may mắn cho người mới.'],
    ['vi2', 'Mèo Lửa Nhị Vĩ',   'Mèo trắng hai đuôi cháy lửa xanh, mát lạnh mà rực rỡ.'],
    ['vi3', 'Rùa Tam Vĩ',       'Rùa con ba đuôi — chậm mà chắc, ngày nào cũng học.'],
    ['vi4', 'Khỉ Tứ Vĩ',        'Khỉ đỏ bốn đuôi lanh lợi, chuyền cành lên top.'],
    ['vi5', 'Ngựa Ngũ Vĩ',      'Ngựa trắng bờm hồng, năm dải đuôi bay trong gió.'],
    ['vi6', 'Sên Lục Vĩ',       'Sên mềm sáu đuôi, mắt dài nhìn xa trông rộng.'],
    ['vi7', 'Bọ Thất Vĩ',       'Bọ xanh có cánh trong suốt và bảy dải đuôi lấp lánh.'],
    ['vi8', 'Bò Bát Vĩ',        'Bò tím sừng cong với tám xúc tu — khỏe nhất bầy.'],
    ['vi9', 'Hồ Ly Cửu Vĩ',     'Hồ ly vàng chín đuôi — linh thú huyền thoại mạnh nhất.'],
  ].map(([id, name, description], i) => ({ id, name, description, price: 50 + 20 * i, tier: 'vi', tails: i + 1 })),
  // Huyền thoại — buying one, or an owner logging in, is announced to the
  // whole site with a fire-and-tails sweep (ShopAnnouncement → shop-feed.js).
  {
    id: 'vi10', name: 'Thập Vĩ', price: 300, tier: 'vi', tails: 10, legendary: true,
    description: 'Quái thú mười đuôi khổng lồ, tuy to lớn nhưng lại rất ham chơi và thích kết bạn.',
  },
  // Susano — spectral giant warriors wrapped in flame, each with its own
  // colour and weapon (art: pets.js SU). All huyền thoại, priced 310 → 360.
  ...[
    ['su1', 'Susano Huyết Hỏa',  310, 'Chiến thần lửa đỏ cầm kiếm và khiên gương — hộ thể cho chủ nhân trước mọi đề khó.'],
    ['su2', 'Susano Lục Ngọc',   320, 'Khổng lồ lửa xanh lục đeo chuỗi ngọc, bước tới đâu vòng lửa cháy tới đó.'],
    ['su3', 'Susano Tử Lôi',     335, 'Susano tím giương cung bắn mũi tên sét, chớp giật quanh thân không ngừng.'],
    ['su4', 'Susano Thiên Dực',  345, 'Susano hoàn thiện xanh lam với đôi cánh và thanh kiếm trời — bay thẳng lên band cao.'],
    ['su5', 'Susano Huyết Nguyệt', 360, 'Susano hồng tím trỗi dậy dưới trăng máu, sét đen bao quanh — mạnh nhất cửa hàng.'],
  ].map(([id, name, price, description]) => ({ id, name, price, description, tier: 'susano', legendary: true })),
];

// Ids of the legendary linh thú (see ShopAnnouncement).
const LEGEND_PETS = PETS.filter(p => p.legendary).map(p => p.id);

// ── Kỹ năng linh thú ─────────────────────────────────────────────────
// Only the pet out walking (User.activePet) uses its powers, so which one
// a student walks is a choice. Every pet brings a daily gift (🎁 Quà linh
// thú: `gift` 🔥 into the ví lửa, `drop` chance of a bonus item) once the
// student has earned at least 1 🔥 from studying that day; the rest are
// perks read by shopService:
//   hopeQuota — Búa Hi Vọng wins with this many 🔥 instead of HOPE_QUOTA
//   shieldMax — Khiên Băng cap instead of the item's maxOwned
//   seeHidden — sees through Áo Tàng Hình on the BXH
//   cakeHours — a cake thrown at the owner melts after this many hours
//   guard     — cakes blocked per VN day; reflect: a blocked cake lands on
//               the thrower instead
const BASIC_GIFT = { gift: [1, 2], drop: 0.08 };
const LEGEND_GIFT = { gift: [4, 6], drop: 0.25 };
const PET_POWERS = {
  meo:   { gift: [2, 4] },
  shiba: { hopeQuota: 2 },
  cut:   { shieldMax: 3 },
  cao:   { seeHidden: true },
  rong:  { cakeHours: 6 },
  vi10:  { gift: [5, 8], drop: 0.3, guard: 1 },
  su1:   { ...LEGEND_GIFT, guard: 1 },
  su2:   { ...LEGEND_GIFT, guard: 1 },
  su3:   { ...LEGEND_GIFT, guard: 1, reflect: true },
  su4:   { ...LEGEND_GIFT, guard: 1, reflect: true },
  su5:   { ...LEGEND_GIFT, guard: 2, reflect: true },
};
// Vĩ thú: the more tails, the bigger the gift; Hồ Ly Cửu Vĩ also has Mắt Cáo.
for (let n = 1; n <= 9; n++) {
  PET_POWERS[`vi${n}`] = { gift: [1 + Math.ceil(n / 3), 2 + Math.ceil(n / 2)], drop: 0.08 + 0.02 * n };
}
PET_POWERS.vi9.seeHidden = true;

// A pet's full powers (gift defaults filled in), or null for no/unknown pet.
function petPower(id) {
  if (!id || !PETS.some(p => p.id === id)) return null;
  return { ...BASIC_GIFT, ...(PET_POWERS[id] || {}) };
}

// The skill line shown on the shop / Kho đồ cards, built from the powers so
// the text can never drift from what the server does.
const SKILL_HEAD = {
  meo: ['🍀', 'Thần Tài'], shiba: ['📣', 'Cổ Vũ'], cut: ['🧊', 'Băng Giá'], cao: ['👁️', 'Mắt Cáo'], rong: ['🔥', 'Lửa Rồng'],
  vi9: ['👁️', 'Vĩ Lực ×9 + Mắt Cáo'], vi10: ['🌑', 'Hấp Thụ'],
  su1: ['🛡️', 'Hộ Thể'], su2: ['🛡️', 'Hộ Thể'], su3: ['⚡', 'Phản Đòn'], su4: ['⚡', 'Phản Đòn'], su5: ['🌕', 'Huyết Nguyệt'],
};
function petSkill(pet) {
  const p = petPower(pet.id);
  const head = SKILL_HEAD[pet.id] || (pet.tails ? ['🌀', `Vĩ Lực ×${pet.tails}`] : ['🎁', 'Lộc Linh Thú']);
  const parts = [];
  if (p.hopeQuota) parts.push(`Búa Hi Vọng chỉ cần ${p.hopeQuota} 🔥 (thay vì ${HOPE_QUOTA}) là thắng cược`);
  if (p.shieldMax) parts.push(`giữ được tối đa ${p.shieldMax} Khiên Băng`);
  if (p.seeHidden) parts.push('nhìn xuyên Áo Tàng Hình trên BXH');
  if (p.cakeHours) parts.push(`bánh kem úp lên bạn tan sau ${p.cakeHours} giờ thay vì ${CAKE_HOURS} giờ`);
  if (p.guard) parts.push(`tự chặn ${p.guard} bánh kem ném vào bạn mỗi ngày${p.reflect ? ' và úp ngược vào mặt người ném' : ''}`);
  parts.push(`quà mỗi ngày ${p.gift[0]}–${p.gift[1]} 🔥, ${Math.round(p.drop * 100)}% rơi thêm vật phẩm`);
  const text = parts.join(' · ');
  return { icon: head[0], name: head[1], text: text.charAt(0).toUpperCase() + text.slice(1) + '.' };
}
for (const pet of PETS) pet.skill = petSkill(pet);

// What a 🎁 Quà linh thú can drop on top of its 🔥 ([key, weight]). A Khiên
// Băng already at the cap turns into a cake.
const GIFT_DROPS = [['cake', 3], ['towel', 2], ['cloak', 2], ['lens', 2], ['hopeHammer', 1], ['iceShield', 1]];

// ⚔️ Thách đấu: two players stake the same 🔥 from their ví lửa; from the
// moment it's accepted until the end of the next VN day, whoever earns more
// 🔥 from studying (the daily-capped tally, VocabActivity.streakBonusEarned,
// before any Búa Hi Vọng ×2) takes the whole pot. A tie refunds both. An
// unanswered challenge lapses after DUEL_PENDING_HOURS, stake refunded.
const DUEL_MIN_STAKE = 5;
const DUEL_MAX_STAKE = 100;
const DUEL_PENDING_HOURS = 24;
const DUEL_MAX_OPEN = 3;   // pending + running duels one player can be in

// Most of one item a student can buy in a single purchase.
const MAX_BUY_QTY = 99;

// Who plays the 🔥 game: earns 🔥/streak from practice, shops in the Cửa
// hàng lửa and races on the BXH. Teachers join the students; admins,
// guests and parents stay out.
const FLAME_ROLES = ['student', 'teacher'];
function isFlameRole(role) { return FLAME_ROLES.includes(role); }

module.exports = {
  ITEMS, PETS, LEGEND_PETS, HOPE_MULTIPLIER, HOPE_QUOTA, HOPE_PENALTY,
  CAKE_HOURS, CLOAK_HOURS, CROWN_DAYS, MAX_BUY_QTY, FLAME_ROLES, isFlameRole,
  PET_POWERS, petPower, GIFT_DROPS,
  DUEL_MIN_STAKE, DUEL_MAX_STAKE, DUEL_PENDING_HOURS, DUEL_MAX_OPEN,
};
