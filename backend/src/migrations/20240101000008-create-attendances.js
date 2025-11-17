'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attendances', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for attendances table'
      },
      student_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to students table'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('present', 'absent', 'late', 'excused'),
        allowNull: false,
        defaultValue: 'present'
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      marked_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to users table - who marked the attendance'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record creation timestamp'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record last update timestamp'
      }
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: 'Attendance records table'
    });

    // Add composite unique index to prevent duplicate attendance entries
    await queryInterface.addIndex('attendances', ['student_id', 'date'], {
      unique: true,
      name: 'idx_attendances_student_date_unique'
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('attendances', ['student_id'], {
      name: 'idx_attendances_student_id'
    });

    await queryInterface.addIndex('attendances', ['date'], {
      name: 'idx_attendances_date'
    });

    await queryInterface.addIndex('attendances', ['status'], {
      name: 'idx_attendances_status'
    });

    await queryInterface.addIndex('attendances', ['student_id', 'date', 'status'], {
      name: 'idx_attendances_student_date_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('attendances');
  }
};

