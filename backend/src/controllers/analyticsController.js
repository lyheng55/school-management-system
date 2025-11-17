const {
  Student,
  Teacher,
  Class,
  Attendance,
  Grade,
  Exam,
  Fee,
  Payment,
  Behavior,
  Achievement,
  Subject,
  User
} = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');
const exportService = require('../utils/exportService');

// Dashboard KPIs
exports.getDashboardKPIs = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get counts
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      activeStudents,
      todayAttendance,
      monthAttendance,
      totalFees,
      totalPayments,
      pendingFees,
      overdueFees
    ] = await Promise.all([
      Student.count(),
      Teacher.count(),
      Class.count({ where: { status: 'active' } }),
      Student.count({ where: { status: 'active' } }),
      Attendance.count({ where: { date: today.toISOString().split('T')[0] } }),
      Attendance.count({
        where: {
          date: {
            [Op.gte]: startOfMonth.toISOString().split('T')[0]
          }
        }
      }),
      Fee.sum('amount') || 0,
      Payment.sum('amount') || 0,
      Fee.count({ where: { status: 'pending' } }),
      Fee.count({ where: { status: 'overdue' } })
    ]);

    // Calculate attendance rate for today
    const todayPresent = await Attendance.count({
      where: {
        date: today.toISOString().split('T')[0],
        status: { [Op.in]: ['present', 'late'] }
      }
    });
    const todayAttendanceRate = todayAttendance > 0
      ? ((todayPresent / todayAttendance) * 100).toFixed(1)
      : 0;

    // Calculate monthly attendance rate
    const monthPresent = await Attendance.count({
      where: {
        date: {
          [Op.gte]: startOfMonth.toISOString().split('T')[0]
        },
        status: { [Op.in]: ['present', 'late'] }
      }
    });
    const monthAttendanceRate = monthAttendance > 0
      ? ((monthPresent / monthAttendance) * 100).toFixed(1)
      : 0;

    // Calculate collection rate
    const collectionRate = totalFees > 0
      ? ((totalPayments / totalFees) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        students: {
          total: totalStudents,
          active: activeStudents
        },
        teachers: {
          total: totalTeachers
        },
        classes: {
          total: totalClasses
        },
        attendance: {
          today: {
            total: todayAttendance,
            present: todayPresent,
            rate: parseFloat(todayAttendanceRate)
          },
          month: {
            total: monthAttendance,
            present: monthPresent,
            rate: parseFloat(monthAttendanceRate)
          }
        },
        finance: {
          totalFees: parseFloat(totalFees || 0),
          totalPayments: parseFloat(totalPayments || 0),
          pendingFees,
          overdueFees,
          collectionRate: parseFloat(collectionRate)
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard KPIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard KPIs',
      error: error.message
    });
  }
};

// Student Performance Analytics
exports.getStudentPerformanceAnalytics = async (req, res) => {
  try {
    const { student_id, class_id, start_date, end_date, subject_id } = req.query;

    const where = {};
    if (student_id) where.student_id = student_id;
    if (class_id) {
      const students = await Student.findAll({
        where: { class_id },
        attributes: ['id']
      });
      where.student_id = { [Op.in]: students.map(s => s.id) };
    }
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = start_date;
      if (end_date) where.created_at[Op.lte] = end_date;
    }
    if (subject_id) where.subject_id = subject_id;

    // Get grades with student and exam info
    const grades = await Grade.findAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          include: [{ model: Class, as: 'class' }]
        },
        { model: Exam, as: 'exam' },
        { model: Subject, as: 'subject' }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate statistics
    const totalGrades = grades.length;
    const totalMarks = grades.reduce((sum, g) => sum + parseFloat(g.marks_obtained || 0), 0);
    const averageMarks = totalGrades > 0 ? (totalMarks / totalGrades).toFixed(2) : 0;

    // Grade distribution
    const gradeDistribution = {
      'A+': grades.filter(g => g.grade === 'A+').length,
      'A': grades.filter(g => g.grade === 'A').length,
      'B+': grades.filter(g => g.grade === 'B+').length,
      'B': grades.filter(g => g.grade === 'B').length,
      'C+': grades.filter(g => g.grade === 'C+').length,
      'C': grades.filter(g => g.grade === 'C').length,
      'F': grades.filter(g => g.grade === 'F').length
    };

    // Performance by subject
    const subjectPerformance = {};
    grades.forEach(grade => {
      const subjectName = grade.subject?.name || 'Unknown';
      if (!subjectPerformance[subjectName]) {
        subjectPerformance[subjectName] = {
          total: 0,
          sum: 0,
          grades: []
        };
      }
      subjectPerformance[subjectName].total++;
      subjectPerformance[subjectName].sum += parseFloat(grade.marks_obtained || 0);
      if (grade.grade) {
        subjectPerformance[subjectName].grades.push(grade.grade);
      }
    });

    const subjectStats = Object.keys(subjectPerformance).map(subjectName => ({
      subject: subjectName,
      average: (subjectPerformance[subjectName].sum / subjectPerformance[subjectName].total).toFixed(2),
      total: subjectPerformance[subjectName].total,
      gradeDistribution: {
        'A+': subjectPerformance[subjectName].grades.filter(g => g === 'A+').length,
        'A': subjectPerformance[subjectName].grades.filter(g => g === 'A').length,
        'B+': subjectPerformance[subjectName].grades.filter(g => g === 'B+').length,
        'B': subjectPerformance[subjectName].grades.filter(g => g === 'B').length,
        'C+': subjectPerformance[subjectName].grades.filter(g => g === 'C+').length,
        'C': subjectPerformance[subjectName].grades.filter(g => g === 'C').length,
        'F': subjectPerformance[subjectName].grades.filter(g => g === 'F').length
      }
    }));

    // Performance by class
    const classPerformance = {};
    grades.forEach(grade => {
      const className = grade.student?.class?.name || 'Unknown';
      if (!classPerformance[className]) {
        classPerformance[className] = {
          total: 0,
          sum: 0
        };
      }
      classPerformance[className].total++;
      classPerformance[className].sum += parseFloat(grade.marks_obtained || 0);
    });

    const classStats = Object.keys(classPerformance).map(className => ({
      class: className,
      average: (classPerformance[className].sum / classPerformance[className].total).toFixed(2),
      total: classPerformance[className].total
    }));

    // Monthly trend
    const monthlyTrend = {};
    grades.forEach(grade => {
      const month = new Date(grade.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyTrend[month]) {
        monthlyTrend[month] = { total: 0, sum: 0 };
      }
      monthlyTrend[month].total++;
      monthlyTrend[month].sum += parseFloat(grade.marks_obtained || 0);
    });

    const monthlyStats = Object.keys(monthlyTrend)
      .sort()
      .map(month => ({
        month,
        average: (monthlyTrend[month].sum / monthlyTrend[month].total).toFixed(2),
        total: monthlyTrend[month].total
      }));

    res.json({
      success: true,
      data: {
        summary: {
          totalGrades,
          averageMarks: parseFloat(averageMarks),
          gradeDistribution
        },
        bySubject: subjectStats,
        byClass: classStats,
        monthlyTrend: monthlyStats,
        grades: grades.slice(0, 100) // Limit to recent 100
      }
    });
  } catch (error) {
    console.error('Get student performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student performance analytics',
      error: error.message
    });
  }
};

// Staff Performance Reports
exports.getStaffPerformanceReports = async (req, res) => {
  try {
    const { teacher_id, start_date, end_date } = req.query;

    const where = {};
    if (teacher_id) where.marked_by = teacher_id;
    if (start_date || end_date) {
      where.date = {};
      if (start_date) where.date[Op.gte] = start_date;
      if (end_date) where.date[Op.lte] = end_date;
    }

    // Get teachers with their classes
    const teachers = await Teacher.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { model: Class, as: 'classes', attributes: ['id', 'name'] }
      ]
    });

    // Get attendance marked by teachers
    const attendanceRecords = await Attendance.findAll({
      where,
      include: [
        { model: User, as: 'markedBy', attributes: ['id', 'username'] },
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
      ]
    });

    // Calculate teacher statistics
    const teacherStats = teachers.map(teacher => {
      const teacherAttendance = attendanceRecords.filter(
        a => a.marked_by === teacher.user_id
      );
      const classes = teacher.classes || [];
      
      return {
        teacher_id: teacher.id,
        name: `${teacher.first_name} ${teacher.last_name}`,
        email: teacher.user?.email || '',
        username: teacher.user?.username || '',
        classes: classes.map(c => c.name),
        totalClasses: classes.length,
        attendanceMarked: teacherAttendance.length,
        lastActivity: teacherAttendance.length > 0
          ? teacherAttendance[0].created_at
          : null
      };
    });

    // Get exam statistics by teacher
    const examWhere = {};
    if (start_date || end_date) {
      examWhere.exam_date = {};
      if (start_date) examWhere.exam_date[Op.gte] = start_date;
      if (end_date) examWhere.exam_date[Op.lte] = end_date;
    }

    const exams = await Exam.findAll({
      where: examWhere,
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' }
      ]
    });

    // Get grade statistics
    const gradeWhere = {};
    if (start_date || end_date) {
      gradeWhere.created_at = {};
      if (start_date) gradeWhere.created_at[Op.gte] = start_date;
      if (end_date) gradeWhere.created_at[Op.lte] = end_date;
    }

    const grades = await Grade.findAll({
      where: gradeWhere,
      include: [
        { model: Exam, as: 'exam' },
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
      ]
    });

    // Add exam and grade counts to teacher stats
    teacherStats.forEach(teacher => {
      const teacherClasses = teacher.classes || [];
      const classIds = teacher.classes?.map(c => c.id) || [];
      
      teacher.examsCreated = exams.filter(e => 
        classIds.includes(e.class_id)
      ).length;
      
      teacher.gradesEntered = grades.filter(g => 
        classIds.includes(g.student?.class_id)
      ).length;
    });

    res.json({
      success: true,
      data: {
        teachers: teacherStats,
        summary: {
          totalTeachers: teachers.length,
          activeTeachers: teacherStats.filter(t => t.attendanceMarked > 0 || t.examsCreated > 0).length,
          totalAttendanceMarked: attendanceRecords.length,
          totalExams: exams.length,
          totalGrades: grades.length
        }
      }
    });
  } catch (error) {
    console.error('Get staff performance reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff performance reports',
      error: error.message
    });
  }
};

// Fee and Finance Reports
exports.getFinanceReports = async (req, res) => {
  try {
    const { start_date, end_date, fee_type, class_id, status } = req.query;

    const feeWhere = {};
    const paymentWhere = {};

    if (start_date || end_date) {
      feeWhere.created_at = {};
      paymentWhere.payment_date = {};
      if (start_date) {
        feeWhere.created_at[Op.gte] = start_date;
        paymentWhere.payment_date[Op.gte] = start_date;
      }
      if (end_date) {
        feeWhere.created_at[Op.lte] = end_date;
        paymentWhere.payment_date[Op.lte] = end_date;
      }
    }

    if (fee_type) feeWhere.fee_type = fee_type;
    if (status) feeWhere.status = status;

    // Get fees
    const fees = await Fee.findAll({
      where: feeWhere,
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
      ]
    });

    // Get payments
    let payments = await Payment.findAll({
      where: paymentWhere,
      include: [
        { model: Fee, as: 'fee', include: [{ model: Student, as: 'student' }] }
      ]
    });

    // Filter payments by class if specified
    if (class_id) {
      payments = payments.filter(p => p.fee?.student?.class_id == class_id);
    }

    // Calculate summary statistics
    const totalFees = fees.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
    const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const pendingAmount = fees
      .filter(f => f.status === 'pending')
      .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
    const overdueAmount = fees
      .filter(f => f.status === 'overdue')
      .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
    const partialAmount = fees
      .filter(f => f.status === 'partial')
      .reduce((sum, f) => {
        const paid = payments
          .filter(p => p.fee_id === f.id)
          .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
        return sum + (parseFloat(f.amount || 0) - paid);
      }, 0);

    // Fee type breakdown
    const feeTypeBreakdown = {};
    fees.forEach(fee => {
      const type = fee.fee_type;
      if (!feeTypeBreakdown[type]) {
        feeTypeBreakdown[type] = {
          count: 0,
          total: 0,
          paid: 0,
          pending: 0
        };
      }
      feeTypeBreakdown[type].count++;
      feeTypeBreakdown[type].total += parseFloat(fee.amount || 0);
      
      const feePayments = payments.filter(p => p.fee_id === fee.id);
      const paid = feePayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      
      if (paid >= parseFloat(fee.amount || 0)) {
        feeTypeBreakdown[type].paid += parseFloat(fee.amount || 0);
      } else {
        feeTypeBreakdown[type].pending += (parseFloat(fee.amount || 0) - paid);
      }
    });

    // Monthly trend
    const monthlyTrend = {};
    payments.forEach(payment => {
      const month = new Date(payment.payment_date).toISOString().slice(0, 7);
      if (!monthlyTrend[month]) {
        monthlyTrend[month] = { count: 0, amount: 0 };
      }
      monthlyTrend[month].count++;
      monthlyTrend[month].amount += parseFloat(payment.amount || 0);
    });

    const monthlyStats = Object.keys(monthlyTrend)
      .sort()
      .map(month => ({
        month,
        count: monthlyTrend[month].count,
        amount: parseFloat(monthlyTrend[month].amount.toFixed(2))
      }));

    // Class-wise breakdown
    const classBreakdown = {};
    fees.forEach(fee => {
      const className = fee.student?.class?.name || 'Unassigned';
      if (!classBreakdown[className]) {
        classBreakdown[className] = {
          total: 0,
          paid: 0,
          pending: 0,
          count: 0
        };
      }
      classBreakdown[className].count++;
      classBreakdown[className].total += parseFloat(fee.amount || 0);
      
      const feePayments = payments.filter(p => p.fee_id === fee.id);
      const paid = feePayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      classBreakdown[className].paid += paid;
      classBreakdown[className].pending += (parseFloat(fee.amount || 0) - paid);
    });

    const classStats = Object.keys(classBreakdown).map(className => ({
      class: className,
      ...classBreakdown[className],
      collectionRate: classBreakdown[className].total > 0
        ? ((classBreakdown[className].paid / classBreakdown[className].total) * 100).toFixed(1)
        : 0
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalFees: parseFloat(totalFees.toFixed(2)),
          totalPayments: parseFloat(totalPayments.toFixed(2)),
          pendingAmount: parseFloat(pendingAmount.toFixed(2)),
          overdueAmount: parseFloat(overdueAmount.toFixed(2)),
          partialAmount: parseFloat(partialAmount.toFixed(2)),
          collectionRate: totalFees > 0
            ? ((totalPayments / totalFees) * 100).toFixed(1)
            : 0
        },
        feeTypeBreakdown: Object.keys(feeTypeBreakdown).map(type => ({
          type,
          ...feeTypeBreakdown[type]
        })),
        monthlyTrend: monthlyStats,
        classBreakdown: classStats,
        fees: fees.slice(0, 100), // Limit to recent 100
        payments: payments.slice(0, 100) // Limit to recent 100
      }
    });
  } catch (error) {
    console.error('Get finance reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching finance reports',
      error: error.message
    });
  }
};

// Attendance Analytics
exports.getAttendanceAnalytics = async (req, res) => {
  try {
    const { start_date, end_date, class_id, student_id } = req.query;

    const where = {};
    if (start_date || end_date) {
      where.date = {};
      if (start_date) where.date[Op.gte] = start_date;
      if (end_date) where.date[Op.lte] = end_date;
    }

    let attendanceRecords = await Attendance.findAll({
      where,
      include: [
        { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
      ]
    });

    // Filter by class or student if specified
    if (class_id) {
      attendanceRecords = attendanceRecords.filter(a => a.student?.class_id == class_id);
    }
    if (student_id) {
      attendanceRecords = attendanceRecords.filter(a => a.student_id == student_id);
    }

    // Calculate statistics
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(a => a.status === 'present').length;
    const absent = attendanceRecords.filter(a => a.status === 'absent').length;
    const late = attendanceRecords.filter(a => a.status === 'late').length;
    const excused = attendanceRecords.filter(a => a.status === 'excused').length;
    const attendanceRate = total > 0 ? (((present + late) / total) * 100).toFixed(1) : 0;

    // Daily trend
    const dailyTrend = {};
    attendanceRecords.forEach(record => {
      const date = record.date;
      if (!dailyTrend[date]) {
        dailyTrend[date] = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
      }
      dailyTrend[date].total++;
      dailyTrend[date][record.status]++;
    });

    const dailyStats = Object.keys(dailyTrend)
      .sort()
      .map(date => ({
        date,
        ...dailyTrend[date],
        rate: dailyTrend[date].total > 0
          ? (((dailyTrend[date].present + dailyTrend[date].late) / dailyTrend[date].total) * 100).toFixed(1)
          : 0
      }));

    // Class-wise breakdown
    const classBreakdown = {};
    attendanceRecords.forEach(record => {
      const className = record.student?.class?.name || 'Unassigned';
      if (!classBreakdown[className]) {
        classBreakdown[className] = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
      }
      classBreakdown[className].total++;
      classBreakdown[className][record.status]++;
    });

    const classStats = Object.keys(classBreakdown).map(className => ({
      class: className,
      ...classBreakdown[className],
      rate: classBreakdown[className].total > 0
        ? (((classBreakdown[className].present + classBreakdown[className].late) / classBreakdown[className].total) * 100).toFixed(1)
        : 0
    }));

    res.json({
      success: true,
      data: {
        summary: {
          total,
          present,
          absent,
          late,
          excused,
          attendanceRate: parseFloat(attendanceRate)
        },
        dailyTrend: dailyStats,
        classBreakdown: classStats
      }
    });
  } catch (error) {
    console.error('Get attendance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance analytics',
      error: error.message
    });
  }
};

// Helper function to fetch analytics data
const fetchAnalyticsData = async (reportType, queryParams) => {
  const { start_date, end_date, class_id, student_id, subject_id, teacher_id } = queryParams;

  switch (reportType) {
    case 'student-performance': {
      const where = {};
      if (student_id) where.student_id = student_id;
      if (class_id) {
        const students = await Student.findAll({
          where: { class_id },
          attributes: ['id']
        });
        where.student_id = { [Op.in]: students.map(s => s.id) };
      }
      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) where.created_at[Op.gte] = start_date;
        if (end_date) where.created_at[Op.lte] = end_date;
      }
      if (subject_id) where.subject_id = subject_id;

      const grades = await Grade.findAll({
        where,
        include: [
          { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] },
          { model: Exam, as: 'exam' },
          { model: Subject, as: 'subject' }
        ],
        order: [['created_at', 'DESC']]
      });

      const totalGrades = grades.length;
      const totalMarks = grades.reduce((sum, g) => sum + parseFloat(g.marks_obtained || 0), 0);
      const averageMarks = totalGrades > 0 ? parseFloat((totalMarks / totalGrades).toFixed(2)) : 0;

      const gradeDistribution = {
        'A+': grades.filter(g => g.grade === 'A+').length,
        'A': grades.filter(g => g.grade === 'A').length,
        'B+': grades.filter(g => g.grade === 'B+').length,
        'B': grades.filter(g => g.grade === 'B').length,
        'C+': grades.filter(g => g.grade === 'C+').length,
        'C': grades.filter(g => g.grade === 'C').length,
        'F': grades.filter(g => g.grade === 'F').length
      };

      const subjectPerformance = {};
      grades.forEach(grade => {
        const subjectName = grade.subject?.name || 'Unknown';
        if (!subjectPerformance[subjectName]) {
          subjectPerformance[subjectName] = { total: 0, sum: 0 };
        }
        subjectPerformance[subjectName].total++;
        subjectPerformance[subjectName].sum += parseFloat(grade.marks_obtained || 0);
      });

      const subjectStats = Object.keys(subjectPerformance).map(subjectName => ({
        subject_name: subjectName,
        name: subjectName,
        average_marks: parseFloat((subjectPerformance[subjectName].sum / subjectPerformance[subjectName].total).toFixed(2))
      }));

      const classPerformance = {};
      grades.forEach(grade => {
        const className = grade.student?.class?.name || 'Unknown';
        if (!classPerformance[className]) {
          classPerformance[className] = { total: 0, sum: 0 };
        }
        classPerformance[className].total++;
        classPerformance[className].sum += parseFloat(grade.marks_obtained || 0);
      });

      const classStats = Object.keys(classPerformance).map(className => ({
        class_name: className,
        name: className,
        average_marks: parseFloat((classPerformance[className].sum / classPerformance[className].total).toFixed(2))
      }));

      return {
        summary: { totalGrades, averageMarks, gradeDistribution },
        bySubject: subjectStats,
        byClass: classStats,
        monthlyTrend: []
      };
    }

    case 'staff-performance': {
      const teachers = await Teacher.findAll({
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
          { model: Class, as: 'classes', attributes: ['id', 'name'] }
        ]
      });

      const where = {};
      if (teacher_id) where.marked_by = teacher_id;
      if (start_date || end_date) {
        where.date = {};
        if (start_date) where.date[Op.gte] = start_date;
        if (end_date) where.date[Op.lte] = end_date;
      }

      const attendanceRecords = await Attendance.findAll({ where });
      const exams = await Exam.findAll({ where: teacher_id ? { created_by: teacher_id } : {} });
      const grades = await Grade.findAll({ where: teacher_id ? { created_by: teacher_id } : {} });

      const teacherStats = teachers.map(teacher => {
        const teacherAttendance = attendanceRecords.filter(a => a.marked_by === teacher.user_id).length;
        const teacherExams = exams.filter(e => e.created_by === teacher.user_id).length;
        const teacherGrades = grades.filter(g => g.created_by === teacher.user_id).length;

        return {
          name: `${teacher.first_name} ${teacher.last_name}`,
          classes: teacher.classes?.length || 0,
          attendanceMarked: teacherAttendance,
          examsCreated: teacherExams,
          gradesEntered: teacherGrades
        };
      });

      return {
        summary: {
          totalTeachers: teachers.length,
          activeTeachers: teachers.filter(t => t.status === 'active').length,
          totalAttendanceMarked: attendanceRecords.length,
          totalExams: exams.length
        },
        teachers: teacherStats
      };
    }

    case 'finance': {
      const fees = await Fee.findAll({
        include: [
          { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
        ],
        order: [['created_at', 'DESC']]
      });

      const payments = await Payment.findAll({
        include: [{ model: Fee, as: 'fee' }],
        order: [['payment_date', 'DESC']]
      });

      const totalFees = fees.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
      const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const pendingAmount = totalFees - totalPayments;

      const feeTypeBreakdown = {};
      fees.forEach(fee => {
        const type = fee.fee_type || 'Other';
        feeTypeBreakdown[type] = (feeTypeBreakdown[type] || 0) + parseFloat(fee.amount || 0);
      });

      const feeTypeStats = Object.keys(feeTypeBreakdown).map(type => ({
        fee_type: type,
        name: type,
        amount: feeTypeBreakdown[type]
      }));

      const monthlyPayments = {};
      payments.forEach(payment => {
        const month = payment.payment_date ? new Date(payment.payment_date).toISOString().slice(0, 7) : 'Unknown';
        monthlyPayments[month] = (monthlyPayments[month] || 0) + parseFloat(payment.amount || 0);
      });

      const monthlyStats = Object.keys(monthlyPayments).sort().map(month => ({
        month,
        name: month,
        amount: monthlyPayments[month]
      }));

      return {
        summary: { totalFees, totalPayments, pendingAmount },
        feeTypeBreakdown: feeTypeStats,
        monthlyPayments: monthlyStats
      };
    }

    case 'attendance': {
      const where = {};
      if (start_date || end_date) {
        where.date = {};
        if (start_date) where.date[Op.gte] = start_date;
        if (end_date) where.date[Op.lte] = end_date;
      }
      if (class_id) {
        const students = await Student.findAll({ where: { class_id }, attributes: ['id'] });
        where.student_id = { [Op.in]: students.map(s => s.id) };
      }
      if (student_id) where.student_id = student_id;

      const attendanceRecords = await Attendance.findAll({
        where,
        include: [
          { model: Student, as: 'student', include: [{ model: Class, as: 'class' }] }
        ],
        order: [['date', 'DESC']]
      });

      const totalRecords = attendanceRecords.length;
      const present = attendanceRecords.filter(a => a.status === 'present').length;
      const absent = attendanceRecords.filter(a => a.status === 'absent').length;
      const late = attendanceRecords.filter(a => a.status === 'late').length;
      const attendanceRate = totalRecords > 0 ? present / totalRecords : 0;

      const dailyTrend = {};
      attendanceRecords.forEach(record => {
        const date = record.date;
        if (!dailyTrend[date]) {
          dailyTrend[date] = { total: 0, present: 0 };
        }
        dailyTrend[date].total++;
        if (record.status === 'present') dailyTrend[date].present++;
      });

      const dailyStats = Object.keys(dailyTrend).sort().map(date => ({
        date,
        name: date,
        attendanceRate: dailyTrend[date].total > 0 ? dailyTrend[date].present / dailyTrend[date].total : 0,
        count: dailyTrend[date].total
      }));

      return {
        summary: { totalRecords, present, absent, late, attendanceRate },
        dailyTrend: dailyStats
      };
    }

    default:
      return {};
  }
};

// Export PDF Report
exports.exportPDFReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    const filters = { startDate: req.query.start_date, endDate: req.query.end_date };

    // Validate report type
    const validTypes = ['student-performance', 'staff-performance', 'finance', 'attendance'];
    if (!validTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
    }

    // Fetch data
    const data = await fetchAnalyticsData(reportType, req.query);

    // Generate PDF
    const pdfBuffer = await exportService.generatePDFReport(reportType, data, filters);

    const timestamp = Date.now();
    const filename = `${reportType}-report-${timestamp}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Export PDF error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report',
      error: error.message || 'Unknown error occurred'
    });
  }
};

// Export Excel Report
exports.exportExcelReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    const filters = { startDate: req.query.start_date, endDate: req.query.end_date };

    // Validate report type
    const validTypes = ['student-performance', 'staff-performance', 'finance', 'attendance'];
    if (!validTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
    }

    // Fetch data
    const data = await fetchAnalyticsData(reportType, req.query);

    // Generate Excel
    const workbook = await exportService.generateExcelReport(reportType, data, filters);

    const timestamp = Date.now();
    const filename = `${reportType}-report-${timestamp}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export Excel error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error generating Excel report',
      error: error.message || 'Unknown error occurred'
    });
  }
};

