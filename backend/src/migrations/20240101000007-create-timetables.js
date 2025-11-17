'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('timetables', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for timetables table'
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
      teacher_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'teachers',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to teachers table'
      },
      day_of_week: {
        type: Sequelize.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      room: {
        type: Sequelize.STRING(50),
        allowNull: true
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
      comment: 'Class timetables/schedules table'
    });

    // Add indexes
    await queryInterface.addIndex('timetables', ['class_id'], {
      name: 'idx_timetables_class_id'
    });

    await queryInterface.addIndex('timetables', ['teacher_id'], {
      name: 'idx_timetables_teacher_id'
    });

    await queryInterface.addIndex('timetables', ['day_of_week'], {
      name: 'idx_timetables_day'
    });

    await queryInterface.addIndex('timetables', ['class_id', 'day_of_week'], {
      name: 'idx_timetables_class_day'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('timetables');
  }
};

