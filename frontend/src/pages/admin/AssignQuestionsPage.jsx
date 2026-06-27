import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AssignQuestionsPage.css';

const AssignQuestionsPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [assessmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch assessment
      const assessmentRes = await axios.get(`/api/assessments/${assessmentId}`, {
        withCredentials: true,
      });
      setAssessment(assessmentRes.data);

      // Set already selected questions
      setSelectedQuestions(assessmentRes.data.questions.map((q) => q.questionId._id || q.questionId));

      // Fetch all available questions
      const questionsRes = await axios.get('/api/questions', { withCredentials: true });
      setAvailableQuestions(questionsRes.data.questions || []);

      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (questionId) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSave = async () => {
    if (selectedQuestions.length === 0) {
      setError('Please select at least one question');
      return;
    }

    try {
      setSaving(true);
      await axios.post(
        `/api/assessments/${assessmentId}/assign-questions`,
        { questionIds: selectedQuestions },
        { withCredentials: true }
      );

      navigate(`/admin/assessment/${assessmentId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign questions');
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = availableQuestions.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = !difficultyFilter || q.difficulty === difficultyFilter;
    const matchesType = !typeFilter || q.type === typeFilter;
    return matchesSearch && matchesDifficulty && matchesType;
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="assign-questions-page">
      <div className="page-header">
        <h1>Assign Questions to Assessment</h1>
        <p className="subtitle">{assessment?.name}</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="layout">
        {/* Left: Question Filter & List */}
        <div className="questions-panel">
          <div className="panel-header">
            <h3>Available Questions</h3>
            <span className="count">{filteredQuestions.length} questions</span>
          </div>

          <div className="filters">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="MCQ">MCQ</option>
              <option value="Programming">Programming</option>
              <option value="Written">Written</option>
            </select>
          </div>

          <div className="questions-list">
            {filteredQuestions.length === 0 ? (
              <div className="empty-state">No questions found</div>
            ) : (
              filteredQuestions.map((question) => (
                <div
                  key={question._id}
                  className={`question-item ${selectedQuestions.includes(question._id) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    id={`q-${question._id}`}
                    checked={selectedQuestions.includes(question._id)}
                    onChange={() => toggleQuestion(question._id)}
                    className="checkbox"
                  />
                  <label htmlFor={`q-${question._id}`} className="question-label">
                    <div className="question-title">{question.title}</div>
                    <div className="question-meta">
                      <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
                        {question.difficulty}
                      </span>
                      <span className="type">{question.type}</span>
                      <span className="marks">{question.marks} marks</span>
                    </div>
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Selected Questions Summary */}
        <div className="summary-panel">
          <div className="panel-header">
            <h3>Selected Questions</h3>
            <span className="count">{selectedQuestions.length} selected</span>
          </div>

          <div className="summary-info">
            <div className="info-item">
              <span className="label">Assessment:</span>
              <span className="value">{assessment?.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Required:</span>
              <span className="value">{assessment?.totalQuestions} questions</span>
            </div>
            <div className="info-item">
              <span className="label">Selected:</span>
              <span className={`value ${selectedQuestions.length === assessment?.totalQuestions ? 'valid' : 'invalid'}`}>
                {selectedQuestions.length} questions
              </span>
            </div>
          </div>

          {selectedQuestions.length > 0 && (
            <div className="selected-questions">
              <h4>Selected Questions List</h4>
              <ul>
                {selectedQuestions.map((qId) => {
                  const q = availableQuestions.find((aq) => aq._id === qId);
                  return (
                    q && (
                      <li key={qId}>
                        <span className="title">{q.title}</span>
                        <span className="difficulty">{q.difficulty}</span>
                        <button
                          type="button"
                          onClick={() => toggleQuestion(qId)}
                          className="btn-remove"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </li>
                    )
                  );
                })}
              </ul>
            </div>
          )}

          <div className="actions">
            <button
              onClick={handleSave}
              disabled={saving || selectedQuestions.length === 0}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Assign Questions'}
            </button>
            <button
              onClick={() => navigate(`/admin/assessment/${assessmentId}`)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignQuestionsPage;
