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
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Layout from '../components/Layout';
import api from '../services/api';

const Grades = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [filterClass, setFilterClass] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [formTab, setFormTab] = useState(0);
  const [formData, setFormData] = useState({
    student_id: '',
    exam_id: '',
    subject_id: '',
    marks_obtained: '',
    grade: '',
    remarks: '',
  });
  const [bulkFormData, setBulkFormData] = useState({
    exam_id: '',
    subject_id: '',
    class_id: '',
  });
  const [bulkGrades, setBulkGrades] = useState([]);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ['grades', page, filterClass, filterExam],
    async () => {
      const params = { page, limit: 10 };
      if (filterClass) params.class_id = filterClass;
      if (filterExam) params.exam_id = filterExam;
      const response = await api.get('/grades', { params });
      return response.data.data;
    }
  );

  const { data: classes } = useQuery('classes', async () => {
    const response = await api.get('/classes');
    return response.data.data;
  });

  const { data: exams } = useQuery('exams', async () => {
    const response = await api.get('/exams');
    return response.data.data?.exams || [];
  });

  const { data: subjects } = useQuery('subjects', async () => {
    try {
      const response = await api.get('/subjects');
      return response.data.data || [];
    } catch {
      return [];
    }
  });

  const { data: students } = useQuery(
    ['students', bulkFormData.class_id],
    async () => {
      if (!bulkFormData.class_id) return [];
      const params = { class_id: bulkFormData.class_id, limit: 1000 };
      const response = await api.get('/students', { params });
      return response.data.data?.students || [];
    },
    { enabled: !!bulkFormData.class_id }
  );

  const { data: allStudents } = useQuery(
    'allStudents',
    async () => {
      const params = { limit: 1000 };
      const response = await api.get('/students', { params });
      return response.data.data?.students || [];
    }
  );

  const createMutation = useMutation(
    async (data) => {
      const response = await api.post('/grades', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('grades');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('grades.failedToCreate'));
      },
    }
  );

  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await api.put(`/grades/${id}`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('grades');
        handleClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || t('grades.failedToUpdate'));
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/grades/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('grades');
      },
    }
  );

  const bulkCreateMutation = useMutation(
    async (data) => {
      const response = await api.post('/grades/bulk', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('grades');
        handleBulkClose();
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'Failed to create bulk grades');
      },
    }
  );

  const handleOpen = (grade = null) => {
    setSelectedGrade(grade);
    setError('');
    setFormTab(0);
    if (grade) {
      setFormData({
        student_id: grade.student_id || '',
        exam_id: grade.exam_id || '',
        subject_id: grade.subject_id || '',
        marks_obtained: grade.marks_obtained || '',
        grade: grade.grade || '',
        remarks: grade.remarks || '',
      });
    } else {
      setFormData({
        student_id: '',
        exam_id: '',
        subject_id: '',
        marks_obtained: '',
        grade: '',
        remarks: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedGrade(null);
    setError('');
    setFormData({
      student_id: '',
      exam_id: '',
      subject_id: '',
      marks_obtained: '',
      grade: '',
      remarks: '',
    });
  };

  const handleBulkOpen = () => {
    setOpenBulk(true);
    setError('');
    setBulkFormData({
      exam_id: '',
      subject_id: '',
      class_id: '',
    });
    setBulkGrades([]);
  };

  const handleBulkClose = () => {
    setOpenBulk(false);
    setError('');
    setBulkFormData({
      exam_id: '',
      subject_id: '',
      class_id: '',
    });
    setBulkGrades([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBulkFormChange = (e) => {
    const { name, value } = e.target;
    setBulkFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'class_id' || name === 'exam_id' || name === 'subject_id') {
      setBulkGrades([]);
    }
  };

  const handleBulkGradeChange = (studentId, field, value) => {
    setBulkGrades((prev) => {
      const existing = prev.find((g) => g.student_id === studentId);
      if (existing) {
        return prev.map((g) =>
          g.student_id === studentId ? { ...g, [field]: value } : g
        );
      } else {
        return [
          ...prev,
          {
            student_id: studentId,
            exam_id: bulkFormData.exam_id,
            subject_id: bulkFormData.subject_id,
            [field]: value,
          },
        ];
      }
    });
  };

  const loadBulkStudents = () => {
    if (!bulkFormData.class_id || !bulkFormData.exam_id || !bulkFormData.subject_id) {
      setError(t('grades.selectClassExamSubject'));
      return;
    }
    const initialGrades = students?.map((student) => ({
      student_id: student.id,
      exam_id: parseInt(bulkFormData.exam_id),
      subject_id: parseInt(bulkFormData.subject_id),
      marks_obtained: '',
      remarks: '',
    })) || [];
    setBulkGrades(initialGrades);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const submitData = {
      ...formData,
      student_id: parseInt(formData.student_id),
      exam_id: parseInt(formData.exam_id),
      subject_id: parseInt(formData.subject_id),
      marks_obtained: parseFloat(formData.marks_obtained),
      grade: formData.grade || null,
      remarks: formData.remarks || null,
    };

    if (selectedGrade) {
      updateMutation.mutate({ id: selectedGrade.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const gradesToSubmit = bulkGrades
      .filter((g) => g.marks_obtained && g.marks_obtained !== '')
      .map((g) => ({
        student_id: g.student_id,
        exam_id: parseInt(g.exam_id),
        subject_id: parseInt(g.subject_id),
        marks_obtained: parseFloat(g.marks_obtained),
        remarks: g.remarks || null,
      }));

    if (gradesToSubmit.length === 0) {
      setError(t('grades.enterAtLeastOneGrade'));
      return;
    }

    bulkCreateMutation.mutate({ grades: gradesToSubmit });
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'default';
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'info';
    if (grade.startsWith('C')) return 'warning';
    return 'error';
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('grades.title')}</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={handleBulkOpen}
          >
            {t('grades.bulkEntry')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('grades.addGrade')}
          </Button>
        </Box>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('common.filter')}</InputLabel>
          <Select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            label={t('common.filter')}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            {classes?.map((classItem) => (
              <MenuItem key={classItem.id} value={classItem.id}>
                {classItem.name} {classItem.section && `- ${classItem.section}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('common.filter')}</InputLabel>
          <Select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            label={t('common.filter')}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            {exams?.map((exam) => (
              <MenuItem key={exam.id} value={exam.id}>
                {exam.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('grades.student')}</TableCell>
              <TableCell>{t('students.class')}</TableCell>
              <TableCell>{t('grades.exam')}</TableCell>
              <TableCell>{t('exams.subject')}</TableCell>
              <TableCell>{t('grades.marksObtained')}</TableCell>
              <TableCell>{t('grades.grade')}</TableCell>
              <TableCell>{t('grades.remarks')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : data?.grades?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              data?.grades?.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell>
                    {grade.student?.first_name} {grade.student?.last_name}
                  </TableCell>
                  <TableCell>{grade.student?.class?.name || t('common.none')}</TableCell>
                  <TableCell>{grade.exam?.name || t('common.none')}</TableCell>
                  <TableCell>{grade.subject?.name || t('common.none')}</TableCell>
                  <TableCell>{grade.marks_obtained}</TableCell>
                  <TableCell>
                    <Chip
                      label={grade.grade || t('common.none')}
                      color={getGradeColor(grade.grade)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{grade.remarks || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/grades/${grade.id}`)}
                      title={t('common.view')}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(grade)}
                      title={t('common.edit')}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(grade.id)}
                      disabled={deleteMutation.isLoading}
                      title={t('common.delete')}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGrade ? t('grades.editGrade') : t('grades.addGrade')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('grades.student')}</InputLabel>
                  <Select
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    label={t('grades.student')}
                    disabled={!!selectedGrade}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {allStudents?.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} {student.class && `(${student.class.name})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('grades.exam')}</InputLabel>
                  <Select
                    name="exam_id"
                    value={formData.exam_id}
                    onChange={handleChange}
                    label={t('grades.exam')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {exams?.map((exam) => (
                      <MenuItem key={exam.id} value={exam.id}>
                        {exam.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('exams.subject')}</InputLabel>
                  <Select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleChange}
                    label={t('exams.subject')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {subjects?.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('grades.marksObtained')}
                  name="marks_obtained"
                  type="number"
                  value={formData.marks_obtained}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('grades.grade')}
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('grades.remarks')}
                  name="remarks"
                  multiline
                  rows={2}
                  value={formData.remarks}
                  onChange={handleChange}
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

      <Dialog open={openBulk} onClose={handleBulkClose} maxWidth="lg" fullWidth>
        <DialogTitle>{t('grades.bulkEntry')}</DialogTitle>
        <form onSubmit={handleBulkSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>{t('students.class')}</InputLabel>
                  <Select
                    name="class_id"
                    value={bulkFormData.class_id}
                    onChange={handleBulkFormChange}
                    label={t('students.class')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {classes?.map((classItem) => (
                      <MenuItem key={classItem.id} value={classItem.id}>
                        {classItem.name} {classItem.section && `- ${classItem.section}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>{t('grades.exam')}</InputLabel>
                  <Select
                    name="exam_id"
                    value={bulkFormData.exam_id}
                    onChange={handleBulkFormChange}
                    label={t('grades.exam')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {exams?.map((exam) => (
                      <MenuItem key={exam.id} value={exam.id}>
                        {exam.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <InputLabel>{t('exams.subject')}</InputLabel>
                  <Select
                    name="subject_id"
                    value={bulkFormData.subject_id}
                    onChange={handleBulkFormChange}
                    label={t('exams.subject')}
                  >
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {subjects?.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={loadBulkStudents}
                  disabled={!bulkFormData.class_id || !bulkFormData.exam_id || !bulkFormData.subject_id}
                >
                  {t('grades.loadStudents')}
                </Button>
              </Grid>
              {bulkGrades.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('grades.enterGradesFor')} {bulkGrades.length} {t('common.students')}
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('grades.student')}</TableCell>
                          <TableCell>{t('grades.marksObtained')}</TableCell>
                          <TableCell>{t('grades.remarks')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bulkGrades.map((grade, index) => {
                          const student = students?.find((s) => s.id === grade.student_id);
                          return (
                            <TableRow key={grade.student_id}>
                              <TableCell>
                                {student ? `${student.first_name} ${student.last_name}` : `${t('grades.student')} ${index + 1}`}
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={grade.marks_obtained || ''}
                                  onChange={(e) =>
                                    handleBulkGradeChange(grade.student_id, 'marks_obtained', e.target.value)
                                  }
                                  inputProps={{ min: 0, step: 0.01 }}
                                  sx={{ width: 120 }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={grade.remarks || ''}
                                  onChange={(e) =>
                                    handleBulkGradeChange(grade.student_id, 'remarks', e.target.value)
                                  }
                                  sx={{ width: 200 }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleBulkClose} disabled={bulkCreateMutation.isLoading}>
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={bulkCreateMutation.isLoading || bulkGrades.length === 0}
            >
              {bulkCreateMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                t('grades.saveAllGrades')
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Layout>
  );
};

export default Grades;

