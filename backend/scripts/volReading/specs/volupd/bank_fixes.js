// Bank passages corrected while checking the "đề update" folder (Vol 7 "Reading/các đề update web khác trên bản pdf",
// 2026-10-30) — update Vol 2 Test 3 = Vol 2 - Test 8 (Gold Nuggets / Nature's Useful Designs / The art of deception),
// update Vol 2 Test 10 = new Vol 2 - Test 10 (… / Whale Culture). Applied with `node bank_fix.js upd --apply`.
const q = (d, n) => d.questionGroups.flatMap(g => g.questions).find(x => x.questionNumber === n);
// replace once in the passage, and also in any explanation quoting the old wording
const sub = (d, pairs) => { for (const [a, b] of pairs) { if (d.content.split(a).length !== 2) throw new Error(`"${a}" not found once`); d.content = d.content.replace(a, b);
  for (const x of d.questionGroups.flatMap(g => g.questions)) if (x.explanation) x.explanation = x.explanation.split(a).join(b); } };
module.exports = [
  { id: '6a5510407451993d82bcdb0d', why: 'The art of deception: Q31 key C → B (its own explanation already says B "in great demand": FBI, CIA, workshops; update key B) and option D was a copy of C → "They can be used by a limited range of occupations."; Q39 NO → NOT GIVEN (update key, ece.edu.vn and izone agree: poker players are only mentioned as not being "true liars"); typos in the passage',
    fix: d => {
      const x31 = q(d, 31);
      x31.correctAnswer = 'B';
      x31.options[3] = 'They can be used by a limited range of occupations.';
      const x39 = q(d, 39);
      x39.correctAnswer = 'NOT GIVEN';
      x39.explanation = 'Dịch: Ekman đã làm việc với những người chơi poker để giúp họ nói dối thuyết phục hơn.\n\nVị trí: Đoạn cuối\n\nTrích: “This means that an actor or a poker player isn\'t a true liar. They are supposed to be deceiving you, it\'s part of the game”\n\nPhân tích: Người chơi poker chỉ được nhắc đến làm ví dụ cho người “không phải kẻ nói dối thực sự”. Bài có nói Ekman từ chối giúp các chính trị gia trông đáng tin hơn, nhưng không nói gì về việc ông có làm việc với người chơi poker hay không → NOT GIVEN';
      sub(d, [
        ['Suppose the group wanted to know, a particular patient', 'Suppose, the group wanted to know, a particular patient'],
        ['They look and sound since. So here is the question is there', 'They look and sound sincere. So here is the question: is there'],
        ['12-minutes interview with', '12-minute interviews with'],
        ['one of the patients sold him', 'one of the patients told him'],
        ['"micro- expression: very rapid', '"micro-expressions": very rapid'],
        ['the next four-decade,', 'the next four decades,'],
        ['But given a little more training. Ekman says,', 'But given a little more training, Ekman says,'],
        ['Ekman concedes has was skeptical', 'Ekman concedes he was sceptical'],
        ['not only if you are lying. But why', 'not only if you are lying, but why'],
        ['good enough for what is. After all, a drama', 'good enough for what it is. After all, it\'s a drama'],
        ['observes that ability to detect', 'observes that the ability to detect'],
        ['They are supposed to deceiving you', 'They are supposed to be deceiving you'],
        ['would be on grave trouble', 'would be in grave trouble'],
      ]);
      const x28 = q(d, 28); x28.questionText = x28.questionText.replace('12-minutes', '12-minute');
      const x30 = q(d, 30); x30.options = x30.options.map(o => o.replace('micro- expressions', 'micro-expressions'));
    } },
  { id: '6a5509187451993d82bcc7cc', why: 'Gold Nuggets of Australia: title typo "Good Nuggets" (update Vol 2 Test 3: "Gold Nuggets of Australia"); Q8 also accepts "3 cm" (update key); passage sentence "due to the fact that found on the surface" is cut in every copy (bank + update PDF, no source online) → minimal fix "that much of it was found on the surface"; "mining the gold in deposit" → deposits',
    fix: d => {
      d.title = 'Gold Nuggets of Australia';
      d.content = d.content.replace(/Good Nuggets of Australia/g, 'Gold Nuggets of Australia');
      sub(d, [
        ['the fact that found on the surface', 'the fact that much of it was found on the surface'],
        ['mining the gold in deposit where', 'mining the gold in deposits where'],
      ]);
      const x = q(d, 8); x.correctAnswer = 'three centimetres / 3 centimetres / 3 cm';
    } },
  { id: '6a550c3e7451993d82bcd14b', why: "Nature's Useful Designs: typos (update PDF): \"in a which they live\", \"month eyes\" → moth, \"say Cohen\" → says, dashes",
    fix: d => sub(d, [
      ['environment in a which they live', 'environment in which they live'],
      ['coatings in month eyes', 'coatings in moth eyes'],
      ['not sufficient" say Cohen', 'not sufficient," says Cohen'],
      ['biomimetics-applying designs', 'biomimetics – applying designs'],
      ['household word-Velcro.', 'household word – Velcro.'],
    ]) },
  { id: '6a5522af7451993d82bd046e', why: 'Whale Culture: typos (update PDF): incooperate, accross, animals’s, tha, "other other", "it is also allow", Barrett-Lennard spelt three ways',
    fix: d => sub(d, [
      ['to incooperate the changes', 'to incorporate the changes'],
      ['spread accross a vast', 'spread across a vast'],
      ['animals’s envi', 'animals’ envi'],
      ['reveal tha female', 'reveal that female'],
      ['from other other group', 'from other group'],
      ['it is also allow females', 'it also allows females'],
      ['Lance Barret Lennard', 'Lance Barrett-Lennard'],
      ['says Barrett – Lennard.', 'says Barrett-Lennard.'],
      ['says Barrett Lennard.', 'says Barrett-Lennard.'],
    ]) },
];
