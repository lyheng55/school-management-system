'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'telegram_chat_id', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
      comment: 'Telegram chat ID for notifications'
    });

    // Add index for faster lookups
    await queryInterface.addIndex('users', ['telegram_chat_id'], {
      name: 'idx_users_telegram_chat_id',
      unique: true,
      where: {
        telegram_chat_id: { [Sequelize.Op.ne]: null }
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', 'idx_users_telegram_chat_id');
    await queryInterface.removeColumn('users', 'telegram_chat_id');
  }
};

