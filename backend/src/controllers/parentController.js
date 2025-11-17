const { Parent, Student, Grade, Attendance, Fee, Payment, Timetable, Exam, Class, Subject, User, Teacher } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

const parentSchema = Joi.object({
  user_id: Joi.number().integer().optional(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  phone: Joi.string().required(),
  occupation: Joi.string().optional().allow('', null),
  address: Joi.string().optional().allow('', null),
  relationship: Joi.string().valid('father', 'mother', 'guardian', 'other').required()
});

// Get parent's children
exports.getMyChildren = async (req, res) => {
  try {
    const parent = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    const children = await Student.findAll({
      where: { parent_id: parent.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: Class, as: 'class' }
      ],
      order: [['first_name', 'ASC']]
    });

    res.json({
      success: true,
      data: children
    });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching children',
      error: error.message
    });
  }
};

// Get child's grades
exports.getChildGrades = async (req, res) => {
  try {
    const { childId } = req.params;
    const parent = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    // Verify child belongs to parent
    const child = await Student.findOne({
      where: { id: childId, parent_id: parent.id }
    });

    if (!child) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this student\'s grades'
      });
    }

    const grades = await Grade.findAll({
      where: { student_id: childId },
      include: [
        { model: Exam, as: 'exam', include: [{ model: Subject, as: 'subject' }] },
        { model: Subject, as: 'subject' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    console.error('Get child grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades',
      error: error.message
    });
  }
};

// Get child's attendance
exports.getChildAttendance = async (req, res) => {
  try {
    const { childId } = req.params;
    const { start_date, end_date } = req.query;
    const parent = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    // Verify child belongs to parent
    const child = await Student.findOne({
      where: { id: childId, parent_id: parent.id }
    });

    if (!child) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this student\'s attendance'
      });
    }

    const where = { student_id: childId };
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.date = { [Op.lte]: end_date };
    }

    const attendance = await Attendance.findAll({
      where,
      order: [['date', 'DESC']],
      limit: 100
    });

    // Calculate statistics
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        attendance,
        statistics: {
          total,
          present,
          absent,
          late,
          attendanceRate: parseFloat(attendanceRate)
        }
      }
    });
  } catch (error) {
    console.error('Get child attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};

// Get child's fees
exports.getChildFees = async (req, res) => {
  try {
    const { childId } = req.params;
    const parent = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    // Verify child belongs to parent
    const child = await Student.findOne({
      where: { id: childId, parent_id: parent.id }
    });

    if (!child) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this student\'s fees'
      });
    }

    const fees = await Fee.findAll({
      where: { student_id: childId },
      include: [
        {
          model: Payment,
          as: 'payments',
          order: [['payment_date', 'DESC']]
        }
      ],
      order: [['due_date', 'DESC']]
    });

    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    console.error('Get child fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fees',
      error: error.message
    });
  }
};

// Get child's timetable
exports.getChildTimetable = async (req, res) => {
  try {
    const { childId } = req.params;
    const parent = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    // Verify child belongs to parent
    const child = await Student.findOne({
      where: { id: childId, parent_id: parent.id },
      include: [{ model: Class, as: 'class' }]
    });

    if (!child) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this student\'s timetable'
      });
    }

    if (!child.class_id) {
      return res.json({
        success: true,
        data: [],
        message: 'Student is not assigned to a class'
      });
    }

    const timetable = await Timetable.findAll({
      where: { class_id: child.class_id },
      include: [
        { model: Subject, as: 'subject' },
        { 
          model: Teacher, 
          as: 'teacher',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
          required: false
        },
        { model: Class, as: 'class' }
      ],
      order: [
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Get child timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timetable',
      error: error.message
    });
  }
};

// Get child's exams
exports.getChildExams = async (req, res) => {
  try {
    const { childId } = req.params;
    const parent = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    // Verify child belongs to parent
    const child = await Student.findOne({
      where: { id: childId, parent_id: parent.id },
      include: [{ model: Class, as: 'class' }]
    });

    if (!child) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this student\'s exams'
      });
    }

    if (!child.class_id) {
      return res.json({
        success: true,
        data: []
      });
    }

    const exams = await Exam.findAll({
      where: { class_id: child.class_id },
      include: [
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' }
      ],
      order: [['exam_date', 'DESC']]
    });

    res.json({
      success: true,
      data: exams
    });
  } catch (error) {
    console.error('Get child exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exams',
      error: error.message
    });
  }
};

// Get parent dashboard summary
exports.getDashboard = async (req, res) => {
  try {
    const parent = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    const children = await Student.findAll({
      where: { parent_id: parent.id },
      include: [{ model: Class, as: 'class' }]
    });

    const childrenIds = children.map(c => c.id);

    // Get recent grades
    const recentGrades = await Grade.findAll({
      where: { student_id: { [Op.in]: childrenIds } },
      include: [
        { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name', 'student_id'] },
        { model: Exam, as: 'exam', include: [{ model: Subject, as: 'subject' }] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Get recent attendance
    const today = new Date().toISOString().split('T')[0];
    const recentAttendance = await Attendance.findAll({
      where: {
        student_id: { [Op.in]: childrenIds },
        date: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
      },
      include: [
        { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name', 'student_id'] }
      ],
      order: [['date', 'DESC']],
      limit: 30
    });

    // Get pending fees
    const pendingFees = await Fee.findAll({
      where: {
        student_id: { [Op.in]: childrenIds },
        status: { [Op.in]: ['pending', 'overdue', 'partial'] }
      },
      include: [
        { model: Student, as: 'student', attributes: ['id', 'first_name', 'last_name', 'student_id'] }
      ],
      order: [['due_date', 'ASC']]
    });

    // Get upcoming exams
    const upcomingExams = await Exam.findAll({
      where: {
        class_id: { [Op.in]: children.map(c => c.class_id).filter(Boolean) },
        exam_date: { [Op.gte]: today }
      },
      include: [
        { model: Subject, as: 'subject' },
        { model: Class, as: 'class' }
      ],
      order: [['exam_date', 'ASC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        children,
        recentGrades,
        recentAttendance,
        pendingFees,
        upcomingExams,
        summary: {
          totalChildren: children.length,
          totalPendingFees: pendingFees.length,
          totalUpcomingExams: upcomingExams.length
        }
      }
    });
  } catch (error) {
    console.error('Get parent dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Get parent profile
exports.getProfile = async (req, res) => {
  try {
    const parent = await Parent.findOne({
      where: { user_id: req.user.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] }
      ]
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    res.json({
      success: true,
      data: parent
    });
  } catch (error) {
    console.error('Get parent profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parent profile',
      error: error.message
    });
  }
};

// Update parent profile
exports.updateProfile = async (req, res) => {
  try {
    const parent = await Parent.findOne({ where: { user_id: req.user.id } });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    const { first_name, last_name, phone, occupation, address, relationship } = req.body;

    await parent.update({
      first_name: first_name || parent.first_name,
      last_name: last_name || parent.last_name,
      phone: phone || parent.phone,
      occupation: occupation !== undefined ? occupation : parent.occupation,
      address: address !== undefined ? address : parent.address,
      relationship: relationship || parent.relationship
    });

    const updatedParent = await Parent.findByPk(parent.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] }
      ]
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedParent
    });
  } catch (error) {
    console.error('Update parent profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Admin CRUD operations
exports.getAllParents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, relationship } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    if (relationship) where.relationship = relationship;

    const { count, rows } = await Parent.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
        { 
          model: Student, 
          as: 'students',
          attributes: ['id', 'first_name', 'last_name', 'student_id'],
          include: [{ model: Class, as: 'class', attributes: ['id', 'name'] }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    res.json({
      success: true,
      data: {
        parents: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parents',
      error: error.message
    });
  }
};

exports.getParentById = async (req, res) => {
  try {
    const parent = await Parent.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role', 'telegram_chat_id'] },
        { 
          model: Student, 
          as: 'students',
          attributes: ['id', 'first_name', 'last_name', 'student_id'],
          include: [{ model: Class, as: 'class', attributes: ['id', 'name'] }]
        }
      ]
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    res.json({
      success: true,
      data: parent
    });
  } catch (error) {
    console.error('Get parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parent',
      error: error.message
    });
  }
};

exports.createParent = async (req, res) => {
  try {
    const { error, value } = parentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // If user_id is provided, use it; otherwise create a new user account
    let userId = value.user_id;
    
    if (!userId) {
      // Generate username from name and phone
      const baseUsername = `${value.first_name.toLowerCase()}${value.last_name.toLowerCase()}`.replace(/\s+/g, '');
      let username = baseUsername;
      let counter = 1;
      
      // Ensure username is unique
      while (await User.findOne({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Create user account with default password
      const defaultPassword = 'parent123'; // Default password, should be changed on first login
      const user = await User.create({
        username,
        password: defaultPassword,
        role: 'parent',
        email: null
      });
      
      userId = user.id;
    } else {
      // Verify user exists and has parent role
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }
      if (user.role !== 'parent') {
        return res.status(400).json({
          success: false,
          message: 'User must have parent role'
        });
      }
      // Check if parent already exists for this user
      const existingParent = await Parent.findOne({ where: { user_id: userId } });
      if (existingParent) {
        return res.status(400).json({
          success: false,
          message: 'Parent profile already exists for this user'
        });
      }
    }

    // Create parent record
    const parent = await Parent.create({
      ...value,
      user_id: userId
    });

    const parentWithRelations = await Parent.findByPk(parent.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
        { model: Student, as: 'students' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Parent created successfully',
      data: parentWithRelations
    });
  } catch (error) {
    console.error('Create parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating parent',
      error: error.message
    });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const parent = await Parent.findByPk(req.params.id);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    const { error, value } = parentSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(d => d.message).join(', ')
      });
    }

    await parent.update(value);
    const updatedParent = await Parent.findByPk(parent.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] },
        { model: Student, as: 'students' }
      ]
    });

    res.json({
      success: true,
      message: 'Parent updated successfully',
      data: updatedParent
    });
  } catch (error) {
    console.error('Update parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating parent',
      error: error.message
    });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findByPk(req.params.id);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Check if parent has students
    const students = await Student.findAll({ where: { parent_id: parent.id } });
    if (students.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete parent with associated students. Please reassign students first.'
      });
    }

    await parent.destroy();

    res.json({
      success: true,
      message: 'Parent deleted successfully'
    });
  } catch (error) {
    console.error('Delete parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting parent',
      error: error.message
    });
  }
};

