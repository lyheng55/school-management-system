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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Autocomplete,
  Badge,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MailIcon from '@mui/icons-material/Mail';
import SendIcon from '@mui/icons-material/Send';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import Layout from '../components/Layout';
import api from '../services/api';

const Messages = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0); // 0 = inbox, 1 = sent
  const [page, setPage] = useState(1);
  const [openCompose, setOpenCompose] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [formData, setFormData] = useState({
    receiver_id: '',
    subject: '',
    content: '',
  });
  const [error, setError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const queryClient = useQueryClient();

  // Fetch inbox messages
  const { data: inboxData, isLoading: inboxLoading, refetch: refetchInbox } = useQuery(
    ['messages', 'inbox', page, unreadOnly],
    async () => {
      const params = { page, limit: 20 };
      if (unreadOnly) params.unread_only = 'true';
      const response = await api.get('/messages/inbox', { params });
      return response.data.data;
    },
    { enabled: tab === 0 }
  );

  // Fetch sent messages
  const { data: sentData, isLoading: sentLoading, refetch: refetchSent } = useQuery(
    ['messages', 'sent', page],
    async () => {
      const params = { page, limit: 20 };
      const response = await api.get('/messages/sent', { params });
      return response.data.data;
    },
    { enabled: tab === 1 }
  );

  // Fetch users for messaging
  const { data: usersData } = useQuery(
    ['users', 'messaging', userSearch],
    async () => {
      const params = {};
      if (userSearch) params.search = userSearch;
      const response = await api.get('/messages/users', { params });
      return response.data.data || [];
    },
    { enabled: openCompose }
  );

  const sendMutation = useMutation(
    async (data) => {
      const response = await api.post('/messages', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('messages');
        handleCloseCompose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('messages.failedToSend'));
      },
    }
  );

  const markAsReadMutation = useMutation(
    async (id) => {
      const response = await api.put(`/messages/${id}/read`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('messages');
      },
    }
  );

  const markAllAsReadMutation = useMutation(
    async () => {
      const response = await api.put('/messages/read-all');
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('messages');
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/messages/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('messages');
        handleCloseView();
      },
    }
  );

  const handleOpenCompose = () => {
    setOpenCompose(true);
    setError('');
    setFormData({
      receiver_id: '',
      subject: '',
      content: '',
    });
  };

  const handleCloseCompose = () => {
    setOpenCompose(false);
    setError('');
    setFormData({
      receiver_id: '',
      subject: '',
      content: '',
    });
    setUserSearch('');
  };

  const handleOpenView = async (message) => {
    setSelectedMessage(message);
    setOpenView(true);
    // Mark as read if viewing inbox message
    if (tab === 0 && !message.is_read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleCloseView = () => {
    setOpenView(false);
    setSelectedMessage(null);
  };

  const handleSend = () => {
    if (!formData.receiver_id || !formData.content.trim()) {
      setError(t('messages.fillRequiredFields'));
      return;
    }
    sendMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (selectedMessage && window.confirm(t('messages.confirmDelete'))) {
      deleteMutation.mutate(selectedMessage.id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getDisplayName = (user) => {
    if (!user) return '';
    return user.username || user.email || `${user.id}`;
  };

  const currentData = tab === 0 ? inboxData : sentData;
  const isLoading = tab === 0 ? inboxLoading : sentLoading;

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{t('messages.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCompose}
          >
            {t('messages.compose')}
          </Button>
        </Box>

        <Paper sx={{ mb: 2 }}>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            <Tab
              icon={
                <Badge badgeContent={inboxData?.unread_count || 0} color="error">
                  <InboxIcon />
                </Badge>
              }
              iconPosition="start"
              label={t('messages.inbox')}
            />
            <Tab icon={<SendIcon />} iconPosition="start" label={t('messages.sent')} />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <Button
              variant={unreadOnly ? 'contained' : 'outlined'}
              onClick={() => {
                setUnreadOnly(!unreadOnly);
                setPage(1);
              }}
            >
              {t('messages.unreadOnly')}
            </Button>
            {inboxData?.unread_count > 0 && (
              <Button
                variant="outlined"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isLoading}
              >
                {t('messages.markAllAsRead')}
              </Button>
            )}
          </Box>
        )}

        <Paper>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : !currentData?.messages || currentData.messages.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {tab === 0 ? t('messages.noInboxMessages') : t('messages.noSentMessages')}
              </Typography>
            </Box>
          ) : (
            <List>
              {currentData.messages.map((message, index) => (
                <Box key={message.id}>
                  <ListItem
                    button
                    onClick={() => handleOpenView(message)}
                    sx={{
                      backgroundColor: tab === 0 && !message.is_read ? 'action.hover' : 'transparent',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={tab === 0 && !message.is_read ? 'bold' : 'normal'}>
                            {tab === 0
                              ? getDisplayName(message.sender)
                              : getDisplayName(message.receiver)}
                          </Typography>
                          {tab === 0 && !message.is_read && (
                            <Chip label={t('messages.unread')} size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {message.subject || t('messages.noSubject')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(message.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenView(message);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(t('messages.confirmDelete'))) {
                            deleteMutation.mutate(message.id);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < currentData.messages.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Paper>

        {/* Compose Message Dialog */}
        <Dialog open={openCompose} onClose={handleCloseCompose} maxWidth="md" fullWidth>
          <DialogTitle>{t('messages.compose')}</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={usersData || []}
                  getOptionLabel={(option) => getDisplayName(option)}
                  value={usersData?.find((u) => u.id === formData.receiver_id) || null}
                  onChange={(e, newValue) => {
                    setFormData({ ...formData, receiver_id: newValue?.id || '' });
                  }}
                  onInputChange={(e, newInputValue) => {
                    setUserSearch(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('messages.to')}
                      required
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('messages.subject')}
                  fullWidth
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('messages.content')}
                  fullWidth
                  multiline
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCompose}>{t('common.cancel')}</Button>
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={sendMutation.isLoading}
              startIcon={sendMutation.isLoading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {t('messages.send')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Message Dialog */}
        <Dialog open={openView} onClose={handleCloseView} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedMessage?.subject || t('messages.noSubject')}
          </DialogTitle>
          <DialogContent>
            {selectedMessage && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      {tab === 0 ? t('messages.from') : t('messages.to')}
                    </Typography>
                    <Typography variant="body1">
                      {tab === 0
                        ? getDisplayName(selectedMessage.sender)
                        : getDisplayName(selectedMessage.receiver)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      {t('messages.date')}
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedMessage.created_at)}
                    </Typography>
                  </Grid>
                  {tab === 0 && selectedMessage.is_read && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        {t('messages.readAt')}
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(selectedMessage.read_at)}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedMessage.content}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseView}>{t('common.close')}</Button>
            <Button
              color="error"
              onClick={handleDelete}
              startIcon={<DeleteIcon />}
            >
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Messages;

