const { Student, User, Class, Parent } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const studentSchema = Joi.object({
  user_id: Joi.number().integer().optional(),
  student_id: Joi.string().optional(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  date_of_birth: Joi.date().required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  phone: Joi.string().optional().allow('', null),
  address: Joi.string().optional().allow('', null),
  emergency_contact: Joi.string().optional().allow('', null),
  emergency_phone: Joi.string().optional().allow('', null),
  admission_date: Joi.date().required(),
  class_id: Joi.number().integer().optional().allow(null),
  parent_id: Joi.number().integer().optional().allow(null),
  route_id: Joi.number().integer().optional().allow(null),
  status: Joi.string().valid('active', 'inactive', 'graduated', 'transferred').optional()
});

exports.createStudent = async (req, res) => {
  try {
    const { error, value } = studentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Generate student ID if not provided
    if (!value.student_id) {
      value.student_id = `STU${Date.now()}`;
    }

    const student = await Student.create(value);
    const studentWithRelations = await Student.findByPk(student.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
        { model: Class, as: 'class' },
        { model: Parent, as: 'parent' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: studentWithRelations
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: error.message
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, class_id, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { student_id: { [Op.like]: `%${search}%` } }
      ];
    }
    if (class_id) where.class_id = class_id;
    if (status) where.status = status;

    const { count, rows } = await Student.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
        { model: Class, as: 'class' },
        { model: Parent, as: 'parent' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        students: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
        { model: Class, as: 'class' },
        { 
          model: Parent, 
          as: 'parent',
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['id', 'username', 'email', 'telegram_chat_id'] 
            }
          ]
        }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const { error, value } = studentSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await student.update(value);
    const updatedStudent = await Student.findByPk(student.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
        { model: Class, as: 'class' },
        { model: Parent, as: 'parent' }
      ]
    });

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message
    });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await student.destroy();
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
};

