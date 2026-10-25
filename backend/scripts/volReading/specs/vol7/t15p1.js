// Vol 7 - Reading/Test 11-16/Test 15.pdf - Reading Passage 1 (PDF p1–3, text layer). Not in the bank / mini-ielts.
// The PDF prints the passage as three blocks with inline sub-headings → paragraphs + "## Early years / Mature years /
// Legacy"; Hokusai's own words set as a quoted paragraph; dashes printed as hyphens spaced ("Japan-died", "heir-possibly");
// "(see photograph)" and "(q.v.)" dropped (no photo, encyclopaedia cross-reference). Summary: duplicated "Complete the
// summary below." removed, "he experimented Western-style" → experimented with.
// Key = "Đáp án chi tiết" pages of Test 15.pdf (Q1–7 letters, Q8–13 given as quotations → the word in each), checked
// against the passage.
const { tfng, notes } = require('../../vr_build');
module.exports = {
  vol: 7, test: 15, part: 1, title: 'Katsushika Hokusai', text: 't15p1.txt',
  groups: [
    tfng(1, [
      'Hokusai\'s earliest artistic works mainly focused on landscapes and actors.',
      'He was officially recognized as the heir of the Nakajima family.',
      'Hokusai\'s apprenticeship with a wood-block engraver contributed to his later success as a printmaker.',
      'The series Thirty-six Views of Mount Fuji was the first landscape work ever created in Japan.',
      'Hokusai often competed with Utamaro in producing prints of women.',
      'His eldest son helped secure financial stability for him through the Nakajima family connections.',
      'Hokusai changed his residence and artistic name multiple times throughout his life.',
    ]),
    notes(8, 13, [
      'Hokusai showed interest in drawing at the age of five and may have been the son of a __Q8__. As a teenager, he was apprenticed to a wood-block engraver, and later studied under the Ukiyo-e master Shunshō, producing actor prints of the __Q9__ theatre. During his career, Hokusai created a wide variety of works, including landscapes, actor prints, and __Q10__ produced for special occasions. He also published sketchbooks for amateur artists known as Hokusai __Q11__. In many of his landscape works, he experimented with Western-style colouring and __Q12__ for a time. Although he worked in different genres, Hokusai also competed with other masters such as __Q13__, who was famous for figure prints.',
    ], { instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 8–13 on your answer sheet.' }),
  ],
  key: { 1: 'NOT GIVEN', 2: 'FALSE', 3: 'TRUE', 4: 'NOT GIVEN', 5: 'FALSE', 6: 'TRUE', 7: 'TRUE', 8: 'concubine', 9: 'Kabuki',
    10: 'surimono', 11: 'manga', 12: 'perspective', 13: 'Utamaro' },
  expl: {
    1: ['Những tác phẩm đầu tiên của Hokusai chủ yếu về phong cảnh và diễn viên.', 'Đoạn 1',
      '“His early works represent the full spectrum of Ukiyo-e art, including single-sheet prints of landscapes and actors, hand paintings, and surimono”',
      'Tác phẩm thời đầu bao trùm mọi thể loại (phong cảnh, diễn viên, tranh vẽ tay, surimono); bài không nói thể loại nào là chủ yếu ở những tác phẩm sớm nhất → NOT GIVEN'],
    2: ['Ông được chính thức công nhận là người thừa kế của gia đình Nakajima.', 'Early years, đoạn 1',
      '“He was adopted in childhood by a prestigious artisan family named Nakajima but was never accepted as an heir”',
      '“never accepted as an heir” → FALSE'],
    3: ['Thời học việc với thợ khắc gỗ góp phần vào thành công của ông với tư cách thợ in tranh.', 'Early years, đoạn 1',
      '“from 15 to 18 years of age he was apprenticed to a wood-block engraver. This early training in the book and printing trades obviously contributed to Hokusai\'s artistic development as a printmaker.”',
      '“obviously contributed to Hokusai\'s artistic development as a printmaker” → TRUE'],
    4: ['Bộ “Ba mươi sáu cảnh núi Phú Sĩ” là tác phẩm phong cảnh đầu tiên ở Nhật.', 'Mature years, đoạn “Of Hokusai\'s thousands…”',
      '“this famous series … marked a summit in the history of the Japanese landscape print; in grandeur of concept and skill of execution there was little approaching it before”',
      'Bộ tranh là “đỉnh cao” và trước đó ít tác phẩm sánh được → đã có tranh phong cảnh trước đó, nhưng bài không nói tác phẩm phong cảnh đầu tiên là gì → NOT GIVEN'],
    5: ['Hokusai thường cạnh tranh với Utamaro trong việc làm tranh in phụ nữ.', 'Mature years, đoạn 1',
      '“Hokusai only occasionally (in a few notable prints, in paintings, and erotica) chose to compete with Utamaro, the acknowledged master of voluptuous figure prints.”',
      '“only occasionally” = chỉ thỉnh thoảng, trái với “often” → FALSE'],
    6: ['Con trai cả giúp ông ổn định tài chính nhờ quan hệ với gia đình Nakajima.', 'Mature years, đoạn “In about the year 1812…”',
      '“as adopted heir to the affluent Nakajima family, the son had been instrumental in obtaining a generous stipend for Hokusai”',
      'Người con (thừa kế nhà Nakajima) giúp ông có khoản trợ cấp hậu hĩnh = financial stability → TRUE'],
    7: ['Hokusai đổi chỗ ở và bút danh nhiều lần trong đời.', 'Mature years, đoạn “Hokusai\'s frequent changes…”',
      '“Hokusai\'s frequent changes in domicile (more than 90 dwellings) and of his own name are indicative of the artist\'s restless nature.”',
      'Hơn 90 chỗ ở và nhiều bút danh → TRUE'],
    8: ['Hokusai có thể là con của một ______.', 'Early years, đoạn 1',
      '“possibly supporting the theory that, though the true son of Nakajima, he had been born of a concubine.”',
      '“born of a concubine” = son of a concubine (vợ lẽ) → concubine'],
    9: ['… vẽ tranh diễn viên của sân khấu ______.', 'Early years, đoạn 2',
      '“The young Hokusai\'s first published works appeared the following year – actor prints of the Kabuki theatre”',
      '“actor prints of the Kabuki theatre” → Kabuki'],
    10: ['… và ______ làm cho các dịp đặc biệt.', 'Early years, đoạn 4',
      '“Surimono were prints issued privately for special occasions”',
      '“Surimono … for special occasions” → surimono'],
    11: ['Ông xuất bản sách mẫu cho họa sĩ nghiệp dư, gọi là Hokusai ______.', 'Mature years, đoạn “In about the year 1812…”',
      '“to the type of wood-block-printed copybook designed for amateur artists (including the famous Hokusai manga).”',
      '“copybook designed for amateur artists (including the famous Hokusai manga)” → manga'],
    12: ['Ông từng thử nghiệm màu sắc và ______ kiểu phương Tây một thời gian.', 'Mature years, đoạn 1',
      '“Around the turn of the century he experimented for a time with Western-style perspective and colouring.”',
      '“experimented for a time with Western-style perspective and colouring” → perspective'],
    13: ['Hokusai cũng cạnh tranh với những bậc thầy như ______, người nổi tiếng với tranh nhân vật.', 'Mature years, đoạn 1',
      '“chose to compete with Utamaro, the acknowledged master of voluptuous figure prints.”',
      '“master of voluptuous figure prints” = famous for figure prints → Utamaro'],
  },
};
