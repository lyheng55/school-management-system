'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if admin user already exists
    const existingAdmin = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE username = 'admin' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await queryInterface.bulkInsert('users', [
        {
          username: 'admin',
          email: 'admin@school.com',
          password: hashedPassword,
          role: 'admin', 
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      username: 'admin'
    }, {});
  }
};

