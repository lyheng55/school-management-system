'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign key constraint after teachers table exists
    await queryInterface.addConstraint('classes', {
      fields: ['class_teacher_id'],
      type: 'foreign key',
      name: 'classes_class_teacher_id_fk',
      references: {
        table: 'teachers',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('classes', 'classes_class_teacher_id_fk');
  }
};

