const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, routeController.getAllRoutes);
router.get('/:id', authenticate, routeController.getRouteById);
router.get('/:id/stats', authenticate, routeController.getRouteStats);
router.post('/', authenticate, authorize('admin', 'teacher'), routeController.createRoute);
router.put('/:id', authenticate, authorize('admin', 'teacher'), routeController.updateRoute);
router.delete('/:id', authenticate, authorize('admin'), routeController.deleteRoute);

module.exports = router;

