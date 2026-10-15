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
  { id: 'meo',   name: 'Mèo Quýt',      price: 30,  description: 'Mèo cam lười biếng, thích nằm phơi nắng cạnh sổ từ vựng.' },
  { id: 'shiba', name: 'Shiba Lì Xì',   price: 40,  description: 'Chú chó Shiba lúc nào cũng vẫy đuôi cổ vũ bạn học bài.' },
  { id: 'cut',   name: 'Cánh Cụt Bông', price: 50,  description: 'Lạch bạch đi khắp màn hình, ngã cũng không khóc.' },
  { id: 'cao',   name: 'Cáo Lửa',       price: 70,  description: 'Cáo chín… à không, cáo một đuôi rực lửa — tinh ranh như người chủ.' },
  { id: 'rong',  name: 'Rồng Con',      price: 100, description: 'Linh thú huyền thoại, thỉnh thoảng phun ra một đốm lửa nhỏ.' },
];

// Búa Hi Vọng tuning.
const HOPE_MULTIPLIER = 2;
const HOPE_QUOTA = 3;      // base 🔥 (before ×2) to earn after activating
const HOPE_PENALTY = 10;   // 🔥 taken off learningStreak on a miss

// Launch gift: a student's wallet starts at their current streak, capped,
// so the shop isn't empty-handed on day one.
const WALLET_SEED_CAP = 50;

const CAKE_HOURS = 24;
const CLOAK_HOURS = 24;
const CROWN_DAYS = 7;

module.exports = {
  ITEMS, PETS, HOPE_MULTIPLIER, HOPE_QUOTA, HOPE_PENALTY, WALLET_SEED_CAP,
  CAKE_HOURS, CLOAK_HOURS, CROWN_DAYS,
};
