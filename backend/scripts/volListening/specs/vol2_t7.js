// Vol 2 – Test 7 (PDF "listening/test 7/Test 7.pdf", key p7; audio test 7/section 1–4.m4a; no transcripts in the folder)
// The whole test is already in the bank: same keys, same recording (Whisper vs bank transcript) as the full test
// "Actual Test 10" — P1 Windshem Farm Center, P2 Student Vacation Jobs, P3 Study Syndicate for Geology Exam,
// P4 Health on the Night Shift. Nothing is seeded; as with Vol 1 Test 1–4 the old full test is renamed
// (rename_tests.js) instead of building a duplicate. The PDF's key page labels Q11–20 "Section 3" and Q21–30
// "Section 2" and has "SH12LLQ" for Q10 (bank: SH12 1LQ, as spelt in the recording).
module.exports = {
  vol: 2, test: 7,
  sameAs: 'Actual Test 10',
  sections: [
    { part: 1, reuse: '6a53e0a25c459ab074ced7f5', title: 'Windshem Farm Center', audio: 'listening/test 7/section 1.m4a' },
    { part: 2, reuse: '6a53e3ae5c459ab074cede2e', title: 'Student Vacation Jobs', audio: 'listening/test 7/section2.m4a' },
    { part: 3, reuse: '6a53e8405c459ab074cee599', title: 'Study Syndicate for Geology Exam', audio: 'listening/test 7/section3.m4a' },
    { part: 4, reuse: '6a53db265c459ab074cec6cb', title: 'Health on the Night Shift', audio: 'listening/test 7/section 4.m4a' },
  ],
};
