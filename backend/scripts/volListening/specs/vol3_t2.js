// Vol 3 – Test 2 (PDF "listening/test 2/test 2.pdf"; key xlsx sheet Test 2; audio = ONE whole-test file "test 2.m4a").
// P1, P3, P4 are already in the bank (same recording, keys 10/10, all in the full test "Actual Test 6") → reused.
// P2 is the same recording as the bank's "The City of Gisborne" (Actual Test 6 P2) but a different question set
// (Q11–16 differ; Q17–20 same) → seeded as its own section, as with Vol 2 T1 P2 / "Southern Wonders Beach Resort".
// Transcript P2: Whisper (clip 6:52–14:08 of the test file) + whole-test Otter PDF; Whisper's invented "I like to know
// what you doing" dropped.
const { mc, matching } = require('../vol_build');

module.exports = {
  vol: 3, test: 2,
  sections: [
    { part: 1, reuse: '6a4ca23dda4283960021a74a', title: 'Temporary Patient Record Form' },
    {
      part: 2, title: 'Radio Guide to Gisborne', audio: 'listening/test 2/test 2.m4a', clip: [412.2, 848.5], cover: 'gisborne new zealand coast | new zealand vineyard',
      turns: [],
      fix: [
        ['Thank you.\nGreetings,', 'Greetings,'],
        ['sailed by M explorers', 'sailed by Maori explorers'],
        ['Te Tarafiti which in the Maori', 'Te Tairawhiti, which in the Maori'],
        ['discovering new zealand', 'discovering New Zealand'],
        ['settlements, Such as', 'settlements, such as'],
        ['\nI like to know what you doing I like to know what you doing.\n', '\n'],
        ['the show called.\nThe Beach,', 'the show called The Beach,'],
        ['Tairafiti Museum', 'Tairawhiti Museum'],
        ['amongst the bush Being very', 'amongst the bush.\nBeing very'],
        ["It's apparently good.\nGood for your health", "It's apparently good for your health"],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, "The announcer says that the main topic of today's talk will be Gisborne's", ['economy', 'history', 'tourism'], 'C'],
          [12, 'The Maori name for the Gisborne region signifies', ['dangerous journey', 'east coast', 'sailing boat'], 'B'],
          [13, 'Early exports from Gisborne came from its', ['farms', 'fisheries', 'forests'], 'A'],
          [14, 'According to the speaker, what does Gisborne export to Asia nowadays?', ['oranges and lemons', 'red and white grapes', 'seafood and shellfish'], 'A'],
          [15, 'The Gisborne Summer Concert takes place in', ['an opera house', 'a vineyard', 'a Maori meeting house'], 'B'],
          [16, 'On wet days in Gisborne the announcer recommends', ['a cultural display in the museum', 'a fashion show in the town hall', 'a photography exhibition in the art gallery'], 'A'],
        ], 'Questions 11-16'),
        matching('Which group of people is each of the following attractions recommended for?\nChoose FOUR answers from the box and write the correct letter, A-G, next to Questions 17-20.',
          ['disabled people', 'elderly people', 'recently married couples', 'pregnant women', 'secondary school children', 'young school children', 'young adults'], [
            [17, 'Hot Springs Reserve', 'C'],
            [18, 'Mahia Peninsula', 'G'],
            [19, 'Motu River Rafting', 'F'],
            [20, 'Eden Woodlands Park', 'A'],
          ], { title: 'Attractions', groupTitle: 'Questions 17-20' }),
      ],
      expl: {
        11: { v: 'Đầu bài, khi người dẫn giới thiệu nội dung.', t: "You'll hear a little bit about its past in the old days, and a lot about what attractions it has to offer foreign and domestic visitors today.", p: 'Quá khứ chỉ “a little bit” (bẫy B), kinh tế chỉ được nhắc qua (bẫy A); phần lớn nói về điểm tham quan cho du khách → C' },
        12: { v: 'Khi giải thích tên gốc tiếng Maori.', t: ['It is also the easternmost point of the country, which is what inspired its original name.', 'Te Tairawhiti, which in the Maori language means the coast where the sun rises across the waters.'], p: 'Chuyến đi dài và nguy hiểm, chiếc xuồng là bẫy; tên gốc lấy cảm hứng từ vị trí cực đông, nghĩa là “bờ biển nơi mặt trời mọc” → B' },
        13: { v: 'Khi nói về hàng xuất khẩu thời kỳ đầu.', t: 'This began with maize and root crops, but quickly expanded to butter, meat and wool from the agricultural settlements in the rich pastoral country near the famous Poverty Bay.', p: 'Ngô, củ, bơ, thịt, len — đều từ nông trại → A' },
        14: { v: 'Khi nói về xuất khẩu sang châu Á.', t: "As for exports to Asian markets, there's an increasing demand for the region's oranges and lemons.", p: 'Tôm hùm, cá là hàng bán cho các vùng khác của New Zealand (bẫy C); sang châu Á là cam và chanh → A' },
        15: { v: 'Khi nói về buổi hoà nhạc mùa hè.', t: "It's held at Waiahikia Vineyard, which is near the traditional Maori meeting house or marae of the same name.", p: 'Nhà hội họp Maori chỉ ở gần đó, ca sĩ opera chỉ là người biểu diễn (bẫy); buổi hoà nhạc tổ chức tại vườn nho → B' },
        16: { v: 'Khi gợi ý hoạt động ngày mưa.', t: ['What to do on a rainy day?', "It's a big display, so it also takes up the hall next to Gallery 1, and it's divided into different sections of the local culture, like surfing, camping, fashion and so on."], p: 'Triển lãm “The Beach” ở bảo tàng, chia theo các mảng văn hoá địa phương; thời trang và ảnh chỉ là chi tiết (bẫy) → A' },
        17: { v: 'Khi nói về Hot Springs Reserve.', t: 'Being very secluded and private, this resort is most favoured by newlyweds, who often book a cabin for their honeymoon.', p: 'Phụ nữ mang thai và người già được khuyên không nên tắm (bẫy); “newlyweds” = recently married couples → C' },
        18: { v: 'Khi nói về bán đảo Mahia.', t: "Around the corner is Mahia Peninsula, legendary as a New Year's Eve party destination for large crowds of university students after their graduation.", p: 'Sinh viên đại học vừa tốt nghiệp = young adults → G' },
        19: { v: 'Khi nói về chèo thuyền trên sông Motu.', t: "But in fact, this activity is often used by local primary schools who take big groups of young children, several classes at a time, out here for a bit of fun while they're on their school camp.", p: 'Học sinh tiểu học = young school children → F' },
        20: { v: 'Cuối bài, khi nói về Eden Woodlands Park.', t: "There's even a very nice walkway made wide enough for those in wheelchairs, so that everyone can go along and enjoy Mother Nature at her best.", p: 'Lối đi đủ rộng cho người ngồi xe lăn → disabled people → A' },
      },
    },
    { part: 3, reuse: '6a50a408c7a497a299b35b95', title: 'Marketing Students Discussion on SUVs (Four-Wheel Drive Vehicles)' },
    { part: 4, reuse: '6a50aa0bc7a497a299b374e8', title: 'The Influence of Children on Adult Diet' },
  ],
};
