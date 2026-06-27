import { Box, CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentDashboard from '../pages/student/StudentDashboard';
import CoursesPage from '../pages/student/CoursesPage';
import MyCoursesPage from '../pages/student/MyCoursesPage';
import CourseDetailPage from '../pages/student/CourseDetailPage';
import CourseLevelPage from '../pages/student/CourseLevelPage';
import CodeReviewPage from '../pages/student/CodeReviewPage';
import ProfilePage from '../pages/student/ProfilePage';
import ChangePasswordPage from '../pages/student/ChangePasswordPage';
import AssessmentPage from '../pages/student/AssessmentPage';
import AssessmentDetailPage from '../pages/student/AssessmentDetailPage';
import AssessmentStartPage from '../pages/student/AssessmentStartPage';
import AssessmentTestingPage from '../pages/student/AssessmentTestingPage';
import AssessmentResultPage from '../pages/student/AssessmentResultPage';
import AssessmentHistoryPage from '../pages/student/AssessmentHistoryPage';
import AssessmentPerformancePage from '../pages/student/AssessmentPerformancePage';
import AssessmentModulePage from '../pages/student/AssessmentModulePage';
import StudentSidebar from '../components/student/StudentSidebar';
import StudentTopbar from '../components/student/StudentTopbar';

const StudentLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <StudentSidebar />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <StudentTopbar />
        <Routes>
          <Route path="" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:courseId" element={<CourseDetailPage />} />
          <Route path="courses/:courseId/levels/:level" element={<CourseLevelPage />} />
          <Route path="my-courses" element={<MyCoursesPage />} />
          <Route path="assessments" element={<AssessmentPage />} />
          <Route path="assessments/history" element={<AssessmentHistoryPage />} />
          <Route path="assessments/performance" element={<AssessmentPerformancePage />} />
          <Route path="assessments/:module(question-bank|assessment-management|coding-test|compiler|evaluation|results|violation-monitoring)" element={<AssessmentModulePage />} />
          <Route path="assessments/:assessmentId/start" element={<AssessmentStartPage />} />
          <Route path="assessments/:assessmentId/test" element={<AssessmentTestingPage />} />
          <Route path="assessments/:assessmentId/result" element={<AssessmentResultPage />} />
          <Route path="assessments/:id" element={<AssessmentDetailPage />} />
          <Route path="code-review" element={<CodeReviewPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default StudentLayout;
