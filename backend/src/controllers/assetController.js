const { Asset, Maintenance, User } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

const assetSchema = Joi.object({
  asset_code: Joi.string().max(50).required(),
  name: Joi.string().max(200).required(),
  category: Joi.string().valid('lab_equipment', 'stationery', 'furniture', 'electronics', 'sports', 'other').required(),
  description: Joi.string().optional().allow('', null),
  quantity: Joi.number().integer().min(1).required(),
  location: Joi.string().max(200).optional().allow('', null),
  purchase_date: Joi.date().optional().allow(null),
  purchase_cost: Joi.number().positive().optional().allow(null),
  status: Joi.string().valid('available', 'in_use', 'maintenance', 'damaged', 'disposed').optional()
});

// Create asset
exports.createAsset = async (req, res) => {
  try {
    const { error, value } = assetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const asset = await Asset.create(value);

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: asset
    });
  } catch (error) {
    console.error('Create asset error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Asset code already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating asset',
      error: error.message
    });
  }
};

// Get all assets
exports.getAllAssets = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status, location } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { asset_code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }

    const { count, rows } = await Asset.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['asset_code', 'ASC']],
      include: [
        {
          model: Maintenance,
          as: 'maintenances',
          required: false,
          where: {
            status: { [Op.in]: ['scheduled', 'in_progress'] }
          },
          attributes: ['id', 'maintenance_type', 'status', 'scheduled_date']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        assets: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message
    });
  }
};

// Get asset by ID
exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        {
          model: Maintenance,
          as: 'maintenances',
          required: false,
          include: [
            {
              model: require('../models').User,
              as: 'createdBy',
              required: false,
              attributes: ['id', 'username', 'email']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching asset',
      error: error.message
    });
  }
};

// Update asset
exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const { error, value } = assetSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await asset.update(value);

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: asset
    });
  } catch (error) {
    console.error('Update asset error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Asset code already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating asset',
      error: error.message
    });
  }
};

// Delete asset
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if asset has active maintenances
    const activeMaintenances = await Maintenance.count({
      where: {
        asset_id: asset.id,
        status: { [Op.in]: ['scheduled', 'in_progress'] }
      }
    });

    if (activeMaintenances > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete asset with active maintenances'
      });
    }

    await asset.destroy();

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting asset',
      error: error.message
    });
  }
};

// Get asset statistics
exports.getAssetStats = async (req, res) => {
  try {
    const totalAssets = await Asset.count();
    const availableAssets = await Asset.count({ where: { status: 'available' } });
    const inUseAssets = await Asset.count({ where: { status: 'in_use' } });
    const maintenanceAssets = await Asset.count({ where: { status: 'maintenance' } });
    const damagedAssets = await Asset.count({ where: { status: 'damaged' } });
    
    const totalValue = await Asset.sum('purchase_cost', {
      where: {
        purchase_cost: { [Op.ne]: null }
      }
    });

    const categoryStats = await Asset.findAll({
      attributes: [
        'category',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['category']
    });

    res.json({
      success: true,
      data: {
        totalAssets,
        availableAssets,
        inUseAssets,
        maintenanceAssets,
        damagedAssets,
        totalValue: totalValue || 0,
        categoryStats: categoryStats.map(stat => ({
          category: stat.category,
          count: stat.get('count')
        }))
      }
    });
  } catch (error) {
    console.error('Get asset stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching asset statistics',
      error: error.message
    });
  }
};

// Get assets needing maintenance
exports.getAssetsNeedingMaintenance = async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: {
        status: { [Op.in]: ['maintenance', 'damaged'] }
      },
      include: [
        {
          model: Maintenance,
          as: 'maintenances',
          required: false,
          where: {
            status: { [Op.in]: ['scheduled', 'in_progress'] }
          },
          limit: 1,
          order: [['scheduled_date', 'DESC']]
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: assets
    });
  } catch (error) {
    console.error('Get assets needing maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assets needing maintenance',
      error: error.message
    });
  }
};

