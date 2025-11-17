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
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import Layout from '../components/Layout';
import api from '../services/api';

const Assets = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [formData, setFormData] = useState({
    asset_code: '',
    name: '',
    category: 'other',
    description: '',
    quantity: 1,
    location: '',
    purchase_date: '',
    purchase_cost: '',
    status: 'available',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['assets', page, search, filterCategory, filterStatus, filterLocation],
    async () => {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      if (filterLocation) params.location = filterLocation;
      const response = await api.get('/assets', { params });
      return response.data.data;
    }
  );

  const { data: stats } = useQuery('assetStats', async () => {
    try {
      const response = await api.get('/assets/stats');
      return response.data.data;
    } catch {
      return null;
    }
  });

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/assets', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['assets']);
        queryClient.invalidateQueries(['assets', 'all']);
        queryClient.invalidateQueries('assetStats');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('assets.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/assets/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['assets']);
        queryClient.invalidateQueries(['assets', 'all']);
        queryClient.invalidateQueries('assetStats');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('assets.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/assets/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['assets']);
        queryClient.invalidateQueries(['assets', 'all']);
        queryClient.invalidateQueries('assetStats');
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('assets.failedToDelete'));
      },
    }
  );

  const handleOpen = (asset = null) => {
    setSelectedAsset(asset);
    setError('');
    if (asset) {
      setFormData({
        asset_code: asset.asset_code || '',
        name: asset.name || '',
        category: asset.category || 'other',
        description: asset.description || '',
        quantity: asset.quantity || 1,
        location: asset.location || '',
        purchase_date: asset.purchase_date || '',
        purchase_cost: asset.purchase_cost || '',
        status: asset.status || 'available',
      });
    } else {
      setFormData({
        asset_code: '',
        name: '',
        category: 'other',
        description: '',
        quantity: 1,
        location: '',
        purchase_date: '',
        purchase_cost: '',
        status: 'available',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAsset(null);
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.asset_code.trim() || !formData.name.trim()) {
      setError(t('assets.fillRequiredFields'));
      return;
    }
    const submitData = {
      ...formData,
      purchase_date: formData.purchase_date || null,
      purchase_cost: formData.purchase_cost ? parseFloat(formData.purchase_cost) : null,
      quantity: parseInt(formData.quantity),
    };
    if (selectedAsset) {
      updateMutation.mutate({ id: selectedAsset.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'in_use': return 'info';
      case 'maintenance': return 'warning';
      case 'damaged': return 'error';
      case 'disposed': return 'default';
      default: return 'default';
    }
  };

  const getCategoryLabel = (category) => {
    return t(`assets.categories.${category}`);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{t('assets.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('assets.addAsset')}
          </Button>
        </Box>

        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    {t('assets.totalAssets')}
                  </Typography>
                  <Typography variant="h5">{stats.totalAssets || 0}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    {t('assets.available')}
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {stats.availableAssets || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    {t('assets.inMaintenance')}
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {stats.maintenanceAssets || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    {t('assets.totalValue')}
                  </Typography>
                  <Typography variant="h5">
                    ${(stats.totalValue || 0).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

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
                <InputLabel>{t('assets.filterByCategory')}</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="lab_equipment">{t('assets.categories.lab_equipment')}</MenuItem>
                  <MenuItem value="stationery">{t('assets.categories.stationery')}</MenuItem>
                  <MenuItem value="furniture">{t('assets.categories.furniture')}</MenuItem>
                  <MenuItem value="electronics">{t('assets.categories.electronics')}</MenuItem>
                  <MenuItem value="sports">{t('assets.categories.sports')}</MenuItem>
                  <MenuItem value="other">{t('assets.categories.other')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('assets.filterByStatus')}</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="available">{t('assets.available')}</MenuItem>
                  <MenuItem value="in_use">{t('assets.inUse')}</MenuItem>
                  <MenuItem value="maintenance">{t('assets.maintenance')}</MenuItem>
                  <MenuItem value="damaged">{t('assets.damaged')}</MenuItem>
                  <MenuItem value="disposed">{t('assets.disposed')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t('assets.filterByLocation')}
                fullWidth
                size="small"
                value={filterLocation}
                onChange={(e) => {
                  setFilterLocation(e.target.value);
                  setPage(1);
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !data?.assets || data.assets.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('assets.noAssets')}</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('assets.assetCode')}</TableCell>
                  <TableCell>{t('assets.name')}</TableCell>
                  <TableCell>{t('assets.category')}</TableCell>
                  <TableCell>{t('assets.quantity')}</TableCell>
                  <TableCell>{t('assets.location')}</TableCell>
                  <TableCell>{t('assets.purchaseCost')}</TableCell>
                  <TableCell>{t('assets.status')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          {asset.asset_code}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{getCategoryLabel(asset.category)}</TableCell>
                    <TableCell>{asset.quantity}</TableCell>
                    <TableCell>{asset.location || '-'}</TableCell>
                    <TableCell>
                      {asset.purchase_cost ? `$${asset.purchase_cost}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`assets.${asset.status}`)}
                        color={getStatusColor(asset.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpen(asset)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm(t('common.confirmDelete'))) {
                            deleteMutation.mutate(asset.id);
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
            {selectedAsset ? t('assets.editAsset') : t('assets.addAsset')}
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
                  label={t('assets.assetCode')}
                  fullWidth
                  required
                  value={formData.asset_code}
                  onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('assets.name')}
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('assets.category')}</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <MenuItem value="lab_equipment">{t('assets.categories.lab_equipment')}</MenuItem>
                    <MenuItem value="stationery">{t('assets.categories.stationery')}</MenuItem>
                    <MenuItem value="furniture">{t('assets.categories.furniture')}</MenuItem>
                    <MenuItem value="electronics">{t('assets.categories.electronics')}</MenuItem>
                    <MenuItem value="sports">{t('assets.categories.sports')}</MenuItem>
                    <MenuItem value="other">{t('assets.categories.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('assets.status')}</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="available">{t('assets.available')}</MenuItem>
                    <MenuItem value="in_use">{t('assets.inUse')}</MenuItem>
                    <MenuItem value="maintenance">{t('assets.maintenance')}</MenuItem>
                    <MenuItem value="damaged">{t('assets.damaged')}</MenuItem>
                    <MenuItem value="disposed">{t('assets.disposed')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t('assets.quantity')}
                  type="number"
                  fullWidth
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  inputProps={{ min: '1' }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t('assets.purchaseDate')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t('assets.purchaseCost')}
                  type="number"
                  fullWidth
                  value={formData.purchase_cost}
                  onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('assets.location')}
                  fullWidth
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('assets.description')}
                  fullWidth
                  multiline
                  rows={3}
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

export default Assets;

