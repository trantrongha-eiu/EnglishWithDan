// Single source of truth for the admin information architecture: the
// Sidebar renders these groups, and AdminLayout derives the page title +
// breadcrumb from them (it used to keep its own, drifting TITLES map).
//
// item fields:
//   to        route (may carry a ?query for deep-linked tabs)
//   match     extra path prefixes that should highlight this item
//   badge     key of useAdminData().badges to show as a count
//   adminOnly hidden from teachers (the route itself is admin-only)
export const NAV_GROUPS = [
  { id: 'overview', label: 'Tổng quan', items: [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  ] },
  { id: 'students', label: 'Học sinh', items: [
    { to: '/users', icon: '👥', label: 'Người dùng', match: ['/students/'] },
    { to: '/classes', icon: '🗓️', label: 'Lớp & Điểm danh' },
    { to: '/monitoring', icon: '📈', label: 'Theo dõi luyện tập', badge: 'violations', badgeTone: 'warn',
      badgeTitle: 'Lượt thi thử / Test Simulation bị đánh dấu vi phạm giám sát',
      match: ['/history', '/mock-tests', '/reading-stats', '/listening-stats', '/vocab-activity'] },
    { to: '/entrance-test', icon: '🚪', label: 'Test đầu vào', badge: 'pendingEntranceReviews', badgeTitle: 'Kết quả đang chờ duyệt' },
    { to: '/writing-grades', icon: '✍️', label: 'Chấm bài Writing', badge: 'pendingGrades', badgeTitle: 'Bài đang chờ chấm' },
    { to: '/messages', icon: '✉️', label: 'Hộp thư', badge: 'pendingMessages', badgeTitle: 'Tin nhắn chưa đọc' },
  ] },
  { id: 'exams', label: 'Đề thi IELTS', items: [
    { to: '/reading-tests', icon: '📋', label: 'Bộ đề Reading' },
    { to: '/passages', icon: '📖', label: 'Bài đọc (Passages)' },
    { to: '/listening-tests', icon: '🎧', label: 'Đề Listening' },
    { to: '/listening-sections', icon: '🎵', label: 'Bài lẻ Listening' },
    { to: '/writing-tests', icon: '✏️', label: 'Đề Writing' },
    { to: '/speaking', icon: '🎤', label: 'Speaking' },
  ] },
  { id: 'courses', label: 'Khoá học', items: [
    { to: '/wt1-course', icon: '📘', label: 'Khoá Writing Task 1' },
    { to: '/wt1-course?course=IELTS-W-T2', icon: '📗', label: 'Khoá Writing Task 2' },
    { to: '/wt1-course?course=IELTS-SPEAKING', icon: '🗣️', label: 'Khoá Speaking' },
    { to: '/courses', icon: '🎓', label: 'Trang giới thiệu khoá học' },
  ] },
  { id: 'practice', label: 'Luyện tập Writing', items: [
    { to: '/writing-practice', icon: '🖊️', label: 'Writing Practice' },
    { to: '/task2-exercises', icon: '📝', label: 'Task 2 Writing' },
    { to: '/task2-templates', icon: '📄', label: 'Task 2 Templates' },
    { to: '/advanced-sentences', icon: '🧩', label: 'Viết câu nâng cao' },
    { to: '/task1-exercises', icon: '📉', label: 'Task 1 Grammar (cũ)' },
  ] },
  { id: 'vocab', label: 'Từ vựng & Ngữ pháp', items: [
    { to: '/vocabulary', icon: '🟩', label: 'Từ vựng (Units)' },
    { to: '/vocabulary-lessons', icon: '🏫', label: 'Vocabulary Lessons' },
    { to: '/essential-grammar', icon: '📘', label: 'Essential Grammar' },
  ] },
  { id: 'tips', label: 'Tips & Tài liệu', items: [
    { to: '/tips', icon: '💡', label: 'Tips 4 kỹ năng' },
    { to: '/tip-packs', icon: '🖨️', label: 'Tài liệu in (Tips)' },
  ] },
  { id: 'finance', label: 'Tài chính', items: [
    { to: '/upgrade-requests', icon: '⭐', label: 'Yêu cầu nâng cấp', badge: 'pendingUpgrades', badgeTitle: 'Yêu cầu đang chờ duyệt', adminOnly: true },
    { to: '/tuition', icon: '💰', label: 'Học phí', badge: 'pendingTuition', badgeTitle: 'Học sinh còn nợ học phí', adminOnly: true },
  ] },
  { id: 'system', label: 'Hệ thống', items: [
    { to: '/review-bypass', icon: '🎫', label: 'Mã bỏ qua Review' },
  ] },
];

// Titles for routes that aren't sidebar entries (sub-pages, legacy routes).
const EXTRA_TITLES = [
  ['/students/', 'Chi tiết học sinh', 'students'],
  ['/reading-tests/', 'Chỉnh sửa đề Reading', 'exams'],
  ['/listening-tests/', 'Chỉnh sửa đề Listening', 'exams'],
  ['/listening-sections/', 'Chỉnh sửa bài Listening', 'exams'],
  ['/speaking/import', 'Import câu hỏi Speaking', 'exams'],
  ['/vocabulary-lessons/import', 'Import Vocabulary Lesson', 'vocab'],
  ['/classes/', 'Chi tiết lớp', 'students'],
  ['/history', 'Lịch sử làm bài', 'students'],
  ['/mock-tests', 'Thi thử Full 4 kỹ năng', 'students'],
  ['/reading-stats', 'Thống kê Reading', 'students'],
  ['/listening-stats', 'Thống kê Listening', 'students'],
  ['/vocab-activity', 'Hoạt động từ vựng', 'students'],
];

function splitTo(to) {
  const [path, query = ''] = to.split('?');
  return { path, query };
}

// Is `item` the active entry for this location? Items sharing one path
// (the three /wt1-course?course= entries) are told apart by their query;
// the query-less one is the default when the URL has no ?course=.
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
