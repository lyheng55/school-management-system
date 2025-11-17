const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, feeController.getAllFees);
router.get('/summary', authenticate, feeController.getFeeSummary);
router.get('/student/:student_id', authenticate, feeController.getStudentFees);
router.get('/:id', authenticate, feeController.getFeeById);
router.post('/', authenticate, authorize('admin', 'teacher'), feeController.createFee);
router.post('/bulk', authenticate, authorize('admin', 'teacher'), feeController.bulkCreateFees);
router.put('/:id', authenticate, authorize('admin', 'teacher'), feeController.updateFee);
router.delete('/:id', authenticate, authorize('admin'), feeController.deleteFee);

module.exports = router;

