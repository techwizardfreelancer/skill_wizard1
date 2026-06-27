import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../services/api';
import './ManageQuestionsPage.css';

const defaultOptions = [
  { text: '', isCorrect: true },
  { text: '', isCorrect: false },
];

const defaultTestCase = { input: '', expectedOutput: '', isHidden: false };

const initialValues = {
  title: '',
  description: '',
  difficulty: 'Medium',
  type: 'MCQ',
  courseId: '',
  level: 1,
  options: defaultOptions,
  programmingLanguages: '',
  inputFormat: '',
  outputFormat: '',
  constraints: '',
  sampleInput: '',
  sampleOutput: '',
  starterCode: '',
  solutionCode: '',
  explanation: '',
  status: 'Active',
  workflowStatus: 'DRAFT',
  bloomLevel: 'REMEMBER',
  bloomCategory: '',
  testCases: [defaultTestCase],
  timeLimit: 30,
  memoryLimit: 256,
  marks: 10,
  tags: '',
};

const CreateQuestionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: initialValues });

  const optionsFieldArray = useFieldArray({ control, name: 'options' });
  const testCasesFieldArray = useFieldArray({ control, name: 'testCases' });
  const watchValues = watch();
  const watchType = watchValues.type;

  const selectedCourse = courses.find((course) => course.id === watchValues.courseId);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.get('/questions/courses');
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error('Unable to load courses', err);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const loadQuestion = async () => {
      if (!id) {
        reset(initialValues);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/questions/${id}`);
        const question = res.data;

        reset({
          title: question.title || '',
          description: question.description || '',
          difficulty: question.difficulty || 'Medium',
          type: question.type || 'MCQ',
          courseId: question.courseId || '',
          level: question.level || 1,
          options:
            question.type === 'MCQ' && Array.isArray(question.options) && question.options.length > 0
              ? question.options.map((option) => ({
                  text: option.text || '',
                  isCorrect: option.isCorrect || false,
                }))
              : defaultOptions,
          programmingLanguages: (question.programmingLanguages || []).join(', '),
          inputFormat: question.inputFormat || '',
          outputFormat: question.outputFormat || '',
          constraints: question.constraints || '',
          sampleInput: question.sampleInput || '',
          sampleOutput: question.sampleOutput || '',
          starterCode: question.starterCode || '',
          solutionCode: question.solutionCode || '',
          explanation: question.explanation || '',
          workflowStatus: question.workflowStatus || 'DRAFT',
          bloomLevel: question.bloomLevel || 'REMEMBER',
          bloomCategory: question.bloomCategory || '',
          testCases:
            question.type === 'Programming' && Array.isArray(question.testCases) && question.testCases.length > 0
              ? question.testCases.map((testCase) => ({
                  input: testCase.input || '',
                  expectedOutput: testCase.expectedOutput || '',
                  isHidden: testCase.isHidden || false,
                }))
              : [defaultTestCase],
          timeLimit: question.timeLimit || 30,
          memoryLimit: question.memoryLimit || 256,
          marks: question.marks || 10,
          status: question.status || 'Active',
          tags: (question.tags || []).join(', '),
        });
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load question');
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [id, reset]);

  const ensureCorrectOption = (options) => {
    if (!options.some((option) => option.isCorrect)) {
      return options.map((option, idx) => ({ ...option, isCorrect: idx === 0 }));
    }
    return options;
  };

  const addOption = () => {
    optionsFieldArray.append({ text: '', isCorrect: false });
  };

  const removeOption = (index) => {
    if (optionsFieldArray.fields.length <= 2) return;
    optionsFieldArray.remove(index);
    const nextOptions = watchValues.options
      .filter((_, idx) => idx !== index)
      .map((option) => ({ ...option }));
    setValue('options', ensureCorrectOption(nextOptions), { shouldValidate: true });
  };

  const setCorrectOption = (index) => {
    const nextOptions = watchValues.options.map((option, idx) => ({
      ...option,
      isCorrect: idx === index,
    }));
    setValue('options', nextOptions, { shouldValidate: true });
  };

  const addTestCase = () => {
    testCasesFieldArray.append(defaultTestCase);
  };

  const removeTestCase = (index) => {
    if (testCasesFieldArray.fields.length <= 1) return;
    testCasesFieldArray.remove(index);
  };

  const handleChangeType = (value) => {
    if (value === 'MCQ') {
      setValue('options', defaultOptions, { shouldValidate: true, shouldDirty: true });
      setValue('testCases', [defaultTestCase], { shouldValidate: true, shouldDirty: true });
    }
    if (value === 'Programming') {
      setValue('options', defaultOptions, { shouldValidate: true, shouldDirty: true });
      setValue('testCases', [defaultTestCase], { shouldValidate: true, shouldDirty: true });
    }
    if (value === 'Written') {
      setValue('options', defaultOptions, { shouldValidate: true, shouldDirty: true });
      setValue('testCases', [defaultTestCase], { shouldValidate: true, shouldDirty: true });
    }
    setValue('type', value, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');

    if (!data.title || !data.description || !data.courseId || !data.level) {
      setError('Title, description, course, and level are required.');
      return;
    }

    if (data.type === 'MCQ') {
      if (!Array.isArray(data.options) || data.options.length < 2) {
        setError('Add at least 2 MCQ options.');
        return;
      }
      if (!data.options.some((option) => option.isCorrect)) {
        setError('Select at least one correct MCQ option.');
        return;
      }
      if (data.options.some((option) => !option.text.trim())) {
        setError('All MCQ option fields must be filled.');
        return;
      }
    }

    if (data.type === 'Programming') {
      if (!data.inputFormat || !data.outputFormat) {
        setError('Programming questions require input and output formats.');
        return;
      }
      if (!Array.isArray(data.testCases) || data.testCases.length === 0) {
        setError('Add at least one programming test case.');
        return;
      }
      for (const testCase of data.testCases) {
        if (!testCase.input.trim() || !testCase.expectedOutput.trim()) {
          setError('All test cases must include both input and expected output.');
          return;
        }
      }
    }

    const payload = {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      type: data.type,
      courseId: data.courseId,
      level: Number(data.level),
      status: data.status,
      workflowStatus: data.workflowStatus,
      bloomLevel: data.bloomLevel,
      bloomCategory: data.bloomCategory,
      options: data.type === 'MCQ' ? data.options : [],
      programmingLanguages:
        data.type === 'Programming'
          ? data.programmingLanguages.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
      inputFormat: data.type === 'Programming' ? data.inputFormat : '',
      outputFormat: data.type === 'Programming' ? data.outputFormat : '',
      constraints: data.constraints,
      sampleInput: data.sampleInput,
      sampleOutput: data.sampleOutput,
      starterCode: data.starterCode,
      solutionCode: data.solutionCode,
      explanation: data.explanation,
      testCases: data.type === 'Programming' ? data.testCases : [],
      timeLimit: Number(data.timeLimit),
      memoryLimit: Number(data.memoryLimit),
      marks: Number(data.marks),
      tags: data.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      setLoading(true);
      if (id) {
        await api.put(`/questions/${id}`, payload);
        setSuccess('Question updated successfully.');
      } else {
        await api.post('/questions', payload);
        setSuccess('Question created successfully.');
      }
      navigate('/admin/questions/manage');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-questions-page">
      <div className="page-header">
        <div>
          <h1>{id ? 'Edit Question' : 'Create Question'}</h1>
          <p>Build questions for assessments and programming challenges.</p>
        </div>
      </div>

      <form className="question-form" onSubmit={handleSubmit(onSubmit)}>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <div className="form-grid">
          <div className="form-field full-width">
            <label>Title *</label>
            <input type="text" placeholder="Question title" {...register('title', { required: true })} />
            {errors.title && <span className="form-error">Title is required.</span>}
          </div>

          <div className="form-field full-width">
            <label>Description *</label>
            <textarea rows={5} placeholder="Describe the question or prompt" {...register('description', { required: true })} />
            {errors.description && <span className="form-error">Description is required.</span>}
          </div>

          <div className="form-field">
            <label>Course *</label>
            <select {...register('courseId', { required: true })}>
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            {errors.courseId && <span className="form-error">Please select a course.</span>}
          </div>

          <div className="form-field">
            <label>Level *</label>
            <input type="number" min="1" placeholder="Question level" {...register('level', { required: true, valueAsNumber: true, min: 1 })} />
            {errors.level && <span className="form-error">Level must be 1 or higher.</span>}
          </div>

          <div className="form-field">
            <label>Difficulty</label>
            <select {...register('difficulty')}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="form-field">
            <label>Status</label>
            <select {...register('status')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-field">
            <label>Workflow Status</label>
            <select {...register('workflowStatus')}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="form-field">
            <label>Bloom Level</label>
            <select {...register('bloomLevel')}>
              <option value="REMEMBER">Remember</option>
              <option value="UNDERSTAND">Understand</option>
              <option value="APPLY">Apply</option>
              <option value="ANALYZE">Analyze</option>
              <option value="EVALUATE">Evaluate</option>
              <option value="CREATE">Create</option>
            </select>
          </div>

          <div className="form-field">
            <label>Bloom Category</label>
            <input type="text" placeholder="e.g. Knowledge" {...register('bloomCategory')} />
          </div>

          <div className="form-field">
            <label>Type</label>
            <select
              {...register('type')}
              value={watchType}
              onChange={(e) => handleChangeType(e.target.value)}
            >
              <option value="MCQ">MCQ</option>
              <option value="Programming">Programming</option>
              <option value="Written">Written</option>
            </select>
          </div>

          <div className="form-field">
            <label>Marks</label>
            <input type="number" min="1" {...register('marks', { valueAsNumber: true, min: 1 })} />
          </div>

          <div className="form-field">
            <label>Tags</label>
            <input type="text" placeholder="Separate tags with commas" {...register('tags')} />
          </div>
        </div>

        <div className="form-section">
          <h2>Preview</h2>
          <p><strong>Course:</strong> {selectedCourse?.title || 'Not selected'}</p>
          <p><strong>Type:</strong> {watchType}</p>
          <p><strong>Difficulty:</strong> {watchValues.difficulty}</p>
          <p><strong>Description:</strong> {watchValues.description ? `${watchValues.description.substring(0, 250)}${watchValues.description.length > 250 ? '...' : ''}` : 'No description yet.'}</p>
        </div>

        {watchType === 'MCQ' && (
          <div className="form-section">
            <h2>MCQ Options</h2>
            {optionsFieldArray.fields.map((option, index) => (
              <div className="option-row" key={option.id}>
                <label>
                  <input
                    type="radio"
                    name="correctOption"
                    checked={watchValues.options?.[index]?.isCorrect}
                    onChange={() => setCorrectOption(index)}
                  />
                  Correct
                </label>
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  {...register(`options.${index}.text`, { required: true })}
                />
                {optionsFieldArray.fields.length > 2 && (
                  <button type="button" className="remove-option" onClick={() => removeOption(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="secondary-button" onClick={addOption}>
              Add Option
            </button>
          </div>
        )}

        {watchType === 'Programming' && (
          <div className="form-section">
            <h2>Programming Settings</h2>
            <div className="form-grid">
              <div className="form-field full-width">
                <label>Supported Languages</label>
                <input type="text" placeholder="e.g. Python, JavaScript, Java" {...register('programmingLanguages')} />
              </div>
              <div className="form-field full-width">
                <label>Input Format</label>
                <input type="text" placeholder="Describe input format" {...register('inputFormat')} />
              </div>
              <div className="form-field full-width">
                <label>Output Format</label>
                <input type="text" placeholder="Describe output format" {...register('outputFormat')} />
              </div>
              <div className="form-field full-width">
                <label>Constraints</label>
                <textarea rows={3} placeholder="Add constraints, limits, or edge behavior" {...register('constraints')} />
              </div>
              <div className="form-field full-width">
                <label>Sample Input</label>
                <textarea rows={2} placeholder="Example input for students" {...register('sampleInput')} />
              </div>
              <div className="form-field full-width">
                <label>Sample Output</label>
                <textarea rows={2} placeholder="Example output for students" {...register('sampleOutput')} />
              </div>
              <div className="form-field full-width">
                <label>Starter Code</label>
                <textarea rows={4} placeholder="Starter code for programming questions" {...register('starterCode')} />
              </div>
              <div className="form-field full-width">
                <label>Solution Code</label>
                <textarea rows={4} placeholder="Reference solution code" {...register('solutionCode')} />
              </div>
              <div className="form-field full-width">
                <label>Explanation</label>
                <textarea rows={4} placeholder="Explain the solution or approach" {...register('explanation')} />
              </div>
              <div className="form-field full-width">
                <label>Test Cases</label>
                <div className="test-cases-list">
                  {testCasesFieldArray.fields.map((testCase, index) => (
                    <div key={testCase.id} className="test-case-row">
                      <div className="test-case-fields">
                        <div className="test-case-field">
                          <label>Input</label>
                          <textarea rows={2} placeholder={`Test case ${index + 1} input`} {...register(`testCases.${index}.input`, { required: true })} />
                        </div>
                        <div className="test-case-field">
                          <label>Expected Output</label>
                          <textarea rows={2} placeholder={`Test case ${index + 1} expected output`} {...register(`testCases.${index}.expectedOutput`, { required: true })} />
                        </div>
                      </div>
                      <div className="test-case-controls">
                        <label>
                          <input type="checkbox" {...register(`testCases.${index}.isHidden`)} />
                          Hidden
                        </label>
                        <button type="button" className="secondary-button" onClick={() => removeTestCase(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="secondary-button" onClick={addTestCase}>
                  Add Test Case
                </button>
              </div>
              <div className="form-field">
                <label>Time Limit (sec)</label>
                <input type="number" min="1" {...register('timeLimit', { valueAsNumber: true, min: 1 })} />
              </div>
              <div className="form-field">
                <label>Memory Limit (MB)</label>
                <input type="number" min="1" {...register('memoryLimit', { valueAsNumber: true, min: 1 })} />
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={() => navigate('/admin/questions/manage')}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? 'Saving...' : id ? 'Update Question' : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuestionPage;
