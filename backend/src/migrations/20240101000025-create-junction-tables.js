'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ClassSubjects junction table
    await queryInterface.createTable('ClassSubjects', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for ClassSubjects junction table'
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to subjects table'
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
      comment: 'Junction table for classes and subjects (many-to-many)'
    });

    // TeacherSubjects junction table
    await queryInterface.createTable('TeacherSubjects', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for TeacherSubjects junction table'
      },
      teacher_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'teachers',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to teachers table'
      },
      subject_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to subjects table'
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
      comment: 'Junction table for teachers and subjects (many-to-many)'
    });

    // Add indexes
    await queryInterface.addIndex('ClassSubjects', ['class_id'], {
      name: 'idx_class_subjects_class_id'
    });

    await queryInterface.addIndex('ClassSubjects', ['subject_id'], {
      name: 'idx_class_subjects_subject_id'
    });

    await queryInterface.addIndex('ClassSubjects', ['class_id', 'subject_id'], {
      name: 'idx_class_subjects_unique',
      unique: true
    });

    await queryInterface.addIndex('TeacherSubjects', ['teacher_id'], {
      name: 'idx_teacher_subjects_teacher_id'
    });

    await queryInterface.addIndex('TeacherSubjects', ['subject_id'], {
      name: 'idx_teacher_subjects_subject_id'
    });

    await queryInterface.addIndex('TeacherSubjects', ['teacher_id', 'subject_id'], {
      name: 'idx_teacher_subjects_unique',
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TeacherSubjects');
    await queryInterface.dropTable('ClassSubjects');
  }
};

