'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get classes, subjects, and teachers
    const classes = await queryInterface.sequelize.query(
      "SELECT id FROM classes ORDER BY id LIMIT 5",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const subjects = await queryInterface.sequelize.query(
      "SELECT id FROM subjects ORDER BY id LIMIT 8",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const teachers = await queryInterface.sequelize.query(
      "SELECT id FROM teachers ORDER BY id LIMIT 5",
      { type: Sequelize.QueryTypes.SELECT }
    ); 

    const now = new Date();
    const timetables = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { start: '08:00:00', end: '08:45:00' },
      { start: '08:45:00', end: '09:30:00' },
      { start: '09:45:00', end: '10:30:00' },
      { start: '10:30:00', end: '11:15:00' },
      { start: '11:30:00', end: '12:15:00' },
      { start: '13:00:00', end: '13:45:00' },
      { start: '13:45:00', end: '14:30:00' }
    ];

    // Create timetables for each class
    classes.forEach((classItem, classIdx) => {
      days.forEach((day, dayIdx) => {
        // 5-6 periods per day
        for (let period = 0; period < 6; period++) {
          const subjectIdx = (classIdx * 6 + dayIdx * 6 + period) % subjects.length;
          const teacherIdx = (classIdx + period) % teachers.length;
          const timeSlot = timeSlots[period % timeSlots.length];

          timetables.push({
            class_id: classItem.id,
            subject_id: subjects[subjectIdx].id,
            teacher_id: teachers[teacherIdx].id,
            day_of_week: day,
            start_time: timeSlot.start,
            end_time: timeSlot.end,
            room: `Room ${100 + classIdx * 10 + period}`,
            created_at: now,
            updated_at: now
          });
        }
      });
    });

    await queryInterface.bulkInsert('timetables', timetables, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('timetables', {}, {});
  }
};

