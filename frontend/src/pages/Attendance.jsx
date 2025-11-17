import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
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
  Alert,
  CircularProgress,
  Checkbox,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import Layout from '../components/Layout';
import api from '../services/api';

const Attendance = () => {
  const { t } = useTranslation();
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [remarks, setRemarks] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const queryClient = useQueryClient();

  const { data: classes } = useQuery('classes', async () => {
    const response = await api.get('/classes');
    return response.data.data;
  });

  // Fetch students for selected class
  const { data: students, isLoading: studentsLoading } = useQuery(
    ['students', selectedClass],
    async () => {
      if (!selectedClass) return [];
      const response = await api.get('/students', {
        params: { class_id: selectedClass, limit: 1000 },
      });
      return response.data.data?.students || [];
    },
    { enabled: !!selectedClass }
  );

  // Fetch existing attendance records
  const { data: attendance, isLoading: attendanceLoading } = useQuery(
    ['attendance', selectedClass, date],
    async () => {
      if (!selectedClass || !date) return [];
      const response = await api.get('/attendance', {
        params: { class_id: selectedClass, date },
      });
      return response.data.data || [];
    },
    {
      enabled: !!selectedClass && !!date,
      onSuccess: (data) => {
        // Initialize attendance data from existing records
        const initialData = {};
        const initialRemarks = {};
        data.forEach((record) => {
          initialData[record.student_id] = record.status;
          initialRemarks[record.student_id] = record.remarks || '';
        });
        setAttendanceData(initialData);
        setRemarks(initialRemarks);
      },
    }
  );

  // Fetch attendance statistics
  const { data: stats } = useQuery(
    ['attendance-stats', selectedClass],
    async () => {
      if (!selectedClass) return null;
      // Calculate stats from current month
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const response = await api.get('/attendance', {
        params: {
          class_id: selectedClass,
          start_date: startDate,
          end_date: endDate,
        },
      });
      const records = response.data.data || [];
      const total = records.length;
      const present = records.filter((r) => r.status === 'present').length;
      const absent = records.filter((r) => r.status === 'absent').length;
      const late = records.filter((r) => r.status === 'late').length;
      const excused = records.filter((r) => r.status === 'excused').length;
      const attendanceRate =
        total > 0 ? ((present + late) / total) * 100 : 0;

      return {
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate: attendanceRate.toFixed(1),
      };
    },
    { enabled: !!selectedClass }
  );

  const bulkMarkMutation = useMutation(
    async (data) => {
      const response = await api.post('/attendance/bulk', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['attendance', selectedClass, date]);
        queryClient.invalidateQueries(['attendance-stats', selectedClass]);
        setSuccess(t('attendance.attendanceMarked'));
        setError('');
        setTimeout(() => setSuccess(''), 3000);
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('attendance.failedToMark'));
        setSuccess('');
      },
    }
  );

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleRemarksChange = (studentId, value) => {
    setRemarks((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleBulkMark = (status) => {
    if (!selectedClass || !date || !students?.length) {
      setError(t('attendance.selectClassFirst'));
      return;
    }

    const newAttendanceData = { ...attendanceData };
    students.forEach((student) => {
      if (!newAttendanceData[student.id]) {
        newAttendanceData[student.id] = status;
      }
    });
    setAttendanceData(newAttendanceData);
  };

  const handleSubmit = () => {
    if (!selectedClass || !date || !students?.length) {
      setError('Please select a class and date');
      return;
    }

    const attendances = students.map((student) => ({
      student_id: student.id,
      status: attendanceData[student.id] || 'absent',
      remarks: remarks[student.id] || '',
    }));

    bulkMarkMutation.mutate({
      class_id: parseInt(selectedClass),
      date,
      attendances,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'excused':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon />;
      case 'absent':
        return <CancelIcon />;
      case 'late':
        return <AccessTimeIcon />;
      case 'excused':
        return <EventAvailableIcon />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        {t('attendance.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{t('attendance.selectClass')}</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setAttendanceData({});
                  setRemarks({});
                }}
                label={t('attendance.selectClass')}
              >
                {classes?.map((classItem) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.name} {classItem.section && `- ${classItem.section}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              type="date"
              label={t('attendance.selectDate')}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setAttendanceData({});
                setRemarks({});
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleBulkMark('present')}
                disabled={!selectedClass || !date}
              >
                {t('attendance.markAllPresent')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleBulkMark('absent')}
                disabled={!selectedClass || !date}
              >
                {t('attendance.markAllAbsent')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {stats && selectedClass && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('common.totalRecords')}
                </Typography>
                <Typography variant="h5">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('common.present')}
                </Typography>
                <Typography variant="h5" color="success.main">
                  {stats.present}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('common.absent')}
                </Typography>
                <Typography variant="h5" color="error.main">
                  {stats.absent}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('common.late')}
                </Typography>
                <Typography variant="h5" color="warning.main">
                  {stats.late}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {t('common.attendanceRate')}
                </Typography>
                <Typography variant="h5" color="primary.main">
                  {stats.attendanceRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {selectedClass && date && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              {t('attendance.markAttendance')} - {date}
            </Typography>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={bulkMarkMutation.isLoading || !students?.length}
              startIcon={
                bulkMarkMutation.isLoading ? (
                  <CircularProgress size={20} />
                ) : null
              }
            >
              {bulkMarkMutation.isLoading ? t('common.loading') : t('attendance.saveAttendance')}
            </Button>
          </Box>

          {studentsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : !students?.length ? (
            <Alert severity="info">{t('attendance.noStudents')}</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('students.studentId')}</TableCell>
                    <TableCell>{t('common.name')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell>{t('attendance.remarks')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => {
                    const currentStatus = attendanceData[student.id] || 'absent';
                    return (
                      <TableRow key={student.id}>
                        <TableCell>{student.student_id}</TableCell>
                        <TableCell>
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} alignItems="center">
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={currentStatus}
                                onChange={(e) =>
                                  handleStatusChange(student.id, e.target.value)
                                }
                              >
                                <MenuItem value="present">{t('common.present')}</MenuItem>
                                <MenuItem value="absent">{t('common.absent')}</MenuItem>
                                <MenuItem value="late">{t('common.late')}</MenuItem>
                                <MenuItem value="excused">{t('common.excused')}</MenuItem>
                              </Select>
                            </FormControl>
                            <Chip
                              label={t(`common.${currentStatus}`)}
                              color={getStatusColor(currentStatus)}
                              size="small"
                              icon={getStatusIcon(currentStatus)}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder={t('attendance.remarks')}
                            value={remarks[student.id] || ''}
                            onChange={(e) =>
                              handleRemarksChange(student.id, e.target.value)
                            }
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {!selectedClass && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="info">
            {t('attendance.selectClassFirst')}
          </Alert>
        </Paper>
      )}
    </Layout>
  );
};

export default Attendance;
