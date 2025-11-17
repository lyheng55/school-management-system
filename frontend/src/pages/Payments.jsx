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
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Layout from '../components/Layout';
import api from '../services/api';

const Payments = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterMethod, setFilterMethod] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [formData, setFormData] = useState({
    fee_id: '',
    amount: '',
    payment_method: '',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    receipt_number: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['payments', page, filterMethod, filterClass],
    async () => {
      const params = { page, limit: 10 };
      if (filterMethod) params.payment_method = filterMethod;
      if (filterClass) params.class_id = filterClass;
      const response = await api.get('/payments', { params });
      return response.data.data;
    }
  );

  const { data: classes } = useQuery('classes', async () => {
    const response = await api.get('/classes');
    return response.data.data;
  });

  const { data: fees } = useQuery('fees', async () => {
    const params = { limit: 1000 };
    const response = await api.get('/fees', { params });
    return response.data.data?.fees || [];
  });

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/payments', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments');
        queryClient.invalidateQueries('fees');
        queryClient.invalidateQueries('feeSummary');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('payments.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/payments/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments');
        queryClient.invalidateQueries('fees');
        queryClient.invalidateQueries('feeSummary');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('payments.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/payments/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payments');
        queryClient.invalidateQueries('fees');
        queryClient.invalidateQueries('feeSummary');
      },
    }
  );

  const handleOpen = (payment = null) => {
    setSelectedPayment(payment);
    setError('');
    if (payment) {
      setFormData({
        fee_id: payment.fee_id || '',
        amount: payment.amount || '',
        payment_method: payment.payment_method || '',
        transaction_id: payment.transaction_id || '',
        payment_date: payment.payment_date ? payment.payment_date.split('T')[0] : new Date().toISOString().split('T')[0],
        receipt_number: payment.receipt_number || '',
        notes: payment.notes || '',
      });
    } else {
      setFormData({
        fee_id: '',
        amount: '',
        payment_method: '',
        transaction_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        receipt_number: '',
        notes: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPayment(null);
    setError('');
    setFormData({
      fee_id: '',
      amount: '',
      payment_method: '',
      transaction_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      receipt_number: '',
      notes: '',
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
      fee_id: parseInt(formData.fee_id),
      amount: parseFloat(formData.amount),
      payment_date: formData.payment_date || new Date().toISOString().split('T')[0],
      transaction_id: formData.transaction_id || null,
      receipt_number: formData.receipt_number || null,
      notes: formData.notes || null,
    };

    if (selectedPayment) {
      updateMutation.mutate({ id: selectedPayment.id, data: submitData });
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getMethodColor = (method) => {
    const colors = {
      cash: 'success',
      bank_transfer: 'info',
      online: 'primary',
      cheque: 'warning',
      other: 'default',
    };
    return colors[method] || 'default';
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('payments.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('payments.addPayment')}
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('common.filter')}</InputLabel>
          <Select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            label={t('common.filter')}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            <MenuItem value="cash">{t('payments.cash')}</MenuItem>
            <MenuItem value="bank_transfer">{t('payments.bankTransfer')}</MenuItem>
            <MenuItem value="online">{t('payments.online')}</MenuItem>
            <MenuItem value="cheque">{t('payments.cheque')}</MenuItem>
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
              <TableCell>{t('payments.receiptNumber')}</TableCell>
              <TableCell>{t('grades.student')}</TableCell>
              <TableCell>{t('students.class')}</TableCell>
              <TableCell>{t('fees.feeType')}</TableCell>
              <TableCell>{t('payments.amount')}</TableCell>
              <TableCell>{t('payments.paymentMethod')}</TableCell>
              <TableCell>{t('payments.transactionId')}</TableCell>
              <TableCell>{t('payments.paymentDate')}</TableCell>
              <TableCell>{t('payments.processedBy')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : data?.payments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data?.payments?.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.receipt_number || t('common.none')}
                  </TableCell>
                  <TableCell>
                    {payment.fee?.student?.first_name} {payment.fee?.student?.last_name}
                  </TableCell>
                  <TableCell>{payment.fee?.student?.class?.name || t('common.none')}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.fee?.fee_type || t('common.none')}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.payment_method}
                      color={getMethodColor(payment.payment_method)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{payment.transaction_id || '-'}</TableCell>
                  <TableCell>{formatDate(payment.payment_date)}</TableCell>
                  <TableCell>{payment.processedBy?.username || t('common.none')}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/payments/${payment.id}`)}
                      title={t('common.view')}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(payment)}
                      title={t('common.edit')}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(payment.id)}
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
          {selectedPayment ? t('payments.editPayment') : t('payments.addPayment')}
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
                  <InputLabel>{t('payments.fee')}</InputLabel>
                  <Select
                    name="fee_id"
                    value={formData.fee_id}
                    onChange={handleChange}
                    label={t('payments.fee')}
                    disabled={!!selectedPayment}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {fees?.map((fee) => (
                      <MenuItem key={fee.id} value={fee.id}>
                        {fee.student?.first_name} {fee.student?.last_name} - {fee.fee_type} ({formatCurrency(fee.amount)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('payments.amount')}
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('payments.paymentMethod')}</InputLabel>
                  <Select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    label={t('payments.paymentMethod')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    <MenuItem value="cash">{t('payments.cash')}</MenuItem>
                    <MenuItem value="bank_transfer">{t('payments.bankTransfer')}</MenuItem>
                    <MenuItem value="online">{t('payments.online')}</MenuItem>
                    <MenuItem value="cheque">{t('payments.cheque')}</MenuItem>
                    <MenuItem value="other">{t('common.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('payments.paymentDate')}
                  name="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('payments.transactionId')}
                  name="transaction_id"
                  value={formData.transaction_id}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('payments.receiptNumber')}
                  name="receipt_number"
                  value={formData.receipt_number}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('payments.remarks')}
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
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

export default Payments;

