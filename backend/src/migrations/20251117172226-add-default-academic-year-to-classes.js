'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add default value to academic_year column
    await queryInterface.changeColumn('classes', 'academic_year', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: '2024-2025',
      comment: 'Academic year (e.g., 2024-2025)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove default value (revert to no default)
    await queryInterface.changeColumn('classes', 'academic_year', {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: 'Academic year (e.g., 2024-2025)'
    });
  }
};
