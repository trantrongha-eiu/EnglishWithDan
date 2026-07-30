// Generic one-off content seed — fills in the `explanation` field for
// questions on ALREADY-SEEDED Passage documents (each found by title +
// category), matching the existing "Vị trí / Trích dẫn / Phân tích"
// convention already used elsewhere in the live DB (confirmed by reading a
// real passage's TFNG questions before writing this). This does not create
// new Passage documents — it updates ones that seedReadingPassages.js (or
// admin) already created.
//
// Reused per passage (or batch of passages): edit TARGETS below, then run
// `node scripts/seedReadingExplanations.js` from backend/. Safe to re-run —
// always overwrites with the current EXPLANATIONS content (idempotent), and
// errors out (no partial write on that target) if any question number
// doesn't exist on it, so a typo can't silently no-op.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

const TARGETS = [
  {
    title: 'Why we need silence',
    category: 'passage2',
    explanations: {
      14: `Vị trí: Đoạn C.

Trích dẫn: "By providing recommendations for quieter buses, reducing noise from roads and also controlling noise from aircraft..." / "Other cities have introduced noise-reducing road coatings... alongside greenery that muffles sound."

Phân tích: Đoạn C liệt kê hàng loạt biện pháp giảm tiếng ồn cho công chúng: xe buýt êm hơn, giảm tiếng ồn đường bộ/máy bay, mặt đường giảm âm, tăng cây xanh hấp thụ âm thanh.`,

      15: `Vị trí: Đoạn B.

Trích dẫn: "...people living in cities such as Mumbai, Tokyo and Buenos Aires are being exposed to far more than the recommended 40 decibels of noise at night." / "...at least 1 in 5 people consistently exposed to levels considered harmful to health."

Phân tích: Đoạn B đưa ra số liệu cụ thể (mức khuyến nghị 40 decibel, tỉ lệ 1/5 dân số) cho thấy quy mô nghiêm trọng của vấn đề ô nhiễm tiếng ồn.`,

      16: `Vị trí: Đoạn A.

Trích dẫn: "Our blood pressure goes up, muscles tense and glands release hormones that prepare us for fight or flight."

Phân tích: Đoạn A mô tả các thay đổi sinh lý của cơ thể (huyết áp tăng, cơ căng, hormone tiết ra) khi nghe âm thanh đột ngột.`,

      17: `Vị trí: Đoạn G.

Trích dẫn: "Participants reported more relaxation and less boredom when they sat quietly in an outdoor garden compared with a completely silent room."

Phân tích: Đoạn G so sánh trực tiếp và cho thấy môi trường tương đối yên tĩnh (khu vườn ngoài trời) mang lại lợi ích hơn phòng hoàn toàn im lặng.`,

      18: `Vị trí: Đoạn D.

Trích dẫn: "But it is the ability to focus on the breath that helps people reach a relaxed or meditative state."

Phân tích: Sau "their own" cần một danh từ; Feinstein cho rằng khả năng tập trung vào hơi thở (breath) chính là yếu tố giúp con người thư giãn và đạt trạng thái thiền định.`,

      19: `Vị trí: Đoạn E.

Trích dẫn: "Feinstein and his colleagues recruited 50 people with a variety of conditions related to stress and had them answer a questionnaire prior to and following a flotation session."

Phân tích: Sau mạo từ "a" cần một danh từ số ít; người tham gia phải trả lời một bảng câu hỏi (questionnaire) trước và sau khi trải nghiệm bể nổi.`,

      20: `Vị trí: Đoạn E.

Trích dẫn: "Participants reported decreases in muscle tension, pain and symptoms of their conditions after a single, 1-hour float, alongside an increase in feelings of relaxation and overall wellbeing."

Phân tích: "improved general wellbeing" trong câu hỏi paraphrase từ "an increase in ... overall wellbeing" trong bài (signs of relaxation → feelings of relaxation; improved → an increase in; general → overall).`,

      21: `Vị trí: Đoạn E.

Trích dẫn: "Float sessions uniquely decreased activity in the default mode network (DMN), a collection of brain regions commonly linked with depression."

Phân tích: Sau cụm "associated with" cần một danh từ; vùng não DMN giảm hoạt động, đây là nhóm vùng não thường liên quan đến chứng trầm cảm (depression).`,

      22: `Vị trí: Đoạn F.

Trích dẫn: "When people do not want silence, it can be very distressing."

Phân tích: Ben-Soussan nhấn mạnh sự tự nguyện (volition) là yếu tố quan trọng; nếu một người bị đặt vào môi trường yên tĩnh trái ý muốn, trải nghiệm đó sẽ gây khó chịu và căng thẳng. → C. Tal Dotan Ben-Soussan`,

      23: `Vị trí: Đoạn C.

Trích dẫn: "'People are seeing the benefits of these more quiet environments in their cities,' Antonio says. 'I expect we will see much more of this in the future.'"

Phân tích: Sau khi nêu các ví dụ về thành phố áp dụng biện pháp giảm ồn, Nick Antonio dự đoán xu hướng xây dựng đô thị yên tĩnh sẽ tiếp tục phát triển. → A. Nick Antonio`,

      24: `Vị trí: Đoạn D.

Trích dẫn: "When you don't have external sensory stimuli coming in, the brain tries to fill the void to make sense of this dark and silent world."

Phân tích: Feinstein giải thích rằng khi thiếu kích thích giác quan từ bên ngoài, não bộ sẽ tự tạo ra cảm nhận (âm thanh, hình ảnh) để lấp đầy khoảng trống cảm giác. → B. Justin Feinstein`,

      25: `Vị trí: Đoạn G.

Trích dẫn: "It is likely better to have more frequency of silence for a few minutes at a time than a longer period of silence only once a week."

Phân tích: Pfeifer cho rằng không cần dành hàng giờ trong im lặng — chỉ vài phút yên tĩnh mỗi lần, lặp lại thường xuyên cũng đã mang lại lợi ích. → D. Eric Pfeifer`,

      26: `Vị trí: Đoạn F.

Trích dẫn: "This allows us to be more aware of what is happening around us and what the situation may require from us so we can provide [a more] adequate response."

Phân tích: Ben-Soussan cho rằng sự yên tĩnh cả bên ngoài lẫn nội tâm giúp con người nhận thức rõ hơn về hoàn cảnh xung quanh và phản ứng phù hợp hơn. → C. Tal Dotan Ben-Soussan`,
    },
  },
  {
    title: 'Book review: The World of Sugar by Ulbe Bosma',
    category: 'passage3',
    explanations: {
      27: `Vị trí: Đoạn 1.

Trích dẫn: "Beet sugar is grown mainly in Europe and the United States. It has also been massively subsidised and sold at artificially low prices on world markets, threatening the livelihood of producers of cane sugar."

Phân tích: Đường củ cải được trợ cấp lớn và bán với giá thấp một cách giả tạo trên thị trường quốc tế, giúp nó có lợi thế cạnh tranh hơn so với đường mía. → B. Beet sugar has been made more internationally competitive.`,

      28: `Vị trí: Đoạn 2.

Trích dẫn: "The sweet-toothed British first bought cane sugar..." / "Following the abolition of slavery..." / "Towards the end of the 19th century..." / "Only in the 20th century..."

Phân tích: Đoạn văn mô tả quá trình thay đổi nguồn cung đường của Anh qua từng thời kỳ (thuộc địa → Cuba/Brazil → châu Âu → phát triển ngành trong nước). → A. how the sources used changed over time.`,

      29: `Vị trí: Đoạn 3.

Trích dẫn: "Contrary to popular belief, cane sugar production was never just restricted to large, dedicated plantations owned by rich men."

Phân tích: Tác giả bác bỏ quan niệm sai lầm phổ biến rằng đường mía chỉ được sản xuất tại các đồn điền lớn của người giàu; ví dụ ở Java cho thấy nông hộ nhỏ cũng tham gia sản xuất. → C. addressing a misconception about the growing of sugar cane.`,

      30: `Vị trí: Đoạn cuối.

Trích dẫn: "He shows that we could always have done without sugar and that today we have many alternative sources of sweetness."

Phân tích: Bosma kết luận rằng con người hoàn toàn có thể sống mà không cần đường, đúc kết từ những tác động tiêu cực của ngành đường xuyên suốt cuốn sách. → A. Sugar is a harmful and unnecessary product.`,

      31: `Vị trí: Đoạn 4.

Trích dẫn: "German beet fields employed Polish workers; Mexicans and many others, including Sicilians, were vital to US sugar production."

Phân tích: Cả Đức và Mỹ đều dựa vào lao động nhập cư (migrant workers) để duy trì sản xuất đường quy mô lớn.`,

      32: `Vị trí: Đoạn 4.

Trích dẫn: "...the book is about the continuity of the use of traditional methods on small farms. In the mid 20th-century, this type of sugar production dominated in South Asia and Latin America."

Phân tích: Tại Nam Á và Mỹ Latinh, mô hình canh tác quy mô nhỏ (small-scale cultivation) vẫn tiếp tục chiếm ưu thế.`,

      33: `Vị trí: Đoạn 5.

Trích dẫn: "This is also a history of capitalists and sugar dynasties, as well as corporations that in some cases have remained influential over very long periods. Great firms and great interests have had profound influence on the policies of states."

Phân tích: Các nhà tư bản, gia tộc kinh doanh đường và tập đoàn lớn (powerful individuals and businesses) có ảnh hưởng mạnh và luôn muốn bảo vệ thị trường/lợi ích của mình.`,

      34: `Vị trí: Đoạn 5.

Trích dẫn: "...a powerful sugar bourgeoisie played a major role in politics and their interests were consequently protected by trade barriers and subsidies."

Phân tích: "politics" trong bài tương ứng với "national governments" trong tóm tắt — tầng lớp tư sản ngành đường có vai trò lớn trong chính trị, tức là có ảnh hưởng đến chính phủ quốc gia.`,

      35: `Vị trí: Đoạn 5.

Trích dẫn: "...their interests were consequently protected by trade barriers and subsidies."

Phân tích: "trade barriers and subsidies" là các biện pháp kiểm soát tài chính/thương mại (financial controls) được thiết lập để bảo vệ lợi ích của nhà sản xuất đường.`,

      36: `Vị trí: Đoạn 5.

Trích dẫn: "...it was inevitably the poor countries which came off worse."

Phân tích: "poor countries" tương ứng với "less wealthy nations" — các quốc gia nghèo hơn luôn là bên chịu thiệt trong cuộc cạnh tranh của ngành đường.`,

      37: `Vị trí: Đoạn 6.

Trích dẫn: "The growth of the industry entailed a very rapid diffusion of ideas and techniques from one country to another. Cuba, for example, developed an extraordinarily dense system of railways to transport workers and cane, as well as steam-powered sugar factories."

Phân tích: Bài nhấn mạnh vai trò của công nghệ, máy móc, đường sắt, nhà máy hơi nước và các giống mía/củ cải mới giúp sản lượng đường tăng vọt → ủng hộ nhận định đường trở nên dồi dào nhờ hàng loạt tiến bộ nông nghiệp/công nghệ. → YES`,

      38: `Vị trí: Đoạn 7.

Trích dẫn: "Once regarded as a luxury, sugar came to be promoted as a valuable source of energy."

Phân tích: Bài chỉ nói đường TỪNG ĐƯỢC XEM LÀ hàng xa xỉ, không nói rõ các nhà quảng cáo ban đầu có chủ động tiếp thị nó như vậy hay không → không đủ căn cứ. → NOT GIVEN`,

      39: `Vị trí: Đoạn 7.

Trích dẫn: "High-fructose corn syrup made from maize using an enzymatic process invented in Japan in the 1960s... is regarded as a leading cause of obesity."

Phân tích: Tác giả gọi đây là "worrying new development" và cho biết HFCS bị xem là nguyên nhân hàng đầu gây béo phì → không phải một phát triển tích cực. → NO`,

      40: `Vị trí: Đoạn 7.

Trích dẫn: "It is now widely consumed, having been adopted in the making of soft drinks and a large number of processed foods, and is regarded as a leading cause of obesity."

Phân tích: Bài khẳng định HFCS được sử dụng rộng rãi trong nước giải khát và nhiều loại thực phẩm chế biến sẵn. → YES`,
    },
  },
];

async function runSeed() {
  const results = [];
  for (const target of TARGETS) {
    const doc = await Passage.findOne({ title: target.title, category: target.category });
    if (!doc) {
      throw new Error(`Passage not found: "${target.title}" (${target.category}) — seed the passage itself first.`);
    }

    const allQuestions = [
      ...doc.questions,
      ...doc.questionGroups.flatMap(g => g.questions),
    ];
    const byNumber = new Map(allQuestions.map(q => [q.questionNumber, q]));

    const missing = Object.keys(target.explanations).map(Number).filter(n => !byNumber.has(n));
    if (missing.length) {
      throw new Error(`Question number(s) not found on "${target.title}": ${missing.join(', ')}`);
    }

    let updated = 0;
    for (const [numStr, text] of Object.entries(target.explanations)) {
      const q = byNumber.get(Number(numStr));
      if (q.explanation !== text) { q.explanation = text; updated++; }
    }

    if (updated === 0) {
      console.log(`[SeedReadingExplanations] "${target.title}" (${target.category}) — explanations already up to date, nothing to save.`);
    } else {
      await doc.save();
      console.log(`[SeedReadingExplanations] "${target.title}" (${target.category}, _id=${doc._id}) — updated ${updated}/${Object.keys(target.explanations).length} explanations.`);
    }
    results.push(doc);
  }
  return results;
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

module.exports = { runSeed, TARGETS };
