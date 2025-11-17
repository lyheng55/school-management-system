import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
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
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Pagination,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import RoomIcon from '@mui/icons-material/Room';
import BookIcon from '@mui/icons-material/Book';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import Layout from '../components/Layout';
import api from '../services/api';

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const Timetables = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const dayLabels = {
    monday: t('timetables.monday'),
    tuesday: t('timetables.tuesday'),
    wednesday: t('timetables.wednesday'),
    thursday: t('timetables.thursday'),
    friday: t('timetables.friday'),
    saturday: t('timetables.saturday'),
    sunday: t('timetables.sunday'),
  };
  const [open, setOpen] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedDay, setSelectedDay] = useState('monday'); // Current selected day tab
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    teacher_id: '',
    day_of_week: 'monday',
    start_time: '',
    end_time: '',
    room: '',
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  // Fetch ALL timetables for the class (no pagination) since we're grouping by day
  const { data: timetablesData, isLoading } = useQuery(
    ['timetables', selectedClassId],
    async () => {
      if (!selectedClassId) return { timetables: [], pagination: { total: 0, page: 1, limit: 1000, pages: 0 } };
      // Fetch all timetables with a high limit to get everything
      const params = { 
        class_id: selectedClassId,
        page: 1,
        limit: 1000 // High limit to get all entries
      };
      const response = await api.get('/timetables', { params });
      const data = response.data.data || { timetables: [], pagination: { total: 0, page: 1, limit: 1000, pages: 0 } };
      
      // Debug: Log the response to see what we're getting
      console.log('API Request - class_id:', selectedClassId);
      console.log('API Request - params:', params);
      if (data.timetables && data.timetables.length > 0) {
        console.log('API Response - Total timetables:', data.timetables.length);
        console.log('API Response - First 3 timetables:', data.timetables.slice(0, 3).map(t => ({
          id: t.id,
          class_id: t.class_id,
          day_of_week: t.day_of_week,
          subject: t.subject?.name,
          start_time: t.start_time
        })));
        
        // Log unique day_of_week values
        const uniqueDays = [...new Set(data.timetables.map(t => t.day_of_week))];
        console.log('API Response - Unique day_of_week values:', uniqueDays);
        
        // Log unique class_ids to verify filtering
        const uniqueClassIds = [...new Set(data.timetables.map(t => t.class_id))];
        console.log('API Response - Unique class_ids:', uniqueClassIds);
      } else {
        console.log('API Response - No timetables found for class_id:', selectedClassId);
      }
      
      return data;
    },
    {
      enabled: !!selectedClassId, // Only fetch when class is selected
      staleTime: 30000, // Cache for 30 seconds
      cacheTime: 300000, // Keep in cache for 5 minutes
    }
  );

  const timetables = timetablesData?.timetables || [];
  const pagination = timetablesData?.pagination || { total: 0, page: 1, limit: 1000, pages: 0 };
  
  // Debug: Log all unique day_of_week values from current timetables
  if (timetables.length > 0) {
    const uniqueDays = [...new Set(timetables.map(t => t.day_of_week))];
    console.log('Current timetables - Unique day_of_week values:', uniqueDays);
    console.log('Total timetables:', timetables.length);
    console.log('Sample entries:', timetables.slice(0, 5).map(t => ({
      id: t.id,
      day_of_week: t.day_of_week,
      subject: t.subject?.name
    })));
  }

  // Only load classes - needed for filter dropdown
  const { data: classes } = useQuery(
    'classes',
    async () => {
      const response = await api.get('/classes');
      return response.data.data || [];
    },
    {
      staleTime: 300000, // Cache for 5 minutes (classes don't change often)
      cacheTime: 600000, // Keep in cache for 10 minutes
      select: (data) => data.map(cls => ({ id: cls.id, name: cls.name, section: cls.section })) // Only keep needed fields
    }
  );

  // Lazy load subjects and teachers only when dialog is open
  const { data: subjects } = useQuery(
    'subjects',
    async () => {
      const response = await api.get('/subjects');
      return response.data.data || [];
    },
    {
      enabled: open, // Only fetch when dialog is open
      staleTime: 300000,
      cacheTime: 600000,
      select: (data) => data.map(sub => ({ id: sub.id, name: sub.name, code: sub.code }))
    }
  );

  const { data: teachers } = useQuery(
    'teachers',
    async () => {
      const response = await api.get('/teachers');
      return response.data.data?.teachers || [];
    },
    {
      enabled: open, // Only fetch when dialog is open
      staleTime: 300000,
      cacheTime: 600000,
      select: (data) => data.map(teacher => ({ 
        id: teacher.id, 
        first_name: teacher.first_name, 
        last_name: teacher.last_name 
      }))
    }
  );

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/timetables', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('timetables');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Failed to create timetable entry');
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/timetables/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('timetables');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Failed to update timetable entry');
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/timetables/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('timetables');
        // If current page becomes empty after deletion, go to previous page
        if (timetables.length === 1 && page > 1) {
          setPage(page - 1);
        }
      },
    }
  );

  const handleOpen = (timetable = null) => {
    setSelectedTimetable(timetable);
    setError('');
    if (timetable) {
      setFormData({
        class_id: timetable.class_id || '',
        subject_id: timetable.subject_id || '',
        teacher_id: timetable.teacher_id || '',
        day_of_week: timetable.day_of_week || 'monday',
        start_time: timetable.start_time || '',
        end_time: timetable.end_time || '',
        room: timetable.room || '',
      });
    } else {
      setFormData({
        class_id: selectedClassId || '',
        subject_id: '',
        teacher_id: '',
        day_of_week: 'monday',
        start_time: '',
        end_time: '',
        room: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTimetable(null);
    setError('');
  };

  // Handle class filter change
  const handleClassChange = (event) => {
    const classId = typeof event === 'string' ? event : event.target.value;
    console.log('Class changed to:', classId);
    setSelectedClassId(classId);
    setSelectedDay('monday'); // Reset to Monday when changing class
    
    // Debug: Log when class filter changes
    if (classId) {
      console.log('Filtering timetables for class_id:', classId);
    } else {
      console.log('No class selected - showing empty state');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const submitData = {
      ...formData,
      room: formData.room || null,
    };

    if (selectedTimetable) {
      updateMutation.mutate({ id: selectedTimetable.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      deleteMutation.mutate(id);
    }
  };


  // Memoize grouped timetables to avoid recalculating on every render
  const groupedByDay = useMemo(() => {
    if (!timetables || timetables.length === 0) {
      return daysOfWeek.reduce((acc, day) => {
        acc[day] = [];
        return acc;
      }, {});
    }
    
    // Debug: Log first few entries to see what day_of_week values we're getting
    if (timetables.length > 0) {
      console.log('Sample timetable entries:', timetables.slice(0, 3).map(t => ({
        id: t.id,
        day_of_week: t.day_of_week,
        day_type: typeof t.day_of_week
      })));
    }
    
    return daysOfWeek.reduce((acc, day) => {
      acc[day] = (timetables || [])
        .filter((t) => {
          // Handle case-insensitive comparison and normalize the value
          const timetableDay = t.day_of_week?.toLowerCase()?.trim();
          const targetDay = day.toLowerCase()?.trim();
          return timetableDay === targetDay;
        })
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      return acc;
    }, {});
  }, [timetables]);

  // Get timetables for selected day
  const selectedDayTimetables = groupedByDay[selectedDay] || [];

  // Format time for display (HH:MM:SS -> HH:MM)
  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  return (
    <Layout>
      {/* Header Section */}
      <Box 
        sx={{ 
          mb: 4,
          pb: 3,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <ScheduleIcon color="primary" />
              {t('timetables.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('timetables.subtitle') || 'Manage and view class schedules'}
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 220,
                backgroundColor: 'background.paper',
                borderRadius: 1
              }}
            >
              <InputLabel>{t('timetables.filterByClass')}</InputLabel>
              <Select
                value={selectedClassId}
                onChange={handleClassChange}
                label={t('timetables.filterByClass')}
              >
                <MenuItem value="">{t('timetables.allClasses')}</MenuItem>
                {classes?.map((classItem) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.name} {classItem.section ? `- ${classItem.section}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              disabled={!selectedClassId}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 2
              }}
            >
              {t('timetables.addEntry')}
            </Button>
            <Box display="flex" gap={0.5} sx={{ ml: 1 }}>
              <IconButton
                size="small"
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
                sx={{
                  border: viewMode === 'grid' ? '2px solid' : '1px solid',
                  borderColor: viewMode === 'grid' ? 'primary.main' : 'divider'
                }}
              >
                <ViewModuleIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
                sx={{
                  border: viewMode === 'list' ? '2px solid' : '1px solid',
                  borderColor: viewMode === 'list' ? 'primary.main' : 'divider'
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>

      {!selectedClassId ? (
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            background: isDark 
              ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 3
          }}
        >
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {t('timetables.selectClassToView')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('timetables.selectClassDescription') || 'Please select a class from the dropdown above to view its timetable'}
          </Typography>
        </Paper>
      ) : isLoading ? (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" p={8}>
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            {t('common.loading')}...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Day Tabs */}
          <Paper 
            elevation={0}
            sx={{ 
              mb: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper'
            }}
          >
            <Tabs
              value={selectedDay}
              onChange={(e, newValue) => setSelectedDay(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: 64,
                  fontSize: '0.95rem'
                },
                '& .Mui-selected': {
                  fontWeight: 600,
                  color: 'primary.main'
                }
              }}
            >
              {daysOfWeek.map((day) => (
                <Tab
                  key={day}
                  label={
                    <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                      <Typography variant="body1" sx={{ fontWeight: 'inherit' }}>
                        {dayLabels[day]}
                      </Typography>
                      <Chip
                        label={groupedByDay[day]?.length || 0}
                        size="small"
                        color={selectedDay === day ? 'primary' : 'default'}
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  }
                  value={day}
                />
              ))}
            </Tabs>
          </Paper>

          {/* Day Summary */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              mb: 3,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {t('common.showing')} <strong>{selectedDayTimetables.length}</strong> {t('common.entries') || 'entries'} {t('common.for') || 'for'} <strong>{dayLabels[selectedDay]}</strong>
                {timetables.length > 0 && (
                  <> ({t('common.total')}: <strong>{timetables.length}</strong> {t('common.entries')})</>
                )}
              </Typography>
            </Box>
          </Paper>

          {/* Selected Day Content */}
          {viewMode === 'grid' ? (
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                transition: 'all 0.3s ease',
                borderTop: '4px solid',
                borderTopColor: 'primary.main'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  mb={3}
                  pb={2}
                  borderBottom="2px solid"
                  borderColor="divider"
                >
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      {dayLabels[selectedDay]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDayTimetables.length} {t('timetables.classesScheduled') || 'classes scheduled'}
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedDayTimetables.length}
                    color="primary"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1rem',
                      height: 32,
                      px: 2
                    }}
                  />
                </Box>
                {selectedDayTimetables.length === 0 ? (
                  <Box 
                    display="flex" 
                    flexDirection="column" 
                    alignItems="center" 
                    justifyContent="center"
                    py={8}
                  >
                    <ScheduleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {t('timetables.noClassesScheduled')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {t('timetables.noClassesForDay') || `No classes scheduled for ${dayLabels[selectedDay]}`}
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {selectedDayTimetables.map((timetable, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={timetable.id}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            backgroundColor: index % 2 === 0 
                              ? (isDark ? 'rgba(255, 255, 255, 0.03)' : 'grey.50')
                              : 'background.paper',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main',
                            transition: 'all 0.2s ease',
                            height: '100%',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                              borderColor: 'primary.main',
                              boxShadow: 2,
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Box display="flex" flexDirection="column" gap={1.5}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Box display="flex" alignItems="center" gap={1}>
                                <BookIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                                <Typography 
                                  variant="subtitle1" 
                                  fontWeight={600}
                                  sx={{ color: 'text.primary' }}
                                >
                                  {timetable.subject?.name || 'N/A'}
                                </Typography>
                              </Box>
                              <Box display="flex" gap={0.5}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpen(timetable)}
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: 'primary.light'
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(timetable.id)}
                                  sx={{ 
                                    color: 'error.main',
                                    '&:hover': {
                                      backgroundColor: 'error.light'
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            <Box display="flex" flexDirection="column" gap={1} pl={3}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  {formatTime(timetable.start_time)} - {formatTime(timetable.end_time)}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {timetable.teacher
                                    ? `${timetable.teacher.first_name} ${timetable.teacher.last_name}`
                                    : 'N/A'}
                                </Typography>
                              </Box>
                              {timetable.room && (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <RoomIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {timetable.room}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                borderTop: '4px solid',
                borderTopColor: 'primary.main'
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  p={3}
                  borderBottom="2px solid"
                  borderColor="divider"
                >
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      {dayLabels[selectedDay]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDayTimetables.length} {t('timetables.classesScheduled') || 'classes scheduled'}
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedDayTimetables.length}
                    color="primary"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1rem',
                      height: 32,
                      px: 2
                    }}
                  />
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 600, py: 2 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <AccessTimeIcon fontSize="small" color="primary" />
                            {t('timetables.time')}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <BookIcon fontSize="small" color="primary" />
                            {t('timetables.subject')}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon fontSize="small" color="primary" />
                            {t('timetables.teacher')}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <RoomIcon fontSize="small" color="primary" />
                            {t('timetables.room')}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">
                          {t('common.actions')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedDayTimetables.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                              <ScheduleIcon sx={{ fontSize: 64, color: 'text.disabled', opacity: 0.3 }} />
                              <Typography variant="h6" color="text.secondary">
                                {t('timetables.noClassesScheduled')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                {t('timetables.noClassesForDay') || `No classes scheduled for ${dayLabels[selectedDay]}`}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedDayTimetables.map((timetable, index) => (
                          <TableRow 
                            key={timetable.id}
                            sx={{
                              backgroundColor: index % 2 === 0 
                                ? 'background.paper' 
                                : (isDark ? 'rgba(255, 255, 255, 0.03)' : 'grey.50'),
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              },
                              transition: 'background-color 0.2s ease'
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formatTime(timetable.start_time)} - {formatTime(timetable.end_time)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {timetable.subject?.name || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {timetable.teacher
                                  ? `${timetable.teacher.first_name} ${timetable.teacher.last_name}`
                                  : 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {timetable.room ? (
                                <Chip 
                                  label={timetable.room} 
                                  size="small" 
                                  variant="outlined"
                                  icon={<RoomIcon fontSize="small" />}
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={0.5} justifyContent="center">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpen(timetable)}
                                  title={t('common.edit')}
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: 'primary.light'
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(timetable.id)}
                                  disabled={deleteMutation.isLoading}
                                  title={t('common.delete')}
                                  sx={{ 
                                    color: 'error.main',
                                    '&:hover': {
                                      backgroundColor: 'error.light'
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTimetable ? t('timetables.editEntry') : t('timetables.addNewEntry')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('classes.title')}</InputLabel>
                  <Select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    label={t('classes.title')}
                    disabled={!!selectedTimetable}
                  >
                    {classes?.map((classItem) => (
                      <MenuItem key={classItem.id} value={classItem.id}>
                        {classItem.name} {classItem.section ? `- ${classItem.section}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('timetables.subject')}</InputLabel>
                  <Select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleChange}
                    label={t('timetables.subject')}
                  >
                    {subjects?.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name} {subject.code ? `(${subject.code})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('timetables.teacher')}</InputLabel>
                  <Select
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleChange}
                    label={t('timetables.teacher')}
                  >
                    {teachers?.map((teacher) => (
                      <MenuItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('timetables.dayOfWeek')}</InputLabel>
                  <Select
                    name="day_of_week"
                    value={formData.day_of_week}
                    onChange={handleChange}
                    label={t('timetables.dayOfWeek')}
                  >
                    {daysOfWeek.map((day) => (
                      <MenuItem key={day} value={day}>
                        {dayLabels[day]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required
                  label={t('timetables.startTime')}
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required
                  label={t('timetables.endTime')}
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('timetables.room')}
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  placeholder="e.g., Room 101"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={createMutation.isLoading || updateMutation.isLoading}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {(createMutation.isLoading || updateMutation.isLoading) ? (
                <CircularProgress size={24} />
              ) : (
                t('common.save')
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Layout>
  );
};

export default Timetables;

