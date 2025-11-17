const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('admin', 'teacher'), attendanceController.markAttendance);
router.post('/bulk', authenticate, authorize('admin', 'teacher'), attendanceController.bulkMarkAttendance);
router.get('/', authenticate, attendanceController.getAttendance);
router.get('/stats', authenticate, attendanceController.getStudentAttendanceStats);

module.exports = router;

