'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('borrows', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      book_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        }
      },
      student_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        }
      },
      borrow_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      return_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      late_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('borrowed', 'returned', 'overdue', 'lost'),
        defaultValue: 'borrowed'
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
    await queryInterface.dropTable('borrows');
  }
};

