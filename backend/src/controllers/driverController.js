const { Driver, Vehicle, Route } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const driverSchema = Joi.object({
  first_name: Joi.string().max(100).required(),
  last_name: Joi.string().max(100).required(),
  phone: Joi.string().max(20).required(),
  license_number: Joi.string().max(50).required(),
  license_expiry: Joi.date().optional().allow(null),
  address: Joi.string().optional().allow('', null),
  joining_date: Joi.date().optional().allow(null),
  status: Joi.string().valid('active', 'inactive').optional()
});

// Create driver
exports.createDriver = async (req, res) => {
  try {
    const { error, value } = driverSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const driver = await Driver.create(value);

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    console.error('Create driver error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'License number already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating driver',
      error: error.message
    });
  }
};

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { license_number: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Driver.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['first_name', 'ASC'], ['last_name', 'ASC']],
          include: [
            {
              model: Vehicle,
              as: 'vehicles',
              required: false,
              attributes: ['id', 'vehicle_number', 'vehicle_type', 'status'],
              include: [
                {
                  model: Route,
                  as: 'route',
                  required: false,
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
    });

    res.json({
      success: true,
      data: {
        drivers: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers',
      error: error.message
    });
  }
};

// Get driver by ID
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id, {
      include: [
        {
          model: Vehicle,
          as: 'vehicles',
          required: false,
          include: [
            {
              model: require('../models').Route,
              as: 'route',
              required: false
            }
          ]
        }
      ]
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching driver',
      error: error.message
    });
  }
};

// Update driver
exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    const { error, value } = driverSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await driver.update(value);

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Update driver error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'License number already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating driver',
      error: error.message
    });
  }
};

// Delete driver
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Check if driver has vehicles assigned
    const vehicleCount = await Vehicle.count({
      where: { driver_id: driver.id }
    });

    if (vehicleCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete driver with assigned vehicles'
      });
    }

    await driver.destroy();

    res.json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting driver',
      error: error.message
    });
  }
};

// Get drivers with expiring licenses
exports.getDriversWithExpiringLicenses = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const drivers = await Driver.findAll({
      where: {
        license_expiry: {
          [Op.lte]: expiryDate,
          [Op.gte]: new Date()
        },
        status: 'active'
      },
      order: [['license_expiry', 'ASC']]
    });

    res.json({
      success: true,
      data: drivers
    });
  } catch (error) {
    console.error('Get expiring licenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers with expiring licenses',
      error: error.message
    });
  }
};

