'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if parent users already exist
    const existingParentUsers = await queryInterface.sequelize.query(
      "SELECT username FROM users WHERE username LIKE 'parent%' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingParentUsers.length > 0) {
      console.log('Parent users already exist, skipping...');
      return;
    } 

    const hashedPassword = await bcrypt.hash('parent123', 10);
    const now = new Date();

    // Create parent users
    const parentUsers = [
      {
        username: 'parent1',
        email: 'parent1@example.com',
        password: hashedPassword,
        role: 'parent',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'parent2',
        email: 'parent2@example.com',
        password: hashedPassword,
        role: 'parent',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'parent3',
        email: 'parent3@example.com',
        password: hashedPassword,
        role: 'parent',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'parent4',
        email: 'parent4@example.com',
        password: hashedPassword,
        role: 'parent',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'parent5',
        email: 'parent5@example.com',
        password: hashedPassword,
        role: 'parent',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'parent6',
        email: 'parent6@example.com',
        password: hashedPassword,
        role: 'parent',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'parent7',
        email: 'parent7@example.com',
        password: hashedPassword,
        role: 'parent',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'parent8',
        email: 'parent8@example.com',
        password: hashedPassword,
        role: 'parent',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'parent9',
        email: 'parent9@example.com',
        password: hashedPassword,
        role: 'parent',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'parent10',
        email: 'parent10@example.com',
        password: hashedPassword,
        role: 'parent',
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('users', parentUsers, {});

    // Get inserted parent user IDs
    const insertedParents = await queryInterface.sequelize.query(
      "SELECT id, username FROM users WHERE username LIKE 'parent%' ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Check if parents already exist
    const existingParents = await queryInterface.sequelize.query(
      "SELECT id FROM parents LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingParents.length > 0) {
      console.log('Parents already exist, skipping...');
      return;
    }

    // Create parent profiles
    const relationships = ['father', 'mother', 'father', 'mother', 'guardian', 'father', 'mother', 'father', 'father', 'guardian'];
    const parents = [
      {
        user_id: insertedParents[0].id,
        first_name: 'Sok',
        last_name: 'Chan',
        phone: '012111111',
        address: '123 Street 123, Phnom Penh',
        occupation: 'Engineer',
        relationship: relationships[0],
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedParents[1].id,
        first_name: 'Srey',
        last_name: 'Sopheap',
        phone: '012222222',
        address: '456 Street 456, Phnom Penh',
        occupation: 'Teacher',
        relationship: relationships[1],
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedParents[2].id,
        first_name: 'Ratha',
        last_name: 'Vann',
        phone: '012333333',
        address: '789 Street 789, Phnom Penh',
        occupation: 'Business Owner',
        relationship: relationships[2],
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedParents[3].id,
        first_name: 'Sopheap',
        last_name: 'Kong',
        phone: '012444444',
        address: '321 Street 321, Phnom Penh',
        occupation: 'Doctor',
        relationship: relationships[3],
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedParents[4].id,
        first_name: 'Chanthou',
        last_name: 'Ly',
        phone: '012555555',
        address: '654 Street 654, Phnom Penh',
        occupation: 'Nurse',
        relationship: relationships[4],
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedParents[5].id,
        first_name: 'Sokha',
        last_name: 'Heng',
        phone: '012666666',
        address: '111 Street 111, Phnom Penh',
        occupation: 'Accountant',
        relationship: relationships[5],
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedParents[6].id,
        first_name: 'Sreyneang',
        last_name: 'Sok',
        phone: '012777777',
        address: '222 Street 222, Phnom Penh',
        occupation: 'Nurse',
        relationship: relationships[6],
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedParents[7].id,
        first_name: 'Rithy',
        last_name: 'Chea',
        phone: '012888888',
        address: '333 Street 333, Phnom Penh',
        occupation: 'Lawyer',
        relationship: relationships[7],
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedParents[8].id,
        first_name: 'Sophat',
        last_name: 'Nop',
        phone: '012999999',
        address: '444 Street 444, Phnom Penh',
        occupation: 'Pharmacist',
        relationship: relationships[8],
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedParents[9].id,
        first_name: 'Chamroeun',
        last_name: 'Sok',
        phone: '012000000',
        address: '555 Street 555, Phnom Penh',
        occupation: 'Architect',
        relationship: relationships[9],
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('parents', parents, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('parents', {
      email: { [Sequelize.Op.like]: '%@example.com' }
    }, {});
    
    await queryInterface.bulkDelete('users', {
      username: { [Sequelize.Op.like]: 'parent%' }
    }, {});
  }
};

