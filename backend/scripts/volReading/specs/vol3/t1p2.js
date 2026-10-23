// Vol 3 - Test 1 - Reading Passage 2 (PDF p5–8). Not in the bank (mini-ielts 1528 = same text and questions, numbered 1–13).
// Text = PDF (typed, clean OCR; printed as 7 blocks, the instruction says six paragraphs A–F → "The way insects…" + "How
// quickly…" = E). Two sentences are cut in every copy; completed from the source article (The Economist, "Group decisions",
// on Christian List's LSE page): "looked at colonies once the original colony…" → "looked at colonies of honeybees, which divide
// once the original colony…"; "Conversely, bees in the model blindly following the waggle dances of others without first
// checking." → "… without first checking whether the site was as advertised led to a swift but mistaken decision." Other fixes:
// "decision made collectively" → decisions, "small difference" → differences, "homelss", "the bees site" → best site, "nest
// become" → becomes, summary "for people well as insects" → as well as. Key (explain file; Q21/Q23 unreadable there = mini key)
// checked against the passage: all correct.
const { headings, matching, notes } = require('../../vr_build');
module.exports = {
  vol: 3, test: 1, part: 2, title: 'Insect decision-making', text: 't1p2.txt',
  groups: [
    headings(14, [
      'The effect of man-made imitations on insects',
      'The need to instruct additional insect guides',
      'Signals used by certain insects to indicate a discovery',
      'How urgency can affect the process of finding a new home',
      'The use of trained insects in testing scientific theories',
      'The use of virtual scenarios in the study of insect behaviour',
      'How the number of decision-makers affects the decision',
    ], ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F'],
    { instruction: 'Reading Passage 2 has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–vii, in boxes 14–19 on your answer sheet.' }),
    matching(20, ['Nicolas de Condorcet', 'Christian List and colleagues', 'José Halloy', 'Nigel Franks and colleagues'], [
      'Certain members can influence the rest of the group to alter a previous decision.',
      'Individual verification of a proposed choice is important for a successful decision outcome.',
      'The more individuals taking part in a decision, the better the decision will be.',
      'The decision-making process of certain insects produces excellent results even when fine distinctions are required.',
    ], { title: 'List of Academics', reuse: true,
      instruction: 'Look at the following findings (Questions 20–23) and the list of academics below. Match each finding with the correct academic, A–D. Write the correct letter, A–D, in boxes 20–23 on your answer sheet. NB You may use any letter more than once.' }),
    notes(24, 26, [
      'A Bristol University study looked at how insects make decisions when their home has been __Q24__. The ants in the experiment relied on the use of individuals called __Q25__ to find a new nest and efficiently direct the others to go there. The study concluded that the effective implementation of the ants\' decision meant that the insects could change homes quickly. The study emphasised the necessity, for people as well as insects, of having active __Q26__ in order to execute decisions successfully.',
    ], { title: 'A study of insect decision-making', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 24–26 on your answer sheet.' }),
  ],
  key: { 14: 'vii', 15: 'iii', 16: 'vi', 17: 'i', 18: 'iv', 19: 'ii', 20: 'C', 21: 'B', 22: 'A', 23: 'B', 24: 'threatened', 25: 'scouts', 26: 'leaders' },
  expl: {
    14: ['Đoạn A', 'Đoạn A',
      '“the probability of a correct decision increases with the size of the jury.”',
      'Đoạn A trình bày “định lý bồi thẩm đoàn” của Condorcet: càng nhiều người cùng quyết định thì quyết định càng dễ đúng → vii How the number of decision-makers affects the decision'],
    15: ['Đoạn B', 'Đoạn B',
      '“reported back using a characteristic body movement known as a \'waggle dance\' to indicate to the other bees the suitable places they have located.”',
      'Trọng tâm đoạn B là điệu “waggle dance” — tín hiệu ong dùng để báo nơi làm tổ mới tìm được → iii Signals used by certain insects to indicate a discovery'],
    16: ['Đoạn C', 'Đoạn C',
      '“Dr List and his colleagues used a computer-generated model of the decision-making process.”',
      'Mô hình máy tính = tình huống ảo dùng để nghiên cứu hành vi của ong → vi The use of virtual scenarios in the study of insect behaviour'],
    17: ['Đoạn D', 'Đoạn D',
      '“José Halloy of the Free University of Brussels in Belgium used robotic cockroaches to subvert the behaviour of living cockroaches and control their decision-making process.”',
      'Gián robot (đồ nhân tạo bắt chước côn trùng) làm thay đổi quyết định của gián thật → i The effect of man-made imitations on insects'],
    18: ['Đoạn E', 'Đoạn E',
      '“reduce the problems associated with making a necessarily swift choice. If the ants\' existing nest becomes suddenly threatened”',
      'Tổ bị đe doạ đột ngột buộc kiến phải chọn nhanh — sự cấp bách ảnh hưởng đến việc tìm tổ mới → iv How urgency can affect the process of finding a new home'],
    19: ['Đoạn F', 'Đoạn F',
      '“the chosen ants begin to lead others” … “back to the original threatened nest. In this way, those ants which are familiar with the route can help transport”',
      'Kiến dẫn đường quay về dẫn thêm những con khác để chúng cũng biết đường và cùng dẫn dắt → ii The need to instruct additional insect guides'],
    20: ['Một số thành viên có thể khiến cả nhóm thay đổi quyết định trước đó.', 'Đoạn D',
      '“Halloy was able to persuade the living cockroaches to choose an inappropriate shelter – even one which they had rejected before being infiltrated by the robots.”',
      'Số ít gián robot khiến gián thật chọn nơi trú mà trước đó chúng đã từ chối → C'],
    21: ['Việc mỗi cá thể tự kiểm chứng lựa chọn được đề xuất là quan trọng để quyết định thành công.', 'Đoạn C',
      '“depends on both the bees\' interdependence in communicating the whereabouts of the best site, and their independence in confirming this information for themselves.”',
      '“independence in confirming this information for themselves” = tự kiểm chứng; đây là kết luận của nhóm Dr List → B'],
    22: ['Càng nhiều cá thể tham gia quyết định thì quyết định càng tốt.', 'Đoạn A',
      '“Moreover, the probability of a correct decision increases with the size of the jury.”',
      'Bồi thẩm đoàn càng đông thì khả năng quyết định đúng càng cao — định lý của Condorcet → A'],
    23: ['Quá trình ra quyết định của một số loài côn trùng cho kết quả rất tốt ngay cả khi cần phân biệt những khác biệt nhỏ.', 'Đoạn B',
      '“The decision is remarkably reliable, with the bees choosing the best site even when there are only small differences between alternative sites.”',
      '“small differences between alternative sites” = fine distinctions; nghiên cứu về ong của nhóm Dr List → B'],
    24: ['Nghiên cứu của Đại học Bristol xem côn trùng ra quyết định thế nào khi tổ của chúng bị ______.', 'Đoạn E',
      '“If the ants\' existing nest becomes suddenly threatened, the insects choose certain ants to act as scouts to find a new nest.”',
      'Tổ bị đe doạ (threatened) → threatened'],
    25: ['Kiến trong thí nghiệm dựa vào những cá thể gọi là ______ để tìm tổ mới.', 'Đoạn E',
      '“the insects choose certain ants to act as scouts to find a new nest.”',
      'Những con kiến được chọn đi tìm tổ mới gọi là trinh sát → scouts'],
    26: ['Nghiên cứu nhấn mạnh sự cần thiết, với cả con người lẫn côn trùng, của việc có những ______ năng động để thực hiện quyết định.', 'Đoạn F',
      '“it does suggest, even for humans, the importance of recruiting dynamic leaders to a cause”',
      '“dynamic leaders” = người lãnh đạo năng động (active) → leaders'],
  },
};
