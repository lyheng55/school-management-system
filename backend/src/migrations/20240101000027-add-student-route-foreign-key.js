'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign key constraint after routes table exists
    await queryInterface.addConstraint('students', {
      fields: ['route_id'],
      type: 'foreign key',
      name: 'students_route_id_fk',
      references: {
        table: 'routes',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('students', 'students_route_id_fk');
  }
};

