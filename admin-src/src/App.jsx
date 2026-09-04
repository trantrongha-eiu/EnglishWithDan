import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ToastProvider } from './contexts/ToastProvider';
import { ThemeProvider } from './contexts/ThemeProvider';
import { ConfirmProvider } from './components/ConfirmProvider';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

// BUG-017: Dashboard is the default landing route (see the index redirect
// below), so it stays a static import for the fastest first paint. Every
// other page was a static import too, which forced Vite to bundle all ~26
// admin pages into one 757 kB chunk regardless of which page an admin
// actually opens. Routing them through React.lazy() lets Vite split each
// into its own chunk, fetched only when that route is visited.
import Dashboard from './pages/Dashboard';
const Users = lazy(() => import('./pages/Users'));
const Courses = lazy(() => import('./pages/Courses'));
const Classes = lazy(() => import('./pages/Classes'));
const ClassDetail = lazy(() => import('./pages/ClassDetail'));
const Passages = lazy(() => import('./pages/Passages'));
const ReadingTests = lazy(() => import('./pages/ReadingTests'));
const ReadingTestEdit = lazy(() => import('./pages/ReadingTestEdit'));
const ListeningTests = lazy(() => import('./pages/ListeningTests'));
const ListeningTestEdit = lazy(() => import('./pages/ListeningTestEdit'));
const ListeningSections = lazy(() => import('./pages/ListeningSections'));
const ListeningSectionEdit = lazy(() => import('./pages/ListeningSectionEdit'));
const WritingTests = lazy(() => import('./pages/WritingTests'));
const Speaking = lazy(() => import('./pages/Speaking'));
const Vocabulary = lazy(() => import('./pages/Vocabulary'));
const VocabularyLessons = lazy(() => import('./pages/VocabularyLessons'));
const VocabularyLessonImport = lazy(() => import('./pages/VocabularyLessonImport'));
const EssentialGrammarLessons = lazy(() => import('./pages/EssentialGrammarLessons'));
const WritingPractice = lazy(() => import('./pages/WritingPractice'));
const Task1Exercises = lazy(() => import('./pages/Task1Exercises'));
const AdvancedSentences = lazy(() => import('./pages/AdvancedSentences'));
const Task2Topics = lazy(() => import('./pages/Task2Topics'));
const Task2Templates = lazy(() => import('./pages/Task2Templates'));
const StudentHistory = lazy(() => import('./pages/StudentHistory'));
const Monitoring = lazy(() => import('./pages/Monitoring'));
const MockTests = lazy(() => import('./pages/MockTests'));
const ReadingStats = lazy(() => import('./pages/ReadingStats'));
const ListeningStats = lazy(() => import('./pages/ListeningStats'));
const VocabActivity = lazy(() => import('./pages/VocabActivity'));
const StudentDetail = lazy(() => import('./pages/StudentDetail'));
const Messages = lazy(() => import('./pages/Messages'));
const WritingGrades = lazy(() => import('./pages/WritingGrades'));
const Tuition = lazy(() => import('./pages/Tuition'));
const UpgradeRequests = lazy(() => import('./pages/UpgradeRequests'));
const ReviewBypassCodes = lazy(() => import('./pages/ReviewBypassCodes'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <ThemeProvider>
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Suspense fallback={<div className="route-loading">Đang tải…</div>}>
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
                <Route path="classes" element={<Classes />} />
                <Route path="classes/:id" element={<ClassDetail />} />
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
                <Route path="advanced-sentences" element={<AdvancedSentences />} />
                <Route path="task2-exercises" element={<Task2Topics />} />
                <Route path="task2-templates" element={<Task2Templates />} />
                <Route path="monitoring" element={<Monitoring />} />
                <Route path="mock-tests" element={<MockTests />} />
                <Route path="history" element={<StudentHistory />} />
                <Route path="review-bypass" element={<ReviewBypassCodes />} />
                <Route path="reading-stats" element={<ReadingStats />} />
                <Route path="listening-stats" element={<ListeningStats />} />
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
            </Suspense>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
    </ThemeProvider>
  );
}
