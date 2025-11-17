'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assets', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      asset_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('lab_equipment', 'stationery', 'furniture', 'electronics', 'sports', 'other'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      location: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      purchase_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      purchase_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('available', 'in_use', 'maintenance', 'damaged', 'disposed'),
        defaultValue: 'available'
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
    await queryInterface.dropTable('assets');
  }
};

