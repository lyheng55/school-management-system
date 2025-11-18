const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, paymentController.getAllPayments);
router.get('/fee/:fee_id', authenticate, paymentController.getFeePayments);
router.get('/student/:student_id', authenticate, paymentController.getStudentPayments);
router.get('/:id', authenticate, paymentController.getPaymentById);
router.get('/:id/receipt', authenticate, paymentController.generateReceipt);
router.post('/', authenticate, authorize('admin', 'teacher'), paymentController.createPayment);
router.put('/:id', authenticate, authorize('admin', 'teacher'), paymentController.updatePayment);
router.delete('/:id', authenticate, authorize('admin'), paymentController.deletePayment);

module.exports = router;

