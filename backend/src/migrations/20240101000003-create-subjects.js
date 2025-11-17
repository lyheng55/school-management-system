'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subjects', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for subjects table'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Subject name'
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Unique subject code'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Subject description'
      },
      credits: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 1,
        validate: {
          min: 1
        },
        comment: 'Credit hours'
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
      comment: 'Academic subjects table'
    });

    // Add indexes
    await queryInterface.addIndex('subjects', ['code'], {
      name: 'idx_subjects_code',
      unique: true
    });

    await queryInterface.addIndex('subjects', ['name'], {
      name: 'idx_subjects_name'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subjects');
  }
};

