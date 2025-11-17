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
  Card,
  CardContent,
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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Layout from '../components/Layout';
import api from '../services/api';

const Fees = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [formData, setFormData] = useState({
    student_id: '',
    fee_type: '',
    amount: '',
    due_date: '',
    academic_year: new Date().getFullYear().toString(),
    term: '',
    description: '',
  });
  const [bulkFormData, setBulkFormData] = useState({
    class_id: '',
    fee_type: '',
    amount: '',
    due_date: '',
    academic_year: new Date().getFullYear().toString(),
    term: '',
    description: '',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['fees', page, filterStatus, filterType, filterClass],
    async () => {
      const params = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.fee_type = filterType;
      if (filterClass) params.class_id = filterClass;
      const response = await api.get('/fees', { params });
      return response.data.data;
    }
  );

  const { data: summary } = useQuery(
    ['feeSummary', filterClass],
    async () => {
      const params = {};
      if (filterClass) params.class_id = filterClass;
      const response = await api.get('/fees/summary', { params });
      return response.data.data;
    }
  );

  const { data: classes } = useQuery('classes', async () => {
    const response = await api.get('/classes');
    return response.data.data;
  });

  const { data: students } = useQuery(
    ['students', bulkFormData.class_id],
    async () => {
      if (!bulkFormData.class_id) return [];
      const params = { class_id: bulkFormData.class_id, limit: 1000 };
      const response = await api.get('/students', { params });
      return response.data.data?.students || [];
    },
    { enabled: !!bulkFormData.class_id }
  );

  const { data: allStudents } = useQuery('allStudents', async () => {
    const params = { limit: 1000 };
    const response = await api.get('/students', { params });
    return response.data.data?.students || [];
  });

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/fees', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('fees');
        queryClient.invalidateQueries('feeSummary');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('fees.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/fees/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('fees');
        queryClient.invalidateQueries('feeSummary');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('fees.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/fees/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('fees');
        queryClient.invalidateQueries('feeSummary');
      },
    }
  );

  const bulkCreateMutation = useMutation(
    async (data) => {
      const response = await api.post('/fees/bulk', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('fees');
        queryClient.invalidateQueries('feeSummary');
        handleBulkClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Failed to create bulk fees');
      },
    }
  );

  const handleOpen = (fee = null) => {
    setSelectedFee(fee);
    setError('');
    if (fee) {
      setFormData({
        student_id: fee.student_id || '',
        fee_type: fee.fee_type || '',
        amount: fee.amount || '',
        due_date: fee.due_date ? fee.due_date.split('T')[0] : '',
        academic_year: fee.academic_year || new Date().getFullYear().toString(),
        term: fee.term || '',
        description: fee.description || '',
      });
    } else {
      setFormData({
        student_id: '',
        fee_type: '',
        amount: '',
        due_date: '',
        academic_year: new Date().getFullYear().toString(),
        term: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFee(null);
    setError('');
    setFormData({
      student_id: '',
      fee_type: '',
      amount: '',
      due_date: '',
      academic_year: new Date().getFullYear().toString(),
      term: '',
      description: '',
    });
  };

  const handleBulkOpen = () => {
    setOpenBulk(true);
    setError('');
    setBulkFormData({
      class_id: '',
      fee_type: '',
      amount: '',
      due_date: '',
      academic_year: new Date().getFullYear().toString(),
      term: '',
      description: '',
    });
  };

  const handleBulkClose = () => {
    setOpenBulk(false);
    setError('');
    setBulkFormData({
      class_id: '',
      fee_type: '',
      amount: '',
      due_date: '',
      academic_year: new Date().getFullYear().toString(),
      term: '',
      description: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBulkFormChange = (e) => {
    const { name, value } = e.target;
    setBulkFormData((prev) => ({
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
      amount: parseFloat(formData.amount),
      description: formData.description || null,
      term: formData.term || null,
    };

    if (selectedFee) {
      updateMutation.mutate({ id: selectedFee.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!bulkFormData.class_id || !bulkFormData.fee_type || !bulkFormData.amount || !bulkFormData.due_date) {
      setError(t('common.fillAllRequiredFields'));
      return;
    }

    const feesToSubmit = students?.map((student) => ({
      student_id: student.id,
      fee_type: bulkFormData.fee_type,
      amount: parseFloat(bulkFormData.amount),
      due_date: bulkFormData.due_date,
      academic_year: bulkFormData.academic_year,
      term: bulkFormData.term || null,
      description: bulkFormData.description || null,
    })) || [];

    if (feesToSubmit.length === 0) {
      setError(t('fees.noStudentsInClass'));
      return;
    }

    bulkCreateMutation.mutate({
      fees: feesToSubmit,
      class_id: parseInt(bulkFormData.class_id),
      academic_year: bulkFormData.academic_year,
      term: bulkFormData.term || null,
    });
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

  const getStatusColor = (status) => {
    const colors = {
      paid: 'success',
      pending: 'warning',
      partial: 'info',
      overdue: 'error',
    };
    return colors[status] || 'default';
  };

  const getTypeColor = (type) => {
    const colors = {
      tuition: 'primary',
      library: 'secondary',
      sports: 'success',
      lab: 'info',
      transport: 'warning',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const calculatePaidAmount = (payments) => {
    if (!payments || payments.length === 0) return 0;
    return payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('fees.title')}</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={handleBulkOpen}
          >
            {t('fees.bulkCreate')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('fees.addFee')}
          </Button>
        </Box>
      </Box>

      {summary && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {t('fees.totalAmount')}
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(summary.total_amount || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {t('dashboard.totalPaid')}
                </Typography>
                <Typography variant="h5" color="success.main">
                  {formatCurrency(summary.total_paid || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {t('dashboard.totalPending')}
                </Typography>
                <Typography variant="h5" color="warning.main">
                  {formatCurrency(summary.total_pending || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {t('dashboard.totalOverdue')}
                </Typography>
                <Typography variant="h5" color="error.main">
                  {formatCurrency(summary.total_overdue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box display="flex" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{t('common.filter')}</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label={t('common.filter')}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            <MenuItem value="pending">{t('fees.pending')}</MenuItem>
            <MenuItem value="paid">{t('fees.paid')}</MenuItem>
            <MenuItem value="partial">{t('fees.partial')}</MenuItem>
            <MenuItem value="overdue">{t('fees.overdue')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{t('common.filter')}</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label={t('common.filter')}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            <MenuItem value="tuition">{t('fees.tuition')}</MenuItem>
            <MenuItem value="library">{t('fees.library')}</MenuItem>
            <MenuItem value="sports">{t('fees.sports')}</MenuItem>
            <MenuItem value="lab">{t('fees.lab')}</MenuItem>
            <MenuItem value="transport">{t('fees.transport')}</MenuItem>
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
              <TableCell>{t('fees.feeType')}</TableCell>
              <TableCell>{t('fees.amount')}</TableCell>
              <TableCell>{t('fees.paid')}</TableCell>
              <TableCell>{t('fees.remaining')}</TableCell>
              <TableCell>{t('fees.dueDate')}</TableCell>
              <TableCell>{t('common.status')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : data?.fees?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data?.fees?.map((fee) => {
                const paid = calculatePaidAmount(fee.payments);
                const remaining = parseFloat(fee.amount) - paid;
                return (
                  <TableRow key={fee.id}>
                    <TableCell>
                      {fee.student?.first_name} {fee.student?.last_name}
                    </TableCell>
                    <TableCell>{fee.student?.class?.name || t('common.none')}</TableCell>
                    <TableCell>
                      <Chip
                        label={fee.fee_type}
                        color={getTypeColor(fee.fee_type)}
                        size="small"
                      />
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
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/fees/${fee.id}`)}
                        title={t('common.view')}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(fee)}
                        title={t('common.edit')}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(fee.id)}
                        disabled={deleteMutation.isLoading}
                        title={t('common.delete')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
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
          {selectedFee ? t('fees.editFee') : t('fees.addFee')}
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
                    disabled={!!selectedFee}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {allStudents?.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} {student.class && `(${student.class.name})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('fees.feeType')}</InputLabel>
                  <Select
                    name="fee_type"
                    value={formData.fee_type}
                    onChange={handleChange}
                    label={t('fees.feeType')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    <MenuItem value="tuition">{t('fees.tuition')}</MenuItem>
                    <MenuItem value="library">{t('fees.library')}</MenuItem>
                    <MenuItem value="sports">{t('fees.sports')}</MenuItem>
                    <MenuItem value="lab">{t('fees.lab')}</MenuItem>
                    <MenuItem value="transport">{t('fees.transport')}</MenuItem>
                    <MenuItem value="other">{t('common.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('fees.amount')}
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('fees.dueDate')}
                  name="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('fees.academicYear')}
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('fees.term')}</InputLabel>
                  <Select
                    name="term"
                    value={formData.term}
                    onChange={handleChange}
                    label={t('fees.term')}
                  >
                    <MenuItem value="">{t('common.none')}</MenuItem>
                    <MenuItem value="first">{t('fees.firstTerm')}</MenuItem>
                    <MenuItem value="second">{t('fees.secondTerm')}</MenuItem>
                    <MenuItem value="third">{t('fees.thirdTerm')}</MenuItem>
                    <MenuItem value="annual">{t('fees.annual')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('common.description')}
                  name="description"
                  multiline
                  rows={2}
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

      <Dialog open={openBulk} onClose={handleBulkClose} maxWidth="md" fullWidth>
        <DialogTitle>{t('fees.bulkCreate')}</DialogTitle>
        <form onSubmit={handleBulkSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('students.class')}</InputLabel>
                  <Select
                    name="class_id"
                    value={bulkFormData.class_id}
                    onChange={handleBulkFormChange}
                    label={t('students.class')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {classes?.map((classItem) => (
                      <MenuItem key={classItem.id} value={classItem.id}>
                        {classItem.name} {classItem.section && `- ${classItem.section}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('fees.feeType')}</InputLabel>
                  <Select
                    name="fee_type"
                    value={bulkFormData.fee_type}
                    onChange={handleBulkFormChange}
                    label={t('fees.feeType')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    <MenuItem value="tuition">{t('fees.tuition')}</MenuItem>
                    <MenuItem value="library">{t('fees.library')}</MenuItem>
                    <MenuItem value="sports">{t('fees.sports')}</MenuItem>
                    <MenuItem value="lab">{t('fees.lab')}</MenuItem>
                    <MenuItem value="transport">{t('fees.transport')}</MenuItem>
                    <MenuItem value="other">{t('common.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('fees.amount')}
                  name="amount"
                  type="number"
                  value={bulkFormData.amount}
                  onChange={handleBulkFormChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('fees.dueDate')}
                  name="due_date"
                  type="date"
                  value={bulkFormData.due_date}
                  onChange={handleBulkFormChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('fees.academicYear')}
                  name="academic_year"
                  value={bulkFormData.academic_year}
                  onChange={handleBulkFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('fees.term')}</InputLabel>
                  <Select
                    name="term"
                    value={bulkFormData.term}
                    onChange={handleBulkFormChange}
                    label={t('fees.term')}
                  >
                    <MenuItem value="">{t('common.none')}</MenuItem>
                    <MenuItem value="first">{t('fees.firstTerm')}</MenuItem>
                    <MenuItem value="second">{t('fees.secondTerm')}</MenuItem>
                    <MenuItem value="third">{t('fees.thirdTerm')}</MenuItem>
                    <MenuItem value="annual">{t('fees.annual')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('common.description')}
                  name="description"
                  multiline
                  rows={2}
                  value={bulkFormData.description}
                  onChange={handleBulkFormChange}
                />
              </Grid>
              {students && students.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.createFeesFor')} {students.length} {t('common.students')} {t('fees.inSelectedClass')}.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleBulkClose} disabled={bulkCreateMutation.isLoading}>
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={bulkCreateMutation.isLoading || !bulkFormData.class_id}
            >
              {bulkCreateMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                t('fees.createFeesForAllStudents')
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Layout>
  );
};

export default Fees;

