/**
 * shared/i18n.js — lightweight VI ⇄ EN toggle for the site "chrome"
 * (nav, buttons, form labels, tab/section headings, filter chips, empty
 * states, common toasts). It does NOT translate lesson content, exam
 * questions, transcripts, essays or AI feedback — those strings are simply
 * absent from DICT below, so they stay in Vietnamese.
 *
 * How it works: the page is authored in Vietnamese (the source of truth).
 * On switch to English we walk every text node / translatable attribute,
 * and if its trimmed value is a key in DICT we swap in the English text,
 * stashing the original on the node so switching back is exact. A
 * MutationObserver re-runs the swap on anything added later (nav bell
 * items, toasts, modals rendered by other scripts).
 *
 * Storage key: localStorage['ews_lang'] ∈ {'vi','en'} (default 'vi').
 * Public API: window.EWSI18n = { lang, set(l), toggle(), apply(), t(s) }.
 * Event: document dispatches 'ews:langchange' after every switch.
 *
 * To extend coverage: add "Vietnamese source": "English" pairs to DICT.
 * Keep entries to short UI strings — labels, buttons, headings — not full
 * explanatory sentences.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ews_lang';
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, PRE: 1, KBD: 1, SAMP: 1 };

  // ── Dictionary: Vietnamese (as written in the markup) → English ──────
  var DICT = {
    // Global nav — top-level + dropdown children
    'Full đề': 'Full test',
    'Bài lẻ': 'Single items',
    'Luyện tập': 'Practice',
    'Luyện viết': 'Writing drills',
    'Viết câu giao tiếp': 'Everyday sentences',
    'Task 1 Grammar': 'Task 1 Grammar',
    'Task 2 Writing': 'Task 2 Writing',
    'Task 2 Templates': 'Task 2 Templates',
    'Essential Grammar': 'Essential Grammar',
    'Hộp thư': 'Inbox',
    'Học phí': 'Tuition',
    'Tài liệu': 'Materials',
    'Tin nhắn': 'Messages',
    'Thông báo': 'Notifications',
    'Thông báo chung': 'Announcement',
    'Reading Tips': 'Reading Tips',
    'Listening Tips': 'Listening Tips',
    'Writing Tips': 'Writing Tips',
    'Speaking Tips': 'Speaking Tips',

    // Nav action buttons (title / aria-label)
    'Bật/tắt âm thanh': 'Toggle sound',
    'Chế độ tối/sáng': 'Light / dark mode',
    'Chuyển chế độ tối/sáng': 'Switch light / dark mode',
    'Tìm kiếm': 'Search',
    'Xem lại hướng dẫn': 'Replay the tour',
    'Trang cá nhân': 'Your profile',
    'Đăng xuất': 'Log out',
    'Mở menu': 'Open menu',
    'Đóng': 'Close',
    'Tìm đề Reading, Listening, bài học từ vựng...': 'Search Reading, Listening or vocabulary lessons…',
    'Không tìm thấy kết quả nào': 'No results found',
    'Không thể tải thông báo.': 'Could not load notifications.',
    'Lỗi tìm kiếm.': 'Search error.',
    'Chưa có thông báo nào': 'No notifications yet',
    'Xem hộp thư': 'Open inbox',
    'Xem học phí': 'View tuition',
    'Gia hạn': 'Renew',
    'Gia hạn ngay': 'Renew now',

    // Universal actions / common words
    'Bắt đầu': 'Start',
    'Bắt Đầu': 'Start',
    'Bắt đầu làm bài': 'Start the test',
    'Bắt đầu luyện tập': 'Start practising',
    'Bắt đầu thi': 'Start exam',
    'Bắt đầu thi thử': 'Start mock test',
    'Bắt đầu học': 'Start learning',
    'Tiếp tục': 'Continue',
    'Tiếp tục học': 'Keep learning',
    'Tiếp tục làm': 'Resume',
    'Tiếp tục thi thử': 'Resume mock test',
    'Làm lại': 'Retry',
    'Làm lại từ đầu': 'Restart',
    'Làm lại passage': 'Redo passage',
    'Làm bài khác': 'Do another',
    'Làm bài mới': 'New attempt',
    'Làm test mới': 'New test',
    'Thi lại': 'Retake',
    'Thi thử': 'Mock test',
    'Xem lại': 'Review',
    'Xem lại kết quả': 'Review results',
    'Xem chi tiết': 'View details',
    'Xem đầy đủ': 'View full',
    'Xem tất cả': 'View all',
    'Xem lịch sử': 'View history',
    'Nghe lại': 'Listen again',
    'Quay lại': 'Back',
    'Quay lại danh sách': 'Back to list',
    'Quay lại trang chủ': 'Back to home',
    'Trang chủ': 'Home',
    'Thoát': 'Exit',
    'Thoát & lưu': 'Exit & save',
    'Thoát và lưu tiến độ': 'Exit and save progress',
    'Nộp bài': 'Submit',
    'Hoàn thành': 'Finish',
    'Hoàn thành bài tập': 'Finish exercise',
    'Kiểm tra': 'Check',
    'Kiểm tra đáp án': 'Check answers',
    'Gợi ý': 'Hint',
    'Lưu': 'Save',
    'Lưu nháp': 'Save draft',
    'Lưu lại': 'Save',
    'Huỷ': 'Cancel',
    'Hủy': 'Cancel',
    'Xoá': 'Delete',
    'Xóa': 'Delete',
    'Sửa': 'Edit',
    'Chỉnh sửa': 'Edit',
    'Chỉnh sửa thông tin': 'Edit profile',
    'Chọn': 'Select',
    'Chọn lại': 'Reselect',
    'Đóng lại': 'Close',
    'Bỏ qua': 'Skip',
    'Để sau': 'Later',
    'Đã hiểu': 'Got it',
    'Tiếp theo →': 'Next →',
    'Sau →': 'Next →',
    '← Trước': '← Previous',
    'Dừng lại': 'Stop',
    'Random': 'Random',
    'Ngẫu nhiên': 'Random',
    'Sao chép link': 'Copy link',
    'Mở tab mới': 'Open in new tab',
    'Đang tải...': 'Loading…',
    'Đang tải…': 'Loading…',
    'Đang xử lý...': 'Processing…',
    'Lỗi tải dữ liệu': 'Failed to load data',
    'Chưa có dữ liệu': 'No data yet',
    'Chưa có hoạt động nào': 'No activity yet',
    'Không có kết quả': 'No results',
    'Tất cả': 'All',
    'Đã làm': 'Done',
    'Chưa làm': 'Not done',
    'Lịch sử': 'History',
    'Lịch sử làm bài': 'Attempt history',
    'Lịch sử luyện tập': 'Practice history',
    'Chế độ': 'Mode',
    'Cài đặt': 'Settings',
    'Công cụ': 'Tools',
    'Câu hỏi': 'Question',
    'Đáp án': 'Answer',
    'Giải thích:': 'Explanation:',
    'Loại': 'Type',
    'Ngày': 'Date',
    'Thời gian': 'Time',
    'Điểm': 'Score',
    'Kết quả': 'Result',
    'Tuần': 'Week',
    'Chủ đề': 'Topic',
    'Cấp độ': 'Level',
    'Kỹ năng': 'Skill',
    'Số câu': 'Questions',
    'Số câu hỏi': 'Number of questions',
    'Mẹo': 'Tips',
    'Ghi chú của bạn': 'Your notes',

    // Skill landing pages — headings / cards
    'Luyện tập lẻ': 'Individual drills',
    'Luyện tập hay Thi thử': 'Practice or mock test',
    'Thi thử đầy đủ': 'Full mock test',
    'Chi tiết bài luyện': 'Session details',
    'Câu trả lời mẫu': 'Sample answer',
    'Cải thiện câu trả lời': 'Improve your answer',
    'Hiện câu hỏi': 'Show question',
    'Chọn tài liệu để xem': 'Pick a document to view',
    'Chọn đề Task 1': 'Choose a Task 1 prompt',
    'Chọn đề Task 2': 'Choose a Task 2 prompt',
    'Chọn câu hỏi để bắt đầu': 'Pick a question to begin',
    'Chọn tuần học để bắt đầu luyện tập': 'Pick a week to start practising',
    'Chọn cấp độ & kỹ năng trước khi bắt đầu': 'Choose a level & skill before you start',
    'Chọn cấp độ & chủ đề trước khi bắt đầu': 'Choose a level & topic before you start',
    'Chọn cấp độ và số câu rồi nhấn': 'Choose a level and question count, then press',
    'Số từ:': 'Word count:',
    'Số từ Task 1': 'Task 1 word count',
    'Số từ Task 2': 'Task 2 word count',
    'Bài mẫu từ Daniel': 'Model answers from Daniel',
    'Quý': 'Quarter',
    'Band tổng thể': 'Overall band',
    'Band Score: –': 'Band Score: –',
    'Lưu loát & mạch lạc': 'Fluency & coherence',
    'Ngữ pháp': 'Grammar',
    'Từ vựng': 'Vocabulary',
    'Phát âm': 'Pronunciation',

    // Exam / player controls
    'Nộp bài?': 'Submit now?',
    'Thoát khỏi bài thi?': 'Leave the test?',
    'Thoát luyện tập?': 'Leave practice?',
    'Dừng luyện tập?': 'Stop practising?',
    'Nộp bài luyện tập?': 'Submit this practice?',
    'Bạn có chắc muốn thoát bài luyện tập này không?': 'Are you sure you want to leave this practice?',
    'Cỡ chữ': 'Font size',
    'Kích cỡ chữ': 'Font size',
    'Bôi màu': 'Highlight',
    'Bôi màu (H)': 'Highlight (H)',
    'Dịch': 'Translate',
    'Dịch (T)': 'Translate (T)',
    'Dịch sang tiếng Việt': 'Translate to Vietnamese',
    'Bảo vệ mắt': 'Eye comfort',
    'Chế độ bảo vệ mắt': 'Eye-comfort mode',
    'Chuyển đến câu:': 'Go to question:',
    'Chờ audio...': 'Waiting for audio…',
    'Chờ audio…': 'Waiting for audio…',
    'Double-click để tra từ': 'Double-click a word to look it up',

    // Vocabulary book (sidebar / add-word chrome)
    '+ Tạo & lưu': '+ Create & save',
    'Hoặc tạo sổ mới:': 'Or create a new book:',
    'Tạo & lưu': 'Create & save',
    'Gộp sổ': 'Merge books',
    'Kho đồ': 'Inventory',
    'Búa Daniel': "Daniel's hammer",
    'Huy hiệu': 'Badges',
    'Chuỗi học liên tục của bạn': 'Your learning streak',
    'Cần ôn lại': 'To review',
    'Học từ vựng ngay': 'Study vocabulary now',
    'Học ngay': 'Study now',
    '📚 Lưu vào sổ từ vựng': '📚 Save to vocabulary book',
    'Lưu vào sổ từ vựng': 'Save to vocabulary book',

    // Profile
    'Hồ sơ – EnglishWithDan': 'Profile – EnglishWithDan',
    'Tổng quan': 'Overview',
    'Bảo mật': 'Security',
    'Họ': 'Last name',
    'Tên': 'First name',
    'Học sinh': 'Student',
    'Học viên': 'Student',
    'Gói học tập': 'Subscription',
    'Hết hạn:': 'Expires:',
    'Thành viên từ:': 'Member since:',
    'Mục tiêu: Band': 'Target: Band',
    'Giới thiệu bản thân': 'About you',
    'Motto học tập': 'Study motto',
    'Email không thể thay đổi': 'Email cannot be changed',
    'Band Score của tôi': 'My Band Scores',
    'Xu hướng Band Score': 'Band score trend',
    'Hoạt động gần đây': 'Recent activity',
    'Hoạt động học tập': 'Study activity',
    'Bài kiểm tra': 'Tests',
    'Bài Speaking': 'Speaking sessions',
    'Lịch sử Reading': 'Reading history',
    'Lịch sử Listening': 'Listening history',
    'Lịch sử Writing': 'Writing history',
    'Lịch sử Speaking': 'Speaking history',
    'Chưa có đủ dữ liệu để vẽ biểu đồ — làm vài bài test để bắt đầu theo dõi xu hướng.':
      'Not enough data to chart yet — take a few tests to start tracking your trend.',
    '-- Chưa đặt --': '— Not set —',

    // Goal & study plan (page is otherwise translated in-place)
    'Học hôm nay': "Today's learning",
    'Mục tiêu của bạn': 'Your goal',
    'Tổng quan mục tiêu': 'Goal summary',
    'Kế hoạch học tuần này': "This week's study plan",
    'Lưu mục tiêu': 'Save goal',
    'Ngày thi': 'Exam date',
    'Band mục tiêu': 'Target band',

    // Review history
    'Lịch sử Review – EnglishWithDan': 'Review history – EnglishWithDan',
    '📝 My Mistakes': '📝 My Mistakes',
    'My Mistakes': 'My Mistakes',
    'Tất cả nhóm lỗi': 'All error types',
    'Chưa có review nào phù hợp bộ lọc.': 'No reviews match the current filter.',
    'Bạn chưa hoàn thành bài thi thử full nào.': "You haven't completed any full mock test yet.",
    'Lỗi tải lịch sử review.': 'Failed to load review history.',
    'Lỗi tải lịch sử thi thử.': 'Failed to load mock-test history.',
    '🎯 Thi thử Full test': '🎯 Full mock test',
    '🎯 Thi thử Full 4 kỹ năng': '🎯 Full 4-skill mock test',
    'Xem lại Reading': 'Review Reading',

    // Inbox
    'Hộp thư – EnglishWithDan': 'Inbox – EnglishWithDan',
    'Hộp thư đến': 'Inbox',
    'Chọn một tin nhắn để đọc': 'Pick a message to read',

    // Task 2 practice
    'IELTS Task 2 Practice – EnglishWithDan': 'IELTS Task 2 Practice – EnglishWithDan',
    'Chưa có lịch sử luyện tập': 'No practice history yet',
    'Chưa có câu hỏi ở level này': 'No questions at this level',
    'Phiên học': 'Session',
    'TB chính xác': 'Avg. accuracy',
    'Bài làm': 'Attempts',
    'Tổng': 'Total',
    'Bạn:': 'You:',
    'Bạn trả lời:': 'Your answer:',
    'Bấm vào các từ để sắp xếp...': 'Tap the words to arrange them…',

    // Auth pages
    'Chào mừng trở lại!': 'Welcome back!',
    'Đăng nhập để tiếp tục luyện tập': 'Sign in to keep practising',
    'Email hoặc Username': 'Email or username',
    'Nhập email hoặc username': 'Enter your email or username',
    'Mật khẩu': 'Password',
    'Nhập mật khẩu': 'Enter your password',
    'Ghi nhớ đăng nhập': 'Remember me',
    'Quên mật khẩu?': 'Forgot password?',
    'Đăng Nhập': 'Sign In',
    'Đăng nhập': 'Sign in',
    'Đăng nhập ngay': 'Sign in now',
    'Chưa có tài khoản?': "Don't have an account?",
    'Đăng ký miễn phí': 'Sign up free',
    'Bắt đầu hành trình IELTS!': 'Start your IELTS journey!',
    'Tạo tài khoản để truy cập đầy đủ tính năng': 'Create an account for full access',
    'Tên đăng nhập': 'Username',
    'Nhập lại mật khẩu': 'Re-enter your password',
    'Tối thiểu 8 ký tự': 'At least 8 characters',
    'Độ mạnh mật khẩu': 'Password strength',
    'Xác nhận mật khẩu': 'Confirm password',
    'Đăng Ký Ngay': 'Sign Up Now',
    'Đã có tài khoản?': 'Already have an account?',
    'Sắp ra mắt': 'Coming soon',
    'Đăng nhập với Google': 'Sign in with Google',

    // Premium / upsell chrome
    'Nâng cấp Premium': 'Upgrade to Premium',
    'Nâng cấp Premium để làm bài thi IELTS thật': 'Upgrade to Premium for real IELTS tests',
    'Nâng cấp Premium để luyện tập không giới hạn': 'Upgrade to Premium for unlimited practice',
    'Bao gồm trong Premium': 'Included in Premium',
    'Nâng cấp': 'Upgrade',

    // Dashboard / vocabulary home
    'Vocabulary – EnglishWithDan': 'Vocabulary – EnglishWithDan',
    'Điểm cần cải thiện': 'Areas to improve',
    'Các chế độ học': 'Study modes',
    'Trạng thái từ vựng': 'Vocabulary status',
    'Trạng thái': 'Status',
    'Sổ từ vựng thông minh': 'Smart vocabulary book',
    'Sổ từ vựng': 'Vocabulary book',
    'Tạo & quản lý sổ': 'Create & manage books',
    'Tùy chọn sổ': 'Book options',
    'Tạo sổ mới:': 'Create a new book:',
    'Gộp sổ / Xóa sổ:': 'Merge / delete books:',
    'Nhập hàng loạt': 'Bulk import',
    'Nhập hàng loạt:': 'Bulk import:',
    'Thêm thủ công:': 'Add manually:',
    'Thêm từ vào sổ': 'Add words to a book',
    'Từ bài Reading:': 'From a Reading passage:',
    'Ví dụ (tự động)': 'Example (auto)',
    'Nghĩa': 'Meaning',
    'Từ': 'Word',
    'Top 10 Quiz điểm cao': 'Top 10 quiz scores',
    'Top 10 chuỗi học dài nhất': 'Top 10 longest streaks',
    'Tiến độ 7 ngày qua': 'Last 7 days',
    'Streak hàng ngày': 'Daily streak',
    'ngày streak': 'day streak',
    'Học Paraphrase': 'Learn Paraphrase',
    'Cụm từ Paraphrase Cambridge': 'Cambridge Paraphrase phrases',
    'Hồ sơ học sinh': 'Student profile',
    'Báo cáo': 'Report',
    'Gửi báo cáo': 'Send report',
    'Khám phá các kỹ năng khác': 'Explore other skills',
    'Xem hướng dẫn chi tiết': 'View the detailed guide',
    'Thi thử 4 kỹ năng': '4-skill mock test',
    'Lịch sử thi thử': 'Mock test history',
    'Bỏ qua & làm lại': 'Discard & restart',
    'Đang huỷ…': 'Cancelling…',
    'Đang giám sát': 'Proctoring',
    'Đang tạo đề…': 'Generating…',
    'Chưa có bài học nào': 'No lessons yet',
    'Không tìm thấy': 'Not found',
    'MỚI': 'NEW',
    'Từ yếu': 'Weak words',
    'Đã lưu': 'Saved',
    'Đã thuộc': 'Learned',
    'Chưa thuộc': 'Not learned',
    'Đổi bài': 'Change lesson',
    'Đổi bài khác': 'Pick another lesson',

    // Achievement badges (backend/constants/badges.js) — name + description
    'Người mới bắt đầu': 'Beginner',
    'Thợ săn từ vựng': 'Word hunter',
    'Bậc thầy từ vựng': 'Vocabulary master',
    'Đọc hiểu đầu tiên': 'First read',
    'Chuyên cần Reading': 'Reading regular',
    'Reading Band 7+': 'Reading Band 7+',
    'Đạt Band 7.0 trở lên ở Reading': 'Reach Band 7.0+ in Reading',
    'Nghe hiểu đầu tiên': 'First listen',
    'Chuyên cần Listening': 'Listening regular',
    'Listening Band 7+': 'Listening Band 7+',
    'Đạt Band 7.0 trở lên ở Listening': 'Reach Band 7.0+ in Listening',
    'Cây bút đầu tiên': 'First draft',
    'Kiên trì luyện viết': 'Persistent writer',
    'Writing Band 7+': 'Writing Band 7+',
    'Được giáo viên chấm Band 7.0 trở lên ở Writing': 'Teacher-marked Band 7.0+ in Writing',
    'Tự tin lên tiếng': 'Speaking up',
    'Luyện nói bền bỉ': 'Persistent speaker',
    'Speaking Band 7+': 'Speaking Band 7+',
    'Đạt Band 7.0 trở lên ở Speaking': 'Reach Band 7.0+ in Speaking',
    '7 ngày bền bỉ': '7-day grit',
    'Duy trì streak học 7 ngày': 'Keep a 7-day study streak',
    '30 ngày kỷ luật': '30-day discipline',
    'Duy trì streak học 30 ngày': 'Keep a 30-day study streak',
    '100 ngày huyền thoại': '100-day legend',
    'Duy trì streak học 100 ngày': 'Keep a 100-day study streak',
    'Nộp 1 bài thi Writing': 'Submit 1 Writing test',
    'Hoàn thành 1 bài thi Reading': 'Complete 1 Reading test',
    'Hoàn thành 25 bài thi Reading': 'Complete 25 Reading tests',
    'Hoàn thành 1 bài thi Listening': 'Complete 1 Listening test',
    'Hoàn thành 25 bài thi Listening': 'Complete 25 Listening tests',
    'Hoàn thành 1 bài thi Speaking': 'Complete 1 Speaking test',
    'Hoàn thành 20 bài thi Speaking': 'Complete 20 Speaking tests',
    'Nộp 10 bài thi Writing': 'Submit 10 Writing tests',
    'Thuộc lòng 20 từ vựng': 'Master 20 vocabulary words',
    'Thuộc lòng 100 từ vựng': 'Master 100 vocabulary words',
    'Thuộc lòng 300 từ vựng': 'Master 300 vocabulary words',

    // Profile page (entries already covered in earlier sections are not repeated)
    'Trang cá nhân – EnglishWithDan': 'Profile – EnglishWithDan',
    'Đã đạt': 'Earned',
    'huy hiệu': 'badges',
    'Chưa có huy hiệu nào': 'No badges yet',
    'Study activity': 'Study activity',
    'Ít': 'Less',
    'Nhiều': 'More',
    'Your learning streak': 'Your learning streak',
    'SUBSCRIPTION': 'SUBSCRIPTION',
    'Ngày thi dự kiến': 'Planned exam date',
    'Màu chủ đề cá nhân': 'Personal accent colour',
    'Task 1 (số từ)': 'Task 1 (word count)',
    'Task 2 (số từ)': 'Task 2 (word count)',
    'Số từ mục tiêu Task 1': 'Task 1 target word count',
    'Số từ mục tiêu Task 2': 'Task 2 target word count',
    'Username không thể thay đổi': 'Username cannot be changed',
    'Lưu thay đổi': 'Save changes',
    'Đổi mật khẩu': 'Change password',
    'Mật khẩu hiện tại': 'Current password',
    'Mật khẩu mới': 'New password',
    'Xác nhận mật khẩu mới': 'Confirm new password',
    'Phiên đăng nhập': 'Login sessions',
    'Được lưu trên thiết bị này': 'Saved on this device',
    'Đăng xuất khỏi thiết bị này': 'Log out of this device',
    'Đăng xuất tất cả thiết bị khác': 'Log out all other devices',
    'Free': 'Free',
    '🆓 Free': '🆓 Free',
    'Reading Band': 'Reading Band',
    'Listening Band': 'Listening Band',
    'Writing Band': 'Writing Band',
    'Speaking Band': 'Speaking Band',
    'Tests': 'Tests',
    'Speaking sessions': 'Speaking sessions',

    // Common labels seen across dashboard / goal / skill pages
    'Hôm nay': 'Today',
    'Hôm qua': 'Yesterday',
    'Tuần này': 'This week',
    'Tháng này': 'This month',
    'Xong': 'Done',
    'Đang làm': 'In progress',
    'Đang làm dở': 'In progress',
    'Đang chờ chấm': 'Awaiting grading',
    'Chờ chấm': 'Awaiting grading',
    'Đã nộp': 'Submitted',
    'Chưa nộp': 'Not submitted',
    'Đã hoàn thành': 'Completed',
    'Chưa hoàn thành': 'Not completed',
    'Đúng': 'Correct',
    'Sai': 'Wrong',
    'Bỏ trống': 'Blank',
    'Chính xác': 'Accuracy',
    'Độ chính xác': 'Accuracy',
    'Tổng điểm': 'Total score',
    'Điểm số': 'Score',
    'Xem kết quả': 'View result',
    'Bắt đầu ngay': 'Start now',
    'Tiếp tục làm bài': 'Resume',
    'Nộp bài ngay': 'Submit now',
    'Đang chấm...': 'Grading…',
    'Đang lưu...': 'Saving…',
    'Đã lưu nháp': 'Draft saved',
    'Không có kết nối mạng': 'No network connection',
    'Thử lại': 'Try again',
    'Tải lại': 'Reload',
    'Xác nhận': 'Confirm',
    'Có': 'Yes',
    'Không': 'No',
    'Hôm nay bạn chưa học': "You haven't studied today",
    'Mục tiêu': 'Goal',
    'Mục tiêu:': 'Target:',
    'Mục tiêu Band': 'Target Band',
    '🎯 Mục tiêu: Band': '🎯 Target: Band',
    'Từ vựng hôm nay': "Today's vocabulary",
    'Ôn tập hôm nay': "Today's review",
    'Từ đến hạn ôn': 'Words due for review',
    'Ôn lại từ hay sai': 'Review your frequent mistakes',
    // Daily vocab-goal nudge (nav.js) — fragments around <strong> counts
    '🔁 Bạn có': '🔁 You have',
    'đến hạn ôn hôm nay.': 'due for review today.',
    '🔁 Ôn ngay': '🔁 Review now',
    'Đã học đủ': 'Studied all',
    'hôm nay. Giữ phong độ! 🔥': 'today. Keep it up! 🔥',
    '— bạn đã học': '— studied',
    ', còn': ', remaining',

    // goal.html — labels left Vietnamese after the earlier in-place i18n
    'Trình độ IELTS hiện tại (tự đánh giá, không bắt buộc)': 'Current IELTS level (self-assessed, optional)',
    'Thời gian học mỗi tuần (phút)': 'Weekly study time (minutes)',
    'Số phút mỗi buổi': 'Minutes per session',
    'Ngày học trong tuần': 'Study days',
    '— Chưa đặt —': '— Not set —',
    '— Chọn —': '— Choose —',
    'Hiện tại (tự đánh giá)': 'Current (self-assessed)',
    'Hiện tại (—)': 'Current (—)',
    'Chênh lệch': 'Gap',
    'Ngày còn lại': 'Days left',
    'Đã qua': 'Past',
    'Phút/tuần': 'Weekly minutes',
    'Ngày/tuần': 'Days/week',
    'Không thể tải kế hoạch học.': 'Unable to load your study plan.',
    'Thiết lập mục tiêu ở trên để tạo kế hoạch.': 'Set up your goal above to generate a plan.',
    'Hôm nay chưa có lịch học nào.': 'Nothing scheduled for today.',
    'Hôm nay không phải ngày học theo lịch của bạn.': 'Today is not one of your scheduled study days.',
    'Đặt mục tiêu bên dưới ↓': 'Set your goal below ↓',
    'Không thể tải nội dung học hôm nay.': "Unable to load today's learning.",

    // dashboard section headers / common
    'Nối tiêu đề': 'Matching headings',
    'Điền từ': 'Fill in the blank',
    'Đề ngẫu nhiên · Listening → Reading → Writing → Speaking':
      'Random test · Listening → Reading → Writing → Speaking',
    'Bài học hôm nay': "Today's lesson"
  };

  // ── Templated strings ────────────────────────────────────────────────
  // A plain "vi": "en" map can't touch strings with a number/date baked in
  // ("Còn 1020 ngày", "Đã đạt 6/18 huy hiệu", "Mục tiêu: Band 7.5"). These
  // patterns run only when a text node's trimmed value has no direct DICT
  // hit; the ORIGINAL is still stashed on the node, so switching back is
  // exact (no reverse patterns needed). Order matters — first match wins.
  var PATTERNS = [
    [/^Còn (\d[\d.]*) ngày$/, 'Left: $1 days'],
    [/^Còn (\d+) ngày nữa$/, '$1 days left'],
    [/^(\d+) ngày$/, '$1 days'],
    [/^(\d+) ngày trước$/, '$1 days ago'],
    [/^1 ngày trước$/, '1 day ago'],
    [/^(\d+) giờ trước$/, '$1 hours ago'],
    [/^(\d+) phút trước$/, '$1 minutes ago'],
    [/^Mục tiêu:? Band ([\d.]+)$/, 'Target: Band $1'],
    [/^Mục tiêu Band Score$/, 'Target Band Score'],
    [/^Đã đạt (\d+)\/(\d+) huy hiệu$/, '$1/$2 badges earned'],
    [/^Đã đạt (\d+)\/(\d+)$/, '$1/$2 earned'],
    [/^Thuộc lòng (\d+) từ vựng$/, 'Master $1 vocabulary words'],
    [/^Hoàn thành (\d+) bài thi (Reading|Listening|Writing|Speaking)$/, 'Complete $1 $2 tests'],
    [/^Nộp (\d+) bài thi Writing$/, 'Submit $1 Writing tests'],
    [/^Hoàn thành (\d+) bài thi (Reading|Listening|Speaking)$/, 'Complete $1 $2 tests'],
    [/^Đạt Band ([\d.]+) trở lên ở (Reading|Listening|Speaking)$/, 'Reach Band $1+ in $2'],
    [/^Được giáo viên chấm Band ([\d.]+) trở lên ở Writing$/, 'Get a teacher-marked Band $1+ in Writing'],
    [/^Duy trì streak học (\d+) ngày$/, 'Keep a $1-day study streak'],
    [/^(\d+)\/(\d+) từ$/, '$1/$2 words'],
    [/^(\d+)\/(\d+) câu$/, '$1/$2 questions'],
    [/^(\d+) từ$/, '$1 words'],
    [/^(\d+) từ mới$/, '$1 new words'],
    [/^(\d+) câu$/, '$1 questions'],
    [/^(\d+) bài$/, '$1 tests'],
    [/^Câu (\d+)$/, 'Question $1'],
    [/^Phần (\d+)$/, 'Part $1'],
    [/^Tuần (\d+)$/, 'Week $1'],
    [/^Bước (\d+)\/(\d+)$/, 'Step $1/$2'],
    [/^\(tối đa (\d+) ký tự\)$/, '(max $1 characters)'],
    [/^\/(\d+) ký tự$/, '/$1 characters'],
    [/^(\d+)\/(\d+) ký tự$/, '$1/$2 characters'],
    [/^Trang (\d+)\/(\d+)$/, 'Page $1/$2'],
    [/^Trang (\d+)\/(\d+) · (\d+) đề$/, 'Page $1/$2 · $3 tests'],
    [/^Lần cuối:?\s*(.+)$/, 'Last: $1'],
    [/^Cập nhật:?\s*(.+)$/, 'Updated: $1'],
    [/^Band ([\d.]+)$/, 'Band $1'],
    [/^(\d+) từ đang chờ$/, '$1 words pending'],
    [/^(\d+) bài đang chờ Review$/, '$1 reviews pending'],
  ];

  function _applyPatterns(str) {
    for (var i = 0; i < PATTERNS.length; i++) {
      if (PATTERNS[i][0].test(str)) return str.replace(PATTERNS[i][0], PATTERNS[i][1]);
    }
    return null;
  }

  // Reverse map for switching back EN → VI on nodes we didn't stash.
  var REV = {};
  Object.keys(DICT).forEach(function (vi) { if (!(DICT[vi] in REV)) REV[DICT[vi]] = vi; });

  var LANG = 'vi';
  try { var s = localStorage.getItem(STORAGE_KEY); if (s === 'en' || s === 'vi') LANG = s; } catch (e) {}

  var _applying = false;
  var _observer = null;

  function _translit(key, toEn) {
    if (toEn) return Object.prototype.hasOwnProperty.call(DICT, key) ? DICT[key] : null;
    return Object.prototype.hasOwnProperty.call(REV, key) ? REV[key] : null;
  }

  function _handleTextNode(node, toEn) {
    var parent = node.parentNode;
    if (!parent || SKIP_TAGS[parent.nodeName]) return;
    if (parent.closest && parent.closest('[data-i18n-skip]')) return;
    var raw = node.nodeValue;
    if (!raw || !raw.trim()) return;

    if (toEn) {
      if (node.__ewsVi != null) return; // already translated
      var key = raw.trim();
      var en = _translit(key, true);
      if (en == null) en = _applyPatterns(key);   // templated fallback
      if (en != null && en !== key) {
        node.__ewsVi = raw;
        node.nodeValue = raw.replace(key, en);
      }
    } else {
      if (node.__ewsVi != null) {
        node.nodeValue = node.__ewsVi;
        node.__ewsVi = null;
      } else {
        // node added while in EN and never stashed — best-effort reverse
        var k = raw.trim();
        var vi = _translit(k, false);
        if (vi != null && vi !== k) node.nodeValue = raw.replace(k, vi);
      }
    }
  }

  var ATTR_LIST = ['placeholder', 'title', 'aria-label', 'alt'];

  function _handleAttrs(el, toEn) {
    if (el.closest && el.closest('[data-i18n-skip]')) return;
    var attrs = ATTR_LIST.slice();
    if ((el.nodeName === 'INPUT' && /^(submit|button|reset)$/i.test(el.type)) ) attrs.push('value');
    attrs.forEach(function (a) {
      if (!el.hasAttribute(a)) return;
      var cur = el.getAttribute(a);
      if (!cur || !cur.trim()) return;
      el.__ewsAttr = el.__ewsAttr || {};
      if (toEn) {
        if (el.__ewsAttr[a] != null) return;
        var en = _translit(cur.trim(), true);
        if (en != null && en !== cur.trim()) {
          el.__ewsAttr[a] = cur;
          el.setAttribute(a, cur.replace(cur.trim(), en));
        }
      } else if (el.__ewsAttr[a] != null) {
        el.setAttribute(a, el.__ewsAttr[a]);
        el.__ewsAttr[a] = null;
      }
    });
  }

  function _walk(root, toEn) {
    if (!root) return;
    // text nodes
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var batch = [];
    var n;
    while ((n = tw.nextNode())) batch.push(n);
    batch.forEach(function (node) { _handleTextNode(node, toEn); });
    // attributes
    var els = [];
    if (root.nodeType === 1) {
      els.push(root);
      root.querySelectorAll('[placeholder],[title],[aria-label],[alt],input,button').forEach(function (e) { els.push(e); });
    } else if (root.querySelectorAll) {
      root.querySelectorAll('[placeholder],[title],[aria-label],[alt],input,button').forEach(function (e) { els.push(e); });
    }
    els.forEach(function (el) { if (el.nodeType === 1) _handleAttrs(el, toEn); });
  }

  function apply() {
    if (!document.body) return;
    _applying = true;
    var toEn = LANG === 'en';
    try {
      document.documentElement.setAttribute('lang', LANG);
      _walk(document.body, toEn);
      // <title>
      if (toEn) {
        if (document.title && document.__ewsTitle == null) {
          var t = _translit(document.title.trim(), true);
          if (t) { document.__ewsTitle = document.title; document.title = t; }
        }
      } else if (document.__ewsTitle != null) {
        document.title = document.__ewsTitle; document.__ewsTitle = null;
      }
      _syncButtons();
    } finally {
      _applying = false;
    }
  }

  function _syncButtons() {
    // Nav pill: shows the language you'd switch TO. Guard every write so a
    // no-op assignment can't churn the DOM (and wake the MutationObserver).
    var pill = document.getElementById('globalLangBtn');
    if (pill) {
      // pill is now a whole dropdown row ("<icon-badge> Ngôn ngữ (VI/EN)"),
      // not a bare "EN"/"VI" button — write into the inner badge span (nav.js)
      // so this doesn't blow away the row's icon/label. Falls back to the
      // pill itself if an older cached nav.js hasn't nested the badge yet.
      var badge = pill.querySelector('.nav-util-lang-badge') || pill;
      var pillTxt = LANG === 'vi' ? 'EN' : 'VI';
      if (badge.textContent !== pillTxt) badge.textContent = pillTxt;
      var ttl = LANG === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt';
      if (pill.getAttribute('title') !== ttl) {
        pill.setAttribute('title', ttl);
        pill.setAttribute('aria-label', ttl);
      }
    }
    var mobHtml = '<i class="fas fa-language" style="width:20px;text-align:center"></i> ' +
      (LANG === 'vi' ? 'English' : 'Tiếng Việt');
    document.querySelectorAll('.ews-lang-mobile').forEach(function (el) {
      if (el.innerHTML !== mobHtml) el.innerHTML = mobHtml;
    });
  }

  function _startObserver() {
    if (_observer) return;
    _observer = new MutationObserver(function (muts) {
      if (_applying || LANG !== 'en') return;
      var roots = [];
      muts.forEach(function (m) {
        // ignore our own button churn (data-i18n-skip regions)
        if (m.target && m.target.nodeType === 1 && m.target.closest &&
            m.target.closest('[data-i18n-skip]')) return;
        m.addedNodes && m.addedNodes.forEach(function (nd) {
          if (nd.nodeType === 1 || nd.nodeType === 3) roots.push(nd);
        });
      });
      if (!roots.length) return;
      _applying = true;
      try {
        roots.forEach(function (r) {
          if (r.nodeType === 3) _handleTextNode(r, true);
          else _walk(r, true);
        });
      } finally { _applying = false; }
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  }

  function set(lang) {
    lang = lang === 'en' ? 'en' : 'vi';
    if (lang === LANG) { _syncButtons(); return; }
    LANG = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    apply();
    try { document.dispatchEvent(new CustomEvent('ews:langchange', { detail: { lang: lang } })); } catch (e) {}
  }

  function toggle() { set(LANG === 'vi' ? 'en' : 'vi'); }

  function t(vi) {
    if (LANG !== 'en') return vi;
    var key = (vi || '').trim();
    var en = _translit(key, true);
    return en != null ? vi.replace(key, en) : vi;
  }

  window.EWSI18n = {
    get lang() { return LANG; },
    set: set,
    toggle: toggle,
    apply: apply,
    t: t,
    DICT: DICT
  };

  function boot() {
    apply();
    _startObserver();
    // A second pass after full load catches late synchronous renders.
    window.addEventListener('load', function () { if (LANG === 'en') apply(); }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
