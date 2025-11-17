import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningIcon from '@mui/icons-material/Warning';
import Layout from '../components/Layout';
import api from '../services/api';

const FeeDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: fee, isLoading: feeLoading } = useQuery(
    ['fee', id],
    async () => {
      const response = await api.get(`/fees/${id}`);
      return response.data.data;
    },
    { enabled: !!id }
  );

  const formatDate = (dateString) => {
    if (!dateString) return t('common.none');
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon />;
      case 'pending':
        return <ScheduleIcon />;
      case 'overdue':
        return <WarningIcon />;
      default:
        return null;
    }
  };

  if (feeLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!fee) {
    return (
      <Layout>
        <Box p={3}>
          <Typography variant="h5" color="error">{t('fees.notFound')}</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/fees')} sx={{ mt: 2 }}>
            {t('common.back')} {t('nav.fees')}
          </Button>
        </Box>
      </Layout>
    );
  }

  const totalPaid = fee.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
  const remaining = parseFloat(fee.amount || 0) - totalPaid;
  const paymentCount = fee.payments?.length || 0;

  return (
    <Layout>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/fees')}
          sx={{ mb: 2 }}
        >
          {t('common.back')} {t('nav.fees')}
        </Button>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
            <AttachMoneyIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4">
              {t('fees.feeDetails')}: {fee.fee_type || t('common.none')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {fee.student ? `${fee.student.first_name} ${fee.student.last_name}` : t('common.none')} - {fee.student?.class?.name || t('common.none')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('fees.amount')}: {formatCurrency(fee.amount)} | {t('common.status')}: {fee.status}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Student Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('students.studentInformation')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('grades.student')}
                  </Typography>
                  <Typography variant="body1">
                    {fee.student ? `${fee.student.first_name} ${fee.student.last_name}` : t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('students.studentId')}
                  </Typography>
                  <Typography variant="body1">
                    {fee.student?.student_id || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.class')}
                  </Typography>
                  <Typography variant="body1">
                    {fee.student?.class?.name || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/students/${fee.student?.id}`)}
                    startIcon={<PersonIcon />}
                  >
                    {t('common.view')} {t('students.studentDetails')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Fee Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('fees.feeDetails')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.feeType')}
                  </Typography>
                  <Typography variant="body1">
                    {fee.fee_type || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.amount')}
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(fee.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.dueDate')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(fee.due_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.academicYear')}
                  </Typography>
                  <Typography variant="body1">
                    {fee.academic_year || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.term')}
                  </Typography>
                  <Typography variant="body1">
                    {fee.term || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.status')}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(fee.status)}
                    label={fee.status?.toUpperCase() || t('common.none')}
                    color={getStatusColor(fee.status)}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                {fee.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('common.description')}
                    </Typography>
                    <Typography variant="body1">
                      {fee.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('fees.paymentSummary')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.totalAmount')}
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(fee.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.totalPaid')}
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {formatCurrency(totalPaid)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.remaining')}
                  </Typography>
                  <Typography variant="h5" color={remaining > 0 ? 'warning.main' : 'success.main'}>
                    {formatCurrency(remaining)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.paymentCount')}
                  </Typography>
                  <Typography variant="h5">
                    {paymentCount}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Payments Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('fees.paymentHistory')} ({paymentCount})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {fee.payments && fee.payments.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('payments.paymentDate')}</TableCell>
                        <TableCell>{t('payments.amount')}</TableCell>
                        <TableCell>{t('payments.paymentMethod')}</TableCell>
                        <TableCell>{t('payments.transactionId')}</TableCell>
                        <TableCell>{t('payments.receiptNumber')}</TableCell>
                        <TableCell>{t('payments.notes')}</TableCell>
                        <TableCell>{t('common.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fee.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.payment_date)}</TableCell>
                          <TableCell>{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{payment.payment_method || t('common.none')}</TableCell>
                          <TableCell>{payment.transaction_id || '-'}</TableCell>
                          <TableCell>{payment.receipt_number || '-'}</TableCell>
                          <TableCell>{payment.notes || '-'}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => navigate(`/payments/${payment.id}`)}
                            >
                              {t('common.view')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">{t('fees.noPaymentsRecorded')}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default FeeDetail;

