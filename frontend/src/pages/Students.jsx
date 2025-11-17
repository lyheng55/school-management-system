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

const Students = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    admission_date: '',
    class_id: '',
    parent_id: '',
    route_id: '',
    status: 'active',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['students', page, search],
    async () => {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const response = await api.get('/students', { params });
      return response.data.data;
    }
  );

  const { data: classes } = useQuery('classes', async () => {
    const response = await api.get('/classes');
    return response.data.data;
  });

  const { data: parents } = useQuery('parents', async () => {
    try {
      const response = await api.get('/parents');
      return response.data.data || [];
    } catch {
      return [];
    }
  });

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/students', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('students');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('students.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/students/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('students');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('students.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/students/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('students');
      },
    }
  );

  const handleOpen = (student = null) => {
    setSelectedStudent(student);
    setError('');
    if (student) {
      setFormData({
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
        gender: student.gender || '',
        phone: student.phone || '',
        address: student.address || '',
        emergency_contact: student.emergency_contact || '',
        emergency_phone: student.emergency_phone || '',
        admission_date: student.admission_date ? student.admission_date.split('T')[0] : '',
        class_id: student.class_id || '',
        parent_id: student.parent_id || '',
        route_id: student.route_id || '',
        status: student.status || 'active',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        address: '',
        emergency_contact: '',
        emergency_phone: '',
        admission_date: '',
        class_id: '',
        parent_id: '',
        route_id: '',
        status: 'active',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStudent(null);
    setError('');
    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      address: '',
      emergency_contact: '',
      emergency_phone: '',
      admission_date: '',
      class_id: '',
      parent_id: '',
      route_id: '',
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
      class_id: formData.class_id || null,
      parent_id: formData.parent_id || null,
      route_id: formData.route_id || null,
      phone: formData.phone || null,
      address: formData.address || null,
      emergency_contact: formData.emergency_contact || null,
      emergency_phone: formData.emergency_phone || null,
    };

    if (selectedStudent) {
      updateMutation.mutate({ id: selectedStudent.id, data: submitData });
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
        <Typography variant="h4">{t('students.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('students.addStudent')}
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
              <TableCell>{t('students.studentId')}</TableCell>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('students.class')}</TableCell>
              <TableCell>{t('common.status')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : data?.students?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data?.students?.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.student_id}</TableCell>
                  <TableCell>
                    {student.first_name} {student.last_name}
                  </TableCell>
                  <TableCell>{student.class?.name || t('common.none')}</TableCell>
                  <TableCell>{t(`common.${student.status}`)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/students/${student.id}`)}
                      title={t('common.view')}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(student)}
                      title={t('common.edit')}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(student.id)}
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
          {selectedStudent ? t('students.editStudent') : t('students.addStudent')}
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
                  label={t('students.firstName')}
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('students.lastName')}
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('students.dateOfBirth')}
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('students.gender')}</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label={t('students.gender')}
                  >
                    <MenuItem value="male">{t('students.male')}</MenuItem>
                    <MenuItem value="female">{t('students.female')}</MenuItem>
                    <MenuItem value="other">{t('common.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('students.phone')}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('students.admissionDate')}
                  name="admission_date"
                  type="date"
                  value={formData.admission_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('students.address')}
                  name="address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('students.class')}</InputLabel>
                  <Select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    label={t('students.class')}
                  >
                    <MenuItem value="">{t('common.none')}</MenuItem>
                    {classes?.map((classItem) => (
                      <MenuItem key={classItem.id} value={classItem.id}>
                        {classItem.name} {classItem.section && `- ${classItem.section}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                    <MenuItem value="graduated">{t('common.graduated')}</MenuItem>
                    <MenuItem value="transferred">{t('common.transferred')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('students.emergencyContact')}
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('students.emergencyPhone')}
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={handleChange}
                />
              </Grid>
              {parents && parents.length > 0 && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('students.parent')}</InputLabel>
                    <Select
                      name="parent_id"
                      value={formData.parent_id}
                      onChange={handleChange}
                      label={t('students.parent')}
                    >
                      <MenuItem value="">{t('common.none')}</MenuItem>
                      {parents.map((parent) => (
                        <MenuItem key={parent.id} value={parent.id}>
                          {parent.first_name} {parent.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
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

export default Students;

