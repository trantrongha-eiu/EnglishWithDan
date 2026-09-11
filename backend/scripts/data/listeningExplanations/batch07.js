'use strict';

// NOTE: two sections in this batch have real, pre-existing data problems
// (found while writing explanations, not introduced here) — see the chat
// report. Both are deliberately left INCOMPLETE here rather than papered
// over with a fabricated explanation:
//   - "Planning a party" (6a43ec06e56e021a6ea684d8): transcript is
//     truncated — it stops right after Q4 mid-conversation. Q5-Q10 have
//     nothing in the transcript to cite, so only Q1-Q4 are done.
//   - "Aims of the geography lesson" (6a43fbfbe56e021a6ea6b49f): Q28 does
//     not exist in the document at all (questionRange says 21-30 but the
//     actual questions jump 27 -> 29 -> 30 -> 31); Q23's stored
//     correctAnswer ("D" = "the teacher coordination") contradicts what the
//     transcript actually supports (Dean/Hannah explicitly say they
//     coordinated well as a team — the problem they identify is student
//     grouping, "B"). Q23 and Q24 are skipped pending a correctAnswer
//     review; do not just invent a justification for the stored answer.

module.exports = [
  {
    sectionId: '6a43ec06e56e021a6ea684d8',
    title: 'Planning a party',
    explanations: [
      { questionNumber: 1, explanation: 'Vị trí: Đầu hội thoại, khi bàn về số khách mời.\n\nTranscript: "let\'s say eighty, in case everyone wants to come."\n\nPhân tích: Số khách chốt lại là 80 người (để dự phòng khách ở xa) → đáp án 80/eighty.' },
      { questionNumber: 2, explanation: 'Vị trí: Ngay sau đó, khi đổi ngày tổ chức.\n\nTranscript: "Would the 26th of September work for you? — No problem. That date\'s still open."\n\nPhân tích: Ngày mới được chốt là 26 tháng 9 → đáp án 26th September.' },
      { questionNumber: 3, explanation: 'Vị trí: Khi bàn về phòng tổ chức.\n\nTranscript: "And the King Room, right? — Actually, we recently renovated that room... Shall I book it for you? — Sure."\n\nPhân tích: Phòng được chọn là King Room → đáp án King.' },
      { questionNumber: 4, explanation: 'Vị trí: Cuối đoạn, khi bàn về nhạc.\n\nTranscript: "We can arrange for a group to play jazz, or one to play the latest pop. — my wife is a jazz fan, so let\'s book that."\n\nPhân tích: Nhạc được chọn là jazz vì vợ anh thích jazz → đáp án jazz.' },
    ],
  },
  {
    sectionId: '6a43f4c0e56e021a6ea69d46',
    title: 'Horse riding for disabled people',
    explanations: [
      { questionNumber: 11, explanation: 'Vị trí: Đầu bài.\n\nTranscript: "I always have the very best intentions of starting the day at 5.30... but reality intervenes and I finally wake at about 6.30."\n\nPhân tích: Joan thường dậy lúc 6:30, không phải 5:30 như dự định → đáp án B.' },
      { questionNumber: 12, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "Once I\'ve managed to get him safely on his way at about 7.00am, I can start turning my attention to the other important tasks."\n\nPhân tích: Việc đầu tiên trong ngày là lo cho con trai (làm nông) ra khỏi nhà an toàn → đáp án B.' },
      { questionNumber: 13, explanation: 'Vị trí: Đoạn nói về số liệu RDA.\n\nTranscript: "The number of helpers who have volunteered is actually 40."\n\nPhân tích: Tổng số tình nguyện viên đăng ký là 40 → đáp án forty/40.' },
      { questionNumber: 14, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "but we can rely on 25 to come regularly to help in the different groups."\n\nPhân tích: Trong số đó chỉ 25 người thường xuyên tới giúp → đáp án twenty-five/25.' },
      { questionNumber: 15, explanation: 'Vị trí: Đoạn Joan tự đánh giá công việc.\n\nTranscript: "I don\'t have major problems with all the letter writing and correspondence which it entails."\n\nPhân tích: Joan không phiền với việc thư từ (không thích cũng không ghét) → đáp án B.' },
      { questionNumber: 16, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "like lots of shy people, I find the fundraising horrendous."\n\nPhân tích: Joan rất ghét việc gây quỹ (horrendous) → đáp án C.' },
      { questionNumber: 17, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "ringing round the riders to fix times, etc., is one of the pleasantest aspects of the work."\n\nPhân tích: Gọi điện cho người cưỡi ngựa là việc cô thích nhất → đáp án A.' },
      { questionNumber: 18, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "My working day ends with the least enjoyable job of all, sorting the accounts."\n\nPhân tích: Sắp xếp sổ sách là việc cô ghét nhất → đáp án C.' },
      { questionNumber: 19, explanation: 'Vị trí: Gần cuối bài, khi Joan nói RDA cần cải thiện gì.\n\nTranscript: "I wish... our helpers and the organisers in the various centres could really rationalise the fundraising efforts, which sometimes are very inefficient."\n\nPhân tích: Cần làm cho việc gây quỹ hiệu quả hơn (making fund-raising more effective) → đáp án B.' },
      { questionNumber: 20, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "it also saddens me how unaware some of the stables can be about the difficulties faced by people who are disabled."\n\nPhân tích: Cần nâng cao nhận thức về khó khăn của người khuyết tật (recognising difficulties of disabled riders) → đáp án E.' },
    ],
  },
  {
    sectionId: '6a43fbfbe56e021a6ea6b49f',
    title: 'Aims of the geography lesson',
    explanations: [
      { questionNumber: 21, explanation: 'Vị trí: Đầu hội thoại, khi bàn về mục tiêu bài học.\n\nTranscript: "getting the class to think about how people in different parts of the world are connected to each other through the things they buy and sell."\n\nPhân tích: Mục tiêu liên quan tới sự phụ thuộc lẫn nhau toàn cầu (global interdependency) → đáp án A.' },
      { questionNumber: 22, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "we also wanted to get the class thinking about how things are moved around the world in different ways, from the farms and the mines to the factories and then the stores."\n\nPhân tích: Mục tiêu còn lại liên quan tới hệ thống vận chuyển (transport systems) → đáp án D.' },
      { questionNumber: 25, explanation: 'Vị trí: Khi Hannah tóm tắt lại trình tự bài học.\n\nTranscript: "we talked about which countries produce most of these materials... mark the location of those on a map of the world."\n\nPhân tích: Bước đầu tiên là xác định vị trí các nước sản xuất (producers) hàng đầu trên bản đồ → đáp án producers.' },
      { questionNumber: 26, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "we brainstormed all the different ways of getting goods from one place to another, and what the advantages and disadvantages of each one would be."\n\nPhân tích: Học sinh thảo luận ưu nhược điểm của các phương thức vận chuyển (methods of transport) → đáp án methods transport.' },
      { questionNumber: 27, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "each group represented each of the countries on the map... to decide an itinerary for sending their raw materials to the USA, specifying the different ports and places on the way there."\n\nPhân tích: Học sinh xác định tuyến đường xuất khẩu (export routes) sang Mỹ → đáp án export routes.' },
      { questionNumber: 29, explanation: 'Vị trí: Sau giờ giải lao.\n\nTranscript: "they had to imagine they were pencil manufacturers in Chicago and fill in details on a worksheet about how they\'d dispatch their pencils to different parts of the country."\n\nPhân tích: Học sinh hoàn thành một phiếu bài tập (worksheet) về phân phối bút chì → đáp án worksheet.' },
      { questionNumber: 30, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "a class discussion about whether people will still be using pencils in 2050, and whether the design of pencils is likely to change."\n\nPhân tích: Học sinh thảo luận về tương lai (future) của bút chì → đáp án future.' },
      { questionNumber: 31, explanation: 'Vị trí: Cuối bài.\n\nTranscript: "the kids had to spend 10 minutes planning a short presentation for another class about possible developments."\n\nPhân tích: Học sinh chuẩn bị một bài thuyết trình ngắn (a talk) → đáp án talk.' },
    ],
  },
  {
    sectionId: '6a4685f363c0ce96f89a50d8',
    title: 'The world’s oldest mechanical computer: the Antikythera mechanism',
    explanations: [
      { questionNumber: 31, explanation: 'Vị trí: Đầu bài, khi kể về việc phát hiện.\n\nTranscript: "It was in the cargo of a ship that sank about 2,100 years ago."\n\nPhân tích: Thiết bị là một phần hàng hóa (cargo) trên con tàu đắm → đáp án cargo.' },
      { questionNumber: 32, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "One item was assumed to be a lump of rock."\n\nPhân tích: Ban đầu nó bị nhầm là một tảng đá (rock) → đáp án rock.' },
      { questionNumber: 33, explanation: 'Vị trí: Đoạn nói về máy "Dome".\n\nTranscript: "This has made far more of the inscriptions on the mechanism legible, even though they\'re faded and worn."\n\nPhân tích: Máy Dome giúp các dòng khắc (inscriptions) rõ hơn → đáp án inscription.' },
      { questionNumber: 34, explanation: 'Vị trí: Đoạn nói về máy "BladeRunner".\n\nTranscript: "The BladeRunner was originally designed to examine engines for cracks."\n\nPhân tích: Máy này ban đầu dùng để tìm vết nứt (cracks) trong động cơ → đáp án cracks.' },
      { questionNumber: 35, explanation: 'Vị trí: Đoạn mô tả cấu tạo thiết bị.\n\nTranscript: "It consisted of at least 30 metal gear wheels."\n\nPhân tích: Có ít nhất 30 bánh răng làm bằng kim loại (metal) → đáp án metal.' },
      { questionNumber: 36, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "The mechanism is thought to have been mounted in a frame for which wood was used."\n\nPhân tích: Khung của thiết bị được cho là làm bằng gỗ (wood) → đáp án wood.' },
      { questionNumber: 37, explanation: 'Vị trí: Đoạn nói về cách sử dụng.\n\nTranscript: "The person using the device simply rotated a handle to operate the gear wheels."\n\nPhân tích: Người dùng xoay một tay cầm (handle) để vận hành → đáp án handle.' },
      { questionNumber: 38, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "Perhaps most astonishing of all, the mechanism also showed when an eclipse was going to take place."\n\nPhân tích: Thiết bị có thể dự đoán nhật/nguyệt thực (eclipse) → đáp án eclipse.' },
      { questionNumber: 39, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "The mechanism probably also helped in planning the timing of festivals... by acting as a kind of calendar of events."\n\nPhân tích: Thiết bị có thể đóng vai trò như một cuốn lịch (calendar) để lên kế hoạch lễ hội → đáp án calendar.' },
      { questionNumber: 40, explanation: 'Vị trí: Cuối bài.\n\nTranscript: "a large number of clocks were made, providing astronomical information as well as showing the time of day."\n\nPhân tích: Công nghệ tương tự sau này được dùng để chế tạo đồng hồ (clocks) ở Tây Âu → đáp án clocks.' },
    ],
  },
];
