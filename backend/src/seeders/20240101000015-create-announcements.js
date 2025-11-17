'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin user
    const admin = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );
 
    const now = new Date();
    const announcements = [];
    const audiences = ['all', 'students', 'teachers', 'parents', 'staff'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const titles = [
      'School Holiday Notice',
      'Parent-Teacher Meeting',
      'Sports Day Event',
      'Exam Schedule Released',
      'Library Hours Update',
      'Fee Payment Reminder',
      'New Student Orientation',
      'School Trip Announcement',
      'Academic Calendar Update',
      'Important Notice'
    ];
    const contents = [
      'The school will be closed on the following dates for public holidays.',
      'We invite all parents to attend the parent-teacher meeting scheduled for next week.',
      'Annual sports day will be held next month. All students are encouraged to participate.',
      'The exam schedule for the current semester has been released. Please check your class notice board.',
      'Library hours have been extended. New hours: 8 AM to 5 PM.',
      'Please note that fee payments are due by the end of this month.',
      'New student orientation will be held next Monday at 9 AM in the auditorium.',
      'School trip to historical sites has been scheduled. Permission slips required.',
      'Please note the updated academic calendar for the current year.',
      'This is an important notice regarding school policies and procedures.'
    ];

    // Create announcements
    for (let i = 0; i < 10; i++) {
      const announcementDate = new Date();
      announcementDate.setDate(announcementDate.getDate() - (10 - i));
      
      const expiryDate = new Date(announcementDate);
      expiryDate.setDate(expiryDate.getDate() + 7);

      announcements.push({
        title: titles[i],
        content: contents[i],
        target_audience: audiences[i % audiences.length],
        priority: priorities[i % priorities.length],
        published_at: announcementDate.toISOString(),
        expires_at: expiryDate.toISOString(),
        is_active: true,
        created_by: admin[0]?.id || 1,
        created_at: now,
        updated_at: now
      });
    }

    await queryInterface.bulkInsert('announcements', announcements, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('announcements', {}, {});
  }
};

