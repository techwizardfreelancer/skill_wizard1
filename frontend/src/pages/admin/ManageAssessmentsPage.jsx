import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManageAssessmentsPage.css';

const ManageAssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const limit = 10;

  useEffect(() => {
    fetchAssessments();
  }, [page, statusFilter, search]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(courseFilter && { course: courseFilter }),
        ...(statusFilter && { status: statusFilter }),
      };

      const response = await axios.get('/api/assessments', { params, withCredentials: true });
      setAssessments(response.data.assessments);
      setTotal(response.data.total);
      setError('');
    } catch (err) {
      setError('Failed to fetch assessments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await axios.delete(`/api/assessments/${id}`, { withCredentials: true });
        setAssessments(assessments.filter((a) => a._id !== id));
      } catch (err) {
        setError('Failed to delete assessment');
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      await axios.post(`/api/assessments/${id}/publish`, {}, { withCredentials: true });
      fetchAssessments();
    } catch (err) {
      setError('Failed to publish assessment');
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = `badge badge-${status.toLowerCase()}`;
    return <span className={statusClass}>{status}</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="manage-assessments-page">
      <div className="page-header">
        <h1>Manage Assessments</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/create-assessment')}>
          + Create Assessment
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filter-section">
        <input
          type="text"
          placeholder="Search assessments..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="search-input"
        />

        <input
          type="text"
          placeholder="Filter by course title..."
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value);
            setPage(1);
          }}
          className="search-input"
          style={{ marginLeft: '1rem' }}
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="status-filter"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading assessments...</div>
      ) : assessments.length === 0 ? (
        <div className="empty-state">
          <p>No assessments found. Create one to get started!</p>
        </div>
      ) : (
        <>
          <div className="assessments-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Questions</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Duration</th>
                  <th>Languages</th>
                  <th>Violations</th>
                  <th>Total Marks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment) => (
                  <tr key={assessment._id}>
                    <td className="assessment-name">{assessment.name}</td>
                    <td>{assessment.courseId?.title || 'N/A'}</td>
                    <td>{getStatusBadge(assessment.status)}</td>
                    <td className="text-center">{assessment.assignedStudents?.length || 0}</td>
                    <td className="text-center">{assessment.questions.length}</td>
                    <td>{formatDate(assessment.startDate)}</td>
                    <td>{formatDate(assessment.endDate)}</td>
                    <td>{assessment.duration} min</td>
                    <td>{(assessment.programmingLanguages || []).join(', ') || 'Any'}</td>
                    <td>{assessment.maxViolations ?? '-'}</td>
                    <td className="text-right">{assessment.totalMarks}</td>
                    <td className="actions-cell">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => navigate(`/admin/assessment/${assessment._id}`)}
                        title="View Details"
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/admin/assessment/${assessment._id}/edit`)}
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => navigate(`/admin/assessment/${assessment._id}/questions`)}
                        title="Assign Questions"
                      >
                        Questions
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => navigate(`/admin/assessment/${assessment._id}/results`)}
                        title="View Results"
                      >
                        Results
                      </button>
                      {assessment.status === 'Draft' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handlePublish(assessment._id)}
                          title="Publish"
                        >
                          Publish
                        </button>
                      )}
                      {assessment.status === 'Draft' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(assessment._id)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn btn-sm"
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * limit >= total}
              className="btn btn-sm"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageAssessmentsPage;
