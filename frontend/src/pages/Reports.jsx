import { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  Divider,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import Layout from '../components/Layout';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports = () => {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState('student-performance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Get classes for filter
  const { data: classes } = useQuery('classes', async () => {
    const response = await api.get('/classes').catch(() => ({ data: { data: [] } }));
    return response.data.data || [];
  });

  // Get students for filter
  const { data: students } = useQuery('students', async () => {
    const response = await api.get('/students?limit=1000').catch(() => ({ data: { data: { students: [] } } }));
    return response.data.data?.students || [];
  });

  // Get subjects for filter
  const { data: subjects } = useQuery('subjects', async () => {
    const response = await api.get('/subjects').catch(() => ({ data: { data: [] } }));
    return response.data.data || [];
  });

  // Student Performance Analytics
  const { data: studentPerformance, isLoading: studentLoading } = useQuery(
    ['studentPerformance', startDate, endDate, classId, studentId, subjectId],
    async () => {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (classId) params.class_id = classId;
      if (studentId) params.student_id = studentId;
      if (subjectId) params.subject_id = subjectId;

      const response = await api.get('/analytics/students/performance', { params }).catch(() => ({ data: { data: {} } }));
      return response.data.data || {};
    },
    { enabled: reportType === 'student-performance' }
  );

  // Staff Performance Reports
  const { data: staffPerformance, isLoading: staffLoading } = useQuery(
    ['staffPerformance', startDate, endDate],
    async () => {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/analytics/staff/performance', { params }).catch(() => ({ data: { data: {} } }));
      return response.data.data || {};
    },
    { enabled: reportType === 'staff-performance' }
  );

  // Finance Reports
  const { data: financeReports, isLoading: financeLoading } = useQuery(
    ['financeReports', startDate, endDate, classId],
    async () => {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (classId) params.class_id = classId;

      const response = await api.get('/analytics/finance', { params }).catch(() => ({ data: { data: {} } }));
      return response.data.data || {};
    },
    { enabled: reportType === 'finance' }
  );

  // Attendance Analytics
  const { data: attendanceAnalytics, isLoading: attendanceLoading } = useQuery(
    ['attendanceAnalytics', startDate, endDate, classId, studentId],
    async () => {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (classId) params.class_id = classId;
      if (studentId) params.student_id = studentId;

      const response = await api.get('/analytics/attendance', { params }).catch(() => ({ data: { data: {} } }));
      return response.data.data || {};
    },
    { enabled: reportType === 'attendance' }
  );

  const isLoading = studentLoading || staffLoading || financeLoading || attendanceLoading;

  const handleExport = () => {
    // TODO: Implement PDF/Excel export
    alert(t('reports.exportComingSoon'));
  };

  const renderStudentPerformance = () => {
    if (!studentPerformance || Object.keys(studentPerformance).length === 0) {
      return <Alert severity="info">{t('reports.noDataAvailable')}</Alert>;
    }

    const gradeDistributionData = studentPerformance.summary?.gradeDistribution
      ? Object.keys(studentPerformance.summary.gradeDistribution).map(grade => ({
          name: grade,
          value: studentPerformance.summary.gradeDistribution[grade]
        }))
      : [];

    const subjectData = studentPerformance.bySubject?.slice(0, 10) || [];
    const classData = studentPerformance.byClass || [];
    const monthlyData = studentPerformance.monthlyTrend || [];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('reports.summary')}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">{t('reports.totalGrades')}</Typography>
                  <Typography variant="h4">{studentPerformance.summary?.totalGrades || 0}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">{t('reports.averageMarks')}</Typography>
                  <Typography variant="h4">{studentPerformance.summary?.averageMarks || 0}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {gradeDistributionData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.gradeDistribution')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gradeDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {subjectData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.performanceBySubject')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" fill="#8884d8" name={t('reports.averageMarks')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {monthlyData.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.monthlyTrend')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="average" stroke="#8884d8" name={t('reports.averageMarks')} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderStaffPerformance = () => {
    if (!staffPerformance || !staffPerformance.teachers) {
      return <Alert severity="info">{t('reports.noDataAvailable')}</Alert>;
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('reports.summary')}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('reports.totalTeachers')}</Typography>
                  <Typography variant="h4">{staffPerformance.summary?.totalTeachers || 0}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('reports.activeTeachers')}</Typography>
                  <Typography variant="h4">{staffPerformance.summary?.activeTeachers || 0}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('reports.totalAttendanceMarked')}</Typography>
                  <Typography variant="h4">{staffPerformance.summary?.totalAttendanceMarked || 0}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('reports.totalExams')}</Typography>
                  <Typography variant="h4">{staffPerformance.summary?.totalExams || 0}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('reports.teacherDetails')}</Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {staffPerformance.teachers?.map((teacher) => (
                  <Box key={teacher.teacher_id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{teacher.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{teacher.email}</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2">{t('reports.classes')}: {teacher.totalClasses || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2">{t('reports.attendanceMarked')}: {teacher.attendanceMarked || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2">{t('reports.examsCreated')}: {teacher.examsCreated || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2">{t('reports.gradesEntered')}: {teacher.gradesEntered || 0}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderFinanceReports = () => {
    if (!financeReports || Object.keys(financeReports).length === 0) {
      return <Alert severity="info">{t('reports.noDataAvailable')}</Alert>;
    }

    const feeTypeData = financeReports.feeTypeBreakdown || [];
    const monthlyData = financeReports.monthlyTrend || [];
    const classData = financeReports.classBreakdown || [];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('reports.summary')}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('reports.totalFees')}</Typography>
                  <Typography variant="h4">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financeReports.summary?.totalFees || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('reports.totalPayments')}</Typography>
                  <Typography variant="h4" color="success.main">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financeReports.summary?.totalPayments || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('reports.collectionRate')}</Typography>
                  <Typography variant="h4" color="primary.main">
                    {financeReports.summary?.collectionRate || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('reports.pendingAmount')}</Typography>
                  <Typography variant="h4" color="warning.main">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financeReports.summary?.pendingAmount || 0)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {feeTypeData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.feeTypeBreakdown')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={feeTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name={t('reports.total')} />
                    <Bar dataKey="paid" fill="#00C49F" name={t('common.paid')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {monthlyData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.monthlyPayments')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" name={t('reports.amount')} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {classData.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.classBreakdown')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name={t('reports.total')} />
                    <Bar dataKey="paid" fill="#00C49F" name={t('common.paid')} />
                    <Bar dataKey="pending" fill="#FF8042" name={t('common.pending')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderAttendanceReports = () => {
    if (!attendanceAnalytics || Object.keys(attendanceAnalytics).length === 0) {
      return <Alert severity="info">{t('reports.noDataAvailable')}</Alert>;
    }

    const dailyData = attendanceAnalytics.dailyTrend || [];
    const classData = attendanceAnalytics.classBreakdown || [];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('reports.summary')}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('reports.totalRecords')}</Typography>
                  <Typography variant="h4">{attendanceAnalytics.summary?.total || 0}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('common.present')}</Typography>
                  <Typography variant="h4" color="success.main">{attendanceAnalytics.summary?.present || 0}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('common.absent')}</Typography>
                  <Typography variant="h4" color="error.main">{attendanceAnalytics.summary?.absent || 0}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">{t('common.attendanceRate')}</Typography>
                  <Typography variant="h4" color="primary.main">{attendanceAnalytics.summary?.attendanceRate || 0}%</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {dailyData.length > 0 && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.dailyTrend')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rate" stroke="#8884d8" name={t('common.attendanceRate') + ' (%)'} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {classData.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.classBreakdown')}</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" fill="#8884d8" name={t('common.attendanceRate') + ' (%)'} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('reports.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={isLoading}
        >
          {t('reports.export')}
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('reports.reportType')}</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label={t('reports.reportType')}
                >
                  <MenuItem value="student-performance">{t('reports.studentPerformance')}</MenuItem>
                  <MenuItem value="staff-performance">{t('reports.staffPerformance')}</MenuItem>
                  <MenuItem value="finance">{t('reports.finance')}</MenuItem>
                  <MenuItem value="attendance">{t('reports.attendance')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label={t('reports.startDate')}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label={t('reports.endDate')}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {reportType !== 'staff-performance' && (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>{t('reports.class')}</InputLabel>
                  <Select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    label={t('reports.class')}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    {classes?.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {reportType === 'student-performance' && (
              <>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>{t('reports.student')}</InputLabel>
                    <Select
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      label={t('reports.student')}
                    >
                      <MenuItem value="">{t('common.all')}</MenuItem>
                      {students?.map((student) => (
                        <MenuItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>{t('reports.subject')}</InputLabel>
                    <Select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      label={t('reports.subject')}
                    >
                      <MenuItem value="">{t('common.all')}</MenuItem>
                      {subjects?.map((subject) => (
                        <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            {reportType === 'attendance' && (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>{t('reports.student')}</InputLabel>
                  <Select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    label={t('reports.student')}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    {students?.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Report Content */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {reportType === 'student-performance' && renderStudentPerformance()}
          {reportType === 'staff-performance' && renderStaffPerformance()}
          {reportType === 'finance' && renderFinanceReports()}
          {reportType === 'attendance' && renderAttendanceReports()}
        </>
      )}
    </Layout>
  );
};

export default Reports;

