// Vol 7 - Test 1-10/Test 7.pdf - Reading Passage 1 (PDF p1–4, text layer). Not in the bank / mini-ielts.
// The PDF runs paragraphs A–J together → split; footnotes kept as the last two lines. Text fixes: "four-stringed charter"
// → chartar (paragraph G and key Q7 spell it chartar), "can thus he said … twelve-stung.," → "can thus be said … twelve-
// string,", "until 1836, when Gibson introduced its famous ES150" → 1936 (the ES-150 came out in 1936; pickups were fitted
// "in the late 1920s" just before), Q3 "Har-Mole" → Har-Mose. Table rebuilt from the PDF's flattened cells.
// Title + " (Vol 7)": the bank already has "The History of the Guitar" (Actual Mocktest 48), another article.
// Key = Key Read VOL 7 (T1-T10).pdf, checked against the passage.
const { tfng, table } = require('../../vr_build');
module.exports = {
  vol: 7, test: 7, part: 1, title: 'The history of the guitar (Vol 7)', text: 't7p1.txt',
  groups: [
    tfng(1, [
      'The instrument found in Queen Shub-Ad\'s tomb is the world\'s oldest known version of a harp.',
      'Today\'s Afghan panchtar is very similar to an ancient Mesopotamian instrument.',
      'The Egyptian singer Har-Mose was an excellent tanbur player.',
      'Cairo Archaeological Museum contains many historic musical instruments.',
      'The instrument carved in stone at Alaca Huyuk is consistent with Dr Michael Kasha\'s definition of a guitar.',
      'The different instruments that appeared in medieval literature had the same number of strings.',
    ]),
    table(7, 13, ['Date', 'Type of instrument', 'Notes'], [
      ['13th–19th century', 'Chitarra', '• was a development of an earlier instrument called the __Q7__<br>• extra strings added in 16th century in Italy'],
      ['from around the 1850s', 'Classical guitar', '• its shape a result of modifications including a larger __Q8__ introduced by Antonio Torres<br>• changes produced better tone and greater __Q9__'],
      ['', 'X-braced top guitar', '• first made in __Q10__ in mid-19th century<br>• strings made of __Q11__ became available around 1900'],
      ['1920s onwards', 'Electric guitar', '• in the 1920s, __Q12__ added to guitars<br>• a well-known version brought out by __Q13__'],
    ], { instruction: '<strong>The development of the guitar</strong><br>Complete the table below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 7–13 on your answer sheet.' }),
  ],
  key: { 1: 'FALSE', 2: 'TRUE', 3: 'NOT GIVEN', 4: 'NOT GIVEN', 5: 'TRUE', 6: 'FALSE', 7: 'chartar', 8: 'body', 9: 'volume',
    10: 'America', 11: 'steel', 12: 'pickups', 13: 'Gibson' },
  expl: {
    1: ['Nhạc cụ tìm thấy trong mộ Nữ hoàng Shub-Ad là phiên bản đàn hạc cổ nhất được biết đến.', 'Đoạn A',
      '“The earliest stringed instruments currently known to archaeologists are bowl harps.” … “Around 2500-2000 BC more advanced harps, such as the beautifully carved 11-stringed instrument found in the tomb of Queen Shub-Ad”',
      'Đàn hạc bát (bowl harp) có trước; đàn trong mộ Shub-Ad là loại “more advanced” xuất hiện sau → không phải cổ nhất → FALSE'],
    2: ['Đàn panchtar của Afghanistan ngày nay rất giống một nhạc cụ Lưỡng Hà cổ.', 'Đoạn B',
      '“Archaeologists have also found many similar relics amongst the ruins of the ancient Mesopotamian civilisation. Many of these instruments have survived into modern times in almost unchanged form, for example folk instruments of the region such as the Turkish saz and Afghan panchtar.”',
      '“survived into modern times in almost unchanged form” = very similar to the ancient instrument → TRUE'],
    3: ['Ca sĩ Ai Cập Har-Mose chơi đàn tanbur rất giỏi.', 'Đoạn C',
      '“At 3,500 years old, the tanbur which belonged to the Egyptian singer Har-Mose is the earliest known example of this instrument.”',
      'Bài chỉ nói cây đàn thuộc về ca sĩ Har-Mose, không nói ông chơi giỏi hay không → NOT GIVEN'],
    4: ['Bảo tàng Khảo cổ Cairo có nhiều nhạc cụ lịch sử.', 'Đoạn C',
      '“It can be seen today at the Archaeological Museum in Cairo.”',
      'Bài chỉ nói cây tanbur của Har-Mose ở bảo tàng này, không nói bảo tàng có nhiều nhạc cụ khác → NOT GIVEN'],
    5: ['Nhạc cụ khắc trên đá ở Alaca Huyuk phù hợp với định nghĩa đàn guitar của TS Michael Kasha.', 'Đoạn D',
      '“The oldest known visual representation of such an instrument is a stone carving at Alaca Huyuk in Turkey, which shows a 3,300-year-old instrument with a long neck and sides that clearly curve inwards.”',
      '“such an instrument” = nhạc cụ theo định nghĩa của Kasha (cần dài, hông cong vào) → TRUE'],
    6: ['Các nhạc cụ xuất hiện trong văn liệu thời Trung cổ có cùng số dây.', 'Đoạn F',
      '“Many such instruments, and variations with from three to five strings, can be seen in mediaeval illustrated manuscripts.”',
      'Có từ ba đến năm dây → không cùng số dây → FALSE'],
    7: ['Chitarra là bước phát triển từ một nhạc cụ trước đó tên là ______.', 'Đoạn G',
      '“When the four-stringed Persian chartar arrived in Spain, however, it changed in form and construction” … “It became known as the chitarra.”',
      'Đàn chartar Ba Tư đến Tây Ban Nha thì biến đổi thành chitarra → chartar'],
    8: ['Hình dáng của nó là kết quả của các thay đổi, gồm ______ lớn hơn do Antonio Torres đưa ra.', 'Đoạn H',
      '“the Spanish guitar maker Antonio Torres increased the size of the body, altered its proportions”',
      '“increased the size of the body” = a larger body → body'],
    9: ['Các thay đổi tạo ra âm sắc tốt hơn và ______ lớn hơn.', 'Đoạn H',
      '“His design radically increased the volume and improved the tone of the instrument”',
      '“increased the volume and improved the tone” = better tone and greater volume → volume'],
    10: ['Lần đầu được làm ở ______ vào giữa thế kỷ 19.', 'Đoạn I',
      '“At the time when Torres made his breakthrough, German immigrants to America – among them Christian Fredrich Martin – began making guitars with X-braced tops.”',
      'Cùng thời Torres (giữa thế kỷ 19), người Đức nhập cư ở Mỹ làm đàn X-braced → America'],
    11: ['Dây làm bằng ______ xuất hiện rộng rãi khoảng năm 1900.', 'Đoạn I',
      '“Steel strings, which became widely available several decades later in the early 1900s”',
      '“Steel strings … widely available … in the early 1900s” → steel'],
    12: ['Vào những năm 1920, ______ được gắn vào đàn guitar.', 'Đoạn J',
      '“The electric guitar was born when pickups were fitted to Hawaiian and jazz guitars in the late 1920s”',
      '“pickups were fitted to … guitars in the late 1920s” = pickups added to guitars → pickups'],
    13: ['Một phiên bản nổi tiếng được ______ tung ra.', 'Đoạn J',
      '“but met with little success until 1936, when Gibson introduced its famous ES150 model.”',
      '“Gibson introduced its famous ES150 model” = a well-known version brought out by Gibson → Gibson'],
  },
};
