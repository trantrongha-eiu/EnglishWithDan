// Vol 8 - READING/Test 12.pdf - Reading Passage 3 (PDF p6–9, text layer). Not in the bank / mini-ielts.
// Key = READING/Key.pdf (TEST 12 tab). Word list A–I of Q36–40 is an image (typed). Q32 ("Head offices should be more
// flexible about how products are arranged by supermarkets"): the key says YES, but the writer only reports that head offices
// dictate shelf positions and that shelf-positioning is controversial, without saying what head offices should do →
// "NOT GIVEN / YES" (both accepted; no online key found).
const { mc, ynng, summary } = require('../../vr_build');
module.exports = {
  vol: 8, test: 12, part: 3, title: 'The Science of Shopping', text: 't12p3.txt',
  groups: [
    mc(27, [
      ['What does the writer suggest about supermarkets in the first paragraph?', [
        'They need to try harder to be different from one another.', 'They share a similar understanding of consumer psychology.',
        'They depend too much on the latest technology.', 'They should do more to analyse how consumers think.']],
      ['The writer says the function of the ‘chill zone’ in supermarkets is', [
        'to give customers time to decide what they want to buy.', 'to present customers with a range of interesting bargains.',
        'to ensure customers feel under no pressure to buy anything.', 'to help customers slowly prepare themselves to go shopping.']],
      ['According to the writer, placing fruit and vegetables near the front of the store', [
        'ensures the customers will feel good about the first products they buy.', 'reduces the risk of customers damaging these products later on.',
        'encourages customers to buy more of these products than they intended.', 'makes customers consider healthier options in other sections they visit.']],
      ['What point does the writer make about shoppers in the third paragraph?', [
        'They spend more time in stores than they realise.', 'They believe stores make life unnecessarily difficult for them.',
        'They are aware of some of the techniques used by stores.', 'They are confused by frequent changes in the layout of stores.']],
    ]),
    ynng(31, [
      'Cheaper products are placed on lower shelves to minimise the likelihood that they will be bought.',
      'Head offices should be more flexible about how products are arranged by supermarkets.',
      'There is widespread agreement on how products should be arranged on shelves.',
      'Security cameras are a serious threat to customers’ privacy.',
      'Technology is the best tool for determining why shoppers fail to make purchases.',
    ]),
    summary(36, 40, 'Research is providing insights into what makes people purchase particular products. Most shoppers believe that their choices are the result of __Q36__. Research involving fMRI scanners, however, has revealed that certain __Q37__ influence shoppers’ decisions to a significant extent. In the research, a comparison was made between participants’ stated opinions of a product and data from __Q38__, which often indicated a radically different __Q39__. As most new products are __Q40__, this data could be extremely valuable for marketing departments.',
      ['brain scans', 'purpose', 'unconscious factors', 'questionnaire', 'failures', 'procedure', 'rational decisions', 'emotional reaction', 'achievements'],
      { title: 'New technology could help retailers sell more' }),
  ],
  key: { 27: 'B', 28: 'D', 29: 'A', 30: 'C', 31: 'YES', 32: 'NOT GIVEN / YES', 33: 'NO', 34: 'NOT GIVEN', 35: 'NO',
    36: 'rational decisions', 37: 'unconscious factors', 38: 'brain scans', 39: 'emotional reaction', 40: 'failures' },
  expl: {
    27: ['Ở đoạn đầu, tác giả gợi ý gì về các siêu thị?', 'Đoạn 1',
      '“It is more that they are all well-versed in the science of persuading people to buy things – a science that … is beginning to understand what motivates consumers”',
      'Siêu thị giống nhau vì đều am hiểu khoa học thuyết phục người mua = có chung hiểu biết về tâm lý khách hàng → B'],
    28: ['Theo tác giả, chức năng của “chill zone” là', 'Đoạn 2',
      '“It takes a while for the mind to get into a shopping mode. People need to make a gentle start and take stock of the surroundings. This is why some supermarkets have a so-called ‘chill zone’”',
      '“make a gentle start” = giúp khách từ từ chuẩn bị tinh thần mua sắm → D'],
    29: ['Theo tác giả, đặt rau quả gần cửa hàng', 'Đoạn 2',
      '“selecting wholesome fresh food is an uplifting way to start shopping, and it makes people feel less guilty about reaching for the less nutritious stuff later on.”',
      '“an uplifting way to start shopping” = khách cảm thấy dễ chịu với những món đầu tiên họ mua (D ngược: họ bớt áy náy khi mua đồ kém dinh dưỡng) → A'],
    30: ['Tác giả nói gì về người mua ở đoạn thứ ba?', 'Đoạn 3',
      '“Shoppers have worked out that everyday items, like milk, will invariably be placed in an aisle towards the back of a store … But supermarkets know shoppers know this”',
      '“Shoppers have worked out …”, “shoppers know this” = người mua biết một số chiêu của cửa hàng → C'],
    31: ['Hàng rẻ hơn được đặt ở kệ thấp để giảm khả năng chúng được mua.', 'Đoạn 5',
      '“stores encourage customers to buy expensive branded products by arranging them at eye-level, with cheaper ones lower down.”',
      'Hàng đắt đặt ngang tầm mắt để khách mua, hàng rẻ đặt thấp = để khách ít chọn hàng rẻ → YES'],
    32: ['Trụ sở chính nên linh hoạt hơn trong việc sắp xếp hàng hóa ở siêu thị.', 'Đoạn 5',
      '“Often head offices specify where everything has to be placed and spot-checks are carried out to make sure instructions are followed to the letter. But shelf-positioning is extremely controversial.”',
      'Tác giả chỉ mô tả trụ sở quy định chặt và việc xếp kệ gây tranh cãi, không nói trụ sở NÊN làm gì (key gốc ghi YES – cũng được chấm đúng) → NOT GIVEN'],
    33: ['Có sự đồng thuận rộng rãi về cách xếp hàng trên kệ.', 'Đoạn 5',
      '“But shelf-positioning is extremely controversial. … While many stores consider eye-level to be the top spot, others think a little higher is better.”',
      '“extremely controversial”, mỗi nơi một ý = không có đồng thuận → NO'],
    34: ['Camera an ninh là mối đe dọa nghiêm trọng tới quyền riêng tư của khách hàng.', 'Đoạn 6',
      '“the security cameras in stores may be doing considerably more than watching out for theft.”',
      'Camera dùng để phân tích hành vi mua; tác giả không nói nó đe dọa quyền riêng tư → NOT GIVEN'],
    35: ['Công nghệ là công cụ tốt nhất để biết vì sao khách không mua hàng.', 'Đoạn 6',
      '“However, despite the availability of sophisticated technology, researchers have found that simply talking to consumers as they exit the store can yield valuable insights. … data collected electronically tells them little about why so many customers leave without making a purchase.”',
      'Dữ liệu điện tử cho biết rất ít; phỏng vấn trực tiếp mới hiệu quả → NO'],
    36: ['Phần lớn người mua tin rằng lựa chọn của họ là kết quả của ______.', 'Đoạn 7',
      '“People tell market researchers that they make decisions about what to buy based on logic and common sense”',
      '“logic and common sense” = quyết định lý trí (G) → rational decisions'],
    37: ['Nghiên cứu fMRI cho thấy một số ______ ảnh hưởng lớn tới quyết định mua.', 'Đoạn 7',
      '“there are clearly other factors which play a role, such as certain feelings and memories which individuals are not fully aware of.”',
      '“factors … not fully aware of” = yếu tố vô thức (C) → unconscious factors'],
    38: ['… so sánh ý kiến người tham gia nói ra với dữ liệu từ ______', 'Đoạn 7',
      '“Research participants are shown different products and asked questions about them, while scanners reveal their brain activity as they respond.”',
      '“scanners reveal their brain activity” = ảnh chụp não (A) → brain scans'],
    39: ['… thường cho thấy một ______ khác hẳn.', 'Đoạn 7',
      '“Often, major contradictions are apparent between what they say and what they are thinking.”',
      'Điều họ thực sự nghĩ/cảm thấy (phản ứng cảm xúc) khác hẳn điều họ nói (H) → emotional reaction'],
    40: ['Vì phần lớn sản phẩm mới đều ______, dữ liệu này rất có giá trị.', 'Đoạn 7',
      '“Eight out of ten new consumer products launched on the market do not succeed”',
      '“Eight out of ten … do not succeed” = phần lớn sản phẩm mới thất bại (E) → failures'],
  },
};
