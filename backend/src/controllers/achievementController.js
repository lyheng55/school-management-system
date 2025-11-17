const { Achievement, Student, Class } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const achievementSchema = Joi.object({
  student_id: Joi.number().integer().required(),
  title: Joi.string().required(),
  description: Joi.string().optional().allow('', null),
  category: Joi.string().valid('academic', 'sports', 'arts', 'leadership', 'other').required(),
  date: Joi.date().optional(),
  certificate_url: Joi.string().uri().optional().allow('', null)
});

exports.createAchievement = async (req, res) => {
  try {
    const { error, value } = achievementSchema.validate(req.body);
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

    if (!value.date) {
      value.date = new Date().toISOString().split('T')[0];
    }

    const achievement = await Achievement.create(value);
    const achievementWithRelations = await Achievement.findByPk(achievement.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: achievementWithRelations
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating achievement',
      error: error.message
    });
  }
};

exports.getAllAchievements = async (req, res) => {
  try {
    const { page = 1, limit = 10, student_id, category, start_date, end_date, class_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (student_id) where.student_id = student_id;
    if (category) where.category = category;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.date = { [Op.lte]: end_date };
    }

    const include = [
      { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
    ];

    // Filter by class through student
    if (class_id) {
      include[0].where = { class_id };
    }

    const { count, rows } = await Achievement.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        achievements: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
      error: error.message
    });
  }
};

exports.getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findByPk(req.params.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
      ]
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    console.error('Get achievement by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievement',
      error: error.message
    });
  }
};

exports.updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByPk(req.params.id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    const { error, value } = achievementSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await achievement.update(value);
    const updatedAchievement = await Achievement.findByPk(achievement.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
      ]
    });

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      data: updatedAchievement
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating achievement',
      error: error.message
    });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findByPk(req.params.id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    await achievement.destroy();

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting achievement',
      error: error.message
    });
  }
};

exports.getStudentAchievements = async (req, res) => {
  try {
    const { student_id } = req.params;
    const achievements = await Achievement.findAll({
      where: { student_id },
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Get student achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student achievements',
      error: error.message
    });
  }
};

