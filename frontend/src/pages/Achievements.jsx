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

const Achievements = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [formData, setFormData] = useState({
    student_id: '',
    title: '',
    description: '',
    category: '',
    date: '',
    certificate_url: '',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['achievements', page, filterCategory, filterClass],
    async () => {
      const params = { page, limit: 10 };
      if (filterCategory) params.category = filterCategory;
      if (filterClass) params.class_id = filterClass;
      const response = await api.get('/achievements', { params });
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
      const response = await api.post('/achievements', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('achievements');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('achievements.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/achievements/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('achievements');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('achievements.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/achievements/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('achievements');
      },
    }
  );

  const handleOpen = (achievement = null) => {
    setSelectedAchievement(achievement);
    setError('');
    if (achievement) {
      setFormData({
        student_id: achievement.student_id || '',
        title: achievement.title || '',
        description: achievement.description || '',
        category: achievement.category || '',
        date: achievement.date ? achievement.date.split('T')[0] : '',
        certificate_url: achievement.certificate_url || '',
      });
    } else {
      setFormData({
        student_id: '',
        title: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        certificate_url: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAchievement(null);
    setError('');
    setFormData({
      student_id: '',
      title: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      certificate_url: '',
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
      description: formData.description || null,
      certificate_url: formData.certificate_url || null,
    };

    if (selectedAchievement) {
      updateMutation.mutate({ id: selectedAchievement.id, data: submitData });
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

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'primary',
      sports: 'success',
      arts: 'secondary',
      leadership: 'warning',
      other: 'default',
    };
    return colors[category] || 'default';
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('achievements.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('achievements.addAchievement')}
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('common.filter')}</InputLabel>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            label={t('common.filter')}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            <MenuItem value="academic">{t('achievements.academic')}</MenuItem>
            <MenuItem value="sports">{t('achievements.sports')}</MenuItem>
            <MenuItem value="arts">{t('achievements.arts')}</MenuItem>
            <MenuItem value="leadership">{t('achievements.leadership')}</MenuItem>
            <MenuItem value="other">{t('common.other')}</MenuItem>
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
              <TableCell>{t('achievements.achievementName')}</TableCell>
              <TableCell>{t('achievements.category')}</TableCell>
              <TableCell>{t('common.description')}</TableCell>
              <TableCell>{t('common.date')}</TableCell>
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
            ) : data?.achievements?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data?.achievements?.map((achievement) => (
                <TableRow key={achievement.id}>
                  <TableCell>
                    {achievement.student?.first_name} {achievement.student?.last_name}
                  </TableCell>
                  <TableCell>{achievement.student?.class?.name || t('common.none')}</TableCell>
                  <TableCell>{achievement.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={achievement.category}
                      color={getCategoryColor(achievement.category)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {achievement.description && achievement.description.length > 50
                      ? `${achievement.description.substring(0, 50)}...`
                      : achievement.description || '-'}
                  </TableCell>
                  <TableCell>{formatDate(achievement.date)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(achievement)}
                      title={t('common.edit')}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(achievement.id)}
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
          {selectedAchievement ? t('achievements.editAchievement') : t('achievements.addAchievement')}
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
                  <InputLabel>{t('achievements.category')}</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label={t('achievements.category')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    <MenuItem value="academic">{t('achievements.academic')}</MenuItem>
                    <MenuItem value="sports">{t('achievements.sports')}</MenuItem>
                    <MenuItem value="arts">{t('achievements.arts')}</MenuItem>
                    <MenuItem value="leadership">{t('achievements.leadership')}</MenuItem>
                    <MenuItem value="other">{t('common.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label={t('achievements.achievementName')}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('achievements.certificateUrl')}
                  name="certificate_url"
                  value={formData.certificate_url}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('common.description')}
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

export default Achievements;

