// Vol 1 - Test 5 - Reading Passage 1 (PDF p6–10). Not in the bank ("Pacific navigation and voyaging" is another text;
// mini-ielts 1296 was rejected there for missing statement 2).
// Source fixes: the PDF prints statements 1, 3–7 (no 2) although the key has "2 No" → statement 2 taken from mini-ielts 1296
// (same test). Copy errors in the PDF text: "the ok! Polynesians" → old, "shadowy work!" → world, missing full stops.
// Keys checked against the passage + langmaster.edu.vn: Q2 printed NO — the journal only asks how the nation spread, nothing
// on cultural aspects → NOT GIVEN (NO kept as alternative); Q4 printed NOT GIVEN — "within the span of a few centuries"
// contradicts "less than a century" → NO (NOT GIVEN kept as alternative). Q8 also accepts "obsidian flakes".
const { ynng, notes, short } = require('../../vr_build');
module.exports = {
  vol: 1, test: 5, part: 1, title: 'Voyage of going: beyond the blue line 2', text: 't5p1.txt',
  groups: [
    ynng(1, [
      'Captain Cook once expected the Hawaiians might speak another language from the people of other Pacific islands.',
      'Captain Cook depicted a number of cultural aspects of Polynesians in his journal.',
      'Professor Spriggs and his research team went to Efate to try to find the site of an ancient cemetery.',
      'The Lapita completed a journey of around 2,000 miles in a period of less than a century.',
      'The Lapita were the first inhabitants of many Pacific islands.',
      'The unknown pots discovered in Efate had once been used for cooking.',
      'The urn buried in the Efate site was plain as it was without any decoration.',
    ], { instruction: 'Do the following statements agree with the information given in Reading Passage 1? In boxes 1–7 on your answer sheet, write YES if the statement is true, NO if the statement is false, NOT GIVEN if the information is not given in the passage.' }),
    notes(8, 10, [
      'Tests show the human remains and the charcoal found in the buried urn are from the start of the Lapita period. Yet the __Q8__ covering many of the Efate site did not come from that area.',
      'Then examinations carried out on the __Q9__ discovered at the Efate site reveal that not everyone buried there was a native living in the area. In fact, DNA could identify the Lapita’s nearest __Q10__ of the present day.',
    ], { title: 'Scientific evidence found in the Efate site', instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 8–10 on your answer sheet.' }),
    short(11, [
      'What did the Lapita travel in when they crossed the oceans?',
      'In Irwin’s view, what would the Lapita have relied on to bring them back home fast?',
      'Which sea creatures would have been an indication to the Lapita of where to find land?',
    ], { instruction: 'Answer the questions below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 11–13 on your answer sheet.' }),
  ],
  key: { 1: 'YES', 2: 'NOT GIVEN / NO', 3: 'NO', 4: 'NO / NOT GIVEN', 5: 'YES', 6: 'NOT GIVEN', 7: 'NO',
    8: 'rock / obsidian flakes', 9: 'teeth', 10: 'descendants', 11: 'canoes', 12: 'trade winds / the trade winds', 13: 'seabirds and turtles' },
  expl: {
    1: ['Thuyền trưởng Cook từng nghĩ người Hawaii có thể nói một ngôn ngữ khác với người ở các đảo Thái Bình Dương khác.', 'Đoạn A',
      '“Imagine Cook’s surprise, then, when the natives of Hawaii came paddling out in their canoes and greeted him in a familiar tongue”',
      'Cook “ngạc nhiên” khi người Hawaii chào ông bằng thứ tiếng quen thuộc — tức là ông đã chờ đợi họ nói một thứ tiếng khác → YES'],
    2: ['Thuyền trưởng Cook đã mô tả một số khía cạnh văn hoá của người Polynesia trong nhật ký.', 'Đoạn A',
      '“Marveling at the ubiquity of this Pacific language and culture, he later wondered in his journal: “How shall we account for this Nation spreading it self so far over this Vast ocean?””',
      'Bài chỉ nói ông thắc mắc trong nhật ký vì sao dân tộc này lan rộng khắp đại dương; không hề nói ông mô tả các khía cạnh văn hoá của họ. (Key in của đề ghi NO; vẫn chấm đúng cả NO.) → NOT GIVEN'],
    3: ['Giáo sư Spriggs và nhóm nghiên cứu đến Efate để tìm vị trí một nghĩa trang cổ.', 'Đoạn C',
      '“It came to light only by luck. A backhoe operator, digging up topsoil on the grounds of a derelict coconut plantation, scraped open a grave”',
      'Nghĩa trang được phát hiện “chỉ nhờ may mắn” khi một người lái máy xúc đào đất, chứ không phải do nhóm của Spriggs đi tìm → NO'],
    4: ['Người Lapita hoàn thành hành trình khoảng 2.000 dặm trong chưa đầy một thế kỷ.', 'Đoạn D',
      '“Within the span of a few centuries the Lapita stretched the boundaries of their world … at least 2,000 miles eastward in the Pacific.”',
      'Bài nói hành trình ít nhất 2.000 dặm diễn ra trong “vài thế kỷ”, trái với “chưa đầy một thế kỷ”. (Key in của đề ghi NOT GIVEN; vẫn chấm đúng cả NOT GIVEN.) → NO'],
    5: ['Người Lapita là những cư dân đầu tiên trên nhiều đảo Thái Bình Dương.', 'Đoạn D',
      '“discovering and colonizing scores of tropical islands never before seen by human eyes: Vanuatu, New Caledonia, Fiji, Samoa.”',
      'Họ khai phá hàng chục hòn đảo “chưa từng có con người nhìn thấy” → họ là những người đầu tiên đến ở → YES'],
    6: ['Những chiếc bình được phát hiện ở Efate từng được dùng để nấu ăn.', 'Đoạn E',
      '“Archaeologists were also thrilled to discover six complete Lapita pots.”',
      'Bài chỉ nói tìm thấy sáu chiếc bình Lapita nguyên vẹn (một chiếc đựng xương người); không nói chúng từng dùng để nấu ăn → NOT GIVEN'],
    7: ['Chiếc bình chôn ở Efate trơn, không có hoa văn trang trí.', 'Đoạn E',
      '“their peculiar style of pottery decoration, created by pressing a carved stamp into the clay” … “human bones enshrined inside what is unmistakably a Lapita urn.”',
      'Bình được nhận ra “chắc chắn là bình Lapita” — loại gốm nổi tiếng với kiểu trang trí in dấu khuôn khắc; như vậy chiếc bình không hề trơn → NO'],
    8: ['… Tuy nhiên, ______ phủ khắp khu Efate không có nguồn gốc ở khu vực đó.', 'Đoạn F',
      '“the chemical makeup of the obsidian flakes littering the site indicates that the rock wasn’t local”',
      '“littering the site” = rải khắp khu vực (covering many of the site); “wasn’t local” = did not come from that area. Chỗ trống cần danh từ chỉ thứ không phải của địa phương: đá (obsidian flakes) → rock'],
    9: ['Các xét nghiệm trên ______ tìm thấy ở Efate cho thấy không phải ai được chôn ở đó cũng là người bản địa.', 'Đoạn F',
      '“A particularly intriguing clue comes from chemical tests on the teeth of several skeletons.”',
      '“examinations carried out on the …” = “chemical tests on the teeth” → teeth'],
    10: ['Thực tế, ADN có thể xác định ______ gần nhất của người Lapita ngày nay.', 'Đoạn F',
      '“to find out who the Lapita actually were, where they came from, and who their closest descendants are today.”',
      '“nearest … present day” = “closest … today”; ADN giúp tìm ra hậu duệ gần nhất → descendants'],
    11: ['Người Lapita đi trên phương tiện gì khi vượt đại dương?', 'Đoạn G',
      '“All we can say for certain is that the Lapita had canoes that were capable of ocean voyages, and they had the ability to sail them”',
      'Họ có những chiếc xuồng đủ sức đi biển xa và biết cách điều khiển chúng → canoes'],
    12: ['Theo Irwin, người Lapita dựa vào điều gì để nhanh chóng quay trở về?', 'Đoạn H',
      '“they could turn about and catch a swift ride home on the trade winds.”',
      '“catch a swift ride home” = được đưa về nhà nhanh chóng nhờ gió mậu dịch → trade winds'],
    13: ['Những sinh vật biển nào là dấu hiệu cho người Lapita biết nơi có đất liền?', 'Đoạn H',
      '“skilled seafarers would detect abundant leads to follow to land: seabirds and turtles, coconuts and twigs carried out to sea by the tides”',
      '“leads to follow to land” = dấu hiệu dẫn tới đất liền; sinh vật được kể đến là chim biển và rùa (dừa, cành cây không phải sinh vật biển) → seabirds and turtles'],
  },
};
