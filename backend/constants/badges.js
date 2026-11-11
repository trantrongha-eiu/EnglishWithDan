'use strict';

// Achievement badge catalog. Each badge is a pure (stat, threshold)
// declaration — badgeService.js computes the stats live, from data that
// already exists plus User.badgeTally (lifetime counts of attempt history
// that the 90-day TTL has since deleted — see badgeService.syncTally).
//
// `stat` names the key badgeService.getUserStats() puts the comparable
// value under; `threshold` is the number that stat must reach (>=) to
// count as earned. Once earned, a badge stays earned (User.earnedBadgeIds).
// `tier` = position within its stat's ladder (1 = first rung).

// One ladder of badges on the same stat.
function ladder(category, stat, rows) {
  return rows.map(([id, threshold, icon, name, description], i) => ({
    id, category, tier: i + 1, stat, threshold, name, description, icon,
  }));
}

// Display order + labels for the profile page's grouped grid.
const CATEGORIES = [
  { id: 'vocab',     name: 'Từ vựng',          icon: '📚' },
  { id: 'reading',   name: 'Reading',          icon: '📖' },
  { id: 'listening', name: 'Listening',        icon: '🎧' },
  { id: 'writing',   name: 'Writing',          icon: '✍️' },
  { id: 'speaking',  name: 'Speaking',         icon: '🎤' },
  { id: 'grammar',   name: 'Ngữ pháp',         icon: '📐' },
  { id: 'mock',      name: 'Thi thử',          icon: '🎟️' },
  { id: 'streak',    name: 'Chuỗi ngày học',   icon: '🔥' },
  { id: 'study',     name: 'Thời gian học',    icon: '⏱️' },
  { id: 'special',   name: 'Đặc biệt',         icon: '🌟' },
];

const BADGES = [
  // ── Từ vựng ─────────────────────────────────────────────────────────────
  // Saved = every word in the student's VocabBook, any status.
  ...ladder('vocab', 'vocabSaved', [
    ['vocab_saved_50',   50,   '📒', 'Sổ tay nhỏ',          'Lưu 50 từ vào sổ từ vựng'],
    ['vocab_saved_200',  200,  '🗂️', 'Góp gió thành bão',   'Lưu 200 từ vào sổ từ vựng'],
    ['vocab_saved_500',  500,  '🐝', 'Con ong chăm chỉ',    'Lưu 500 từ vào sổ từ vựng'],
    ['vocab_saved_1000', 1000, '🍯', 'Hũ mật ngàn từ',      'Lưu 1000 từ vào sổ từ vựng'],
    ['vocab_saved_2000', 2000, '🌻', 'Vương quốc loài ong', 'Lưu 2000 từ vào sổ từ vựng'],
    ['vocab_saved_3000', 3000, '📕', 'Từ điển biết đi',     'Lưu 3000 từ vào sổ từ vựng'],
  ]),
  // Mastered = VocabBook words at status 'da-thuoc'.
  ...ladder('vocab', 'vocabMastered', [
    ['vocab_20',   20,   '🌱', 'Người mới bắt đầu', 'Thuộc lòng 20 từ vựng'],
    ['vocab_100',  100,  '📚', 'Thợ săn từ vựng',   'Thuộc lòng 100 từ vựng'],
    ['vocab_300',  300,  '🏆', 'Bậc thầy từ vựng',  'Thuộc lòng 300 từ vựng'],
    ['vocab_500',  500,  '🧠', 'Trí nhớ siêu phàm', 'Thuộc lòng 500 từ vựng'],
    ['vocab_1000', 1000, '💎', 'Thánh từ vựng',     'Thuộc lòng 1000 từ vựng'],
  ]),
  ...ladder('vocab', 'vocabLessons', [
    ['vocab_lesson_5',  5,  '🧩', 'Học từ có hệ thống',     'Hoàn thành 5 bài học từ vựng'],
    ['vocab_lesson_20', 20, '🏅', 'Chinh phục bài từ vựng', 'Hoàn thành 20 bài học từ vựng'],
  ]),

  // ── Reading ─────────────────────────────────────────────────────────────
  ...ladder('reading', 'readingCount', [
    ['reading_first', 1,   '📖', 'Đọc hiểu đầu tiên',   'Hoàn thành 1 bài thi Reading'],
    ['reading_10',    10,  '🐛', 'Mọt sách',            'Hoàn thành 10 bài thi Reading'],
    ['reading_25',    25,  '🔎', 'Chuyên cần Reading',  'Hoàn thành 25 bài thi Reading'],
    ['reading_50',    50,  '📗', 'Đọc không ngừng nghỉ', 'Hoàn thành 50 bài thi Reading'],
    ['reading_100',   100, '🏛️', 'Thư viện di động',    'Hoàn thành 100 bài thi Reading'],
  ]),
  ...ladder('reading', 'readingPractice', [
    ['reading_prac_10',  10,  '🧭', 'Khởi động đọc',      'Làm 10 bài luyện Reading'],
    ['reading_prac_50',  50,  '🗞️', 'Luyện đọc chăm chỉ', 'Làm 50 bài luyện Reading'],
    ['reading_prac_200', 200, '⚙️', 'Cỗ máy đọc hiểu',    'Làm 200 bài luyện Reading'],
  ]),
  ...ladder('reading', 'readingMaxBand', [
    ['reading_band6', 6, '🥉', 'Reading Band 6+',    'Đạt Band 6.0 trở lên ở Reading'],
    ['reading_band7', 7, '🎯', 'Reading Band 7+',    'Đạt Band 7.0 trở lên ở Reading'],
    ['reading_band8', 8, '🥇', 'Reading Band 8+',    'Đạt Band 8.0 trở lên ở Reading'],
    ['reading_band9', 9, '💯', 'Reading tuyệt đối',  'Đạt Band 9.0 ở Reading'],
  ]),

  // ── Listening ───────────────────────────────────────────────────────────
  ...ladder('listening', 'listeningCount', [
    ['listening_first', 1,   '🎧', 'Nghe hiểu đầu tiên',   'Hoàn thành 1 bài thi Listening'],
    ['listening_10',    10,  '📻', 'Bắt sóng tiếng Anh',   'Hoàn thành 10 bài thi Listening'],
    ['listening_25',    25,  '👂', 'Chuyên cần Listening', 'Hoàn thành 25 bài thi Listening'],
    ['listening_50',    50,  '🎶', 'Tai thính',            'Hoàn thành 50 bài thi Listening'],
    ['listening_100',   100, '📡', 'Radar âm thanh',       'Hoàn thành 100 bài thi Listening'],
  ]),
  ...ladder('listening', 'listeningPractice', [
    ['listening_prac_10',  10,  '🔈', 'Khởi động nghe',     'Làm 10 bài luyện Listening'],
    ['listening_prac_50',  50,  '🔊', 'Luyện nghe chăm chỉ', 'Làm 50 bài luyện Listening'],
    ['listening_prac_200', 200, '🛰️', 'Ăng-ten siêu nhạy',  'Làm 200 bài luyện Listening'],
  ]),
  ...ladder('listening', 'dictationCount', [
    ['dictation_10',  10,  '⌨️', 'Chép chính tả',    'Làm 10 bài Dictation'],
    ['dictation_50',  50,  '🖋️', 'Thư ký tốc ký',    'Làm 50 bài Dictation'],
    ['dictation_200', 200, '🦉', 'Nghe đâu chép đó', 'Làm 200 bài Dictation'],
  ]),
  ...ladder('listening', 'gapFillCount', [
    ['gapfill_10', 10, '🧷', 'Lấp chỗ trống',      'Làm 10 bài nghe điền từ (Gap-fill)'],
    ['gapfill_50', 50, '🧩', 'Bậc thầy điền từ',   'Làm 50 bài nghe điền từ (Gap-fill)'],
  ]),
  ...ladder('listening', 'listeningMaxBand', [
    ['listening_band6', 6, '🥉', 'Listening Band 6+',   'Đạt Band 6.0 trở lên ở Listening'],
    ['listening_band7', 7, '🎯', 'Listening Band 7+',   'Đạt Band 7.0 trở lên ở Listening'],
    ['listening_band8', 8, '🥇', 'Listening Band 8+',   'Đạt Band 8.0 trở lên ở Listening'],
    ['listening_band9', 9, '💯', 'Listening tuyệt đối', 'Đạt Band 9.0 ở Listening'],
  ]),

  // ── Writing — count = every submission (matches userService.getStats'
  // writingTotal); band = teacher-confirmed only. ─────────────────────────
  ...ladder('writing', 'writingCount', [
    ['writing_first', 1,   '✍️', 'Cây bút đầu tiên',   'Nộp 1 bài thi Writing'],
    ['writing_10',    10,  '📝', 'Kiên trì luyện viết', 'Nộp 10 bài thi Writing'],
    ['writing_25',    25,  '📜', 'Ngòi bút sắc bén',    'Nộp 25 bài thi Writing'],
    ['writing_50',    50,  '🖊️', 'Nhà văn IELTS',       'Nộp 50 bài thi Writing'],
    ['writing_100',   100, '📘', 'Tác giả trăm bài',    'Nộp 100 bài thi Writing'],
  ]),
  // Sentence/template drills: Task 2 practice, templates, advanced
  // sentences, Writing practice topics.
  ...ladder('writing', 'writingDrill', [
    ['writing_drill_10',  10,  '🔤', 'Xây câu',               'Hoàn thành 10 buổi luyện câu/mẫu Writing'],
    ['writing_drill_50',  50,  '🧱', 'Thợ xây câu',           'Hoàn thành 50 buổi luyện câu/mẫu Writing'],
    ['writing_drill_200', 200, '🏗️', 'Kiến trúc sư câu chữ', 'Hoàn thành 200 buổi luyện câu/mẫu Writing'],
  ]),
  ...ladder('writing', 'writingMaxBand', [
    ['writing_band6', 6, '🥉', 'Writing Band 6+', 'Được giáo viên chấm Band 6.0 trở lên ở Writing'],
    ['writing_band7', 7, '🎯', 'Writing Band 7+', 'Được giáo viên chấm Band 7.0 trở lên ở Writing'],
    ['writing_band8', 8, '🥇', 'Writing Band 8+', 'Được giáo viên chấm Band 8.0 trở lên ở Writing'],
  ]),

  // ── Speaking ────────────────────────────────────────────────────────────
  ...ladder('speaking', 'speakingCount', [
    ['speaking_first', 1,   '🎤', 'Tự tin lên tiếng',  'Hoàn thành 1 bài thi Speaking'],
    ['speaking_20',    20,  '🗣️', 'Luyện nói bền bỉ',  'Hoàn thành 20 bài thi Speaking'],
    ['speaking_50',    50,  '📢', 'Diễn giả',          'Hoàn thành 50 bài thi Speaking'],
    ['speaking_100',   100, '🎬', 'MC tiếng Anh',      'Hoàn thành 100 bài thi Speaking'],
  ]),
  ...ladder('speaking', 'shadowingCount', [
    ['shadowing_10',  10,  '🪞', 'Nhại giọng',           'Làm 10 bài Shadowing'],
    ['shadowing_50',  50,  '🎭', 'Bóng hình bản xứ',     'Làm 50 bài Shadowing'],
    ['shadowing_200', 200, '🌟', 'Giọng chuẩn bản xứ',   'Làm 200 bài Shadowing'],
  ]),
  ...ladder('speaking', 'speakingMaxBand', [
    ['speaking_band6', 6, '🥉', 'Speaking Band 6+', 'Đạt Band 6.0 trở lên ở Speaking'],
    ['speaking_band7', 7, '🎯', 'Speaking Band 7+', 'Đạt Band 7.0 trở lên ở Speaking'],
    ['speaking_band8', 8, '🥇', 'Speaking Band 8+', 'Đạt Band 8.0 trở lên ở Speaking'],
  ]),

  // ── Ngữ pháp — Essential Grammar lessons completed ──────────────────────
  ...ladder('grammar', 'grammarLessons', [
    ['grammar_5',  5,  '📐', 'Nền móng ngữ pháp',        'Hoàn thành 5 bài Essential Grammar'],
    ['grammar_20', 20, '🧮', 'Ngữ pháp vững vàng',       'Hoàn thành 20 bài Essential Grammar'],
    ['grammar_50', 50, '🏯', 'Kiến trúc sư ngữ pháp',    'Hoàn thành 50 bài Essential Grammar'],
  ]),

  // ── Thi thử — full 4-skill mock tests, fully graded ─────────────────────
  ...ladder('mock', 'mockCount', [
    ['mock_1',  1,  '🎟️', 'Lần đầu thi thử',     'Hoàn thành 1 bài thi thử 4 kỹ năng'],
    ['mock_5',  5,  '🏟️', 'Quen phòng thi',      'Hoàn thành 5 bài thi thử 4 kỹ năng'],
    ['mock_10', 10, '🎓', 'Chiến binh phòng thi', 'Hoàn thành 10 bài thi thử 4 kỹ năng'],
  ]),

  // ── Streak — User.maxLearningStreak (never decreases) ───────────────────
  ...ladder('streak', 'maxStreak', [
    ['streak_3',   3,   '✨', 'Khởi động',            'Duy trì streak học 3 ngày'],
    ['streak_7',   7,   '🔥', '7 ngày bền bỉ',         'Duy trì streak học 7 ngày'],
    ['streak_14',  14,  '🌙', 'Nửa tháng kiên trì',    'Duy trì streak học 14 ngày'],
    ['streak_30',  30,  '⚡', '30 ngày kỷ luật',       'Duy trì streak học 30 ngày'],
    ['streak_60',  60,  '🌊', 'Hai tháng bền bỉ',      'Duy trì streak học 60 ngày'],
    ['streak_100', 100, '👑', '100 ngày huyền thoại',  'Duy trì streak học 100 ngày'],
    ['streak_200', 200, '🐉', '200 ngày bất bại',      'Duy trì streak học 200 ngày'],
    ['streak_365', 365, '🌞', 'Một năm không nghỉ',    'Duy trì streak học 365 ngày'],
  ]),

  // ── Thời gian học — active hours on the site (OnlineSession) ────────────
  ...ladder('study', 'studyHours', [
    ['study_1h',   1,   '⏱️', 'Giờ học đầu tiên',  'Học tập trung 1 giờ trên web'],
    ['study_10h',  10,  '📅', '10 giờ miệt mài',   'Học tập trung 10 giờ trên web'],
    ['study_50h',  50,  '⏳', '50 giờ tập trung',  'Học tập trung 50 giờ trên web'],
    ['study_100h', 100, '🏔️', '100 giờ chinh phục', 'Học tập trung 100 giờ trên web'],
    ['study_300h', 300, '🚀', '300 giờ phi thường', 'Học tập trung 300 giờ trên web'],
  ]),

  // ── Đặc biệt ────────────────────────────────────────────────────────────
  ...ladder('special', 'skillsTried', [
    ['all_rounder', 4, '🧭', 'Toàn năng', 'Làm ít nhất 1 bài thi ở cả 4 kỹ năng'],
  ]),
  ...ladder('special', 'minSkillBand', [
    ['all_band6', 6, '🛡️', 'Tứ trụ 6.0', 'Đạt Band 6.0+ ở cả 4 kỹ năng'],
    ['all_band7', 7, '🏆', 'Tứ trụ 7.0', 'Đạt Band 7.0+ ở cả 4 kỹ năng'],
  ]),
  ...ladder('special', 'totalTests', [
    ['tests_100', 100, '🎖️', 'Trăm trận',  'Hoàn thành tổng cộng 100 bài thi 4 kỹ năng'],
    ['tests_500', 500, '⚔️', 'Lão làng',   'Hoàn thành tổng cộng 500 bài thi 4 kỹ năng'],
  ]),
  ...ladder('special', 'petsOwned', [
    ['pets_1', 1, '🐾', 'Người nuôi linh thú', 'Sở hữu 1 linh thú trong Cửa hàng lửa'],
    ['pets_5', 5, '🦊', 'Sở thú mini',         'Sở hữu 5 linh thú trong Cửa hàng lửa'],
  ]),
  ...ladder('special', 'legendPets', [
    ['pets_legend', 1, '🐉', 'Chủ nhân huyền thoại', 'Sở hữu 1 linh thú huyền thoại (Thập Vĩ / Susano)'],
  ]),
];

module.exports = BADGES;
module.exports.CATEGORIES = CATEGORIES;
