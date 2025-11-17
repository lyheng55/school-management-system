'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vehicles', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      vehicle_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      vehicle_type: {
        type: Sequelize.ENUM('bus', 'van', 'car', 'other'),
        allowNull: false
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      route_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'routes',
          key: 'id'
        }
      },
      driver_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'drivers',
          key: 'id'
        }
      },
      registration_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      insurance_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'maintenance'),
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
    await queryInterface.dropTable('vehicles');
  }
};

