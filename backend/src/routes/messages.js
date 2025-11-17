const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.get('/inbox', authenticate, messageController.getInbox);
router.get('/sent', authenticate, messageController.getSent);
router.get('/users', authenticate, messageController.getUsersForMessaging);
router.get('/:id', authenticate, messageController.getMessageById);
router.post('/', authenticate, messageController.sendMessage);
router.put('/:id/read', authenticate, messageController.markAsRead);
router.put('/read-all', authenticate, messageController.markAllAsRead);
router.delete('/:id', authenticate, messageController.deleteMessage);

module.exports = router;

