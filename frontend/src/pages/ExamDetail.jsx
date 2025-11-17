import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import GradeIcon from '@mui/icons-material/Grade';
import Layout from '../components/Layout';
import api from '../services/api';

const ExamDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: exam, isLoading: examLoading } = useQuery(
    ['exam', id],
    async () => {
      const response = await api.get(`/exams/${id}`);
      return response.data.data;
    },
    { enabled: !!id }
  );

  const { data: gradesData } = useQuery(
    ['examGrades', id],
    async () => {
      const response = await api.get('/grades', { params: { exam_id: id, limit: 1000 } });
      return response.data.data?.grades || [];
    },
    { enabled: !!id }
  );

  const formatDate = (dateString) => {
    if (!dateString) return t('common.none');
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return t('common.none');
    return timeString;
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'default';
    const gradeUpper = grade.toUpperCase();
    if (['A+', 'A'].includes(gradeUpper)) return 'success';
    if (['B+', 'B'].includes(gradeUpper)) return 'info';
    if (['C+', 'C'].includes(gradeUpper)) return 'warning';
    return 'error';
  };

  if (examLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!exam) {
    return (
      <Layout>
        <Box p={3}>
          <Typography variant="h5" color="error">{t('exams.notFound')}</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/exams')} sx={{ mt: 2 }}>
            {t('common.back')} {t('nav.exams')}
          </Button>
        </Box>
      </Layout>
    );
  }

  const passedCount = gradesData?.filter(
    (g) => parseFloat(g.marks_obtained) >= parseFloat(exam.passing_marks)
  ).length || 0;
  const failedCount = (gradesData?.length || 0) - passedCount;
  const averageMarks = gradesData?.length > 0
    ? (gradesData.reduce((sum, g) => sum + parseFloat(g.marks_obtained || 0), 0) / gradesData.length).toFixed(2)
    : 0;

  return (
    <Layout>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/exams')}
          sx={{ mb: 2 }}
        >
          {t('common.back')} {t('nav.exams')}
        </Button>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
            <QuizIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4">{exam.name}</Typography>
            <Typography variant="body1" color="text.secondary">
              {exam.class?.name || t('common.none')} - {exam.subject?.name || t('common.none')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('common.date')}: {formatDate(exam.exam_date)} | {t('exams.totalMarks')}: {exam.total_marks} | {t('exams.passingMarks')}: {exam.passing_marks}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('exams.examDetails')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.class')}
                  </Typography>
                  <Typography variant="body1">
                    {exam.class?.name || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.subject')}
                  </Typography>
                  <Typography variant="body1">
                    {exam.subject?.name || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.examDate')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(exam.exam_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('timetables.time')}
                  </Typography>
                  <Typography variant="body1">
                    {exam.start_time && exam.end_time
                      ? `${formatTime(exam.start_time)} - ${formatTime(exam.end_time)}`
                      : t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('timetables.room')}
                  </Typography>
                  <Typography variant="body1">
                    {exam.room || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.totalMarks')}
                  </Typography>
                  <Typography variant="body1">
                    {exam.total_marks}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.passingMarks')}
                  </Typography>
                  <Typography variant="body1">
                    {exam.passing_marks}
                  </Typography>
                </Grid>
                {exam.instructions && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('exams.instructions')}
                    </Typography>
                    <Typography variant="body1">
                      {exam.instructions}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <GradeIcon color="primary" />
                    <Typography variant="h6">{gradesData?.length || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.totalGrades')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SchoolIcon color="success" />
                    <Typography variant="h6" color="success.main">{passedCount}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.passed')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ClassIcon color="error" />
                    <Typography variant="h6" color="error.main">{failedCount}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.failed')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <QuizIcon color="primary" />
                    <Typography variant="h6">{averageMarks}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.averageScore')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Grades Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('nav.grades')} ({gradesData?.length || 0})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {gradesData && gradesData.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('students.studentId')}</TableCell>
                        <TableCell>{t('grades.student')}</TableCell>
                        <TableCell>{t('exams.class')}</TableCell>
                        <TableCell>{t('grades.marksObtained')}</TableCell>
                        <TableCell>{t('grades.grade')}</TableCell>
                        <TableCell>{t('common.status')}</TableCell>
                        <TableCell>{t('grades.remarks')}</TableCell>
                        <TableCell>{t('common.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gradesData.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell>{grade.student?.student_id || t('common.none')}</TableCell>
                          <TableCell>
                            {grade.student ? `${grade.student.first_name} ${grade.student.last_name}` : t('common.none')}
                          </TableCell>
                          <TableCell>{grade.student?.class?.name || t('common.none')}</TableCell>
                          <TableCell>{grade.marks_obtained}</TableCell>
                          <TableCell>
                            <Chip
                              label={grade.grade || t('common.none')}
                              color={getGradeColor(grade.grade)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={parseFloat(grade.marks_obtained) >= parseFloat(exam.passing_marks) ? t('exams.passed') : t('exams.failed')}
                              color={parseFloat(grade.marks_obtained) >= parseFloat(exam.passing_marks) ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{grade.remarks || '-'}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => navigate(`/grades/${grade.id}`)}
                            >
                              {t('common.view')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">{t('exams.noGradesRecorded')}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ExamDetail;

