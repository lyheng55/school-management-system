import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Layout from '../components/Layout';
import api from '../services/api';
import { useState, useRef } from 'react';

const TeacherDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: teacher, isLoading: teacherLoading } = useQuery(
    ['teacher', id],
    async () => {
      const response = await api.get(`/teachers/${id}`);
      return response.data.data;
    },
    { enabled: !!id }
  );

  const { data: classes } = useQuery(
    ['classes'],
    async () => {
      const response = await api.get('/classes');
      return response.data.data || [];
    }
  );

  // Filter classes where this teacher is the class teacher
  const teacherClasses = classes?.filter(
    (cls) => cls.class_teacher_id === parseInt(id)
  ) || [];

  const photoUploadMutation = useMutation(
    async (file) => {
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
        queryClient.invalidateQueries(['teacher', id]);
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

  const handlePhotoClick = () => {
    setPhotoDialogOpen(true);
    setPhotoError('');
  };

  const handlePhotoClose = () => {
    setPhotoDialogOpen(false);
    setPhotoError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setPhotoError(t('students.invalidImageFile'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError(t('students.fileSizeLimit'));
        return;
      }
      setPhotoError('');
      photoUploadMutation.mutate(file);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.none');
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return t('common.none');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (teacherLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!teacher) {
    return (
      <Layout>
        <Box p={3}>
          <Typography variant="h5" color="error">{t('teachers.notFound')}</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/teachers')} sx={{ mt: 2 }}>
            {t('common.back')} {t('nav.teachers')}
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/teachers')}
          sx={{ mb: 2 }}
        >
          {t('common.back')} {t('nav.teachers')}
        </Button>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box position="relative">
            <Avatar
              src={teacher.photo ? `${api.defaults.baseURL}/${teacher.photo}` : undefined}
              sx={{ width: 80, height: 80 }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
              onClick={handlePhotoClick}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box>
            <Typography variant="h4">
              {teacher.first_name} {teacher.last_name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('teachers.employeeId')}: {teacher.teacher_id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('teachers.specialization')}: {teacher.specialization || t('common.none')} | {t('common.status')}: {teacher.status}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('students.basicInformation')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('teachers.dateOfBirth')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(teacher.date_of_birth)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('teachers.gender')}
                  </Typography>
                  <Typography variant="body1">
                    {teacher.gender}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.phone')}
                  </Typography>
                  <Typography variant="body1">
                    {teacher.phone || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.address')}
                  </Typography>
                  <Typography variant="body1">
                    {teacher.address || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('teachers.qualification')}
                  </Typography>
                  <Typography variant="body1">
                    {teacher.qualification || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('teachers.specialization')}
                  </Typography>
                  <Typography variant="body1">
                    {teacher.specialization || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('teachers.experienceYears')}
                  </Typography>
                  <Typography variant="body1">
                    {teacher.experience_years || 0} {t('teachers.years')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('teachers.hireDate')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(teacher.joining_date)}
                  </Typography>
                </Grid>
                {teacher.salary && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('teachers.salary')}
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(teacher.salary)}
                    </Typography>
                  </Grid>
                )}
                {teacher.user && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.email')}
                    </Typography>
                    <Typography variant="body1">
                      {teacher.user.email || t('common.none')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SchoolIcon color="primary" />
                    <Typography variant="h6">{teacher.subjects?.length || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('teachers.assignedSubjects')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ClassIcon color="primary" />
                    <Typography variant="h6">{teacherClasses.length}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('teachers.assignedClasses')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6">
                      {teacherClasses.reduce((sum, cls) => sum + (cls.students?.length || 0), 0)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.totalStudents')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Subjects Teaching */}
        {teacher.subjects && teacher.subjects.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('teachers.assignedSubjects')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {teacher.subjects.map((subject) => (
                    <Chip
                      key={subject.id}
                      label={subject.name}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Classes Assigned */}
        {teacherClasses.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('teachers.assignedClasses')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('classes.className')}</TableCell>
                        <TableCell>{t('classes.section')}</TableCell>
                        <TableCell>{t('common.students')}</TableCell>
                        <TableCell>{t('fees.academicYear')}</TableCell>
                        <TableCell>{t('common.status')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teacherClasses.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell>{cls.name}</TableCell>
                          <TableCell>{cls.section || '-'}</TableCell>
                          <TableCell>{cls.students?.length || 0}</TableCell>
                          <TableCell>{cls.academic_year}</TableCell>
                          <TableCell>
                            <Chip
                              label={cls.status}
                              color={cls.status === 'active' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

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

export default TeacherDetail;

