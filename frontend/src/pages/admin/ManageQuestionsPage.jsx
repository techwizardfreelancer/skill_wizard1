import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ManageQuestionsPage.css';

const ManageQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [type, setType] = useState('');
  const limit = 10;
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      if (difficulty) params.difficulty = difficulty;
      if (type) params.type = type;

      const res = await api.get('/questions', { params });
      setQuestions(res.data.questions || []);
      setTotal(res.data.total || 0);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, difficulty, type]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      setQuestions((prev) => prev.filter((question) => question._id !== id));
      setTotal((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete question');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="manage-questions-page">
      <div className="page-header">
        <div>
          <h1>Question Bank</h1>
          <p>Search, filter, and manage the admin question bank.</p>
        </div>
        <button className="primary-button" onClick={() => navigate('/admin/questions/create')}>
          Create Question
        </button>
      </div>

      <div className="filter-bar">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="filter-controls">
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option>
            <option value="Programming">Programming</option>
            <option value="Written">Written</option>
          </select>
          <button className="secondary-button" onClick={() => {
            setSearch('');
            setDifficulty('');
            setType('');
            setPage(1);
          }}>
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading questions...</div>
      ) : error ? (
        <div className="empty-state error">{error}</div>
      ) : questions.length === 0 ? (
        <div className="empty-state">No questions found.</div>
      ) : (
        <div className="questions-table-wrapper">
          <table className="questions-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Level</th>
                <th>Difficulty</th>
                <th>Type</th>
                <th>Marks</th>
            <th>Test Cases</th>
            <th>Tags</th>
            <th>Created</th>
            <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question._id}>
                  <td>{question.title}</td>
                  <td>{question.courseTitle || 'N/A'}</td>
                  <td>{question.level || 1}</td>
                  <td>{question.difficulty}</td>
                  <td>{question.type}</td>
                  <td>{question.marks}</td>
                  <td>
                    V: {question.visibleTestCases || 0}
                    {typeof question.hiddenTestCases === 'number' ? ` / H: ${question.hiddenTestCases}` : ''}
                  </td>
                  <td>{(question.tags || []).join(', ')}</td>
                  <td>{new Date(question.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button className="action-button" onClick={() => navigate(`/admin/questions/${question._id}/edit`)}>
                      Edit
                    </button>
                    <button className="action-button danger" onClick={() => handleDelete(question._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button className="secondary-button" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button className="secondary-button" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestionsPage;
