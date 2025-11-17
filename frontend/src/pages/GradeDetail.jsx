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
  Chip,
  Button,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradeIcon from '@mui/icons-material/Grade';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import Layout from '../components/Layout';
import api from '../services/api';

const GradeDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: grade, isLoading: gradeLoading } = useQuery(
    ['grade', id],
    async () => {
      const response = await api.get(`/grades/${id}`);
      return response.data.data;
    },
    { enabled: !!id }
  );

  const formatDate = (dateString) => {
    if (!dateString) return t('common.none');
    return new Date(dateString).toLocaleDateString();
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'default';
    const gradeUpper = grade.toUpperCase();
    if (['A+', 'A'].includes(gradeUpper)) return 'success';
    if (['B+', 'B'].includes(gradeUpper)) return 'info';
    if (['C+', 'C'].includes(gradeUpper)) return 'warning';
    return 'error';
  };

  if (gradeLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!grade) {
    return (
      <Layout>
        <Box p={3}>
          <Typography variant="h5" color="error">{t('grades.notFound')}</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/grades')} sx={{ mt: 2 }}>
            {t('common.back')} {t('nav.grades')}
          </Button>
        </Box>
      </Layout>
    );
  }

  const percentage = grade.exam?.total_marks
    ? ((parseFloat(grade.marks_obtained) / parseFloat(grade.exam.total_marks)) * 100).toFixed(2)
    : 0;
  const passed = grade.exam?.passing_marks
    ? parseFloat(grade.marks_obtained) >= parseFloat(grade.exam.passing_marks)
    : false;

  return (
    <Layout>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/grades')}
          sx={{ mb: 2 }}
        >
          {t('common.back')} {t('nav.grades')}
        </Button>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
            <GradeIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4">
              {t('grades.gradeDetails')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {grade.student ? `${grade.student.first_name} ${grade.student.last_name}` : t('common.none')} - {grade.exam?.name || t('common.none')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('exams.subject')}: {grade.subject?.name || t('common.none')} | {t('grades.marksObtained')}: {grade.marks_obtained} / {grade.exam?.total_marks || t('common.none')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Student Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6">{t('students.studentInformation')}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('grades.student')}
                  </Typography>
                  <Typography variant="body1">
                    {grade.student ? `${grade.student.first_name} ${grade.student.last_name}` : t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('students.studentId')}
                  </Typography>
                  <Typography variant="body1">
                    {grade.student?.student_id || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.class')}
                  </Typography>
                  <Typography variant="body1">
                    {grade.student?.class?.name || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/students/${grade.student?.id}`)}
                    startIcon={<PersonIcon />}
                  >
                    {t('common.view')} {t('students.studentDetails')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Exam Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <QuizIcon color="primary" />
                <Typography variant="h6">{t('exams.examDetails')}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.examName')}
                  </Typography>
                  <Typography variant="body1">
                    {grade.exam?.name || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.examDate')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(grade.exam?.exam_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.totalMarks')}
                  </Typography>
                  <Typography variant="body1">
                    {grade.exam?.total_marks || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.passingMarks')}
                  </Typography>
                  <Typography variant="body1">
                    {grade.exam?.passing_marks || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/exams/${grade.exam?.id}`)}
                    startIcon={<QuizIcon />}
                  >
                    {t('common.view')} {t('exams.examDetails')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Grade Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <GradeIcon color="primary" />
                <Typography variant="h6">{t('grades.gradeDetails')}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.subject')}
                  </Typography>
                  <Typography variant="h5">
                    {grade.subject?.name || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    {t('grades.marksObtained')}
                  </Typography>
                  <Typography variant="h5">
                    {grade.marks_obtained}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    {t('grades.grade')}
                  </Typography>
                  <Chip
                    label={grade.grade || t('common.none')}
                    color={getGradeColor(grade.grade)}
                    sx={{ fontSize: '1.2rem', height: '2.5rem' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    {t('grades.percentage')}
                  </Typography>
                  <Typography variant="h5">
                    {percentage}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.status')}
                  </Typography>
                  <Chip
                    label={passed ? t('exams.passed') : t('exams.failed')}
                    color={passed ? 'success' : 'error'}
                    sx={{ fontSize: '1rem', height: '2rem' }}
                  />
                </Grid>
                {grade.enteredBy && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      {t('grades.enteredBy')}
                    </Typography>
                    <Typography variant="body1">
                      {grade.enteredBy.username || grade.enteredBy.email || t('common.none')}
                    </Typography>
                  </Grid>
                )}
                {grade.remarks && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('grades.remarks')}
                    </Typography>
                    <Typography variant="body1">
                      {grade.remarks}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default GradeDetail;

