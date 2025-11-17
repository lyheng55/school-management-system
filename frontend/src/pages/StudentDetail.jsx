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
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import GradeIcon from '@mui/icons-material/Grade';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import Layout from '../components/Layout';
import api from '../services/api';
import { useState, useRef } from 'react';

const StudentDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: student, isLoading: studentLoading } = useQuery(
    ['student', id],
    async () => {
      const response = await api.get(`/students/${id}`);
      return response.data.data;
    },
    { enabled: !!id }
  );

  const { data: grades } = useQuery(
    ['studentGrades', id],
    async () => {
      const response = await api.get(`/grades/student/${id}`);
      return response.data.data?.grades || [];
    },
    { enabled: !!id }
  );

  const { data: behaviors } = useQuery(
    ['studentBehaviors', id],
    async () => {
      const response = await api.get(`/behaviors/student/${id}`);
      return response.data.data?.behaviors || [];
    },
    { enabled: !!id }
  );

  const { data: achievements } = useQuery(
    ['studentAchievements', id],
    async () => {
      const response = await api.get(`/achievements/student/${id}`);
      return response.data.data?.achievements || [];
    },
    { enabled: !!id }
  );

  const { data: fees } = useQuery(
    ['studentFees', id],
    async () => {
      const response = await api.get(`/fees/student/${id}`);
      return response.data.data?.fees || [];
    },
    { enabled: !!id }
  );

  const { data: payments } = useQuery(
    ['studentPayments', id],
    async () => {
      const response = await api.get(`/payments/student/${id}`);
      return response.data.data?.payments || [];
    },
    { enabled: !!id }
  );

  const photoUploadMutation = useMutation(
    async (file) => {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await api.post(`/students/${id}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['student', id]);
        setPhotoDialogOpen(false);
        setPhotoError('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (err) => {
        setPhotoError(err.response?.data?.message || t('students.failedToUploadPhoto'));
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
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setPhotoError(t('students.invalidImageFile'));
        return;
      }
      // Validate file size (5MB)
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'default';
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'info';
    if (grade.startsWith('C')) return 'warning';
    return 'error';
  };

  const calculatePaidAmount = (fee) => {
    if (!fee.payments || fee.payments.length === 0) return 0;
    return fee.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: 'success',
      pending: 'warning',
      partial: 'info',
      overdue: 'error',
    };
    return colors[status] || 'default';
  };

  if (studentLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <Box p={3}>
          <Typography variant="h5" color="error">{t('students.notFound')}</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/students')} sx={{ mt: 2 }}>
            {t('common.back')} {t('nav.students')}
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
          onClick={() => navigate('/students')}
          sx={{ mb: 2 }}
        >
          {t('common.back')} {t('nav.students')}
        </Button>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box position="relative">
            <Avatar
              src={student.photo ? `${api.defaults.baseURL}/${student.photo}` : undefined}
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
              {student.first_name} {student.last_name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('students.studentId')}: {student.student_id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('students.class')}: {student.class?.name || t('common.none')} | {t('common.status')}: {student.status}
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
                    {t('students.dateOfBirth')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(student.date_of_birth)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('students.gender')}
                  </Typography>
                  <Typography variant="body1">
                    {student.gender}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.phone')}
                  </Typography>
                  <Typography variant="body1">
                    {student.phone || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.address')}
                  </Typography>
                  <Typography variant="body1">
                    {student.address || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('students.admissionDate')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(student.admission_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('students.emergencyContact')}
                  </Typography>
                  <Typography variant="body1">
                    {student.emergency_contact || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('students.emergencyPhone')}
                  </Typography>
                  <Typography variant="body1">
                    {student.emergency_phone || t('common.none')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Parent Information Card */}
        {student.parent && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <FamilyRestroomIcon color="primary" />
                  <Typography variant="h6">
                    {t('students.parentInformation')}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.name')}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {student.parent.first_name} {student.parent.last_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('students.relationship')}
                    </Typography>
                    <Typography variant="body1">
                      {student.parent.relationship ? 
                        t(`students.${student.parent.relationship}`) : 
                        t('common.none')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('common.phone')}
                        </Typography>
                        <Typography variant="body1">
                          {student.parent.phone || t('common.none')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {student.parent.user && (
                    <>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {t('common.email')}
                            </Typography>
                            <Typography variant="body1">
                              {student.parent.user.email || t('common.none')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {t('common.username')}
                            </Typography>
                            <Typography variant="body1">
                              {student.parent.user.username || t('common.none')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </>
                  )}
                  {student.parent.occupation && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <WorkIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {t('students.occupation')}
                          </Typography>
                          <Typography variant="body1">
                            {student.parent.occupation}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  {student.parent.address && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.address')}
                      </Typography>
                      <Typography variant="body1">
                        {student.parent.address}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Statistics Cards */}
        <Grid item xs={12} md={student.parent ? 4 : 8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <GradeIcon color="primary" />
                    <Typography variant="h6">{grades?.length || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('nav.grades')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PsychologyIcon color="primary" />
                    <Typography variant="h6">{behaviors?.length || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('behaviors.title')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmojiEventsIcon color="primary" />
                    <Typography variant="h6">{achievements?.length || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('nav.achievements')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AttachMoneyIcon color="primary" />
                    <Typography variant="h6">{fees?.length || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('nav.fees')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Tabs for detailed views */}
        <Grid item xs={12}>
          <Paper>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab icon={<GradeIcon />} label={t('nav.grades')} />
              <Tab icon={<PsychologyIcon />} label={t('nav.behaviors')} />
              <Tab icon={<EmojiEventsIcon />} label={t('nav.achievements')} />
              <Tab icon={<AttachMoneyIcon />} label={t('nav.fees')} />
              <Tab icon={<PaymentIcon />} label={t('nav.payments')} />
            </Tabs>

            {/* Grades Tab */}
            {tabValue === 0 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>{t('nav.grades')}</Typography>
                {grades && grades.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('grades.exam')}</TableCell>
                          <TableCell>{t('exams.subject')}</TableCell>
                          <TableCell>{t('grades.marksObtained')}</TableCell>
                          <TableCell>{t('grades.grade')}</TableCell>
                          <TableCell>{t('grades.remarks')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {grades.map((grade) => (
                          <TableRow key={grade.id}>
                            <TableCell>{grade.exam?.name || t('common.none')}</TableCell>
                            <TableCell>{grade.subject?.name || t('common.none')}</TableCell>
                            <TableCell>{grade.marks_obtained}</TableCell>
                            <TableCell>
                              <Chip
                                label={grade.grade || t('common.none')}
                                color={getGradeColor(grade.grade)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{grade.remarks || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">{t('students.noGradesRecorded')}</Typography>
                )}
              </Box>
            )}

            {/* Behaviors Tab */}
            {tabValue === 1 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>{t('behaviors.title')}</Typography>
                {behaviors && behaviors.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('common.date')}</TableCell>
                          <TableCell>{t('behaviors.behaviorType')}</TableCell>
                          <TableCell>{t('common.description')}</TableCell>
                          <TableCell>{t('behaviors.recordedBy')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {behaviors.map((behavior) => (
                          <TableRow key={behavior.id}>
                            <TableCell>{formatDate(behavior.date)}</TableCell>
                            <TableCell>
                              <Chip
                                label={behavior.type}
                                color={behavior.type === 'positive' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{behavior.description}</TableCell>
                            <TableCell>{behavior.recordedBy?.username || t('common.none')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">{t('behaviors.noRecords')}</Typography>
                )}
              </Box>
            )}

            {/* Achievements Tab */}
            {tabValue === 2 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>{t('nav.achievements')}</Typography>
                {achievements && achievements.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('achievements.achievementName')}</TableCell>
                          <TableCell>{t('achievements.category')}</TableCell>
                          <TableCell>{t('common.date')}</TableCell>
                          <TableCell>{t('common.description')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {achievements.map((achievement) => (
                          <TableRow key={achievement.id}>
                            <TableCell>{achievement.title}</TableCell>
                            <TableCell>
                              <Chip
                                label={achievement.category}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{formatDate(achievement.date)}</TableCell>
                            <TableCell>
                              {achievement.description || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">{t('achievements.noRecords')}</Typography>
                )}
              </Box>
            )}

            {/* Fees Tab */}
            {tabValue === 3 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>{t('nav.fees')}</Typography>
                {fees && fees.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('fees.feeType')}</TableCell>
                          <TableCell>{t('fees.amount')}</TableCell>
                          <TableCell>{t('fees.paid')}</TableCell>
                          <TableCell>{t('fees.remaining')}</TableCell>
                          <TableCell>{t('fees.dueDate')}</TableCell>
                          <TableCell>{t('common.status')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fees.map((fee) => {
                          const paid = calculatePaidAmount(fee);
                          const remaining = parseFloat(fee.amount) - paid;
                          return (
                            <TableRow key={fee.id}>
                              <TableCell>
                                <Chip label={fee.fee_type} size="small" />
                              </TableCell>
                              <TableCell>{formatCurrency(fee.amount)}</TableCell>
                              <TableCell>{formatCurrency(paid)}</TableCell>
                              <TableCell>{formatCurrency(remaining)}</TableCell>
                              <TableCell>{formatDate(fee.due_date)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={fee.status}
                                  color={getStatusColor(fee.status)}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">{t('fees.noRecords')}</Typography>
                )}
              </Box>
            )}

            {/* Payments Tab */}
            {tabValue === 4 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>{t('nav.payments')}</Typography>
                {payments && payments.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('payments.receiptNumber')}</TableCell>
                          <TableCell>{t('fees.feeType')}</TableCell>
                          <TableCell>{t('payments.amount')}</TableCell>
                          <TableCell>{t('payments.paymentMethod')}</TableCell>
                          <TableCell>{t('payments.paymentDate')}</TableCell>
                          <TableCell>{t('payments.transactionId')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.receipt_number || t('common.none')}</TableCell>
                            <TableCell>
                              {payment.fee?.fee_type || t('common.none')}
                            </TableCell>
                            <TableCell>{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>
                              <Chip label={payment.payment_method} size="small" />
                            </TableCell>
                            <TableCell>{formatDate(payment.payment_date)}</TableCell>
                            <TableCell>{payment.transaction_id || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">{t('payments.noRecords')}</Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onClose={handlePhotoClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('students.uploadPhoto')}</DialogTitle>
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
              id="photo-upload-input"
            />
            <label htmlFor="photo-upload-input">
              <Button
                variant="contained"
                component="span"
                fullWidth
                disabled={photoUploadMutation.isLoading}
                startIcon={<PhotoCameraIcon />}
              >
                {photoUploadMutation.isLoading ? t('common.uploading') : t('students.selectPhoto')}
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('students.supportedFormats')}
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

export default StudentDetail;

