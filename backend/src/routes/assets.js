const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.get('/', authenticate, assetController.getAllAssets);
router.get('/stats', authenticate, assetController.getAssetStats);
router.get('/needing-maintenance', authenticate, assetController.getAssetsNeedingMaintenance);
router.get('/:id', authenticate, assetController.getAssetById);
router.post('/', authenticate, authorize('admin', 'teacher'), assetController.createAsset);
router.put('/:id', authenticate, authorize('admin', 'teacher'), assetController.updateAsset);
router.delete('/:id', authenticate, authorize('admin'), assetController.deleteAsset);

module.exports = router;

