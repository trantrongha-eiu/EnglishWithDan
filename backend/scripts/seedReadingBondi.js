// Reading de 1-21: adds the missing "Bondi" passage (Passage 1). Its two
// sibling passages from the same source test — "The economic effect of
// climate" (passage2) and "A closer examination of a study on verbal and
// non-verbal messages" (passage3) — already existed in the DB as standalone
// practice passages (isActualTest:false), but Passage 1 was never created,
// so it never appeared as a "Reading lẻ" option. Content transcribed from
// reading material/Reading de 1-21_resized.pdf (cleaned of the PDF's
// font-cmap corruption — see reading material/clean_extract.py) and cross-
// checked directly against the source passage; no separate answer key exists
// in the PDF, so correctAnswer/explanation values were derived by reading
// the passage.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Passage = require('../models/Passage');

const CONTENT = `<h2>Bondi</h2>
<p><em>Bondi is Australia's most famous beach, but how did this come about?</em></p>

<p>Australians have not always valued Sydney's Bondi Beach. Beaches attracted little attention in the first century of British colonial settlement, when it was the country's desert interior that stirred the settlers' imagination. The visual image of Australia was based on stories of explorers searching in the dry red centre for an inland sea, of men driving cattle vast distances, or shearing sheep in hot dusty sheds. It was a cultural landscape developed in hardship and tragedy.</p>

<p>Before the British settlement, there had been a strong traditional connection to the coast among Aboriginal people, the indigenous inhabitants of Australia, and evidence of this connection can still be seen. In 1788 Governor Phillip, who established the first British settlement on the eastern coast of Australia, estimated that there were approximately 1500 Aboriginal people living within a 10-mile radius of Sydney Harbour. But by the 1820s the local Aboriginal population had largely disappeared as a result of contact with the diseases brought by the settlers. In the minds of the new settlers, Aboriginal culture would come to be predominantly associated with the inland desert. The cultural associations that formed around Australia's beach landscape would, in turn, be almost entirely European in nature. Compared with the 'ancient' and bicultural mythology of Australia's interior, its beach culture would be depicted as being wholly modern and Western.</p>

<p>At the end of the 19th century, the beach emerged in art and literature as an alternative cultural landscape to the mythology of the interior. The two settings were similar in that they shared an idea of purity because of their association with nature, but otherwise they represented vastly different qualities. The interior of the country represented hard work and suffering, while the coast evoked images of health, leisure and egalitarianism.</p>

<p>In Britain, the association of beaches with health received royal blessing in 1783 when a prominent member of the royal family attended the health spas at Brighton Beach on the English coast, and built a pavilion there. With its entertainment, hotels and weekend villas, Brighton became the model for beaches throughout Britain's colonies. Reflecting the English resort's influence, seven Sydney beach suburbs still have a Brighton Street. Sydney's beach suburbs, rising to prominence in the late 19th century, shared Brighton's association with health. The perception of the city's beaches as places of purity and well-being was strengthened by contrast with the increasingly polluted city centre.</p>

<p>By the end of the 19th century, Sydney's beaches had begun to differ in their socio-economic characteristics. The beach in the suburb of Coogee was the first ocean beach to become accessible by tram from the city. Promoted as a garden suburb, Coogee became a recreational meeting place for the city's middle class. The suburb of Manly, with its beach and esplanade, copied the British resort model, and attracted the city's wealthy class living in the northern suburbs as well as holiday-makers from farms in the countryside.</p>

<p>The suburb of Bondi was developed after Coogee and Manly and took on a character distinct from the city's other beach suburbs. With the extension of the tramline to Bondi in the 1890s, a number of substantial properties were built there. Property developers, expecting continued middle-class development, subdivided the area into house-sized plots. However, a sudden demand for housing in the first decade of the 20th century saw the plans for houses put aside, and investors built blocks of flats instead. A treeless plain of red-roofed apartments began to spread its way across Bondi. Built with cheap local bricks, the size and quality of the apartments were generally more modest than those in neighbouring suburbs, and quickly attracted a population of rent-paying, working-class tenants.</p>

<p>With tram access extended all the way to the beach, Bondi also became the most accessible ocean beach to people living in the inner city, who were mostly working class. The pleasures of the sun, sea and surf were not only for the wealthy, but free to all. The Australian notion of beaches as places of social equality became established, and Bondi exemplified this precisely.</p>

<p>Bondi's identity as a largely working-class suburb began to change in the 1950s. The suburb and its beach first came to international attention in 1954 when Queen Elizabeth of England and her husband Prince Philip attended a surf carnival there. Since then, Bondi has become one of Sydney's most used sites for large-scale public events. The film industry quickly built on the fame that Bondi beach acquired as a result of the surf carnival, and since then it has been the location of many Australian films. With the expanding use of Bondi as a media setting, the suburb became home to a community of artists as well as film and television workers. Since the 1970s Bondi has become the almost inevitable backdrop for any artistic or commercial project in Sydney that requires a beach setting. Bondi is now famous simply for being famous.</p>

<p>In the preparations for the 2000 Olympic Games, Bondi was nominated to host the 10,000-seat beach volleyball stadium. Some people in the Bondi community did not support the proposal because of concerns for the environment, but the opposition was dismissed by the Olympics Organising Committee. There were good practical reasons for the Committee to support Bondi's hosting of the event, but the main reason the Committee insisted the stadium be built there was the international expectation that Bondi, as Australia's best known beach, would be the stadium's scenic backdrop.</p>`;

const TARGET = {
  title: 'Bondi',
  category: 'passage1',
  content: CONTENT,
  questionRange: { start: 1, end: 13 },
  isActualTest: false,
  isActive: true,
  questionGroups: [
    {
      groupType: 'plain',
      instruction: 'Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
      questions: [
        { questionNumber: 1, type: 'true-false-ng', questionText: 'Bondi beach has been popular since the arrival of the first British settlers in Australia.', correctAnswer: 'FALSE', explanation: 'Vị trí: đoạn 1. Trích dẫn: "Beaches attracted little attention in the first century of British colonial settlement." Phân tích: bãi biển hầu như không được chú ý trong thế kỷ đầu tiên sau khi người Anh định cư, trái với ý "phổ biến ngay từ đầu".' },
        { questionNumber: 2, type: 'true-false-ng', questionText: 'Aborigines in the centre of Australia had a different culture from those on the coast.', correctAnswer: 'NOT GIVEN', explanation: 'Vị trí: đoạn 2. Phân tích: bài chỉ nói văn hoá thổ dân sau này được người định cư gắn với sa mạc nội địa trong nhận thức của họ, chứ không hề so sánh hay khẳng định có hai nền văn hoá thổ dân khác nhau giữa vùng nội địa và vùng biển.' },
        { questionNumber: 3, type: 'true-false-ng', questionText: 'Contemporary Australian beach culture reflects Aboriginal traditions.', correctAnswer: 'FALSE', explanation: 'Vị trí: đoạn 2. Trích dẫn: "The cultural associations that formed around Australia\'s beach landscape would...be almost entirely European in nature." Phân tích: văn hoá bãi biển mang tính châu Âu, không phản ánh truyền thống thổ dân.' },
        { questionNumber: 4, type: 'true-false-ng', questionText: 'At the end of the 19th century, some parts of Australia were associated with a difficult life.', correctAnswer: 'TRUE', explanation: 'Vị trí: đoạn 3. Trích dẫn: "The interior of the country represented hard work and suffering." Phân tích: vùng nội địa gắn với lao động vất vả và khổ đau — đúng là "cuộc sống khó khăn".' },
        { questionNumber: 5, type: 'true-false-ng', questionText: "Sydney's beach suburbs were influenced by a seaside town in England.", correctAnswer: 'TRUE', explanation: 'Vị trí: đoạn 4. Trích dẫn: "Brighton became the model for beaches throughout Britain\'s colonies...seven Sydney beach suburbs still have a Brighton Street." Phân tích: các khu bãi biển Sydney chịu ảnh hưởng trực tiếp từ thị trấn biển Brighton của Anh.' },
        { questionNumber: 6, type: 'true-false-ng', questionText: "At the end of the 19th century, Sydney's beaches were regarded as unhealthy places to be.", correctAnswer: 'FALSE', explanation: 'Vị trí: đoạn 4. Trích dẫn: "Sydney\'s beach suburbs...shared Brighton\'s association with health. The perception of the city\'s beaches as places of purity and well-being was strengthened..." Phân tích: ngược lại, bãi biển được xem là nơi lành mạnh, tốt cho sức khoẻ.' },
      ],
    },
    {
      groupType: 'plain',
      instruction: 'Answer the questions below. Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer.',
      questions: [
        { questionNumber: 7, type: 'fill-blank', questionText: 'What form of public transport could people use to get to the beach at the end of the 19th century?', correctAnswer: 'tram', explanation: 'Vị trí: đoạn 5. Trích dẫn: "The beach in the suburb of Coogee was the first ocean beach to become accessible by tram from the city." Phân tích: phương tiện công cộng được nhắc đến là "tram" (xe điện).' },
        { questionNumber: 8, type: 'fill-blank', questionText: 'Which beachside suburb was popular with people from rural areas?', correctAnswer: 'Manly', explanation: 'Vị trí: đoạn 5. Trích dẫn: "The suburb of Manly...attracted...holiday-makers from farms in the countryside." Phân tích: Manly thu hút cả người đi nghỉ từ các nông trại ở nông thôn.' },
        { questionNumber: 9, type: 'fill-blank', questionText: "Which suburb helped to meet the needs of Sydney's accommodation shortage?", correctAnswer: 'Bondi', explanation: 'Vị trí: đoạn 6. Trích dẫn: "a sudden demand for housing in the first decade of the 20th century saw the plans for houses put aside, and investors built blocks of flats instead" (nói về Bondi). Phân tích: Bondi được xây thành các khối căn hộ để đáp ứng nhu cầu nhà ở tăng đột biến.' },
        { questionNumber: 10, type: 'fill-blank', questionText: 'When did British royalty visit Bondi?', correctAnswer: '1954', explanation: 'Vị trí: đoạn 8. Trích dẫn: "in 1954 when Queen Elizabeth of England and her husband Prince Philip attended a surf carnival there." Phân tích: Nữ hoàng Anh và Hoàng thân Philip đến Bondi năm 1954.' },
        { questionNumber: 11, type: 'fill-blank', questionText: 'Which industry is Bondi now associated with?', correctAnswer: 'the film industry', explanation: 'Vị trí: đoạn 8. Trích dẫn: "The film industry quickly built on the fame that Bondi beach acquired...it has been the location of many Australian films." Phân tích: Bondi hiện gắn liền với ngành công nghiệp điện ảnh.' },
        { questionNumber: 12, type: 'fill-blank', questionText: 'What sporting event at the 2000 Olympic Games was held at Bondi?', correctAnswer: 'beach volleyball', explanation: 'Vị trí: đoạn 9. Trích dẫn: "Bondi was nominated to host the 10,000-seat beach volleyball stadium." Phân tích: môn thể thao được tổ chức tại Bondi là bóng chuyền bãi biển.' },
        { questionNumber: 13, type: 'fill-blank', questionText: 'What did people think could be damaged by building a stadium on Bondi Beach?', correctAnswer: 'the environment', explanation: 'Vị trí: đoạn 9. Trích dẫn: "Some people in the Bondi community did not support the proposal because of concerns for the environment." Phân tích: người dân lo ngại việc xây sân vận động sẽ ảnh hưởng đến môi trường.' },
      ],
    },
  ],
};

async function runSeed() {
  const existing = await Passage.findOne({ title: TARGET.title, category: TARGET.category });
  if (existing) {
    console.log(`[SeedReadingBondi] "${TARGET.title}" already exists — no changes made.`);
    return;
  }
  await Passage.create(TARGET);
  console.log(`[SeedReadingBondi] Created "${TARGET.title}" with real content, isActive:true.`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedReadingBondi] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGET };
