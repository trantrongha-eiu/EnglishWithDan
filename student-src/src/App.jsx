import { lazy, Suspense } from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ToastProvider } from './contexts/ToastProvider';
import ProtectedRoute from './routes/ProtectedRoute';
import StudentLayout from './layouts/StudentLayout';
import PageCss from './components/PageCss';

import Dashboard from './pages/Dashboard';
import Welcome from './pages/dashboard/Welcome';
import BookView from './pages/dashboard/BookView';
const Practice = lazy(() => import('./pages/dashboard/Practice'));
const Browse = lazy(() => import('./pages/dashboard/Browse'));
const Lesson = lazy(() => import('./pages/dashboard/Lesson'));
const Classroom = lazy(() => import('./pages/Classroom'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Shop = lazy(() => import('./pages/Shop'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Profile = lazy(() => import('./pages/Profile'));
const Tuition = lazy(() => import('./pages/Tuition'));
const ReviewHistory = lazy(() => import('./pages/ReviewHistory'));
const Dictation = lazy(() => import('./pages/Dictation'));
const Shadowing = lazy(() => import('./pages/Shadowing'));
const EssentialGrammar = lazy(() => import('./pages/EssentialGrammar'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Each list is the page's stylesheets in the old static page's order
const LEADERBOARD_CSS = ['entrance-test', 'vocab-leaderboard', 'duel', 'pf-pages'];
const SHOP_CSS = ['entrance-test', 'shop', 'duel', 'pf-pages'];
const INBOX_CSS = ['inbox', 'pf-pages'];
const PROFILE_CSS = ['profile', 'pf-profile', 'inventory', 'goal'];
const TUITION_CSS = ['tuition', 'pf-pages'];
const REVIEW_HISTORY_CSS = ['review-history', 'pf-pages'];
const DICTATION_CSS = ['dictation', 'pf-pages'];
const SHADOWING_CSS = ['shadowing', 'pf-pages'];
// playful again after the page's own sheet: same order as the old page, or .eg-hero wipes the banner colour
const GRAMMAR_CSS = ['writing-practice', 'essential-grammar', 'playful', 'pf-pages'];

// A data router: running quizzes use useBlocker to ask before leaving
const router = createBrowserRouter(createRoutesFromElements(
  <>
    <Route path="/" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />}>
        <Route index element={<Welcome />} />
        <Route path="book/:bookId" element={<BookView />} />
        <Route path="book/:bookId/practice" element={<Practice />} />
        <Route path="practice" element={<Practice />} />
        <Route path="lesson/:lessonId" element={<Lesson />} />
        <Route path="unit/:unitNumber" element={<Practice />} />
        <Route path="topics" element={<Browse key="topics" kind="topics" />} />
        <Route path="paraphrase" element={<Browse key="paraphrase" kind="paraphrase" />} />
      </Route>
      <Route path="classroom" element={<Classroom />} />
      <Route path="leaderboard" element={<PageCss names={LEADERBOARD_CSS}><Leaderboard /></PageCss>} />
      <Route path="shop" element={<PageCss names={SHOP_CSS}><Shop /></PageCss>} />
      <Route path="inbox" element={<PageCss names={INBOX_CSS}><Inbox /></PageCss>} />
      <Route path="profile" element={<PageCss names={PROFILE_CSS}><Profile /></PageCss>} />
      <Route path="tuition" element={<PageCss names={TUITION_CSS}><Tuition /></PageCss>} />
      <Route path="review-history" element={<PageCss names={REVIEW_HISTORY_CSS}><ReviewHistory /></PageCss>} />
      <Route path="dictation" element={<PageCss names={DICTATION_CSS}><Dictation /></PageCss>} />
      <Route path="shadowing" element={<PageCss names={SHADOWING_CSS}><Shadowing /></PageCss>} />
      <Route path="essential-grammar" element={<PageCss names={GRAMMAR_CSS}><EssentialGrammar /></PageCss>} />
      <Route path="*" element={<NotFound />} />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </>,
), { basename: '/app' });

// Tell the site nav (js/nav.js) about route changes
router.subscribe(() => window.dispatchEvent(new Event('ews:route')));
// …and let it change route without a page load
window.ewsNavigate = (to) => router.navigate(to);

// Plain links to /app/… (site menu, list cards) go through the router, so
// they stay in its history and Back can be guarded during a quiz.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest?.('a[href^="/app/"]');
  if (!a || (a.target && a.target !== '_self') || !/^\/app(\/|$)/.test(location.pathname)) return;
  e.preventDefault();
  router.navigate(a.getAttribute('href').slice('/app'.length));
});

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<div className="route-loading">Đang tải…</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}
