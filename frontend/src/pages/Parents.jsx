import { useState, useEffect } from 'react';
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
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Parents = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    relationship: '',
    student_ids: [],
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  // Fetch all students for selection
  const { data: allStudents } = useQuery(
    'allStudents',
    async () => {
      const response = await api.get('/students', { params: { limit: 1000 } });
      return response.data.data?.students || [];
    }
  );

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error: queryError } = useQuery(
    ['parents', page, debouncedSearch, filterRelationship],
    async () => {
      try {
        const params = { page, limit: 10 }; // Show 10 parents per page
        if (debouncedSearch) params.search = debouncedSearch;
        if (filterRelationship) params.relationship = filterRelationship;
        const response = await api.get('/parents', { params });
        
        // Log response for debugging
        console.log('Parents API Response:', response.data);
        
        // Ensure we return the correct structure
        if (response.data && response.data.data) {
          return response.data.data;
        }
        
        // Fallback if structure is different
        return {
          parents: response.data?.parents || [],
          pagination: response.data?.pagination || { total: 0, page: 1, limit: 10, pages: 0 }
        };
      } catch (error) {
        console.error('Error in parents query:', error);
        throw error;
      }
    },
    {
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Keep in cache for 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 429 errors immediately
        if (error?.response?.status === 429) {
          return false;
        }
        // Don't retry on 403 or 401 errors
        if (error?.response?.status === 403 || error?.response?.status === 401) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 4000);
      },
      onError: (err) => {
        console.error('Error fetching parents:', err);
        if (err.response?.status === 429) {
          setError('Too many requests. Please wait a moment and try again.');
        } else if (err.response?.status === 404) {
          setError('Parents endpoint not found. Please check backend server.');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to access this page. Please ensure you are logged in as an admin or teacher.');
        } else if (err.response?.status === 401) {
          setError('Please login to access this page.');
        } else {
          setError(err.response?.data?.message || 'Error loading parents. Please check your connection and try again.');
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
        queryClient.invalidateQueries(['parents']);
        queryClient.invalidateQueries('allStudents');
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
        queryClient.invalidateQueries(['parents']);
        queryClient.invalidateQueries('allStudents');
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
        queryClient.invalidateQueries(['parents']);
        if (data?.parents?.length === 1 && page > 1) {
          setPage(page - 1);
        }
      },
      onError: (err) => {
        const errorMessage = err.response?.data?.message || t('parents.failedToDelete');
        setError(errorMessage);
        console.error('Delete parent error:', err);
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
        email: parent.user?.email || '',
        occupation: parent.occupation || '',
        address: parent.address || '',
        relationship: parent.relationship || '',
        student_ids: parent.children?.map(child => child.id) || [],
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        occupation: '',
        address: '',
        relationship: '',
        student_ids: [],
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
      email: '',
      occupation: '',
      address: '',
      relationship: '',
      student_ids: [],
    });
  };

  const handleSubmit = () => {
    setError('');
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.relationship) {
      setError(t('common.fillAllRequiredFields'));
      return;
    }

    try {
      // Prepare data - ensure student_ids is an array
      const submitData = {
        ...formData,
        student_ids: Array.isArray(formData.student_ids) ? formData.student_ids : []
      };

      if (selectedParent) {
        updateMutation.mutate({ id: selectedParent.id, data: submitData });
      } else {
        createMutation.mutate(submitData);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || t('parents.failedToCreate'));
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('parents.searchPlaceholder')}
                helperText={search !== debouncedSearch ? 'Typing...' : ''}
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

        {(queryError || error) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error || queryError?.response?.data?.message || queryError?.message || 'Error loading parents. Please check your connection and try again.'}
            {queryError?.response?.status === 403 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Current user role: {user?.role || 'Unknown'}. This page requires admin or teacher role.
              </Typography>
            )}
          </Alert>
        )}
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption">
                  Debug: Data received - Parents: {data?.parents?.length || 0}, Total: {data?.pagination?.total || 0}
                </Typography>
              </Box>
            )}
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
                  {data?.parents && data.parents.length > 0 ? (
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
                          {parent.children && Array.isArray(parent.children) && parent.children.length > 0 ? (
                            <Typography variant="body2">
                              {parent.children.length} {t('parents.child')}
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
                            title={t('common.delete')}
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

            {data?.pagination && (
              <Stack spacing={2} alignItems="center" mt={3}>
                <Pagination
                  count={data.pagination.pages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
                <Typography variant="body2" color="text.secondary">
                  Showing {(page - 1) * data.pagination.limit + 1} - {Math.min(page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} entries
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
                  error={formData.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phone)}
                  helperText={formData.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phone) ? 'Invalid phone number format' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('common.email')}
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  helperText="Optional"
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
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('parents.selectChildren')}</InputLabel>
                  <Select
                    multiple
                    value={formData.student_ids}
                    onChange={(e) =>
                      setFormData({ ...formData, student_ids: e.target.value })
                    }
                    input={<OutlinedInput label={t('parents.selectChildren')} />}
                    renderValue={(selected) => {
                      if (selected.length === 0) return t('parents.noChildrenSelected');
                      return `${selected.length} ${t('parents.childrenSelected')}`;
                    }}
                  >
                    {allStudents?.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        <Checkbox checked={formData.student_ids.indexOf(student.id) > -1} />
                        <ListItemText
                          primary={`${student.first_name} ${student.last_name}`}
                          secondary={student.class ? `${student.class.name} - ${student.student_id}` : student.student_id}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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

