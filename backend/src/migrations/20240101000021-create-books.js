'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('books', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      isbn: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      author: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      publisher: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      publication_year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      total_copies: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      available_copies: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      shelf_location: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('available', 'unavailable', 'lost', 'damaged'),
        defaultValue: 'available'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('books');
  }
};

