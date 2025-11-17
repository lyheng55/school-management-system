'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key for users table'
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique username for login'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        },
        comment: 'Optional email address'
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Hashed password'
      },
      role: {
        type: Sequelize.ENUM('admin', 'teacher', 'student', 'parent'),
        allowNull: false,
        defaultValue: 'student',
        comment: 'User role in the system'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Account activation status'
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last login timestamp'
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JWT refresh token'
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
      comment: 'System users table - base table for all user types'
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('users', ['username'], {
      name: 'idx_users_username',
      unique: true
    });

    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email',
      unique: true
    });

    await queryInterface.addIndex('users', ['role'], {
      name: 'idx_users_role'
    });

    await queryInterface.addIndex('users', ['is_active'], {
      name: 'idx_users_is_active'
    });

    await queryInterface.addIndex('users', ['role', 'is_active'], {
      name: 'idx_users_role_active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};

