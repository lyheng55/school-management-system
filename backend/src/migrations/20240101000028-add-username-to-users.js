'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if username column already exists
    const tableDescription = await queryInterface.describeTable('users');
    
    // Add username column if it doesn't exist
    if (!tableDescription.username) {
      await queryInterface.addColumn('users', 'username', {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        after: 'id'
      });

      // Make username required after adding it
      await queryInterface.changeColumn('users', 'username', {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      });
    }

    // Make email nullable (optional) since we're using username now
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove username column
    await queryInterface.removeColumn('users', 'username');
    
    // Restore email to required
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    });
  }
};

