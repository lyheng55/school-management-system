'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove 'online' from payment_method enum
    // MySQL requires recreating the enum without 'online'
    await queryInterface.sequelize.query(`
      ALTER TABLE payments 
      MODIFY COLUMN payment_method ENUM('cash', 'bank_transfer', 'cheque', 'other') NOT NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Restore 'online' to payment_method enum
    await queryInterface.sequelize.query(`
      ALTER TABLE payments 
      MODIFY COLUMN payment_method ENUM('cash', 'bank_transfer', 'online', 'cheque', 'other') NOT NULL
    `);
  }
};

