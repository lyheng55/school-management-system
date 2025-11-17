'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if student users already exist
    const existingStudentUsers = await queryInterface.sequelize.query(
      "SELECT username FROM users WHERE username LIKE 'student%' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingStudentUsers.length > 0) {
      console.log('Student users already exist, skipping...');
      return;
    } 

    const hashedPassword = await bcrypt.hash('student123', 10);
    const now = new Date();

    // Get classes and parents
    const classes = await queryInterface.sequelize.query(
      "SELECT id, name, section FROM classes ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );
    const parents = await queryInterface.sequelize.query(
      "SELECT id FROM parents ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create student users (30 students)
    const studentUsers = [];
    for (let i = 1; i <= 30; i++) {
      studentUsers.push({
        username: `student${i}`,
        email: `student${i}@school.com`,
        password: hashedPassword,
        role: 'student',
        is_active: true,
        created_at: now,
        updated_at: now
      });
    }

    await queryInterface.bulkInsert('users', studentUsers, {});

    // Get inserted student user IDs
    const insertedStudents = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE username LIKE 'student%' ORDER BY id",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create student profiles
    const students = [];
    const firstNames = ['Sok', 'Srey', 'Ratha', 'Sopheap', 'Chanthou', 'Sokha', 'Sreyneang', 'Rithy', 'Sophat', 'Chamroeun'];
    const lastNames = ['Chan', 'Sopheap', 'Vann', 'Kong', 'Ly', 'Heng', 'Sok', 'Chea', 'Nop', 'Sok'];
    const genders = ['male', 'female'];
    
    insertedStudents.forEach((user, index) => {
      const classIndex = Math.floor(index / 6); // 6 students per class
      const parentIndex = Math.floor(index / 6); // Same parent for students in same class
      const gender = genders[index % 2];
      const firstName = firstNames[index % firstNames.length];
      const lastName = lastNames[Math.floor(index / 3) % lastNames.length];
      
      // Generate date of birth (ages 6-12)
      const age = 6 + (index % 7);
      const birthYear = new Date().getFullYear() - age;
      const birthMonth = String(1 + (index % 12)).padStart(2, '0');
      const birthDay = String(1 + (index % 28)).padStart(2, '0');
      
      students.push({
        user_id: user.id,
        student_id: `STU${String(index + 1).padStart(4, '0')}`,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: `${birthYear}-${birthMonth}-${birthDay}`,
        gender: gender,
        phone: `012${String(1000000 + index).slice(-7)}`,
        address: `${100 + index} Street ${index + 1}, Phnom Penh`,
        emergency_contact: `Emergency Contact ${index + 1}`,
        emergency_phone: `012${String(2000000 + index).slice(-7)}`,
        admission_date: '2024-01-15',
        class_id: classes[classIndex]?.id || classes[0]?.id,
        parent_id: parents[parentIndex]?.id || parents[0]?.id,
        status: 'active',
        created_at: now,
        updated_at: now
      });
    });

    await queryInterface.bulkInsert('students', students, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('students', {
      student_id: { [Sequelize.Op.like]: 'STU%' }
    }, {});
    
    await queryInterface.bulkDelete('users', {
      username: { [Sequelize.Op.like]: 'student%' }
    }, {});
  }
};

