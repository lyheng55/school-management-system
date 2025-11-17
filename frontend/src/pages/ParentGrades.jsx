import { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';

const ParentGrades = () => {
  const { t } = useTranslation();
  const { childId } = useParams();
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(childId);

  const { data: children } = useQuery('parentChildren', async () => {
    const response = await api.get('/parents/children');
    return response.data.data || [];
  });

  const { data: grades, isLoading } = useQuery(
    ['childGrades', selectedChild],
    async () => {
      if (!selectedChild) return { data: [] };
      const response = await api.get(`/parents/children/${selectedChild}/grades`);
      return response.data.data || [];
    },
    { enabled: !!selectedChild }
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStudentName = (student) => {
    return `${student.first_name} ${student.last_name}`;
  };

  const calculateAverage = () => {
    if (!grades || grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => {
      const marks = parseFloat(grade.marks_obtained) || 0;
      const totalMarks = parseFloat(grade.exam?.total_marks) || 100;
      return sum + (marks / totalMarks) * 100;
    }, 0);
    return (total / grades.length).toFixed(2);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {t('parentGrades.title')}
        </Typography>

        {children && children.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>{t('parentGrades.selectChild')}</InputLabel>
              <Select
                value={selectedChild || ''}
                onChange={(e) => {
                  setSelectedChild(e.target.value);
                  navigate(`/parent/grades/${e.target.value}`);
                }}
              >
                {children.map((child) => (
                  <MenuItem key={child.id} value={child.id}>
                    {getStudentName(child)} {child.class && `- ${child.class.name}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !selectedChild ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('parentGrades.selectChildFirst')}</Typography>
          </Paper>
        ) : !grades || grades.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('parentGrades.noGrades')}</Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      {t('parentGrades.totalGrades')}
                    </Typography>
                    <Typography variant="h4">{grades.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      {t('parentGrades.averageScore')}
                    </Typography>
                    <Typography variant="h4">{calculateAverage()}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('exams.examName')}</TableCell>
                    <TableCell>{t('nav.subjects')}</TableCell>
                    <TableCell>{t('grades.marksObtained')}</TableCell>
                    <TableCell>{t('grades.grade')}</TableCell>
                    <TableCell>{t('grades.percentage')}</TableCell>
                    <TableCell>{t('common.date')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.map((grade) => {
                    const totalMarks = parseFloat(grade.exam?.total_marks) || 100;
                    const marksObtained = parseFloat(grade.marks_obtained) || 0;
                    const percentage = ((marksObtained / totalMarks) * 100).toFixed(2);
                    return (
                      <TableRow key={grade.id}>
                        <TableCell>{grade.exam?.exam_name || grade.exam?.title || '-'}</TableCell>
                        <TableCell>{grade.exam?.subject?.name || grade.subject?.name || '-'}</TableCell>
                        <TableCell>
                          <Chip label={`${marksObtained}/${totalMarks}`} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={grade.grade || '-'}
                            color={
                              percentage >= 80
                                ? 'success'
                                : percentage >= 60
                                ? 'warning'
                                : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{percentage}%</TableCell>
                        <TableCell>{formatDate(grade.created_at)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Layout>
  );
};

export default ParentGrades;

