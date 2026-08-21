'use strict';

// Achievement badge catalog. Each badge is a pure (category, threshold)
// declaration — badgeService.js does the actual computation, always live
// from existing attempt/vocab data (no separate "awarded badges" collection,
// same "read what already exists, don't stand up new analytics" philosophy
// as services/recommendationService.js). That means badges have no
// earnedAt timestamp — they're recomputed on every request, so a badge is
// simply "does the student's current stats cross this threshold or not."
//
// `stat` names the key badgeService.getUserStats() puts the comparable
// value under; `threshold` is the number that stat must reach (>=) to
// count as earned.
module.exports = [
  // ── Vocabulary — VocabBook words at status 'da-thuoc' (mastered) ────────
  { id: 'vocab_20', category: 'vocab', tier: 1, stat: 'vocabMastered', threshold: 20,
    name: 'Người mới bắt đầu', description: 'Thuộc lòng 20 từ vựng', icon: '🌱' },
  { id: 'vocab_100', category: 'vocab', tier: 2, stat: 'vocabMastered', threshold: 100,
    name: 'Thợ săn từ vựng', description: 'Thuộc lòng 100 từ vựng', icon: '📚' },
  { id: 'vocab_300', category: 'vocab', tier: 3, stat: 'vocabMastered', threshold: 300,
    name: 'Bậc thầy từ vựng', description: 'Thuộc lòng 300 từ vựng', icon: '🏆' },

  // ── Reading — TestAttempt, status:'completed' ────────────────────────────
  { id: 'reading_first', category: 'reading', tier: 1, stat: 'readingCount', threshold: 1,
    name: 'Đọc hiểu đầu tiên', description: 'Hoàn thành 1 bài thi Reading', icon: '📖' },
  { id: 'reading_25', category: 'reading', tier: 2, stat: 'readingCount', threshold: 25,
    name: 'Chuyên cần Reading', description: 'Hoàn thành 25 bài thi Reading', icon: '🔎' },
  { id: 'reading_band7', category: 'reading', tier: 3, stat: 'readingMaxBand', threshold: 7,
    name: 'Reading Band 7+', description: 'Đạt Band 7.0 trở lên ở Reading', icon: '🎯' },

  // ── Listening — ListeningAttempt, status:'completed' ─────────────────────
  { id: 'listening_first', category: 'listening', tier: 1, stat: 'listeningCount', threshold: 1,
    name: 'Nghe hiểu đầu tiên', description: 'Hoàn thành 1 bài thi Listening', icon: '🎧' },
  { id: 'listening_25', category: 'listening', tier: 2, stat: 'listeningCount', threshold: 25,
    name: 'Chuyên cần Listening', description: 'Hoàn thành 25 bài thi Listening', icon: '👂' },
  { id: 'listening_band7', category: 'listening', tier: 3, stat: 'listeningMaxBand', threshold: 7,
    name: 'Listening Band 7+', description: 'Đạt Band 7.0 trở lên ở Listening', icon: '🎯' },

  // ── Writing — WritingAttempt. Count = every submission (matches
  // userService.getStats' writingTotal); band = teacher-confirmed only. ────
  { id: 'writing_first', category: 'writing', tier: 1, stat: 'writingCount', threshold: 1,
    name: 'Cây bút đầu tiên', description: 'Nộp 1 bài thi Writing', icon: '✍️' },
  { id: 'writing_10', category: 'writing', tier: 2, stat: 'writingCount', threshold: 10,
    name: 'Kiên trì luyện viết', description: 'Nộp 10 bài thi Writing', icon: '📝' },
  { id: 'writing_band7', category: 'writing', tier: 3, stat: 'writingMaxBand', threshold: 7,
    name: 'Writing Band 7+', description: 'Được giáo viên chấm Band 7.0 trở lên ở Writing', icon: '🎯' },

  // ── Speaking — SpeakingAttempt, status:'analyzed' ─────────────────────────
  { id: 'speaking_first', category: 'speaking', tier: 1, stat: 'speakingCount', threshold: 1,
    name: 'Tự tin lên tiếng', description: 'Hoàn thành 1 bài thi Speaking', icon: '🎤' },
  { id: 'speaking_20', category: 'speaking', tier: 2, stat: 'speakingCount', threshold: 20,
    name: 'Luyện nói bền bỉ', description: 'Hoàn thành 20 bài thi Speaking', icon: '🗣️' },
  { id: 'speaking_band7', category: 'speaking', tier: 3, stat: 'speakingMaxBand', threshold: 7,
    name: 'Speaking Band 7+', description: 'Đạt Band 7.0 trở lên ở Speaking', icon: '🎯' },

  // ── Streak — User.maxLearningStreak (never decreases, unlike the live
  // learningStreak counter, so these stay earned even after a streak resets) ─
  { id: 'streak_7', category: 'streak', tier: 1, stat: 'maxStreak', threshold: 7,
    name: '7 ngày bền bỉ', description: 'Duy trì streak học 7 ngày', icon: '🔥' },
  { id: 'streak_30', category: 'streak', tier: 2, stat: 'maxStreak', threshold: 30,
    name: '30 ngày kỷ luật', description: 'Duy trì streak học 30 ngày', icon: '⚡' },
  { id: 'streak_100', category: 'streak', tier: 3, stat: 'maxStreak', threshold: 100,
    name: '100 ngày huyền thoại', description: 'Duy trì streak học 100 ngày', icon: '👑' },
];
