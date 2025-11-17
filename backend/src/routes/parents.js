const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { authenticate, authorize } = require('../middleware/auth');

// Parent-specific routes (require parent role) - MUST come before /:id route
router.get('/dashboard', authenticate, authorize('parent'), parentController.getDashboard);
router.get('/profile', authenticate, authorize('parent'), parentController.getProfile);
router.put('/profile', authenticate, authorize('parent'), parentController.updateProfile);
router.get('/children', authenticate, authorize('parent'), parentController.getMyChildren);
router.get('/children/:childId/grades', authenticate, authorize('parent'), parentController.getChildGrades);
router.get('/children/:childId/attendance', authenticate, authorize('parent'), parentController.getChildAttendance);
router.get('/children/:childId/fees', authenticate, authorize('parent'), parentController.getChildFees);
router.get('/children/:childId/timetable', authenticate, authorize('parent'), parentController.getChildTimetable);
router.get('/children/:childId/exams', authenticate, authorize('parent'), parentController.getChildExams);

// Admin/Teacher CRUD routes - MUST come after specific routes
router.get('/', authenticate, authorize(['admin', 'teacher']), parentController.getAllParents);
router.post('/', authenticate, authorize(['admin', 'teacher']), parentController.createParent);
router.get('/:id', authenticate, authorize(['admin', 'teacher']), parentController.getParentById);
router.put('/:id', authenticate, authorize(['admin', 'teacher']), parentController.updateParent);
router.delete('/:id', authenticate, authorize(['admin', 'teacher']), parentController.deleteParent);

module.exports = router;

