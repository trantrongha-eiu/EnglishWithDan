// Cambridge IELTS 18 - Test 1 - Passage 3. Source: ieltsworldly.com, checked against the book key.
const { matching, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam18', book: 18, test: 1, part: 3, title: 'Conquering Earth’s space junk problem', text: 't1p3.txt',
  groups: [
    matching(27, ['A', 'B', 'C', 'D', 'E', 'F'], [
      'a reference to the cooperation that takes place to try and minimise risk',
      'an explanation of a person’s aims',
      'a description of a major collision that occurred in space',
      'a comparison between tracking objects in space and the efficiency of a transportation system',
      'a reference to efforts to classify space junk',
    ], { instruction: 'Reading Passage 3 has six sections, A–F. Which section contains the following information? Write the correct letter, A–F, in boxes 27–31 on your answer sheet.' }),
    notes(32, 35, [
      'The committee gives advice on how the __Q32__ of space can be achieved. The committee advises that when satellites are no longer active, any unused __Q33__ or pressurised material that could cause __Q34__ should be removed.',
      'Although operators of large satellite constellations accept that they have obligations as stewards of space, Holger Krag points out that the operators that become __Q35__ are unlikely to prioritise removing their satellites from space.',
    ], { title: 'The Inter-Agency Space Debris Coordination Committee', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 32–35 on your answer sheet.' }),
    matching(36, ['Carolin Frueh', 'Holger Krag', 'Marlon Sorge', 'Moriba Jah'], [
      'Knowing the exact location of space junk would help prevent any possible danger.',
      'Space should be available to everyone and should be preserved for the future.',
      'A recommendation regarding satellites is widely ignored.',
      'There is conflicting information about where some satellites are in space.',
      'There is a risk we will not be able to undo the damage that occurs in space.',
    ], { reuse: true, title: 'List of People', instruction: 'Look at the following statements (Questions 36–40) and the list of people below. Match each statement with the correct person, A, B, C or D. Write the correct letter, A, B, C or D, in boxes 36–40 on your answer sheet. NB You may use any letter more than once.' }),
  ],
  key: { 27: 'C', 28: 'F', 29: 'A', 30: 'E', 31: 'B', 32: 'sustainability', 33: 'fuel', 34: 'explosions', 35: 'bankrupt', 36: 'C', 37: 'D', 38: 'B', 39: 'D', 40: 'A' },
  expl: {
    27: ['Nhắc tới sự hợp tác nhằm giảm thiểu rủi ro.', 'Section C', '“That means companies, governments and other players in space are collaborating in new ways to avoid a shared threat.”', '“collaborating” = cooperation; tránh mối nguy chung → C'],
    28: ['Giải thích mục tiêu của một người.', 'Section F', '“I want to make space a place that is safe to operate, that is free and useful for generations to come.”', 'Moriba Jah nói rõ mục tiêu của mình → F'],
    29: ['Mô tả một vụ va chạm lớn trong không gian.', 'Section A', '“Ten years ago, a US commercial Iridium satellite smashed into an inactive Russian communications satellite called Cosmos-2251”', 'Vệ tinh Iridium đâm vào Cosmos-2251 → A'],
    30: ['So sánh việc theo dõi vật thể trong không gian với hiệu quả của một hệ thống giao thông.', 'Section E', '“Air-traffic controllers know the location of the planes down to one metre in accuracy. The same can’t be said for space debris.”', 'So sánh với kiểm soát không lưu ở sân bay → E'],
    31: ['Nhắc tới nỗ lực phân loại rác vũ trụ.', 'Section B', '“Others are developing taxonomies of space”', '“taxonomies” = phân loại → B'],
    32: ['Ủy ban đưa lời khuyên về cách đạt được sự ___ của không gian.', 'Section C', '“have developed guidelines on space sustainability.”', '“guidelines” = advice; tính bền vững → sustainability'],
    33: ['…loại bỏ ___ chưa dùng hoặc vật liệu nén…', 'Section C', '“by venting pressurized materials or leftover fuel that might lead to explosions.”', '“leftover” = unused; nhiên liệu → fuel'],
    34: ['…có thể gây ra ___.', 'Section C', '“that might lead to explosions.”', '“lead to” = cause; vụ nổ → explosions'],
    35: ['Krag chỉ ra rằng các nhà vận hành bị ___ khó ưu tiên đưa vệ tinh ra khỏi không gian.', 'Section C', '“What happens to those that fail or go bankrupt?”', '“go bankrupt” = become bankrupt → bankrupt'],
    36: ['Biết chính xác vị trí rác vũ trụ sẽ giúp ngăn mọi nguy hiểm có thể xảy ra.', 'Section D', '“If you knew precisely where everything was, you would almost never have a problem,”', 'Marlon Sorge → C'],
    37: ['Không gian nên dành cho mọi người và được giữ gìn cho tương lai.', 'Section F', '“that is free and useful for generations to come.”', 'Moriba Jah → D'],
    38: ['Một khuyến nghị về vệ tinh bị phớt lờ rộng rãi.', 'Section C', '“only about half of all missions have abided by this 25-year goal, says Holger Krag”', 'Chỉ một nửa tuân thủ = nhiều nơi phớt lờ → B'],
    39: ['Có thông tin trái ngược về vị trí của một số vệ tinh trong không gian.', 'Section F', '“the US and Russian sources contain two completely different orbits for the same object.”', 'Hai nguồn cho hai quỹ đạo khác nhau – Jah minh họa → D'],
    40: ['Có nguy cơ ta không thể khắc phục thiệt hại xảy ra trong không gian.', 'Section B', '“If we go on like this, we will reach a point of no return,”', '“point of no return” = không thể quay lại – Carolin Frueh → A'],
  },
};
