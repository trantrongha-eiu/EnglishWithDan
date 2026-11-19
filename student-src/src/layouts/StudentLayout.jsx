import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const TITLES = {
  '/dashboard': 'Vocabulary',
  '/classroom': 'Lớp học',
  '/leaderboard': 'BXH Vocab',
  '/shop': 'Cửa hàng lửa',
  '/inbox': 'Hộp thư',
  '/profile': 'Hồ sơ',
  '/tuition': 'Học phí',
  '/review-history': 'Lịch sử Review',
  '/dictation': 'Luyện Dictation',
  '/shadowing': 'Luyện Shadowing',
  '/essential-grammar': 'Essential Grammar',
  '/advanced-sentences': 'Viết câu nâng cao',
};

// The top nav comes from the site shell (js/bundles/app-shell.js → nav.js).
export default function StudentLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = Object.keys(TITLES).find((p) => pathname.startsWith(p));
    document.title = page ? `${TITLES[page]} – EnglishWithDan` : 'EnglishWithDan';
    // A new page starts at the top (the vocab home handles its own scrolling)
    if (!pathname.startsWith('/dashboard')) window.scrollTo(0, 0);
  }, [pathname]);

  return <Outlet />;
}
