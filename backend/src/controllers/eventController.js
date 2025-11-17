const { Event, User } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const eventSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().optional().allow('', null),
  event_type: Joi.string().valid('ptm', 'exam', 'holiday', 'sports', 'cultural', 'other').required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().optional().allow(null),
  start_time: Joi.string().optional().allow('', null),
  end_time: Joi.string().optional().allow('', null),
  location: Joi.string().max(200).optional().allow('', null),
  is_active: Joi.boolean().optional()
});

// Create event
exports.createEvent = async (req, res) => {
  try {
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Validate end_date is after start_date if provided
    if (value.end_date && new Date(value.end_date) < new Date(value.start_date)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const event = await Event.create({
      ...value,
      created_by: req.user.id
    });

    const eventWithRelations = await Event.findByPk(event.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email', 'role'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: eventWithRelations
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 50, event_type, start_date, end_date, active_only, upcoming_only } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (event_type) {
      where.event_type = event_type;
    }

    if (start_date || end_date) {
      where[Op.or] = [];
      if (start_date && end_date) {
        where[Op.or].push({
          start_date: { [Op.between]: [start_date, end_date] }
        });
        where[Op.or].push({
          end_date: { [Op.between]: [start_date, end_date] }
        });
        where[Op.or].push({
          [Op.and]: [
            { start_date: { [Op.lte]: start_date } },
            { end_date: { [Op.gte]: end_date } }
          ]
        });
      } else if (start_date) {
        where[Op.or].push({
          start_date: { [Op.gte]: start_date }
        });
        where[Op.or].push({
          end_date: { [Op.gte]: start_date }
        });
      } else if (end_date) {
        where[Op.or].push({
          start_date: { [Op.lte]: end_date }
        });
        where[Op.or].push({
          end_date: { [Op.lte]: end_date }
        });
      }
    }

    if (active_only === 'true') {
      where.is_active = true;
    }

    if (upcoming_only === 'true') {
      where[Op.or] = [
        { start_date: { [Op.gte]: new Date().toISOString().split('T')[0] } },
        { end_date: { [Op.gte]: new Date().toISOString().split('T')[0] } }
      ];
    }

    const { count, rows } = await Event.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email', 'role'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['start_date', 'ASC'], ['start_time', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        events: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email', 'role'] }
      ]
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only creator or admin can update
    if (event.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this event'
      });
    }

    const { error, value } = eventSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    // Validate end_date is after start_date if provided
    if (value.end_date && new Date(value.end_date) < new Date(value.start_date)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    await event.update(value);
    const updatedEvent = await Event.findByPk(event.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email', 'role'] }
      ]
    });

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only creator or admin can delete
    if (event.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this event'
      });
    }

    await event.destroy();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};

// Toggle active status
exports.toggleActive = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await event.update({ is_active: !event.is_active });

    res.json({
      success: true,
      message: `Event ${event.is_active ? 'activated' : 'deactivated'} successfully`,
      data: event
    });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling event status',
      error: error.message
    });
  }
};

