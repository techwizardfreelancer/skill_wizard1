import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './SubmissionDetailPage.css';

const SubmissionDetailPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [gradePayload, setGradePayload] = useState({
    marksObtained: 0,
    result: 'Pass',
    adminNotes: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/assessments/submission/${submissionId}/details`, {
          withCredentials: true,
        });
        setSubmission(response.data);
        setGradePayload({
          marksObtained: response.data.marksObtained ?? 0,
          result: response.data.result || 'Pass',
          adminNotes: response.data.adminNotes || '',
        });
        setError('');
      } catch (err) {
        console.error(err);
        setError('Unable to load submission details.');
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const handleGradeChange = (field, value) => {
    setGradePayload((prev) => ({ ...prev, [field]: value }));
  };

  const handleGradeSubmit = async (event) => {
    event.preventDefault();
    if (!submission) return;

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.put(
        `/api/assessments/submission/${submissionId}/grade`,
        gradePayload,
        { withCredentials: true }
      );
      setSubmission(response.data);
      setSuccessMessage('Grades saved successfully.');
    } catch (err) {
      console.error(err);
      setError('Unable to save grades.');
    } finally {
      setSaving(false);
    }
  };


  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusClass = `badge badge-${status?.toLowerCase() || 'pending'}`;
    return <span className={statusClass}>{status || 'Pending'}</span>;
  };

  return (
    <div className="submission-detail-page">
      <div className="page-header">
        <h1>Submission Details</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {loading && <div className="loading">Loading submission...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && submission && (
        <div className="submission-detail-card">
          <div className="submission-summary">
            <div>
              <strong>Student</strong>
              <div>{submission.studentId?.name || submission.studentId?.email || 'Unknown'}</div>
            </div>
            <div>
              <strong>Email</strong>
              <div>{submission.studentId?.email || '-'}</div>
            </div>
            <div>
              <strong>Assessment</strong>
              <div>{submission.assessmentId?.name || '-'}</div>
            </div>
            <div>
              <strong>Status</strong>
              <div>{getStatusBadge(submission.status)}</div>
            </div>
            <div>
              <strong>Result</strong>
              <div>{submission.result || 'Pending'}</div>
            </div>
            <div>
              <strong>Marks</strong>
              <div>{submission.marksObtained ?? 0}/{submission.totalMarks ?? 0}</div>
            </div>
            <div>
              <strong>Percentage</strong>
              <div>{submission.percentage?.toFixed?.(2) ?? '0.00'}%</div>
            </div>
            <div>
              <strong>Submitted</strong>
              <div>{formatDate(submission.submitTime)}</div>
            </div>
            <div>
              <strong>Time Taken</strong>
              <div>{submission.totalTimeSpent ? `${submission.totalTimeSpent}s` : '-'}</div>
            </div>
            <div>
              <strong>Violations</strong>
              <div>{submission.violationCount ?? 0}</div>
            </div>
          </div>

          <div className="grade-editor-section">
            <h2>Grade Review</h2>
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            <form className="grade-editor-form" onSubmit={handleGradeSubmit}>
              <div className="form-row">
                <label htmlFor="marksObtained">Marks Obtained</label>
                <input
                  id="marksObtained"
                  type="number"
                  min="0"
                  max={submission.totalMarks ?? 0}
                  value={gradePayload.marksObtained}
                  onChange={(e) => handleGradeChange('marksObtained', Number(e.target.value))}
                />
              </div>
              <div className="form-row">
                <label htmlFor="result">Result</label>
                <select
                  id="result"
                  value={gradePayload.result}
                  onChange={(e) => handleGradeChange('result', e.target.value)}
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="adminNotes">Admin Notes</label>
                <textarea
                  id="adminNotes"
                  rows="4"
                  value={gradePayload.adminNotes}
                  onChange={(e) => handleGradeChange('adminNotes', e.target.value)}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Grades'}
                </button>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
            </form>
          </div>

          <div className="selected-questions-section">
            <h2>Assigned Questions</h2>
            {Array.isArray(submission.selectedQuestions) && submission.selectedQuestions.length > 0 ? (
              <table className="selected-questions-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Question</th>
                    <th>Marks</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {submission.selectedQuestions.map((item, index) => (
                    <tr key={item.questionId?._id || index}>
                      <td>{index + 1}</td>
                      <td>{item.questionId?.title || 'Question not found'}</td>
                      <td>{item.marks ?? item.questionId?.marks ?? '-'}</td>
                      <td>{item.questionId?.type || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No assigned questions found for this submission.</p>
            )}
          </div>

          <div className="answers-section">
            <h2>Answers</h2>
            {Array.isArray(submission.answers) && submission.answers.length > 0 ? (
              <div className="answers-list">
                {submission.answers.map((answer, index) => (
                  <div key={index} className="answer-card">
                    <div className="answer-header">
                      <span className="answer-number">Q{index + 1}</span>
                      <span className="answer-question-title">
                        {answer.questionId?.title || 'Unknown Question'}
                      </span>
                    </div>
                    <div className="answer-field">
                      <strong>Answer:</strong>
                      <pre>{answer.answer || '-'}</pre>
                    </div>
                    <div className="answer-field">
                      <strong>Marks Obtained:</strong>
                      <span>{answer.marksObtained ?? '-'}</span>
                    </div>
                    {answer.feedback && (
                      <div className="answer-field">
                        <strong>Feedback:</strong>
                        <div>{answer.feedback}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No answers submitted yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetailPage;
