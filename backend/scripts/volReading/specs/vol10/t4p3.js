// Vol 10 - Test 4 - Passage 3. Source: izone.edu.vn "Giải chi tiết đề VOL 10 – Test 4 Reading". Not in the bank.
// The PDF text is badly damaged; restored against ece.edu.vn/ielts-reading-termite-mounds (same passage): "by found" → have been
// found, spilt → split, 500C → 50°C, "by means of best its" → by means of its, "moisture less" → moisture loss, "in camera out" →
// is carried out, "filling and covering their plaster" → them with plaster, "researcher's hen carves" → researchers then carve,
// half-millimatre → half-millimetre, rocksolid → rock-solid, "environmentally," → environmentally friendly, quote marks.
// Self-supplied, minimal (every copy, ece included, lost it across a page break; no source found): Soar's quote "…what we would
// perceive to be life. If you're too hot you need to cool down, or if you're too cold you need to warm up: that's called
// homeostasis." (PDF: "perceive to cool down, or … you need to thrive"); "we need temperatures to rise" → "with temperatures set to rise".
// Questions: the PDF prints boxes 1–7 / 8–11 / 12–14 (original numbering) → 27–33 / 34–37 / 38–40.
// Key Q40: izone and ece print NOT GIVEN, but paragraph G says the findings could inspire buildings "cheap to run" because "there
// will not be enough fuel to drive air conditioners" → "YES / NOT GIVEN" (both accepted).
const { headings, notes, ynng } = require('../../vr_build');
module.exports = {
  vol: 10, test: 4, part: 3, title: 'Termite Mounds', text: 't4p3.txt',
  groups: [
    headings(27, [
      'methods used to investigate termite mound formation',
      'challenging our assumptions about the nature of life',
      'reconsidering the termite’s reputation',
      'principal functions of the termite mound',
      'distribution of termite mounds in sub-Saharan Africa',
      'some potential benefits of understanding termite architecture',
      'the astonishing physical dimensions of the termite mound',
      'termite mounds under threat from global climate change',
      'a mutually beneficial relationship',
    ], ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F', 'Paragraph G'],
    { instruction: 'Reading Passage 3 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–ix, in boxes 27–33 on your answer sheet.' }),
    notes(34, 37, [
      '• network of __Q34__ helps to give the termites a constant __Q35__ supply and to maintain a limited temperature range',
      '• cellar to aid control of __Q36__ levels in mound',
      '• top of the mound permits __Q37__',
    ], { title: 'The termite mound', instruction: 'Complete the notes below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 34–37 on your answer sheet.' }),
    ynng(38, [
      'The termite mound appears to process its refuse material internally.',
      'Dr Soar’s reconstruction involves scanning a single photograph of a complete mound into a computer.',
      'New information about termite architecture could help people deal with future energy crises.',
    ]),
  ],
  key: { 27: 'iii', 28: 'vii', 29: 'iv', 30: 'ix', 31: 'ii', 32: 'i', 33: 'vi', 34: 'tunnels', 35: 'air', 36: 'moisture',
    37: 'evaporation', 38: 'YES', 39: 'NO', 40: 'YES / NOT GIVEN' },
  expl: {
    27: ['Đoạn A', 'Đoạn A',
      '“To most of us, termites are destructive insects which can cause damage on a devastating scale. But according to Dr Rupert Soar” … “these pests may serve a useful purpose for us after all.”',
      'Mối thường bị xem là loài phá hoại, nhưng theo Soar chúng có thể có ích = xem xét lại tiếng xấu của loài mối → iii'],
    28: ['Đoạn B', 'Đoạn B',
      '“Termite mounds are impressive for their size alone; typically they are three metres high, and some as tall as eight metres have been found.”',
      'Đoạn B mô tả độ cao (3–8 m), độ sâu và mạng lưới đường hầm = kích thước vật lý đáng kinh ngạc → vii'],
    29: ['Đoạn C', 'Đoạn C',
      '“This complex system of tunnels draws in air from the outside” … “The mound also automatically regulates moisture in the air”',
      'Đoạn C liệt kê các chức năng chính của tổ: hút khí, thải khí, giữ nhiệt độ ổn định, điều hòa độ ẩm → iv'],
    30: ['Đoạn D', 'Đoạn D',
      '“The termites feed the fungus with slightly chewed wood pulp, which the fungus then breaks down into a digestible sugary food to provide the insects with energy”',
      'Mối nuôi nấm, nấm phân giải gỗ thành thức ăn cho mối = quan hệ cộng sinh hai bên cùng có lợi → ix'],
    31: ['Đoạn E', 'Đoạn E',
      '“we may ultimately need to redefine our understanding of what constitutes a ‘living’ organism.”',
      'Tổ mối khiến ta phải định nghĩa lại thế nào là “sinh vật sống” = thách thức các giả định về bản chất sự sống → ii'],
    32: ['Đoạn F', 'Đoạn F',
      '“To reveal the structure of the mounds, Soar’s team begins by filling and covering them with plaster of Paris”',
      'Đoạn F mô tả cách nghiên cứu: đổ thạch cao, cắt lát, chụp ảnh, quét và dựng mô hình 3D → i'],
    33: ['Đoạn G', 'Đoạn G',
      '“the findings could be invaluable in informing future architectural design, and could inspire buildings that are self-sufficient, environmentally friendly, and cheap to run.”',
      'Đoạn G nêu lợi ích tiềm năng khi hiểu kiến trúc tổ mối: thiết kế nhà tự chủ năng lượng, nơi ở cho môi trường khắc nghiệt → vi'],
    34: ['Mạng lưới ______ giúp mối có nguồn … ổn định và giữ nhiệt độ trong một khoảng hẹp.', 'Đoạn B, C',
      '“The mound itself is formed of an intricate lattice of tunnels” … “This complex system of tunnels draws in air from the outside”',
      'Hệ thống đường hầm (network = lattice/system of tunnels) hút khí từ bên ngoài → tunnels'],
    35: ['… nguồn cung ______ liên tục.', 'Đoạn C',
      '“so ensuring them a continuous provision of fresh, breathable air.”',
      '“continuous provision of fresh, breathable air” = a constant air supply → air'],
    36: ['Tầng hầm giúp kiểm soát mức ______ trong tổ.', 'Đoạn C',
      '“The mound also automatically regulates moisture in the air, by means of its underground ‘cellar’”',
      'Tầng hầm dưới đất giúp điều hòa độ ẩm = aid control of moisture levels → moisture'],
    37: ['Phần đỉnh tổ cho phép ______.', 'Đoạn C',
      '“and evaporation from the top of the mound.”',
      'Độ ẩm được điều hòa nhờ sự bốc hơi ở đỉnh tổ → evaporation'],
    38: ['Tổ mối dường như tự xử lý chất thải bên trong.', 'Đoạn D',
      '“although the termites must generate waste, none ever leaves the structure, indicating that there is also some kind of internal waste-recycling system.”',
      'Chất thải không bao giờ rời tổ → có hệ thống tái chế chất thải bên trong = process its refuse material internally → YES'],
    39: ['Việc tái tạo tổ của Dr Soar bao gồm quét một bức ảnh duy nhất của cả tổ vào máy tính.', 'Đoạn F',
      '“The researchers then carve the plaster of Paris into half-millimetre-thick slices, and photograph them sequentially.”',
      'Họ chụp lần lượt rất nhiều lát cắt dày nửa milimét rồi mới quét, không phải một bức ảnh của cả tổ → NO'],
    40: ['Thông tin mới về kiến trúc tổ mối có thể giúp con người đối phó với khủng hoảng năng lượng trong tương lai.', 'Đoạn G',
      '“could inspire buildings that are self-sufficient, environmentally friendly, and cheap to run.” … “there will not be enough fuel to drive air conditioners around the world.”',
      'Tác giả cho rằng kiến trúc tổ mối có thể truyền cảm hứng cho những tòa nhà tự chủ, rẻ khi vận hành, trong bối cảnh sẽ không đủ nhiên liệu chạy điều hòa = giúp đối phó với thiếu hụt năng lượng (một số đáp án ghi NOT GIVEN vì bài không dùng từ “crisis”; web nhận cả hai) → YES'],
  },
};
