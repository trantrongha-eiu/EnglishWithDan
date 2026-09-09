// scripts/data/task2RearrangeVi.js
//
// Vietnamese translation of every "Sắp xếp từ" (rearrange) target sentence
// in the weekly Task 2 practice, keyed by the exact English `correctAnswer`.
// task2-practice.html shows this above the word chips so the student knows
// which sentence they're assembling — same idea as the keyword row and the
// promptVi on the WT1 course sentence drills.
//
// Consumed by:
//   • seedTask2Exercises.js  — attaches q.promptVi when building `topics`
//   • addTask2RearrangeVi.js — one-off $set onto existing prod docs (no
//                              destructive full re-seed needed)
'use strict';

module.exports = {
  'One of the most significant advantages of online learning is its flexibility.':
    'Một trong những lợi ích đáng kể nhất của học trực tuyến là tính linh hoạt của nó.',
  'Whilst smartphones have many advantages, they also have serious drawbacks.':
    'Mặc dù điện thoại thông minh có nhiều ưu điểm, chúng cũng có những nhược điểm nghiêm trọng.',
  'Inaccurate readings from cheap devices can mislead users about their health.':
    'Kết quả đo không chính xác từ các thiết bị giá rẻ có thể khiến người dùng hiểu sai về sức khỏe của mình.',
  "High dropout rates can have a negative impact on a country's workforce.":
    'Tỷ lệ bỏ học cao có thể tác động tiêu cực đến lực lượng lao động của một quốc gia.',
  'Declining STEM enrolments contribute to a widening skills gap in the economy.':
    'Số lượng sinh viên đăng ký các ngành STEM giảm góp phần làm gia tăng khoảng cách kỹ năng trong nền kinh tế.',
  'As a result of the lack of peer interaction, many students feel isolated and lose motivation.':
    'Do thiếu sự tương tác với bạn bè, nhiều học sinh cảm thấy bị cô lập và mất động lực.',
  'Companies could reduce employee stress by promoting workplace wellness programmes.':
    'Các công ty có thể giảm căng thẳng cho nhân viên bằng cách đẩy mạnh các chương trình chăm sóc sức khỏe tại nơi làm việc.',
  'Cities could encourage outdoor activity by building more public green spaces.':
    'Các thành phố có thể khuyến khích hoạt động ngoài trời bằng cách xây dựng thêm nhiều không gian xanh công cộng.',
  'Governments could reduce childhood obesity by improving school lunch programmes.':
    'Chính phủ có thể giảm tình trạng béo phì ở trẻ em bằng cách cải thiện các chương trình bữa trưa học đường.',
  'Communities could help people eat healthier by offering public cooking classes.':
    'Các cộng đồng có thể giúp mọi người ăn uống lành mạnh hơn bằng cách tổ chức các lớp nấu ăn công cộng.',
  'Governments could reduce congestion by investing in smart traffic management systems.':
    'Chính phủ có thể giảm ùn tắc giao thông bằng cách đầu tư vào các hệ thống quản lý giao thông thông minh.',
  'Governments could encourage public transport use by offering fare subsidies.':
    'Chính phủ có thể khuyến khích người dân sử dụng phương tiện công cộng bằng cách trợ giá vé.',
  'Governments could reduce road freight by investing in the national rail network.':
    'Chính phủ có thể giảm vận tải hàng hóa đường bộ bằng cách đầu tư vào mạng lưới đường sắt quốc gia.',
  'Cities could encourage cycling by introducing a bike-sharing scheme.':
    'Các thành phố có thể khuyến khích đạp xe bằng cách triển khai chương trình xe đạp công cộng.',
  'I believe remote work will become the dominant working style of the future.':
    'Tôi tin rằng làm việc từ xa sẽ trở thành hình thức làm việc chủ đạo trong tương lai.',
  'Financial obligations often force people to remain in jobs they dislike.':
    'Các nghĩa vụ tài chính thường buộc mọi người phải gắn bó với những công việc mà họ không thích.',
  'Governments could reduce obesity rates by subsidizing fresh produce.':
    'Chính phủ có thể giảm tỷ lệ béo phì bằng cách trợ giá cho thực phẩm tươi sống.',
  'Libraries provide free resources for communities without home internet.':
    'Thư viện cung cấp các nguồn tài nguyên miễn phí cho những cộng đồng không có internet tại nhà.',
  'Governments could increase youth participation by building more community sports clubs.':
    'Chính phủ có thể tăng sự tham gia của giới trẻ bằng cách xây dựng thêm nhiều câu lạc bộ thể thao cộng đồng.',
  'Governments could address the skills shortage by expanding apprenticeship programmes.':
    'Chính phủ có thể giải quyết tình trạng thiếu hụt kỹ năng bằng cách mở rộng các chương trình học nghề.',
  'Overtourism can lead to serious damage to fragile ecosystems.':
    'Tình trạng quá tải du lịch có thể gây thiệt hại nghiêm trọng cho các hệ sinh thái dễ tổn thương.',
  'The adoption of electric vehicles requires significant investment in charging infrastructure.':
    'Việc áp dụng xe điện đòi hỏi đầu tư đáng kể vào hạ tầng trạm sạc.',
  "Renewable energy could significantly reduce a country's dependence on imported oil.":
    'Năng lượng tái tạo có thể giảm đáng kể sự phụ thuộc của một quốc gia vào dầu nhập khẩu.',
  'Community gardens can support local biodiversity by attracting pollinators.':
    'Các khu vườn cộng đồng có thể hỗ trợ đa dạng sinh học địa phương bằng cách thu hút các loài thụ phấn.',
  'While private healthcare can encourage medical innovation, profit-driven motives may also compromise patient care and medical ethics.':
    'Mặc dù y tế tư nhân có thể thúc đẩy đổi mới trong y học, các động cơ chạy theo lợi nhuận cũng có thể làm ảnh hưởng đến việc chăm sóc bệnh nhân và y đức.',
  'Mass production and consumerism has encouraged a throwaway culture of overconsumption, leading to significant environmental damage.':
    'Sản xuất hàng loạt và chủ nghĩa tiêu dùng đã cổ vũ cho một văn hóa vứt bỏ và tiêu dùng quá mức, dẫn đến thiệt hại môi trường đáng kể.',
  'Although the government supports cultural development through arts funding, critics argue that public money is better spent on essential services.':
    'Mặc dù chính phủ hỗ trợ phát triển văn hóa thông qua việc tài trợ cho nghệ thuật, những người chỉ trích cho rằng chi tiền công cho các dịch vụ thiết yếu thì tốt hơn.',
  'Such social factors as poverty, unemployment, and a lack of discipline can drive young people to commit crimes.':
    'Những yếu tố xã hội như nghèo đói, thất nghiệp và thiếu kỷ luật có thể đẩy người trẻ đến chỗ phạm tội.',
  'Whilst longer prison sentences may deter potential criminals, they do not tackle the root causes such as poverty, unemployment, and family breakdown.':
    'Mặc dù các bản án tù dài hơn có thể răn đe những tội phạm tiềm năng, chúng không giải quyết được các nguyên nhân gốc rễ như nghèo đói, thất nghiệp và sự tan vỡ gia đình.',
};
