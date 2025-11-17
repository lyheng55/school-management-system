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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';
import api from '../services/api';

const Behaviors = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedBehavior, setSelectedBehavior] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [formData, setFormData] = useState({
    student_id: '',
    type: '',
    description: '',
    date: '',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['behaviors', page, filterType, filterClass],
    async () => {
      const params = { page, limit: 10 };
      if (filterType) params.type = filterType;
      if (filterClass) params.class_id = filterClass;
      const response = await api.get('/behaviors', { params });
      return response.data.data;
    }
  );

  const { data: classes } = useQuery('classes', async () => {
    const response = await api.get('/classes');
    return response.data.data;
  });

  const { data: students } = useQuery('allStudents', async () => {
    const params = { limit: 1000 };
    const response = await api.get('/students', { params });
    return response.data.data?.students || [];
  });

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/behaviors', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('behaviors');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('behaviors.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/behaviors/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('behaviors');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('behaviors.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/behaviors/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('behaviors');
      },
    }
  );

  const handleOpen = (behavior = null) => {
    setSelectedBehavior(behavior);
    setError('');
    if (behavior) {
      setFormData({
        student_id: behavior.student_id || '',
        type: behavior.type || '',
        description: behavior.description || '',
        date: behavior.date ? behavior.date.split('T')[0] : '',
      });
    } else {
      setFormData({
        student_id: '',
        type: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBehavior(null);
    setError('');
    setFormData({
      student_id: '',
      type: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
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
      student_id: parseInt(formData.student_id),
      date: formData.date || new Date().toISOString().split('T')[0],
    };

    if (selectedBehavior) {
      updateMutation.mutate({ id: selectedBehavior.id, data: submitData });
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

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('behaviors.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('behaviors.addBehavior')}
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('common.filter')}</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label={t('common.filter')}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            <MenuItem value="positive">{t('behaviors.positive')}</MenuItem>
            <MenuItem value="negative">{t('behaviors.negative')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('common.filter')}</InputLabel>
          <Select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            label={t('common.filter')}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            {classes?.map((classItem) => (
              <MenuItem key={classItem.id} value={classItem.id}>
                {classItem.name} {classItem.section && `- ${classItem.section}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('grades.student')}</TableCell>
              <TableCell>{t('students.class')}</TableCell>
              <TableCell>{t('behaviors.behaviorType')}</TableCell>
              <TableCell>{t('behaviors.description')}</TableCell>
              <TableCell>{t('common.date')}</TableCell>
              <TableCell>{t('behaviors.recordedBy')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : data?.behaviors?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data?.behaviors?.map((behavior) => (
                <TableRow key={behavior.id}>
                  <TableCell>
                    {behavior.student?.first_name} {behavior.student?.last_name}
                  </TableCell>
                  <TableCell>{behavior.student?.class?.name || t('common.none')}</TableCell>
                  <TableCell>
                    <Chip
                      label={behavior.type}
                      color={behavior.type === 'positive' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {behavior.description.length > 50
                      ? `${behavior.description.substring(0, 50)}...`
                      : behavior.description}
                  </TableCell>
                  <TableCell>{formatDate(behavior.date)}</TableCell>
                  <TableCell>{behavior.recordedBy?.username || t('common.none')}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(behavior)}
                      title={t('common.edit')}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(behavior.id)}
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
          {selectedBehavior ? t('behaviors.editBehavior') : t('behaviors.addBehavior')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('grades.student')}</InputLabel>
                  <Select
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    label={t('grades.student')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {students?.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} {student.class && `(${student.class.name})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('behaviors.behaviorType')}</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label={t('behaviors.behaviorType')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    <MenuItem value="positive">{t('behaviors.positive')}</MenuItem>
                    <MenuItem value="negative">{t('behaviors.negative')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('common.date')}
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label={t('behaviors.description')}
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
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

export default Behaviors;

