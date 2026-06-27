import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../services/api';

const ManageCodeReviewsPage = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/admin/code-reviews').then((response) => setReviews(response.data)).catch(console.error);
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Code Reviews
      </Typography>
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review._id}>
                <TableCell>{review.studentId?.name}</TableCell>
                <TableCell>{review.courseId?.title}</TableCell>
                <TableCell>{review.subject}</TableCell>
                <TableCell>{review.reviewStatus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ManageCodeReviewsPage;
