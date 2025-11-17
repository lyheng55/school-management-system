'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('students', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for students table'
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
      student_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique student identification number'
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
        allowNull: false
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
      emergency_contact: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      emergency_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      admission_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      class_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'classes',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to classes table'
      },
      parent_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'parents',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to parents table'
      },
      route_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Foreign key to routes table (added later)'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'graduated', 'transferred'),
        defaultValue: 'active'
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
      comment: 'Students table - contains student profile information'
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('students', ['student_id'], {
      name: 'idx_students_student_id',
      unique: true
    });

    await queryInterface.addIndex('students', ['class_id'], {
      name: 'idx_students_class_id'
    });

    await queryInterface.addIndex('students', ['parent_id'], {
      name: 'idx_students_parent_id'
    });

    await queryInterface.addIndex('students', ['status'], {
      name: 'idx_students_status'
    });

    await queryInterface.addIndex('students', ['class_id', 'status'], {
      name: 'idx_students_class_status'
    });

    await queryInterface.addIndex('students', ['first_name', 'last_name'], {
      name: 'idx_students_name'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('students');
  }
};

