const { Grade, Student, Exam, Subject, User, Class } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const gradeSchema = Joi.object({
  student_id: Joi.number().integer().required(),
  exam_id: Joi.number().integer().required(),
  subject_id: Joi.number().integer().required(),
  marks_obtained: Joi.number().min(0).required(),
  grade: Joi.string().max(2).optional().allow('', null),
  remarks: Joi.string().optional().allow('', null)
});

// Helper function to calculate grade from marks
const calculateGrade = (marks, totalMarks) => {
  const percentage = (marks / totalMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  return 'F';
};

exports.createGrade = async (req, res) => {
  try {
    const { error, value } = gradeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Validate that student, exam, and subject exist
    const student = await Student.findByPk(value.student_id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const exam = await Exam.findByPk(value.exam_id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Validate marks don't exceed total marks
    if (value.marks_obtained > exam.total_marks) {
      return res.status(400).json({
        success: false,
        message: `Marks obtained cannot exceed total marks (${exam.total_marks})`
      });
    }

    // Auto-calculate grade if not provided
    if (!value.grade) {
      value.grade = calculateGrade(value.marks_obtained, exam.total_marks);
    }

    value.entered_by = req.user.id;

    // Check if grade already exists for this student-exam-subject combination
    const existingGrade = await Grade.findOne({
      where: {
        student_id: value.student_id,
        exam_id: value.exam_id,
        subject_id: value.subject_id
      }
    });

    if (existingGrade) {
      return res.status(400).json({
        success: false,
        message: 'Grade already exists for this student, exam, and subject combination'
      });
    }

    const grade = await Grade.create(value);
    const gradeWithRelations = await Grade.findByPk(grade.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
        { model: Exam, as: 'exam' },
        { model: Subject, as: 'subject' },
        { model: User, as: 'enteredBy', attributes: ['id', 'username', 'email'], required: false }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      data: gradeWithRelations
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating grade',
      error: error.message
    });
  }
};

exports.getAllGrades = async (req, res) => {
  try {
    const { page = 1, limit = 10, student_id, exam_id, subject_id, class_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (student_id) where.student_id = student_id;
    if (exam_id) where.exam_id = exam_id;
    if (subject_id) where.subject_id = subject_id;

    const include = [
      { 
        model: Student, 
        as: 'student', 
        include: [{ model: Class, as: 'class' }],
        ...(class_id && { where: { class_id: parseInt(class_id) } })
      },
      { model: Exam, as: 'exam' },
      { model: Subject, as: 'subject' }
    ];

    const { count, rows } = await Grade.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        grades: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades',
      error: error.message
    });
  }
};

exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
        { model: Exam, as: 'exam' },
        { model: Subject, as: 'subject' },
        { model: User, as: 'enteredBy', attributes: ['id', 'username', 'email'], required: false }
      ]
    });

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    res.json({
      success: true,
      data: grade
    });
  } catch (error) {
    console.error('Get grade by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grade',
      error: error.message
    });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    const { error, value } = gradeSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    // Validate exam if provided
    if (value.exam_id) {
      const exam = await Exam.findByPk(value.exam_id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      // Validate marks don't exceed total marks
      if (value.marks_obtained && value.marks_obtained > exam.total_marks) {
        return res.status(400).json({
          success: false,
          message: `Marks obtained cannot exceed total marks (${exam.total_marks})`
        });
      }

      // Auto-calculate grade if marks changed
      if (value.marks_obtained && !value.grade) {
        value.grade = calculateGrade(value.marks_obtained, exam.total_marks);
      }
    }

    await grade.update(value);
    const updatedGrade = await Grade.findByPk(grade.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
        { model: Exam, as: 'exam' },
        { model: Subject, as: 'subject' },
        { model: User, as: 'enteredBy', attributes: ['id', 'username', 'email'], required: false }
      ]
    });

    res.json({
      success: true,
      message: 'Grade updated successfully',
      data: updatedGrade
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating grade',
      error: error.message
    });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    await grade.destroy();

    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting grade',
      error: error.message
    });
  }
};

exports.getStudentGrades = async (req, res) => {
  try {
    const { student_id } = req.params;
    const grades = await Grade.findAll({
      where: { student_id },
      include: [
        { model: Exam, as: 'exam' },
        { model: Subject, as: 'subject' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student grades',
      error: error.message
    });
  }
};

exports.bulkCreateGrades = async (req, res) => {
  try {
    const { grades } = req.body;

    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Grades array is required'
      });
    }

    const results = [];
    for (const gradeData of grades) {
      const { error, value } = gradeSchema.validate(gradeData);
      if (error) {
        results.push({ student_id: gradeData.student_id, error: error.details[0].message });
        continue;
      }

      try {
        const exam = await Exam.findByPk(value.exam_id);
        if (!exam) {
          results.push({ student_id: value.student_id, error: 'Exam not found' });
          continue;
        }

        if (value.marks_obtained > exam.total_marks) {
          results.push({ student_id: value.student_id, error: `Marks exceed total marks` });
          continue;
        }

        if (!value.grade) {
          value.grade = calculateGrade(value.marks_obtained, exam.total_marks);
        }

        value.entered_by = req.user.id;

        const [grade, created] = await Grade.findOrCreate({
          where: {
            student_id: value.student_id,
            exam_id: value.exam_id,
            subject_id: value.subject_id
          },
          defaults: value
        });

        if (!created) {
          await grade.update(value);
        }

        results.push({ student_id: value.student_id, success: true, grade });
      } catch (err) {
        results.push({ student_id: gradeData.student_id, error: err.message });
      }
    }

    res.json({
      success: true,
      message: 'Bulk grades processed',
      data: results
    });
  } catch (error) {
    console.error('Bulk create grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk grades',
      error: error.message
    });
  }
};

