const { Behavior, Student, User, Class } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const behaviorSchema = Joi.object({
  student_id: Joi.number().integer().required(),
  type: Joi.string().valid('positive', 'negative').required(),
  description: Joi.string().required(),
  date: Joi.date().optional()
});

exports.createBehavior = async (req, res) => {
  try {
    const { error, value } = behaviorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Validate that student exists
    const student = await Student.findByPk(value.student_id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    value.recorded_by = req.user.id;
    if (!value.date) {
      value.date = new Date().toISOString().split('T')[0];
    }

    const behavior = await Behavior.create(value);
    const behaviorWithRelations = await Behavior.findByPk(behavior.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
        { model: User, as: 'recordedBy', attributes: ['id', 'username', 'email'], required: false, foreignKey: 'recorded_by' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Behavior recorded successfully',
      data: behaviorWithRelations
    });
  } catch (error) {
    console.error('Create behavior error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording behavior',
      error: error.message
    });
  }
};

exports.getAllBehaviors = async (req, res) => {
  try {
    const { page = 1, limit = 10, student_id, type, start_date, end_date, class_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (student_id) where.student_id = student_id;
    if (type) where.type = type;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.date = { [Op.lte]: end_date };
    }

    const include = [
      { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
      { model: User, as: 'recordedBy', attributes: ['id', 'username', 'email'], required: false }
    ];

    // Filter by class through student
    if (class_id) {
      include[0].where = { class_id };
    }

    const { count, rows } = await Behavior.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        behaviors: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all behaviors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching behaviors',
      error: error.message
    });
  }
};

exports.getBehaviorById = async (req, res) => {
  try {
    const behavior = await Behavior.findByPk(req.params.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
        { model: User, as: 'recordedBy', attributes: ['id', 'username', 'email'], required: false, foreignKey: 'recorded_by' }
      ]
    });

    if (!behavior) {
      return res.status(404).json({
        success: false,
        message: 'Behavior record not found'
      });
    }

    res.json({
      success: true,
      data: behavior
    });
  } catch (error) {
    console.error('Get behavior by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching behavior',
      error: error.message
    });
  }
};

exports.updateBehavior = async (req, res) => {
  try {
    const behavior = await Behavior.findByPk(req.params.id);
    if (!behavior) {
      return res.status(404).json({
        success: false,
        message: 'Behavior record not found'
      });
    }

    const { error, value } = behaviorSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await behavior.update(value);
    const updatedBehavior = await Behavior.findByPk(behavior.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
        { model: User, as: 'recordedBy', attributes: ['id', 'username', 'email'], required: false, foreignKey: 'recorded_by' }
      ]
    });

    res.json({
      success: true,
      message: 'Behavior updated successfully',
      data: updatedBehavior
    });
  } catch (error) {
    console.error('Update behavior error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating behavior',
      error: error.message
    });
  }
};

exports.deleteBehavior = async (req, res) => {
  try {
    const behavior = await Behavior.findByPk(req.params.id);
    if (!behavior) {
      return res.status(404).json({
        success: false,
        message: 'Behavior record not found'
      });
    }

    await behavior.destroy();

    res.json({
      success: true,
      message: 'Behavior deleted successfully'
    });
  } catch (error) {
    console.error('Delete behavior error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting behavior',
      error: error.message
    });
  }
};

exports.getStudentBehaviors = async (req, res) => {
  try {
    const { student_id } = req.params;
    const behaviors = await Behavior.findAll({
      where: { student_id },
      include: [
        { model: User, as: 'recordedBy', attributes: ['id', 'username', 'email'], required: false, foreignKey: 'recorded_by' }
      ],
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: behaviors
    });
  } catch (error) {
    console.error('Get student behaviors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student behaviors',
      error: error.message
    });
  }
};

