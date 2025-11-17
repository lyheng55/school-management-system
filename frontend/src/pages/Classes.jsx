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
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Layout from '../components/Layout';
import api from '../services/api';

const Classes = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    capacity: '',
    classroom: '',
    class_teacher_id: '',
    academic_year: new Date().getFullYear().toString(),
    status: 'active',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('classes', async () => {
    const response = await api.get('/classes');
    return response.data.data;
  });

  const { data: teachers } = useQuery('teachers', async () => {
    const response = await api.get('/teachers');
    return response.data.data?.teachers || [];
  });

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/classes', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('classes');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('classes.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/classes/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('classes');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('classes.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/classes/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('classes');
      },
    }
  );

  const handleOpen = (classItem = null) => {
    setSelectedClass(classItem);
    setError('');
    if (classItem) {
      setFormData({
        name: classItem.name || '',
        section: classItem.section || '',
        capacity: classItem.capacity || '',
        classroom: classItem.classroom || '',
        class_teacher_id: classItem.class_teacher_id || '',
        academic_year: classItem.academic_year || new Date().getFullYear().toString(),
        status: classItem.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        section: '',
        capacity: '',
        classroom: '',
        class_teacher_id: '',
        academic_year: new Date().getFullYear().toString(),
        status: 'active',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedClass(null);
    setError('');
    setFormData({
      name: '',
      section: '',
      capacity: '',
      classroom: '',
      class_teacher_id: '',
      academic_year: new Date().getFullYear().toString(),
      status: 'active',
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

    // Prepare data - convert empty strings to null for optional fields
    const submitData = {
      ...formData,
      section: formData.section || null,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      classroom: formData.classroom || null,
      class_teacher_id: formData.class_teacher_id || null,
    };

    if (selectedClass) {
      updateMutation.mutate({ id: selectedClass.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('classes.title')}</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('classes.addClass')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('classes.className')}</TableCell>
              <TableCell>{t('classes.section')}</TableCell>
              <TableCell>{t('classes.classTeacher')}</TableCell>
              <TableCell>{t('classes.students')}</TableCell>
              <TableCell>{t('classes.academicYear')}</TableCell>
              <TableCell>{t('common.status')}</TableCell>
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
            ) : data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data?.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>{classItem.name}</TableCell>
                  <TableCell>{classItem.section || t('common.none')}</TableCell>
                  <TableCell>
                    {classItem.classTeacher
                      ? `${classItem.classTeacher.first_name} ${classItem.classTeacher.last_name}`
                      : t('common.none')}
                  </TableCell>
                  <TableCell>{classItem.students?.length || 0}</TableCell>
                  <TableCell>{classItem.academic_year}</TableCell>
                  <TableCell>{t(`common.${classItem.status}`)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/classes/${classItem.id}`)}
                      title={t('common.view')}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(classItem)}
                      title={t('common.edit')}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(classItem.id)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedClass ? t('classes.editClass') : t('classes.addClass')}
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
                <TextField
                  fullWidth
                  required
                  label={t('classes.className')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('classes.section')}
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('classes.academicYear')}
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('common.status')}</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label={t('common.status')}
                  >
                    <MenuItem value="active">{t('common.active')}</MenuItem>
                    <MenuItem value="inactive">{t('common.inactive')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('classes.capacity')}
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('classes.classroom')}
                  name="classroom"
                  value={formData.classroom}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('classes.classTeacher')}</InputLabel>
                  <Select
                    name="class_teacher_id"
                    value={formData.class_teacher_id}
                    onChange={handleChange}
                    label={t('classes.classTeacher')}
                  >
                    <MenuItem value="">{t('common.none')}</MenuItem>
                    {teachers?.map((teacher) => (
                      <MenuItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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

export default Classes;

