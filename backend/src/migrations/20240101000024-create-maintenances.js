'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('maintenances', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      asset_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'assets',
          key: 'id'
        }
      },
      maintenance_type: {
        type: Sequelize.ENUM('repair', 'service', 'inspection', 'upgrade', 'other'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      scheduled_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      completed_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      vendor: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'scheduled'
      },
      created_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
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
    await queryInterface.dropTable('maintenances');
  }
};

