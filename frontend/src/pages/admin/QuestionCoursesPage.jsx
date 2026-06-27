import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ManageQuestionsPage.css';

const CourseCard = ({ course, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="question-course-card"
    >
      <div className="question-course-card-header">
        <h3>{course.title}</h3>
        <span className="badge">{course.totalLevels} Levels</span>
      </div>
      <p className="course-subtitle">Total questions: {course.totalQuestions}</p>
      <div className="course-footer">
        <span className="course-pill">Questions</span>
        <span className="course-pill">Levels</span>
      </div>
    </button>
  );
};

const QuestionCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/questions/courses/summaries');
        setCourses(res.data.courses || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load courses');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  return (
    <div className="question-management-page container">
      <div className="section-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Question Management</h1>
          <p className="section-copy">
            Choose a course to view levels and manage questions for that learning path.
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => navigate('/admin/questions/create')}>
          Create Question
        </button>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <div className="empty-state error">{error}</div>
      ) : courses.length === 0 ? (
        <div className="empty-state">No courses available yet. Create a course first or add questions from the course page.</div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => navigate(`/admin/questions/courses/${course.id}/levels`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionCoursesPage;
