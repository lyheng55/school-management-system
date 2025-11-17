const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All analytics routes require authentication
// Dashboard KPIs - accessible to all authenticated users
router.get('/dashboard/kpis', authenticate, analyticsController.getDashboardKPIs);

// Student Performance Analytics - accessible to admin and teachers
router.get('/students/performance', authenticate, authorize('admin', 'teacher'), analyticsController.getStudentPerformanceAnalytics);

// Staff Performance Reports - accessible to admin only
router.get('/staff/performance', authenticate, authorize('admin'), analyticsController.getStaffPerformanceReports);

// Finance Reports - accessible to admin only
router.get('/finance', authenticate, authorize('admin'), analyticsController.getFinanceReports);

// Attendance Analytics - accessible to admin and teachers
router.get('/attendance', authenticate, authorize('admin', 'teacher'), analyticsController.getAttendanceAnalytics);

// Export routes - accessible to admin and teachers
router.get('/export/pdf/:reportType', authenticate, authorize('admin', 'teacher'), analyticsController.exportPDFReport);
router.get('/export/excel/:reportType', authenticate, authorize('admin', 'teacher'), analyticsController.exportExcelReport);

module.exports = router;

