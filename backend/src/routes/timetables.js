const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, timetableController.getAllTimetables);
router.get('/class/:class_id', authenticate, timetableController.getTimetableByClass);
router.get('/:id', authenticate, timetableController.getTimetableById);
router.post('/', authenticate, authorize('admin', 'teacher'), timetableController.createTimetable);
router.put('/:id', authenticate, authorize('admin', 'teacher'), timetableController.updateTimetable);
router.delete('/:id', authenticate, authorize('admin'), timetableController.deleteTimetable);

module.exports = router;

