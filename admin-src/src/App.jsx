import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './components/ConfirmDialog';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import AccessCodes from './pages/AccessCodes';
import Courses from './pages/Courses';
import Passages from './pages/Passages';
import ReadingTests from './pages/ReadingTests';
import ListeningTests from './pages/ListeningTests';
import WritingTests from './pages/WritingTests';
import Speaking from './pages/Speaking';
import Vocabulary from './pages/Vocabulary';
import WritingPractice from './pages/WritingPractice';
import StudentHistory from './pages/StudentHistory';
import VocabActivity from './pages/VocabActivity';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Routes>
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="access-codes" element={<AccessCodes />} />
                <Route path="courses" element={<Courses />} />
                <Route path="passages" element={<Passages />} />
                <Route path="reading-tests" element={<ReadingTests />} />
                <Route path="listening-tests" element={<ListeningTests />} />
                <Route path="writing-tests" element={<WritingTests />} />
                <Route path="speaking" element={<Speaking />} />
                <Route path="vocabulary" element={<Vocabulary />} />
                <Route path="writing-practice" element={<WritingPractice />} />
                <Route path="history" element={<StudentHistory />} />
                <Route path="vocab-activity" element={<VocabActivity />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
