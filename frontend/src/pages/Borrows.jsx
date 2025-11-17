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
  Autocomplete,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import WarningIcon from '@mui/icons-material/Warning';
import Layout from '../components/Layout';
import api from '../services/api';

const Borrows = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0); // 0 = all, 1 = overdue
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [filterStudent, setFilterStudent] = useState('');
  const [filterBook, setFilterBook] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    book_id: '',
    student_id: '',
    borrow_date: new Date().toISOString().split('T')[0],
    due_date: '',
  });
  const [returnData, setReturnData] = useState({
    return_date: new Date().toISOString().split('T')[0],
    status: 'returned',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['borrows', page, filterStudent, filterBook, filterStatus],
    async () => {
      const params = { page, limit: 20 };
      if (filterStudent) params.student_id = filterStudent;
      if (filterBook) params.book_id = filterBook;
      if (filterStatus) params.status = filterStatus;
      const response = await api.get('/borrows', { params });
      return response.data.data;
    },
    { enabled: tab === 0 }
  );

  const { data: overdueData, isLoading: overdueLoading } = useQuery(
    ['borrows', 'overdue'],
    async () => {
      const response = await api.get('/borrows/overdue');
      return response.data.data || [];
    },
    { enabled: tab === 1 }
  );

  const { data: books } = useQuery('allBooks', async () => {
    const params = { limit: 1000, available_only: 'true' };
    const response = await api.get('/books', { params });
    return response.data.data?.books || [];
  });

  const { data: students } = useQuery('allStudents', async () => {
    const params = { limit: 1000 };
    const response = await api.get('/students', { params });
    return response.data.data?.students || [];
  });

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/borrows', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('borrows');
        queryClient.invalidateQueries('books');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('borrows.failedToBorrow'));
      },
    }
  );

  const returnMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/borrows/${id}/return`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('borrows');
        queryClient.invalidateQueries('books');
        handleCloseReturn();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('borrows.failedToReturn'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/borrows/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('borrows');
        queryClient.invalidateQueries('books');
      },
    }
  );

  const handleOpen = (borrow = null) => {
    setSelectedBorrow(borrow);
    setError('');
    if (borrow) {
      setFormData({
        book_id: borrow.book_id || '',
        student_id: borrow.student_id || '',
        borrow_date: borrow.borrow_date || new Date().toISOString().split('T')[0],
        due_date: borrow.due_date || '',
      });
    } else {
      // Calculate default due date (14 days from today)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      setFormData({
        book_id: '',
        student_id: '',
        borrow_date: new Date().toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBorrow(null);
    setError('');
  };

  const handleOpenReturn = (borrow) => {
    setSelectedBorrow(borrow);
    setError('');
    setReturnData({
      return_date: new Date().toISOString().split('T')[0],
      status: 'returned',
    });
    setOpenReturn(true);
  };

  const handleCloseReturn = () => {
    setOpenReturn(false);
    setSelectedBorrow(null);
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.book_id || !formData.student_id || !formData.due_date) {
      setError(t('borrows.fillRequiredFields'));
      return;
    }
    createMutation.mutate(formData);
  };

  const handleReturn = () => {
    if (!selectedBorrow) return;
    returnMutation.mutate({ id: selectedBorrow.id, data: returnData });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'returned') return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStudentName = (student) => {
    if (!student) return '';
    return `${student.first_name} ${student.last_name}`;
  };

  const currentData = tab === 0 ? data : { borrows: overdueData || [] };
  const currentLoading = tab === 0 ? isLoading : overdueLoading;

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{t('borrows.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('borrows.borrowBook')}
          </Button>
        </Box>

        <Paper sx={{ mb: 2 }}>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            <Tab label={t('borrows.allBorrows')} />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {t('borrows.overdue')}
                  {overdueData && overdueData.length > 0 && (
                    <Chip label={overdueData.length} size="small" color="error" />
                  )}
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('borrows.filterByStatus')}</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setPage(1);
                    }}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    <MenuItem value="borrowed">{t('borrows.borrowed')}</MenuItem>
                    <MenuItem value="returned">{t('borrows.returned')}</MenuItem>
                    <MenuItem value="overdue">{t('borrows.overdue')}</MenuItem>
                    <MenuItem value="lost">{t('borrows.lost')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}

        {currentLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !currentData?.borrows || currentData.borrows.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {tab === 0 ? t('borrows.noBorrows') : t('borrows.noOverdue')}
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('books.title')}</TableCell>
                  <TableCell>{t('common.students')}</TableCell>
                  <TableCell>{t('borrows.borrowDate')}</TableCell>
                  <TableCell>{t('borrows.dueDate')}</TableCell>
                  <TableCell>{t('borrows.returnDate')}</TableCell>
                  <TableCell>{t('borrows.lateFee')}</TableCell>
                  <TableCell>{t('borrows.status')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.borrows.map((borrow) => (
                  <TableRow
                    key={borrow.id}
                    sx={{
                      backgroundColor: isOverdue(borrow.due_date, borrow.status) ? 'error.light' : 'transparent',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {borrow.book?.title || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {borrow.book?.author || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStudentName(borrow.student)}
                      {borrow.student?.user && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {borrow.student.student_id}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(borrow.borrow_date)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {formatDate(borrow.due_date)}
                        {isOverdue(borrow.due_date, borrow.status) && (
                          <WarningIcon color="error" fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{borrow.return_date ? formatDate(borrow.return_date) : '-'}</TableCell>
                    <TableCell>
                      {borrow.late_fee > 0 ? (
                        <Chip label={`$${parseFloat(borrow.late_fee).toFixed(2)}`} color="error" size="small" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`borrows.${borrow.status}`)}
                        color={
                          borrow.status === 'overdue'
                            ? 'error'
                            : borrow.status === 'returned'
                            ? 'success'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {borrow.status !== 'returned' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleOpenReturn(borrow)}
                          title={t('borrows.returnBook')}
                        >
                          <UndoIcon />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => handleOpen(borrow)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm(t('common.confirmDelete'))) {
                            deleteMutation.mutate(borrow.id);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Borrow Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedBorrow ? t('borrows.editBorrow') : t('borrows.borrowBook')}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={books || []}
                  getOptionLabel={(option) => `${option.title} - ${option.author} (${option.available_copies} available)`}
                  value={books?.find((b) => b.id === formData.book_id) || null}
                  onChange={(e, newValue) => {
                    setFormData({ ...formData, book_id: newValue?.id || '' });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label={t('books.title')} required fullWidth />
                  )}
                  disabled={!!selectedBorrow}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={students || []}
                  getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.student_id})`}
                  value={students?.find((s) => s.id === formData.student_id) || null}
                  onChange={(e, newValue) => {
                    setFormData({ ...formData, student_id: newValue?.id || '' });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label={t('common.students')} required fullWidth />
                  )}
                  disabled={!!selectedBorrow}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('borrows.borrowDate')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.borrow_date}
                  onChange={(e) => setFormData({ ...formData, borrow_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('borrows.dueDate')}
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isLoading}>
              {t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Return Dialog */}
        <Dialog open={openReturn} onClose={handleCloseReturn} maxWidth="sm" fullWidth>
          <DialogTitle>{t('borrows.returnBook')}</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {selectedBorrow && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('books.title')}: <strong>{selectedBorrow.book?.title}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('common.students')}: <strong>{getStudentName(selectedBorrow.student)}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('borrows.dueDate')}: <strong>{formatDate(selectedBorrow.due_date)}</strong>
                </Typography>
                {isOverdue(selectedBorrow.due_date, selectedBorrow.status) && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {t('borrows.daysOverdue')}: {getDaysOverdue(selectedBorrow.due_date)}
                  </Alert>
                )}
              </Box>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('borrows.returnDate')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={returnData.return_date}
                  onChange={(e) => setReturnData({ ...returnData, return_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('borrows.status')}</InputLabel>
                  <Select
                    value={returnData.status}
                    onChange={(e) => setReturnData({ ...returnData, status: e.target.value })}
                  >
                    <MenuItem value="returned">{t('borrows.returned')}</MenuItem>
                    <MenuItem value="lost">{t('borrows.lost')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReturn}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleReturn} disabled={returnMutation.isLoading}>
              {t('borrows.returnBook')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Borrows;

