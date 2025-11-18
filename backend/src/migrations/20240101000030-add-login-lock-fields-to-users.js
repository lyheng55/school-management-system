'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'login_attempts', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of failed login attempts'
    });

    await queryInterface.addColumn('users', 'is_locked', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the account is locked due to failed login attempts'
    });

    await queryInterface.addColumn('users', 'locked_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when the account was locked'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'login_attempts');
    await queryInterface.removeColumn('users', 'is_locked');
    await queryInterface.removeColumn('users', 'locked_at');
  }
};

