import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ToastProvider } from './contexts/ToastProvider';
import { ThemeProvider } from './contexts/ThemeProvider';
import ProtectedRoute from './routes/ProtectedRoute';
import StudentLayout from './layouts/StudentLayout';

import Dashboard from './pages/Dashboard';
import Welcome from './pages/dashboard/Welcome';
import BookView from './pages/dashboard/BookView';
const Practice = lazy(() => import('./pages/dashboard/Practice'));
const Browse = lazy(() => import('./pages/dashboard/Browse'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<div className="route-loading">Đang tải…</div>}>
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <StudentLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />}>
                    <Route index element={<Welcome />} />
                    <Route path="book/:bookId" element={<BookView />} />
                    <Route path="book/:bookId/practice" element={<Practice />} />
                    <Route path="practice" element={<Practice />} />
                    <Route path="topics" element={<Browse key="topics" kind="topics" />} />
                    <Route path="paraphrase" element={<Browse key="paraphrase" kind="paraphrase" />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
}
