const { Message, User } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const messageSchema = Joi.object({
  receiver_id: Joi.number().integer().required(),
  subject: Joi.string().max(200).optional().allow('', null),
  content: Joi.string().required().min(1)
});

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { error, value } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(value.receiver_id);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Don't allow sending message to self
    if (value.receiver_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    const message = await Message.create({
      sender_id: req.user.id,
      receiver_id: value.receiver_id,
      subject: value.subject || null,
      content: value.content
    });

    const messageWithRelations = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'email', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'email', 'role'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: messageWithRelations
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// Get inbox messages (received messages)
exports.getInbox = async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      receiver_id: req.user.id
    };

    if (unread_only === 'true') {
      where.is_read = false;
    }

    const { count, rows } = await Message.findAndCountAll({
      where,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'email', 'role'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        messages: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        },
        unread_count: await Message.count({
          where: {
            receiver_id: req.user.id,
            is_read: false
          }
        })
      }
    });
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inbox',
      error: error.message
    });
  }
};

// Get sent messages
exports.getSent = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
      where: {
        sender_id: req.user.id
      },
      include: [
        { model: User, as: 'receiver', attributes: ['id', 'username', 'email', 'role'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        messages: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get sent messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sent messages',
      error: error.message
    });
  }
};

// Get message by ID
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'email', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'email', 'role'] }
      ]
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or receiver
    if (message.sender_id !== req.user.id && message.receiver_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this message'
      });
    }

    // Mark as read if user is receiver and message is unread
    if (message.receiver_id === req.user.id && !message.is_read) {
      await message.update({
        is_read: true,
        read_at: new Date()
      });
      message.is_read = true;
      message.read_at = new Date();
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message',
      error: error.message
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only receiver can mark as read
    if (message.receiver_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to mark this message as read'
      });
    }

    await message.update({
      is_read: true,
      read_at: new Date()
    });

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message
    });
  }
};

// Mark all messages as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Message.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: {
          receiver_id: req.user.id,
          is_read: false
        }
      }
    );

    res.json({
      success: true,
      message: 'All messages marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all messages as read',
      error: error.message
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender or receiver can delete
    if (message.sender_id !== req.user.id && message.receiver_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this message'
      });
    }

    await message.destroy();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

// Get users list for messaging (excluding current user)
exports.getUsersForMessaging = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {
      id: { [Op.ne]: req.user.id }
    };

    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'username', 'email', 'role'],
      limit: 50,
      order: [['username', 'ASC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users for messaging error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

