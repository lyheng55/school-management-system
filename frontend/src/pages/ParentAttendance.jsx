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
  TextField,
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';

const ParentAttendance = () => {
  const { t } = useTranslation();
  const { childId } = useParams();
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(childId);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: children } = useQuery('parentChildren', async () => {
    const response = await api.get('/parents/children');
    return response.data.data || [];
  });

  const { data: attendanceData, isLoading } = useQuery(
    ['childAttendance', selectedChild, startDate, endDate],
    async () => {
      if (!selectedChild) return { attendance: [], statistics: {} };
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const response = await api.get(`/parents/children/${selectedChild}/attendance`, { params });
      return response.data.data || { attendance: [], statistics: {} };
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'excused': return 'info';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {t('parentAttendance.title')}
        </Typography>

        {children && children.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('parentAttendance.selectChild')}</InputLabel>
                  <Select
                    value={selectedChild || ''}
                    onChange={(e) => {
                      setSelectedChild(e.target.value);
                      navigate(`/parent/attendance/${e.target.value}`);
                    }}
                  >
                    {children.map((child) => (
                      <MenuItem key={child.id} value={child.id}>
                        {getStudentName(child)} {child.class && `- ${child.class.name}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t('parentAttendance.startDate')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t('parentAttendance.endDate')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !selectedChild ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('parentAttendance.selectChildFirst')}</Typography>
          </Paper>
        ) : !attendanceData?.attendance || attendanceData.attendance.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('parentAttendance.noAttendance')}</Typography>
          </Paper>
        ) : (
          <>
            {attendanceData.statistics && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        {t('attendance.attendanceRate')}
                      </Typography>
                      <Typography variant="h4">
                        {attendanceData.statistics.attendanceRate || 0}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        {t('attendance.present')}
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {attendanceData.statistics.present || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        {t('attendance.absent')}
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        {attendanceData.statistics.absent || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" variant="body2">
                        {t('attendance.late')}
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {attendanceData.statistics.late || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.date')}</TableCell>
                    <TableCell>{t('attendance.status')}</TableCell>
                    <TableCell>{t('attendance.remarks')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(`attendance.${record.status}`)}
                          color={getStatusColor(record.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Layout>
  );
};

export default ParentAttendance;

