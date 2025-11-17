'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('classes', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for classes table'
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Class name (e.g., Grade 1, Class A)'
      },
      section: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: 'Section identifier (e.g., A, B, C)'
      },
      capacity: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 30,
        validate: {
          min: 1,
          max: 100
        },
        comment: 'Maximum number of students'
      },
      classroom: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Physical classroom location'
      },
      class_teacher_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Foreign key to teachers table'
      },
      academic_year: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Academic year (e.g., 2024-2025)'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        comment: 'Class status'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Record creation timestamp'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        comment: 'Record last update timestamp'
      }
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: 'Classes/Sections table'
    });

    // Add composite unique index for name + academic_year
    await queryInterface.addIndex('classes', ['name', 'academic_year'], {
      name: 'idx_classes_name_year',
      unique: true
    });

    await queryInterface.addIndex('classes', ['academic_year'], {
      name: 'idx_classes_academic_year'
    });

    await queryInterface.addIndex('classes', ['status'], {
      name: 'idx_classes_status'
    });

    await queryInterface.addIndex('classes', ['class_teacher_id'], {
      name: 'idx_classes_teacher'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('classes');
  }
};

