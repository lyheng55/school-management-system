const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, driverController.getAllDrivers);
router.get('/expiring-licenses', authenticate, driverController.getDriversWithExpiringLicenses);
router.get('/:id', authenticate, driverController.getDriverById);
router.post('/', authenticate, authorize('admin', 'teacher'), driverController.createDriver);
router.put('/:id', authenticate, authorize('admin', 'teacher'), driverController.updateDriver);
router.delete('/:id', authenticate, authorize('admin'), driverController.deleteDriver);

module.exports = router;

