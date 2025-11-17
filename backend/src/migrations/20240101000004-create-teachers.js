'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('teachers', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for teachers table'
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to users table'
      },
      teacher_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique teacher identification number'
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: false
      },
      photo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      qualification: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      specialization: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      experience_years: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      joining_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      salary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'resigned', 'retired'),
        defaultValue: 'active'
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
      comment: 'Teachers table - contains teacher profile information'
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('teachers', ['teacher_id'], {
      name: 'idx_teachers_teacher_id',
      unique: true
    });

    await queryInterface.addIndex('teachers', ['status'], {
      name: 'idx_teachers_status'
    });

    await queryInterface.addIndex('teachers', ['first_name', 'last_name'], {
      name: 'idx_teachers_name'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('teachers');
  }
};

