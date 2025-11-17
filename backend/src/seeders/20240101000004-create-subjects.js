'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Check if subjects already exist
    const existingSubjects = await queryInterface.sequelize.query(
      "SELECT id FROM subjects LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingSubjects.length > 0) {
      console.log('Subjects already exist, skipping...');
      return;
    }
 
    const subjects = [
      {
        name: 'Mathematics',
        code: 'MATH',
        description: 'Basic mathematics and arithmetic',
        credits: 4,
        created_at: now,
        updated_at: now
      },
      {
        name: 'Science',
        code: 'SCI',
        description: 'General science including biology, chemistry, and physics',
        credits: 4,
        created_at: now,
        updated_at: now
      },
      {
        name: 'English',
        code: 'ENG',
        description: 'English language and literature',
        credits: 3,
        created_at: now,
        updated_at: now
      },
      {
        name: 'Khmer Language',
        code: 'KHM',
        description: 'Khmer language and literature',
        credits: 3,
        created_at: now,
        updated_at: now
      },
      {
        name: 'Social Studies',
        code: 'SOC',
        description: 'History, geography, and civics',
        credits: 3,
        created_at: now,
        updated_at: now
      },
      {
        name: 'Physical Education',
        code: 'PE',
        description: 'Sports and physical activities',
        credits: 2,
        created_at: now,
        updated_at: now
      },
      {
        name: 'Arts',
        code: 'ART',
        description: 'Drawing, painting, and creative arts',
        credits: 2,
        created_at: now,
        updated_at: now
      },
      {
        name: 'Computer Science',
        code: 'CS',
        description: 'Basic computer skills and programming',
        credits: 3,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('subjects', subjects, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('subjects', {
      code: { [Sequelize.Op.in]: ['MATH', 'SCI', 'ENG', 'KHM', 'SOC', 'PE', 'ART', 'CS'] }
    }, {});
  }
};

