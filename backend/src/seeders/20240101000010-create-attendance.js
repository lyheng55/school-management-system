'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if attendance records already exist
    const existingAttendance = await queryInterface.sequelize.query(
      "SELECT id FROM attendances LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingAttendance.length > 0) {
      console.log('Attendance records already exist, skipping...');
      return;
    } 

    // Get students, classes, and teacher users
    const students = await queryInterface.sequelize.query(
      "SELECT id, class_id FROM students ORDER BY id LIMIT 30",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const teacherUsers = await queryInterface.sequelize.query(
      "SELECT u.id FROM users u INNER JOIN teachers t ON u.id = t.user_id WHERE u.role = 'teacher' ORDER BY u.id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const now = new Date();
    const attendance = [];
    const statuses = ['present', 'absent', 'late'];
    const statusWeights = [0.85, 0.10, 0.05]; // 85% present, 10% absent, 5% late

    // Create attendance records for the last 30 days
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().split('T')[0];
      
      // Skip weekends
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      students.forEach((student, studentIdx) => {
        // Random status based on weights
        const rand = Math.random();
        let status = 'present';
        if (rand < statusWeights[0]) {
          status = 'present';
        } else if (rand < statusWeights[0] + statusWeights[1]) {
          status = 'absent';
        } else {
          status = 'late';
        }

        attendance.push({
          student_id: student.id,
          date: dateStr,
          status: status,
          remarks: status === 'absent' ? 'Absent' : status === 'late' ? 'Arrived late' : null,
          marked_by: teacherUsers[studentIdx % teacherUsers.length]?.id || 1,
          created_at: now,
          updated_at: now
        });
      });
    }

    await queryInterface.bulkInsert('attendances', attendance, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('attendances', {}, {});
  }
};

