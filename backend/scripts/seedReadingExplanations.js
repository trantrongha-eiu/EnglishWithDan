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
  // ── Cam 21 - Test 2 ──────────────────────────────────────────────────
  {
    title: 'Do animals dream?',
    category: 'passage1',
    explanations: {
      1: `Vị trí: Đoạn 2.

Trích dẫn: "researchers compared the brain patterns of rats running through a maze when awake with their brain patterns during REM sleep. They found the patterns were very similar and concluded that the sleeping rats were dreaming about going through the maze."

Phân tích: Đoạn 2 nói về loài chuột (rats) — bằng chứng "brain patterns giống nhau khi thức và khi ngủ" khớp đúng với dòng "similar brain patterns were observed when active and sleeping" trong bảng.`,

      2: `Vị trí: Đoạn 3.

Trích dẫn: "the recordings revealed both REM and non-REM sleep... REM sleep activity was high in brain regions involved in processing visual information, especially images related to physical activities such as flying"

Phân tích: Vùng não hoạt động mạnh khi chim bồ câu ngủ REM là vùng xử lý thông tin thị giác → "visual".`,

      3: `Vị trí: Đoạn 4.

Trích dẫn: "whales and dolphins, which do not shut down their entire brain when they sleep, but only half of it, keeping the rest awake."

Phân tích: Cá voi và cá heo chỉ để một nửa (half) bộ não nghỉ khi ngủ, nửa còn lại vẫn thức.`,

      4: `Vị trí: Đoạn 4.

Trích dẫn: "It's thought that they don't experience REM sleep because during REM sleep animals are more vulnerable to extremes of temperature."

Phân tích: Trong giấc ngủ REM, động vật dễ bị ảnh hưởng bởi nhiệt độ (temperature) khắc nghiệt hơn, nên cá voi/cá heo được cho là tránh giai đoạn này.`,

      5: `Vị trí: Đoạn 4.

Trích dẫn: "They also show no sign of REM sleep, suggesting that they may only experience non-REM dreams, which are less vivid."

Phân tích: Giấc mơ non-REM của cá voi/cá heo được mô tả là "less vivid" (kém sống động) — khớp với "not very vivid" trong bảng.`,

      6: `Vị trí: Đoạn 5.

Trích dẫn: "It is believed that when events are replayed in dreams, this helps to integrate memories into longer-term storage."

Phân tích: Đúng như câu hỏi paraphrase — việc "phát lại" sự kiện trong giấc mơ giúp hình thành trí nhớ dài hạn. → TRUE`,

      7: `Vị trí: Đoạn 6.

Trích dẫn: "We are quick to interpret the twitching limbs and quiet barks of sleeping dogs, but the truth is that we don't know if there is an internal experience of chasing rabbits that comes along with that."

Phân tích: Bài khẳng định con người KHÔNG THỂ biết chắc trải nghiệm/nội dung giấc mơ của chó, trái ngược với ý "có thể biết được loại giấc mơ" trong câu hỏi. → FALSE`,

      8: `Vị trí: Đoạn 7 (và toàn bài không có đoạn nào khác nhắc lại).

Trích dẫn: "In 2019, while making a documentary, David Scheel of Alaska Pacific University in the USA housed an octopus named Heidi in a tank in his living room."

Phân tích: Bài chỉ kể lại việc Scheel làm phim tài liệu và quan sát Heidi, không hề đề cập việc bộ phim này có ảnh hưởng đến các nghiên cứu khác về giấc ngủ của bạch tuộc hay không. → NOT GIVEN`,

      9: `Vị trí: Đoạn 8.

Trích dẫn: "Costello, as the octopus was called, thrashed around, extended his mantle as if trying to make himself look bigger, and squirted ink as though he were being attacked by a predator."

Phân tích: Hành vi của Costello cho thấy nó phản ứng NHƯ ĐANG BỊ TẤN CÔNG (phòng thủ trước kẻ săn mồi), chứ không phải như đang đi săn mồi. → FALSE`,

      10: `Vị trí: Đoạn 8.

Trích dẫn: "The nightmare study is intriguing, says Scheel, but is only based on one animal. He argues that as well as outward behaviour, brain imaging is needed to show that the octopuses are replaying sequences of activities from their waking lives in dreams."

Phân tích: Scheel cho rằng nghiên cứu hiện tại mới chỉ dựa trên một cá thể và cần thêm bằng chứng (chụp ảnh não) — thể hiện quan điểm cần nghiên cứu sâu hơn. → TRUE`,

      11: `Vị trí: Đoạn 9.

Trích dẫn: "The trouble is that we will never be able to experience any animal's dreams. That goes for other humans' dreams too."

Phân tích: Bài khẳng định con người "sẽ không bao giờ" trải nghiệm được giấc mơ của người khác, trái ngược hoàn toàn với ý "sắp có thể chia sẻ giấc mơ" trong câu hỏi. → FALSE`,

      12: `Vị trí: Đoạn 9.

Trích dẫn: "vision is the dominant sense for many humans, and so our dreams are heavily visual too. Dogs primarily navigate the world using smell while spiders rely much more on vibrations."

Phân tích: Đoạn 9 chỉ nhắc đến thị giác (người), khứu giác (chó) và rung động (nhện) là giác quan chủ đạo, hoàn toàn không đề cập đến thính giác (hearing) ở bất kỳ loài nào. → NOT GIVEN`,

      13: `Vị trí: Toàn bài không đề cập.

Phân tích: Bài không có bất kỳ thông tin nào về việc mối quan tâm/nghiên cứu lý do con người mơ đã tăng lên trong thời gian gần đây. → NOT GIVEN`,
    },
  },
  {
    title: 'Mapungubwe',
    category: 'passage2',
    explanations: {
      14: `Vị trí: Đoạn E.

Trích dẫn: "The figures may have been used in ceremonies as offerings to ancestors, but their precise function is not known."

Phân tích: Cụm "but their precise function is not known" thể hiện rõ sự KHÔNG CHẮC CHẮN về mục đích sử dụng thật sự của các đồ vật (figures) này. → E`,

      15: `Vị trí: Đoạn G.

Trích dẫn: "The kingdom of Mapungubwe was already in decline by the late 13th century, probably because overpopulation placed too much stress on local resources, a situation that may have been brought to a crisis point by a series of droughts."

Phân tích: Hạn hán (droughts) — một yếu tố khí hậu — được cho là đã làm trầm trọng thêm các vấn đề mà Mapungubwe gặp phải. → G`,

      16: `Vị trí: Đoạn C.

Trích dẫn: "There were some grander residences dotted around the outskirts of Babandyanalo, and these probably belonged to male relatives of the king."

Phân tích: Đoạn C nêu rõ nơi ở (những dinh thự lớn hơn ở ngoại vi Babandyanalo) được cho là của các thành viên nam trong hoàng tộc. → C`,

      17: `Vị trí: Đoạn D.

Trích dẫn: "The presence of glass beads, almost certainly from India, indicate there was trade of some sort with other states on the coast who, in turn, traded with merchants travelling from India by sea."

Phân tích: "merchants travelling... by sea" chính là những thương nhân mang hàng hoá đến bằng đường biển. → D`,

      18: `Vị trí: Đoạn B.

Trích dẫn: "The total population of Mapungubwe at its peak in the mid-13th century was around 5,000 people."

Phân tích: Đây là con số ước tính cụ thể (khoảng 5.000 người) về quy mô mà cộng đồng Mapungubwe đã phát triển tới. → B`,

      19: `Vị trí: Đoạn A.

Trích dẫn: "cattle herding and other types of farming brought plenty of food and a surplus that could be traded for needed goods."

Phân tích: Sản phẩm nông nghiệp dư thừa (surplus từ chăn nuôi/trồng trọt) được đem trao đổi lấy hàng hoá khác. → A`,

      20: `Vị trí: Đoạn F.

Trích dẫn: "These objects were all found at the royal burial site and date to c. 1150."

Phân tích: Các đồ vật bằng vàng được tìm thấy ngay tại khu lăng mộ hoàng gia (royal burial site) → khớp phương án B "Items of gold were placed close to where Mapungubwe kings were buried."`,

      21: `Vị trí: Đoạn F.

Trích dẫn: "A type of decoration, found nowhere else except Great Zimbabwe, involved the crafting of gold into small rectangular sheets and carving geometrical patterns into it."

Phân tích: Kiểu trang trí vàng này của Mapungubwe chỉ xuất hiện thêm ở một vương quốc khác là Great Zimbabwe → khớp phương án D "The way gold was decorated in Mapungubwe was also practised in another kingdom." (A sai vì đoạn F nói vàng chưa từng được dùng như tiền tệ; C, E không được đề cập.)`,

      22: `Vị trí: Đoạn E.

Trích dẫn: "Archaeological discoveries reveal that pottery was produced on a scale large enough to suggest the presence of professional potters, and is another indicator of the prosperity of Mapungubwe society."

Phân tích: Đây chính là từ mô tả điều mà số lượng gốm sứ được sản xuất chuyên nghiệp thể hiện. → "prosperity"`,

      23: `Vị trí: Đoạn E.

Trích dẫn: "There are also ceramic discs, and whistles."

Phân tích: Sau "ceramic discs" (đĩa gốm tròn), vật được liệt kê tiếp theo là "whistles" (còi) — đúng thứ tự trong bài.`,

      24: `Vị trí: Đoạn E.

Trích dẫn: "small figures of highly stylised humans with elongated bodies and short limbs have been found."

Phân tích: "elongated" (kéo dài) trong bài được paraphrase thành "stretched" trong tóm tắt, cùng bổ nghĩa cho "bodies".`,

      25: `Vị trí: Đoạn E.

Trích dẫn: "The figures may have been used in ceremonies as offerings to ancestors"

Phân tích: Các nghi lễ được cho là để dâng lễ vật tôn vinh tổ tiên (ancestors).`,

      26: `Vị trí: Đoạn E.

Trích dẫn: "Other discoveries include small jewellery items made from locally sourced copper."

Phân tích: Đồ trang sức (jewellery) được làm từ đồng — kim loại khai thác tại địa phương.`,
    },
  },
  {
    title: 'Artificial Intelligence',
    category: 'passage3',
    explanations: {
      27: `Vị trí: Đoạn 1.

Trích dẫn: "hysteria about the future of artificial intelligence (AI) is everywhere... Just looking at the media headlines, you might think that we are already living in a future where AI has infiltrated every aspect of society."

Phân tích: Đoạn 1 mô tả cách công chúng/truyền thông nhìn nhận AI (sự cuồng nhiệt, tin tức giật gân), chứ không phải dự đoán riêng của tác giả. → B "describing a public perception of AI"`,

      28: `Vị trí: Đoạn 2.

Trích dẫn: "this mindset actually jeopardises the value of machine intelligence by disregarding important AI safety principles and setting unrealistic expectations about what AI can really do for humanity."

Phân tích: Tác giả chỉ ra một rủi ro cụ thể của tư duy "AI solutionism". → A "points out a risk involved."`,

      29: `Vị trí: Đoạn 4.

Trích dẫn: "While many politicians proclaim the transformative effects of the coming 'AI revolution', they fail to realise the complexity around deploying advanced machine learning systems in the real world."

Phân tích: Các chính trị gia không nhận thức được sự phức tạp khi triển khai AI trong thực tế. → C "be unaware of the challenges of implementing national AI initiatives."`,

      30: `Vị trí: Đoạn 5.

Trích dẫn: "adding a neural network to a system of government does not mean it will be instantaneously more inclusive or fair."

Phân tích: Bài phủ định niềm tin sai lầm rằng chỉ cần thêm neural network là hệ thống sẽ công bằng/bình đẳng hơn ("fair"/"inclusive") → từ cần điền là "equality".`,

      31: `Vị trí: Đoạn 6.

Trích dẫn: "the public sector typically does not have the appropriate data infrastructure to support advanced machine learning."

Phân tích: "data infrastructure" trong bài được paraphrase thành "framework" trong bài tóm tắt.`,

      32: `Vị trí: Đoạn 6.

Trích dẫn: "data is spread across different government departments that each require special permissions to be accessed."

Phân tích: "special permissions" (sự cho phép đặc biệt) được paraphrase thành "approval".`,

      33: `Vị trí: Đoạn 6.

Trích dẫn: "the public sector typically lacks the human talent with the right technological capabilities to fully reap the benefits of machine intelligence."

Phân tích: "technological capabilities" trong bài được paraphrase thành "skills" trong bài tóm tắt.`,

      34: `Vị trí: Đoạn 11.

Trích dẫn: "Even though it was developed to deliver the best recommendations, human experts found it hard to trust the machine."

Phân tích: Việc chuyên gia khó "trust" (tin tưởng) chương trình AI liên quan trực tiếp đến "reliability" (độ tin cậy) của nó.`,

      35: `Vị trí: Đoạn 12.

Trích dẫn: "The system was found to amplify structural racial discrimination and was later abandoned."

Phân tích: "racial discrimination" (sự phân biệt chủng tộc) trong bài được paraphrase thành "prejudices" (định kiến) trong bài tóm tắt.`,

      36: `Vị trí: Đoạn 7.

Trích dẫn: "Stuart Russell, a professor of computer science at the University of California, Berkeley, has long advocated a more sensible and realistic approach that focuses on simple everyday applications of AI instead of the hypothetical takeover by super-intelligent robots."

Phân tích: Đề xuất của Russell được mô tả là "sensible and realistic" (hợp lý, thực tế) — trái ngược với "impractical" (không thực tế) trong câu hỏi. → NO`,

      37: `Vị trí: Đoạn 7.

Trích dẫn: "Similarly, Rodney Brooks, professor of robotics at Massachusetts Institute of Technology, writes that 'almost all innovations in robotics and AI take far, far, longer to be really widely deployed than people in the field and outside the field imagine'."

Phân tích: Bài chỉ trích dẫn quan điểm của Brooks, không hề đề cập việc quan điểm này có bị ai chỉ trích hay không. → NOT GIVEN`,

      38: `Vị trí: Đoạn 8.

Trích dẫn: "Many researchers have warned against the rolling out of AI without appropriate security standards and defence mechanisms. Still, AI security remains an often overlooked topic when machine learning systems are installed."

Phân tích: Bài nói an ninh AI THƯỜNG BỊ BỎ QUA (often overlooked), trái ngược hoàn toàn với ý "luôn được tính đến" (always taken into account) trong câu hỏi. → NO`,

      39: `Vị trí: Đoạn 9.

Trích dẫn: "If we are to reap the benefits and minimise the potential harms of AI, we must start thinking about how machine learning can be meaningfully applied... This means we need to have a discussion about AI ethics and the distrust that many people have towards machine learning."

Phân tích: Đúng như câu hỏi paraphrase — để hưởng lợi và giảm thiểu tác hại của AI, cần thảo luận/khám phá mối lo ngại (distrust) của công chúng. → YES`,

      40: `Vị trí: Toàn bài, đặc biệt đoạn cuối.

Trích dẫn: "These examples demonstrate that there is no AI solution for everything. Using AI simply for the sake of AI may not always be productive or useful, and not every issue is best addressed by applying machine intelligence to it. All solutions come with a cost and not everything that can be automated should be."

Phân tích: Chủ đề xuyên suốt bài là cảnh báo về giới hạn và rủi ro của AI, chứ không phải AI là giải pháp cho mọi vấn đề. → B "Why AI may not be the answer to our problems"`,
    },
  },
  // ── Cam 21 - Test 3 ──────────────────────────────────────────────────
  {
    title: 'Saving the saiga',
    category: 'passage1',
    explanations: {
      1: `Vị trí: Đoạn 2.

Trích dẫn: "The swollen nostrils of the nose serve several purposes: they filter out dust and cool the blood during hot, dry summers, and they warm the cold air before it enters the saiga's lungs in winter."

Phân tích: Lỗ mũi sưng phồng có chức năng lọc bụi (filter out dust) ra khỏi không khí hít vào.`,

      2: `Vị trí: Đoạn 2.

Trích dẫn: "...they filter out dust and cool the blood during hot, dry summers..."

Phân tích: Vào mùa hè, mũi giúp làm mát máu (blood) của saiga.`,

      3: `Vị trí: Đoạn 2.

Trích dẫn: "Other seasonal adaptations include a heavy winter coat that the saiga sheds when the weather warms up."

Phân tích: Saiga mọc một lớp lông dày (coat) vào mùa đông và rụng đi khi thời tiết ấm lên.`,

      4: `Vị trí: Đoạn 4.

Trích dẫn: "Male saiga are a particular target, because their horns are highly prized by traditional medicine practitioners."

Phân tích: Saiga đực bị săn bắt chủ yếu vì sừng (horns) của chúng được giới y học cổ truyền ưa chuộng.`,

      5: `Vị trí: Đoạn 5.

Trích dẫn: "Another threat to the survival of the saiga is loss of habitat, as a result of agricultural expansion and human settlement."

Phân tích: Việc mở rộng nông nghiệp và khu dân cư làm thu hẹp môi trường sống (habitat) của saiga.`,

      6: `Vị trí: Đoạn 5.

Trích dẫn: "Physical barriers such as railways, pipelines and fences can block the seasonal migration routes of this transboundary species."

Phân tích: Các rào chắn vật lý (đường sắt, ống dẫn, hàng rào) chặn các tuyến đường di cư (routes) theo mùa của saiga.`,

      7: `Vị trí: Đoạn 7.

Trích dẫn: "The steppe region has also become increasingly arid in recent years, and many of the smaller streams that the species normally depended on have dried up and vanished."

Phân tích: Biến đổi khí hậu khiến các dòng suối nhỏ (streams) mà saiga phụ thuộc bị khô cạn và biến mất.`,

      8: `Vị trí: Đoạn 1.

Trích dẫn: "Today, the saiga is largely confined to a single country: Kazakhstan. This country is estimated to be home to well over 90% of the global saiga population, with Russia, Mongolia and Uzbekistan accounting for the rest."

Phân tích: Hơn 90% quần thể saiga toàn cầu tập trung ở Kazakhstan, hoàn toàn không phân bố đều (evenly) giữa 4 quốc gia như câu hỏi nêu. → FALSE`,

      9: `Vị trí: Đoạn 3.

Trích dẫn: "Legal protection ensured its survival for a while, and numbers steadily recovered throughout most of the 20th century."

Phân tích: Số lượng saiga PHỤC HỒI (recovered) trong phần lớn thế kỷ 20, trái ngược với "falling" (suy giảm) trong câu hỏi. → FALSE`,

      10: `Vị trí: Đoạn 4.

Trích dẫn: "Poaching reached epidemic levels after misguided conservationists tried to relieve the pressure on threatened African rhinos by actively encouraging the use of saiga horns in traditional medicine as an alternative to those of rhinos. Male saiga were almost wiped out, leading to a population crash..."

Phân tích: Nỗ lực bảo vệ tê giác châu Phi (khuyến khích dùng sừng saiga thay thế) đã gây ra hệ quả nghiêm trọng, khiến saiga đực gần như bị xoá sổ → có tác động đáng kể (dù là tiêu cực) đến quần thể saiga. → TRUE`,

      11: `Vị trí: Đoạn 7 (và toàn bài).

Trích dẫn: "Climate change poses a further threat. Although well adapted to cold winters and hot summers, saiga struggle to cope with temperature extremes and unpredictable fluctuations in climate."

Phân tích: Bài chỉ nói về tác động của biến đổi khí hậu đến RIÊNG loài saiga, không hề so sánh mức độ đe doạ này với các khu vực khác trên thế giới. → NOT GIVEN`,

      12: `Vị trí: Đoạn 8.

Trích dẫn: "Its purpose is to protect and restore Kazakhstan's steppe, semi-desert and desert ecosystems and the many species they support, including the critically endangered saiga."

Phân tích: Sáng kiến Altyn Dala được lập ra để bảo vệ nhiều loài (many species) trong hệ sinh thái, không chỉ riêng saiga. → TRUE`,

      13: `Vị trí: Đoạn 8.

Trích dẫn: "In 2022 the United Nations recognised the initiative as a World Restoration Flagship project, an accolade reserved for the ten best examples of large-scale ecosystem restoration around the globe."

Phân tích: Bài chỉ nói về việc dự án được LHQ công nhận là "World Restoration Flagship", không hề đề cập việc danh hiệu này có mang lại thêm nguồn tài trợ quốc tế hay không. → NOT GIVEN`,
    },
  },
  {
    title: 'The problems of getting around the city of Dar es Salaam',
    category: 'passage2',
    explanations: {
      14: `Vị trí: Đoạn 1.

Trích dẫn: "United Nations projections anticipate it will become a megacity within seven years as its population passes 10 million, reaching 13.4 million by 2035."

Phân tích: Bài chỉ đưa ra các dự báo dân số hiện tại, không hề so sánh với các dự báo TRƯỚC ĐÂY để kết luận tốc độ tăng có nhanh hơn dự đoán cũ hay không. → NOT GIVEN`,

      15: `Vị trí: Đoạn 2.

Trích dẫn: "Today, four out of five of its people live in single-storey informal settlements on the spreading edges of the city..."

Phân tích: Đa số cư dân sống trong các khu định cư MỘT TẦNG (single-storey), trái ngược với "high-rise blocks" (nhà cao tầng) trong câu hỏi. → FALSE`,

      16: `Vị trí: Đoạn 3.

Trích dẫn: "A single suburban rail line serves residents in a few areas to the south but is tiny in the context of the wider city."

Phân tích: Bài chỉ mô tả quy mô nhỏ bé của tuyến đường sắt ngoại ô, không hề đề cập việc cư dân có được tham vấn ý kiến về tuyến đường này hay không. → NOT GIVEN`,

      17: `Vị trí: Đoạn 4.

Trích dẫn: "Nearly all the expansion is happening on the periphery, and nearly all takes place informally without any agreed strategy."

Phân tích: Hầu hết sự phát triển hiện tại diễn ra một cách tự phát (informally), không theo quy hoạch (unplanned). → TRUE`,

      18: `Vị trí: Đoạn 5.

Trích dẫn: "Unlike many cities on the continent, Dar es Salaam isn't trying to build a metro. It has chosen a less exciting but cheaper and more achievable method: the bus."

Phân tích: Dar es Salaam chọn hướng đi KHÁC với nhiều thành phố châu Phi khác (không xây tàu điện ngầm mà chọn xe buýt), trái ngược với ý "làm theo kế hoạch mà nhiều thành phố châu Phi đã áp dụng". → FALSE`,

      19: `Vị trí: Đoạn 6.

Trích dẫn: "The DART bus rapid transit (BRT) system runs on bus lanes separated from other traffic, mostly in the middle of the road to reduce stoppages."

Phân tích: Xe buýt chạy trên các làn đường riêng (lanes) để giảm tình trạng dừng/chậm trễ.`,

      20: `Vị trí: Đoạn 6.

Trích dẫn: "Ticket purchase and control takes place at stations prior to boarding..."

Phân tích: Hành khách mua và kiểm soát vé TRƯỚC KHI lên xe (boarding).`,

      21: `Vị trí: Đoạn 6.

Trích dẫn: "...the buses are step-free, which means the entire route is accessible to people using wheelchairs or who are travelling with baby buggies."

Phân tích: Thiết kế không bậc thềm giúp người dùng xe lăn (wheelchairs) tiếp cận toàn bộ tuyến đường.`,

      22: `Vị trí: Đoạn 7.

Trích dẫn: "...complaining that drivers often refuse to turn on the air conditioning to save fuel."

Phân tích: Tài xế thường không bật điều hoà để tiết kiệm nhiên liệu (fuel).`,

      23: `Vị trí: Đoạn 8.

Trích dẫn: "A shortage of buses after a serious flood at the main depot during the rainy season means the system is carrying 200,000 people a day – half the expected capacity."

Phân tích: Trận lũ lụt (flood) nghiêm trọng tại kho xe chính đã gây ra tình trạng thiếu xe buýt.`,

      24: `Vị trí: Đoạn 8.

Trích dẫn: "Smartcards can't be used as the mechanical readers aren't working either, forcing passengers to buy individual paper tickets for every journey."

Phân tích: Do đầu đọc thẻ hỏng, hành khách không thể sử dụng thẻ thông minh (smartcards).`,

      25: `Vị trí: Đoạn 8.

Trích dẫn: "Staff stand by the gates and tear tickets as people enter."

Phân tích: Nhân viên đứng tại các cổng soát vé (gates) và xé vé thủ công thay vì dùng máy quét.`,

      26: `Vị trí: Đoạn 8.

Trích dẫn: "As a result, queues are considerable at peak times."

Phân tích: Hàng dài (queues) hình thành đáng kể vào giờ cao điểm do phải xếp hàng xé vé thủ công.`,
    },
  },
  {
    title: 'Rethinking the Past',
    category: 'passage3',
    explanations: {
      27: `Vị trí: Đoạn 2.

Trích dẫn: "One is the growing evidence that many supposedly 'advanced' behaviours... can be traced much further back in time than we thought... And the other is that we have badly misunderstood gender roles in prehistoric societies..."

Phân tích: Tác giả nêu rõ hai thay đổi/phát hiện quan trọng trong hiểu biết về thời tiền sử (hành vi "tiên tiến" xuất hiện sớm hơn; vai trò giới bị hiểu sai). → A "pinpointing some key changes in our understanding of prehistory"`,

      28: `Vị trí: Đoạn 6.

Trích dẫn: "Evolution usually works by incremental steps and so does technology. The first birds weren't great at flying, and the first mobile phones weren't great at, well, anything really."

Phân tích: Ví dụ về điện thoại di động đời đầu minh hoạ cho luận điểm rằng sự phát triển thường diễn ra dần dần, từng bước nhỏ. → A "most developments happen in a gradual way."`,

      29: `Vị trí: Đoạn 7.

Trích dẫn: "Archaeology was invented by individuals with now unfashionably patriarchal views about gender, and those notions fed into their research. Today's researchers are trying to unpick this stuff..."

Phân tích: "this stuff" chỉ những nghiên cứu trước đây bị ảnh hưởng bởi quan điểm gia trưởng lỗi thời — "unpick" nghĩa là các nhà nghiên cứu ngày nay đang xem xét/đánh giá lại chúng. → D "reevaluating research influenced by outdated beliefs about society."`,

      30: `Vị trí: Đoạn cuối.

Trích dẫn: "Inequality, authoritarianism and patriarchy aren't inevitable. They're choices, and prehistory shows us that we can choose differently."

Phân tích: Tác giả ngụ ý rằng việc nghiên cứu quá khứ cho thấy bất bình đẳng không phải điều tất yếu — con người ngày nay có thể lựa chọn khác đi, tức là hướng tới một xã hội công bằng hơn. → A "Studying past societies could help us create a fairer society today."`,

      31: `Vị trí: Đoạn 3.

Trích dẫn: "researchers found buried logs that had been shaped with stone tools so that they interlocked... This would be unsurprising if they weren't 476,000 years old. That's almost 200,000 years before our species, Homo sapiens, evolved."

Phân tích: Cấu trúc gỗ được chế tác tinh xảo có niên đại còn trước cả khi loài người hiện đại xuất hiện, cho thấy Homo sapiens không phải loài duy nhất có khả năng chế tác phức tạp. → E "Homo sapiens was probably not the only species capable of sophisticated workmanship."`,

      32: `Vị trí: Đoạn 3.

Trích dẫn: "we now know that extinct hominins such as the Denisovans lived on the frozen heights of high-altitude regions 200,000 years ago – upending the old notion that such environments were only settled by modern humans around 3,600 years ago."

Phân tích: Người Denisovan (loài đã tuyệt chủng) từng sinh sống ở vùng núi cao khắc nghiệt rất lâu trước khi loài người hiện đại xuất hiện ở đó. → F "other species managed to survive in harsh environments before the arrival of Homo sapiens."`,

      33: `Vị trí: Đoạn 8.

Trích dẫn: "a meta-analysis published in June 2023 compiled data on several dozen foraging societies and found women hunted in 80 per cent of them."

Phân tích: Nghiên cứu tháng 6/2023 cho thấy phụ nữ cũng tham gia săn bắt ở phần lớn xã hội hái lượm — trái với giả định trước đây rằng việc kiếm ăn/săn bắt chỉ do nam giới đảm nhiệm. → D "experts may have been mistaken about who looked for food in early human communities."`,

      34: `Vị trí: Đoạn 8.

Trích dẫn: "an Iberian leader from around 4000 years ago turned out to be female, not male as many had assumed, when proteins in her teeth were analysed."

Phân tích: Vị thủ lĩnh này thực chất là nữ chứ không phải nam như nhiều người từng cho là — cho thấy các giả định trước đây về việc ai nắm quyền lực trong xã hội tiền sử là không chính xác. → B "previous assumptions about who had power in the prehistoric world were inaccurate."`,

      35: `Vị trí: Đoạn 4.

Trích dẫn: "We have had evidence for a long time now that Neanderthals painted on cave walls. Even earlier species, such as Homo erectus, may also have made art, for example by engraving patterns on shells."

Phân tích: Bài cho biết có thể có loài khác (Homo erectus) làm nghệ thuật còn SỚM HƠN cả Neanderthal, nên tranh vẽ trong hang của Neanderthal khó có thể là tác phẩm nghệ thuật đầu tiên. → NO`,

      36: `Vị trí: Đoạn 4.

Trích dẫn: "Even earlier species, such as Homo erectus, may also have made art, for example by engraving patterns on shells."

Phân tích: Bài chỉ đề cập khả năng khắc hoa văn lên vỏ sò, hoàn toàn không nói về mức độ phổ biến hay hiếm gặp của loại hiện vật này. → NOT GIVEN`,

      37: `Vị trí: Đoạn 4–5.

Trích dẫn: "researchers have found what seem to be etchings – resembling rudimentary artwork – on the cave walls, though these have yet to be firmly dated." / "The dispute has only been heightened by the way the results were released, in a non-traditional journal..."

Phân tích: Bài chỉ nói cách CÔNG BỐ kết quả (qua một tạp chí phi truyền thống) là khác thường, chứ không đề cập PHƯƠNG PHÁP nghiên cứu/khảo sát tại hang Rising Star có gì bất thường hay không. → NOT GIVEN`,

      38: `Vị trí: Đoạn 4.

Trích dẫn: "researchers have found what seem to be etchings – resembling rudimentary artwork – on the cave walls, though these have yet to be firmly dated."

Phân tích: Cụm "have yet to be firmly dated" (chưa được xác định niên đại chắc chắn) cho thấy tuổi của các hình khắc này vẫn chưa rõ ràng. → YES`,

      39: `Vị trí: Đoạn 5.

Trích dẫn: "The dispute has only been heightened by the way the results were released, in a non-traditional journal that publishes peer reviews publicly alongside the paper."

Phân tích: Cách công bố kết quả (qua tạp chí phi truyền thống) đã làm tranh cãi xung quanh phát hiện này thêm gay gắt (heightened). → YES`,

      40: `Vị trí: Đoạn 5.

Trích dẫn: "At the same time, I think the species' small brains are a distraction... other properties, such as the brain's internal wiring, are surely equally important and may explain how a species like H. naledi might have been capable of complex behaviours, despite their small brains."

Phân tích: Tác giả cho rằng kích thước não chỉ là yếu tố GÂY XAO LÃNG (distraction) khỏi vấn đề thật sự, không phải yếu tố then chốt để xác định khả năng làm nghệ thuật — trái với ý câu hỏi. → NO`,
    },
  },
  // ── Cam 21 - Test 4 ──────────────────────────────────────────────────
  {
    title: 'The problems and benefits created by the spread of the water hyacinth in Kenya',
    category: 'passage1',
    explanations: {
      1: `Vị trí: Đoạn 2.

Trích dẫn: "the plant arrived with Belgian colonists in Rwanda, who liked the look of its glossy leaves and delicate purple flowers floating in their ponds."

Phân tích: Người Bỉ mang cây này đến vì thích vẻ đẹp của nó (glossy leaves, purple flowers) để trang trí trong ao — đúng là mục đích trang trí (decorative). → TRUE`,

      2: `Vị trí: Đoạn 2.

Trích dẫn: "it had 'escaped' out of the country via the Kagera river and made its way downstream to Lake Victoria."

Phân tích: Cây tự "trốn thoát" theo dòng sông Kagera đến hồ Victoria, không phải do ngư dân mang tới. → FALSE`,

      3: `Vị trí: Đoạn 3.

Trích dẫn: "the boats that once brought the fish to shore by the hundreds struggle to navigate through the mass of plants."

Phân tích: Thuyền bè gặp khó khăn (struggle) khi len lỏi qua đám thực vật dày đặc. → TRUE`,

      4: `Vị trí: Toàn bài không đề cập.

Phân tích: Bài chỉ nói bèo lục bình cản trở tuyến đường đánh cá và tạo nơi trú ẩn cho muỗi truyền bệnh, không hề đề cập việc các hoá chất do cây tiết ra ảnh hưởng đến số lượng cá. → NOT GIVEN`,

      5: `Vị trí: Đoạn 3.

Trích dẫn: "About three out of four families in Kenya depend on wood or charcoal to cook their daily meals... Using solid fuels like these for cooking increases indoor pollution."

Phân tích: Bài chỉ nói chung về tác hại của nhiên liệu rắn (gỗ và than củi), không so sánh cụ thể mức độ độc hại giữa than củi và gỗ. → NOT GIVEN`,

      6: `Vị trí: Đoạn 4.

Trích dẫn: "on the shores of Lake Victoria, huge piles of water hyacinth that villagers had taken out of the water in an attempt to clear it were a common sight."

Phân tích: Người dân vẫn vớt được những đống bèo khổng lồ (huge piles) ra khỏi hồ, tức là hoàn toàn không phải "không thể" loại bỏ. → FALSE`,

      7: `Vị trí: Đoạn 4.

Trích dẫn: "It's a magic combination that has captivated researchers' imaginations since as early as the 1980s when, across the world, they began to explore its potential as a biofuel."

Phân tích: Các nhà khoa học bắt đầu nghiên cứu tiềm năng biogas của bèo lục bình từ những năm 1980 — tức là thế kỷ trước (thế kỷ 20). → TRUE`,

      8: `Vị trí: Đoạn 6.

Trích dẫn: "The community received a pair of donated biogas digesters – machines that would transform a mix of water hyacinth and cow dung into biogas for cooking."

Phân tích: Hỗn hợp đưa vào máy phân huỷ gồm bèo lục bình và phân bò (cow dung).`,

      9: `Vị trí: Đoạn 7.

Trích dẫn: "The mixture goes in one end... and over the next 20 to 30 days, it goes through a fermentation process and breaks down, giving off gas that comes out the other end."

Phân tích: Hỗn hợp trải qua quá trình lên men (fermentation process) trong 20-30 ngày.`,

      10: `Vị trí: Đoạn 7.

Trích dẫn: "From there, the clean-burning gas is passed through pipes to the point of use, just like traditional domestic gas."

Phân tích: Khí gas được dẫn tới nơi sử dụng qua hệ thống ống (pipes).`,

      11: `Vị trí: Đoạn 8.

Trích dẫn: "they don't have to devote a lot of time every day to gathering firewood, which is a great relief."

Phân tích: Phụ nữ không còn phải tốn nhiều thời gian (time) mỗi ngày để đi lấy củi.`,

      12: `Vị trí: Đoạn 8.

Trích dẫn: "As a result, they're able to make more money for their families from other enterprises."

Phân tích: Nhờ tiết kiệm thời gian, họ có thể kiếm thêm tiền (money) từ các công việc khác.`,

      13: `Vị trí: Đoạn 10.

Trích dẫn: "unless the price of the machines drops, it's pretty clear that most communities will never be able to afford any, since they sell for about $750."

Phân tích: Giá thành (price) của máy phân huỷ biogas là rào cản khiến hầu hết các cộng đồng không đủ khả năng mua.`,
    },
  },
  {
    title: "How could multilingualism benefit India's poorest schoolchildren?",
    category: 'passage2',
    explanations: {
      14: `Vị trí: Đoạn 1.

Trích dẫn: "The crowded and bustling streets of Delhi teem with life... as more than 20 million people go about their daily lives."

Phân tích: Delhi có mật độ dân số dày đặc (dense population) với hơn 20 triệu người sinh sống.`,

      15: `Vị trí: Đoạn 1.

Trích dẫn: "many millions more have recently made India's capital their home, having moved from surrounding neighbourhoods, cities and states or across the country..."

Phân tích: Những người mới chuyển đến sinh sống ở Delhi chính là những người nhập cư mới (new immigrants).`,

      16: `Vị trí: Đoạn 1.

Trích dẫn: "having moved from surrounding neighbourhoods, cities and states or across the country..."

Phân tích: "surrounding neighbourhoods" (khu vực lân cận) được diễn đạt lại thành "nearby district".`,

      17: `Vị trí: Đoạn 1.

Trích dẫn: "...often in the hope of gaining better jobs and a better life."

Phân tích: Họ đến Delhi với hy vọng có được cơ hội việc làm (employment opportunities) tốt hơn.`,

      18: `Vị trí: Đoạn 2.

Trích dẫn: "The overriding aim of the four-year project, called 'Multilingualism and Multiliteracy', is to find out why..."

Phân tích: "overriding aim" (mục tiêu bao trùm) được diễn đạt lại thành "primary objective" (mục tiêu chính).`,

      19: `Vị trí: Đoạn 2.

Trích dẫn: "...the many benefits of speaking more than one language, observed in schools in Europe for instance, do not apply to many of India's schoolchildren."

Phân tích: Học sinh Ấn Độ không có được những lợi ích tương tự (similar advantages) mà học sinh đa ngôn ngữ ở châu Âu có được.`,

      20: `Vị trí: Đoạn 3.

Trích dẫn: "over 50% of children in Standard 5 [ten-year-olds] cannot read a Standard 2 [seven-year-olds] task fluently, and just under 50% of them cannot solve a Standard 2 subtraction task."

Phân tích: Tỉ lệ trẻ 10 tuổi KHÔNG đọc trôi chảy (hơn 50%) còn CAO HƠN tỉ lệ không giải được bài toán trừ (dưới 50%) — nghĩa là các em làm bài đọc kém hơn (không phải tốt hơn) so với bài toán. → NO`,

      21: `Vị trí: Đoạn 3.

Trích dẫn: "low educational achievement can lead to many of these students dropping out of school – a problem disproportionately affecting female students."

Phân tích: Bài chỉ nói học sinh nữ bị ảnh hưởng nhiều hơn bởi tình trạng bỏ học, không hề đề cập việc Tsimpli gặp khó khăn thuyết phục các em nữ THAM GIA nghiên cứu. → NOT GIVEN`,

      22: `Vị trí: Đoạn 4.

Trích dẫn: "Tsimpli and her colleagues are investigating whether these low learning outcomes could be caused by an Indian school system where the language that children are taught in often differs from the language used at home."

Phân tích: Đúng như câu hỏi paraphrase — nhóm nghiên cứu muốn tìm hiểu mối liên hệ giữa kết quả học tập kém và việc học bằng ngôn ngữ không quen thuộc. → YES`,

      23: `Vị trí: Đoạn 5.

Trích dẫn: "They intend to look not only at test results, but also at variables such as the standard of schooling, the environment and the teaching practices themselves."

Phân tích: Nhóm nghiên cứu CÓ dự định xem xét cả phương pháp giảng dạy (teaching practices), trái ngược với ý "quyết định không nghiên cứu" trong câu hỏi. → NO`,

      24: `Vị trí: Đoạn 6.

Trích dẫn: "the medium of instruction used in schools, especially English, may hold back those children who have little familiarity with, or exposure to, the language before starting school... English instruction for children from low socio-economic areas might not be the best way for them to learn."

Phân tích: Việc dạy bằng tiếng Anh có thể gây bất lợi thêm cho trẻ em nghèo, những em vốn đã ít tiếp xúc với ngôn ngữ này. → C "Poor children may be disadvantaged further by being instructed in English."`,

      25: `Vị trí: Đoạn 7.

Trích dẫn: "We are not suggesting that English be withdrawn – that ship has sailed – but we perhaps have to think more about learner needs."

Phân tích: "that ship has sailed" (con tàu đã rời bến) là thành ngữ chỉ việc gì đó đã quá muộn để thay đổi — ở đây nghĩa là quá muộn để loại bỏ hoàn toàn tiếng Anh khỏi việc giảng dạy. → D "It is too late to remove English completely as a language of instruction in schools."`,

      26: `Vị trí: Đoạn 8.

Trích dẫn: "an unanticipated finding has been that children from slum backgrounds do not seem to lag behind children from other urban poor backgrounds – and in some cases outperform them (e.g. in numeracy and literacy tasks)."

Phân tích: Phát hiện bất ngờ là khả năng đọc viết/tính toán của trẻ em khu ổ chuột không hề thấp hơn (thậm chí có thể vượt trội) so với trẻ em nghèo đô thị khác. → D "The literacy and numeracy skills of slum children are not lower than those of children from other urban poor backgrounds."`,
    },
  },
  {
    title: 'The Globemakers: The Curious Story of an Ancient Craft',
    category: 'passage3',
    explanations: {
      27: `Vị trí: Đoạn 1.

Trích dẫn: "What seemed simple enough to start with triggered an almost obsessive, decade-long journey, marked by a series of obstacles that would have deterred anyone less determined."

Phân tích: Việc tưởng chừng đơn giản hoá ra lại là một nhiệm vụ đầy thách thức (challenging task), kéo dài cả thập kỷ.`,

      28: `Vị trí: Đoạn 1.

Trích dẫn: "...marked by a series of obstacles that would have deterred anyone less determined."

Phân tích: "a series of obstacles" (hàng loạt trở ngại) được diễn đạt lại thành "numerous problems".`,

      29: `Vị trí: Đoạn 2.

Trích dẫn: "obtaining such a globe was not simply a matter of a quick online order and a repressed sigh at the shipping costs."

Phân tích: Việc mua một quả địa cầu không đơn giản như một lần đặt hàng qua mạng (internet purchase).`,

      30: `Vị trí: Đoạn 3.

Trích dẫn: "Bellerby came across shoddy commercial versions designed for school classrooms and genuine antiques in auction houses that would have bust his budget."

Phân tích: "shoddy commercial versions" (những phiên bản thương mại kém chất lượng) được diễn đạt lại thành "inferior makes".`,

      31: `Vị trí: Đoạn 3.

Trích dẫn: "...shoddy commercial versions designed for school classrooms..."

Phân tích: Những phiên bản kém chất lượng này được thiết kế cho mục đích giáo dục (educational use) — dùng trong lớp học.`,

      32: `Vị trí: Đoạn 3.

Trích dẫn: "Even his trips to Morocco and India, where surely the knowledge of artisan cartographers had been preserved, drew a blank."

Phân tích: Ông hy vọng tìm được nơi còn lưu giữ kỹ năng cần thiết (necessary skills) làm địa cầu thủ công, nhưng không thành công.`,

      33: `Vị trí: Đoạn 2.

Trích dẫn: "contrary to stubbornly held popular views of our ancestors' geographical ignorance, we have known that the world is spherical since at least the 6th century BCE."

Phân tích: Bài khẳng định quan niệm phổ biến rằng tổ tiên chúng ta thiếu hiểu biết về địa lý là SAI (contrary to) — con người đã biết trái đất hình cầu từ rất sớm. → NO`,

      34: `Vị trí: Đoạn 2.

Trích dẫn: "The ancient Greek philosopher Plato in his work Phaedo likened it to a leather ball..."

Phân tích: Bài chỉ nêu việc Plato so sánh trái đất với quả bóng da, không hề đề cập việc ông có bị chỉ trích vì điều này hay không. → NOT GIVEN`,

      35: `Vị trí: Đoạn 2.

Trích dẫn: "the accolade of producing the first recorded globe goes to the ancient Greek philosopher Crates of Mallus, who is said to have made one in around 150 BCE."

Phân tích: Bài chỉ nói Crates of Mallus là người đầu tiên làm ra quả địa cầu được ghi nhận, không đề cập đến độ chính xác của nó. → NOT GIVEN`,

      36: `Vị trí: Đoạn 2.

Trích dẫn: "Surely, Bellerby reasoned, a good-quality globe wouldn't be difficult to find."

Phân tích: Bellerby ban đầu tin rằng việc tìm một quả địa cầu chất lượng tốt sẽ không khó khăn gì. → YES`,

      37: `Vị trí: Đoạn 5.

Trích dẫn: "Right at the end of the process, he learnt that the paper had stretched slightly and so the final one overlapped the first by a centimetre..."

Phân tích: Ông phát hiện ra một vấn đề bất ngờ (unexpected issue) — giấy bị giãn ra khiến các mảnh bản đồ không khớp hoàn toàn. → B "he became aware of an unexpected issue."`,

      38: `Vị trí: Đoạn 6.

Trích dẫn: "Bellerby clearly found a kindred spirit in Martin Behaim..." / "Something of Bellerby's unflinching ambition is reflected in the even more heroic efforts of the Italian cartographer Vincenzo Coronelli..."

Phân tích: Người viết nhắc đến các nhà làm địa cầu xưa vì Bellerby có những điểm chung với từng người trong số họ (kindred spirit, tham vọng tương đồng). → C "Bellerby had something in common with each of them."`,

      39: `Vị trí: Đoạn 7.

Trích dẫn: "Bellerby's book is also a lament for the fading away of centuries-old traditions... many of these have now retired or passed away."

Phân tích: Cuốn sách của Bellerby còn là một lời than tiếc (lament) cho sự mai một của các kỹ năng làm địa cầu truyền thống. → D "He regrets the loss of many globe-making skills."`,

      40: `Vị trí: Đoạn cuối.

Trích dẫn: "His book... is hardly a blueprint for commercial success."

Phân tích: Người viết nhận xét cuốn sách không phải là một "bản thiết kế" hướng dẫn cách kinh doanh thành công. → A "It does not tell you how to create a profitable business."`,
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
