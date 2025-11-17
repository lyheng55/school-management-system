const { Teacher, User, Subject } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const teacherSchema = Joi.object({
  user_id: Joi.number().integer().optional(),
  teacher_id: Joi.string().optional(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  date_of_birth: Joi.date().optional().allow(null),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  phone: Joi.string().optional().allow('', null),
  address: Joi.string().optional().allow('', null),
  qualification: Joi.string().optional().allow('', null),
  specialization: Joi.string().optional().allow('', null),
  experience_years: Joi.number().integer().min(0).optional(),
  joining_date: Joi.date().required(),
  salary: Joi.number().optional().allow(null),
  status: Joi.string().valid('active', 'inactive', 'resigned', 'retired').optional()
});

exports.createTeacher = async (req, res) => {
  try {
    const { error, value } = teacherSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    if (!value.teacher_id) {
      value.teacher_id = `TCH${Date.now()}`;
    }

    const teacher = await Teacher.create(value);
    const teacherWithRelations = await Teacher.findByPk(teacher.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
        { model: Subject, as: 'subjects' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacherWithRelations
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating teacher',
      error: error.message
    });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { teacher_id: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;

    const { count, rows } = await Teacher.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
        { model: Subject, as: 'subjects' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        teachers: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teachers',
      error: error.message
    });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
        { model: Subject, as: 'subjects' }
      ]
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher',
      error: error.message
    });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const { error, value } = teacherSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await teacher.update(value);
    const updatedTeacher = await Teacher.findByPk(teacher.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
        { model: Subject, as: 'subjects' }
      ]
    });

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: updatedTeacher
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating teacher',
      error: error.message
    });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    await teacher.destroy();
    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting teacher',
      error: error.message
    });
  }
};

