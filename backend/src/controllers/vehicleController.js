const { Vehicle, Route, Driver, Student } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const vehicleSchema = Joi.object({
  vehicle_number: Joi.string().max(50).required(),
  vehicle_type: Joi.string().valid('bus', 'van', 'car', 'other').required(),
  capacity: Joi.number().integer().min(1).required(),
  route_id: Joi.number().integer().optional().allow(null),
  driver_id: Joi.number().integer().optional().allow(null),
  registration_date: Joi.date().optional().allow(null),
  insurance_expiry: Joi.date().optional().allow(null),
  status: Joi.string().valid('active', 'inactive', 'maintenance').optional()
});

// Create vehicle
exports.createVehicle = async (req, res) => {
  try {
    const { error, value } = vehicleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Validate route exists if provided
    if (value.route_id) {
      const route = await Route.findByPk(value.route_id);
      if (!route) {
        return res.status(400).json({
          success: false,
          message: 'Route not found'
        });
      }
    }

    // Validate driver exists if provided
    if (value.driver_id) {
      const driver = await Driver.findByPk(value.driver_id);
      if (!driver) {
        return res.status(400).json({
          success: false,
          message: 'Driver not found'
        });
      }
    }

    const vehicle = await Vehicle.create(value);

    // Load associations
    await vehicle.reload({
      include: [
        { model: Route, as: 'route', required: false },
        { model: Driver, as: 'driver', required: false }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating vehicle',
      error: error.message
    });
  }
};

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, vehicle_type, status, route_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { vehicle_number: { [Op.like]: `%${search}%` } }
      ];
    }

    if (vehicle_type) {
      where.vehicle_type = vehicle_type;
    }

    if (status) {
      where.status = status;
    }

    if (route_id) {
      where.route_id = route_id;
    }

    const { count, rows } = await Vehicle.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['vehicle_number', 'ASC']],
      include: [
        {
          model: Route,
          as: 'route',
          required: false,
          attributes: ['id', 'name', 'start_location', 'end_location']
        },
        {
          model: Driver,
          as: 'driver',
          required: false,
          attributes: ['id', 'first_name', 'last_name', 'phone', 'license_number']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        vehicles: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles',
      error: error.message
    });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        {
          model: Route,
          as: 'route',
          required: false
        },
        {
          model: Driver,
          as: 'driver',
          required: false
        }
      ]
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle',
      error: error.message
    });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const { error, value } = vehicleSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    // Validate route exists if provided
    if (value.route_id) {
      const route = await Route.findByPk(value.route_id);
      if (!route) {
        return res.status(400).json({
          success: false,
          message: 'Route not found'
        });
      }
    }

    // Validate driver exists if provided
    if (value.driver_id) {
      const driver = await Driver.findByPk(value.driver_id);
      if (!driver) {
        return res.status(400).json({
          success: false,
          message: 'Driver not found'
        });
      }
    }

    await vehicle.update(value);

    // Reload with associations
    await vehicle.reload({
      include: [
        { model: Route, as: 'route', required: false },
        { model: Driver, as: 'driver', required: false }
      ]
    });

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle',
      error: error.message
    });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    await vehicle.destroy();

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle',
      error: error.message
    });
  }
};

