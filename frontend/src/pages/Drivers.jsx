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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import Layout from '../components/Layout';
import api from '../services/api';

const Drivers = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    address: '',
    joining_date: '',
    status: 'active',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['drivers', page, search, filterStatus],
    async () => {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const response = await api.get('/drivers', { params });
      return response.data.data;
    }
  );

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/drivers', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('drivers');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('drivers.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/drivers/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('drivers');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('drivers.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/drivers/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('drivers');
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('drivers.failedToDelete'));
      },
    }
  );

  const handleOpen = (driver = null) => {
    setSelectedDriver(driver);
    setError('');
    if (driver) {
      setFormData({
        first_name: driver.first_name || '',
        last_name: driver.last_name || '',
        phone: driver.phone || '',
        license_number: driver.license_number || '',
        license_expiry: driver.license_expiry || '',
        address: driver.address || '',
        joining_date: driver.joining_date || '',
        status: driver.status || 'active',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        license_number: '',
        license_expiry: '',
        address: '',
        joining_date: '',
        status: 'active',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDriver(null);
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.phone.trim() || !formData.license_number.trim()) {
      setError(t('drivers.fillRequiredFields'));
      return;
    }
    const submitData = {
      ...formData,
      license_expiry: formData.license_expiry || null,
      address: formData.address || null,
      joining_date: formData.joining_date || null,
    };
    if (selectedDriver) {
      updateMutation.mutate({ id: selectedDriver.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{t('drivers.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('drivers.addDriver')}
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label={t('common.search')}
                fullWidth
                size="small"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('drivers.filterByStatus')}</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="active">{t('drivers.active')}</MenuItem>
                  <MenuItem value="inactive">{t('drivers.inactive')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !data?.drivers || data.drivers.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('drivers.noDrivers')}</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('drivers.name')}</TableCell>
                  <TableCell>{t('drivers.phone')}</TableCell>
                  <TableCell>{t('drivers.licenseNumber')}</TableCell>
                  <TableCell>{t('drivers.licenseExpiry')}</TableCell>
                  <TableCell>{t('drivers.vehicles')}</TableCell>
                  <TableCell>{t('drivers.status')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          {driver.first_name} {driver.last_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{driver.phone}</TableCell>
                    <TableCell>{driver.license_number}</TableCell>
                    <TableCell>
                      {driver.license_expiry
                        ? new Date(driver.license_expiry).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {driver.vehicles && driver.vehicles.length > 0
                        ? driver.vehicles.length
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`drivers.${driver.status}`)}
                        color={getStatusColor(driver.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpen(driver)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm(t('common.confirmDelete'))) {
                            deleteMutation.mutate(driver.id);
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

        {/* Create/Edit Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedDriver ? t('drivers.editDriver') : t('drivers.addDriver')}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('drivers.firstName')}
                  fullWidth
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('drivers.lastName')}
                  fullWidth
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('drivers.phone')}
                  fullWidth
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('drivers.licenseNumber')}
                  fullWidth
                  required
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('drivers.licenseExpiry')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.license_expiry}
                  onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('drivers.joiningDate')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.joining_date}
                  onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('drivers.status')}</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">{t('drivers.active')}</MenuItem>
                    <MenuItem value="inactive">{t('drivers.inactive')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('drivers.address')}
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={createMutation.isLoading || updateMutation.isLoading}>
              {t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Drivers;

