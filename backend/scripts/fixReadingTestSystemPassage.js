'use strict';

/**
 * One-off content fix for the single broken "đề lẻ" (individual practice
 * passage) found by a full audit of every Passage doc — see chat log
 * 2026-09-11. Every other passage in the collection already has full text,
 * 13/14 real questions, a correctAnswer, and a detailed bilingual
 * explanation; this "test system" doc (an admin scratch entry, isActive:
 * false, referenced by zero ReadingTest "đề full") had real passage text
 * (Cambridge-style "The Step Pyramid of Djoser", 7 paragraphs A–G) but ZERO
 * questions for its declared range 1–13.
 *
 * This script adds 13 original questions (6 True/False/Not Given + 7
 * paragraph-matching, mirroring the exact groupType/instruction/explanation
 * conventions already used across the collection), gives it a real title,
 * and activates it. Scoped to this one _id — no bulk writes. Already run
 * against prod; kept here as a record (it now refuses to re-run since the
 * title guard no longer matches "test system").
 *
 * Run: node backend/scripts/fixReadingTestSystemPassage.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

const PASSAGE_ID = '6a2af09b18f3aea4f062be75';
const NEW_TITLE = 'The Step Pyramid of Djoser';

const tfngGroup = {
  groupType: 'plain',
  groupTitle: 'Questions 1–6',
  instruction: 'Do the following statements agree with the information given in Reading Passage 1?',
  questions: [
    {
      questionNumber: 1, type: 'true-false-ng',
      questionText: 'Djoser was the first Egyptian king to construct a monument using stone.',
      correctAnswer: 'TRUE',
      explanation: 'Vị trí: Đoạn B.\n\nTranscript: "Djoser was the first king of the Third Dynasty of Egypt and the first to build in stone."\n\nPhân tích: Bài đọc khẳng định trực tiếp Djoser là vị vua đầu tiên xây dựng công trình bằng đá — đúng với statement.',
    },
    {
      questionNumber: 2, type: 'true-false-ng',
      questionText: 'Historians agree on exactly how long Djoser ruled Egypt.',
      correctAnswer: 'FALSE',
      explanation: 'Vị trí: Đoạn B.\n\nTranscript: "Djoser is thought to have reigned for 19 years, but some historians and scholars attribute a much longer time for his rule."\n\nPhân tích: Các nhà sử học KHÔNG thống nhất về thời gian trị vì của Djoser (19 năm hay lâu hơn), trái ngược với statement cho rằng họ "đồng thuận" — Mâu thuẫn.',
    },
    {
      questionNumber: 3, type: 'true-false-ng',
      questionText: 'The Step Pyramid was built according to a single plan from beginning to end.',
      correctAnswer: 'FALSE',
      explanation: 'Vị trí: Đoạn C.\n\nTranscript: "Much experimentation was involved... It had several plans... before it became the first Step Pyramid in history, piling six levels on top of one another."\n\nPhân tích: Công trình trải qua nhiều lần thử nghiệm và thay đổi bản vẽ ("several plans"), không phải một kế hoạch duy nhất từ đầu đến cuối — Mâu thuẫn.',
    },
    {
      questionNumber: 4, type: 'true-false-ng',
      questionText: 'The pyramid complex contained living space for the people who guarded the tomb.',
      correctAnswer: 'NOT GIVEN',
      explanation: 'Vị trí: Đoạn D.\n\nTranscript: "The complex... included a temple, courtyards, shrines, and living quarters for the priests."\n\nPhân tích: Bài đọc chỉ nhắc đến chỗ ở cho các thầy tu (priests), không hề đề cập đến người canh gác (guards) hay chỗ ở riêng cho họ — Không có thông tin.',
    },
    {
      questionNumber: 5, type: 'true-false-ng',
      questionText: 'Archaeologists and historians share the same opinion about why the stone vessels were placed in the tomb.',
      correctAnswer: 'FALSE',
      explanation: 'Vị trí: Đoạn E.\n\nTranscript: "There is no agreement among scholars and archaeologists on why the vessels were placed in the tomb of Djoser or what they were supposed to represent."\n\nPhân tích: Bài đọc nói rõ KHÔNG có sự đồng thuận ("no agreement") giữa các học giả, trái ngược hoàn toàn với statement — Mâu thuẫn.',
    },
    {
      questionNumber: 6, type: 'true-false-ng',
      questionText: "A small number of Djoser's personal valuables were still discovered by archaeologists despite the tomb being robbed.",
      correctAnswer: 'TRUE',
      explanation: "Vị trí: Đoạn F.\n\nTranscript: \"Djoser's grave goods, and even his body, were stolen at some point in the past and all archaeologists found were a small number of his valuables overlooked by the thieves.\"\n\nPhân tích: Dù lăng mộ đã bị trộm, các nhà khảo cổ vẫn tìm thấy một số ít đồ vật quý giá mà kẻ trộm bỏ sót — đúng với statement.",
    },
  ],
};

const matchingGroup = {
  groupType: 'matching-options',
  groupTitle: 'Questions 7–13',
  instruction: 'Reading Passage 1 has seven paragraphs, A–G. Which paragraph contains the following information? Write the correct letter, A–G, in boxes 7-13 on your answer sheet.',
  matchingOptions: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  matchingReuseAllowed: true,
  questions: [
    {
      questionNumber: 7, type: 'matching-info',
      questionText: '7   an explanation of why one particular monument is regarded as the starting point of pyramid-building in Egypt',
      correctAnswer: 'A',
      explanation: 'Vị trí: Đoạn A.\n\nTranscript: "there is no question that, as far as Egypt is concerned, it began with one monument to one king designed by one brilliant architect: the Step Pyramid of Djoser at Saqqara."\n\nPhân tích: Đoạn A giải thích vì sao Kim tự tháp bậc thang của Djoser được coi là điểm khởi đầu của kiến trúc kim tự tháp Ai Cập.',
    },
    {
      questionNumber: 8, type: 'matching-info',
      questionText: '8   a reference to disagreement over the exact length of a king’s reign',
      correctAnswer: 'B',
      explanation: 'Vị trí: Đoạn B.\n\nTranscript: "Djoser is thought to have reigned for 19 years, but some historians and scholars attribute a much longer time for his rule."\n\nPhân tích: Đoạn B đề cập đến sự bất đồng giữa các nhà nghiên cứu về thời gian trị vì của Djoser.',
    },
    {
      questionNumber: 9, type: 'matching-info',
      questionText: '9   a description of a technical solution used to deal with the weight of the structure',
      correctAnswer: 'C',
      explanation: 'Vị trí: Đoạn C.\n\nTranscript: "The weight of the enormous mass was a challenge for the builders, who placed the stones at an inward incline in order to prevent the monument breaking up."\n\nPhân tích: Đoạn C mô tả giải pháp kỹ thuật (đặt đá nghiêng vào trong) để chịu được sức nặng khổng lồ của công trình.',
    },
    {
      questionNumber: 10, type: 'matching-info',
      questionText: '10   details of security features intended to mislead anyone trying to break into the complex',
      correctAnswer: 'D',
      explanation: 'Vị trí: Đoạn D.\n\nTranscript: "The wall had 13 false doors cut into it with only one true entrance... The false doors and the trench were incorporated into the complex to discourage unwanted visitors."\n\nPhân tích: Đoạn D mô tả các cửa giả và con hào được thiết kế để đánh lừa, ngăn người xâm nhập.',
    },
    {
      questionNumber: 11, type: 'matching-info',
      questionText: '11   two different explanations for why certain objects were left inside the tomb',
      correctAnswer: 'E',
      explanation: 'Vị trí: Đoạn E.\n\nTranscript: "The archaeologist Jean-Philippe Lauer... believes they were originally stored and then give a ‘proper burial’ by Djoser... There are other historians, however, who claim the vessels were dumped into the shafts as yet another attempt to prevent grave robbers."\n\nPhân tích: Đoạn E đưa ra hai giả thuyết khác nhau (của Lauer và của các nhà sử học khác) về lý do các bình đá được đặt trong lăng mộ.',
    },
    {
      questionNumber: 12, type: 'matching-info',
      questionText: '12   a mention of thieves managing to get into the tomb despite the precautions taken',
      correctAnswer: 'F',
      explanation: 'Vị trí: Đoạn F.\n\nTranscript: "Unfortunately, all of the precautions and intricate design of the underground network did not prevent ancient robbers from finding a way in."\n\nPhân tích: Đoạn F nói rằng dù đã có nhiều biện pháp phòng ngừa, những kẻ trộm cổ đại vẫn tìm được cách xâm nhập.',
    },
    {
      questionNumber: 13, type: 'matching-info',
      questionText: '13   a quotation stressing how significant the monument is in architectural history',
      correctAnswer: 'G',
      explanation: 'Vị trí: Đoạn G.\n\nTranscript: "Few monuments hold a place in human history as significant as that of the Step Pyramid in Saqqara… this pyramid complex constitutes a milestone in the evolution of monumental stone architecture in Egypt and in the world as a whole."\n\nPhân tích: Đoạn G trích lời nhà Ai Cập học Miroslav Verner nhấn mạnh tầm quan trọng lịch sử của công trình.',
    },
  ],
};

async function run() {
  const p = await Passage.findById(PASSAGE_ID);
  if (!p) throw new Error(`Passage ${PASSAGE_ID} not found`);
  if (p.title !== 'test system') {
    throw new Error(`Refusing to run: expected title "test system", found "${p.title}" — this script is scoped to one specific doc, already applied.`);
  }
  if ((p.questions && p.questions.length) || (p.questionGroups && p.questionGroups.some(g => (g.questions || []).length))) {
    throw new Error('Refusing to run: this passage already has questions — script only meant for the zero-question case.');
  }

  p.title = NEW_TITLE;
  p.questionGroups = [tfngGroup, matchingGroup];
  // Legacy flat mirror — every other passage in the collection keeps this
  // in sync with questionGroups[].questions (see Passage.js comment).
  p.questions = [...tfngGroup.questions, ...matchingGroup.questions];
  p.isActive = true;
  p.markModified('questionGroups');
  p.markModified('questions');
  await p.save();

  console.log(`[fix] "${NEW_TITLE}" (${PASSAGE_ID}): 13 questions added, isActive=true`);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await run();
  } finally {
    await mongoose.disconnect();
  }
})().catch(e => { console.error('[fix] FAILED', e); process.exit(1); });
