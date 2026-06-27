import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './ManageQuestionsPage.css';

const LevelCard = ({ level }) => {
  const difficultySummary = Object.entries(level.difficultyDistribution)
    .filter(([, count]) => count > 0)
    .map(([difficulty, count]) => `${difficulty}: ${count}`)
    .join(' • ') || 'No questions yet';

  return (
    <div className="question-level-card">
      <div className="question-level-card-title">
        <span className="level-chip">Level {level.level}</span>
        <span className="question-count">{level.questionCount} questions</span>
      </div>
      <p className="question-level-copy">{difficultySummary}</p>
    </div>
  );
};

const QuestionLevelsPage = () => {
  const { courseId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/questions/courses/${courseId}/summary`);
        setSummary(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load level summary');
      } finally {
        setLoading(false);
      }
    };
    if (courseId) {
      loadSummary();
    }
  }, [courseId]);

  return (
    <div className="question-management-page container">
      <div className="section-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>{summary?.courseTitle || 'Course Levels'}</h1>
          <p className="section-copy">
            Select a level to manage questions or review the difficulty profile across the course.
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={() => navigate('/admin/questions')}>
          Back to courses
        </button>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <div className="empty-state error">{error}</div>
      ) : !summary || summary.levels.length === 0 ? (
        <div className="empty-state">No levels found for this course.</div>
      ) : (
        <div className="level-grid">
          {summary.levels.map((level) => (
            <button
              key={level.level}
              type="button"
              className="question-level-card-wrapper"
              onClick={() => navigate(`/admin/questions/manage?courseId=${courseId}&level=${level.level}`)}
            >
              <LevelCard level={level} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionLevelsPage;
