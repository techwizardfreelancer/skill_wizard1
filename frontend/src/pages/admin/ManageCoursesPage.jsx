import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import api from '../../services/api';

const ManageCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const defaultLevelDetail = (level) => ({
    level,
    title: `Level ${level}`,
    topics: '',
    assessmentType: 'MCQ',
    rewardPoints: 0,
    preRequest: '',
    youtubeLink: '',
    exampleQuestions: '',
  });

  const [form, setForm] = useState({
    title: '',
    category: 'Software',
    description: '',
    image: '',
    totalLevels: 1,
    difficulty: 'Beginner',
    levelDetails: [defaultLevelDetail(1)],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      setCourses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpen = () => {
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    if (field === 'totalLevels') {
      const totalLevels = Math.max(1, Number(value) || 1);
      setForm((prev) => ({
        ...prev,
        totalLevels,
        levelDetails: Array.from({ length: totalLevels }, (_, index) =>
          prev.levelDetails[index] || defaultLevelDetail(index + 1),
        ),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLevelDetailChange = (index, field) => (event) => {
    const value = event.target.value;
    setForm((prev) => {
      const updatedLevels = [...prev.levelDetails];
      updatedLevels[index] = { ...updatedLevels[index], [field]: value };
      return { ...prev, levelDetails: updatedLevels };
    });
  };

  const handleCreateCourse = async () => {
    const { title, category, description, difficulty, totalLevels, levelDetails } = form;
    if (!title || !category || !description || !difficulty || !totalLevels) {
      setError('Please fill in all required fields.');
      return;
    }

    const validatedLevels = levelDetails.map((level) => ({
      ...level,
      topics: level.topics
        .split('\n')
        .map((topic) => topic.trim())
        .filter(Boolean),
    }));

    setLoading(true);
    try {
      await api.post('/admin/courses', {
        ...form,
        levels: Number(totalLevels),
        levelDetails: validatedLevels,
      });
      await loadCourses();
      handleClose();
      setForm({
        title: '',
        category: 'Software',
        description: '',
        image: '',
        totalLevels: 1,
        difficulty: 'Beginner',
        levelDetails: [defaultLevelDetail(1)],
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Manage Courses
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography color="text.secondary">Create and manage course content for students.</Typography>
        <Button variant="contained" onClick={handleOpen}>
          Create Course
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course._id}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {course.image ? (
                <CardMedia
                  component="img"
                  height="140"
                  image={course.image}
                  alt={course.title || 'Course image'}
                  sx={{ objectFit: 'cover' }}
                />
              ) : (
                <CardMedia
                  component="div"
                  sx={{
                    height: 140,
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    No image provided
                  </Typography>
                </CardMedia>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {course.description}
                </Typography>
                <Typography variant="body2">Category: {course.category}</Typography>
                <Typography variant="body2">Difficulty: {course.difficulty}</Typography>
                <Typography variant="body2">Levels: {course.totalLevels}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Course</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange('title')}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={form.category}
                label="Category"
                onChange={handleChange('category')}
              >
                <MenuItem value="Software">Software</MenuItem>
                <MenuItem value="Hardware">Hardware</MenuItem>
                <MenuItem value="General">General</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange('description')}
              fullWidth
              multiline
              rows={4}
              required
            />
            <TextField
              label="Image URL"
              name="image"
              value={form.image}
              onChange={handleChange('image')}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="difficulty-label">Difficulty</InputLabel>
              <Select
                labelId="difficulty-label"
                value={form.difficulty}
                label="Difficulty"
                onChange={handleChange('difficulty')}
                inputProps={{ 'aria-label': 'Difficulty' }}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Total Levels"
              name="totalLevels"
              type="number"
              value={form.totalLevels}
              onChange={handleChange('totalLevels')}
              fullWidth
              inputProps={{ min: 1 }}
              required
            />
            {form.levelDetails.map((level, index) => (
              <Paper key={level.level} variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                  Level {level.level} details
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Level title"
                    value={level.title}
                    onChange={handleLevelDetailChange(index, 'title')}
                    fullWidth
                  />
                  <TextField
                    label="Topics (one per line)"
                    value={level.topics}
                    onChange={handleLevelDetailChange(index, 'topics')}
                    fullWidth
                    multiline
                    rows={3}
                    helperText="Enter each topic on its own line, e.g. Variables, Operators, Conditional Statements"
                  />
                  <FormControl fullWidth>
                    <InputLabel id={`assessment-type-label-${index}`}>Assessment Type</InputLabel>
                    <Select
                      labelId={`assessment-type-label-${index}`}
                      value={level.assessmentType}
                      label="Assessment Type"
                      onChange={handleLevelDetailChange(index, 'assessmentType')}
                    >
                      <MenuItem value="MCQ">MCQ</MenuItem>
                      <MenuItem value="Programming">Programming</MenuItem>
                      <MenuItem value="Written">Written</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Reward points"
                    type="number"
                    value={level.rewardPoints}
                    onChange={handleLevelDetailChange(index, 'rewardPoints')}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    label="Pre Request"
                    value={level.preRequest}
                    onChange={handleLevelDetailChange(index, 'preRequest')}
                    fullWidth
                  />
                  <TextField
                    label="YouTube link"
                    value={level.youtubeLink}
                    onChange={handleLevelDetailChange(index, 'youtubeLink')}
                    fullWidth
                  />
                  <TextField
                    label="Example questions"
                    value={level.exampleQuestions}
                    onChange={handleLevelDetailChange(index, 'exampleQuestions')}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Stack>
              </Paper>
            ))}
          </Stack>
          {error && (
            <Typography color="error" variant="body2" mt={2}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreateCourse} variant="contained" disabled={loading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageCoursesPage;
