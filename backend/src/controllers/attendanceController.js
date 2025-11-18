const { Attendance, Student, User, Class, Parent } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');
const telegramService = require('../utils/telegramService');

const attendanceSchema = Joi.object({
  student_id: Joi.number().integer().required(),
  date: Joi.date().required(),
  status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
  remarks: Joi.string().optional().allow('', null)
});

exports.markAttendance = async (req, res) => {
  try {
    const { error, value } = attendanceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    value.marked_by = req.user.id;

    const [attendance, created] = await Attendance.findOrCreate({
      where: {
        student_id: value.student_id,
        date: value.date
      },
      defaults: value
    });

    if (!created) {
      await attendance.update(value);
    }

    const attendanceWithRelations = await Attendance.findByPk(attendance.id, {
      include: [
        { 
          model: Student, 
          as: 'student', 
          include: [
            { model: Class, as: 'class' },
            { model: Parent, as: 'parent', include: [{ model: User, as: 'user' }] }
          ]
        },
        { model: User, as: 'markedBy', attributes: ['id', 'username', 'email'], required: false }
      ]
    });

    // Send Telegram notification to parent if student is absent or late
    if (attendanceWithRelations && (value.status === 'absent' || value.status === 'late')) {
      try {
        const student = attendanceWithRelations.student;
        const parent = student?.parent;
        const parentUser = parent?.user;
        
        // Get parent's Telegram chat ID from User model
        const telegramChatId = parentUser?.telegram_chat_id;
        
        if (telegramChatId && student) {
          await telegramService.sendAttendanceAlert(telegramChatId, {
            studentName: `${student.first_name} ${student.last_name}`,
            className: student.class?.name || 'N/A',
            date: new Date(value.date).toLocaleDateString(),
            status: value.status,
            remarks: value.remarks || null
          });
        }
      } catch (telegramError) {
        // Don't fail the request if Telegram notification fails
        console.error('Telegram notification error:', telegramError.message);
      }
    }

    res.json({
      success: true,
      message: created ? 'Attendance marked successfully' : 'Attendance updated successfully',
      data: attendanceWithRelations
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
};

exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { class_id, date, attendances } = req.body;

    if (!class_id || !date || !Array.isArray(attendances)) {
      return res.status(400).json({
        success: false,
        message: 'class_id, date, and attendances array are required'
      });
    }

    const results = [];
    for (const att of attendances) {
      const { error, value } = attendanceSchema.validate({
        student_id: att.student_id,
        date: date,
        status: att.status,
        remarks: att.remarks
      });

      if (error) {
        results.push({ student_id: att.student_id, error: error.details[0].message });
        continue;
      }

      value.marked_by = req.user.id;

      try {
        const [attendance] = await Attendance.findOrCreate({
          where: {
            student_id: value.student_id,
            date: value.date
          },
          defaults: value
        });

        if (!attendance.isNewRecord) {
          await attendance.update(value);
        }

        // Send Telegram notification if absent or late
        if (value.status === 'absent' || value.status === 'late') {
          try {
            const studentRecord = await Student.findByPk(value.student_id, {
              include: [
                { model: Class, as: 'class' },
                { model: Parent, as: 'parent', include: [{ model: User, as: 'user' }] }
              ]
            });

            if (studentRecord?.parent?.user) {
              const parentUser = studentRecord.parent.user;
              const telegramChatId = parentUser.telegram_chat_id;
              
              if (telegramChatId) {
                await telegramService.sendAttendanceAlert(telegramChatId, {
                  studentName: `${studentRecord.first_name} ${studentRecord.last_name}`,
                  className: studentRecord.class?.name || 'N/A',
                  date: new Date(date).toLocaleDateString(),
                  status: value.status,
                  remarks: value.remarks || null
                });
              }
            }
          } catch (telegramError) {
            console.error(`Telegram notification error for student ${att.student_id}:`, telegramError.message);
          }
        }

        results.push({ student_id: att.student_id, success: true, attendance });
      } catch (err) {
        results.push({ student_id: att.student_id, error: err.message });
      }
    }

    res.json({
      success: true,
      message: 'Bulk attendance marked',
      data: results
    });
  } catch (error) {
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking bulk attendance',
      error: error.message
    });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { student_id, class_id, start_date, end_date, date } = req.query;

    const where = {};
    if (student_id) where.student_id = student_id;
    if (class_id) {
      const students = await Student.findAll({ where: { class_id }, attributes: ['id'] });
      where.student_id = { [Op.in]: students.map(s => s.id) };
    }
    if (date) {
      where.date = date;
    } else if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const attendances = await Attendance.findAll({
      where,
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
      ],
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: attendances
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};

exports.getStudentAttendanceStats = async (req, res) => {
  try {
    const { student_id, start_date, end_date } = req.query;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: 'student_id is required'
      });
    }

    const where = { student_id };
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const attendances = await Attendance.findAll({ where });

    const stats = {
      total: attendances.length,
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      late: attendances.filter(a => a.status === 'late').length,
      excused: attendances.filter(a => a.status === 'excused').length,
      attendance_rate: attendances.length > 0
        ? ((attendances.filter(a => a.status === 'present' || a.status === 'late').length / attendances.length) * 100).toFixed(2)
        : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance stats',
      error: error.message
    });
  }
};

