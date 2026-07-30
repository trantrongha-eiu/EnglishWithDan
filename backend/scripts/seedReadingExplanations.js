// Generic one-off content seed — fills in the `explanation` field for
// questions on an ALREADY-SEEDED Passage document (found by title +
// category), matching the existing "Vị trí / Trích dẫn / Phân tích"
// convention already used elsewhere in the live DB (confirmed by reading a
// real passage's TFNG questions before writing this). This does not create
// new Passage documents — it updates one that seedReadingPassages.js (or
// admin) already created.
//
// Reused per passage: edit TARGET_TITLE/TARGET_CATEGORY and EXPLANATIONS
// below, then run `node scripts/seedReadingExplanations.js` from backend/.
// Safe to re-run — always overwrites with the current EXPLANATIONS content
// (idempotent), and errors out (no partial write) if any question number in
// EXPLANATIONS doesn't exist on the target passage, so a typo can't silently
// no-op.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

const TARGET_TITLE = 'The Davies Sisters';
const TARGET_CATEGORY = 'passage1';

const EXPLANATIONS = {
  1: `Vị trí: Đoạn 1.

Trích dẫn: "Gwendoline and Margaret Davies were the granddaughters of David Davies, a Welshman who amassed a fortune in the shipping and mining industries."

Phân tích: Chỗ trống đứng sau "from" và song song với "transportation businesses" (paraphrase của "shipping"), nên cần một danh từ khác chỉ lĩnh vực kinh doanh — đó là "mining" (khai khoáng).`,

  2: `Vị trí: Đoạn 2.

Trích dẫn: "While there was no real family history of art collecting, the sisters' education was rigorously geared toward such pursuits."

Phân tích: Từ "education" xuất hiện trực tiếp trong bài, chỉ nền giáo dục được định hướng để hai chị em yêu thích các hoạt động như sưu tầm nghệ thuật.`,

  3: `Vị trí: Đoạn 2.

Trích dẫn: "...they travelled extensively with their governess, Jane Blaker, visiting art galleries and making extensive notes on the collections there."

Phân tích: "making extensive notes" được paraphrase thành "took lengthy notes" trong đề bài.`,

  4: `Vị trí: Đoạn 4.

Trích dẫn: "The sisters' journals reveal their preference for 'Old Master' paintings."

Phân tích: "journals" (nhật ký) là chủ thể tiết lộ sở thích của họ đối với tranh Old Master, khớp với động từ "showed" trong câu hỏi ("reveal" → "showed").`,

  5: `Vị trí: Đoạn 5.

Trích dẫn: "...their first purchases of Impressionist art, made in October 1912, were scenes of Venice by the French artist Claude Monet."

Phân tích: "scenes of Venice" trong bài được diễn đạt lại thành "places in Venice" trong câu hỏi.`,

  6: `Vị trí: Đoạn 6.

Trích dẫn: "Later in the conflict, both sisters decided to volunteer at a canteen for troops at Troyes, in northern France..."

Phân tích: "troops" trong bài được paraphrase thành "soldiers" trong câu hỏi; đáp án là "canteen" (căng tin).`,

  7: `Vị trí: Đoạn 8.

Trích dẫn: "Much is made of their isolation in rural Wales and the fact that they didn't make friends with artists or gallery owners."

Phân tích: "didn't make friends with artists" được diễn đạt lại thành "did not have any friends who were artists".`,

  8: `Vị trí: Đoạn 1.

Trích dẫn: "Their religious upbringing in rural Wales gave them a deep sense of social responsibility and they chose to use their inheritance for cultural and philanthropic purposes."

Phân tích: "childhood" = "upbringing"; bài đọc khẳng định chính quá trình trưởng thành đã hình thành ý thức xã hội, từ đó ảnh hưởng đến cách họ dùng tài sản thừa kế → khớp hoàn toàn với câu hỏi. → TRUE`,

  9: `Vị trí: Đoạn 4.

Trích dẫn: "...their early purchases were of the fashionable, safe variety, and included, for example, paintings by the French artist Jean-Baptiste-Camille Corot."

Phân tích: Bài chỉ nói họ đã mua tranh của Corot, không hề đề cập tới việc mua từ đâu (phòng tranh ở Pháp hay nơi khác) → không có thông tin để xác nhận hay bác bỏ. → NOT GIVEN`,

  10: `Vị trí: Đoạn 5.

Trích dẫn: "We know that Hugh Blaker, as a champion of contemporary French art, had a hand in the decision."

Phân tích: Hugh Blaker là người ủng hộ nghệ thuật Pháp đương đại và có đóng góp vào quyết định mua tranh Ấn tượng, hoàn toàn trái ngược với "opposed" (phản đối) trong câu hỏi. → FALSE`,

  11: `Vị trí: Đoạn 7.

Trích dẫn: "The paintings were shipped directly to Bath, England, where they became the first works by Cezanne to go on display in a public gallery in Britain."

Phân tích: Bài chỉ cho biết đây là những tác phẩm đầu tiên của Cezanne được trưng bày công khai ở Anh, không hề đề cập đến mức độ nổi tiếng hay phản ứng của công chúng. → NOT GIVEN`,

  12: `Vị trí: Đoạn 9.

Trích dẫn: "By the early 1920s, Gwendoline felt increasingly uncomfortable buying art works when faced with the poverty and social upheaval created by the First World War."

Phân tích: Chiến tranh Thế giới thứ nhất khiến Gwendoline cảm thấy ngày càng khó tiếp tục mua tranh, cho thấy bà đã xem xét lại niềm đam mê sưu tầm của mình. → TRUE`,

  13: `Vị trí: Đoạn 10.

Trích dẫn: "The sisters collected French Impressionist paintings at a time when such art was routinely ignored by individuals and institutions alike."

Phân tích: "routinely ignored by individuals and institutions alike" đồng nghĩa với việc rất ít người/tổ chức quan tâm đến tranh Ấn tượng Pháp vào thời điểm đó, khớp với "very few people were doing so" trong câu hỏi. → TRUE`,
};

async function runSeed() {
  const doc = await Passage.findOne({ title: TARGET_TITLE, category: TARGET_CATEGORY });
  if (!doc) {
    throw new Error(`Passage not found: "${TARGET_TITLE}" (${TARGET_CATEGORY}) — seed the passage itself first.`);
  }

  const allQuestions = [
    ...doc.questions,
    ...doc.questionGroups.flatMap(g => g.questions),
  ];
  const byNumber = new Map(allQuestions.map(q => [q.questionNumber, q]));

  const missing = Object.keys(EXPLANATIONS).map(Number).filter(n => !byNumber.has(n));
  if (missing.length) {
    throw new Error(`Question number(s) not found on "${TARGET_TITLE}": ${missing.join(', ')}`);
  }

  let updated = 0;
  for (const [numStr, text] of Object.entries(EXPLANATIONS)) {
    const q = byNumber.get(Number(numStr));
    if (q.explanation !== text) { q.explanation = text; updated++; }
  }

  if (updated === 0) {
    console.log(`[SeedReadingExplanations] "${TARGET_TITLE}" (${TARGET_CATEGORY}) — explanations already up to date, nothing to save.`);
    return doc;
  }

  await doc.save();
  console.log(`[SeedReadingExplanations] "${TARGET_TITLE}" (${TARGET_CATEGORY}, _id=${doc._id}) — updated ${updated}/${Object.keys(EXPLANATIONS).length} explanations.`);
  return doc;
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingExplanations] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGET_TITLE, TARGET_CATEGORY, EXPLANATIONS };
