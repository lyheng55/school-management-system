/**
 * Script to add parent data to the database
 * Usage: node backend/scripts/add-parent-data.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize } = require('../src/config/database');
const { User, Parent } = require('../src/models');
const bcrypt = require('bcryptjs');

const parentData = [
  {
    user: {
      username: 'parent6',
      email: 'parent6@example.com',
      password: 'parent123',
      role: 'parent',
      is_active: true
    },
    parent: {
      first_name: 'Sokha',
      last_name: 'Heng',
      phone: '012666666',
      address: '111 Street 111, Phnom Penh',
      occupation: 'Accountant',
      relationship: 'father'
    }
  },
  {
    user: {
      username: 'parent7',
      email: 'parent7@example.com',
      password: 'parent123',
      role: 'parent',
      is_active: true
    },
    parent: {
      first_name: 'Sreyneang',
      last_name: 'Sok',
      phone: '012777777',
      address: '222 Street 222, Phnom Penh',
      occupation: 'Nurse',
      relationship: 'mother'
    }
  },
  {
    user: {
      username: 'parent8',
      email: 'parent8@example.com',
      password: 'parent123',
      role: 'parent',
      is_active: true
    },
    parent: {
      first_name: 'Rithy',
      last_name: 'Chea',
      phone: '012888888',
      address: '333 Street 333, Phnom Penh',
      occupation: 'Lawyer',
      relationship: 'father'
    }
  },
  {
    user: {
      username: 'parent9',
      email: 'parent9@example.com',
      password: 'parent123',
      role: 'parent',
      is_active: true
    },
    parent: {
      first_name: 'Sophat',
      last_name: 'Nop',
      phone: '012999999',
      address: '444 Street 444, Phnom Penh',
      occupation: 'Pharmacist',
      relationship: 'father'
    }
  },
  {
    user: {
      username: 'parent10',
      email: 'parent10@example.com',
      password: 'parent123',
      role: 'parent',
      is_active: true
    },
    parent: {
      first_name: 'Chamroeun',
      last_name: 'Sok',
      phone: '012000000',
      address: '555 Street 555, Phnom Penh',
      occupation: 'Architect',
      relationship: 'father'
    }
  },
  {
    user: {
      username: 'parent11',
      email: 'parent11@example.com',
      password: 'parent123',
      role: 'parent',
      is_active: true
    },
    parent: {
      first_name: 'Sopheap',
      last_name: 'Heng',
      phone: '012111112',
      address: '666 Street 666, Phnom Penh',
      occupation: 'Dentist',
      relationship: 'mother'
    }
  },
  {
    user: {
      username: 'parent12',
      email: 'parent12@example.com',
      password: 'parent123',
      role: 'parent',
      is_active: true
    },
    parent: {
      first_name: 'Sokun',
      last_name: 'Vann',
      phone: '012222223',
      address: '777 Street 777, Phnom Penh',
      occupation: 'Veterinarian',
      relationship: 'father'
    }
  },
  {
    user: {
      username: 'parent13',
      email: 'parent13@example.com',
      password: 'parent123',
      role: 'parent',
      is_active: true
    },
    parent: {
      first_name: 'Srey',
      last_name: 'Kong',
      phone: '012333334',
      address: '888 Street 888, Phnom Penh',
      occupation: 'Chef',
      relationship: 'mother'
    }
  },
  {
    user: {
      username: 'parent14',
      email: 'parent14@example.com',
      password: 'parent123',
      role: 'parent',
      is_active: true
    },
    parent: {
      first_name: 'Ratha',
      last_name: 'Ly',
      phone: '012444445',
      address: '999 Street 999, Phnom Penh',
      occupation: 'Pilot',
      relationship: 'father'
    }
  },
  {
    user: {
      username: 'parent15',
      email: 'parent15@example.com',
      password: 'parent123',
      role: 'parent',
      is_active: true
    },
    parent: {
      first_name: 'Sokheng',
      last_name: 'Chan',
      phone: '012555556',
      address: '1010 Street 1010, Phnom Penh',
      occupation: 'Designer',
      relationship: 'guardian'
    }
  }
];

async function addParents() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const hashedPassword = await bcrypt.hash('parent123', 10);
    let addedCount = 0;
    let skippedCount = 0;

    for (const data of parentData) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          where: {
            [sequelize.Sequelize.Op.or]: [
              { username: data.user.username },
              { email: data.user.email }
            ]
          }
        });

        if (existingUser) {
          console.log(`⚠️  User ${data.user.username} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Create user
        const user = await User.create({
          ...data.user,
          password: hashedPassword
        });

        console.log(`✅ Created user: ${user.username} (ID: ${user.id})`);

        // Create parent profile
        const parent = await Parent.create({
          ...data.parent,
          user_id: user.id
        });

        console.log(`✅ Created parent profile: ${data.parent.first_name} ${data.parent.last_name} (ID: ${parent.id})`);
        addedCount++;
      } catch (error) {
        console.error(`❌ Error adding ${data.user.username}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Added: ${addedCount} parents`);
    console.log(`   ⚠️  Skipped: ${skippedCount} parents`);
    console.log(`   📝 Total processed: ${parentData.length} parents`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
addParents();

