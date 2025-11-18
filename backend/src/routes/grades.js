const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, gradeController.getAllGrades);
router.get('/student/:student_id', authenticate, gradeController.getStudentGrades);
router.get('/student/:student_id/report-card', authenticate, gradeController.generateReportCard);
router.get('/:id', authenticate, gradeController.getGradeById);
router.post('/', authenticate, authorize('admin', 'teacher'), gradeController.createGrade);
router.post('/bulk', authenticate, authorize('admin', 'teacher'), gradeController.bulkCreateGrades);
router.put('/:id', authenticate, authorize('admin', 'teacher'), gradeController.updateGrade);
router.delete('/:id', authenticate, authorize('admin'), gradeController.deleteGrade);

module.exports = router;

