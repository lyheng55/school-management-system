'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('routes', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      start_location: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      end_location: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      stops: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      distance: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      fare: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('routes');
  }
};

