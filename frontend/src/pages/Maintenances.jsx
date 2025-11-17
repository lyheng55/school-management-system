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
import BuildIcon from '@mui/icons-material/Build';
import Layout from '../components/Layout';
import api from '../services/api';

const Maintenances = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [search, setSearch] = useState('');
  const [filterAsset, setFilterAsset] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '',
    maintenance_type: 'repair',
    description: '',
    scheduled_date: '',
    completed_date: '',
    cost: '',
    vendor: '',
    status: 'scheduled',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: assetsData } = useQuery(['assets', 'all'], async () => {
    try {
      const response = await api.get('/assets', { params: { limit: 1000 } });
      return response.data.data.assets || [];
    } catch {
      return [];
    }
  });

  const { data, isLoading } = useQuery(
    ['maintenances', page, search, filterAsset, filterType, filterStatus, upcomingOnly],
    async () => {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filterAsset) params.asset_id = filterAsset;
      if (filterType) params.maintenance_type = filterType;
      if (filterStatus) params.status = filterStatus;
      if (upcomingOnly) params.upcoming_only = 'true';
      const response = await api.get('/maintenances', { params });
      return response.data.data;
    }
  );

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/maintenances', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['maintenances']);
        queryClient.invalidateQueries(['assets']);
        queryClient.invalidateQueries(['assets', 'all']);
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('maintenances.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/maintenances/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['maintenances']);
        queryClient.invalidateQueries(['assets']);
        queryClient.invalidateQueries(['assets', 'all']);
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('maintenances.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/maintenances/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['maintenances']);
        queryClient.invalidateQueries(['assets']);
        queryClient.invalidateQueries(['assets', 'all']);
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('maintenances.failedToDelete'));
      },
    }
  );

  const handleOpen = (maintenance = null) => {
    setSelectedMaintenance(maintenance);
    setError('');
    if (maintenance) {
      setFormData({
        asset_id: maintenance.asset_id || '',
        maintenance_type: maintenance.maintenance_type || 'repair',
        description: maintenance.description || '',
        scheduled_date: maintenance.scheduled_date || '',
        completed_date: maintenance.completed_date || '',
        cost: maintenance.cost || '',
        vendor: maintenance.vendor || '',
        status: maintenance.status || 'scheduled',
      });
    } else {
      setFormData({
        asset_id: '',
        maintenance_type: 'repair',
        description: '',
        scheduled_date: '',
        completed_date: '',
        cost: '',
        vendor: '',
        status: 'scheduled',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedMaintenance(null);
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.asset_id || !formData.description.trim()) {
      setError(t('maintenances.fillRequiredFields'));
      return;
    }
    const submitData = {
      ...formData,
      scheduled_date: formData.scheduled_date || null,
      completed_date: formData.completed_date || null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      vendor: formData.vendor || null,
    };
    if (selectedMaintenance) {
      updateMutation.mutate({ id: selectedMaintenance.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getTypeLabel = (type) => {
    return t(`maintenances.types.${type}`);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{t('maintenances.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('maintenances.addMaintenance')}
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('maintenances.filterByAsset')}</InputLabel>
                <Select
                  value={filterAsset}
                  onChange={(e) => {
                    setFilterAsset(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {assetsData?.map((asset) => (
                    <MenuItem key={asset.id} value={asset.id}>
                      {asset.asset_code} - {asset.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('maintenances.filterByType')}</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="repair">{t('maintenances.types.repair')}</MenuItem>
                  <MenuItem value="service">{t('maintenances.types.service')}</MenuItem>
                  <MenuItem value="inspection">{t('maintenances.types.inspection')}</MenuItem>
                  <MenuItem value="upgrade">{t('maintenances.types.upgrade')}</MenuItem>
                  <MenuItem value="other">{t('maintenances.types.other')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('maintenances.filterByStatus')}</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="scheduled">{t('maintenances.scheduled')}</MenuItem>
                  <MenuItem value="in_progress">{t('maintenances.inProgress')}</MenuItem>
                  <MenuItem value="completed">{t('maintenances.completed')}</MenuItem>
                  <MenuItem value="cancelled">{t('maintenances.cancelled')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                variant={upcomingOnly ? 'contained' : 'outlined'}
                onClick={() => {
                  setUpcomingOnly(!upcomingOnly);
                  setPage(1);
                }}
                fullWidth
                size="small"
              >
                {t('maintenances.upcoming')}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !data?.maintenances || data.maintenances.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('maintenances.noMaintenances')}</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('maintenances.asset')}</TableCell>
                  <TableCell>{t('maintenances.type')}</TableCell>
                  <TableCell>{t('maintenances.description')}</TableCell>
                  <TableCell>{t('maintenances.scheduledDate')}</TableCell>
                  <TableCell>{t('maintenances.completedDate')}</TableCell>
                  <TableCell>{t('maintenances.cost')}</TableCell>
                  <TableCell>{t('maintenances.status')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.maintenances.map((maintenance) => (
                  <TableRow key={maintenance.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BuildIcon fontSize="small" />
                        <Typography variant="body2">
                          {maintenance.asset?.asset_code || '-'} - {maintenance.asset?.name || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getTypeLabel(maintenance.maintenance_type)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {maintenance.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {maintenance.scheduled_date
                        ? new Date(maintenance.scheduled_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {maintenance.completed_date
                        ? new Date(maintenance.completed_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {maintenance.cost ? `$${maintenance.cost}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`maintenances.${maintenance.status}`)}
                        color={getStatusColor(maintenance.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpen(maintenance)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm(t('common.confirmDelete'))) {
                            deleteMutation.mutate(maintenance.id);
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
            {selectedMaintenance ? t('maintenances.editMaintenance') : t('maintenances.addMaintenance')}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('maintenances.asset')}</InputLabel>
                  <Select
                    value={formData.asset_id}
                    onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                    required
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {assetsData?.map((asset) => (
                      <MenuItem key={asset.id} value={asset.id}>
                        {asset.asset_code} - {asset.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('maintenances.type')}</InputLabel>
                  <Select
                    value={formData.maintenance_type}
                    onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                  >
                    <MenuItem value="repair">{t('maintenances.types.repair')}</MenuItem>
                    <MenuItem value="service">{t('maintenances.types.service')}</MenuItem>
                    <MenuItem value="inspection">{t('maintenances.types.inspection')}</MenuItem>
                    <MenuItem value="upgrade">{t('maintenances.types.upgrade')}</MenuItem>
                    <MenuItem value="other">{t('maintenances.types.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('maintenances.status')}</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="scheduled">{t('maintenances.scheduled')}</MenuItem>
                    <MenuItem value="in_progress">{t('maintenances.inProgress')}</MenuItem>
                    <MenuItem value="completed">{t('maintenances.completed')}</MenuItem>
                    <MenuItem value="cancelled">{t('maintenances.cancelled')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('maintenances.vendor')}
                  fullWidth
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('maintenances.scheduledDate')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('maintenances.completedDate')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.completed_date}
                  onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('maintenances.cost')}
                  type="number"
                  fullWidth
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('maintenances.description')}
                  fullWidth
                  multiline
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default Maintenances;

