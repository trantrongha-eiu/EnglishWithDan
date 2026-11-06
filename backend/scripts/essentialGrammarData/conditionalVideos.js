"use strict";

// Teaching videos for the 5 Conditionals lessons, keyed by lessonKey and
// merged into each lesson in conditionals.js. All from the BBC Learning
// English YouTube channel (spoken in English):
//   - "Grammar: Conditionals with Georgie" — short lesson per conditional
//   - "6 Minute Grammar" — longer episode to practise listening
//   - "BBC English Masterclass" — mixed conditionals
// Checked 2026-11-06: all public and embeddable.

const CHANNEL = "BBC Learning English";

function video(youtubeId, title, duration, label) {
  return { youtubeId, title, duration, channel: CHANNEL, ...(label ? { label } : {}) };
}

const SHORT = "Bài giảng ngắn (Conditionals with Georgie)";
const SIX_MIN = "Luyện nghe thêm: 6 Minute Grammar";

module.exports = {
  "zero-conditional": {
    videos: [
      video("fyqR1yb09CQ", "What is a conditional? Grammar: Conditionals with Georgie", "2:44",
        "Mở đầu: câu điều kiện là gì? Có mấy loại?"),
      video("RGmKMInQZG8", "The zero conditional - Grammar: Conditionals with Georgie", "3:23", SHORT),
      video("K-MKAjvvcsw", "How to use the zero and first conditional - 6 Minute Grammar", "5:58", SIX_MIN)
    ]
  },
  "first-conditional": {
    videos: [
      video("kpDaqFQ1YCM", "The first conditional - Grammar: Conditionals with Georgie", "2:49", SHORT),
      video("8VETylIxyhw", "The first conditional - 6 Minute Grammar", "6:09", SIX_MIN)
    ]
  },
  "second-conditional": {
    videos: [
      video("0bHeJbPkAHA", "The second conditional - Grammar: Conditionals with Georgie", "3:06", SHORT),
      video("3OuqzHxlrHc", "The second conditional - 6 Minute Grammar", "6:07", SIX_MIN)
    ]
  },
  "third-conditional": {
    videos: [
      video("pbm9IWNQmuM", "The third conditional - Grammar: Conditionals with Georgie", "3:36", SHORT),
      video("P4_kqBsj2sE", "How to use the third conditional - 6 Minute Grammar", "6:14", SIX_MIN)
    ]
  },
  "mixed-conditional": {
    videos: [
      video("e7-qXZiesbc", "Mixed conditional 1: Grammar: Conditionals with Georgie", "2:44",
        "Phần 1 (Conditionals with Georgie)"),
      video("Q9b7AONg97s", "Mixed conditional 2: Grammar: Conditionals with Georgie", "3:01",
        "Phần 2 (Conditionals with Georgie)"),
      video("_Mv7fBqauvc", "Grammar: Mixing conditionals - BBC English Masterclass", "4:33",
        "Nâng cao: BBC English Masterclass")
    ]
  }
};
