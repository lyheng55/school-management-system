const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, eventController.getAllEvents);
router.get('/:id', authenticate, eventController.getEventById);
router.post('/', authenticate, authorize('admin', 'teacher'), eventController.createEvent);
router.put('/:id', authenticate, eventController.updateEvent);
router.put('/:id/toggle-active', authenticate, authorize('admin', 'teacher'), eventController.toggleActive);
router.delete('/:id', authenticate, eventController.deleteEvent);

module.exports = router;

