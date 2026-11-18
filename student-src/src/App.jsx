import { lazy, Suspense } from 'react';
import { createHashRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ToastProvider } from './contexts/ToastProvider';
import ProtectedRoute from './routes/ProtectedRoute';
import StudentLayout from './layouts/StudentLayout';

import Dashboard from './pages/Dashboard';
import Welcome from './pages/dashboard/Welcome';
import BookView from './pages/dashboard/BookView';
const Practice = lazy(() => import('./pages/dashboard/Practice'));
const Browse = lazy(() => import('./pages/dashboard/Browse'));
const Lesson = lazy(() => import('./pages/dashboard/Lesson'));
const NotFound = lazy(() => import('./pages/NotFound'));

// A data router: running quizzes use useBlocker to ask before leaving
const router = createHashRouter(createRoutesFromElements(
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
      <Route path="*" element={<NotFound />} />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </>,
));

// Tell the site nav (js/nav.js) about route changes
router.subscribe(() => window.dispatchEvent(new Event('ews:route')));

// Plain links to /app/#/… (site menu, list cards) go through the router, so
// they stay in its history and Back can be guarded during a quiz.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest?.('a[href^="/app/#"]');
  if (!a || (a.target && a.target !== '_self') || !['/app', '/app/'].includes(location.pathname)) return;
  e.preventDefault();
  router.navigate(a.getAttribute('href').slice('/app/#'.length));
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
