import { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import GradeIcon from '@mui/icons-material/Grade';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import QuizIcon from '@mui/icons-material/Quiz';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Layout from '../components/Layout';
import api from '../services/api';

const ParentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(null);

  const { data, isLoading } = useQuery('parentDashboard', async () => {
    const response = await api.get('/parents/dashboard');
    return response.data.data;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStudentName = (student) => {
    return `${student.first_name} ${student.last_name}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {t('parentDashboard.title')}
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {t('parentDashboard.totalChildren')}
                    </Typography>
                    <Typography variant="h4">{data?.summary?.totalChildren || 0}</Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {t('parentDashboard.pendingFees')}
                    </Typography>
                    <Typography variant="h4">{data?.summary?.totalPendingFees || 0}</Typography>
                  </Box>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {t('parentDashboard.upcomingExams')}
                    </Typography>
                    <Typography variant="h4">{data?.summary?.totalUpcomingExams || 0}</Typography>
                  </Box>
                  <QuizIcon sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Children List */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('parentDashboard.myChildren')}
          </Typography>
          {!data?.children || data.children.length === 0 ? (
            <Typography color="text.secondary">{t('parentDashboard.noChildren')}</Typography>
          ) : (
            <Grid container spacing={2}>
              {data.children.map((child) => (
                <Grid item xs={12} md={6} key={child.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 },
                    }}
                    onClick={() => setSelectedChild(selectedChild?.id === child.id ? null : child)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="h6">
                            {getStudentName(child)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('parentDashboard.studentId')}: {child.student_id}
                          </Typography>
                          {child.class && (
                            <Typography variant="body2" color="text.secondary">
                              {t('nav.classes')}: {child.class.name}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={child.status || 'active'}
                          color={child.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      {selectedChild?.id === child.id && (
                        <Box sx={{ mt: 2 }}>
                          <Divider sx={{ my: 1 }} />
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                startIcon={<GradeIcon />}
                                onClick={() => navigate(`/parent/grades/${child.id}`)}
                              >
                                {t('parentDashboard.viewGrades')}
                              </Button>
                            </Grid>
                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                startIcon={<AssignmentIcon />}
                                onClick={() => navigate(`/parent/attendance/${child.id}`)}
                              >
                                {t('parentDashboard.viewAttendance')}
                              </Button>
                            </Grid>
                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                startIcon={<AttachMoneyIcon />}
                                onClick={() => navigate(`/parent/fees/${child.id}`)}
                              >
                                {t('parentDashboard.viewFees')}
                              </Button>
                            </Grid>
                            <Grid item xs={6}>
                              <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                startIcon={<QuizIcon />}
                                onClick={() => navigate(`/parent/timetable/${child.id}`)}
                              >
                                {t('parentDashboard.viewTimetable')}
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Recent Grades */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{t('parentDashboard.recentGrades')}</Typography>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/parent/grades')}
            >
              {t('parentDashboard.viewAll')}
            </Button>
          </Box>
          {!data?.recentGrades || data.recentGrades.length === 0 ? (
            <Typography color="text.secondary">{t('parentDashboard.noGrades')}</Typography>
          ) : (
            <List>
              {data.recentGrades.slice(0, 5).map((grade, index) => (
                <Box key={grade.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {getStudentName(grade.student)} - {grade.exam?.subject?.name || grade.subject?.name || 'N/A'}
                          </Typography>
                          <Chip label={`${grade.marks_obtained}/${grade.exam?.total_marks || 'N/A'}`} size="small" color="primary" />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {grade.exam?.exam_name || 'N/A'} - {formatDate(grade.created_at)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < data.recentGrades.slice(0, 5).length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Paper>

        {/* Pending Fees */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{t('parentDashboard.pendingFees')}</Typography>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/parent/fees')}
            >
              {t('parentDashboard.viewAll')}
            </Button>
          </Box>
          {!data?.pendingFees || data.pendingFees.length === 0 ? (
            <Typography color="text.secondary">{t('parentDashboard.noPendingFees')}</Typography>
          ) : (
            <List>
              {data.pendingFees.slice(0, 5).map((fee, index) => (
                <Box key={fee.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {getStudentName(fee.student)} - {t(`fees.${fee.fee_type}`)}
                          </Typography>
                          <Chip
                            label={`$${parseFloat(fee.amount).toFixed(2)}`}
                            size="small"
                            color={fee.status === 'overdue' ? 'error' : 'warning'}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {t('fees.dueDate')}: {formatDate(fee.due_date)} | {t(`fees.${fee.status}`)}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/parent/fees/${fee.student_id}`)}
                      >
                        {t('parentDashboard.viewDetails')}
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < data.pendingFees.slice(0, 5).length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Paper>

        {/* Upcoming Exams */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{t('parentDashboard.upcomingExams')}</Typography>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/parent/exams')}
            >
              {t('parentDashboard.viewAll')}
            </Button>
          </Box>
          {!data?.upcomingExams || data.upcomingExams.length === 0 ? (
            <Typography color="text.secondary">{t('parentDashboard.noUpcomingExams')}</Typography>
          ) : (
            <List>
              {data.upcomingExams.slice(0, 5).map((exam, index) => (
                <Box key={exam.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {exam.title} - {exam.subject?.name || 'N/A'}
                          </Typography>
                          <Chip label={t(`exams.${exam.exam_type}`)} size="small" />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {t('exams.examDate')}: {formatDate(exam.exam_date)}
                          {exam.start_time && ` ${exam.start_time.substring(0, 5)}`}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < data.upcomingExams.slice(0, 5).length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Layout>
  );
};

export default ParentDashboard;

