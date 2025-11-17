const { Route, Vehicle, Student, Class } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const routeSchema = Joi.object({
  name: Joi.string().max(100).required(),
  start_location: Joi.string().max(200).required(),
  end_location: Joi.string().max(200).required(),
  stops: Joi.array().items(Joi.string()).optional().allow(null),
  distance: Joi.number().positive().optional().allow(null),
  fare: Joi.number().positive().optional().allow(null),
  status: Joi.string().valid('active', 'inactive').optional()
});

// Create route
exports.createRoute = async (req, res) => {
  try {
    const { error, value } = routeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const route = await Route.create(value);

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route
    });
  } catch (error) {
    console.error('Create route error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Route name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating route',
      error: error.message
    });
  }
};

// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { start_location: { [Op.like]: `%${search}%` } },
        { end_location: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Route.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
      include: [
        {
          model: Vehicle,
          as: 'vehicles',
          required: false,
          attributes: ['id', 'vehicle_number', 'vehicle_type', 'status']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        routes: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching routes',
      error: error.message
    });
  }
};

// Get route by ID
exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id, {
      include: [
        {
          model: Vehicle,
          as: 'vehicles',
          required: false,
          include: [
            {
              model: require('../models').Driver,
              as: 'driver',
              required: false,
              attributes: ['id', 'first_name', 'last_name', 'phone', 'license_number']
            }
          ]
        },
        {
          model: Student,
          as: 'students',
          required: false,
          attributes: ['id', 'student_id', 'first_name', 'last_name', 'class_id'],
          include: [
            {
              model: Class,
              as: 'class',
              required: false,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching route',
      error: error.message
    });
  }
};

// Update route
exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const { error, value } = routeSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await route.update(value);

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: route
    });
  } catch (error) {
    console.error('Update route error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Route name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating route',
      error: error.message
    });
  }
};

// Delete route
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check if route has vehicles assigned
    const vehicleCount = await Vehicle.count({
      where: { route_id: route.id }
    });

    if (vehicleCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete route with assigned vehicles'
      });
    }

    // Check if route has students assigned
    const studentCount = await Student.count({
      where: { route_id: route.id }
    });

    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete route with assigned students'
      });
    }

    await route.destroy();

    res.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting route',
      error: error.message
    });
  }
};

// Get route statistics
exports.getRouteStats = async (req, res) => {
  try {
    const routeId = req.params.id;
    
    const vehicleCount = await Vehicle.count({
      where: { route_id: routeId }
    });

    const studentCount = await Student.count({
      where: { route_id: routeId }
    });

    const activeVehicles = await Vehicle.count({
      where: {
        route_id: routeId,
        status: 'active'
      }
    });

    res.json({
      success: true,
      data: {
        vehicleCount,
        studentCount,
        activeVehicles
      }
    });
  } catch (error) {
    console.error('Get route stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching route statistics',
      error: error.message
    });
  }
};

