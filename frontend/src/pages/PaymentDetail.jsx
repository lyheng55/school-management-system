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
  Chip,
  Button,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import Layout from '../components/Layout';
import api from '../services/api';

const PaymentDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: payment, isLoading: paymentLoading } = useQuery(
    ['payment', id],
    async () => {
      const response = await api.get(`/payments/${id}`);
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

  if (paymentLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!payment) {
    return (
      <Layout>
        <Box p={3}>
          <Typography variant="h5" color="error">{t('payments.notFound')}</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/payments')} sx={{ mt: 2 }}>
            {t('common.back')} {t('nav.payments')}
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
          onClick={() => navigate('/payments')}
          sx={{ mb: 2 }}
        >
          {t('common.back')} {t('nav.payments')}
        </Button>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'success.main' }}>
            <PaymentIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4">
              {t('payments.paymentRecord')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {formatCurrency(payment.amount)} - {payment.fee?.student ? `${payment.fee.student.first_name} ${payment.fee.student.last_name}` : t('common.none')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('payments.paymentDate')}: {formatDate(payment.payment_date)} | {t('payments.paymentMethod')}: {payment.payment_method || t('common.none')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Student Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6">{t('students.studentInformation')}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('grades.student')}
                  </Typography>
                  <Typography variant="body1">
                    {payment.fee?.student ? `${payment.fee.student.first_name} ${payment.fee.student.last_name}` : t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('students.studentId')}
                  </Typography>
                  <Typography variant="body1">
                    {payment.fee?.student?.student_id || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('exams.class')}
                  </Typography>
                  <Typography variant="body1">
                    {payment.fee?.student?.class?.name || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PictureAsPdfIcon />}
                    fullWidth
                    onClick={() => {
                      window.open(`${api.defaults.baseURL}/payments/${id}/receipt`, '_blank');
                    }}
                    sx={{ mb: 1 }}
                  >
                    {t('payments.downloadReceipt') || 'Download Receipt'}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/students/${payment.fee?.student?.id}`)}
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
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AttachMoneyIcon color="primary" />
                <Typography variant="h6">{t('fees.feeDetails')}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.feeType')}
                  </Typography>
                  <Typography variant="body1">
                    {payment.fee?.fee_type || t('common.none')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('payments.feeAmount')}
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(payment.fee?.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.dueDate')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(payment.fee?.due_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/fees/${payment.fee?.id}`)}
                    startIcon={<AttachMoneyIcon />}
                  >
                    {t('common.view')} {t('payments.feeDetails')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ReceiptIcon color="primary" />
                <Typography variant="h6">{t('payments.paymentDetails')}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('payments.amount')}
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {formatCurrency(payment.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('payments.paymentDate')}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(payment.payment_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('payments.paymentMethod')}
                  </Typography>
                  <Typography variant="body1">
                    {payment.payment_method || t('common.none')}
                  </Typography>
                </Grid>
                {payment.transaction_id && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('payments.transactionId')}
                    </Typography>
                    <Typography variant="body1">
                      {payment.transaction_id}
                    </Typography>
                  </Grid>
                )}
                {payment.receipt_number && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('payments.receiptNumber')}
                    </Typography>
                    <Typography variant="body1">
                      {payment.receipt_number}
                    </Typography>
                  </Grid>
                )}
                {payment.processedBy && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('payments.processedBy')}
                    </Typography>
                    <Typography variant="body1">
                      {payment.processedBy.username || payment.processedBy.email || t('common.none')}
                    </Typography>
                  </Grid>
                )}
                {payment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {t('payments.notes')}
                    </Typography>
                    <Typography variant="body1">
                      {payment.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default PaymentDetail;

