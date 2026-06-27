import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AssessmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/assessments/${id}`, {
          withCredentials: true,
        });
        setAssessment(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load assessment details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssessment();
    }
  }, [id]);

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

  if (loading) {
    return <div className="loading">Loading assessment details...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!assessment) {
    return <div className="empty-state">Assessment not found.</div>;
  }

  return (
    <div className="assessment-detail-page">
      <div className="page-header">
        <h1>Assessment Details</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/assessments/manage')}>
          ← Back to Assessments
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h2>{assessment.name}</h2>
          <p>{assessment.description || 'No description provided.'}</p>
          <div className="status-row">
            <span className="badge badge-secondary">{assessment.status}</span>
            <span>{assessment.totalQuestions} questions</span>
            <span>{assessment.duration} min</span>
          </div>
          <div className="course-row" style={{ marginTop: '1rem' }}>
            <strong>Course:</strong> {assessment.courseId?.title || 'N/A'}
          </div>
        </div>

        <div className="detail-card">
          <h3>Window</h3>
          <p>{formatDate(assessment.startDate)} → {formatDate(assessment.endDate)}</p>
          <h3>Marks</h3>
          <p>Total: {assessment.totalMarks}</p>
          <p>Passing: {assessment.passingMarks}</p>
          <h3>Violations</h3>
          <p>Max allowed: {assessment.maxViolations ?? 'N/A'}</p>
        </div>

        <div className="detail-card">
          <h3>Settings</h3>
          <ul>
            <li>Random Question Order: {assessment.randomQuestionOrder ? 'Yes' : 'No'}</li>
            <li>Allow Tab Switch: {assessment.allowTabSwitch ? 'Yes' : 'No'}</li>
            <li>Allow Copy/Paste: {assessment.allowCopyPaste ? 'Yes' : 'No'}</li>
            <li>Require Fullscreen: {assessment.requireFullscreen ? 'Yes' : 'No'}</li>
          </ul>
          <h3>Languages</h3>
          <p>{(assessment.programmingLanguages || []).join(', ') || 'Any'}</p>
        </div>

        <div className="detail-card full-width">
          <h3>Difficulty Distribution</h3>
          <div className="distribution-list">
            {assessment.difficultyDistribution
              ? Object.entries(assessment.difficultyDistribution).map(([key, value]) => (
                  <div key={key} className="distribution-item">
                    <strong>{key}</strong>
                    <span>{value}%</span>
                  </div>
                ))
              : <p>No difficulty distribution set.</p>}
          </div>

          <h3>Assigned Students</h3>
          {assessment.assignedStudents && assessment.assignedStudents.length > 0 ? (
            <div className="assigned-list">
              {assessment.assignedStudents.map((student) => (
                <div key={student._id} className="assigned-item">
                  <span>{student.name}</span>
                  <span>{student.email}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No students assigned.</p>
          )}
        </div>
      </div>

      <div className="action-row">
        <button className="btn btn-primary" onClick={() => navigate(`/admin/assessment/${assessment._id}/edit`)}>
          Edit Assessment
        </button>
        <button className="btn btn-primary" onClick={() => navigate(`/admin/assessment/${assessment._id}/questions`)}>
          Assign Questions
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(`/admin/assessment/${assessment._id}/results`)}>
          View Results
        </button>
      </div>
    </div>
  );
};

export default AssessmentDetailPage;
