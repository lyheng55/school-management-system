const { Announcement, User } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const announcementSchema = Joi.object({
  title: Joi.string().max(200).required(),
  content: Joi.string().required().min(1),
  target_audience: Joi.string().valid('all', 'students', 'teachers', 'parents', 'staff').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  published_at: Joi.date().optional().allow(null),
  expires_at: Joi.date().optional().allow(null),
  is_active: Joi.boolean().optional()
});

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { error, value } = announcementSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const announcement = await Announcement.create({
      ...value,
      created_by: req.user.id,
      published_at: value.published_at || new Date()
    });

    const announcementWithRelations = await Announcement.findByPk(announcement.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email', 'role'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcementWithRelations
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
};

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 20, target_audience, priority, active_only, expired_only } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (target_audience) {
      where[Op.or] = [
        { target_audience: target_audience },
        { target_audience: 'all' }
      ];
    }

    if (priority) {
      where.priority = priority;
    }

    if (active_only === 'true') {
      where.is_active = true;
      where[Op.or] = [
        { expires_at: null },
        { expires_at: { [Op.gte]: new Date() } }
      ];
    }

    if (expired_only === 'true') {
      where.expires_at = { [Op.lt]: new Date() };
    }

    const { count, rows } = await Announcement.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email', 'role'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['published_at', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        announcements: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};

// Get announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email', 'role'] }
      ]
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message
    });
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Only creator or admin can update
    if (announcement.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this announcement'
      });
    }

    const { error, value } = announcementSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await announcement.update(value);
    const updatedAnnouncement = await Announcement.findByPk(announcement.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email', 'role'] }
      ]
    });

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedAnnouncement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Only creator or admin can delete
    if (announcement.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this announcement'
      });
    }

    await announcement.destroy();

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
};

// Toggle active status
exports.toggleActive = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.update({ is_active: !announcement.is_active });

    res.json({
      success: true,
      message: `Announcement ${announcement.is_active ? 'activated' : 'deactivated'} successfully`,
      data: announcement
    });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling announcement status',
      error: error.message
    });
  }
};

