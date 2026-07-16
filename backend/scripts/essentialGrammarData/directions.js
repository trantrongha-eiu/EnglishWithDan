"use strict";

const { lesson } = require("./builder");

const DIRECTIONS = "Directions";
const ASKING_GIVING = "Asking & Giving Directions";

module.exports = [
  lesson({
    category: DIRECTIONS, lessonKey: "location-prepositions", title: "Location Prepositions", icon: "📍", orderIndex: 24,
    overview: "Giới từ chỉ vị trí giúp mô tả chính xác nơi các địa điểm nằm trên bản đồ — kỹ năng nền tảng cho Task 1 map và Speaking Part 2 khi mô tả nơi ở.",
    formula: [
      { label: "Vị trí cạnh nhau", structure: "S + is + next to/beside/near + N", example: "The library is next to the town hall." },
      { label: "Vị trí đối diện", structure: "S + is + opposite/across from + N", example: "The pharmacy is opposite the supermarket." },
      { label: "Vị trí giữa", structure: "S + is + between + N1 and N2", example: "The park is between the school and the hospital." }
    ],
    usage: [
      { title: "Mô tả vị trí tương đối giữa hai địa điểm", description: "The bank is on the corner of Main Street and 5th Avenue." },
      { title: "Mô tả vị trí bên trong/xung quanh một khu vực", description: "There is a fountain in the middle of the square." }
    ],
    signalWords: ["next to", "beside", "near", "opposite", "across from", "between", "on the corner of", "in front of", "behind", "at the end of"],
    examples: [
      { en: "The new shopping mall is located between the station and the park.", vi: "Trung tâm thương mại mới nằm giữa nhà ga và công viên." },
      { en: "The car park is behind the main building.", vi: "Bãi đỗ xe nằm phía sau tòa nhà chính." },
      { en: "The hotel is on the corner of King Street and Queen Road.", vi: "Khách sạn nằm ở góc đường King và đường Queen." },
      { en: "There is a bus stop right in front of the cinema.", vi: "Có một trạm xe buýt ngay phía trước rạp chiếu phim." },
      { en: "The pharmacy is next to the supermarket, close to the entrance.", vi: "Nhà thuốc nằm cạnh siêu thị, gần lối vào." },
      { en: "The art gallery is across from the city hall.", vi: "Phòng trưng bày nghệ thuật nằm đối diện tòa thị chính." },
      { en: "A small café is located at the end of the street.", vi: "Một quán cà phê nhỏ nằm ở cuối con phố." },
      { en: "The playground is surrounded by tall trees on all sides.", vi: "Sân chơi được bao quanh bởi những hàng cây cao ở mọi phía." },
      { en: "The bookshop is beside the post office, just a few steps away.", vi: "Hiệu sách nằm cạnh bưu điện, chỉ cách vài bước chân." },
      { en: "The swimming pool is near the sports centre, within walking distance.", vi: "Hồ bơi nằm gần trung tâm thể thao, trong khoảng cách đi bộ." },
      { en: "The apartment block stands opposite the riverside park.", vi: "Tòa nhà chung cư nằm đối diện công viên ven sông." }
    ],
    mistakes: [
      { wrong: "The bank is opposite to the park.", right: "The bank is opposite the park.", note: "\"Opposite\" là giới từ, dùng trực tiếp với danh từ, không cần thêm \"to\"." },
      { wrong: "It is between the school.", right: "It is between the school and the library.", note: "\"Between\" cần HAI địa điểm/vật, không dùng với một danh từ đơn." },
      { wrong: "The museum is near from the station.", right: "The museum is near the station.", note: "\"Near\" tự nó đã là giới từ hoàn chỉnh, không cần thêm \"from\" phía sau." },
      { wrong: "The shop is in front the bank.", right: "The shop is in front of the bank.", note: "\"In front of\" là cụm giới từ ba từ, không được bỏ \"of\"." },
      { wrong: "The library is besides the park.", right: "The library is beside the park.", note: "\"Beside\" (ở cạnh) khác với \"besides\" (hơn nữa, ngoài ra) — hai từ dễ nhầm vì viết gần giống nhau." },
      { wrong: "The café is behind of the church.", right: "The café is behind the church.", note: "\"Behind\" là giới từ đơn, không cần thêm \"of\" phía sau." }
    ],
    tips: [
      "Học thuộc nhóm giới từ vị trí theo cặp đối lập (in front of ↔ behind; next to ↔ opposite) để không nhầm lẫn khi mô tả bản đồ.",
      "Kết hợp giới từ vị trí với thì hiện tại đơn (\"is/are located\") vì bản đồ mô tả trạng thái tĩnh, không đổi."
    ],
    comparison: {
      title: "Next to vs Opposite vs Between",
      headers: ["Next to/Beside", "Opposite/Across from", "Between"],
      rows: [["Ngay cạnh", "Đối diện qua đường/khoảng trống", "Ở giữa hai vật"], ["next to the bank", "opposite the bank", "between the bank and the café"]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn giới từ đúng: \"The ATM machine is ___ the entrance of the mall.\"", options: ["next to", "between", "opposite of", "behind of"], answerIndex: 0, explanation: "\"Next to\" dùng trực tiếp với danh từ để chỉ vị trí sát cạnh." },
      { type: "multiple_choice", question: "Câu nào mô tả đúng vị trí 'ở giữa hai địa điểm'?", options: ["The park is between the school and the library.", "The park is between the school.", "The park is next to the school and the library.", "The park is opposite the school and the library."], answerIndex: 0, explanation: "\"Between\" cần hai mốc tham chiếu nối bằng \"and\"." },
      { type: "fill_blank", question: "Điền giới từ thích hợp (nghĩa \"gần\"): \"The taxi rank is ___ the train station, right by the main entrance.\"", answer: "near", explanation: "\"Near\" diễn tả khoảng cách gần." },
      { type: "fill_blank", question: "Điền giới từ thích hợp vào hai chỗ trống: \"Our office is ___ the corner ___ Bui Vien Street and Pham Ngu Lao Street.\"", answer: "on; of", explanation: "Cụm cố định \"on the corner of\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"The clinic is opposite to the school.\"", answer: "The clinic is opposite the school.", explanation: "\"Opposite\" không cần \"to\" theo sau." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"The garden is in front the house.\"", answer: "The garden is in front of the house.", explanation: "\"In front of\" cần đủ ba từ, không bỏ \"of\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Quán cà phê nằm giữa hiệu sách và ngân hàng.\"", answer: "The café is between the bookshop and the bank.", explanation: "\"Between\" + 2 địa điểm nối bằng \"and\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Trạm xăng nằm ngay phía sau siêu thị.\"", answer: "The petrol station is right behind the supermarket.", explanation: "\"Behind\" chỉ vị trí phía sau, có thể thêm \"right\" để nhấn mạnh." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The dentist's office is on the second floor, opposite the elevator.\"", answer: "Phòng khám nha khoa nằm ở tầng hai, đối diện thang máy.", explanation: "\"Opposite\" = đối diện." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"There's a small park at the end of this road.\"", answer: "Có một công viên nhỏ ở cuối con đường này.", explanation: "\"At the end of\" = ở cuối." },
      { type: "sentence_transformation", question: "Viết lại câu sau dùng \"opposite\" thay vì \"across from\" mà nghĩa không đổi: \"The hospital is across from the pharmacy.\"", answer: "The hospital is opposite the pharmacy.", explanation: "\"Opposite\" và \"across from\" đồng nghĩa, đều nghĩa là \"đối diện\"." },
      { type: "sentence_transformation", question: "Viết lại câu sau, thay \"next to\" bằng \"beside\" mà nghĩa không đổi: \"The gym is next to the swimming pool.\"", answer: "The gym is beside the swimming pool.", explanation: "\"Next to\" và \"beside\" đồng nghĩa, chỉ vị trí sát cạnh." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng (chỉ có một mốc tham chiếu): \"The flower stall is between the market.\"", answer: "The flower stall is next to the market.", explanation: "\"Between\" cần hai địa điểm; nếu chỉ có một, đổi sang \"next to\" hoặc \"near\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"The temple is besides the lake, very peaceful.\"", answer: "The temple is beside the lake, very peaceful.", explanation: "\"Beside\" (cạnh) bị viết nhầm thành \"besides\" (hơn nữa) — cần sửa lại đúng chính tả và nghĩa." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"The restaurant is opposite to the beach, very convenient.\"", answer: "Lỗi: \"opposite to\" → sửa thành \"opposite\" (bỏ \"to\").", explanation: "\"Opposite\" là giới từ, không cần thêm \"to\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"The vet clinic is near from my house.\"", answer: "Lỗi: \"near from\" → sửa thành \"near\" (bỏ \"from\").", explanation: "\"Near\" đã là giới từ hoàn chỉnh, không cần thêm \"from\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền giới từ vị trí đúng):\nA: Excuse me, where's the nearest ATM?\nB: It's ___ the supermarket, right by the main door.\nA: Great, thanks!", answer: "next to", explanation: "\"Next to\" diễn tả vị trí sát cạnh, phù hợp ngữ cảnh \"ngay cạnh cửa chính\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Is there a pharmacy around here?\nB: Yes, it's ___ the bakery and the bank, you can't miss it.\nA: Perfect, thank you.", answer: "between", explanation: "\"Between\" dùng khi vị trí nằm giữa hai mốc tham chiếu (bakery và bank)." }
    ],
    quiz: [
      { question: "Chọn giới từ đúng: \"The museum is ___ the river and the market.\"", options: ["between", "opposite", "next", "behind"], answerIndex: 0, explanation: "\"Between\" dùng khi có 2 mốc tham chiếu (river và market)." },
      { question: "Câu nào đúng?", options: ["The shop is opposite to the school.", "The shop is opposite the school.", "The shop is opposite of the school.", "The shop is opposite from the school."], answerIndex: 1, explanation: "\"Opposite\" đi trực tiếp với danh từ, không cần giới từ đi kèm." },
      { question: "Chọn giới từ đúng: \"The café is ___ the corner of Elm Street.\"", options: ["on", "in", "at", "to"], answerIndex: 0, explanation: "\"On the corner of\" là cụm cố định chỉ vị trí góc phố." },
      { question: "Câu nào đúng?", options: ["The park is near from my house.", "The park is near my house.", "The park is near to my house.", "The park is nearing my house."], answerIndex: 1, explanation: "\"Near\" là giới từ, dùng trực tiếp với danh từ." },
      { question: "Chọn đáp án đúng: \"The flower shop is ___ the bakery and the bank.\"", options: ["between", "beside", "opposite", "behind"], answerIndex: 0, explanation: "\"Between\" dùng khi có hai mốc tham chiếu nối bằng \"and\"." },
      { question: "Câu nào đúng?", options: ["The hotel is beside the beach.", "The hotel is besides the beach.", "The hotel is beside of the beach.", "The hotel is beside to the beach."], answerIndex: 0, explanation: "\"Beside\" (cạnh) dùng trực tiếp với danh từ, không kèm giới từ khác." }
    ],
    summary: "Giới từ vị trí (next to, opposite, between, on the corner of...) mô tả chính xác vị trí địa điểm trên bản đồ — luôn đi với hiện tại đơn vì mô tả trạng thái tĩnh."
  }),

  lesson({
    category: DIRECTIONS, lessonKey: "describing-a-route", title: "Describing a Route on a Map", icon: "🗺️", orderIndex: 25,
    overview: "Cấu trúc mô tả tuyến đường di chuyển trên bản đồ (Task 1 maps có sự thay đổi qua các mốc thời gian, hoặc Speaking khi chỉ đường) — kết hợp động từ chỉ hướng và giới từ vị trí.",
    formula: [
      { label: "Chỉ hướng di chuyển", structure: "Go/Walk/Head + straight on/along + N", example: "Walk straight along Main Street for two blocks." },
      { label: "Rẽ hướng", structure: "Turn left/right + at/onto + N", example: "Turn left at the traffic lights onto Oak Avenue." },
      { label: "Đến đích", structure: "S + will find/see + N + on + S's left/right", example: "You will see the museum on your right." }
    ],
    usage: [
      { title: "Mô tả các bước di chuyển từ điểm A đến điểm B", description: "From the entrance, walk straight ahead until you reach the roundabout." },
      { title: "Mô tả sự thay đổi cơ sở hạ tầng qua các mốc thời gian trong Task 1 maps", description: "A new car park was built next to the station between 2000 and 2010." }
    ],
    signalWords: ["go straight on", "turn left/right", "take the first/second turning", "continue until", "cross the bridge", "pass by"],
    examples: [
      { en: "Head north along the main road, then turn right at the roundabout.", vi: "Đi thẳng về hướng bắc theo con đường chính, sau đó rẽ phải ở vòng xuyến." },
      { en: "Take the second turning on the left and the library will be on your right.", vi: "Rẽ vào ngã rẽ thứ hai bên trái và thư viện sẽ nằm bên phải bạn." },
      { en: "By 2020, a new bridge had been built to connect the two districts.", vi: "Đến năm 2020, một cây cầu mới đã được xây để kết nối hai khu vực." },
      { en: "Cross the bridge and continue straight until you reach the traffic lights.", vi: "Đi qua cây cầu và tiếp tục đi thẳng cho đến khi bạn đến đèn giao thông." },
      { en: "Follow this road for about five minutes, then take the first exit at the roundabout.", vi: "Đi theo con đường này khoảng năm phút, sau đó rẽ vào lối ra thứ nhất tại vòng xuyến." },
      { en: "Go past the shopping centre and the station will be right in front of you.", vi: "Đi qua trung tâm mua sắm và nhà ga sẽ ở ngay trước mặt bạn." },
      { en: "Before 1990, this area had only a small dirt road running through the village.", vi: "Trước năm 1990, khu vực này chỉ có một con đường đất nhỏ chạy qua làng." },
      { en: "The old railway line was removed and replaced with a cycling path.", vi: "Tuyến đường sắt cũ đã bị dỡ bỏ và thay thế bằng một con đường dành cho xe đạp." },
      { en: "Turn right onto Elm Avenue and keep going until the road forks.", vi: "Rẽ phải vào đại lộ Elm và tiếp tục đi cho đến khi đường chia nhánh." },
      { en: "A pedestrian bridge was constructed over the highway between 2015 and 2018.", vi: "Một cây cầu dành cho người đi bộ đã được xây dựng bắc qua đường cao tốc trong khoảng 2015-2018." },
      { en: "Walk along the coastal path until you pass the lighthouse.", vi: "Đi dọc theo con đường ven biển cho đến khi bạn đi qua ngọn hải đăng." }
    ],
    mistakes: [
      { wrong: "Turn left in the second street.", right: "Turn left at/onto the second street.", note: "Dùng \"at\" (điểm rẽ) hoặc \"onto\" (rẽ vào con đường mới), không dùng \"in\"." },
      { wrong: "You will see the park in your right.", right: "You will see the park on your right.", note: "Cụm từ cố định là \"on your left/right\", không phải \"in your left/right\"." },
      { wrong: "Continue to straight until the bridge.", right: "Continue straight until the bridge.", note: "\"Straight\" là trạng từ, không cần \"to\" trước nó khi đi sau \"continue/go\"." },
      { wrong: "The bridge has been build in 2015.", right: "The bridge was built in 2015.", note: "Mốc thời gian cụ thể trong quá khứ (2015) cần Past Simple, không dùng Present Perfect." },
      { wrong: "By 2020, a new road has been built.", right: "By 2020, a new road had been built.", note: "Diễn tả hành động hoàn tất TRƯỚC một mốc thời gian trong quá khứ cần Past Perfect, không phải Present Perfect." },
      { wrong: "Take the second turn to the left.", right: "Take the second turning on the left.", note: "Cụm cố định là \"turning\" (danh từ chỉ chỗ rẽ) đi với \"on the left/right\", không phải \"turn to the left\"." },
      { wrong: "Cross through the bridge.", right: "Cross the bridge.", note: "\"Cross\" là động từ ngoại động, đi thẳng với tân ngữ, không cần thêm \"through\"." }
    ],
    tips: [
      "Trong Task 1 map có 2 mốc thời gian, kết hợp thì Past Simple (mô tả bản đồ cũ) và Past Perfect/\"had been built\" (mô tả thay đổi hoàn tất trước mốc sau).",
      "Với Speaking Part 2 (chỉ đường), luôn dùng câu mệnh lệnh (imperative): Turn, Go, Walk, Take..."
    ],
    comparison: {
      title: "Route Description vs Location Prepositions",
      headers: ["Describing a Route (động)", "Location Prepositions (tĩnh)"],
      rows: [["Diễn tả chuyển động, dùng động từ mệnh lệnh", "Diễn tả vị trí cố định, dùng \"is/are\""], ["Turn left at the corner.", "The shop is on the corner."]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn đáp án đúng: \"___ straight on until you reach the crossroads, then turn left.\"", options: ["Go", "Going", "Went", "Gone"], answerIndex: 0, explanation: "Câu mệnh lệnh chỉ đường bắt đầu bằng động từ nguyên mẫu." },
      { type: "multiple_choice", question: "Câu nào mô tả đúng sự thay đổi bản đồ qua 2 mốc thời gian?", options: ["A new road had been built by 2015.", "A new road has been built by 2015.", "A new road is built by 2015.", "A new road built by 2015."], answerIndex: 0, explanation: "Diễn tả hành động hoàn tất trước mốc 2015 (trong quá khứ) cần Past Perfect." },
      { type: "fill_blank", question: "Điền từ thích hợp: \"Take the first turning ___ the right after the bridge.\"", answer: "on", explanation: "Cụm cố định \"turning on the right/left\"." },
      { type: "fill_blank", question: "Điền từ thích hợp: \"Walk ___ Main Street until you pass the cinema.\"", answer: "along", explanation: "\"Along\" diễn tả di chuyển dọc theo một con đường." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Turn right in the corner and you'll see the bank.\"", answer: "Turn right at the corner and you'll see the bank.", explanation: "\"At the corner\" là cụm cố định chỉ điểm rẽ, không dùng \"in\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"By 2005, the old factory has been demolished.\"", answer: "By 2005, the old factory had been demolished.", explanation: "Mốc thời gian quá khứ \"by 2005\" + hành động hoàn tất trước đó cần Past Perfect, không phải Present Perfect." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Đi thẳng qua công viên rồi rẽ trái tại vòng xuyến.\"", answer: "Go straight through the park, then turn left at the roundabout.", explanation: "Câu mệnh lệnh chỉ đường: \"go straight through\" + \"turn left at\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Đến năm 2015, một con đường mới đã được xây dựng để nối hai thị trấn.\"", answer: "By 2015, a new road had been built to connect the two towns.", explanation: "Mốc thời gian quá khứ + hành động hoàn tất trước đó → Past Perfect bị động." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Keep walking along the river until you see a small bridge on your left.\"", answer: "Cứ đi dọc theo con sông cho đến khi bạn thấy một cây cầu nhỏ bên trái.", explanation: "\"Keep + V-ing\" = tiếp tục làm gì; \"along the river\" = dọc theo sông." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"The car park that used to be here was replaced by a shopping centre in 2012.\"", answer: "Bãi đỗ xe từng ở đây đã được thay thế bằng một trung tâm mua sắm vào năm 2012.", explanation: "\"Used to be\" diễn tả điều từng tồn tại trong quá khứ nhưng không còn nữa." },
      { type: "sentence_transformation", question: "Viết lại câu sau ở dạng Past Perfect để nhấn mạnh hành động hoàn tất trước mốc 2010: \"A new bridge was built before 2010.\"", answer: "By 2010, a new bridge had been built.", explanation: "Dùng \"by + mốc thời gian\" và Past Perfect để nhấn mạnh hành động đã hoàn tất trước mốc đó." },
      { type: "sentence_transformation", question: "Viết lại câu mệnh lệnh sau dùng \"until\" thay vì \"and then\": \"Go straight on and then you'll reach the square.\"", answer: "Go straight on until you reach the square.", explanation: "\"Until\" diễn tả tiếp tục hành động đến khi đạt được mốc, ngắn gọn hơn \"and then\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"Turn left in the second turning after the church.\"", answer: "Turn left at the second turning after the church.", explanation: "Dùng \"at\" trước điểm rẽ cụ thể, không dùng \"in\"." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"By 2018, the town center have changed a lot with a new mall being build.\"", answer: "By 2018, the town centre had changed a lot, with a new mall having been built.", explanation: "Cần Past Perfect (\"had changed\") để diễn tả hoàn tất trước mốc 2018, và bị động hoàn thành cho \"a new mall\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Take the second turning to the left after the petrol station.\"", answer: "Lỗi: \"turning to the left\" → sửa thành \"turning on the left\".", explanation: "Cụm cố định là \"turning on the left/right\", không dùng \"to the left\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"In the past, there was only a footpath here, but by 2020, a road has been built.\"", answer: "Lỗi: \"has been built\" → sửa thành \"had been built\".", explanation: "Cần Past Perfect vì hành động hoàn tất trước mốc quá khứ \"2020\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền từ chỉ hướng đúng):\nA: How do I get to the stadium from here?\nB: Go straight on, then ___ right at the second traffic lights.\nA: Got it, thanks!", answer: "turn", explanation: "\"Turn right at + mốc\" là cấu trúc chỉ đường rẽ hướng chuẩn." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Has this area changed much over the years?\nB: A lot! By 2019, a new bridge ___ (build) to replace the old ferry crossing.\nA: That must have made travel much easier.", answer: "had been built", explanation: "Mốc quá khứ 2019 + hành động hoàn tất trước đó → Past Perfect bị động \"had been built\"." }
    ],
    quiz: [
      { question: "Chọn đáp án đúng: \"Continue straight ___ you reach the bridge.\"", options: ["until", "for", "to", "at"], answerIndex: 0, explanation: "\"Until\" diễn tả tiếp tục đi đến khi đạt mốc nào đó." },
      { question: "Câu nào đúng?", options: ["You will see the shop in your left.", "You will see the shop on your left.", "You will see the shop at your left.", "You will see the shop to your left."], answerIndex: 1, explanation: "Cụm cố định \"on your left/right\"." },
      { question: "Chọn đáp án đúng: \"By the time the survey was conducted, a new supermarket ___ next to the old cinema.\"", options: ["had been built", "has been built", "was build", "builds"], answerIndex: 0, explanation: "Hành động hoàn tất trước một mốc thời gian trong quá khứ dùng Past Perfect." },
      { question: "Câu nào đúng?", options: ["Turn left in the traffic lights.", "Turn left at the traffic lights.", "Turn left on the traffic lights.", "Turn left to the traffic lights."], answerIndex: 1, explanation: "\"At\" dùng để chỉ điểm rẽ cụ thể (đèn giao thông, ngã tư)." },
      { question: "Chọn đáp án đúng: \"___ the river and you will see the market on your left.\"", options: ["Cross", "Crossing", "Crossed", "To cross"], answerIndex: 0, explanation: "Câu mệnh lệnh chỉ đường dùng động từ nguyên mẫu đứng đầu câu." },
      { question: "Câu nào đúng khi mô tả Task 1 map có 2 mốc thời gian?", options: ["In 1990, there was no bridge here, but by 2010, one had been built.", "In 1990, there is no bridge here, but by 2010, one has been built.", "In 1990, there was no bridge here, but by 2010, one has built.", "In 1990, there was no bridge here, but by 2010, one had build."], answerIndex: 0, explanation: "Mốc quá khứ xa hơn dùng Past Simple, mốc gần hơn dùng Past Perfect vì hành động đã hoàn tất trước thời điểm quan sát sau." }
    ],
    summary: "Mô tả tuyến đường kết hợp động từ chỉ hướng (turn, go straight, take the turning) với giới từ vị trí (on your left/right) — dùng câu mệnh lệnh khi chỉ đường trực tiếp."
  }),

  lesson({
    category: ASKING_GIVING, lessonKey: "asking-for-directions", title: "Asking for Directions", icon: "🙋", orderIndex: 26,
    overview: "Các mẫu câu hỏi đường lịch sự, tự nhiên — quan trọng cho Speaking Part 1/2 khi giả định tình huống hỏi đường ở nơi công cộng.",
    formula: [
      { label: "Câu hỏi lịch sự (formal)", structure: "Could/Would you tell me how to get to + N?", example: "Could you tell me how to get to the nearest bank?" },
      { label: "Câu hỏi trực tiếp (informal)", structure: "How do I get to + N?", example: "How do I get to the train station from here?" },
      { label: "Hỏi xác nhận khoảng cách", structure: "Is it far to/from here?", example: "Is the museum far from here?" }
    ],
    usage: [
      { title: "Hỏi đường một cách lịch sự với người lạ", description: "Excuse me, could you tell me the way to the post office?" },
      { title: "Hỏi khoảng cách hoặc phương tiện di chuyển phù hợp", description: "Is it within walking distance, or should I take a bus?" }
    ],
    signalWords: ["excuse me", "could you tell me...", "how do I get to...", "is it far from here", "which way to..."],
    examples: [
      { en: "Excuse me, could you tell me how to get to the city library?", vi: "Xin lỗi, bạn có thể chỉ tôi cách đến thư viện thành phố không?" },
      { en: "Is the airport far from the city centre?", vi: "Sân bay có xa trung tâm thành phố không?" },
      { en: "Which way should I go to reach the market?", vi: "Tôi nên đi hướng nào để đến chợ?" },
      { en: "Excuse me, do you know if there's a pharmacy nearby?", vi: "Xin lỗi, bạn có biết gần đây có nhà thuốc nào không?" },
      { en: "Would you mind telling me the way to the nearest bus stop?", vi: "Bạn có phiền chỉ tôi đường đến trạm xe buýt gần nhất không?" },
      { en: "Sorry to bother you, but is this the right way to the train station?", vi: "Xin lỗi làm phiền bạn, nhưng đây có phải đường đến ga tàu không?" },
      { en: "Could you point me in the direction of the town hall?", vi: "Bạn có thể chỉ tôi hướng đến tòa thị chính không?" },
      { en: "Do you happen to know how far the beach is from here?", vi: "Bạn có tình cờ biết bãi biển cách đây bao xa không?" },
      { en: "Excuse me, I'm looking for the nearest ATM — could you help me?", vi: "Xin lỗi, tôi đang tìm cây ATM gần nhất — bạn có thể giúp tôi không?" },
      { en: "Is it possible to walk to the museum, or is it too far?", vi: "Có thể đi bộ đến bảo tàng không, hay là quá xa?" },
      { en: "Can you tell me which bus I should take to get downtown?", vi: "Bạn có thể cho tôi biết nên đi xe buýt nào để đến trung tâm thành phố không?" }
    ],
    mistakes: [
      { wrong: "How I can get to the station?", right: "How can I get to the station? / How do I get to the station?", note: "Trong câu hỏi Wh-, trợ động từ (can/do) phải đứng TRƯỚC chủ ngữ." },
      { wrong: "Could you tell me how to I get there?", right: "Could you tell me how to get there?", note: "Trong câu hỏi gián tiếp, trật tự từ trở về câu khẳng định, không đảo ngữ." },
      { wrong: "Do you know where is the post office?", right: "Do you know where the post office is?", note: "Câu hỏi gián tiếp giữ trật tự chủ ngữ + động từ, không đảo ngữ như câu hỏi trực tiếp." },
      { wrong: "Excuse me, is far the supermarket from here?", right: "Excuse me, is the supermarket far from here?", note: "Chủ ngữ \"the supermarket\" phải đứng ngay sau động từ \"is\", không đặt tính từ \"far\" lên trước." },
      { wrong: "Could you tell me the way for the hospital?", right: "Could you tell me the way to the hospital?", note: "Cụm cố định là \"the way to + nơi chốn\", không dùng \"for\"." },
      { wrong: "Excuse me, you know where the bank is?", right: "Excuse me, do you know where the bank is?", note: "Câu hỏi Yes/No cần trợ động từ \"do\" đứng đầu câu, không thể bỏ qua." },
      { wrong: "Which way I should go to the market?", right: "Which way should I go to the market?", note: "Câu hỏi Wh- trực tiếp cần đảo trợ động từ \"should\" lên trước chủ ngữ \"I\"." }
    ],
    tips: [
      "Câu hỏi gián tiếp (\"Could you tell me...\", \"Do you know...\") lịch sự hơn và phù hợp văn phong Speaking band cao hơn.",
      "Luôn bắt đầu bằng \"Excuse me\" khi hỏi đường người lạ để thể hiện phép lịch sự."
    ],
    comparison: {
      title: "Direct vs Indirect Questions",
      headers: ["Câu hỏi trực tiếp", "Câu hỏi gián tiếp (lịch sự hơn)"],
      rows: [["How do I get to the bank?", "Could you tell me how to get to the bank?"], ["Đảo ngữ trợ động từ + chủ ngữ", "Giữ nguyên trật tự chủ ngữ + động từ sau cụm hỏi"]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn câu hỏi đường đúng ngữ pháp nhất:", options: ["How do I get to the mall?", "How I do get to the mall?", "How get I to the mall?", "How to I get to the mall?"], answerIndex: 0, explanation: "Câu hỏi Wh- trực tiếp cần đảo trợ động từ \"do\" lên trước chủ ngữ." },
      { type: "multiple_choice", question: "Câu nào là cách hỏi đường lịch sự nhất?", options: ["Where's the bank?", "Tell me where the bank is.", "Excuse me, could you tell me where the bank is?", "Bank, where?"], answerIndex: 2, explanation: "Câu hỏi gián tiếp kèm \"Excuse me\" là cách lịch sự nhất." },
      { type: "fill_blank", question: "Điền từ còn thiếu: \"Excuse me, ___ you tell me how to get to the zoo?\"", answer: "could", explanation: "\"Could you tell me...\" là cấu trúc hỏi đường lịch sự phổ biến." },
      { type: "fill_blank", question: "Điền từ còn thiếu: \"Do you know ___ the nearest supermarket is?\"", answer: "where", explanation: "Câu hỏi gián tiếp bắt đầu bằng từ để hỏi \"where\" + S + V." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Excuse me, how I can get to the hospital?\"", answer: "Excuse me, how can I get to the hospital?", explanation: "Trợ động từ \"can\" phải đứng trước chủ ngữ \"I\" trong câu hỏi Wh- trực tiếp." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Do you know where is the train station?\"", answer: "Do you know where the train station is?", explanation: "Câu hỏi gián tiếp không đảo ngữ, giữ trật tự chủ ngữ trước động từ." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Xin lỗi, bạn có thể chỉ tôi đường đến bưu điện gần nhất không?\"", answer: "Excuse me, could you tell me the way to the nearest post office?", explanation: "Câu hỏi gián tiếp lịch sự: \"Excuse me, could you tell me the way to...\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Bạn có biết ga tàu có xa đây không?\"", answer: "Do you know if the train station is far from here?", explanation: "Câu hỏi gián tiếp dùng \"if\" khi câu gốc là câu hỏi Yes/No." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Excuse me, is this the right way to the shopping mall?\"", answer: "Xin lỗi, đây có phải là đường đúng đến trung tâm thương mại không?", explanation: "Câu hỏi xác nhận hướng đi đúng." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Would you mind showing me the way to the nearest hospital?\"", answer: "Bạn có phiền chỉ tôi đường đến bệnh viện gần nhất không?", explanation: "\"Would you mind + V-ing\" là cách hỏi lịch sự, nhờ vả nhẹ nhàng." },
      { type: "sentence_transformation", question: "Viết lại câu sau thành câu hỏi gián tiếp lịch sự hơn: \"Where is the nearest bank?\"", answer: "Could you tell me where the nearest bank is?", explanation: "Chuyển câu hỏi trực tiếp sang gián tiếp, giữ trật tự S+V sau từ hỏi \"where\"." },
      { type: "sentence_transformation", question: "Viết lại câu sau thành câu hỏi gián tiếp: \"How do I get to the airport?\"", answer: "Do you know how I get to the airport?", explanation: "Thêm \"Do you know\" và giữ nguyên trật tự chủ ngữ-động từ phía sau." },
      { type: "rewrite", question: "Viết lại câu sau cho lịch sự hơn: \"Where's the market?\"", answer: "Excuse me, could you tell me where the market is?", explanation: "Thêm \"Excuse me\" và chuyển sang câu hỏi gián tiếp để lịch sự hơn." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng ngữ pháp: \"Do you know where is the nearest pharmacy?\"", answer: "Do you know where the nearest pharmacy is?", explanation: "Câu hỏi gián tiếp không đảo ngữ; bỏ đảo \"is\" lên trước chủ ngữ." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Excuse me, could you tell me how to I get to the library?\"", answer: "Lỗi: \"how to I get\" → sửa thành \"how to get\".", explanation: "Sau \"how to\" dùng động từ nguyên mẫu, không thêm chủ ngữ \"I\"." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Do you know how far is the station from here?\"", answer: "Lỗi: \"how far is the station\" → sửa thành \"how far the station is\".", explanation: "Câu hỏi gián tiếp giữ trật tự chủ ngữ trước động từ, không đảo ngữ." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền câu hỏi lịch sự):\nA: Excuse me, ___ how to get to the nearest bank?\nB: Sure, go straight and turn left at the corner.\nA: Thank you so much!", answer: "could you tell me", explanation: "\"Could you tell me...\" là cách hỏi đường lịch sự, phổ biến với người lạ." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Excuse me, do you know ___ the museum is far from here?\nB: Not really, it's about a ten-minute walk.\nA: That's great, thanks!", answer: "if", explanation: "\"Do you know if...\" dùng khi chuyển câu hỏi Yes/No sang câu hỏi gián tiếp." }
    ],
    quiz: [
      { question: "Chọn câu hỏi đường lịch sự và đúng ngữ pháp nhất:", options: ["How I get to the museum?", "Could you tell me how to get to the museum?", "Could you tell me how do I get to the museum?", "Tell me how to get to the museum!"], answerIndex: 1, explanation: "Câu hỏi gián tiếp lịch sự, đúng trật tự từ." },
      { question: "Câu nào đúng?", options: ["Do you know where is the nearest station?", "Do you know where the nearest station is?", "Do you know where the nearest station?", "You know where is the nearest station?"], answerIndex: 1, explanation: "Trong câu hỏi gián tiếp, trật tự từ trở về câu khẳng định." },
      { question: "Chọn câu đúng:", options: ["Do you know where is the nearest pharmacy?", "Do you know where the nearest pharmacy is?", "You know where the nearest pharmacy is?", "Do you know where the nearest pharmacy?"], answerIndex: 1, explanation: "Câu hỏi gián tiếp giữ nguyên trật tự S + V." },
      { question: "Câu nào lịch sự và đúng ngữ pháp nhất khi hỏi đường?", options: ["Tell me the bank!", "Where the bank is?", "Excuse me, could you tell me where the bank is?", "Excuse me, where is bank?"], answerIndex: 2, explanation: "Bắt đầu bằng \"Excuse me\" và dùng câu hỏi gián tiếp lịch sự." },
      { question: "Chọn đáp án đúng: \"Is it ___ to walk to the station from here?\"", options: ["far", "long", "possible", "much"], answerIndex: 2, explanation: "\"Is it possible to + V\" hỏi về khả năng thực hiện." },
      { question: "Câu nào đúng?", options: ["Could you tell me the way for the airport?", "Could you tell me the way to the airport?", "Could you tell me the way of the airport?", "Could you tell me the way at the airport?"], answerIndex: 1, explanation: "Cụm cố định \"the way to + nơi chốn\"." }
    ],
    summary: "Hỏi đường lịch sự dùng câu hỏi gián tiếp (\"Could you tell me how to get to...\") — nhớ giữ nguyên trật tự chủ ngữ-động từ sau cụm hỏi."
  }),

  lesson({
    category: ASKING_GIVING, lessonKey: "giving-directions", title: "Giving Directions", icon: "🧭", orderIndex: 27,
    overview: "Cấu trúc câu mệnh lệnh (imperative) dùng để chỉ đường rõ ràng, từng bước — kỹ năng thường gặp trong Speaking Part 2 và liên quan trực tiếp đến Task 1 maps.",
    formula: [
      { label: "Câu mệnh lệnh chỉ hướng", structure: "Go/Walk/Turn + (straight on/left/right)", example: "Go straight on, then turn left at the crossroads." },
      { label: "Câu mệnh lệnh phủ định", structure: "Don't + V(bare)", example: "Don't turn right at the first junction — that leads to the highway." },
      { label: "Đưa ra mốc tham chiếu", structure: "You'll see/find + N + on your left/right", example: "You'll see a big supermarket on your right." }
    ],
    usage: [
      { title: "Chỉ đường từng bước rõ ràng bằng câu mệnh lệnh", description: "Walk past the bakery and take the first turning on the left." },
      { title: "Đưa ra điểm mốc/landmark để người nghe dễ nhận biết", description: "Keep going until you see a red-brick church — the hotel is right next to it." }
    ],
    signalWords: ["go straight on", "turn left/right", "take the first/second turning", "keep going/walking", "you'll see/find...", "it's on your left/right"],
    examples: [
      { en: "Go straight ahead for about 200 metres, then turn left onto Oak Street.", vi: "Đi thẳng khoảng 200 mét, sau đó rẽ trái vào đường Oak." },
      { en: "Don't take the motorway; instead, follow the signs for the town centre.", vi: "Đừng đi vào đường cao tốc; thay vào đó, hãy đi theo biển chỉ dẫn về trung tâm thị trấn." },
      { en: "Keep walking until you reach the square — the hotel is right there.", vi: "Cứ đi tiếp cho đến khi bạn đến quảng trường — khách sạn ở ngay đó." },
      { en: "Head down this road and you'll find the pharmacy right next to the bakery.", vi: "Đi xuống theo con đường này và bạn sẽ thấy nhà thuốc ngay cạnh tiệm bánh." },
      { en: "Cross the street at the pedestrian crossing, then go past the school.", vi: "Băng qua đường tại vạch dành cho người đi bộ, sau đó đi qua trường học." },
      { en: "Don't cross the bridge; take the path on the left instead.", vi: "Đừng băng qua cầu; hãy đi theo con đường bên trái thay vào đó." },
      { en: "Follow this road until you see a big roundabout, then take the third exit.", vi: "Đi theo con đường này cho đến khi bạn thấy một vòng xuyến lớn, sau đó rẽ vào lối ra thứ ba." },
      { en: "Walk past the park and you'll notice the library on your left.", vi: "Đi qua công viên và bạn sẽ thấy thư viện bên trái." },
      { en: "Take a left just after the traffic lights and continue for two blocks.", vi: "Rẽ trái ngay sau đèn giao thông và tiếp tục đi thêm hai dãy nhà." },
      { en: "Look out for a red postbox — the café is just behind it.", vi: "Chú ý tìm một hộp thư màu đỏ — quán cà phê ở ngay phía sau đó." },
      { en: "Stay on this road for five minutes and the hospital will appear on your right.", vi: "Cứ đi trên con đường này năm phút và bệnh viện sẽ xuất hiện bên phải bạn." }
    ],
    mistakes: [
      { wrong: "You turn left at the light.", right: "Turn left at the light.", note: "Chỉ đường dùng câu MỆNH LỆNH (bỏ chủ ngữ \"you\"), không phải câu trần thuật." },
      { wrong: "Go to straight on.", right: "Go straight on.", note: "\"Straight on\" là cụm cố định, không cần thêm \"to\" ở giữa." },
      { wrong: "Don't turning right at the crossroads.", right: "Don't turn right at the crossroads.", note: "Sau \"don't\" trong câu mệnh lệnh phủ định phải dùng động từ nguyên thể, không chia V-ing." },
      { wrong: "You'll to see the bank on your left.", right: "You'll see the bank on your left.", note: "Sau \"will\" (rút gọn 'll) dùng động từ nguyên thể, không thêm \"to\"." },
      { wrong: "Keep to walk until the corner.", right: "Keep walking until the corner.", note: "\"Keep\" đi với V-ing để diễn tả tiếp tục hành động, không dùng \"to + V\"." },
      { wrong: "Take the second turning in the right.", right: "Take the second turning on the right.", note: "Cụm cố định \"turning on the right/left\", không dùng \"in\"." },
      { wrong: "Walk past to the church.", right: "Walk past the church.", note: "\"Past\" đã mang nghĩa \"qua\", là giới từ đi thẳng với danh từ, không cần thêm \"to\"." }
    ],
    tips: [
      "Luôn kết hợp câu mệnh lệnh với mốc tham chiếu cụ thể (landmark) để chỉ đường tự nhiên và dễ hiểu hơn.",
      "Trong Speaking, dùng thêm \"you'll see/notice\" để câu chỉ đường mềm mại, tự nhiên hơn là liệt kê mệnh lệnh liên tục."
    ],
    comparison: {
      title: "Giving Directions vs Asking for Directions",
      headers: ["Giving Directions", "Asking for Directions"],
      rows: [["Câu mệnh lệnh, chủ động chỉ dẫn", "Câu hỏi, thường ở dạng gián tiếp lịch sự"], ["Turn left at the corner.", "Could you tell me how to get there?"]]
    },
    exercises: [
      { type: "multiple_choice", question: "Chọn câu mệnh lệnh chỉ đường đúng:", options: ["You should turn right.", "Turn right.", "Turning right.", "Turned right."], answerIndex: 1, explanation: "Chỉ đường trực tiếp dùng câu mệnh lệnh, bỏ chủ ngữ, động từ nguyên thể." },
      { type: "multiple_choice", question: "Câu nào đúng khi đưa ra mốc tham chiếu?", options: ["You'll find the shop on your left.", "You'll find the shop in your left.", "You'll finding the shop on your left.", "You find the shop on your left will."], answerIndex: 0, explanation: "\"You'll find + N + on your left/right\" là cấu trúc chuẩn." },
      { type: "fill_blank", question: "Điền từ thích hợp: \"___ straight on until the end of the road.\"", answer: "Go", explanation: "Câu mệnh lệnh bắt đầu bằng động từ nguyên thể \"Go\"." },
      { type: "fill_blank", question: "Điền từ thích hợp: \"Don't ___ right at the first junction.\"", answer: "turn", explanation: "Sau \"Don't\" dùng động từ nguyên thể." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"You take the first turning on the left.\"", answer: "Take the first turning on the left.", explanation: "Chỉ đường dùng câu mệnh lệnh, bỏ chủ ngữ \"you\"." },
      { type: "error_correction", question: "Sửa lỗi trong câu: \"Don't takes the elevator; use the stairs instead.\"", answer: "Don't take the elevator; use the stairs instead.", explanation: "Sau \"don't\" dùng động từ nguyên thể \"take\", không chia \"-s\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Đi thẳng qua ngã tư rồi rẽ phải vào đường Nguyễn Huệ.\"", answer: "Go straight through the crossroads, then turn right onto Nguyen Hue Street.", explanation: "Câu mệnh lệnh chỉ đường nối tiếp bằng \"then\"." },
      { type: "translation_vn_en", question: "Dịch sang tiếng Anh: \"Đừng rẽ trái ở đèn giao thông; hãy đi thẳng thay vào đó.\"", answer: "Don't turn left at the traffic lights; go straight on instead.", explanation: "Câu mệnh lệnh phủ định \"Don't + V\" kết hợp gợi ý thay thế bằng \"instead\"." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Keep going straight and you'll see a red-brick building on your right.\"", answer: "Cứ đi thẳng và bạn sẽ thấy một tòa nhà gạch đỏ bên phải.", explanation: "\"Keep going\" = cứ tiếp tục đi; mốc tham chiếu giúp người nghe dễ nhận biết." },
      { type: "translation_en_vn", question: "Dịch sang tiếng Việt: \"Take the path next to the fountain and the exit is just ahead.\"", answer: "Đi theo con đường cạnh đài phun nước và lối ra ở ngay phía trước.", explanation: "\"Take the path\" = đi theo con đường/lối đi." },
      { type: "sentence_transformation", question: "Viết lại câu sau thành câu mệnh lệnh chỉ đường: \"You should go straight and then turn left.\"", answer: "Go straight, then turn left.", explanation: "Bỏ chủ ngữ \"you should\" và chuyển sang động từ mệnh lệnh trực tiếp." },
      { type: "sentence_transformation", question: "Viết lại câu sau thành câu mệnh lệnh phủ định: \"You shouldn't go this way; it's a dead end.\"", answer: "Don't go this way; it's a dead end.", explanation: "Câu mệnh lệnh phủ định: Don't + V(bare)." },
      { type: "rewrite", question: "Viết lại câu sau cho tự nhiên hơn: \"The bank you will see on your right.\"", answer: "You'll see the bank on your right.", explanation: "Trật tự chuẩn: S + will + V + O + on your right, không đảo tân ngữ lên đầu." },
      { type: "rewrite", question: "Viết lại câu sau cho đúng: \"Keep to walking straight until the square.\"", answer: "Keep walking straight until the square.", explanation: "\"Keep\" đi với V-ing, không thêm \"to\" ở giữa." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"Don't crossing the road here; it's dangerous.\"", answer: "Lỗi: \"crossing\" → sửa thành \"cross\".", explanation: "Sau \"Don't\" cần động từ nguyên thể, không chia V-ing." },
      { type: "find_mistake", question: "Tìm lỗi sai trong câu: \"You'll finding a small shop on your left after the bridge.\"", answer: "Lỗi: \"finding\" → sửa thành \"find\".", explanation: "Sau \"will/'ll\" dùng động từ nguyên thể, không chia V-ing." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại (điền động từ mệnh lệnh đúng):\nA: How do I get to the pharmacy?\nB: ___ straight on, then take the first turning on the right.\nA: Thanks a lot!", answer: "Go", explanation: "Câu mệnh lệnh chỉ đường bắt đầu bằng động từ nguyên thể \"Go\"." },
      { type: "mini_dialogue", question: "Hoàn thành đoạn hội thoại:\nA: Is the hotel far from here?\nB: Not at all. Just keep walking and you'll ___ it on your left after the bank.\nA: Perfect, thank you!", answer: "see", explanation: "Sau \"you'll\" (you will) dùng động từ nguyên thể \"see\"." }
    ],
    quiz: [
      { question: "Chọn câu chỉ đường đúng ngữ pháp:", options: ["You should turn left at the bank.", "Turn left at the bank.", "Turning left at the bank.", "Left turn at the bank."], answerIndex: 1, explanation: "Chỉ đường dùng câu mệnh lệnh trực tiếp, ngắn gọn." },
      { question: "Câu nào tự nhiên nhất để kết thúc chỉ dẫn?", options: ["The hotel there.", "The hotel is being there.", "You'll see the hotel on your right.", "The hotel on your right is."], answerIndex: 2, explanation: "\"You'll see... on your right\" là cách diễn đạt tự nhiên khi kết thúc chỉ đường." },
      { question: "Chọn câu chỉ đường phủ định đúng:", options: ["Don't takes the motorway.", "Don't take the motorway.", "Not take the motorway.", "Don't to take the motorway."], answerIndex: 1, explanation: "Câu mệnh lệnh phủ định: Don't + V(bare)." },
      { question: "Câu nào đúng?", options: ["You'll to see the hotel on your left.", "You'll see the hotel on your left.", "You'll seeing the hotel on your left.", "You'll saw the hotel on your left."], answerIndex: 1, explanation: "Sau \"will/'ll\" dùng động từ nguyên thể, không thêm \"to\"." },
      { question: "Chọn đáp án đúng: \"___ walking until you reach the roundabout.\"", options: ["Keep", "Keep to", "Keeps", "Kept"], answerIndex: 0, explanation: "\"Keep + V-ing\" diễn tả tiếp tục một hành động." },
      { question: "Câu nào tự nhiên nhất khi đưa ra mốc tham chiếu?", options: ["The church, you'll see, on the right.", "You'll see the church on your right.", "On your right the church you see.", "You see will the church on right."], answerIndex: 1, explanation: "Trật tự câu chuẩn: S + will + V + O + on your right/left." }
    ],
    summary: "Chỉ đường dùng câu mệnh lệnh (Turn, Go straight, Take the turning) kết hợp mốc tham chiếu và cụm \"on your left/right\"."
  })
];
