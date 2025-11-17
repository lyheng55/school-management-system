const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, maintenanceController.getAllMaintenances);
router.get('/upcoming', authenticate, maintenanceController.getUpcomingMaintenances);
router.get('/:id', authenticate, maintenanceController.getMaintenanceById);
router.post('/', authenticate, authorize('admin', 'teacher'), maintenanceController.createMaintenance);
router.put('/:id', authenticate, authorize('admin', 'teacher'), maintenanceController.updateMaintenance);
router.delete('/:id', authenticate, authorize('admin'), maintenanceController.deleteMaintenance);

module.exports = router;

