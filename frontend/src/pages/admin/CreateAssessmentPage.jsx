import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './CreateAssessmentPage.css';

const CreateAssessmentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    totalQuestions: 10,
    randomQuestionOrder: true,
    allowTabSwitch: false,
    allowCopyPaste: false,
    requireFullscreen: false,
    maxViolations: 3,
    instructions: '',
    difficultyDistribution: {
      Easy: 30,
      Medium: 50,
      Hard: 20,
    },
    programmingLanguages: [],
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const toggleProgrammingLanguage = (lang) => {
    setFormData((prev) => {
      const exists = prev.programmingLanguages.includes(lang);
      return {
        ...prev,
        programmingLanguages: exists
          ? prev.programmingLanguages.filter((l) => l !== lang)
          : [...prev.programmingLanguages, lang],
      };
    });
  };

  const handleDifficultyChange = (level, value) => {
    setFormData((prev) => ({
      ...prev,
      difficultyDistribution: {
        ...prev.difficultyDistribution,
        [level]: Number(value),
      },
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Assessment name is required');
      return false;
    }
    if (!formData.courseId) {
      setError('Course selection is required');
      return false;
    }
    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      setError('Start and end dates/times are required');
      return false;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (startDateTime >= endDateTime) {
      setError('End date/time must be after start date/time');
      return false;
    }

    if (formData.duration < 5) {
      setError('Duration must be at least 5 minutes');
      return false;
    }

    if (formData.totalQuestions < 1) {
      setError('Assessment must have at least 1 question');
      return false;
    }

    if (formData.passingMarks > formData.totalMarks) {
      setError('Passing marks cannot exceed total marks');
      return false;
    }

    // Validate difficulty distribution sums to 100
    const sum = Object.values(formData.difficultyDistribution).reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      setError(`Difficulty distribution must sum to 100% (current: ${sum}%)`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      // Combine date and time
      const startDate = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDate = new Date(`${formData.endDate}T${formData.endTime}`);

      const payload = {
        ...formData,
        courseId: formData.courseId,
        startDate,
        endDate,
      };

      if (isEditing) {
        await axios.put(`/api/assessments/${id}`, payload, { withCredentials: true });
      } else {
        await axios.post('/api/assessments', payload, { withCredentials: true });
      }

      navigate('/admin/assessments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assessment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await axios.get('/api/admin/courses', { withCredentials: true });
        setCourses(response.data || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      }
    };

    const loadAssessment = async () => {
      if (!isEditing) return;
      try {
        setLoading(true);
        const response = await axios.get(`/api/assessments/${id}`, { withCredentials: true });
        const assessment = response.data;
        setFormData((prev) => ({
          ...prev,
          name: assessment.name || '',
          description: assessment.description || '',
          courseId: assessment.courseId?._id || assessment.courseId || '',
          startDate: assessment.startDate ? new Date(assessment.startDate).toISOString().slice(0, 10) : '',
          startTime: assessment.startDate ? new Date(assessment.startDate).toISOString().substr(11, 5) : '',
          endDate: assessment.endDate ? new Date(assessment.endDate).toISOString().slice(0, 10) : '',
          endTime: assessment.endDate ? new Date(assessment.endDate).toISOString().substr(11, 5) : '',
          duration: assessment.duration || 60,
          totalMarks: assessment.totalMarks || 100,
          passingMarks: assessment.passingMarks || 40,
          totalQuestions: assessment.totalQuestions || 10,
          randomQuestionOrder: assessment.randomQuestionOrder ?? true,
          allowTabSwitch: assessment.allowTabSwitch ?? false,
          allowCopyPaste: assessment.allowCopyPaste ?? false,
          requireFullscreen: assessment.requireFullscreen ?? false,
          maxViolations: assessment.maxViolations || 3,
          instructions: assessment.instructions || '',
          difficultyDistribution: assessment.difficultyDistribution || { Easy: 30, Medium: 50, Hard: 20 },
          programmingLanguages: assessment.programmingLanguages || [],
        }));
      } catch (err) {
        console.error('Failed to load assessment', err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
    loadAssessment();
  }, [id, isEditing]);

  return (
    <div className="create-assessment-page">
      <div className="page-header">
        <h1>{isEditing ? 'Edit Assessment' : 'Create New Assessment'}</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="assessment-form">
        {/* Basic Information */}
        <section className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label>Assessment Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Data Structures Quiz - Week 1"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Course *</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Assessment details and instructions"
              className="form-control"
              rows="4"
            />
          </div>
        </section>

        {/* Timing */}
        <section className="form-section">
          <h2>Timing Configuration</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>End Time *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Duration (minutes) *</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="5"
              className="form-control"
              required
            />
          </div>
        </section>

        {/* Marks Configuration */}
        <section className="form-section">
          <h2>Marks Configuration</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Total Marks *</label>
              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                min="1"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>Passing Marks *</label>
              <input
                type="number"
                name="passingMarks"
                value={formData.passingMarks}
                onChange={handleChange}
                min="0"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>Total Questions *</label>
              <input
                type="number"
                name="totalQuestions"
                value={formData.totalQuestions}
                onChange={handleChange}
                min="1"
                className="form-control"
                required
              />
            </div>
          </div>
        </section>

        {/* Difficulty Distribution */}
        <section className="form-section">
          <h2>Difficulty Distribution (%)</h2>
          <p className="info-text">Specify how many questions of each difficulty level.</p>

          <div className="difficulty-distribution">
            {['Easy', 'Medium', 'Hard'].map((level) => (
              <div key={level} className="form-group">
                <label>{level}</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={formData.difficultyDistribution[level]}
                    onChange={(e) => handleDifficultyChange(level, e.target.value)}
                    min="0"
                    max="100"
                    className="form-control"
                  />
                  <span>%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="hint">
            Total: {Object.values(formData.difficultyDistribution).reduce((a, b) => a + b, 0)}%
          </p>
        </section>

        {/* Question Options */}
        <section className="form-section">
          <h2>Question Options</h2>

          <div className="form-group">
            <label>Allowed Programming Languages (for coding questions)</label>
            <div className="checkbox-grid">
              {['Java', 'Python', 'C++', 'C', 'JavaScript', 'C#', 'Go', 'Ruby'].map((lang) => (
                <label key={lang} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.programmingLanguages.includes(lang)}
                    onChange={() => toggleProgrammingLanguage(lang)}
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="randomQuestionOrder"
                checked={formData.randomQuestionOrder}
                onChange={handleChange}
              />
              Randomize Question Order
            </label>
          </div>
        </section>

        {/* Anti-Cheating Settings */}
        <section className="form-section">
          <h2>Anti-Cheating Settings</h2>

          <div className="form-group">
            <label>Max Violations Allowed *</label>
            <input
              type="number"
              name="maxViolations"
              value={formData.maxViolations}
              onChange={handleChange}
              min="1"
              className="form-control"
              required
            />
            <small>Student will be eliminated if violations exceed this limit</small>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="allowTabSwitch"
                checked={formData.allowTabSwitch}
                onChange={handleChange}
              />
              Allow Tab Switching
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="allowCopyPaste"
                checked={formData.allowCopyPaste}
                onChange={handleChange}
              />
              Allow Copy/Paste
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="requireFullscreen"
                checked={formData.requireFullscreen}
                onChange={handleChange}
              />
              Require Fullscreen Mode
            </label>
          </div>
        </section>

        {/* Instructions */}
        <section className="form-section">
          <h2>Instructions for Students</h2>

          <div className="form-group">
            <label>Assessment Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Enter detailed instructions for students taking this assessment..."
              className="form-control"
              rows="6"
            />
          </div>
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Assessment' : 'Create Assessment'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/assessments')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssessmentPage;
