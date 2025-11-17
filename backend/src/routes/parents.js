const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication and parent role
router.get('/dashboard', authenticate, authorize('parent'), parentController.getDashboard);
router.get('/profile', authenticate, authorize('parent'), parentController.getProfile);
router.put('/profile', authenticate, authorize('parent'), parentController.updateProfile);
router.get('/children', authenticate, authorize('parent'), parentController.getMyChildren);
router.get('/children/:childId/grades', authenticate, authorize('parent'), parentController.getChildGrades);
router.get('/children/:childId/attendance', authenticate, authorize('parent'), parentController.getChildAttendance);
router.get('/children/:childId/fees', authenticate, authorize('parent'), parentController.getChildFees);
router.get('/children/:childId/timetable', authenticate, authorize('parent'), parentController.getChildTimetable);
router.get('/children/:childId/exams', authenticate, authorize('parent'), parentController.getChildExams);

module.exports = router;

