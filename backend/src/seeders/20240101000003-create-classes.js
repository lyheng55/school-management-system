'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if classes already exist for current academic year
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    const existingClasses = await queryInterface.sequelize.query(
      `SELECT id FROM classes WHERE academic_year = '${academicYear}' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingClasses.length > 0) {
      console.log('Classes already exist for this academic year, skipping...');
      return;
    }

    // Get teacher IDs
    const teachers = await queryInterface.sequelize.query(
      "SELECT id FROM teachers ORDER BY id LIMIT 5",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const now = new Date();

    const classes = [
      {
        name: 'Grade 1-A',
        section: 'A',
        capacity: 30,
        classroom: 'Room 101',
        class_teacher_id: teachers[0]?.id || null,
        academic_year: academicYear,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        name: 'Grade 1-B',
        section: 'B',
        capacity: 30,
        classroom: 'Room 102',
        class_teacher_id: teachers[1]?.id || null,
        academic_year: academicYear,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        name: 'Grade 2-A',
        section: 'A',
        capacity: 30, 
        classroom: 'Room 201',
        class_teacher_id: teachers[2]?.id || null,
        academic_year: academicYear,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        name: 'Grade 2-B',
        section: 'B',
        capacity: 30,
        classroom: 'Room 202',
        class_teacher_id: teachers[3]?.id || null,
        academic_year: academicYear,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        name: 'Grade 3-A',
        section: 'A',
        capacity: 30,
        classroom: 'Room 301',
        class_teacher_id: teachers[4]?.id || null,
        academic_year: academicYear,
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('classes', classes, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('classes', {
      name: { [Sequelize.Op.in]: ['Grade 1', 'Grade 2', 'Grade 3'] }
    }, {});
  }
};

