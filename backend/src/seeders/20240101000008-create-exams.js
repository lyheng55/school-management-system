'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get classes, subjects, and teachers
    const classes = await queryInterface.sequelize.query(
      "SELECT id FROM classes ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const subjects = await queryInterface.sequelize.query(
      "SELECT id FROM subjects ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const teachers = await queryInterface.sequelize.query(
      "SELECT id FROM teachers ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const now = new Date();
    const exams = [];
    const examTypes = ['midterm', 'final', 'quiz', 'assignment'];
    
    // Create exams for each class and subject combination
    classes.forEach((classItem, classIdx) => {
      subjects.slice(0, 5).forEach((subject, subjectIdx) => {
        examTypes.forEach((type, typeIdx) => {
          const examDate = new Date();
          examDate.setDate(examDate.getDate() + (classIdx * 7) + (subjectIdx * 2) + typeIdx);
          
          exams.push({
            class_id: classItem.id,
            subject_id: subject.id,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Exam - ${subject.name}`,
            exam_date: examDate.toISOString().split('T')[0],
            start_time: '09:00:00',
            end_time: '11:00:00',
            total_marks: type === 'final' ? 100 : type === 'midterm' ? 50 : 25,
            passing_marks: type === 'final' ? 40 : type === 'midterm' ? 20 : 10,
            room: `Room ${200 + classIdx}`,
            instructions: `${type} examination for ${subject.name}. Please bring your own stationery.`,
            created_at: now,
            updated_at: now
          });
        });
      });
    });

    await queryInterface.bulkInsert('exams', exams, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('exams', {}, {});
  }
};

