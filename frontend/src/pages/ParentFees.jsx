import { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import Layout from '../components/Layout';
import api from '../services/api';

const ParentFees = () => {
  const { t } = useTranslation();
  const { childId } = useParams();
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(childId);
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const { data: children } = useQuery('parentChildren', async () => {
    const response = await api.get('/parents/children');
    return response.data.data || [];
  });

  const { data: fees, isLoading } = useQuery(
    ['childFees', selectedChild],
    async () => {
      if (!selectedChild) return [];
      const response = await api.get(`/parents/children/${selectedChild}/fees`);
      return response.data.data || [];
    },
    { enabled: !!selectedChild }
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStudentName = (student) => {
    return `${student.first_name} ${student.last_name}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'partial': return 'info';
      default: return 'default';
    }
  };

  const calculateRemaining = (fee) => {
    const total = parseFloat(fee.amount) || 0;
    const paid = fee.payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
    return total - paid;
  };

  const handleOpenPayment = (fee) => {
    setSelectedFee(fee);
    setPaymentAmount(calculateRemaining(fee).toString());
    setOpenPayment(true);
  };

  const handleClosePayment = () => {
    setOpenPayment(false);
    setSelectedFee(null);
    setPaymentAmount('');
  };

  const handleMakePayment = () => {
    // This would integrate with payment system
    // For now, just show a message
    alert(t('parentFees.paymentFeatureComingSoon'));
    handleClosePayment();
  };

  const totalPending = fees?.filter(f => f.status !== 'paid').length || 0;
  const totalAmount = fees?.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0) || 0;
  const totalPaid = fees?.reduce((sum, f) => {
    const paid = f.payments?.reduce((pSum, p) => pSum + parseFloat(p.amount || 0), 0) || 0;
    return sum + paid;
  }, 0) || 0;

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {t('parentFees.title')}
        </Typography>

        {children && children.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>{t('parentFees.selectChild')}</InputLabel>
              <Select
                value={selectedChild || ''}
                onChange={(e) => {
                  setSelectedChild(e.target.value);
                  navigate(`/parent/fees/${e.target.value}`);
                }}
              >
                {children.map((child) => (
                  <MenuItem key={child.id} value={child.id}>
                    {getStudentName(child)} {child.class && `- ${child.class.name}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        )}

        {selectedChild && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    {t('parentFees.totalFees')}
                  </Typography>
                  <Typography variant="h4">${totalAmount.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    {t('parentFees.totalPaid')}
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    ${totalPaid.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    {t('parentFees.pendingFees')}
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {totalPending}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !selectedChild ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('parentFees.selectChildFirst')}</Typography>
          </Paper>
        ) : !fees || fees.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('parentFees.noFees')}</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('fees.feeType')}</TableCell>
                  <TableCell>{t('fees.amount')}</TableCell>
                  <TableCell>{t('fees.dueDate')}</TableCell>
                  <TableCell>{t('fees.feeStatus')}</TableCell>
                  <TableCell>{t('fees.remainingAmount')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fees.map((fee) => {
                  const remaining = calculateRemaining(fee);
                  return (
                    <TableRow key={fee.id}>
                      <TableCell>{t(`fees.${fee.fee_type}`)}</TableCell>
                      <TableCell>${parseFloat(fee.amount).toFixed(2)}</TableCell>
                      <TableCell>{formatDate(fee.due_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(`fees.${fee.status}`)}
                          color={getStatusColor(fee.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={remaining > 0 ? 'error.main' : 'success.main'}
                        >
                          ${remaining.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {remaining > 0 && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PaymentIcon />}
                            onClick={() => handleOpenPayment(fee)}
                          >
                            {t('parentFees.pay')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Payment Dialog */}
        <Dialog open={openPayment} onClose={handleClosePayment} maxWidth="sm" fullWidth>
          <DialogTitle>{t('parentFees.makePayment')}</DialogTitle>
          <DialogContent>
            {selectedFee && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('fees.feeType')}: <strong>{t(`fees.${selectedFee.fee_type}`)}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('fees.totalAmount')}: <strong>${parseFloat(selectedFee.amount).toFixed(2)}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('fees.remainingAmount')}: <strong>${calculateRemaining(selectedFee).toFixed(2)}</strong>
                </Typography>
                <TextField
                  label={t('payments.amount')}
                  type="number"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  inputProps={{ min: 0, max: calculateRemaining(selectedFee) }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePayment}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleMakePayment}>
              {t('parentFees.pay')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ParentFees;

