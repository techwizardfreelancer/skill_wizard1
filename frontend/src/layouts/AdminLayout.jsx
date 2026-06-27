import { Box, CssBaseline } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageStudentsPage from '../pages/admin/ManageStudentsPage';
import ManageCoursesPage from '../pages/admin/ManageCoursesPage';
import ManageCodeReviewsPage from '../pages/admin/ManageCodeReviewsPage';
import ChangePasswordPage from '../pages/student/ChangePasswordPage';
import AdminAssessmentsPage from '../pages/admin/AdminAssessmentsPage';
import AdminAttemptsPage from '../pages/admin/AdminAttemptsPage';
import ManageAssessmentsPage from '../pages/admin/ManageAssessmentsPage';
import CreateAssessmentPage from '../pages/admin/CreateAssessmentPage';
import AssignQuestionsPage from '../pages/admin/AssignQuestionsPage';
import AssessmentDetailPage from '../pages/admin/AssessmentDetailPage';
import ViewSubmissionsPage from '../pages/admin/ViewSubmissionsPage';
import SubmissionDetailPage from '../pages/admin/SubmissionDetailPage';
import ManageQuestionsPage from '../pages/admin/ManageQuestionsPage';
import CreateQuestionPage from '../pages/admin/CreateQuestionPage';
import AdminQuestionManagementPage from '../pages/admin/AdminQuestionManagementPage';
import QuestionCoursesPage from '../pages/admin/QuestionCoursesPage';
import QuestionLevelsPage from '../pages/admin/QuestionLevelsPage';
import QuestionDetailPage from '../pages/admin/QuestionDetailPage';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AdminSidebar />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <AdminTopbar />
        <Routes>
          <Route path="" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudentsPage />} />
          <Route path="courses" element={<ManageCoursesPage />} />
          <Route path="code-reviews" element={<ManageCodeReviewsPage />} />
          <Route path="tests" element={<AdminAssessmentsPage />} />
          <Route path="assessments" element={<AdminAssessmentsPage />} />
          <Route path="assessments/manage" element={<ManageAssessmentsPage />} />
          <Route path="attempts" element={<AdminAttemptsPage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="create-assessment" element={<CreateAssessmentPage />} />
          <Route path="assessment/:id" element={<AssessmentDetailPage />} />
          <Route path="assessment/:id/edit" element={<CreateAssessmentPage />} />
          <Route path="assessment/:id/questions" element={<AssignQuestionsPage />} />
          <Route path="assessment/:assessmentId/results" element={<ViewSubmissionsPage />} />
          <Route path="submission/:submissionId" element={<SubmissionDetailPage />} />
          <Route path="questions" element={<QuestionCoursesPage />} />
          <Route path="questions/courses/:courseId/levels" element={<QuestionLevelsPage />} />
          <Route path="questions/manage" element={<AdminQuestionManagementPage />} />
          <Route path="questions/create" element={<CreateQuestionPage />} />
          <Route path="questions/:id" element={<QuestionDetailPage />} />
          <Route path="questions/:id/edit" element={<CreateQuestionPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminLayout;
