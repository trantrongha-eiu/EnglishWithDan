// Single source of truth for the admin information architecture: the
// Sidebar renders these groups, and AdminLayout derives the page title +
// breadcrumb from them (it used to keep its own, drifting TITLES map).
//
// Restructured 2026-11-14 to mirror the student menu (frontend/js/nav.js
// LINKS): one group per skill in the same order (Reading → Listening →
// Writing → Speaking → Vocab → Mocktest → BXH vocab), with items named the
// way students see them ("Full đề", "Bài lẻ", "Task 2 Luyện đề tuần",
// "Viết câu giao tiếp", "Mindset Foundation"…), so a teacher can find the
// admin side of any student page by its student-facing name. Student
// features with no admin side before (Shadowing, Part 2 · 7 câu chuyện gốc,
// Cửa hàng lửa) got pages. Keep the two menus in step when either changes.
//
// item fields:
//   to        route (may carry a ?query for deep-linked tabs)
//   match     extra path prefixes that should highlight this item
//   badge     key of useAdminData().badges to show as a count
//   adminOnly hidden from teachers (the route itself is admin-only)
//   student   the student page it manages (shown as the item's tooltip)
export const NAV_GROUPS = [
  { id: 'overview', label: 'Tổng quan', items: [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  ] },
  { id: 'students', label: 'Học sinh & Lớp', items: [
    { to: '/users', icon: '👥', label: 'Người dùng', match: ['/students/'] },
    { to: '/classes', icon: '🗓️', label: 'Lớp & Điểm danh' },
    { to: '/monitoring', icon: '📈', label: 'Theo dõi luyện tập', badge: 'violations', badgeTone: 'warn',
      badgeTitle: 'Lượt thi thử / Test Simulation bị đánh dấu vi phạm giám sát',
      match: ['/history', '/reading-stats', '/listening-stats', '/vocab-activity'] },
    { to: '/messages', icon: '✉️', label: 'Hộp thư', badge: 'pendingMessages', badgeTitle: 'Tin nhắn chưa đọc', student: 'inbox.html' },
  ] },
  { id: 'grading', label: 'Chấm bài', items: [
    { to: '/writing-grades', icon: '✍️', label: 'Chấm bài Writing', badge: 'pendingGrades', badgeTitle: 'Bài đang chờ chấm' },
    { to: '/submission-reviews', icon: '🧑‍🏫', label: 'Chấm bài khóa học & Speaking', badge: 'pendingReviews', badgeTitle: 'Bài viết khóa học / Speaking chờ giáo viên chấm' },
  ] },
  { id: 'reading', label: 'Reading', items: [
    { to: '/reading-tests', icon: '📋', label: 'Full đề Reading', student: 'reading.html?mode=full' },
    { to: '/passages', icon: '📖', label: 'Bài lẻ Reading', student: 'reading.html?mode=single' },
    { to: '/tips', icon: '💡', label: 'Reading Tips', student: 'reading.html?mode=tips' },
  ] },
  { id: 'listening', label: 'Listening', items: [
    { to: '/listening-tests', icon: '🎧', label: 'Full đề Listening', student: 'listening.html?mode=full' },
    { to: '/listening-sections', icon: '🎵', label: 'Bài lẻ Listening & Dictation', student: 'listening.html?mode=single · dictation.html' },
    { to: '/tips?skill=listening', icon: '💡', label: 'Listening Tips', student: 'listening.html?mode=tips' },
  ] },
  { id: 'writing', label: 'Writing', items: [
    { to: '/writing-tests', icon: '✏️', label: 'Full đề Writing', student: 'writing.html' },
    { to: '/writing-tests?tab=task1', icon: '📊', label: 'Đề Task 1', student: 'writing.html?taskType=1' },
    { to: '/writing-tests?tab=task2', icon: '📝', label: 'Đề Task 2', student: 'writing.html?taskType=2' },
    { to: '/writing-tests?tab=samples', icon: '📄', label: 'Bài mẫu Writing' },
    { to: '/tips?skill=writing', icon: '💡', label: 'Writing Tips', student: 'writing.html?view=writing-tips' },
    { to: '/task2-exercises', icon: '🗓️', label: 'Task 2 Luyện đề tuần', student: 'task2-practice.html' },
    { to: '/task2-templates', icon: '📑', label: 'Task 2 Templates', student: 'task2-template.html' },
  ] },
  { id: 'grammar', label: 'Ngữ pháp & Viết câu', items: [
    { to: '/essential-grammar', icon: '🎓', label: 'Essential Grammar', student: 'essential-grammar.html' },
    { to: '/task1-exercises', icon: '📉', label: 'Task 1 Grammar', student: 'task1-practice.html' },
    { to: '/writing-practice', icon: '💬', label: 'Viết câu giao tiếp', student: 'writing-practice.html' },
    { to: '/advanced-sentences', icon: '🧩', label: 'Viết câu nâng cao', student: 'advanced-sentences.html' },
  ] },
  { id: 'speaking', label: 'Speaking', items: [
    { to: '/speaking', icon: '🎤', label: 'Speaking forecast', student: 'speaking.html' },
    { to: '/speaking?tab=materials', icon: '📚', label: 'Tài liệu Speaking', student: 'speaking.html?tab=materials' },
    { to: '/tips?skill=speaking', icon: '💡', label: 'Speaking Tips', student: 'speaking.html?tab=speaking-tips' },
    { to: '/speaking-part2', icon: '📖', label: 'Part 2 · 7 câu chuyện gốc', student: 'speaking-part2.html' },
    { to: '/shadowing', icon: '🗣️', label: 'Shadowing (Video)', student: 'shadowing.html' },
  ] },
  { id: 'vocab', label: 'Vocab', items: [
    { to: '/vocabulary', icon: '🟩', label: 'Học Paraphrase', student: 'dashboard.html?view=paraphrase' },
    { to: '/vocabulary-lessons', icon: '🔷', label: 'Học Vocab Topics', student: 'dashboard.html?view=topics' },
  ] },
  { id: 'courses', label: 'Khóa học', items: [
    { to: '/wt1-course', icon: '📘', label: 'Task 1 Writing', student: 'writing-task1.html' },
    { to: '/wt1-course?course=IELTS-W-T2', icon: '📗', label: 'Task 2 Writing', student: 'writing-task2-course.html' },
    { to: '/wt1-course?course=IELTS-SPEAKING', icon: '🗣️', label: 'Khóa học Speaking', student: 'speaking-course.html' },
    { to: '/wt1-course?course=MINDSET-0', icon: '🌱', label: 'Mindset Foundation', student: 'mindset-0.html' },
    { to: '/wt1-course?course=MINDSET-1', icon: '🍃', label: 'Mindset Level 1', student: 'mindset-1.html' },
    { to: '/wt1-course?course=MINDSET-2', icon: '🌿', label: 'Mindset Level 2', student: 'mindset-2.html' },
    { to: '/courses', icon: '🎓', label: 'Trang giới thiệu khóa học', student: 'courses.html' },
  ] },
  { id: 'mocktest', label: 'Mocktest', items: [
    { to: '/entrance-test', icon: '🚪', label: 'Test đầu vào', badge: 'pendingEntranceReviews', badgeTitle: 'Kết quả đang chờ duyệt', student: 'entrance-test.html' },
    { to: '/mock-tests', icon: '🎯', label: 'Full Mock Test', student: 'mock-test.html' },
  ] },
  { id: 'fun', label: 'BXH vocab', items: [
    { to: '/shop', icon: '🏆', label: 'Bảng xếp hạng', student: 'vocab-leaderboard.html' },
    { to: '/shop?tab=shop', icon: '🔥', label: 'Cửa hàng lửa', student: 'shop.html' },
  ] },
  { id: 'finance', label: 'Tài chính', items: [
    { to: '/upgrade-requests', icon: '⭐', label: 'Yêu cầu nâng cấp', badge: 'pendingUpgrades', badgeTitle: 'Yêu cầu đang chờ duyệt', adminOnly: true },
    { to: '/tuition', icon: '💰', label: 'Học phí', badge: 'pendingTuition', badgeTitle: 'Học sinh còn nợ học phí', adminOnly: true, student: 'tuition.html' },
  ] },
  { id: 'system', label: 'Công cụ giáo viên', items: [
    { to: '/tip-packs', icon: '🖨️', label: 'Tài liệu in (Tips)' },
    { to: '/review-bypass', icon: '🎫', label: 'Mã bỏ qua Review' },
  ] },
];

// Titles for routes that aren't sidebar entries (sub-pages, legacy routes).
const EXTRA_TITLES = [
  ['/students/', 'Chi tiết học sinh', 'students'],
  ['/reading-tests/', 'Chỉnh sửa đề Reading', 'reading'],
  ['/listening-tests/', 'Chỉnh sửa đề Listening', 'listening'],
  ['/listening-sections/', 'Chỉnh sửa bài lẻ Listening', 'listening'],
  ['/speaking/import', 'Import câu hỏi Speaking', 'speaking'],
  ['/vocabulary-lessons/import', 'Import Vocab Topic', 'vocab'],
  ['/classes/', 'Chi tiết lớp', 'students'],
  ['/history', 'Lịch sử làm bài', 'students'],
  ['/reading-stats', 'Thống kê Reading', 'students'],
  ['/listening-stats', 'Thống kê Listening', 'students'],
  ['/vocab-activity', 'Hoạt động từ vựng', 'students'],
];

function splitTo(to) {
  const [path, query = ''] = to.split('?');
  return { path, query };
}

// Is `item` the active entry for this location? Items sharing one path
// (the /wt1-course?course=, /tips?skill=, /writing-tests?tab= entries) are
// told apart by their query; the query-less one is the default when the URL
// carries none of its siblings' queries.
export function isItemActive(item, pathname, search) {
  const { path, query } = splitTo(item.to);
  if (pathname === path || (path !== '/' && pathname.startsWith(path + '/'))) {
    if (!query) {
      const siblings = NAV_GROUPS.flatMap(g => g.items).filter(i => i !== item && splitTo(i.to).path === path && splitTo(i.to).query);
      return !siblings.some(s => search.includes(splitTo(s.to).query));
    }
    return search.includes(query);
  }
  return (item.match || []).some(m => pathname.startsWith(m));
}

export function findActive(pathname, search = '') {
  for (const g of NAV_GROUPS) {
    for (const item of g.items) {
      const { path } = splitTo(item.to);
      // Exact item first (a /students/:id page shouldn't read as "Người dùng").
      if ((pathname === path) && isItemActive(item, pathname, search)) return { group: g, item };
    }
  }
  return null;
}

export function routeTitle(pathname, search = '') {
  const hit = findActive(pathname, search);
  if (hit) return { title: hit.item.label, group: hit.group.label };
  for (const [prefix, title, groupId] of EXTRA_TITLES) {
    if (pathname.startsWith(prefix)) return { title, group: NAV_GROUPS.find(g => g.id === groupId)?.label || '' };
  }
  return { title: 'Admin', group: '' };
}
