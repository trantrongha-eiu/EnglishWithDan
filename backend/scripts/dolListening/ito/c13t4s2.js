// Cambridge IELTS 13 - Test 4 - Section 2 (not on DOL). Source: ieltstrainingonline.com practice-cam-13-listening-test-04 + audio-script page.
const { mc, matching } = require('../../volListening/vol_build');
module.exports = {
  book: 13, test: 4, part: 2, title: 'The Snow Centre',
  fix: [['if it’s real emergency', 'if it’s a real emergency']],
  groups: [
    mc('Choose the correct letter, A, B or C.', [
      [11, 'Annie recommends that when cross-country skiing, the visitors should', ['get away from the regular trails.', 'stop to enjoy views of the scenery.', 'go at a slow speed at the beginning.'], 'A'],
      [12, 'What does Annie tell the group about this afternoon’s dog-sled trip?', ['Those who want to can take part in a race.', 'Anyone has the chance to drive a team of dogs.', 'One group member will be chosen to lead the trail.'], 'B'],
      [13, 'What does Annie say about the team relay event?', ['All participants receive a medal.', 'The course is 4 km long.', 'Each team is led by a teacher.'], 'A'],
      [14, 'On the snow-shoe trip, the visitors will', ['visit an old gold mine.', 'learn about unusual flowers.', 'climb to the top of a mountain.'], 'C'],
      [15, 'The cost of accommodation in the mountain hut includes', ['a supply of drinking water.', 'transport of visitors’ luggage.', 'cooked meals.'], 'A'],
      [16, 'If there is a storm while the visitors are in the hut, they should', ['contact the bus driver.', 'wait until the weather improves.', 'use the emergency locator beacon.'], 'B'],
    ], 'Questions 11–16'),
    matching('What information does Annie give about skiing on each of the following mountain trails?\nChoose FOUR answers from the box and write the correct letter, A–F, next to Questions 17–20.', [
      'It has a good place to stop and rest.', 'It is suitable for all abilities.', 'It involves crossing a river.', 'It demands a lot of skill.', 'It may be closed in bad weather.', 'It has some very narrow sections.',
    ], [[17, 'Highland Trail', 'B'], [18, 'Pine Trail', 'D'], [19, 'Stony Trail', 'A'], [20, 'Loser’s Trail', 'E']], { title: 'Information', groupTitle: 'Questions 17–20' }),
  ],
  expl: {
    11: { v: 'Khi Annie nói về trượt tuyết băng đồng.', t: 'There are marked trails, but you can also leave these and go off on your own and that’s an experience not to be missed.',
      p: '“leave these (marked trails) and go off on your own” = get away from the regular trails; “not to be missed” = lời khuyên → A' },
    12: { v: 'Khi nói về chuyến xe chó kéo chiều nay.', t: 'If you want, you can have your own team for the afternoon and learn how to drive them',
      p: 'Ai muốn cũng được điều khiển một đàn chó; cuộc đua là chuyện trên TV (A sai), luôn đi sau người dẫn đường (C sai) → B' },
    13: { v: 'Khi nói về cuộc thi tiếp sức cuối tuần.', t: 'there’s a medal for everyone who takes part',
      p: '“everyone who takes part” = all participants → A' },
    14: { v: 'Khi nói về chuyến đi giày đi tuyết lên núi Frenner.', t: 'walkers generally take a couple of days to get to the summit',
      p: '“get to the summit” = climb to the top of a mountain; mỏ vàng gần như không còn dấu vết, hoa chỉ có vào mùa hè → C' },
    15: { v: 'Khi nói về túp lều lưng chừng núi.', t: 'It’s got cooking facilities, firewood and water for drinking.',
      p: 'Có sẵn nước uống; chở hành lý tốn thêm 10 đô (B sai), phải tự mang đồ ăn (C sai) → A' },
    16: { v: 'Khi nói về bão trên núi.', t: 'In that case, stay in the hut – generally the storms don’t last long.',
      p: 'Ở yên trong lều chờ bão qua = wait until the weather improves; đèn hiệu khẩn cấp chỉ dùng khi có người ốm/bị thương → B' },
    17: { v: 'Tuyến Highland.', t: 'This trail’s been designed to give first-timers an experience they’ll enjoy regardless of their age or skill, but it’s also ideal for experts',
      p: 'Hợp với cả người mới lẫn chuyên gia = suitable for all abilities → B' },
    18: { v: 'Tuyến Pine.', t: 'if you’ve fully mastered the techniques needed for hills, it’s great fun',
      p: '“leave this one to the experts”, phải thành thạo kỹ thuật = demands a lot of skill; con sông chỉ nhìn xuống chứ không băng qua → D' },
    19: { v: 'Tuyến Stony.', t: 'There’s a shelter half-way where you can sit and take a break',
      p: '“a shelter … take a break” = a good place to stop and rest → A' },
    20: { v: 'Tuyến Loser’s.', t: 'if it’s snowing or windy, check with us before you set out to make sure the trail’s open that day',
      p: 'Có thể đóng cửa khi tuyết rơi hoặc gió to = may be closed in bad weather → E' },
  },
};
