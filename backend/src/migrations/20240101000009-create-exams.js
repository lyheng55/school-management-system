'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('exams', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for exams table'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Exam name'
      },
      class_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to classes table'
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
      exam_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      total_marks: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100
      },
      passing_marks: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 40
      },
      room: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
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
      comment: 'Examination schedules table'
    });

    // Add indexes
    await queryInterface.addIndex('exams', ['class_id'], {
      name: 'idx_exams_class_id'
    });

    await queryInterface.addIndex('exams', ['subject_id'], {
      name: 'idx_exams_subject_id'
    });

    await queryInterface.addIndex('exams', ['exam_date'], {
      name: 'idx_exams_date'
    });

    await queryInterface.addIndex('exams', ['class_id', 'exam_date'], {
      name: 'idx_exams_class_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('exams');
  }
};

