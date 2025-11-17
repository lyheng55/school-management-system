'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if grades already exist
    const existingGrades = await queryInterface.sequelize.query(
      "SELECT id FROM grades LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingGrades.length > 0) {
      console.log('Grades already exist, skipping...');
      return;
    }
 
    // Get students, exams, subjects, and teacher users
    const students = await queryInterface.sequelize.query(
      "SELECT id FROM students ORDER BY id LIMIT 30",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const exams = await queryInterface.sequelize.query(
      "SELECT id, subject_id, total_marks FROM exams ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const teacherUsers = await queryInterface.sequelize.query(
      "SELECT u.id FROM users u INNER JOIN teachers t ON u.id = t.user_id WHERE u.role = 'teacher' ORDER BY u.id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const now = new Date();
    const grades = [];

    // Create grades for students and exams
    exams.forEach((exam, examIdx) => {
      // Get students in the same class as the exam
      const classStudents = students.slice(0, 6); // 6 students per class
      
      classStudents.forEach((student, studentIdx) => {
        // Generate random marks (60-95% of total marks)
        const percentage = 0.60 + (Math.random() * 0.35);
        const marksObtained = Math.round(exam.total_marks * percentage * 100) / 100;
        
        // Calculate grade
        let grade = 'F';
        const percentageGrade = (marksObtained / exam.total_marks) * 100;
        if (percentageGrade >= 90) grade = 'A+';
        else if (percentageGrade >= 80) grade = 'A';
        else if (percentageGrade >= 70) grade = 'B+';
        else if (percentageGrade >= 60) grade = 'B';
        else if (percentageGrade >= 50) grade = 'C+';
        else if (percentageGrade >= 40) grade = 'C';
        
        grades.push({
          student_id: student.id,
          exam_id: exam.id,
          subject_id: exam.subject_id,
          marks_obtained: marksObtained,
          grade: grade,
          remarks: percentageGrade >= 80 ? 'Excellent' : percentageGrade >= 60 ? 'Good' : 'Needs improvement',
          entered_by: teacherUsers[examIdx % teacherUsers.length]?.id || 1,
          created_at: now,
          updated_at: now
        });
      });
    });

    await queryInterface.bulkInsert('grades', grades, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('grades', {}, {});
  }
};

