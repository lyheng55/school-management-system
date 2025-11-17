const { Timetable, Class, Subject, Teacher } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const timetableSchema = Joi.object({
  class_id: Joi.number().integer().required(),
  subject_id: Joi.number().integer().required(),
  teacher_id: Joi.number().integer().required(),
  day_of_week: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
  start_time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
  end_time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
  room: Joi.string().max(50).optional().allow('', null)
});

exports.createTimetable = async (req, res) => {
  try {
    const { error, value } = timetableSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check for time conflicts (same class, same day, overlapping times)
    const conflictingTimetable = await Timetable.findOne({
      where: {
        class_id: value.class_id,
        day_of_week: value.day_of_week,
        [Op.or]: [
          {
            start_time: {
              [Op.between]: [value.start_time, value.end_time]
            }
          },
          {
            end_time: {
              [Op.between]: [value.start_time, value.end_time]
            }
          },
          {
            [Op.and]: [
              { start_time: { [Op.lte]: value.start_time } },
              { end_time: { [Op.gte]: value.end_time } }
            ]
          }
        ]
      }
    });

    if (conflictingTimetable) {
      return res.status(400).json({
        success: false,
        message: 'Time slot conflicts with existing timetable entry'
      });
    }

    // Validate start_time < end_time
    if (value.start_time >= value.end_time) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }

    const timetable = await Timetable.create(value);
    const timetableWithRelations = await Timetable.findByPk(timetable.id, {
      attributes: ['id', 'class_id', 'subject_id', 'teacher_id', 'day_of_week', 'start_time', 'end_time', 'room'],
      include: [
        { 
          model: Class, 
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        { 
          model: Subject, 
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        { 
          model: Teacher, 
          as: 'teacher',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Timetable entry created successfully',
      data: timetableWithRelations
    });
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating timetable entry',
      error: error.message
    });
  }
};

exports.getAllTimetables = async (req, res) => {
  try {
    const { class_id, teacher_id, day_of_week, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Debug: Log the query parameters
    console.log('getAllTimetables - Query params:', { class_id, teacher_id, day_of_week, page, limit });

    const where = {};
    if (class_id) {
      where.class_id = parseInt(class_id); // Ensure it's an integer
      console.log('Filtering by class_id:', where.class_id);
    }
    if (teacher_id) where.teacher_id = teacher_id;
    if (day_of_week) where.day_of_week = day_of_week;

    // Optimize query: only select needed fields and limit related data
    const { count, rows } = await Timetable.findAndCountAll({
      where,
      attributes: ['id', 'class_id', 'subject_id', 'teacher_id', 'day_of_week', 'start_time', 'end_time', 'room'],
      include: [
        { 
          model: Class, 
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        { 
          model: Subject, 
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        { 
          model: Teacher, 
          as: 'teacher',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true // Important for correct count with includes
    });

    res.json({
      success: true,
      data: {
        timetables: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get timetables error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timetables',
      error: error.message
    });
  }
};

exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findByPk(req.params.id, {
      attributes: ['id', 'class_id', 'subject_id', 'teacher_id', 'day_of_week', 'start_time', 'end_time', 'room'],
      include: [
        { 
          model: Class, 
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        { 
          model: Subject, 
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        { 
          model: Teacher, 
          as: 'teacher',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    res.json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timetable entry',
      error: error.message
    });
  }
};

exports.getTimetableByClass = async (req, res) => {
  try {
    const { class_id } = req.params;

    const timetables = await Timetable.findAll({
      where: { class_id },
      attributes: ['id', 'class_id', 'subject_id', 'teacher_id', 'day_of_week', 'start_time', 'end_time', 'room'],
      include: [
        { 
          model: Class, 
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        { 
          model: Subject, 
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        { 
          model: Teacher, 
          as: 'teacher',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: timetables
    });
  } catch (error) {
    console.error('Get timetable by class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timetable',
      error: error.message
    });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByPk(req.params.id);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    const { error, value } = timetableSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    // Check for time conflicts (excluding current entry)
    const conflictingTimetable = await Timetable.findOne({
      where: {
        id: { [Op.ne]: req.params.id },
        class_id: value.class_id,
        day_of_week: value.day_of_week,
        [Op.or]: [
          {
            start_time: {
              [Op.between]: [value.start_time, value.end_time]
            }
          },
          {
            end_time: {
              [Op.between]: [value.start_time, value.end_time]
            }
          },
          {
            [Op.and]: [
              { start_time: { [Op.lte]: value.start_time } },
              { end_time: { [Op.gte]: value.end_time } }
            ]
          }
        ]
      }
    });

    if (conflictingTimetable) {
      return res.status(400).json({
        success: false,
        message: 'Time slot conflicts with existing timetable entry'
      });
    }

    // Validate start_time < end_time
    if (value.start_time >= value.end_time) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }

    await timetable.update(value);
    const updatedTimetable = await Timetable.findByPk(timetable.id, {
      attributes: ['id', 'class_id', 'subject_id', 'teacher_id', 'day_of_week', 'start_time', 'end_time', 'room'],
      include: [
        { 
          model: Class, 
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        { 
          model: Subject, 
          as: 'subject',
          attributes: ['id', 'name', 'code']
        },
        { 
          model: Teacher, 
          as: 'teacher',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Timetable entry updated successfully',
      data: updatedTimetable
    });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating timetable entry',
      error: error.message
    });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByPk(req.params.id);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    await timetable.destroy();
    res.json({
      success: true,
      message: 'Timetable entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting timetable entry',
      error: error.message
    });
  }
};

