'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fees', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      student_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        }
      },
      fee_type: {
        type: Sequelize.ENUM('tuition', 'library', 'sports', 'lab', 'transport', 'other'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      academic_year: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: '2024-2025'
      },
      term: {
        type: Sequelize.ENUM('first', 'second', 'third', 'annual'),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'partial', 'overdue'),
        defaultValue: 'pending'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('fees');
  }
};

