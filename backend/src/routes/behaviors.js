const express = require('express');
const router = express.Router();
const behaviorController = require('../controllers/behaviorController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, behaviorController.getAllBehaviors);
router.get('/student/:student_id', authenticate, behaviorController.getStudentBehaviors);
router.get('/:id', authenticate, behaviorController.getBehaviorById);
router.post('/', authenticate, authorize('admin', 'teacher'), behaviorController.createBehavior);
router.put('/:id', authenticate, authorize('admin', 'teacher'), behaviorController.updateBehavior);
router.delete('/:id', authenticate, authorize('admin'), behaviorController.deleteBehavior);

module.exports = router;

