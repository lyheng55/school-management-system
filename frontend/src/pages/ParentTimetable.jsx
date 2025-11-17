import { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';

const ParentTimetable = () => {
  const { t } = useTranslation();
  const { childId } = useParams();
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(childId);

  const { data: children } = useQuery('parentChildren', async () => {
    const response = await api.get('/parents/children');
    return response.data.data || [];
  });

  const { data: timetable, isLoading } = useQuery(
    ['childTimetable', selectedChild],
    async () => {
      if (!selectedChild) return [];
      const response = await api.get(`/parents/children/${selectedChild}/timetable`);
      return response.data.data || [];
    },
    { enabled: !!selectedChild }
  );

  const getStudentName = (student) => {
    return `${student.first_name} ${student.last_name}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayOrder = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };

  const groupedTimetable = timetable?.reduce((acc, entry) => {
    const day = entry.day_of_week?.toLowerCase();
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(entry);
    return acc;
  }, {}) || {};

  // Sort entries within each day by start time
  Object.keys(groupedTimetable).forEach((day) => {
    groupedTimetable[day].sort((a, b) => {
      if (a.start_time && b.start_time) {
        return a.start_time.localeCompare(b.start_time);
      }
      return 0;
    });
  });

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {t('parentTimetable.title')}
        </Typography>

        {children && children.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>{t('parentTimetable.selectChild')}</InputLabel>
              <Select
                value={selectedChild || ''}
                onChange={(e) => {
                  setSelectedChild(e.target.value);
                  navigate(`/parent/timetable/${e.target.value}`);
                }}
              >
                {children.map((child) => (
                  <MenuItem key={child.id} value={child.id}>
                    {getStudentName(child)} {child.class && `- ${child.class.name}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !selectedChild ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('parentTimetable.selectChildFirst')}</Typography>
          </Paper>
        ) : !timetable || timetable.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('parentTimetable.noTimetable')}</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {daysOfWeek.map((day) => {
              const entries = groupedTimetable[day] || [];
              return (
                <Grid item xs={12} md={6} lg={4} key={day}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        {t(`timetables.${day}`)}
                      </Typography>
                      {entries.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          {t('timetables.noClassesScheduled')}
                        </Typography>
                      ) : (
                        <Box>
                          {entries.map((entry, index) => (
                            <Box
                              key={entry.id}
                              sx={{
                                mb: index < entries.length - 1 ? 2 : 0,
                                pb: index < entries.length - 1 ? 2 : 0,
                                borderBottom: index < entries.length - 1 ? '1px solid' : 'none',
                                borderColor: 'divider',
                              }}
                            >
                              <Typography variant="subtitle2" fontWeight="bold">
                                {entry.subject?.name || '-'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                              </Typography>
                              {entry.teacher && (
                                <Typography variant="caption" color="text.secondary">
                                  {t('timetables.teacher')}: {entry.teacher.user?.username || '-'}
                                </Typography>
                              )}
                              {entry.room && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {t('timetables.room')}: {entry.room}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Layout>
  );
};

export default ParentTimetable;

