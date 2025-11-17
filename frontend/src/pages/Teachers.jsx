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
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import Layout from '../components/Layout';
import api from '../services/api';

const Teachers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    address: '',
    qualification: '',
    specialization: '',
    experience_years: '',
    joining_date: '',
    salary: '',
    status: 'active',
  });
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['teachers', page, search],
    async () => {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const response = await api.get('/teachers', { params });
      return response.data.data;
    }
  );

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/teachers', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teachers');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('teachers.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/teachers/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teachers');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('teachers.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/teachers/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teachers');
      },
    }
  );

  const photoUploadMutation = useMutation(
    async ({ id, file }) => {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await api.post(`/teachers/${id}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teachers');
        setPhotoDialogOpen(false);
        setPhotoError('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (err) => {
        setPhotoError(err.response?.data?.message || t('teachers.failedToUploadPhoto'));
      },
    }
  );

  const handleOpen = (teacher = null) => {
    setSelectedTeacher(teacher);
    setError('');
    if (teacher) {
      setFormData({
        first_name: teacher.first_name || '',
        last_name: teacher.last_name || '',
        date_of_birth: teacher.date_of_birth ? teacher.date_of_birth.split('T')[0] : '',
        gender: teacher.gender || '',
        phone: teacher.phone || '',
        address: teacher.address || '',
        qualification: teacher.qualification || '',
        specialization: teacher.specialization || '',
        experience_years: teacher.experience_years || '',
        joining_date: teacher.joining_date ? teacher.joining_date.split('T')[0] : '',
        salary: teacher.salary || '',
        status: teacher.status || 'active',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        address: '',
        qualification: '',
        specialization: '',
        experience_years: '',
        joining_date: '',
        salary: '',
        status: 'active',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTeacher(null);
    setError('');
    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      address: '',
      qualification: '',
      specialization: '',
      experience_years: '',
      joining_date: '',
      salary: '',
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
      date_of_birth: formData.date_of_birth || null,
      phone: formData.phone || null,
      address: formData.address || null,
      qualification: formData.qualification || null,
      specialization: formData.specialization || null,
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      salary: formData.salary ? parseFloat(formData.salary) : null,
    };

    if (selectedTeacher) {
      updateMutation.mutate({ id: selectedTeacher.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const handlePhotoClick = (teacherId) => {
    setSelectedTeacher({ id: teacherId });
    setPhotoDialogOpen(true);
    setPhotoError('');
  };

  const handlePhotoClose = () => {
    setPhotoDialogOpen(false);
    setPhotoError('');
    setSelectedTeacher(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && selectedTeacher?.id) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setPhotoError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('File size must be less than 5MB');
        return;
      }
      setPhotoError('');
      photoUploadMutation.mutate({ id: selectedTeacher.id, file });
    }
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('teachers.title')}</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('teachers.addTeacher')}
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
              <TableCell>{t('teachers.employeeId')}</TableCell>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('teachers.specialization')}</TableCell>
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
            ) : data?.teachers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data?.teachers?.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.teacher_id}</TableCell>
                  <TableCell>
                    {teacher.first_name} {teacher.last_name}
                  </TableCell>
                  <TableCell>{teacher.specialization || t('common.none')}</TableCell>
                  <TableCell>{t(`common.${teacher.status}`)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/teachers/${teacher.id}`)}
                      title={t('common.view')}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handlePhotoClick(teacher.id)}
                      title={t('teachers.uploadPhoto')}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(teacher)}
                      title={t('common.edit')}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(teacher.id)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTeacher ? t('teachers.editTeacher') : t('teachers.addTeacher')}
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
                  label={t('teachers.firstName')}
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('teachers.lastName')}
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('teachers.dateOfBirth')}
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('teachers.gender')}</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label={t('teachers.gender')}
                  >
                    <MenuItem value="male">{t('teachers.male')}</MenuItem>
                    <MenuItem value="female">{t('teachers.female')}</MenuItem>
                    <MenuItem value="other">{t('common.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('teachers.phone')}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('teachers.hireDate')}
                  name="joining_date"
                  type="date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('teachers.address')}
                  name="address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('teachers.qualification')}
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('teachers.specialization')}
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('teachers.experienceYears')}
                  name="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('teachers.salary')}
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
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
                    <MenuItem value="resigned">{t('common.resigned')}</MenuItem>
                    <MenuItem value="retired">{t('common.retired')}</MenuItem>
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

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onClose={handlePhotoClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('teachers.uploadPhoto')}</DialogTitle>
        <DialogContent>
          {photoError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {photoError}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="teacher-photo-upload-input"
            />
            <label htmlFor="teacher-photo-upload-input">
              <Button
                variant="contained"
                component="span"
                fullWidth
                disabled={photoUploadMutation.isLoading}
                startIcon={<PhotoCameraIcon />}
              >
                {photoUploadMutation.isLoading ? t('common.uploading') : t('teachers.selectPhoto')}
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('teachers.supportedFormats')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePhotoClose} disabled={photoUploadMutation.isLoading}>
            {t('common.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Teachers;

