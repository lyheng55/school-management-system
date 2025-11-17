import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Layout from '../components/Layout';
import api from '../services/api';

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const Timetables = () => {
  const { t } = useTranslation();
  
  const dayLabels = {
    monday: t('timetables.monday'),
    tuesday: t('timetables.tuesday'),
    wednesday: t('timetables.wednesday'),
    thursday: t('timetables.thursday'),
    friday: t('timetables.friday'),
    saturday: t('timetables.saturday'),
    sunday: t('timetables.sunday'),
  };
  const [open, setOpen] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    teacher_id: '',
    day_of_week: 'monday',
    start_time: '',
    end_time: '',
    room: '',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: timetables, isLoading } = useQuery(
    ['timetables', selectedClassId],
    async () => {
      const params = selectedClassId ? { class_id: selectedClassId } : {};
      const response = await api.get('/timetables', { params });
      return response.data.data || [];
    }
  );

  const { data: classes } = useQuery('classes', async () => {
    const response = await api.get('/classes');
    return response.data.data || [];
  });

  const { data: subjects } = useQuery('subjects', async () => {
    const response = await api.get('/subjects');
    return response.data.data || [];
  });

  const { data: teachers } = useQuery('teachers', async () => {
    const response = await api.get('/teachers');
    return response.data.data?.teachers || [];
  });

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/timetables', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('timetables');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Failed to create timetable entry');
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/timetables/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('timetables');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Failed to update timetable entry');
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/timetables/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('timetables');
      },
    }
  );

  const handleOpen = (timetable = null) => {
    setSelectedTimetable(timetable);
    setError('');
    if (timetable) {
      setFormData({
        class_id: timetable.class_id || '',
        subject_id: timetable.subject_id || '',
        teacher_id: timetable.teacher_id || '',
        day_of_week: timetable.day_of_week || 'monday',
        start_time: timetable.start_time || '',
        end_time: timetable.end_time || '',
        room: timetable.room || '',
      });
    } else {
      setFormData({
        class_id: selectedClassId || '',
        subject_id: '',
        teacher_id: '',
        day_of_week: 'monday',
        start_time: '',
        end_time: '',
        room: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTimetable(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const submitData = {
      ...formData,
      room: formData.room || null,
    };

    if (selectedTimetable) {
      updateMutation.mutate({ id: selectedTimetable.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      deleteMutation.mutate(id);
    }
  };

  // Group timetables by day
  const groupedByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = (timetables || [])
      .filter((t) => t.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {});

  // Format time for display (HH:MM:SS -> HH:MM)
  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('timetables.title')}</Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t('timetables.filterByClass')}</InputLabel>
            <Select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              label={t('timetables.filterByClass')}
            >
              <MenuItem value="">{t('timetables.allClasses')}</MenuItem>
              {classes?.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  {classItem.name} {classItem.section ? `- ${classItem.section}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            disabled={!selectedClassId}
          >
            {t('timetables.addEntry')}
          </Button>
        </Box>
      </Box>

      {!selectedClassId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('timetables.selectClass')}
        </Alert>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={2}>
          {daysOfWeek.map((day) => (
            <Grid item xs={12} md={6} lg={4} key={day}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">{dayLabels[day]}</Typography>
                    <Chip
                      label={groupedByDay[day]?.length || 0}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  {groupedByDay[day]?.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('timetables.noClassesScheduled')}
                    </Typography>
                  ) : (
                    <Box>
                      {groupedByDay[day].map((timetable) => (
                        <Paper
                          key={timetable.id}
                          sx={{
                            p: 1.5,
                            mb: 1,
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {timetable.subject?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {formatTime(timetable.start_time)} - {formatTime(timetable.end_time)}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {timetable.teacher
                                  ? `${timetable.teacher.first_name} ${timetable.teacher.last_name}`
                                  : 'N/A'}
                              </Typography>
                              {timetable.room && (
                                <Typography variant="caption" display="block">
                                  {t('timetables.room')}: {timetable.room}
                                </Typography>
                              )}
                            </Box>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => handleOpen(timetable)}
                                sx={{ color: 'inherit' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(timetable.id)}
                                sx={{ color: 'inherit' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('timetables.day')}</TableCell>
                <TableCell>{t('timetables.time')}</TableCell>
                <TableCell>{t('timetables.subject')}</TableCell>
                <TableCell>{t('timetables.teacher')}</TableCell>
                <TableCell>{t('timetables.room')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timetables?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                timetables?.map((timetable) => (
                  <TableRow key={timetable.id}>
                    <TableCell>{dayLabels[timetable.day_of_week]}</TableCell>
                    <TableCell>
                      {formatTime(timetable.start_time)} - {formatTime(timetable.end_time)}
                    </TableCell>
                    <TableCell>{timetable.subject?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {timetable.teacher
                        ? `${timetable.teacher.first_name} ${timetable.teacher.last_name}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{timetable.room || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(timetable)}
                        title={t('common.edit')}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(timetable.id)}
                        disabled={deleteMutation.isLoading}
                        title={t('common.delete')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTimetable ? t('timetables.editEntry') : t('timetables.addNewEntry')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('classes.title')}</InputLabel>
                  <Select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    label={t('classes.title')}
                    disabled={!!selectedTimetable}
                  >
                    {classes?.map((classItem) => (
                      <MenuItem key={classItem.id} value={classItem.id}>
                        {classItem.name} {classItem.section ? `- ${classItem.section}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('timetables.subject')}</InputLabel>
                  <Select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleChange}
                    label={t('timetables.subject')}
                  >
                    {subjects?.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name} {subject.code ? `(${subject.code})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('timetables.teacher')}</InputLabel>
                  <Select
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleChange}
                    label={t('timetables.teacher')}
                  >
                    {teachers?.map((teacher) => (
                      <MenuItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('timetables.dayOfWeek')}</InputLabel>
                  <Select
                    name="day_of_week"
                    value={formData.day_of_week}
                    onChange={handleChange}
                    label={t('timetables.dayOfWeek')}
                  >
                    {daysOfWeek.map((day) => (
                      <MenuItem key={day} value={day}>
                        {dayLabels[day]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required
                  label={t('timetables.startTime')}
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required
                  label={t('timetables.endTime')}
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('timetables.room')}
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  placeholder="e.g., Room 101"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={createMutation.isLoading || updateMutation.isLoading}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {(createMutation.isLoading || updateMutation.isLoading) ? (
                <CircularProgress size={24} />
              ) : (
                t('common.save')
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Layout>
  );
};

export default Timetables;

