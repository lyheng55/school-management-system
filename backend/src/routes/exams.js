const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, examController.getAllExams);
router.get('/class/:class_id', authenticate, examController.getExamsByClass);
router.get('/:id', authenticate, examController.getExamById);
router.post('/', authenticate, authorize('admin', 'teacher'), examController.createExam);
router.put('/:id', authenticate, authorize('admin', 'teacher'), examController.updateExam);
router.delete('/:id', authenticate, authorize('admin'), examController.deleteExam);

module.exports = router;

