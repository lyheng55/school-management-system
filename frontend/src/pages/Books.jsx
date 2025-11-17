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
import BookIcon from '@mui/icons-material/Book';
import Layout from '../components/Layout';
import api from '../services/api';

const Books = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publication_year: '',
    category: '',
    total_copies: 1,
    available_copies: 1,
    shelf_location: '',
    status: 'available',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['books', page, search, filterCategory, filterStatus, availableOnly],
    async () => {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      if (availableOnly) params.available_only = 'true';
      const response = await api.get('/books', { params });
      return response.data.data;
    }
  );

  const { data: categories } = useQuery('bookCategories', async () => {
    try {
      const response = await api.get('/books/categories');
      return response.data.data || [];
    } catch {
      return [];
    }
  });

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/books', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('books');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('books.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/books/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('books');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('books.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/books/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('books');
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('books.failedToDelete'));
      },
    }
  );

  const handleOpen = (book = null) => {
    setSelectedBook(book);
    setError('');
    if (book) {
      setFormData({
        isbn: book.isbn || '',
        title: book.title || '',
        author: book.author || '',
        publisher: book.publisher || '',
        publication_year: book.publication_year || '',
        category: book.category || '',
        total_copies: book.total_copies || 1,
        available_copies: book.available_copies || 0,
        shelf_location: book.shelf_location || '',
        status: book.status || 'available',
      });
    } else {
      setFormData({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        publication_year: '',
        category: '',
        total_copies: 1,
        available_copies: 1,
        shelf_location: '',
        status: 'available',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBook(null);
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.author.trim()) {
      setError(t('books.fillRequiredFields'));
      return;
    }
    if (selectedBook) {
      updateMutation.mutate({ id: selectedBook.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'unavailable': return 'default';
      case 'lost': return 'error';
      case 'damaged': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{t('books.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('books.addBook')}
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
                <InputLabel>{t('books.filterByCategory')}</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {categories?.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('books.filterByStatus')}</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  <MenuItem value="available">{t('books.available')}</MenuItem>
                  <MenuItem value="unavailable">{t('books.unavailable')}</MenuItem>
                  <MenuItem value="lost">{t('books.lost')}</MenuItem>
                  <MenuItem value="damaged">{t('books.damaged')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant={availableOnly ? 'contained' : 'outlined'}
                onClick={() => {
                  setAvailableOnly(!availableOnly);
                  setPage(1);
                }}
                fullWidth
              >
                {t('books.availableOnly')}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !data?.books || data.books.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('books.noBooks')}</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('books.title')}</TableCell>
                  <TableCell>{t('books.author')}</TableCell>
                  <TableCell>{t('books.isbn')}</TableCell>
                  <TableCell>{t('books.category')}</TableCell>
                  <TableCell>{t('books.totalCopies')}</TableCell>
                  <TableCell>{t('books.availableCopies')}</TableCell>
                  <TableCell>{t('books.status')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BookIcon fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          {book.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.isbn || '-'}</TableCell>
                    <TableCell>{book.category || '-'}</TableCell>
                    <TableCell>{book.total_copies}</TableCell>
                    <TableCell>
                      <Chip
                        label={book.available_copies}
                        color={book.available_copies > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`books.${book.status}`)}
                        color={getStatusColor(book.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpen(book)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm(t('common.confirmDelete'))) {
                            deleteMutation.mutate(book.id);
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
            {selectedBook ? t('books.editBook') : t('books.addBook')}
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
                  label={t('books.title')}
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('books.author')}
                  fullWidth
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('books.isbn')}
                  fullWidth
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('books.publisher')}
                  fullWidth
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('books.publicationYear')}
                  type="number"
                  fullWidth
                  value={formData.publication_year}
                  onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('books.category')}
                  fullWidth
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t('books.totalCopies')}
                  type="number"
                  fullWidth
                  required
                  value={formData.total_copies}
                  onChange={(e) => {
                    const total = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      total_copies: total,
                      available_copies: Math.min(formData.available_copies, total),
                    });
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t('books.availableCopies')}
                  type="number"
                  fullWidth
                  value={formData.available_copies}
                  onChange={(e) => {
                    const available = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      available_copies: Math.min(available, formData.total_copies),
                    });
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>{t('books.status')}</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="available">{t('books.available')}</MenuItem>
                    <MenuItem value="unavailable">{t('books.unavailable')}</MenuItem>
                    <MenuItem value="lost">{t('books.lost')}</MenuItem>
                    <MenuItem value="damaged">{t('books.damaged')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('books.shelfLocation')}
                  fullWidth
                  value={formData.shelf_location}
                  onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
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

export default Books;

