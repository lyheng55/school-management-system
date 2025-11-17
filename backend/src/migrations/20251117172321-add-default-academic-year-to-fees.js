'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add default value to academic_year column in fees table
    await queryInterface.changeColumn('fees', 'academic_year', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: '2024-2025'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove default value (revert to no default)
    await queryInterface.changeColumn('fees', 'academic_year', {
      type: Sequelize.STRING(20),
      allowNull: false
    });
  }
};
