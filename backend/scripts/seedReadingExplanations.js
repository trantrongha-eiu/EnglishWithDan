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
