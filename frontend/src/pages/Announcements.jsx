import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Paper,
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
  CardActions,
  Divider,
  Pagination,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import Layout from '../components/Layout';
import api from '../services/api';

const Announcements = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filterAudience, setFilterAudience] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    priority: 'medium',
    published_at: new Date().toISOString().split('T')[0],
    expires_at: '',
    is_active: true,
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['announcements', page, filterAudience, filterPriority, activeOnly],
    async () => {
      const params = { page, limit: 20 };
      if (filterAudience) params.target_audience = filterAudience;
      if (filterPriority) params.priority = filterPriority;
      if (activeOnly) params.active_only = 'true';
      const response = await api.get('/announcements', { params });
      return response.data.data;
    }
  );

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/announcements', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('announcements');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('announcements.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/announcements/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('announcements');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('announcements.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/announcements/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('announcements');
      },
    }
  );

  const toggleActiveMutation = useMutation(
    async (id) => {
      const response = await api.put(`/announcements/${id}/toggle-active`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('announcements');
      },
    }
  );

  const handleOpen = (announcement = null) => {
    setSelectedAnnouncement(announcement);
    setError('');
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        target_audience: announcement.target_audience || 'all',
        priority: announcement.priority || 'medium',
        published_at: announcement.published_at ? announcement.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
        expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : '',
        is_active: announcement.is_active !== undefined ? announcement.is_active : true,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        target_audience: 'all',
        priority: 'medium',
        published_at: new Date().toISOString().split('T')[0],
        expires_at: '',
        is_active: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAnnouncement(null);
    setError('');
  };

  const handleOpenView = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpenView(true);
  };

  const handleCloseView = () => {
    setOpenView(false);
    setSelectedAnnouncement(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError(t('announcements.fillRequiredFields'));
      return;
    }
    if (selectedAnnouncement) {
      updateMutation.mutate({ id: selectedAnnouncement.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{t('announcements.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('announcements.addAnnouncement')}
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('announcements.filterByAudience')}</InputLabel>
                <Select
                  value={filterAudience}
                  onChange={(e) => {
                    setFilterAudience(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="all">{t('announcements.all')}</MenuItem>
                  <MenuItem value="teachers">{t('nav.teachers')}</MenuItem>
                  <MenuItem value="staff">{t('announcements.staff')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('announcements.filterByPriority')}</InputLabel>
                <Select
                  value={filterPriority}
                  onChange={(e) => {
                    setFilterPriority(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="urgent">{t('announcements.urgent')}</MenuItem>
                  <MenuItem value="high">{t('announcements.high')}</MenuItem>
                  <MenuItem value="medium">{t('announcements.medium')}</MenuItem>
                  <MenuItem value="low">{t('announcements.low')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant={activeOnly ? 'contained' : 'outlined'}
                onClick={() => {
                  setActiveOnly(!activeOnly);
                  setPage(1);
                }}
                fullWidth
              >
                {t('announcements.activeOnly')}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !data?.announcements || data.announcements.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('announcements.noAnnouncements')}</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {data.announcements.map((announcement) => (
              <Grid item xs={12} md={6} key={announcement.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: announcement.is_active ? 1 : 0.7,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {announcement.title}
                      </Typography>
                      <Chip
                        label={t(`announcements.${announcement.priority}`)}
                        color={getPriorityColor(announcement.priority)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {announcement.content.length > 150
                        ? `${announcement.content.substring(0, 150)}...`
                        : announcement.content}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip
                        label={t(`announcements.${announcement.target_audience}`)}
                        size="small"
                        variant="outlined"
                      />
                      {announcement.expires_at && (
                        <Chip
                          label={
                            isExpired(announcement.expires_at)
                              ? t('announcements.expired')
                              : `${t('announcements.expires')}: ${formatDate(announcement.expires_at)}`
                          }
                          size="small"
                          color={isExpired(announcement.expires_at) ? 'error' : 'default'}
                          variant="outlined"
                        />
                      )}
                      {!announcement.is_active && (
                        <Chip label={t('announcements.inactive')} size="small" color="default" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('announcements.published')}: {formatDate(announcement.published_at)} |{' '}
                      {t('announcements.createdBy')}: {announcement.creator?.username || 'N/A'}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button size="small" startIcon={<VisibilityIcon />} onClick={() => handleOpenView(announcement)}>
                      {t('common.view')}
                    </Button>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(announcement)}>
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => toggleActiveMutation.mutate(announcement.id)}
                      disabled={toggleActiveMutation.isLoading}
                    >
                      {announcement.is_active ? t('announcements.deactivate') : t('announcements.activate')}
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (window.confirm(t('common.confirmDelete'))) {
                          deleteMutation.mutate(announcement.id);
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
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
            {selectedAnnouncement ? t('announcements.editAnnouncement') : t('announcements.addAnnouncement')}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label={t('announcements.announcementTitle')}
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('announcements.content')}
                  fullWidth
                  multiline
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('announcements.targetAudience')}</InputLabel>
                  <Select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  >
                    <MenuItem value="all">{t('announcements.all')}</MenuItem>
                    <MenuItem value="teachers">{t('nav.teachers')}</MenuItem>
                    <MenuItem value="staff">{t('announcements.staff')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('announcements.priority')}</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <MenuItem value="low">{t('announcements.low')}</MenuItem>
                    <MenuItem value="medium">{t('announcements.medium')}</MenuItem>
                    <MenuItem value="high">{t('announcements.high')}</MenuItem>
                    <MenuItem value="urgent">{t('announcements.urgent')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('announcements.publishedAt')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.published_at}
                  onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('announcements.expiresAt')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
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

        {/* View Dialog */}
        <Dialog open={openView} onClose={handleCloseView} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedAnnouncement?.title}
          </DialogTitle>
          <DialogContent>
            {selectedAnnouncement && (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={t(`announcements.${selectedAnnouncement.priority}`)}
                    color={getPriorityColor(selectedAnnouncement.priority)}
                    size="small"
                  />
                  <Chip
                    label={t(`announcements.${selectedAnnouncement.target_audience}`)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                  {selectedAnnouncement.content}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  {t('announcements.published')}: {formatDate(selectedAnnouncement.published_at)} |{' '}
                  {selectedAnnouncement.expires_at && (
                    <>
                      {t('announcements.expires')}: {formatDate(selectedAnnouncement.expires_at)} |{' '}
                    </>
                  )}
                  {t('announcements.createdBy')}: {selectedAnnouncement.creator?.username || 'N/A'}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseView}>{t('common.close')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Announcements;

