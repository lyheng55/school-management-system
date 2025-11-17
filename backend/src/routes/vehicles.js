const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, vehicleController.getAllVehicles);
router.get('/:id', authenticate, vehicleController.getVehicleById);
router.post('/', authenticate, authorize('admin', 'teacher'), vehicleController.createVehicle);
router.put('/:id', authenticate, authorize('admin', 'teacher'), vehicleController.updateVehicle);
router.delete('/:id', authenticate, authorize('admin'), vehicleController.deleteVehicle);

module.exports = router;

