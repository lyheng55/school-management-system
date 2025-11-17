const { Class, Student, Teacher, Subject } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const classSchema = Joi.object({
  name: Joi.string().required(),
  section: Joi.string().optional().allow('', null),
  capacity: Joi.number().integer().min(1).optional(),
  classroom: Joi.string().optional().allow('', null),
  class_teacher_id: Joi.number().integer().optional().allow(null),
  academic_year: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive').optional()
});

exports.createClass = async (req, res) => {
  try {
    const { error, value } = classSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const classRecord = await Class.create(value);
    const classWithRelations = await Class.findByPk(classRecord.id, {
      include: [
        { model: Teacher, as: 'classTeacher' },
        { model: Subject, as: 'subjects' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: classWithRelations
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating class',
      error: error.message
    });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const { academic_year, status } = req.query;

    const where = {};
    if (academic_year) where.academic_year = academic_year;
    if (status) where.status = status;

    const classes = await Class.findAll({
      where,
      include: [
        { model: Teacher, as: 'classTeacher' },
        { model: Subject, as: 'subjects' },
        { model: Student, as: 'students', attributes: ['id'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: error.message
    });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const classRecord = await Class.findByPk(req.params.id, {
      include: [
        { model: Teacher, as: 'classTeacher' },
        { model: Subject, as: 'subjects' },
        { model: Student, as: 'students' }
      ]
    });

    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classRecord
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching class',
      error: error.message
    });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const classRecord = await Class.findByPk(req.params.id);
    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const { error, value } = classSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await classRecord.update(value);
    const updatedClass = await Class.findByPk(classRecord.id, {
      include: [
        { model: Teacher, as: 'classTeacher' },
        { model: Subject, as: 'subjects' },
        { model: Student, as: 'students' }
      ]
    });

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating class',
      error: error.message
    });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const classRecord = await Class.findByPk(req.params.id);
    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    await classRecord.destroy();
    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting class',
      error: error.message
    });
  }
};

