'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get students
    const students = await queryInterface.sequelize.query(
      "SELECT id FROM students ORDER BY id LIMIT 30",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const now = new Date();
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    const fees = [];
    const feeTypes = ['tuition', 'library', 'sports', 'lab', 'transport'];
    const feeAmounts = {
      'tuition': 500.00,
      'library': 50.00,
      'sports': 75.00,
      'lab': 100.00,
      'transport': 150.00
    };
 
    // Create fees for each student
    students.forEach((student, studentIdx) => {
      feeTypes.forEach((feeType, typeIdx) => {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + typeIdx + 1);
        
        // Random status
        const statusRand = Math.random();
        let status = 'pending';
        if (statusRand < 0.4) status = 'paid';
        else if (statusRand < 0.6) status = 'partial';
        else if (statusRand < 0.8) status = 'pending';
        else status = 'overdue';

        fees.push({
          student_id: student.id,
          fee_type: feeType,
          amount: feeAmounts[feeType],
          due_date: dueDate.toISOString().split('T')[0],
          academic_year: academicYear,
          description: `${feeType.charAt(0).toUpperCase() + feeType.slice(1)} fee for student`,
          status: status,
          created_at: now,
          updated_at: now
        });
      });
    });

    await queryInterface.bulkInsert('fees', fees, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('fees', {}, {});
  }
};

