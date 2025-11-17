'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get students and teacher users
    const students = await queryInterface.sequelize.query(
      "SELECT id FROM students ORDER BY id LIMIT 30",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const teacherUsers = await queryInterface.sequelize.query(
      "SELECT u.id FROM users u INNER JOIN teachers t ON u.id = t.user_id WHERE u.role = 'teacher' ORDER BY u.id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const now = new Date();
    const behaviors = [];
    const behaviorTypes = ['positive', 'negative'];
    const positiveDescriptions = [
      'Helped a classmate with homework',
      'Excellent participation in class',
      'Showed leadership in group project',
      'Perfect attendance this month',
      'Outstanding performance in exam',
      'Volunteered for school event',
      'Demonstrated good sportsmanship'
    ];
    const negativeDescriptions = [
      'Late to class',
      'Did not complete homework',
      'Disruptive behavior in class',
      'Absent without notice',
      'Incomplete assignment',
      'Needs to improve focus',
      'Did not follow classroom rules'
    ];

    // Create behaviors for students
    students.forEach((student, studentIdx) => {
      // 2-3 behaviors per student
      for (let i = 0; i < 2 + (studentIdx % 2); i++) {
        const isPositive = Math.random() > 0.3; // 70% positive
        const type = isPositive ? 'positive' : 'negative';
        const descriptions = isPositive ? positiveDescriptions : negativeDescriptions;
        const description = descriptions[studentIdx % descriptions.length];
        
        const behaviorDate = new Date();
        behaviorDate.setDate(behaviorDate.getDate() - (studentIdx * 2 + i));

        behaviors.push({
          student_id: student.id,
          type: type,
          description: description,
          date: behaviorDate.toISOString().split('T')[0],
          recorded_by: teacherUsers[studentIdx % teacherUsers.length]?.id || 1,
          created_at: now,
          updated_at: now
        });
      }
    });

    await queryInterface.bulkInsert('behaviors', behaviors, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('behaviors', {}, {});
  }
};

