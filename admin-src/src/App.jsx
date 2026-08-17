import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ToastProvider } from './contexts/ToastProvider';
import { ThemeProvider } from './contexts/ThemeProvider';
import { ConfirmProvider } from './components/ConfirmProvider';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
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
import VocabularyLessons from './pages/VocabularyLessons';
import VocabularyLessonImport from './pages/VocabularyLessonImport';
import EssentialGrammarLessons from './pages/EssentialGrammarLessons';
import WritingPractice from './pages/WritingPractice';
import Task1Exercises from './pages/Task1Exercises';
import Task2Topics from './pages/Task2Topics';
import Task2Templates from './pages/Task2Templates';
import StudentHistory from './pages/StudentHistory';
import ReadingStats from './pages/ReadingStats';
import VocabActivity from './pages/VocabActivity';
import StudentDetail from './pages/StudentDetail';
import Messages from './pages/Messages';
import WritingGrades from './pages/WritingGrades';
import Tuition from './pages/Tuition';
import UpgradeRequests from './pages/UpgradeRequests';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ThemeProvider>
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
                <Route path="vocabulary-lessons" element={<VocabularyLessons />} />
                <Route path="vocabulary-lessons/import" element={<VocabularyLessonImport />} />
                <Route path="essential-grammar" element={<EssentialGrammarLessons />} />
                <Route path="writing-practice" element={<WritingPractice />} />
                <Route path="task1-exercises" element={<Task1Exercises />} />
                <Route path="task2-exercises" element={<Task2Topics />} />
                <Route path="task2-templates" element={<Task2Templates />} />
                <Route path="history" element={<StudentHistory />} />
                <Route path="reading-stats" element={<ReadingStats />} />
                <Route path="vocab-activity" element={<VocabActivity />} />
                <Route path="students/:id" element={<StudentDetail />} />
                <Route path="messages" element={<Messages />} />
                <Route path="writing-grades" element={<WritingGrades />} />
                {/* Bài mẫu Writing was consolidated into WritingTests.jsx's "📄 Bài mẫu"
                    tab (was a second, drifted-UI page managing the exact same
                    WritingSample data) — redirect old bookmarks/links instead of 404ing. */}
                <Route path="writing-samples" element={<Navigate to="/writing-tests" replace />} />
                <Route path="tuition" element={<ProtectedRoute role="admin"><Tuition /></ProtectedRoute>} />
                <Route path="upgrade-requests" element={<ProtectedRoute role="admin"><UpgradeRequests /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
    </ThemeProvider>
  );
}
