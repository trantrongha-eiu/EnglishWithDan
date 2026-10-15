'use strict';

// Cửa hàng lửa — catalog. Everything here is paid from User.flameWallet (the
// separate "ví lửa"), never from learningStreak itself, so buying something
// never costs a student their streak or their leaderboard rank.
//
// `key` is also the field name under User.shopItems for consumables.
const ITEMS = [
  {
    key: 'hopeHammer', name: 'Búa Hi Vọng', emoji: '🔨', price: 25,
    description: 'Đập búa đặt cược cho hôm nay: mọi 🔥 kiếm được sau khi đập đều ×2. '
      + 'Nhưng nếu đến hết ngày chưa kiếm thêm đủ 3 🔥 thì bị trừ 10 🔥 khỏi chuỗi!',
    usage: 'manual',
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
];

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
];

// Búa Hi Vọng tuning.
const HOPE_MULTIPLIER = 2;
const HOPE_QUOTA = 3;      // base 🔥 (before ×2) to earn after activating
const HOPE_PENALTY = 10;   // 🔥 taken off learningStreak on a miss

const CAKE_HOURS = 24;
const CLOAK_HOURS = 24;
const CROWN_DAYS = 7;

// Most of one item a student can buy in a single purchase.
const MAX_BUY_QTY = 99;

module.exports = {
  ITEMS, PETS, HOPE_MULTIPLIER, HOPE_QUOTA, HOPE_PENALTY,
  CAKE_HOURS, CLOAK_HOURS, CROWN_DAYS, MAX_BUY_QTY,
};
