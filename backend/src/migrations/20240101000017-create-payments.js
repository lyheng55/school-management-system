'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      fee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'fees',
          key: 'id'
        }
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'bank_transfer', 'online', 'cheque', 'other'),
        allowNull: false
      },
      transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      payment_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        },
      receipt_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      processed_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
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
    await queryInterface.dropTable('payments');
  }
};

