import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import ReadingTestEdit from './pages/ReadingTestEdit';
import ListeningTests from './pages/ListeningTests';
import ListeningTestEdit from './pages/ListeningTestEdit';
import ListeningSections from './pages/ListeningSections';
import ListeningSectionEdit from './pages/ListeningSectionEdit';
import WritingTests from './pages/WritingTests';
import Speaking from './pages/Speaking';
import Vocabulary from './pages/Vocabulary';
import WritingPractice from './pages/WritingPractice';
import Task1Exercises from './pages/Task1Exercises';
import Task2Exercises from './pages/Task2Exercises';
import Task2Templates from './pages/Task2Templates';
import StudentHistory from './pages/StudentHistory';
import VocabActivity from './pages/VocabActivity';
import Messages from './pages/Messages';
import WritingGrades from './pages/WritingGrades';
import WritingSamples from './pages/WritingSamples';
import Tuition from './pages/Tuition';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="access-codes" element={<AccessCodes />} />
                <Route path="courses" element={<Courses />} />
                <Route path="passages" element={<Passages />} />
                <Route path="reading-tests" element={<ReadingTests />} />
                <Route path="reading-tests/:id" element={<ReadingTestEdit />} />
                <Route path="listening-tests" element={<ListeningTests />} />
                <Route path="listening-tests/:id" element={<ListeningTestEdit />} />
                <Route path="listening-sections" element={<ListeningSections />} />
                <Route path="listening-sections/:id" element={<ListeningSectionEdit />} />
                <Route path="writing-tests" element={<WritingTests />} />
                <Route path="speaking" element={<Speaking />} />
                <Route path="vocabulary" element={<Vocabulary />} />
                <Route path="writing-practice" element={<WritingPractice />} />
                <Route path="task1-exercises" element={<Task1Exercises />} />
                <Route path="task2-exercises" element={<Task2Exercises />} />
                <Route path="task2-templates" element={<Task2Templates />} />
                <Route path="history" element={<StudentHistory />} />
                <Route path="vocab-activity" element={<VocabActivity />} />
                <Route path="messages" element={<Messages />} />
                <Route path="writing-grades" element={<WritingGrades />} />
                <Route path="writing-samples" element={<WritingSamples />} />
                <Route path="tuition" element={<Tuition />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}
