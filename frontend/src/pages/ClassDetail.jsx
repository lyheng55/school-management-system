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
  Tabs,
  Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import Layout from '../components/Layout';
import api from '../services/api';
import { useState } from 'react';

const ClassDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const { data: classData, isLoading: classLoading } = useQuery(
    ['class', id],
    async () => {
      const response = await api.get(`/classes/${id}`);
      return response.data.data;
    },
    { enabled: !!id }
  );

  const { data: exams } = useQuery(
    ['classExams', id],
    async () => {
      const response = await api.get('/exams', { params: { class_id: id } });
      return response.data.data?.exams || [];
    },
    { enabled: !!id }
  );

  const { data: attendanceStats } = useQuery(
    ['classAttendanceStats', id],
    async () => {
      const response = await api.get('/attendance', {
        params: {
          class_id: id,
          start_date: startOfMonth,
          end_date: today,
        },
      });
      const records = response.data.data || [];
      const total = records.length;
      const present = records.filter((r) => r.status === 'present').length;
      const absent = records.filter((r) => r.status === 'absent').length;
      const late = records.filter((r) => r.status === 'late').length;
      const excused = records.filter((r) => r.status === 'excused').length;
      const attendanceRate = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;

      return {
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate,
      };
    },
    { enabled: !!id }
  );

  const formatDate = (dateString) => {
    if (!dateString) return t('common.none');
    return new Date(dateString).toLocaleDateString();
  };

  if (classLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!classData) {
    return (
      <Layout>
        <Box p={3}>
          <Typography variant="h5" color="error">{t('classes.notFound')}</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/classes')} sx={{ mt: 2 }}>
            {t('common.back')} {t('nav.classes')}
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/classes')}
          sx={{ mb: 2 }}
        >
          {t('common.back')} {t('nav.classes')}
        </Button>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
            <ClassIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4">
              {classData.name} {classData.section && `- ${classData.section}`}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('fees.academicYear')}: {classData.academic_year}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('classes.classTeacher')}: {classData.classTeacher ? `${classData.classTeacher.first_name} ${classData.classTeacher.last_name}` : t('classes.notAssigned')} | {t('common.status')}: {classData.status}
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
                {t('classes.classDetails')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('classes.classroom')}
                  </Typography>
                  <Typography variant="body1">
                    {classData.classroom || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('classes.capacity')}
                  </Typography>
                  <Typography variant="body1">
                    {classData.capacity || t('common.none')} {t('common.students')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('classes.currentStudents')}
                  </Typography>
                  <Typography variant="body1">
                    {classData.students?.length || 0} {t('common.students')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('nav.subjects')}
                  </Typography>
                  <Typography variant="body1">
                    {classData.subjects?.length || 0} {t('nav.subjects')}
                  </Typography>
                </Grid>
                {classData.classTeacher && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('classes.classTeacher')}
                    </Typography>
                    <Typography variant="body1">
                      {classData.classTeacher.first_name} {classData.classTeacher.last_name}
                    </Typography>
                    {classData.classTeacher.specialization && (
                      <Typography variant="body2" color="text.secondary">
                        {classData.classTeacher.specialization}
                      </Typography>
                    )}
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
                    <PeopleIcon color="primary" />
                    <Typography variant="h6">{classData.students?.length || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.students')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SchoolIcon color="primary" />
                    <Typography variant="h6">{classData.subjects?.length || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('nav.subjects')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <QuizIcon color="primary" />
                    <Typography variant="h6">{exams?.length || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('nav.exams')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AssignmentIcon color="primary" />
                    <Typography variant="h6">{attendanceStats?.attendanceRate || 0}%</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.attendanceRate')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Tabs for detailed views */}
        <Grid item xs={12}>
          <Paper>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab icon={<PeopleIcon />} label={t('common.students')} />
              <Tab icon={<SchoolIcon />} label={t('nav.subjects')} />
              <Tab icon={<QuizIcon />} label={t('nav.exams')} />
              <Tab icon={<AssignmentIcon />} label={t('nav.attendance')} />
            </Tabs>

            {/* Students Tab */}
            {tabValue === 0 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>{t('common.students')} ({classData.students?.length || 0})</Typography>
                {classData.students && classData.students.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('students.studentId')}</TableCell>
                          <TableCell>{t('common.name')}</TableCell>
                          <TableCell>{t('common.status')}</TableCell>
                          <TableCell>{t('common.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classData.students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.student_id}</TableCell>
                            <TableCell>
                              {student.first_name} {student.last_name}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={student.status}
                                color={student.status === 'active' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => navigate(`/students/${student.id}`)}
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
                  <Typography color="text.secondary">{t('classes.noStudentsInClass')}</Typography>
                )}
              </Box>
            )}

            {/* Subjects Tab */}
            {tabValue === 1 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>{t('nav.subjects')} ({classData.subjects?.length || 0})</Typography>
                {classData.subjects && classData.subjects.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('subjects.subjectName')}</TableCell>
                          <TableCell>{t('subjects.code')}</TableCell>
                          <TableCell>{t('common.description')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classData.subjects.map((subject) => (
                          <TableRow key={subject.id}>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell>{subject.code || t('common.none')}</TableCell>
                            <TableCell>{subject.description || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">{t('classes.noSubjectsAssigned')}</Typography>
                )}
              </Box>
            )}

            {/* Exams Tab */}
            {tabValue === 2 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>{t('nav.exams')} ({exams?.length || 0})</Typography>
                {exams && exams.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('exams.examName')}</TableCell>
                          <TableCell>{t('exams.subject')}</TableCell>
                          <TableCell>{t('common.date')}</TableCell>
                          <TableCell>{t('timetables.time')}</TableCell>
                          <TableCell>{t('exams.totalMarks')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {exams.map((exam) => (
                          <TableRow key={exam.id}>
                            <TableCell>{exam.name}</TableCell>
                            <TableCell>{exam.subject?.name || t('common.none')}</TableCell>
                            <TableCell>{formatDate(exam.exam_date)}</TableCell>
                            <TableCell>
                              {exam.start_time && exam.end_time
                                ? `${exam.start_time} - ${exam.end_time}`
                                : t('common.none')}
                            </TableCell>
                            <TableCell>{exam.total_marks}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">{t('classes.noExamsScheduled')}</Typography>
                )}
              </Box>
            )}

            {/* Attendance Tab */}
            {tabValue === 3 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>{t('attendance.attendanceStats')} ({t('dashboard.thisMonthsAttendance')})</Typography>
                {attendanceStats ? (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            {t('common.totalRecords')}
                          </Typography>
                          <Typography variant="h5">{attendanceStats.total}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            {t('common.present')}
                          </Typography>
                          <Typography variant="h5" color="success.main">
                            {attendanceStats.present}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            {t('common.absent')}
                          </Typography>
                          <Typography variant="h5" color="error.main">
                            {attendanceStats.absent}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            {t('common.attendanceRate')}
                          </Typography>
                          <Typography variant="h5" color="primary.main">
                            {attendanceStats.attendanceRate}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography color="text.secondary">{t('attendance.noDataAvailable')}</Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ClassDetail;

