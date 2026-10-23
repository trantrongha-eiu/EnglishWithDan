// Vol 7 – Test 6 (PDF "Listening/Test 1-10/Test 6.pdf", text layer; key p2 of "Key Lis VOL 7 (T1-T10).pdf"; audio = whole test
// "VOL 7 TEST 6.mp4", which plays Part 1 once more after the end of the test). P1 = bank "The London Relocation Services"
// (Vol 5 - Test 7 P1: same recording, 6-gram 0.56, key 10/10) → reused.
// Source errors: P2's narration introduces another test's Part 2 ("an official talking to … volunteering … the beach races")
// before the Hollies supermarket talk → the part starts at "First, you have some time…" (+9.3 s). The paper prints Q27–28
// option A as "their standard length how recent the genre is" (two options on one line) → A = their standard length (key
// A: "how fixed the number of pages is… strictly limited to 32 pages"), "how recent the genre is" kept as F.
// Debug 2026-10-16: P2 first ended at 779 s with P3's narration ("You will hear two early childhood…", 769.3 s) → P2/P3
// boundary 769.3 (reclip_section_audio.js, full-test audio rejoined).
// Transcript: the vol's .docx checked against Whisper turbo; the docx puts P3's first two lines at the end of P2 → moved.
// Turbo drops P4's last passage (documentation / pollution, Q39–40) and invents "well it a day"; heard by wb probe: docx right.
const { note, mc, map, matching, multi } = require('../vol_build');
const A = 'Listening/Test 1-10/VOL 7 Audio (T1-T10)/VOL 7 TEST 6.mp4';

module.exports = {
  vol: 7, test: 6, docx: 'Listening/Test 1-10/Transcript VOL 7 (T1-T10)/transcript vol 7 test 6.docx',
  sections: [
    { part: 1, reuse: '6ac77c13c00e3ae23ccffe1f', title: 'The London Relocation Services' },
    {
      part: 2, title: 'Starting Work at Hollies Supermarket', audio: A, clip: [373.3, 769.3], cover: 'supermarket staff stocking shelves | supermarket aisles employees',
      cut: [['Hi, are you ready', 'Yeah, sure.']],
      fix: [["Welcome to Holly's Supermarket.", 'Welcome to Hollies Supermarket.']],
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nStarting work at Hollies supermarket', [
          [11, 'The supervisor starts her talk by explaining that employees have to', ['be aware of the importance of teamwork.', 'be flexible in terms of their availability.', 'be capable of lifting heavy loads.'], 'B'],
          [12, 'The supervisor says that when the supermarket is very busy, employees must', ['decide for themselves what needs doing.', 'postpone their scheduled break.', 'report minor accidents quickly.'], 'A'],
          [13, 'The supervisor explains that when employees have a positive attitude, it', ['helps everyone in the supermarket to relax.', 'encourages customers to spend more.', 'improves work effectiveness.'], 'C'],
          [14, 'The supervisor says it is essential to stay calm when a customer', ['reports an employee to the manager.', 'delays other shoppers.', 'refuses to wait their turn.'], 'B'],
        ], 'Questions 11-14'),
        map('Label the plan below.\nChoose the correct letter, A-J, next to Questions 15-20.', [
          [15, 'Staff entrance', 'A'],
          [16, "Manager's office", 'D'],
          [17, 'Storage and unpacking', 'B'],
          [18, 'Kitchen', 'E'],
          [19, 'Cleaning equipment', 'G'],
          [20, 'Staff relaxation area', 'C'],
        ], { pdf: 'Listening/Test 1-10/Test 6.pdf', page: 3, box: [88, 125, 324, 382] }, 'Questions 15-20 – Hollies supermarket'),
      ],
      expl: {
        11: { v: 'Đầu bài nói của người giám sát.', t: "Well, we're open Monday through Sunday, so you'll need to be able to work weekends as well as irregular weekday shifts.", p: 'Chỉ bê đồ khi hàng nhẹ (bẫy C); phải làm được cuối tuần và ca không cố định → linh hoạt về thời gian → B' },
        12: { v: 'Khi nói lúc siêu thị đông khách.', t: ["When the store is very busy, you'll also have to assess changing priorities.", 'No need to check with a manager first.'], p: 'Tự đánh giá việc ưu tiên, không cần hỏi quản lý → tự quyết định việc cần làm → A' },
        13: { v: 'Khi nói về thái độ tích cực.', t: ['It forces you to stay positive and being generally upbeat makes your whole team happy too.', 'This increases efficiency and gives a good impression to customers.'], p: 'Thái độ tích cực làm tăng hiệu quả công việc → C' },
        14: { v: 'Khi nói về việc giữ bình tĩnh.', t: ['Occasionally, when working tills, you\'ll find yourself waiting for someone to extract their wallet from the bottom of a cluttered bag, while a long queue of annoyed customers builds up.', 'You have to make sure, however hard it might be, that you remain composed.'], p: 'Khách lục ví lâu khiến hàng người phía sau phải chờ → làm chậm những khách khác → B' },
        15: { v: 'Khi nói lối vào cho nhân viên.', t: "but in future, you'll enter through the door in the top left-hand corner of the diagram.", p: 'Cửa ở góc trên bên trái → A' },
        16: { v: 'Khi nói văn phòng quản lý.', t: ["However, it's recently been moved and is now the circular space marked on the right of your plans."], p: 'Trước đây cạnh quầy báo (bẫy); nay là ô hình tròn bên phải → D' },
        17: { v: 'Khi nói khu kho và dỡ hàng.', t: 'This is represented by the largest of the four rectangles in the top section of the plan.', p: 'Hình chữ nhật lớn nhất trong bốn hình ở phần trên → B' },
        18: { v: 'Khi nói nhà bếp.', t: "On the plan, it's shown by the triangular shape to the left of the tinned goods aisle.", p: 'Hình tam giác bên trái dãy đồ hộp, cạnh quán cà phê → E' },
        19: { v: 'Khi nói tủ đồ vệ sinh.', t: "It's the smaller of the two squares marked near the vegetable and fruit section, and can come in very handy.", p: 'Ô vuông nhỏ hơn trong hai ô gần khu rau quả → G' },
        20: { v: 'Khi nói khu nghỉ của nhân viên.', t: 'This is at the top of your plan, between the frozen goods section and the exit.', p: 'Ở trên cùng, giữa khu đồ đông lạnh và lối ra → C' },
      },
    },
    {
      part: 3, title: 'Teachers Reading Picture Books with Children', audio: A, clip: [769.3, 1129.5], cover: 'children picture books reading | teacher reading to young children',
      fix: [['So, what are we going to say', 'Hi, are you ready to discuss our presentation? Yeah, sure. So, what are we going to say'], ['Like, I spy friends.', 'Like, I Spy Friends.'], ['about the boat party.', 'about The Boat Party.']],
      turns: [
        // Debug 2026-10-23: turns re-done by voice (WeSpeaker embeddings, label-free 2-way split; the old content-based turns matched
        // the voices no better than chance). Voice B is the man (a third of its pitch frames < 140 Hz, like the other men), A the woman.
        // The recording does not always follow conversational logic (e.g. the woman says both "Yes, one thing that shocked me…" and
        // "Yes, that was unexpected for me as well.") — labelled as heard. Weak-margin lines kept by content.
        ['Man', 'Hi, are you ready'], ['Woman', 'Yeah, sure.'], ['Man', 'Right.'], ['Woman', 'Yeah.'],
        ['Man', "And they're all doing"], ['Woman', 'Yes.'], ['Man', 'I love the way'], ['Woman', 'Me too.'],
        ['Man', "It's still relevant."], ['Woman', 'I really liked what'], ['Man', "That's true."], ['Woman', "Oh, that's good to know."],
        ['Man', 'Yes.'], ['Woman', 'It sounds like an innocent'], ['Man', 'Teachers like to use this'], ['Woman', "Because it's so different"],
        ['Man', 'A good choice.'], ['Woman', 'This one uses a lot'], ['Man', 'I think they should be just'], ['Woman', "I think that's interesting."],
        ['Man', 'Me neither.'], ['Woman', "Now let's think about other"], ['Man', 'Okay, well, a lot of them'], ['Woman', 'For me, the main thing'],
        ['Man', "Why don't we also discuss"], ['Woman', "Yes, it's probably different"], ['Man', 'It sounds interesting, but'],
      ],
      groups: [
        matching('What reason do the speakers give for teachers using each of the following picture books with children?\nChoose SIX answers from the box and write the correct letter, A-I, next to Questions 21-26.',
          ['The pictures show changing times of day.', 'The words are fun to say out loud.', 'It has an uncommon plot structure.', 'The text can easily be turned into song.', 'The pictures were done by a famous illustrator.', 'There is a surprise at the end of the story.', 'The pictures are simple line drawings.', 'It was published very recently.', 'It features well-known characters.'], [
            [21, 'Spy Friends', 'I'],
            [22, 'Goodnight Little Rabbit', 'A'],
            [23, 'The Boat Party', 'E'],
            [24, 'Puppy and Friends', 'F'],
            [25, 'Hats and Socks', 'C'],
            [26, 'A Family Adventure', 'D'],
          ], { title: 'Reasons', groupTitle: 'Questions 21-26' }),
        multi('Choose TWO letters, A-F.', 27, "Which TWO points from Smith's article about picture books did both speakers find surprising?", ['their standard length', 'the argument that they are not literature', 'the lack of research about this age group', 'the popularity of books from overseas', 'the variety of versions', 'how recent the genre is'], ['A', 'B'], 'Questions 27-28'),
        multi('Choose TWO letters, A-E.', 29, 'Which TWO aspects of picture books do the speakers agree to talk about in their presentation?', ['the material they are made from', 'common characters in them', 'the variety of roles in them', 'cultural elements in them', 'the future of the genre'], ['A', 'D'], 'Questions 29-30'),
      ],
      expl: {
        21: { v: 'Khi nói về I Spy Friends.', t: ['The children like to find the familiar faces from the fairy tales they know so well.', 'The article said children find this familiarity very comforting.'], p: 'Trẻ tìm những gương mặt quen thuộc trong truyện cổ tích → nhân vật nổi tiếng → I' },
        22: { v: 'Khi nói về Goodnight Little Rabbit.', t: ['I love the way the colours get darker as the book progresses, indicating how evening turns into night.', "The article said that's why teachers like it."], p: 'Sách ra đời hơn 60 năm (bẫy H); màu tối dần cho thấy chiều chuyển sang đêm → thời điểm trong ngày thay đổi → A' },
        23: { v: 'Khi nói về The Boat Party.', t: ["But apparently it's the images that make it popular with children.", 'The artist is really well known, and children often ask for her books.'], p: 'Lặp từ tốt cho từ vựng chỉ là ý của người nói (bẫy B); tranh của một hoạ sĩ nổi tiếng → E' },
        24: { v: 'Khi nói về Puppy and Friends.', t: "It sounds like an innocent title, but the article warns that there's a bit of a fright, you know, the one on the last page when the puppy suddenly encounters the scary cat.", p: 'Trang cuối có cảnh giật mình khi chú chó gặp con mèo → bất ngờ ở cuối truyện → F' },
        25: { v: 'Khi nói về Hats and Socks.', t: ["It doesn't really have a beginning and an end, does it?", "That's why teachers like this one, though."], p: 'Không có mở đầu và kết thúc rõ ràng → cốt truyện khác thường → C' },
        26: { v: 'Khi nói về A Family Adventure.', t: ['Teachers say it has a really poetic feel to it.', 'They often sing it to a simple tune.'], p: 'Tranh màu nước là chi tiết thêm (bẫy); giáo viên thường hát lời truyện theo giai điệu đơn giản → D' },
        27: { v: 'Khi bàn bài viết của Smith.', t: ['What I didn\'t realise is how fixed the number of pages is.', 'Me neither.', "I wasn't expecting that they're so strictly limited to 32 pages."], p: 'Cả hai đều không ngờ sách tranh bị giới hạn đúng 32 trang → độ dài tiêu chuẩn → A' },
        28: { v: 'Ngay trước đó.', t: ["Yes, one thing that shocked me was that some people don't consider picture books as proper writing because they don't have enough words in them.", 'Yes, that was unexpected for me as well.'], p: 'Thể loại mới xuất hiện gần đây và nhiều nghiên cứu là điều đã biết (bẫy F, C); cả hai bất ngờ vì có người cho sách tranh không phải văn học → B' },
        29: { v: 'Khi chọn nội dung cho bài thuyết trình.', t: ['For me, the main thing is that they are mostly printed as board books.', 'The cardboard material makes it easy for young children to turn their pages.', 'I agree.'], p: 'Nhân vật thì không cần nói tới (bẫy B, C); cả hai đồng ý nói về chất liệu bìa cứng → A' },
        30: { v: 'Ngay sau đó.', t: ["Why don't we also discuss how culture is important in picture books, like the importance of respecting the elderly?", "Yes, it's probably different all over the world."], p: 'Tương lai của thể loại thì không có tài liệu nên bỏ (bẫy E); yếu tố văn hoá được đồng ý đưa vào → D' },
      },
    },
    {
      part: 4, title: 'Geography 331 Field Trip to Northern Quebec', audio: A, clip: [1129.5, 1563], cover: 'taiga forest northern quebec | james bay road canada wilderness',
      fix: [['to the Trans-Taga Road', 'to the Trans-Taiga Road']],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Geography 331 Field Trip', [
          '<strong>The James Bay Road</strong>',
          '• At the starting point of the road, everyone must stop for __Q31__.',
          '• For safety reasons, there are __Q32__ on the highway.',
          '<strong>Radisson Research Centre</strong>',
          "• The Centre works with other institutes to research the region's __Q33__.",
          '• Security is the responsibility of Hydro-Québec.',
          '• Lectures will discuss the effect of __Q34__ on the land.',
          '• Outpost stations gather and publish research related to variations in the __Q35__.',
          '<strong>The Trans-Taiga Road</strong>',
          '• The road is unpaved.',
          '• Breakdowns are serious as car __Q36__ are expensive.',
          '• At hydro stations, engineers will discuss hydro production and the impact of rainfall.',
          '<strong>The Taiga</strong>',
          '• There are not many types of __Q37__, but a good range of wildlife.',
          '• The area known as muskeg is dangerous as it has hidden __Q38__.',
          '• Photographs of birds should be taken for future __Q39__.',
          '• Water samples will be checked for __Q40__.',
        ], { 31: 'registration', 32: 'telephones/phones', 33: 'ecology', 34: 'insects', 35: 'climate', 36: 'repairs', 37: 'plant/plants', 38: 'pools', 39: 'documentation', 40: 'pollution' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói về văn phòng ở đầu đường James Bay.', t: ['Where the highway begins, there is a roadside office where you must stop.', 'The road is remote, so your registration is very important in case of an emergency.'], p: 'Phải dừng ở văn phòng để đăng ký phòng khi khẩn cấp → registration' },
        32: { v: 'Khi nói về an toàn trên đường.', t: 'For additional safety, at different places along the highway, telephones have been installed which connect with staff in the office.', p: 'Lắp điện thoại dọc đường cao tốc → telephones' },
        33: { v: 'Khi giới thiệu Trung tâm nghiên cứu Radisson.', t: 'You will stay at Radisson Research Centre, which works with various universities and Hydro-Québec to carry out studies into the ecology of the region.', p: 'Cùng các trường đại học nghiên cứu sinh thái của vùng → ecology' },
        34: { v: 'Khi nói nội dung các buổi giảng.', t: 'You will hear that they have paid particular attention to any disturbance to the land caused by insects.', p: 'Tác động của côn trùng lên đất → insects' },
        35: { v: 'Khi nói về các trạm tiền tiêu.', t: 'you will be able to observe how data on the varying patterns of the climate is collected and published for scientific research.', p: 'Thu thập và công bố dữ liệu về biến đổi khí hậu → climate' },
        36: { v: 'Khi nói về đường Trans-Taiga.', t: ['Hydro-Québec cautions that driving over rocks on the rough road may cause severe damage to the car.', 'Any breakdown is serious, as repairs are costly.'], p: 'Hỏng xe nghiêm trọng vì sửa chữa rất tốn kém → repairs' },
        37: { v: 'Khi nói về rừng taiga.', t: 'You will find the region is relatively poor in the number of plant species, yet there is a great variety of wildlife that can be seen.', p: 'Ít loài thực vật nhưng nhiều động vật hoang dã → plant' },
        38: { v: 'Khi nói về vùng muskeg.', t: 'It is not safe to walk on it, as it has pools that are not easily seen, so keep to the rocks.', p: 'Có những vũng nước khó nhìn thấy → pools' },
        39: { v: 'Khi nói về việc chụp ảnh chim.', t: ['so keep your waterproof digital cameras handy so you can take plenty of pictures.', 'Then we will have documentation of the existing waterfowl, as some are becoming extinct.'], p: 'Ảnh chụp dùng để lưu tư liệu về các loài chim nước → documentation' },
        40: { v: 'Khi nói về mẫu nước.', t: 'It needs to be monitored for pollution that may be caused by rainfall coming from the south.', p: 'Mẫu nước được kiểm tra ô nhiễm do mưa từ phía nam → pollution' },
      },
    },
  ],
};
