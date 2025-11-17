const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, bookController.getAllBooks);
router.get('/categories', authenticate, bookController.getCategories);
router.get('/:id', authenticate, bookController.getBookById);
router.post('/', authenticate, authorize('admin', 'teacher'), bookController.createBook);
router.put('/:id', authenticate, authorize('admin', 'teacher'), bookController.updateBook);
router.delete('/:id', authenticate, authorize('admin'), bookController.deleteBook);

module.exports = router;

