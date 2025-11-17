'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('teacher123', 10);
    const now = new Date();
    
    // Check if teachers already exist
    const existingTeachers = await queryInterface.sequelize.query(
      "SELECT username FROM users WHERE username LIKE 'teacher%' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingTeachers.length > 0) {
      console.log('Teachers already exist, skipping...');
      return;
    }

    // Create teacher users
    const teachers = [
      {
        username: 'teacher1',
        email: 'john.smith@school.com',
        password: hashedPassword,
        role: 'teacher',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'teacher2',
        email: 'sarah.johnson@school.com',
        password: hashedPassword,
        role: 'teacher',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'teacher3',
        email: 'michael.brown@school.com',
        password: hashedPassword,
        role: 'teacher',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'teacher4',
        email: 'emily.davis@school.com',
        password: hashedPassword,
        role: 'teacher',
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        username: 'teacher5',
        email: 'david.wilson@school.com',
        password: hashedPassword,
        role: 'teacher',
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('users', teachers, {});
    
    // Get inserted user IDs
    const insertedUsers = await queryInterface.sequelize.query(
      "SELECT id, username FROM users WHERE username LIKE 'teacher%' ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create teacher profiles
    const teacherProfiles = [
      {
        user_id: insertedUsers[0].id,
        teacher_id: 'T001',
        first_name: 'John',
        last_name: 'Smith',
        date_of_birth: '1985-05-15',
        gender: 'male',
        phone: '012345678',
        address: '123 Main Street, Phnom Penh',
        qualification: 'Master of Education',
        specialization: 'Mathematics',
        experience_years: 8,
        joining_date: '2016-01-15',
        salary: 800.00,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedUsers[1].id,
        teacher_id: 'T002',
        first_name: 'Sarah',
        last_name: 'Johnson',
        date_of_birth: '1990-08-22',
        gender: 'female',
        phone: '012345679',
        address: '456 Oak Avenue, Phnom Penh',
        qualification: 'Bachelor of Science',
        specialization: 'Science',
        experience_years: 5,
        joining_date: '2019-03-01',
        salary: 750.00,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedUsers[2].id,
        teacher_id: 'T003',
        first_name: 'Michael',
        last_name: 'Brown',
        date_of_birth: '1988-12-10',
        gender: 'male',
        phone: '012345680',
        address: '789 Pine Road, Phnom Penh',
        qualification: 'Master of Arts',
        specialization: 'English',
        experience_years: 6,
        joining_date: '2018-06-01',
        salary: 780.00,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedUsers[3].id,
        teacher_id: 'T004',
        first_name: 'Emily',
        last_name: 'Davis',
        date_of_birth: '1992-03-25',
        gender: 'female',
        phone: '012345681',
        address: '321 Elm Street, Phnom Penh',
        qualification: 'Bachelor of Arts',
        specialization: 'Khmer Language',
        experience_years: 4,
        joining_date: '2020-01-15',
        salary: 720.00,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        user_id: insertedUsers[4].id,
        teacher_id: 'T005',
        first_name: 'David',
        last_name: 'Wilson',
        date_of_birth: '1987-07-18',
        gender: 'male',
        phone: '012345682',
        address: '654 Maple Drive, Phnom Penh',
        qualification: 'Master of Science',
        specialization: 'Physics',
        experience_years: 7,
        joining_date: '2017-08-01',
        salary: 820.00,
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('teachers', teacherProfiles, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('teachers', {
      teacher_id: { [Sequelize.Op.in]: ['T001', 'T002', 'T003', 'T004', 'T005'] }
    }, {});
    
    await queryInterface.bulkDelete('users', {
      username: { [Sequelize.Op.like]: 'teacher%' }
    }, {});
  }
};

