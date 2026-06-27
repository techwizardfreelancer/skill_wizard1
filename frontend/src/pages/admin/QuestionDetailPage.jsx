import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './ManageQuestionsPage.css';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [preview, setPreview] = useState(null);
  const [versions, setVersions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuestion = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.get(`/questions/${id}`);
        setQuestion(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load question details.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id]);

  const loadPreview = async () => {
    if (!id) return;
    try {
      setMetaLoading(true);
      const res = await api.get(`/questions/${id}/preview`);
      setPreview(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load preview.');
    } finally {
      setMetaLoading(false);
    }
  };

  const loadVersions = async () => {
    if (!id) return;
    try {
      setMetaLoading(true);
      const res = await api.get(`/questions/${id}/versions`);
      setVersions(res.data.versions || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load version history.');
    } finally {
      setMetaLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    if (!id) return;
    try {
      setMetaLoading(true);
      const res = await api.get(`/questions/${id}/audit`);
      setAuditLogs(res.data.logs || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load audit logs.');
    } finally {
      setMetaLoading(false);
    }
  };

  const renderTestCases = () => {
    if (!Array.isArray(question?.testCases) || question.testCases.length === 0) {
      return <p>No test cases available.</p>;
    }

    return (
      <div className="test-cases-list">
        {question.testCases.map((testCase, index) => (
          <div key={index} className="test-case-row">
            <div className="test-case-field">
              <strong>Input</strong>
              <pre>{testCase.input || '-'}</pre>
            </div>
            <div className="test-case-field">
              <strong>Expected Output</strong>
              <pre>{testCase.expectedOutput || '-'}</pre>
            </div>
            <div className="test-case-controls">
              <span>{testCase.isHidden ? 'Hidden' : 'Visible'}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="question-management-page container">
      <div className="page-header">
        <div>
          <h1>Question Details</h1>
          <p>Review full question metadata, test cases, and content.</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading question details...</div>
      ) : error ? (
        <div className="empty-state error">{error}</div>
      ) : !question ? (
        <div className="empty-state">Question not found.</div>
      ) : (
        <div className="question-detail-card">
          <div className="form-section">
            <h2>{question.title}</h2>
            <p>{question.description}</p>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Course</label>
              <div>{question.course?.title || question.courseId || 'N/A'}</div>
            </div>
            <div className="form-field">
              <label>Level</label>
              <div>{question.level}</div>
            </div>
            <div className="form-field">
              <label>Difficulty</label>
              <div>{question.difficulty}</div>
            </div>
            <div className="form-field">
              <label>Status</label>
              <div>{question.status}</div>
            </div>
            <div className="form-field">
              <label>Workflow Status</label>
              <div>{question.workflowStatus || 'N/A'}</div>
            </div>
            <div className="form-field">
              <label>Bloom Level</label>
              <div>{question.bloomLevel || 'N/A'}</div>
            </div>
            <div className="form-field">
              <label>Bloom Category</label>
              <div>{question.bloomCategory || 'None'}</div>
            </div>
            <div className="form-field">
              <label>Type</label>
              <div>{question.type}</div>
            </div>
            <div className="form-field">
              <label>Marks</label>
              <div>{question.marks}</div>
            </div>
            <div className="form-field full-width">
              <label>Languages</label>
              <div>{(question.programmingLanguages || []).join(', ') || 'N/A'}</div>
            </div>
            <div className="form-field full-width">
              <label>Tags</label>
              <div>{(question.tags || []).join(', ') || 'None'}</div>
            </div>
          </div>

          {question.type === 'MCQ' && (
            <div className="form-section">
              <h2>MCQ Options</h2>
              {Array.isArray(question.options) && question.options.length > 0 ? (
                question.options.map((option, index) => (
                  <div key={index} className="option-row">
                    <div>{option.text || '-'}</div>
                    <div>{option.isCorrect ? 'Correct' : 'Incorrect'}</div>
                  </div>
                ))
              ) : (
                <p>No options available.</p>
              )}
            </div>
          )}

          {question.type === 'Programming' && (
            <div className="form-section">
              <h2>Programming Settings</h2>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Input Format</label>
                  <div>{question.inputFormat || 'N/A'}</div>
                </div>
                <div className="form-field full-width">
                  <label>Output Format</label>
                  <div>{question.outputFormat || 'N/A'}</div>
                </div>
                <div className="form-field full-width">
                  <label>Constraints</label>
                  <div>{question.constraints || 'None'}</div>
                </div>
                <div className="form-field full-width">
                  <label>Sample Input</label>
                  <pre>{question.sampleInput || '-'}</pre>
                </div>
                <div className="form-field full-width">
                  <label>Sample Output</label>
                  <pre>{question.sampleOutput || '-'}</pre>
                </div>
                <div className="form-field full-width">
                  <label>Starter Code</label>
                  <pre>{question.starterCode || '-'}</pre>
                </div>
                <div className="form-field full-width">
                  <label>Solution Code</label>
                  <pre>{question.solutionCode || '-'}</pre>
                </div>
                <div className="form-field full-width">
                  <label>Explanation</label>
                  <div>{question.explanation || 'No explanation provided.'}</div>
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <h2>Test Cases</h2>
            {renderTestCases()}
          </div>

          <div className="form-section">
            <h2>Statistics</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Acceptance Rate</label>
                <div>{question.statistics?.acceptanceRate?.toFixed(2) ?? '0.00'}%</div>
              </div>
              <div className="form-field">
                <label>Avg Execution Time</label>
                <div>{question.statistics?.averageExecutionTimeMs?.toFixed(2) ?? '0.00'} ms</div>
              </div>
              <div className="form-field">
                <label>Avg Memory Usage</label>
                <div>{question.statistics?.averageMemoryUsageMb?.toFixed(2) ?? '0.00'} MB</div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h2>Preview and Audit</h2>
              <div>
                <button type="button" className="secondary-button" onClick={loadPreview} disabled={metaLoading}>
                  Load Preview
                </button>
                <button type="button" className="secondary-button" onClick={loadVersions} disabled={metaLoading}>
                  Load Versions
                </button>
                <button type="button" className="secondary-button" onClick={loadAuditLogs} disabled={metaLoading}>
                  Load Audit Logs
                </button>
              </div>
            </div>
            {preview && (
              <div className="preview-card">
                <h3>Preview</h3>
                <pre>{JSON.stringify(preview, null, 2)}</pre>
              </div>
            )}
            {versions.length > 0 && (
              <div className="preview-card">
                <h3>Version History</h3>
                <ul>
                  {versions.map((version) => (
                    <li key={version.id}>
                      v{version.version} — {version.action} — {new Date(version.createdAt).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {auditLogs.length > 0 && (
              <div className="preview-card">
                <h3>Audit Logs</h3>
                <ul>
                  {auditLogs.map((log) => (
                    <li key={log.id}>
                      {new Date(log.createdAt).toLocaleString()} — {log.action} — {log.adminId}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Metadata</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Created At</label>
                <div>{new Date(question.createdAt).toLocaleString()}</div>
              </div>
              <div className="form-field">
                <label>Updated At</label>
                <div>{new Date(question.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDetailPage;
