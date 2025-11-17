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
  LinearProgress,
  Divider,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';
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
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: color, fontSize: 40 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const endOfMonth = new Date().toISOString().split('T')[0];

  // Use new analytics endpoint for KPIs
  const { data: kpis, isLoading: kpisLoading } = useQuery('dashboardKPIs', async () => {
    const response = await api.get('/analytics/dashboard/kpis').catch(() => ({ data: { data: {} } }));
    return response.data.data || {};
  });

  // Get attendance analytics for charts
  const { data: attendanceAnalytics, isLoading: attendanceLoading } = useQuery(
    'attendanceAnalytics',
    async () => {
      const response = await api.get('/analytics/attendance', {
        params: { start_date: startOfMonth, end_date: endOfMonth }
      }).catch(() => ({ data: { data: {} } }));
      return response.data.data || {};
    }
  );

  // Get finance analytics for charts (admin only)
  const { data: financeAnalytics, isLoading: financeLoading } = useQuery(
    'financeAnalytics',
    async () => {
      const response = await api.get('/analytics/finance', {
        params: { start_date: startOfMonth, end_date: endOfMonth }
      }).catch(() => ({ data: { data: {} } }));
      return response.data.data || {};
    },
    { enabled: user?.role === 'admin' } // Only load if admin
  );

  // Get recent exams
  const { data: recentExams } = useQuery('recentExams', async () => {
    const response = await api.get('/exams?limit=5').catch(() => ({ data: { data: { exams: [] } } }));
    return response.data.data?.exams || [];
  });

  const isLoading = kpisLoading || attendanceLoading;

  // Prepare chart data
  const attendanceStatusData = kpis?.attendance?.today ? [
    { name: t('common.present'), value: kpis.attendance.today.present, color: '#2e7d32' },
    { name: t('common.absent'), value: kpis.attendance.today.total - kpis.attendance.today.present, color: '#d32f2f' },
    { name: t('common.late'), value: 0, color: '#ed6c02' },
  ] : [];

  const dailyAttendanceData = attendanceAnalytics?.dailyTrend?.slice(-7) || [];
  const monthlyFinanceData = financeAnalytics?.monthlyTrend || [];

  if (isLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title')}
      </Typography>

      {/* Main Statistics */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalStudents')}
            value={kpis?.students?.total || 0}
            icon={<PeopleIcon />}
            color="#1976d2"
            subtitle={`${kpis?.students?.active || 0} ${t('common.active').toLowerCase()}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalTeachers')}
            value={kpis?.teachers?.total || 0}
            icon={<SchoolIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalClasses')}
            value={kpis?.classes?.total || 0}
            icon={<ClassIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.attendanceToday')}
            value={`${kpis?.attendance?.today?.rate || 0}%`}
            icon={<AssignmentIcon />}
            color="#d32f2f"
            subtitle={`${kpis?.attendance?.today?.present || 0} ${t('common.present').toLowerCase()}`}
          />
        </Grid>
      </Grid>

      {/* Attendance Statistics with Charts */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.todaysAttendance')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 30 }} />
                    <Typography variant="h5" color="success.main">
                      {kpis?.attendance?.today?.present || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.present')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <CancelIcon sx={{ color: 'error.main', fontSize: 30 }} />
                    <Typography variant="h5" color="error.main">
                      {(kpis?.attendance?.today?.total || 0) - (kpis?.attendance?.today?.present || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.absent')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <ScheduleIcon sx={{ color: 'warning.main', fontSize: 30 }} />
                    <Typography variant="h5" color="warning.main">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.late')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <EmojiEventsIcon sx={{ color: 'info.main', fontSize: 30 }} />
                    <Typography variant="h5" color="info.main">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.excused')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              {kpis?.attendance?.today?.total > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('common.attendanceRate')}: {kpis?.attendance?.today?.rate || 0}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(kpis?.attendance?.today?.rate || 0)}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.thisMonthsAttendance')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.totalRecords')}
                  </Typography>
                  <Typography variant="h4">
                    {kpis?.attendance?.month?.total || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.attendanceRate')}
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {kpis?.attendance?.month?.rate || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">
                          {t('common.present')}
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {kpis?.attendance?.month?.present || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">
                          {t('common.absent')}
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {(kpis?.attendance?.month?.total || 0) - (kpis?.attendance?.month?.present || 0)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      {dailyAttendanceData.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('dashboard.attendanceTrend')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rate" stroke="#1976d2" name={t('common.attendanceRate') + ' (%)'} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('dashboard.attendanceStatus')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={attendanceStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendanceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Fee Summary */}
      {kpis?.finance && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <AttachMoneyIcon color="primary" />
                  <Typography variant="h6">{t('dashboard.feeSummary')}</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('fees.totalAmount')}
                    </Typography>
                    <Typography variant="h5">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(kpis?.finance?.totalFees || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.totalPaid')}
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(kpis?.finance?.totalPayments || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.pending')}
                    </Typography>
                    <Typography variant="h5" color="warning.main">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format((kpis?.finance?.totalFees || 0) - (kpis?.finance?.totalPayments || 0))}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.collectionRate')}
                    </Typography>
                    <Typography variant="h5" color="primary.main">
                      {kpis?.finance?.collectionRate || 0}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Exams */}
          {recentExams && recentExams.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <QuizIcon color="primary" />
                    <Typography variant="h6">{t('dashboard.recentExams')}</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box>
                    {recentExams.slice(0, 5).map((exam) => (
                      <Box key={exam.id} sx={{ mb: 1.5 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {exam.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {exam.class?.name || t('common.none')} - {exam.subject?.name || t('common.none')} |{' '}
                          {new Date(exam.exam_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('common.welcome')} {t('auth.schoolManagementSystem')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('dashboard.useNavigationMenu')}
        </Typography>
      </Paper>
    </Layout>
  );
};

export default Dashboard;

