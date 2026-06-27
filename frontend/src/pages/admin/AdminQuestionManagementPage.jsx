import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import api from '../../services/api';
import './ManageQuestionsPage.css';

const sortLabels = {
  title: 'Question Title',
  difficulty: 'Difficulty',
  marks: 'Marks',
  status: 'Status',
  createdAt: 'Created Date',
};

const AdminQuestionManagementPage = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const level = searchParams.get('level');
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [workflowFilter, setWorkflowFilter] = useState('');
  const [bloomFilter, setBloomFilter] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const limit = 10;

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === courseId),
    [courses, courseId],
  );

  const fetchCourses = async () => {
    try {
      const res = await api.get('/questions/courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Unable to load courses', err);
    }
  };

  const fetchQuestions = async () => {
    if (!courseId || !level) {
      setQuestions([]);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);
      const params = {
        page,
        limit,
        courseId,
        level,
        search: search.trim() || undefined,
        difficulty: difficultyFilter || undefined,
        status: statusFilter || undefined,
        workflowStatus: workflowFilter || undefined,
        bloomLevel: bloomFilter || undefined,
        language: languageFilter || undefined,
        sortBy,
        sortOrder,
      };
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
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [page, difficultyFilter, statusFilter, languageFilter, workflowFilter, bloomFilter, search, sortBy, sortOrder, courseId, level]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map((question) => question.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );
  };

  const handleSort = (column) => {
    if (column === sortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(column);
    setSortOrder('asc');
  };

  const refreshQuestions = async () => {
    setPage(1);
    await fetchQuestions();
  };

  const bulkAction = async (action, status) => {
    if (selectedIds.length === 0) {
      setError('Select at least one question first.');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedIds.length} question(s)?`)) {
      return;
    }

    try {
      setBulkLoading(true);
      if (action === 'delete') {
        await api.delete('/questions/bulk', { data: { ids: selectedIds } });
      } else {
        await api.put('/questions/bulk/status', { ids: selectedIds, status });
      }
      setSelectedIds([]);
      await refreshQuestions();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${action} selected questions`);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDuplicate = async (questionId) => {
    try {
      setBulkLoading(true);
      await api.post(`/questions/${questionId}/duplicate`);
      await refreshQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to duplicate question');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${questionId}`);
      await refreshQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete question');
    }
  };

  const handleExport = async () => {
    try {
      const ids = selectedIds.length > 0 ? selectedIds.join(',') : undefined;
      const response = await api.get('/questions/export', {
        params: ids ? { ids } : {},
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'questions_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to export questions');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setBulkLoading(true);
      const res = await api.post('/questions/import', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setError('');
      await refreshQuestions();
      alert(`${res.data.imported || 0} questions imported successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to import questions');
    } finally {
      setBulkLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) {
      setError('Select at least one question to generate.');
      return;
    }

    try {
      const res = await api.post('/questions/generate', { ids: selectedIds });
      const json = JSON.stringify(res.data.generated || [], null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `questions-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate selected questions');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const publishQuestion = async (questionId) => {
    try {
      await api.put(`/questions/${questionId}/publish`);
      await refreshQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to publish question');
    }
  };

  const archiveQuestion = async (questionId) => {
    try {
      await api.put(`/questions/${questionId}/archive`);
      await refreshQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to archive question');
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'flex-start' }} spacing={3} mb={3}>
        <Box>
          <Typography variant="overline" color="primary.main" fontWeight={700} gutterBottom>
            Admin Workspace
          </Typography>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Question Management
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth={680}>
            {courseId && level
              ? `Managing questions for ${selectedCourse?.title || courseId} • Level ${level}`
              : 'Select a course and level to manage question content, workflows, and publication state.'}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/admin/questions/create')}
          sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' }, minWidth: 180 }}
        >
          Create Question
        </Button>
      </Stack>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="end">
          <Grid item xs={12} md={5}>
            <Box component="form" onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                label="Search questions"
                placeholder="Search by title, tag or keyword"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button type="submit" variant="contained" size="small">
                        Search
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                label="Difficulty"
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Difficulty</MenuItem>
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Language"
              placeholder="JavaScript, Python"
              value={languageFilter}
              onChange={(e) => {
                setLanguageFilter(e.target.value);
                setPage(1);
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => {
                setSearch('');
                setDifficultyFilter('');
                setStatusFilter('');
                setLanguageFilter('');
                setSortBy('createdAt');
                setSortOrder('desc');
                setPage(1);
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mb={2}>
          <Typography variant="subtitle1" fontWeight={700}>
            Bulk actions
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {selectedIds.length} selected
            </Typography>
            <Button variant="outlined" disabled={bulkLoading || selectedIds.length === 0} onClick={() => bulkAction('activate', 'Active')}>
              Activate
            </Button>
            <Button variant="outlined" disabled={bulkLoading || selectedIds.length === 0} onClick={() => bulkAction('deactivate', 'Inactive')}>
              Deactivate
            </Button>
            <Button variant="outlined" disabled={bulkLoading || selectedIds.length === 0} onClick={() => bulkAction('delete')}>
              Delete
            </Button>
            <Button variant="contained" disabled={bulkLoading || selectedIds.length === 0} onClick={handleGenerate}>
              Generate
            </Button>
          </Stack>
        </Stack>

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress />
            <Typography mt={2} color="text.secondary">
              Loading questions...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : questions.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography>No questions found for this selection.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ borderRadius: 3, overflow: 'auto' }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>
                    <Checkbox
                      checked={selectedIds.length === questions.length && questions.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                  {Object.entries(sortLabels).map(([key, label]) => (
                    <TableCell key={key}>
                      <Button variant="text" size="small" onClick={() => handleSort(key)} sx={{ px: 0 }}>
                        {label}
                        {sortBy === key ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                      </Button>
                    </TableCell>
                  ))}
                  <TableCell>Languages</TableCell>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id} hover>
                    <TableCell>
                      <Checkbox checked={selectedIds.includes(question.id)} onChange={() => toggleSelect(question.id)} />
                    </TableCell>
                    <TableCell>{question.title}</TableCell>
                    <TableCell>{question.courseTitle || 'N/A'}</TableCell>
                    <TableCell>{question.level}</TableCell>
                    <TableCell>{question.difficulty}</TableCell>
                    <TableCell>{question.type}</TableCell>
                    <TableCell>{question.marks}</TableCell>
                    <TableCell>{question.status}</TableCell>
                    <TableCell>{new Date(question.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{(question.programmingLanguages || []).join(', ') || 'N/A'}</TableCell>
                    <TableCell>{question.workflowStatus || 'N/A'}</TableCell>
                    <TableCell>{(question.tags || []).join(', ') || 'None'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button variant="outlined" size="small" onClick={() => navigate(`/admin/questions/${question.id}`)}>
                          View
                        </Button>
                        <Button variant="outlined" size="small" onClick={() => navigate(`/admin/questions/${question.id}/edit`)}>
                          Edit
                        </Button>
                        <Button variant="outlined" size="small" onClick={() => handleDuplicate(question.id)}>
                          Duplicate
                        </Button>
                        <Button variant="outlined" size="small" onClick={() => publishQuestion(question.id)}>
                          Publish
                        </Button>
                        <Button variant="outlined" size="small" onClick={() => archiveQuestion(question.id)}>
                          Archive
                        </Button>
                        <Button variant="contained" color="error" size="small" onClick={() => handleDelete(question.id)}>
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && questions.length > 0 && (
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} mt={3}>
            <Typography color="text.secondary">Page {page} of {Math.max(1, Math.ceil(total / limit))}</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                Previous
              </Button>
              <Button variant="outlined" disabled={page >= Math.max(1, Math.ceil(total / limit))} onClick={() => setPage((prev) => Math.min(prev + 1, Math.max(1, Math.ceil(total / limit))))}>
                Next
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default AdminQuestionManagementPage;
