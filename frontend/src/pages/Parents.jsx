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
  Grid,
  Alert,
  CircularProgress,
  Pagination,
  Stack,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import Layout from '../components/Layout';
import api from '../services/api';

const Parents = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    occupation: '',
    address: '',
    relationship: '',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error: queryError } = useQuery(
    ['parents', page, search, filterRelationship],
    async () => {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (filterRelationship) params.relationship = filterRelationship;
      const response = await api.get('/parents', { params });
      return response.data.data;
    },
    {
      onError: (err) => {
        console.error('Error fetching parents:', err);
        if (err.response?.status === 404) {
          setError('Parents endpoint not found. Please check backend server.');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to access this page.');
        } else if (err.response?.status === 401) {
          setError('Please login to access this page.');
        }
      }
    }
  );

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/parents', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('parents');
        handleClose();
        setPage(1);
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('parents.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/parents/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('parents');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('parents.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/parents/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('parents');
        if (data?.parents?.length === 1 && page > 1) {
          setPage(page - 1);
        }
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('parents.failedToDelete'));
      },
    }
  );

  const handleOpen = (parent = null) => {
    setSelectedParent(parent);
    setError('');
    if (parent) {
      setFormData({
        first_name: parent.first_name || '',
        last_name: parent.last_name || '',
        phone: parent.phone || '',
        occupation: parent.occupation || '',
        address: parent.address || '',
        relationship: parent.relationship || '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        occupation: '',
        address: '',
        relationship: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedParent(null);
    setError('');
    setFormData({
      first_name: '',
      last_name: '',
      phone: '',
      occupation: '',
      address: '',
      relationship: '',
    });
  };

  const handleSubmit = () => {
    setError('');
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.relationship) {
      setError(t('common.fillAllRequiredFields'));
      return;
    }

    if (selectedParent) {
      updateMutation.mutate({ id: selectedParent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const getRelationshipColor = (relationship) => {
    const colors = {
      father: 'primary',
      mother: 'secondary',
      guardian: 'success',
      other: 'default',
    };
    return colors[relationship] || 'default';
  };

  return (
    <Layout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">{t('parents.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('parents.addParent')}
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('common.search')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t('parents.searchPlaceholder')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('parents.filterByRelationship')}</InputLabel>
                <Select
                  value={filterRelationship}
                  label={t('parents.filterByRelationship')}
                  onChange={(e) => {
                    setFilterRelationship(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="father">{t('students.father')}</MenuItem>
                  <MenuItem value="mother">{t('students.mother')}</MenuItem>
                  <MenuItem value="guardian">{t('students.guardian')}</MenuItem>
                  <MenuItem value="other">{t('students.other')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {queryError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {queryError.response?.data?.message || queryError.message || 'Error loading parents. Please check your connection and try again.'}
          </Alert>
        )}
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.name')}</TableCell>
                    <TableCell>{t('common.phone')}</TableCell>
                    <TableCell>{t('parents.relationship')}</TableCell>
                    <TableCell>{t('parents.occupation')}</TableCell>
                    <TableCell>{t('parents.children')}</TableCell>
                    <TableCell>{t('common.email')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.parents?.length > 0 ? (
                    data.parents.map((parent) => (
                      <TableRow key={parent.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <FamilyRestroomIcon color="action" />
                            <Typography>
                              {parent.first_name} {parent.last_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{parent.phone}</TableCell>
                        <TableCell>
                          <Chip
                            label={t(`students.${parent.relationship}`)}
                            color={getRelationshipColor(parent.relationship)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{parent.occupation || '-'}</TableCell>
                        <TableCell>
                          {parent.students?.length > 0 ? (
                            <Typography variant="body2">
                              {parent.students.length} {t('parents.child')}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {t('parents.noChildren')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{parent.user?.email || '-'}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpen(parent)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(parent.id)}
                            color="error"
                            disabled={parent.students?.length > 0}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary" py={3}>
                          {t('parents.noRecords')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {data?.pagination?.pages > 1 && (
              <Stack spacing={2} alignItems="center" mt={3}>
                <Pagination
                  count={data.pagination.pages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
                <Typography variant="body2" color="text.secondary">
                  {t('common.showing')} {(page - 1) * data.pagination.limit + 1} - {Math.min(page * data.pagination.limit, data.pagination.total)} {t('common.of')} {data.pagination.total} {t('common.entries')}
                </Typography>
              </Stack>
            )}
          </>
        )}

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedParent ? t('parents.editParent') : t('parents.addParent')}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('students.firstName')}
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('students.lastName')}
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('common.phone')}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('parents.relationship')}</InputLabel>
                  <Select
                    value={formData.relationship}
                    label={t('parents.relationship')}
                    onChange={(e) =>
                      setFormData({ ...formData, relationship: e.target.value })
                    }
                  >
                    <MenuItem value="father">{t('students.father')}</MenuItem>
                    <MenuItem value="mother">{t('students.mother')}</MenuItem>
                    <MenuItem value="guardian">{t('students.guardian')}</MenuItem>
                    <MenuItem value="other">{t('students.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('parents.occupation')}
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData({ ...formData, occupation: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('common.address')}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? t('common.saving')
                : selectedParent
                ? t('common.update')
                : t('common.create')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Parents;

