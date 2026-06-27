import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ViewSubmissionsPage.css';

const ViewSubmissionsPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'analytics'

  const limit = 10;

  useEffect(() => {
    fetchData();
  }, [assessmentId, page, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch assessment
      const assessmentRes = await axios.get(`/api/assessments/${assessmentId}`, {
        withCredentials: true,
      });
      setAssessment(assessmentRes.data);

      // Fetch submissions
      const params = {
        page,
        limit,
        ...(statusFilter && { status: statusFilter }),
      };
      const submissionsRes = await axios.get(`/api/assessments/${assessmentId}/submissions`, {
        params,
        withCredentials: true,
      });
      setSubmissions(submissionsRes.data.submissions);

      // Fetch results/analytics
      const resultsRes = await axios.get(`/api/assessments/${assessmentId}/results`, {
        withCredentials: true,
      });
      setResults(resultsRes.data);

      setError('');
    } catch (err) {
      setError('Failed to load submissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (submissionId) => {
    navigate(`/admin/submission/${submissionId}`);
  };

  const getStatusBadge = (status) => {
    const statusClass = `badge badge-${status.toLowerCase()}`;
    return <span className={statusClass}>{status}</span>;
  };

  const getResultBadge = (result) => {
    const resultClass = `badge badge-${result?.toLowerCase() || 'pending'}`;
    return <span className={resultClass}>{result || 'Pending'}</span>;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div className="view-submissions-page">
      <div className="page-header">
        <h1>Assessment Results</h1>
        <p className="subtitle">{assessment?.name}</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/admin/assessments')}
        >
          ← Back to Assessments
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {assessment && (
        <div className="assessment-details-card">
          <div className="details-grid">
            <div>
              <strong>Name</strong>
              <div>{assessment.name}</div>
            </div>
            <div>
              <strong>Duration</strong>
              <div>{assessment.duration} min</div>
            </div>
            <div>
              <strong>Questions</strong>
              <div>{assessment.questions?.length || 'N/A'}</div>
            </div>
            <div>
              <strong>Total Marks</strong>
              <div>{assessment.totalMarks}</div>
            </div>
            <div>
              <strong>Passing</strong>
              <div>{assessment.passingMarks}%</div>
            </div>
            <div>
              <strong>Window</strong>
              <div>{formatDate(assessment.startDate)} - {formatDate(assessment.endDate)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Submissions ({submissions?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && results && (
        <div className="analytics-section">
          <div className="analytics-grid">
            <div className="stat-card">
              <div className="stat-value">{results.totalSubmissions}</div>
              <div className="stat-label">Total Submissions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{results.passCount}</div>
              <div className="stat-label">Passed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{results.failCount}</div>
              <div className="stat-label">Failed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{results.eliminatedCount}</div>
              <div className="stat-label">Eliminated</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{results.averageViolations}</div>
              <div className="stat-label">Avg Violations</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{results.startedCount}</div>
              <div className="stat-label">Started Attempts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{results.averageSelectedQuestions}</div>
              <div className="stat-label">Avg Assigned Questions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{results.randomQuestionOrder ? 'Yes' : 'No'}</div>
              <div className="stat-label">Randomization Enabled</div>
            </div>
          </div>

          <div className="toppers-section">
            <h3>Topper Performance</h3>
            {results.toppers && results.toppers.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {results.toppers.map((topper, index) => (
                    <tr key={index}>
                      <td className="rank">#{index + 1}</td>
                      <td>{topper.student}</td>
                      <td className="marks">{topper.marks}</td>
                      <td className="percentage">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${topper.percentage}%` }}
                          />
                          <span>{topper.percentage.toFixed(2)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No submissions yet</p>
            )}
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'list' && (
        <>
          <div className="filter-section">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="status-filter"
            >
              <option value="">All Statuses</option>
              <option value="InProgress">In Progress</option>
              <option value="Submitted">Submitted</option>
              <option value="Graded">Graded</option>
              <option value="Eliminated">Eliminated</option>
            </select>
          </div>

          {submissions.length === 0 ? (
            <div className="empty-state">
              <p>No submissions found</p>
            </div>
          ) : (
            <>
              <div className="submissions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Level</th>
                      <th>Test Date</th>
                      <th>Status</th>
                      <th>Assigned Qs</th>
                      <th>Marks</th>
                      <th>Percentage</th>
                      <th>Time Taken</th>
                      <th>Violations</th>
                      <th>Result</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission._id}>
                        <td className="student-name">
                          {submission.studentId?.name || 'Unknown'}
                        </td>
                        <td>{submission.studentId?.email || '-'}</td>
                        <td>{submission.course?.title || assessment?.courseId?.title || 'N/A'}</td>
                        <td>{submission.registrationLevel || 'N/A'}</td>
                        <td>{formatDate(assessment?.startDate)}</td>
                        <td>{getStatusBadge(submission.status)}</td>
                        <td>{submission.selectedQuestions?.length ?? 0}</td>
                        <td className="marks">
                          {submission.marksObtained}/{submission.totalMarks}
                        </td>
                        <td>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${submission.totalMarks ? (submission.marksObtained / submission.totalMarks) * 100 : 0}%`,
                              }}
                            />
                            <span>{submission.totalMarks ? ((submission.marksObtained / submission.totalMarks) * 100).toFixed(2) : '0.00'}%</span>
                          </div>
                        </td>
                        <td>{submission.timeTaken ? `${submission.timeTaken}s` : '-'}</td>
                        <td>{submission.violations ?? 0}</td>
                        <td>{getResultBadge(submission.result)}</td>
                        <td>{formatDate(submission.submitTime)}</td>
                        <td className="actions-cell">
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleViewDetails(submission._id)}
                            title="View Details"
                          >
                            View
                          </button>
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
                <span className="page-info">Page {page}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page * limit >= (results?.totalSubmissions || 0)}
                  className="btn btn-sm"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ViewSubmissionsPage;
