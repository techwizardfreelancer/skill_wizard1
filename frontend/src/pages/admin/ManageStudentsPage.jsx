import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../services/api';

const departments = ['Computer Science', 'Information Technology', 'Mechanical', 'Electrical', 'Civil'];
const years = ['1', '2', '3', '4'];
const sections = ['A', 'B', 'C', 'D'];

const defaultStudentForm = {
  studentId: '',
  registerNumber: '',
  name: '',
  email: '',
  department: departments[0],
  year: years[0],
  section: sections[0],
  profileImageFile: null,
};

const ManageStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultStudentForm);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [status, setStatus] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState('');

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students', { params: { search } });
      setStudents(response.data.students);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const openDialog = (student = null) => {
    if (student && typeof student !== 'object') {
      student = null;
    }

    if (student) {
      setEditingStudent(student);
      setEditingStudentId(student._id || student.id || '');
      setForm({
        studentId: student.studentId || '',
        registerNumber: student.registerNumber || '',
        name: student.name || '',
        email: student.email || '',
        department: student.department || departments[0],
        year: student.year || years[0],
        section: student.section || sections[0],
        profileImageFile: null,
      });
      setPreviewImageUrl(student.profileImage || '');
    } else {
      setEditingStudent(null);
      setEditingStudentId('');
      setForm(defaultStudentForm);
      setPreviewImageUrl('');
    }
    setStatus('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setStatus('');
    setEditingStudent(null);
    setEditingStudentId('');
    setPreviewImageUrl('');
  };

  const handleSaveStudent = async () => {
    try {
      // Validate required fields
      if (!form.studentId.trim() || !form.registerNumber.trim() || !form.name.trim() || !form.email.trim()) {
        setStatus('Please fill in all required fields.');
        return;
      }

      const formData = new FormData();
      formData.append('studentId', form.studentId.trim());
      formData.append('registerNumber', form.registerNumber.trim());
      formData.append('name', form.name.trim());
      formData.append('email', form.email.trim());
      formData.append('department', form.department);
      formData.append('year', form.year);
      formData.append('section', form.section);
      if (form.profileImageFile) {
        formData.append('profileImage', form.profileImageFile);
      }

      if (editingStudent) {
        const studentId = editingStudentId;
        if (!studentId) {
          setStatus('Unable to identify the student record for update.');
          return;
        }
        await api.put(`/admin/students/${studentId}`, formData);
        setStatus('Student updated successfully.');
      } else {
        if (!form.profileImageFile) {
          setStatus('Profile image is required. Please upload a profile picture.');
          return;
        }
        await api.post('/admin/students', formData);
        setStatus('Student created successfully.');
      }

      fetchStudents();
      closeDialog();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to save student. Please check your input and try again.';
      setStatus(message);
      console.error('Save student error:', error);
    }
  };

  const handleAction = async (student, action) => {
    try {
      if (action === 'delete') {
        await api.delete(`/admin/students/${student._id}`);
      } else if (action === 'activate') {
        await api.patch(`/admin/students/${student._id}/activate`);
      } else if (action === 'deactivate') {
        await api.patch(`/admin/students/${student._id}/deactivate`);
      }
      fetchStudents();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Manage Students
      </Typography>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2} mb={3}>
        <TextField label="Search students" value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ minWidth: 280 }} />
        <Button variant="contained" onClick={() => openDialog()}>
          Create Student
        </Button>
      </Box>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.department}</TableCell>
                <TableCell>{student.active ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => openDialog(student)}>
                    Edit
                  </Button>
                  <Button size="small" onClick={() => handleAction(student, student.active ? 'deactivate' : 'activate')}>
                    {student.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="small" color="error" onClick={() => handleAction(student, 'delete')}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingStudent ? 'Edit Student' : 'Create Student'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Register Number" value={form.registerNumber} onChange={(e) => setForm({ ...form, registerNumber: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  {departments.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <Select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                  {years.map((option) => (
                    <MenuItem key={option} value={option}>
                      Year {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <Select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                  {sections.map((option) => (
                    <MenuItem key={option} value={option}>
                      Section {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={1} mb={1}>
                <Avatar
                  src={previewImageUrl || undefined}
                  sx={{ width: 96, height: 96, bgcolor: 'primary.main' }}
                >
                  {!previewImageUrl && (form.name?.[0] || 'S')}
                </Avatar>
                {previewImageUrl && (
                  <Typography variant="caption" color="text.secondary">
                    Current profile image
                  </Typography>
                )}
              </Box>
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{
                  backgroundColor: form.profileImageFile ? '#4caf50' : undefined,
                  '&:hover': {
                    backgroundColor: form.profileImageFile ? '#45a049' : undefined,
                  },
                }}
              >
                {form.profileImageFile ? `✓ ${form.profileImageFile.name}` : 'Upload Profile Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (previewImageUrl && previewImageUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(previewImageUrl);
                      }
                      setForm({ ...form, profileImageFile: file });
                      setPreviewImageUrl(URL.createObjectURL(file));
                      if (status === 'Profile image is required. Please upload a profile picture.') {
                        setStatus('');
                      }
                    }
                  }}
                />
              </Button>
              {!editingStudent && !form.profileImageFile && (
                <Typography variant="caption" display="block" mt={1} color="error">
                  ⚠ Profile image is mandatory
                </Typography>
              )}
            </Grid>
          </Grid>
          {status && (
            <Typography color="error" variant="body2" mt={2}>
              {status}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveStudent}>
            {editingStudent ? 'Update Student' : 'Create Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageStudentsPage;
