const { Maintenance, Asset, User } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const maintenanceSchema = Joi.object({
  asset_id: Joi.number().integer().required(),
  maintenance_type: Joi.string().valid('repair', 'service', 'inspection', 'upgrade', 'other').required(),
  description: Joi.string().required(),
  scheduled_date: Joi.date().optional().allow(null),
  completed_date: Joi.date().optional().allow(null),
  cost: Joi.number().positive().optional().allow(null),
  vendor: Joi.string().max(200).optional().allow('', null),
  status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'cancelled').optional()
});

// Create maintenance
exports.createMaintenance = async (req, res) => {
  try {
    const { error, value } = maintenanceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Validate asset exists
    const asset = await Asset.findByPk(value.asset_id);
    if (!asset) {
      return res.status(400).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Set created_by from authenticated user
    value.created_by = req.user.id;

    const maintenance = await Maintenance.create(value);

    // Update asset status if maintenance is in progress
    if (value.status === 'in_progress') {
      await asset.update({ status: 'maintenance' });
    }

    // Reload with associations
    await maintenance.reload({
      include: [
        { model: Asset, as: 'asset', required: false },
        { model: User, as: 'createdBy', required: false, attributes: ['id', 'username', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating maintenance record',
      error: error.message
    });
  }
};

// Get all maintenances
exports.getAllMaintenances = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, asset_id, maintenance_type, status, upcoming_only } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { description: { [Op.like]: `%${search}%` } },
        { vendor: { [Op.like]: `%${search}%` } }
      ];
    }

    if (asset_id) {
      where.asset_id = asset_id;
    }

    if (maintenance_type) {
      where.maintenance_type = maintenance_type;
    }

    if (status) {
      where.status = status;
    }

    if (upcoming_only === 'true') {
      where.scheduled_date = { [Op.gte]: new Date() };
      where.status = { [Op.in]: ['scheduled', 'in_progress'] };
    }

    const { count, rows } = await Maintenance.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['scheduled_date', 'DESC'], ['created_at', 'DESC']],
      include: [
        {
          model: Asset,
          as: 'asset',
          required: false,
          attributes: ['id', 'asset_code', 'name', 'category', 'status']
        },
        {
          model: User,
          as: 'createdBy',
          required: false,
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        maintenances: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get maintenances error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance records',
      error: error.message
    });
  }
};

// Get maintenance by ID
exports.getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          required: false
        },
        {
          model: User,
          as: 'createdBy',
          required: false,
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Get maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance record',
      error: error.message
    });
  }
};

// Update maintenance
exports.updateMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id);
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    const { error, value } = maintenanceSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    // Validate asset exists if asset_id is being changed
    if (value.asset_id && value.asset_id !== maintenance.asset_id) {
      const asset = await Asset.findByPk(value.asset_id);
      if (!asset) {
        return res.status(400).json({
          success: false,
          message: 'Asset not found'
        });
      }
    }

    const oldStatus = maintenance.status;
    await maintenance.update(value);

    // Update asset status based on maintenance status
    const asset = await Asset.findByPk(maintenance.asset_id);
    if (asset) {
      if (value.status === 'completed' && oldStatus !== 'completed') {
        // Check if asset has other active maintenances
        const activeMaintenances = await Maintenance.count({
          where: {
            asset_id: asset.id,
            id: { [Op.ne]: maintenance.id },
            status: { [Op.in]: ['scheduled', 'in_progress'] }
          }
        });
        
        if (activeMaintenances === 0) {
          // No other active maintenances, set asset back to available
          await asset.update({ status: 'available' });
        }
      } else if (value.status === 'in_progress' && oldStatus !== 'in_progress') {
        await asset.update({ status: 'maintenance' });
      } else if (value.status === 'cancelled' && oldStatus !== 'cancelled') {
        // Check if asset has other active maintenances
        const activeMaintenances = await Maintenance.count({
          where: {
            asset_id: asset.id,
            id: { [Op.ne]: maintenance.id },
            status: { [Op.in]: ['scheduled', 'in_progress'] }
          }
        });
        
        if (activeMaintenances === 0) {
          await asset.update({ status: 'available' });
        }
      }
    }

    // Reload with associations
    await maintenance.reload({
      include: [
        { model: Asset, as: 'asset', required: false },
        { model: User, as: 'createdBy', required: false, attributes: ['id', 'username', 'email'] }
      ]
    });

    res.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating maintenance record',
      error: error.message
    });
  }
};

// Delete maintenance
exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id);
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    const assetId = maintenance.asset_id;
    await maintenance.destroy();

    // Update asset status if no active maintenances remain
    const asset = await Asset.findByPk(assetId);
    if (asset) {
      const activeMaintenances = await Maintenance.count({
        where: {
          asset_id: assetId,
          status: { [Op.in]: ['scheduled', 'in_progress'] }
        }
      });

      if (activeMaintenances === 0 && asset.status === 'maintenance') {
        await asset.update({ status: 'available' });
      }
    }

    res.json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting maintenance record',
      error: error.message
    });
  }
};

// Get upcoming maintenances
exports.getUpcomingMaintenances = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const maintenances = await Maintenance.findAll({
      where: {
        scheduled_date: {
          [Op.between]: [new Date(), targetDate]
        },
        status: { [Op.in]: ['scheduled', 'in_progress'] }
      },
      include: [
        {
          model: Asset,
          as: 'asset',
          required: true,
          attributes: ['id', 'asset_code', 'name', 'category']
        }
      ],
      order: [['scheduled_date', 'ASC']]
    });

    res.json({
      success: true,
      data: maintenances
    });
  } catch (error) {
    console.error('Get upcoming maintenances error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming maintenances',
      error: error.message
    });
  }
};

