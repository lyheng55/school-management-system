import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Pagination,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Layout from '../components/Layout';
import api from '../services/api';

const Exams = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    class_id: '',
    subject_id: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    total_marks: '',
    passing_marks: '',
    room: '',
    instructions: '',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['exams', page, search],
    async () => {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const response = await api.get('/exams', { params });
      return response.data.data;
    }
  );

  const { data: classes } = useQuery('classes', async () => {
    const response = await api.get('/classes');
    return response.data.data;
  });

  const { data: subjects } = useQuery('subjects', async () => {
    try {
      const response = await api.get('/subjects');
      return response.data.data || [];
    } catch {
      return [];
    }
  });

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/exams', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('exams');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('exams.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/exams/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('exams');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('exams.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/exams/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('exams');
      },
    }
  );

  const handleOpen = (exam = null) => {
    setSelectedExam(exam);
    setError('');
    if (exam) {
      setFormData({
        name: exam.name || '',
        class_id: exam.class_id || '',
        subject_id: exam.subject_id || '',
        exam_date: exam.exam_date ? exam.exam_date.split('T')[0] : '',
        start_time: exam.start_time || '',
        end_time: exam.end_time || '',
        total_marks: exam.total_marks || '',
        passing_marks: exam.passing_marks || '',
        room: exam.room || '',
        instructions: exam.instructions || '',
      });
    } else {
      setFormData({
        name: '',
        class_id: '',
        subject_id: '',
        exam_date: '',
        start_time: '',
        end_time: '',
        total_marks: '',
        passing_marks: '',
        room: '',
        instructions: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedExam(null);
    setError('');
    setFormData({
      name: '',
      class_id: '',
      subject_id: '',
      exam_date: '',
      start_time: '',
      end_time: '',
      total_marks: '',
      passing_marks: '',
      room: '',
      instructions: '',
    });
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
      class_id: formData.class_id ? parseInt(formData.class_id) : null,
      subject_id: formData.subject_id ? parseInt(formData.subject_id) : null,
      total_marks: formData.total_marks ? parseFloat(formData.total_marks) : null,
      passing_marks: formData.passing_marks ? parseFloat(formData.passing_marks) : null,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      room: formData.room || null,
      instructions: formData.instructions || null,
    };

    if (selectedExam) {
      updateMutation.mutate({ id: selectedExam.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.none');
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return t('common.none');
    return timeString;
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('exams.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('exams.addExam')}
        </Button>
      </Box>

      <TextField
        fullWidth
        label={t('common.search')}
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('exams.examName')}</TableCell>
              <TableCell>{t('exams.class')}</TableCell>
              <TableCell>{t('exams.subject')}</TableCell>
              <TableCell>{t('common.date')}</TableCell>
              <TableCell>{t('timetables.time')}</TableCell>
              <TableCell>{t('exams.totalMarks')}</TableCell>
              <TableCell>{t('exams.passingMarks')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : data?.exams?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data?.exams?.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.name}</TableCell>
                  <TableCell>{exam.class?.name || t('common.none')}</TableCell>
                  <TableCell>{exam.subject?.name || t('common.none')}</TableCell>
                  <TableCell>{formatDate(exam.exam_date)}</TableCell>
                  <TableCell>
                    {exam.start_time && exam.end_time
                      ? `${formatTime(exam.start_time)} - ${formatTime(exam.end_time)}`
                      : t('common.none')}
                  </TableCell>
                  <TableCell>{exam.total_marks}</TableCell>
                  <TableCell>{exam.passing_marks}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/exams/${exam.id}`)}
                      title={t('common.view')}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(exam)}
                      title={t('common.edit')}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(exam.id)}
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

      {/* Pagination Controls */}
      {data?.pagination && data.pagination.pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Stack spacing={2}>
            <Pagination
              count={data.pagination.pages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Stack>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedExam ? t('exams.editExam') : t('exams.addExam')}
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
                <TextField
                  fullWidth
                  required
                  label={t('exams.examName')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('exams.class')}</InputLabel>
                  <Select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    label={t('exams.class')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {classes?.map((classItem) => (
                      <MenuItem key={classItem.id} value={classItem.id}>
                        {classItem.name} {classItem.section && `- ${classItem.section}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('exams.subject')}</InputLabel>
                  <Select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleChange}
                    label={t('exams.subject')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {subjects?.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('exams.examDate')}
                  name="exam_date"
                  type="date"
                  value={formData.exam_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label={t('exams.startTime')}
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label={t('exams.endTime')}
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('exams.totalMarks')}
                  name="total_marks"
                  type="number"
                  value={formData.total_marks}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('exams.passingMarks')}
                  name="passing_marks"
                  type="number"
                  value={formData.passing_marks}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('timetables.room')}
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('exams.instructions')}
                  name="instructions"
                  multiline
                  rows={3}
                  value={formData.instructions}
                  onChange={handleChange}
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

export default Exams;

