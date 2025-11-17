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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RouteIcon from '@mui/icons-material/Route';
import Layout from '../components/Layout';
import api from '../services/api';

const Routes = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    start_location: '',
    end_location: '',
    stops: [],
    distance: '',
    fare: '',
    status: 'active',
  });
  const [stopInput, setStopInput] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['routes', page, search, filterStatus],
    async () => {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const response = await api.get('/routes', { params });
      return response.data.data;
    }
  );

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/routes', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('routes');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('routes.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/routes/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('routes');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('routes.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/routes/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('routes');
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('routes.failedToDelete'));
      },
    }
  );

  const handleOpen = (route = null) => {
    setSelectedRoute(route);
    setError('');
    if (route) {
      setFormData({
        name: route.name || '',
        start_location: route.start_location || '',
        end_location: route.end_location || '',
        stops: route.stops || [],
        distance: route.distance || '',
        fare: route.fare || '',
        status: route.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        start_location: '',
        end_location: '',
        stops: [],
        distance: '',
        fare: '',
        status: 'active',
      });
    }
    setStopInput('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRoute(null);
    setError('');
    setStopInput('');
  };

  const handleAddStop = () => {
    if (stopInput.trim()) {
      setFormData({
        ...formData,
        stops: [...formData.stops, stopInput.trim()],
      });
      setStopInput('');
    }
  };

  const handleRemoveStop = (index) => {
    setFormData({
      ...formData,
      stops: formData.stops.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.start_location.trim() || !formData.end_location.trim()) {
      setError(t('routes.fillRequiredFields'));
      return;
    }
    const submitData = {
      ...formData,
      distance: formData.distance ? parseFloat(formData.distance) : null,
      fare: formData.fare ? parseFloat(formData.fare) : null,
      stops: formData.stops.length > 0 ? formData.stops : null,
    };
    if (selectedRoute) {
      updateMutation.mutate({ id: selectedRoute.id, data: submitData });
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
          <Typography variant="h4">{t('routes.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('routes.addRoute')}
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
                <InputLabel>{t('routes.filterByStatus')}</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="active">{t('routes.active')}</MenuItem>
                  <MenuItem value="inactive">{t('routes.inactive')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !data?.routes || data.routes.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('routes.noRoutes')}</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('routes.name')}</TableCell>
                  <TableCell>{t('routes.startLocation')}</TableCell>
                  <TableCell>{t('routes.endLocation')}</TableCell>
                  <TableCell>{t('routes.distance')}</TableCell>
                  <TableCell>{t('routes.fare')}</TableCell>
                  <TableCell>{t('routes.stops')}</TableCell>
                  <TableCell>{t('routes.status')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RouteIcon fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          {route.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{route.start_location}</TableCell>
                    <TableCell>{route.end_location}</TableCell>
                    <TableCell>{route.distance ? `${route.distance} km` : '-'}</TableCell>
                    <TableCell>{route.fare ? `$${route.fare}` : '-'}</TableCell>
                    <TableCell>
                      {route.stops && Array.isArray(route.stops) ? route.stops.length : 0}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`routes.${route.status}`)}
                        color={getStatusColor(route.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpen(route)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm(t('common.confirmDelete'))) {
                            deleteMutation.mutate(route.id);
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

        {/* Create/Edit Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedRoute ? t('routes.editRoute') : t('routes.addRoute')}
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
                  label={t('routes.name')}
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('routes.status')}</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">{t('routes.active')}</MenuItem>
                    <MenuItem value="inactive">{t('routes.inactive')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('routes.startLocation')}
                  fullWidth
                  required
                  value={formData.start_location}
                  onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('routes.endLocation')}
                  fullWidth
                  required
                  value={formData.end_location}
                  onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('routes.distance')}
                  type="number"
                  fullWidth
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('routes.fare')}
                  type="number"
                  fullWidth
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label={t('routes.addStop')}
                    fullWidth
                    size="small"
                    value={stopInput}
                    onChange={(e) => setStopInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddStop();
                      }
                    }}
                  />
                  <Button variant="outlined" onClick={handleAddStop}>
                    {t('routes.add')}
                  </Button>
                </Box>
                {formData.stops.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.stops.map((stop, index) => (
                      <Chip
                        key={index}
                        label={stop}
                        onDelete={() => handleRemoveStop(index)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
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

export default Routes;

