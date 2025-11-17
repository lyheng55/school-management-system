'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('grades', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for grades table'
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
      exam_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'exams',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to exams table'
      },
      subject_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to subjects table'
      },
      marks_obtained: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      grade: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      entered_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to users table - who entered the grade'
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
      comment: 'Student grades/exam results table'
    });

    // Add indexes
    await queryInterface.addIndex('grades', ['student_id'], {
      name: 'idx_grades_student_id'
    });

    await queryInterface.addIndex('grades', ['exam_id'], {
      name: 'idx_grades_exam_id'
    });

    await queryInterface.addIndex('grades', ['subject_id'], {
      name: 'idx_grades_subject_id'
    });

    await queryInterface.addIndex('grades', ['student_id', 'exam_id'], {
      name: 'idx_grades_student_exam'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('grades');
  }
};

