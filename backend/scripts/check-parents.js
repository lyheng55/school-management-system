/**
 * Script to check if parents exist in the database
 * Usage: node backend/scripts/check-parents.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize } = require('../src/config/database');
const { User, Parent } = require('../src/models');

async function checkParents() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.\n');

    // Check users with parent role
    const parentUsers = await User.findAll({
      where: { role: 'parent' },
      attributes: ['id', 'username', 'email', 'role', 'is_active']
    });

    console.log(`📊 Found ${parentUsers.length} parent users:`);
    parentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (ID: ${user.id}, Email: ${user.email}, Active: ${user.is_active})`);
    });

    // Check parent profiles
    const parents = await Parent.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
      ],
      order: [['id', 'ASC']]
    });

    console.log(`\n📊 Found ${parents.length} parent profiles:`);
    parents.forEach((parent, index) => {
      console.log(`   ${index + 1}. ${parent.first_name} ${parent.last_name} (ID: ${parent.id})`);
      console.log(`      Phone: ${parent.phone}, Relationship: ${parent.relationship}`);
      console.log(`      User: ${parent.user?.username || 'N/A'} (User ID: ${parent.user_id})`);
      console.log(`      Children: ${parent.students?.length || 0}`);
      console.log('');
    });

    if (parents.length === 0) {
      console.log('⚠️  No parent profiles found in database.');
      console.log('💡 Run the seeder or add-parent-data script to create parents.');
      console.log('   - Seeder: npx sequelize-cli db:seed --seed 20240101000005-create-parents.js');
      console.log('   - Script: node backend/scripts/add-parent-data.js');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
checkParents();

