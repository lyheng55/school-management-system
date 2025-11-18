'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Simplify target_audience enum to internal-only (remove 'students' and 'parents')
    // First, update any existing announcements with 'students' or 'parents' to 'all'
    await queryInterface.sequelize.query(`
      UPDATE announcements 
      SET target_audience = 'all' 
      WHERE target_audience IN ('students', 'parents')
    `);

    // Then alter the enum to remove 'students' and 'parents'
    await queryInterface.sequelize.query(`
      ALTER TABLE announcements 
      MODIFY COLUMN target_audience ENUM('all', 'teachers', 'staff') NOT NULL DEFAULT 'all'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Restore 'students' and 'parents' to target_audience enum
    await queryInterface.sequelize.query(`
      ALTER TABLE announcements 
      MODIFY COLUMN target_audience ENUM('all', 'students', 'teachers', 'parents', 'staff') NOT NULL DEFAULT 'all'
    `);
  }
};

