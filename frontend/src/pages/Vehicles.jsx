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
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import Layout from '../components/Layout';
import api from '../services/api';

const Vehicles = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: 'bus',
    capacity: '',
    route_id: '',
    driver_id: '',
    registration_date: '',
    insurance_expiry: '',
    status: 'active',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: routesData } = useQuery('routes', async () => {
    try {
      const response = await api.get('/routes', { params: { limit: 1000 } });
      return response.data.data.routes || [];
    } catch {
      return [];
    }
  });

  const { data: driversData } = useQuery('drivers', async () => {
    try {
      const response = await api.get('/drivers', { params: { limit: 1000 } });
      return response.data.data.drivers || [];
    } catch {
      return [];
    }
  });

  const { data, isLoading } = useQuery(
    ['vehicles', page, search, filterType, filterStatus, filterRoute],
    async () => {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filterType) params.vehicle_type = filterType;
      if (filterStatus) params.status = filterStatus;
      if (filterRoute) params.route_id = filterRoute;
      const response = await api.get('/vehicles', { params });
      return response.data.data;
    }
  );

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/vehicles', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vehicles');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('vehicles.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/vehicles/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vehicles');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('vehicles.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/vehicles/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vehicles');
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('vehicles.failedToDelete'));
      },
    }
  );

  const handleOpen = (vehicle = null) => {
    setSelectedVehicle(vehicle);
    setError('');
    if (vehicle) {
      setFormData({
        vehicle_number: vehicle.vehicle_number || '',
        vehicle_type: vehicle.vehicle_type || 'bus',
        capacity: vehicle.capacity || '',
        route_id: vehicle.route_id || '',
        driver_id: vehicle.driver_id || '',
        registration_date: vehicle.registration_date || '',
        insurance_expiry: vehicle.insurance_expiry || '',
        status: vehicle.status || 'active',
      });
    } else {
      setFormData({
        vehicle_number: '',
        vehicle_type: 'bus',
        capacity: '',
        route_id: '',
        driver_id: '',
        registration_date: '',
        insurance_expiry: '',
        status: 'active',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVehicle(null);
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.vehicle_number.trim() || !formData.capacity) {
      setError(t('vehicles.fillRequiredFields'));
      return;
    }
    const submitData = {
      ...formData,
      route_id: formData.route_id || null,
      driver_id: formData.driver_id || null,
      registration_date: formData.registration_date || null,
      insurance_expiry: formData.insurance_expiry || null,
      capacity: parseInt(formData.capacity),
    };
    if (selectedVehicle) {
      updateMutation.mutate({ id: selectedVehicle.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getTypeLabel = (type) => {
    return t(`vehicles.${type}`);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{t('vehicles.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('vehicles.addVehicle')}
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('vehicles.filterByType')}</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="bus">{t('vehicles.bus')}</MenuItem>
                  <MenuItem value="van">{t('vehicles.van')}</MenuItem>
                  <MenuItem value="car">{t('vehicles.car')}</MenuItem>
                  <MenuItem value="other">{t('vehicles.other')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('vehicles.filterByStatus')}</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="active">{t('vehicles.active')}</MenuItem>
                  <MenuItem value="inactive">{t('vehicles.inactive')}</MenuItem>
                  <MenuItem value="maintenance">{t('vehicles.maintenance')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('vehicles.filterByRoute')}</InputLabel>
                <Select
                  value={filterRoute}
                  onChange={(e) => {
                    setFilterRoute(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {routesData?.map((route) => (
                    <MenuItem key={route.id} value={route.id}>
                      {route.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !data?.vehicles || data.vehicles.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('vehicles.noVehicles')}</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('vehicles.vehicleNumber')}</TableCell>
                  <TableCell>{t('vehicles.type')}</TableCell>
                  <TableCell>{t('vehicles.capacity')}</TableCell>
                  <TableCell>{t('vehicles.route')}</TableCell>
                  <TableCell>{t('vehicles.driver')}</TableCell>
                  <TableCell>{t('vehicles.status')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsBusIcon fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          {vehicle.vehicle_number}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getTypeLabel(vehicle.vehicle_type)}</TableCell>
                    <TableCell>{vehicle.capacity}</TableCell>
                    <TableCell>{vehicle.route?.name || '-'}</TableCell>
                    <TableCell>
                      {vehicle.driver
                        ? `${vehicle.driver.first_name} ${vehicle.driver.last_name}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`vehicles.${vehicle.status}`)}
                        color={getStatusColor(vehicle.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpen(vehicle)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm(t('common.confirmDelete'))) {
                            deleteMutation.mutate(vehicle.id);
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
            {selectedVehicle ? t('vehicles.editVehicle') : t('vehicles.addVehicle')}
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
                  label={t('vehicles.vehicleNumber')}
                  fullWidth
                  required
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('vehicles.type')}</InputLabel>
                  <Select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  >
                    <MenuItem value="bus">{t('vehicles.bus')}</MenuItem>
                    <MenuItem value="van">{t('vehicles.van')}</MenuItem>
                    <MenuItem value="car">{t('vehicles.car')}</MenuItem>
                    <MenuItem value="other">{t('vehicles.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('vehicles.capacity')}
                  type="number"
                  fullWidth
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  inputProps={{ min: '1' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('vehicles.status')}</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">{t('vehicles.active')}</MenuItem>
                    <MenuItem value="inactive">{t('vehicles.inactive')}</MenuItem>
                    <MenuItem value="maintenance">{t('vehicles.maintenance')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('vehicles.route')}</InputLabel>
                  <Select
                    value={formData.route_id}
                    onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                  >
                    <MenuItem value="">{t('common.none')}</MenuItem>
                    {routesData?.map((route) => (
                      <MenuItem key={route.id} value={route.id}>
                        {route.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('vehicles.driver')}</InputLabel>
                  <Select
                    value={formData.driver_id}
                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                  >
                    <MenuItem value="">{t('common.none')}</MenuItem>
                    {driversData?.map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name} ({driver.license_number})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('vehicles.registrationDate')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.registration_date}
                  onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('vehicles.insuranceExpiry')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.insurance_expiry}
                  onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
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

export default Vehicles;

