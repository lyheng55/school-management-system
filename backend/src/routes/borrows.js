const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, borrowController.getAllBorrows);
router.get('/overdue', authenticate, borrowController.getOverdueBorrows);
router.get('/:id', authenticate, borrowController.getBorrowById);
router.post('/', authenticate, authorize('admin', 'teacher'), borrowController.createBorrow);
router.put('/:id', authenticate, authorize('admin', 'teacher'), borrowController.updateBorrow);
router.put('/:id/return', authenticate, authorize('admin', 'teacher'), borrowController.returnBook);
router.delete('/:id', authenticate, authorize('admin'), borrowController.deleteBorrow);

module.exports = router;

