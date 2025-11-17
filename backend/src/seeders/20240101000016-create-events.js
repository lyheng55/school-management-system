'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin user
    const admin = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );
 
    const now = new Date();
    const events = [];
    const eventTypes = ['PTM', 'Exam', 'Holiday', 'Sports', 'Cultural', 'Other'];
    const eventTitles = [
      'Parent-Teacher Meeting',
      'Midterm Examinations',
      'National Holiday',
      'Annual Sports Day',
      'Cultural Festival',
      'School Trip',
      'Science Fair',
      'Graduation Ceremony',
      'Art Exhibition',
      'Music Concert'
    ];
    const locations = [
      'School Auditorium',
      'Main Hall',
      'School Grounds',
      'Sports Complex',
      'Classroom Building',
      'Library',
      'Gymnasium',
      'Outdoor Field'
    ];

    // Create events
    for (let i = 0; i < 10; i++) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + (i * 7)); // Events spread over weeks

      events.push({
        title: eventTitles[i],
        description: `Details about ${eventTitles[i]}`,
        event_type: eventTypes[i % eventTypes.length].toLowerCase(),
        start_date: eventDate.toISOString().split('T')[0],
        end_date: new Date(eventDate.getTime() + 86400000).toISOString().split('T')[0], // Next day
        start_time: '09:00:00',
        end_time: '15:00:00',
        location: locations[i % locations.length],
        is_active: true,
        created_by: admin[0]?.id || 1,
        created_at: now,
        updated_at: now
      });
    }

    await queryInterface.bulkInsert('events', events, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('events', {}, {});
  }
};

