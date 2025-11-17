const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, announcementController.getAllAnnouncements);
router.get('/:id', authenticate, announcementController.getAnnouncementById);
router.post('/', authenticate, authorize('admin', 'teacher'), announcementController.createAnnouncement);
router.put('/:id', authenticate, announcementController.updateAnnouncement);
router.put('/:id/toggle-active', authenticate, authorize('admin', 'teacher'), announcementController.toggleActive);
router.delete('/:id', authenticate, announcementController.deleteAnnouncement);

module.exports = router;

