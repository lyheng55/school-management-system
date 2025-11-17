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
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Layout from '../components/Layout';
import api from '../services/api';

const Events = () => {
  const { t } = useTranslation();
  const [view, setView] = useState(0); // 0 = list, 1 = calendar
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'other',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    is_active: true,
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['events', page, filterType, filterDate, upcomingOnly],
    async () => {
      const params = { page, limit: 50 };
      if (filterType) params.event_type = filterType;
      if (filterDate) params.start_date = filterDate;
      if (upcomingOnly) params.upcoming_only = 'true';
      const response = await api.get('/events', { params });
      return response.data.data;
    }
  );

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/events', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('events');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('events.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/events/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('events');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('events.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('events');
      },
    }
  );

  const toggleActiveMutation = useMutation(
    async (id) => {
      const response = await api.put(`/events/${id}/toggle-active`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('events');
      },
    }
  );

  const handleOpen = (event = null) => {
    setSelectedEvent(event);
    setError('');
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        event_type: event.event_type || 'other',
        start_date: event.start_date || new Date().toISOString().split('T')[0],
        end_date: event.end_date || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        location: event.location || '',
        is_active: event.is_active !== undefined ? event.is_active : true,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        event_type: 'other',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        start_time: '',
        end_time: '',
        location: '',
        is_active: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
    setError('');
  };

  const handleOpenView = (event) => {
    setSelectedEvent(event);
    setOpenView(true);
  };

  const handleCloseView = () => {
    setOpenView(false);
    setSelectedEvent(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.start_date) {
      setError(t('events.fillRequiredFields'));
      return;
    }
    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'ptm': return 'primary';
      case 'exam': return 'error';
      case 'holiday': return 'success';
      case 'sports': return 'warning';
      case 'cultural': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const isUpcoming = (startDate) => {
    if (!startDate) return false;
    return new Date(startDate) >= new Date();
  };

  const isPast = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  // Group events by date for calendar view
  const groupEventsByDate = (events) => {
    const grouped = {};
    events?.forEach((event) => {
      const date = event.start_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByDate(data?.events || []);

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{t('events.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('events.addEvent')}
          </Button>
        </Box>

        <Paper sx={{ mb: 2 }}>
          <Tabs value={view} onChange={(e, newValue) => setView(newValue)}>
            <Tab icon={<EventIcon />} iconPosition="start" label={t('events.listView')} />
            <Tab icon={<CalendarTodayIcon />} iconPosition="start" label={t('events.calendarView')} />
          </Tabs>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('events.filterByType')}</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="ptm">{t('events.ptm')}</MenuItem>
                  <MenuItem value="exam">{t('events.exam')}</MenuItem>
                  <MenuItem value="holiday">{t('events.holiday')}</MenuItem>
                  <MenuItem value="sports">{t('events.sports')}</MenuItem>
                  <MenuItem value="cultural">{t('events.cultural')}</MenuItem>
                  <MenuItem value="other">{t('common.other')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label={t('events.filterByDate')}
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setPage(1);
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant={upcomingOnly ? 'contained' : 'outlined'}
                onClick={() => {
                  setUpcomingOnly(!upcomingOnly);
                  setPage(1);
                }}
                fullWidth
              >
                {t('events.upcomingOnly')}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !data?.events || data.events.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('events.noEvents')}</Typography>
          </Paper>
        ) : view === 0 ? (
          // List View
          <Grid container spacing={2}>
            {data.events.map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: event.is_active ? 1 : 0.7,
                    borderLeft: `4px solid`,
                    borderLeftColor: getEventTypeColor(event.event_type) + '.main',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {event.title}
                      </Typography>
                      <Chip
                        label={t(`events.${event.event_type}`)}
                        color={getEventTypeColor(event.event_type)}
                        size="small"
                      />
                    </Box>
                    {event.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {event.description.length > 150
                          ? `${event.description.substring(0, 150)}...`
                          : event.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                      <Typography variant="body2">
                        <strong>{t('events.startDate')}:</strong> {formatDate(event.start_date)}
                        {event.start_time && ` ${formatTime(event.start_time)}`}
                      </Typography>
                      {event.end_date && (
                        <Typography variant="body2">
                          <strong>{t('events.endDate')}:</strong> {formatDate(event.end_date)}
                          {event.end_time && ` ${formatTime(event.end_time)}`}
                        </Typography>
                      )}
                      {event.location && (
                        <Typography variant="body2">
                          <strong>{t('events.location')}:</strong> {event.location}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {isUpcoming(event.start_date) && (
                        <Chip label={t('events.upcoming')} size="small" color="success" variant="outlined" />
                      )}
                      {isPast(event.end_date || event.start_date) && (
                        <Chip label={t('events.past')} size="small" color="default" variant="outlined" />
                      )}
                      {!event.is_active && (
                        <Chip label={t('events.inactive')} size="small" color="default" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {t('events.createdBy')}: {event.creator?.username || 'N/A'}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button size="small" startIcon={<VisibilityIcon />} onClick={() => handleOpenView(event)}>
                      {t('common.view')}
                    </Button>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpen(event)}>
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => toggleActiveMutation.mutate(event.id)}
                      disabled={toggleActiveMutation.isLoading}
                    >
                      {event.is_active ? t('events.deactivate') : t('events.activate')}
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (window.confirm(t('common.confirmDelete'))) {
                          deleteMutation.mutate(event.id);
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
        ) : (
          // Calendar View
          <Box>
            {Object.keys(groupedEvents).sort().map((date) => (
              <Paper key={date} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {formatDate(date)}
                </Typography>
                <Grid container spacing={2}>
                  {groupedEvents[date].map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event.id}>
                      <Card
                        sx={{
                          borderLeft: `4px solid`,
                          borderLeftColor: getEventTypeColor(event.event_type) + '.main',
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {event.title}
                            </Typography>
                            <Chip
                              label={t(`events.${event.event_type}`)}
                              color={getEventTypeColor(event.event_type)}
                              size="small"
                            />
                          </Box>
                          {event.start_time && (
                            <Typography variant="body2" color="text.secondary">
                              {formatTime(event.start_time)}
                              {event.end_time && ` - ${formatTime(event.end_time)}`}
                            </Typography>
                          )}
                          {event.location && (
                            <Typography variant="body2" color="text.secondary">
                              📍 {event.location}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button size="small" onClick={() => handleOpenView(event)}>
                            {t('common.view')}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ))}
          </Box>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedEvent ? t('events.editEvent') : t('events.addEvent')}
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
                  label={t('events.eventTitle')}
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('events.description')}
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('events.eventType')}</InputLabel>
                  <Select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  >
                    <MenuItem value="ptm">{t('events.ptm')}</MenuItem>
                    <MenuItem value="exam">{t('events.exam')}</MenuItem>
                    <MenuItem value="holiday">{t('events.holiday')}</MenuItem>
                    <MenuItem value="sports">{t('events.sports')}</MenuItem>
                    <MenuItem value="cultural">{t('events.cultural')}</MenuItem>
                    <MenuItem value="other">{t('common.other')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('events.location')}
                  fullWidth
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('events.startDate')}
                  type="date"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('events.endDate')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('events.startTime')}
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('events.endTime')}
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
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
            {selectedEvent?.title}
          </DialogTitle>
          <DialogContent>
            {selectedEvent && (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={t(`events.${selectedEvent.event_type}`)}
                    color={getEventTypeColor(selectedEvent.event_type)}
                    size="small"
                  />
                </Box>
                {selectedEvent.description && (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                    {selectedEvent.description}
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>{t('events.startDate')}:</strong> {formatDate(selectedEvent.start_date)}
                    {selectedEvent.start_time && ` ${formatTime(selectedEvent.start_time)}`}
                  </Typography>
                  {selectedEvent.end_date && (
                    <Typography variant="body2">
                      <strong>{t('events.endDate')}:</strong> {formatDate(selectedEvent.end_date)}
                      {selectedEvent.end_time && ` ${formatTime(selectedEvent.end_time)}`}
                    </Typography>
                  )}
                  {selectedEvent.location && (
                    <Typography variant="body2">
                      <strong>{t('events.location')}:</strong> {selectedEvent.location}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {t('events.createdBy')}: {selectedEvent.creator?.username || 'N/A'}
                  </Typography>
                </Box>
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

export default Events;

