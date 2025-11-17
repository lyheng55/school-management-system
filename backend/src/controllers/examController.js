const { Exam, Class, Subject } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const examSchema = Joi.object({
  name: Joi.string().required(),
  class_id: Joi.number().integer().required(),
  subject_id: Joi.number().integer().required(),
  exam_date: Joi.date().required(),
  start_time: Joi.string().optional().allow('', null),
  end_time: Joi.string().optional().allow('', null),
  total_marks: Joi.number().positive().optional(),
  passing_marks: Joi.number().positive().optional(),
  room: Joi.string().max(50).optional().allow('', null),
  instructions: Joi.string().optional().allow('', null)
});

exports.createExam = async (req, res) => {
  try {
    const { error, value } = examSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Validate that class and subject exist
    const classExists = await Class.findByPk(value.class_id);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const subjectExists = await Subject.findByPk(value.subject_id);
    if (!subjectExists) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const exam = await Exam.create(value);
    const examWithRelations = await Exam.findByPk(exam.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: examWithRelations
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating exam',
      error: error.message
    });
  }
};

exports.getAllExams = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, class_id, subject_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (class_id) where.class_id = class_id;
    if (subject_id) where.subject_id = subject_id;
    if (start_date && end_date) {
      where.exam_date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.exam_date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.exam_date = { [Op.lte]: end_date };
    }

    const { count, rows } = await Exam.findAndCountAll({
      where,
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['exam_date', 'DESC'], ['start_time', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        exams: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exams',
      error: error.message
    });
  }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' }
      ]
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Get exam by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exam',
      error: error.message
    });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    const { error, value } = examSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    // Validate class and subject if provided
    if (value.class_id) {
      const classExists = await Class.findByPk(value.class_id);
      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }
    }

    if (value.subject_id) {
      const subjectExists = await Subject.findByPk(value.subject_id);
      if (!subjectExists) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }
    }

    await exam.update(value);
    const updatedExam = await Exam.findByPk(exam.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' }
      ]
    });

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: updatedExam
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating exam',
      error: error.message
    });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    await exam.destroy();

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting exam',
      error: error.message
    });
  }
};

exports.getExamsByClass = async (req, res) => {
  try {
    const { class_id } = req.params;
    const exams = await Exam.findAll({
      where: { class_id },
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' }
      ],
      order: [['exam_date', 'ASC'], ['start_time', 'ASC']]
    });

    res.json({
      success: true,
      data: exams
    });
  } catch (error) {
    console.error('Get exams by class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exams',
      error: error.message
    });
  }
};

