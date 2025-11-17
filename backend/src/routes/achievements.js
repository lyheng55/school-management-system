const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, achievementController.getAllAchievements);
router.get('/student/:student_id', authenticate, achievementController.getStudentAchievements);
router.get('/:id', authenticate, achievementController.getAchievementById);
router.post('/', authenticate, authorize('admin', 'teacher'), achievementController.createAchievement);
router.put('/:id', authenticate, authorize('admin', 'teacher'), achievementController.updateAchievement);
router.delete('/:id', authenticate, authorize('admin'), achievementController.deleteAchievement);

module.exports = router;

