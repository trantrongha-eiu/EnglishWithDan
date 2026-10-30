'use strict';
// Hand-checked Reading fixes (debug 2026-10-30), applied by ../fixReadingDebug.js.
// Keyed by passage _id. Per passage:
//   title:   current title (guard) · rename: new title
//   content: [[from, to], …]  exact substring replacements in the passage text (each must match exactly once)
//   expl:    { qNum: 'new explanation' | [[from, to], …] }
//   keys:    { qNum: [from, to] }   · types: { qNum: [from, to] }
//   groups:  [{ q: qNumInGroup, set: { field: value } }]  (instruction / groupTitle …)
// Quotes are copied verbatim from the passage; "Trích" lines must pass volReading/rd_deep_audit.js.

const E = (...parts) => parts.join('\n\n');

module.exports = {
  // ── Timur Gareyev (Actual Mocktest 12 P3): every "Transcript" was invented or written in Vietnamese ──
  '6a2daec2759f3f7b6e64eb1e': {
    title: 'Timur Gareyev – blindfold chess champion',
    expl: {
      27: E('Vị trí: Đoạn D',
        'Trích: “But displays of the feat go back centuries. The first recorded game in Europe was played in 13th-century Florence. In 1947, the Argentinian grandmaster Miguel Najdorf played 45 simultaneous games in his mind, winning 39 in the 24-hour session.”',
        'Phân tích: Đoạn D nêu các ví dụ cờ bịt mắt trong quá khứ: ván đầu tiên được ghi lại ở Florence thế kỷ 13 và Najdorf chơi 45 ván cùng lúc năm 1947 = earlier examples of blindfold chess → D'),
      28: E('Vị trí: Đoạn E',
        'Trích: “Not only must the positions of each piece on every board be memorised, they must be recalled faithfully when needed, updated with each player’s moves, and then reliably stored again, so the brain can move on to the next board.”',
        'Phân tích: Đoạn E mô tả người chơi phải làm gì: ghi nhớ vị trí từng quân trên mọi bàn, nhớ lại khi cần, cập nhật theo từng nước đi rồi lưu lại = an outline of what blindfold chess involves → E'),
      29: E('Vị trí: Đoạn F',
        'Trích: “‘He was not exceptional on any of these standard tests,’ said Rissman. ‘We didn’t find anything other than playing chess that he seems to be supremely gifted at.’”',
        'Phân tích: Các bài kiểm tra trí nhớ thông thường cho kết quả bình thường; ngoài chơi cờ, không thấy Gareyev giỏi vượt trội ở việc gì khác = his skill is limited to chess → F'),
      30: E('Vị trí: Đoạn B',
        'Trích: “But Gareyev’s prowess has drawn interest from beyond the chess-playing community. In the hope of understanding how he and others like him can perform such mental feats, researchers at the University of California in Los Angeles (UCLA) called him in for tests.”',
        'Phân tích: Các nhà khoa học muốn hiểu vì sao anh ấy (và những người như anh) làm được kỳ tích trí óc này, và điều đáng kinh ngạc là số ván anh giữ được cùng lúc = why his skill is of interest to scientists → B'),
      31: E('Vị trí: Đoạn H',
        'Trích: “‘I don’t worry too much about the winning percentage, that’s never been an issue for me,’ he said. ‘The most important part of blindfold chess for me is that I have found the one thing that I can fully dedicate myself to.’”',
        'Phân tích: Gareyev nói điều gì không quan trọng với anh (tỉ lệ thắng) và điều gì quan trọng nhất (tìm được một việc để dồn hết tâm sức) = an outline of his priorities → H'),
      32: E('Vị trí: Đoạn E',
        'Trích: “But the ends of games are taxing too, as exhaustion sets in. When Gareyev is tired, his recall can get patchy.”',
        'Phân tích: Cuối ván rất mệt (“taxing … as exhaustion sets in”), khi mệt trí nhớ chập chờn = a reason why the last part of a game may be difficult → E'),
      33: E('Vị trí: Đoạn A',
        'Trích: “While his challengers will play the games as normal, Gareyev himself will be blindfolded.”',
        'Phân tích: Chỉ Gareyev bịt mắt, các đối thủ chơi bình thường → câu “all the participants will be blindfolded” trái với bài → FALSE'),
      34: E('Vị trí: Đoạn A',
        'Trích: “He has a fondness for bright clothes and unusual hairstyles, and he gets his kicks from the adventure sport of BASE jumping.”',
        'Phân tích: Bài chỉ nói anh thích môn nhảy BASE, không nói anh từng thắng giải BASE jumping nào → NOT GIVEN'),
      35: E('Vị trí: Đoạn B',
        'Trích: “In the hope of understanding how he and others like him can perform such mental feats, researchers at the University of California in Los Angeles (UCLA) called him in for tests.”',
        'Phân tích: Bài nói UCLA mời anh đến làm xét nghiệm, nhưng không nói UCLA là trường đầu tiên nghiên cứu người chơi cờ bịt mắt → NOT GIVEN'),
      36: E('Vị trí: Đoạn B, E',
        'Trích: “‘The ability to play a game of chess with your eyes closed is not a far reach for most accomplished player,’” … “‘A lot of players are capable of doing what I’m doing.’”',
        'Phân tích: Với phần lớn người chơi giỏi, chơi cờ nhắm mắt “không quá xa tầm với”; Gareyev cũng nói nhiều người làm được = good chess players are likely to be able to play blindfold chess → TRUE'),
      37: E('Dịch: Các nhà nghiên cứu bắt đầu bằng việc kiểm tra ______ của Gareyev.',
        'Vị trí: Đoạn F',
        'Trích: “The scientists first had Gareyev perform some standard memory tests.”',
        'Phân tích: “first had Gareyev perform some standard memory tests” = started by testing Gareyev’s memory → memory'),
      38: E('Dịch: … ví dụ anh phải nhắc lại một dãy ______ theo thứ tự và theo thứ tự ngược lại.',
        'Vị trí: Đoạn F',
        'Trích: “One classic test measures how many numbers a person can repeat, both forwards and backwards, soon after hearing them.”',
        'Phân tích: “repeat, both forwards and backwards” = recall … in order and also in reverse order → numbers'),
      39: E('Dịch: … các lần chụp não cho thấy mức ______ bất thường bên trong các vùng não của Gareyev phụ trách việc điều phối sự chú ý.',
        'Vị trí: Đoạn F',
        'Trích: “the scans found much greater than average communication between parts of Gareyev’s brain that make up what is called the frontoparietal control network.” … “It helps you to allocate attention”',
        'Phân tích: “much greater than average communication” = an unusual amount of communication; mạng này giúp “allocate attention” = directing attention → communication'),
      40: E('Dịch: … các phần não của anh xử lý đầu vào ______ có thể mạnh bất thường.',
        'Vị trí: Đoạn G',
        'Trích: “Initial results suggest that the areas of his brain that process visual images – such as chess boards – may have stronger links to other brain regions, and so be more powerful than normal.”',
        'Phân tích: “process visual images” = deal with visual input; “more powerful than normal” = unusual strength → visual'),
    },
  },

  // ════════ WRONG KEYS (checked against the Cambridge answer keys + the passage) ════════

  // The future of work = Cambridge 16 Test 1 P3. Keys 31–34 were Pressure / Information / Satisfaction / Promotion with
  // invented quotes; official key G E C F.
  '6a2a7e43e802f36848dfbc0d': {
    title: 'The future of work',
    keys: { 31: ['Pressure', 'information'], 32: ['Information', 'reliance'], 33: ['Satisfaction', 'intuition'], 34: ['Promotion', 'confidence'] },
    expl: {
      31: E('Dịch: Stella Pachidi tập trung vào việc “thuật toán hoá” những công việc không dựa vào sản xuất mà dựa vào ______.',
        'Vị trí: Đoạn 2',
        'Trích: “Dr Stella Pachidi from Cambridge Judge Business School believes that some of the most fundamental changes are happening as a result of the ‘algorithmication’ of jobs that are dependent on data rather than on production – the so-called knowledge economy.”',
        'Phân tích: “dependent on data rather than on production” = rely not on production but on information (data) → G information'),
      32: E('Dịch: Khi theo dõi một công ty viễn thông, Pachidi nhận thấy sự ______ ngày càng tăng vào các đề xuất của AI, khi nhân viên bắt đầu học qua “con mắt của thuật toán”.',
        'Vị trí: Đoạn 6',
        'Trích: “In cases like this, Pachidi believes, a short-sighted view begins to creep into working practices whereby workers learn through the ‘algorithm’s eyes’ and become dependent on its instructions.”',
        'Phân tích: “become dependent on its instructions” = a growing reliance on the recommendations made by AI → E reliance'),
      33: E('Dịch: Trong khi đó, nhân viên không được khuyến khích thử nghiệm và dùng ______ của chính mình, nên không thể đổi mới.',
        'Vị trí: Đoạn 6',
        'Trích: “Alternative explorations – where experimentation and human instinct lead to progress and new ideas – are effectively discouraged.”',
        'Phân tích: “experimentation and human instinct … are effectively discouraged” = staff are deterred from experimenting and using their own intuition (instinct) → C intuition'),
      34: E('Dịch: Các nhà nghiên cứu đang cố làm cho quá trình ra quyết định của AI dễ hiểu hơn và tăng ______ của người dùng đối với công nghệ.',
        'Vị trí: Đoạn 8',
        'Trích: “Their objective is to make AI technologies more trustworthy and transparent, so that organisations and individuals understand how AI decisions are made.”',
        'Phân tích: “transparent … understand how AI decisions are made” = easier to comprehend; “more trustworthy” = increase users’ confidence in the technology → F confidence'),
    },
    quote: {
      28: '“Dr Stella Pachidi from Cambridge Judge Business School believes that some of the most fundamental changes are happening as a result of the ‘algorithmication’ of jobs that are dependent on data rather than on production – the so-called knowledge economy.”',
      30: '“He adds: ‘If there is going to be change to jobs as a result of AI and robotics then I’d like to see governments seizing the opportunity to improve policy to enforce good job security.”',
    },
  },

  // Robots and us = Cambridge 20 Test 3 P3. "Moral questions then arise…" is said by Martin Rees → A (was C, Richardson).
  '69d5f344f791987efd483ff7': {
    title: 'Robots and us',
    keys: { 30: ['C', 'A'] },
    expl: {
      30: E('Vị trí: Đoạn 4 (câu trả lời của Rees cho câu hỏi thứ hai)',
        'Trích: “Later this century, however, their more advanced successors may relate to their surroundings, and to people, as adeptly as we do. Moral questions then arise. … Should we feel guilty about exploiting [sophisticated robots]? Should we fret if they are underemployed, frustrated, or bored?”',
        'Phân tích: Đây là lời của Martin Rees. “Should we feel guilty about exploiting” robot = có nên xem lại việc ta đối xử với robot có công bằng không (treating robots fairly) → A'),
    },
  },

  // Building the Skyline = Cambridge 17 Test 2 P3. Q40 held Q39's key; "the dangers involved" = F associated risks.
  '6a2d9ee6759f3f7b6e64c812': {
    title: "Building the Skyline: The Birth and Growth of Manhattan's Skyscrapers",
    keys: { 40: ['deep excavations', 'associated risks'] },
    summaryText: [['discusses their 4 __Q40__', 'discusses their __Q40__']],
    bankWords: [['great distanc', 'great distances']],
    expl: {
      40: E('Dịch: … ông không chỉ mô tả cách caisson giúp đào sâu được, mà còn bàn về ______ của chúng.',
        'Vị trí: Đoạn bàn về chương 7',
        'Trích: “Barr’s thorough technological history discusses not only how caissons work, but also the dangers involved.”',
        'Phân tích: “not only how caissons work, but also the dangers involved” = discusses not only … but also their associated risks → F associated risks'),
    },
    quote: {
      31: '“The data work that went into these estimations is particularly impressive.”',
      35: '“Most of these enclaves were located on the least valuable land, between the industries located on the waterfront and the wealthy neighborhoods bordering Central Park.”',
    },
  },

  // TRUE/FALSE stored for YES/NO/NOT GIVEN sets (Cambridge: "agree with the claims of the writer")
  '69c93f366bc7856a765d232c': {
    title: 'How stress affects our judgement',
    yesNo: [36, 37, 38, 39, 40],
    quote: { 37: '“Repeatedly checking your phone, according to a survey conducted by the American Psychological Association, is related to stress.”' },
  },
  '6a291b6a85253ef89ef3d841': {
    title: 'Having a laugh',
    yesNo: [37, 38, 39, 40],
    expl: {
      36: E('Dịch: … hài hước không chỉ giảm ______ (Q35) và giúp xây dựng quan hệ xã hội mà còn có thể có tác dụng ______ lên cơ thể và tâm trí.',
        'Vị trí: Đoạn I',
        'Trích: “‘We suggest that humour is not only enjoyable but more importantly, energising.’”',
        'Phân tích: “energising” (tiếp thêm năng lượng) = a stimulating effect on the body and mind → E stimulating'),
    },
  },
  '6a2b05ba18f3aea4f062d91e': { title: 'Changes in reading habits', yesNo: [23, 24, 25, 26] },

  // Alternatives the official key also accepts
  '6a29084485253ef89ef3c6e3': { title: 'What is exploration?', keys: { 40: ['land surface', 'land surface / surface'] } },

  // ════════ WRONG / COPIED EXPLANATIONS ════════
  '6a29126885253ef89ef3d1e4': {
    title: 'Should we try to bring extinct species back to life?',
    expl: { 16: [['\n\nCâu 17: Đáp án A', ''], ['ecosystem – habitat.', 'ecosystem – habitat → D']] },
  },
  '6a29376198f4b844e921266c': {
    title: 'Why fairy tales are really scary tales',
    expl: {
      39: E('Vị trí: Đoạn I',
        'Trích: “He believes the perennial theme of women as victims in stories like Little Red Riding Hood explains why they continue to feel relevant. But Tehrani points out that although this is often the case in Western versions, it is not always true elsewhere. In Chinese and Japanese versions, often known as The Tiger Grandmother, the villain is a woman, and in both Iran and Nigeria, the victim is a boy.”',
        'Phân tích: Zipes cho rằng chủ đề “phụ nữ là nạn nhân” giải thích vì sao truyện còn sống mãi. Tehrani dẫn bản Trung Quốc và Nhật Bản (kẻ ác là phụ nữ) để chỉ ra điều đó không đúng ở mọi nơi = to indicate that Jack Zipes’ theory is incorrect → A'),
    },
  },
  '6a5528ea7451993d82bd0e91': {
    title: 'Why should we study history?',
    expl: {
      1: E('Vị trí: Đoạn 2',
        'Trích: “According to some of the greatest historians, such as Arnold Toynbee, the essential value of history is its ability to give us self-awareness, self-knowledge.” … “Studying Alexander the Great, for instance, teaches us that a single person is capable of the whole range of behaviour from cruelty to kindness.”',
        'Phân tích: Theo Toynbee, lịch sử cho ta “self-awareness, self-knowledge”; nghiên cứu nhân vật lịch sử cho thấy con người có đủ mọi kiểu hành vi = It helps us to understand human nature → B'),
    },
  },
  '6a5522af7451993d82bd046e': {
    title: 'Whale Culture',
    expl: Object.fromEntries([35, 36, 37].map(n => [n, [['Dưới đây là phần giải thích đã được lược bỏ hoàn toàn các ký hiệu dấu mũi tên để bạn copy không bị lỗi:\n\n', ''], ['Dưới đây là phần giải thích đã được lược bỏ hoàn toàn các ký hiệu dấu mũi tên để bạn copy không bị lỗi:\n', '']]])),
  },
  '69fb5e378ad4568889c8a679': {
    title: 'The Clipper Races: an era of competition between cargo ships',
    groups: [{ q: 13, replace: { instruction: [['ONE WORD ONL Y', 'ONE WORD ONLY']] } }],
    expl: {
      13: E('Vị trí: Đoạn cuối',
        'Trích: “The cargo of the winning ship could earn a premium of up to sixpence per pound-and so the captain and crew were rewarded by the owners of the cargo. But the races were about more than just money the crews, about 40 men on each clipper, were expert sailors, proud of their ships, and they delighted in competing against each other.”',
        'Phân tích: Thủy thủ được thưởng (tiền) và còn thích thú cạnh tranh = motivated by both money and their enthusiasm for the competition → money'),
    },
  },
  '6a6f23c9d5e1b371f4752b31': {
    title: 'Should space be explored by robots or by humans?',
    expl: {
      22: E('Vị trí: Đoạn E',
        'Trích: “This would involve sending a number of robotic research stations to Mars, equipped with permanent communications and navigational systems. They would perform research, and establish the infrastructure needed to prepare future landing sites for the exploration of Mars by humans.”',
        'Phân tích: Robot “establish the infrastructure” và “perform research” trước khi con người đến = robots could be used to set up infrastructure and do initial research → infrastructure'),
    },
  },

  // ════════ QUOTES THAT WERE NOT VERBATIM (replaced by the passage sentence) ════════
  '69cb0a89041aa0b176019f34': { title: 'Procrastination', quote: { 21: '“Another group of people who tend to procrastinate are perfectionists, who worry their work will be judged harshly by others.”' } },
  '69e595e90186a5bd25a20513': { title: 'Georgia O’Keeffe', quote: { 12: '“While both locales provided a wealth of imagery for her paintings, one feature of the Abiquiú house – the large walled patio with its black door – was particularly inspirational. In more than thirty pictures between 1946 and 1960, she reinvented the patio into an abstract arrangement of geometric shapes.”' } },
  '69e598990186a5bd25a206ed': { title: 'Adapting to the effects of climate change', quote: { 16: '“It’s much cheaper than permanently elevating houses, English explains – about a third of what it would cost to completely replace a building’s foundations.”' } },
  '69e59aec0186a5bd25a208a0': { title: 'A new role for livestock guard dogs', quote: { 40: '“For example, their presence has been found to protect birds which build their nests on the ground in fields, where foxes would normally raid them.”' } },
  // passage typos vs the Cambridge text (the explanations quote the original)
  '6a28dd7943e81aceaa2b5899': { title: 'Nutmeg – a valuable spice', content: [['encased in a flesh husk', 'encased in a fleshy husk']] },
  '6a28fb4785253ef89ef3bc69': {
    title: 'Could urban engineers learn from dance ?',
    content: [['staggered access points divide the crossing', 'staggered access points to divide the crossing']],
    quote: { 7: '“The guard rails that will be familiar to anyone who has attempted to cross a British road, for example, were an engineering solution to pedestrian safety based on models that prioritise the smooth flow of traffic.”' },
  },
  '6a29032085253ef89ef3bfe1': { title: 'Driverless cars', content: [['average annual mileage double as a result', 'average annual mileage would double as a result']] },
  '6a2b16b518f3aea4f062f4df': {
    title: 'To catch a king',
    content: [['did a deal with Scots', 'did a deal with the Scots']],
    expl: Object.assign(Object.fromEntries([27, 28, 36].map(n => [n, [[/Charles Il\b/g, 'Charles II']]])),
      { 40: [['complexity of his character.Phân tích:', 'complexity of his character.\n\nPhân tích:']] }),
  },
  '6a2dab0d759f3f7b6e64df97': {
    title: 'Does education fuel economic growth?',
    content: [['counter to the guide ordinance', 'counter to the guild ordinance']],
    quote: {
      14: '“This involves following the lives of different people with the same level of wealth over a period of time. If wealth is constant, it is possible to discover whether education was, for example, linked to the cultivation of new crops, or to the adoption of industrial innovations like sewing machines.”',
      17: '“‘German-speaking central Europe is an excellent laboratory for testing theories of economic growth,’ she explains.”',
      19: '“‘We can follow the same people – and their descendants – across 300 years of educational and economic change,’ she says.”',
      22: '“The dominance of guilds not only prevented people from using their skills, but also held back even the simplest industrial innovation.”',
    },
  },
  '6a29225885253ef89ef3df93': {
    title: 'Henry Moore (1898-1986)',
    quote: {
      1: '“After leaving school, Moore hoped to become a sculptor, but instead, he complied with his father’s wish that he train as a schoolteacher.”',
      2: '“After the war, Moore enrolled at the Leeds School of Art, where he studied for two years. In his first year, he spent most of his time drawing. Although he wanted to study sculpture, no teacher was appointed until his second year.”',
      3: '“At the end of that year, he passed the sculpture examination and was awarded a scholarship to the Royal College of Art in London.”',
      4: '“Alongside the instruction he received at the Royal College, Moore visited many of the London museums, particularly the British Museum, which had a wide-ranging collection of ancient sculpture. During these visits, he discovered the power and beauty of ancient Egyptian and African sculpture.”',
      5: '“When he visited the Trocadero Museum in Paris, he was impressed by a cast of a Mayan* sculpture of the rain spirit.”',
      6: '“Moore became fascinated with this stone sculpture, which he thought had power and originality that no other stone sculpture possessed.”',
      7: '“In 1933, he became a member of a group of young artists called Unit One. The aim of the group was to convince the English public of the merits of the emerging international movement in modern art and architecture.”',
    },
  },
  '6a2a6d10e802f36848df9588': { title: 'Environmental practices of big businesses', quote: { 34: '“However, when a major fast-food company then made the same demands after customer purchases of its hamburgers plummeted, the meat industry complied within weeks.”' } },
  '6a2a71bae802f36848dfa1d3': {
    title: 'Why we need to protect polar bears',
    quote: { 3: '“A 2014 study by Shi Ping Liu and colleagues sheds light on this mystery. They compared the genetic structure of polar bears with that of their closest relatives from a warmer climate, the brown bears.”' },
  },
  '6a2a76ace802f36848dfa675': {
    title: 'The Step Pyramid of Djoser (Cambridge 16)',
    quote: {
      17: '“The complex in which it was built was the size of a city in ancient Egypt and included a temple, courtyards, shrines, and living quarters for the priests.” … “The wall had 13 false doors cut into it with only one true entrance cut into the south-east corner; the entire wall was then ringed by a trench 750 meters long and 40 meters wide.”',
      18: '“The burial chamber of the tomb, where the king’s body was laid to rest, was dug beneath the base of the pyramid, surrounded by a vast maze of long tunnels that had rooms off them to discourage robbers. One of the most mysterious discoveries found inside the pyramid was a large number of stone vessels.”',
    },
    expl: { 17: [['→ Đáp án V', '→ v']], 18: [['→ Đáp án I', '→ i']] },
  },
  '6a2ae80118f3aea4f062aa75': { title: 'Roman shipbuilding and navigation', quote: { 11: '“In order to assist them, music would be played on an instrument, and oars would then keep time with this.”' } },
  '6a2af25318f3aea4f062bf5a': {
    title: 'Climate change reveals ancient artefacts in Norway’s glaciers',
    quote: Object.fromEntries([21, 22].map(n => [n, '“Reindeer once congregated on these ice patches in the later summer months to escape biting insects, and from the late Stone Age**, hunters followed.”'])),
  },
  '6a2afef918f3aea4f062d121': { title: 'Roman tunnels', quote: { 11: '“Traces of such tunnels used to mine gold can still be found at the Dolaucothi mines in Wales.”' } },
  '6a2b113418f3aea4f062ed0e': {
    title: 'Stadiums: past, present and future',
    quote: {
      18: '“Built by the Romans in 90 AD, it became a fortress with four towers after the fifth century, and was then transformed into a village containing more than 200 houses.”',
      19: '“With the growing interest in conservation during the 19th century, it was converted back into an arena for the staging of bullfights, thereby returning the structure to its original use as a venue for public spectacles.”',
      20: '“It has endured the centuries and is currently considered one of the world’s prime sites for opera, thanks to its outstanding acoustics.”',
      21: '“The site evolved in a similar way to Arles and was progressively filled with buildings from the Middle Ages until the 19th century, variously used as houses, a salt depot and a prison.”',
      22: '“Today, the ruins of the amphitheatre remain embedded in the various shops and residences surrounding the public square.”',
    },
  },
  '6a2d9082759f3f7b6e649aad': {
    title: 'A second attempt at domesticating the tomato',
    quote: { 21: '“But Kudla didn’t want to reveal which species were in his team’s sights, because CRISPR has made the process so easy. ‘Any one with the right skills could go to their lab and do this.’”' },
  },
  '6a2d94e9759f3f7b6e64abc6': {
    title: 'Insight or evolution?',
    quote: {
      33: '“The Law of Effect was advanced by psychologist Edward Thorndike in 1898, some 40 years after Charles Darwin published his groundbreaking work on biological evolution, On the Origin of Species.”',
      36: '“The time seems right for abandoning the naïve notion of intelligent design and genius, and for scientifically exploring the true origins of creative behavior.”',
      39: '“Plenty of other stories show that fresh advances can arise from error, misadventure, and also pure serendipity – a happy accident.”',
    },
  },
  '6a2d9bae759f3f7b6e64b481': {
    title: 'Palm oil',
    quote: {
      14: '“Oil palm plantations produce at least four and potentially up to ten times more oil per hectare than soybean, rapeseed, sunflower or other competing oils.” … “But if it\'s replacing rice, for example, it might actually sequester more carbon.\'”',
      15: '“The industry is now regulated by a group called the Roundtable on Sustainable Palm Oil (RSPO), consisting of palm growers, retailers, product manufacturers, and other interested parties.” … “The RSPO insists upon no virgin forest clearing, transparency and regular assessment of carbon stocks, among other criteria.”',
      16: '“It\'s almost certainly in the soap we wash with in the morning, the sandwich we have for lunch, and the biscuits we snack on during the day.”',
      17: '“Ellwood believes that reintroducing the bird\'s nest fern into oil palm plantations could potentially allow these areas to recover their biodiversity, providing a home for all manner of species, from fungi and bacteria, to invertebrates such as insects, amphibians, reptiles and even mammals.”',
      18: '“Between 1990 and 2012, the global land area devoted to growing oil palm trees grew from 6 to 17 million hectares, now accounting for around ten percent of total cropland in the entire world. From a mere two million tonnes of palm oil being produced annually globally 50 years ago, there are now around 60 million tonnes produced every single year”',
      19: '“One response to the boycott movement has been the argument for the vital role palm oil plays in lifting many millions of people in the developing world out of poverty.”',
    },
  },
  '6a2da374759f3f7b6e64ce4a': {
    title: 'Bats to the rescue',
    quote: { 5: '“They include the Malagasy mouse-eared bat, Major’s long-fingered bat, the Malagasy white-bellied free-tailed bat and Peters’ wrinkle-lipped bat.”' },
    expl: { 5: [['Phân tích: Không đủ dữ kiện để xác định → NOT GIVEN.', 'Phân tích: Bài chỉ liệt kê dơi tai chuột Malagasy cùng các loài khác, không so sánh loài nào phổ biến hơn → NOT GIVEN']] },
  },
  '6a54d90a7451993d82bc7544': {
    title: 'Sweet Trouble',
    quote: {
      7: '“As chairman of the board of the mill, Bill has presided over tough and unpopular decisions but the hardest was slashing the mill workforce.”',
      9: '“In early 2004, sugar prices plummeted, resulting in a 25-year-low average of around $232 a tonne. Although figures vary widely across farms and regions, that was about what it cost to grow a tonne of sugar in Australia.”',
    },
  },
  '6a55cdcfd2439c8edfc64fb2': { title: 'The economic effect of climate', quote: { 24: '“This easy movement along similar latitudes in Eurasia would also have meant a faster dissemination of other technologies, such as the wheel and writing, Diamond speculates.”' } },
  '6a55cfe9d2439c8edfc656b9': {
    title: 'A closer examination of a study on verbal and non-verbal messages',
    quote: {
      31: '“The first is that the entire study involved only 62 subjects.”',
      35: '“In the real world, people communicate in a particular context and speak in phrases and full-blown sentences, making extensive use of the multifaceted vehicle of language.”',
      40: '“To be fair, many textbook writers attempt to be faithful to the context of Mehrabian\'s research.” … “Others try to play down the specific percentages, saying that an understanding of the general importance of non-verbal cues is more important.”',
    },
  },
  '6a6b93fa933d34eeed802985': { title: 'The Davies Sisters', quote: { 11: '“The paintings were shipped directly to Bath, England, where they became the first works by Cézanne to go on display in a public gallery in Britain.”' } },

  // ════════ TITLE ════════
  '69cb032aa2cb4990b5aa9bbc': { title: 'Manatees(kon bòa bỉn á)', rename: 'Manatees' },
};
