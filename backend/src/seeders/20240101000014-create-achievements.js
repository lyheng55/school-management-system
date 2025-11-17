'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get students
    const students = await queryInterface.sequelize.query(
      "SELECT id FROM students ORDER BY id LIMIT 30",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const now = new Date();
    const achievements = [];
    const categories = ['academic', 'sports', 'arts', 'leadership', 'other'];
    const titles = {
      academic: ['Top Student', 'Perfect Score', 'Academic Excellence', 'Best in Math', 'Science Fair Winner'],
      sports: ['Basketball Champion', 'Track Star', 'Soccer MVP', 'Swimming Champion', 'Athlete of the Year'],
      arts: ['Art Competition Winner', 'Best Drawing', 'Music Performance', 'Drama Award', 'Creative Writing'],
      leadership: ['Class President', 'Student Council', 'Team Leader', 'Volunteer Award', 'Community Service'],
      other: ['Perfect Attendance', 'Most Improved', 'Citizenship Award', 'Friendliest Student', 'Most Helpful']
    };
 
    // Create achievements for students
    students.forEach((student, studentIdx) => {
      // 1-2 achievements per student
      const numAchievements = 1 + (studentIdx % 2);
      
      for (let i = 0; i < numAchievements; i++) {
        const category = categories[studentIdx % categories.length];
        const categoryTitles = titles[category];
        const title = categoryTitles[studentIdx % categoryTitles.length];
        
        const achievementDate = new Date();
        achievementDate.setDate(achievementDate.getDate() - (studentIdx * 10 + i * 5));

        achievements.push({
          student_id: student.id,
          title: title,
          description: `Achieved ${title} in ${category}`,
          category: category,
          date: achievementDate.toISOString().split('T')[0],
          certificate_url: null,
          created_at: now,
          updated_at: now
        });
      }
    });

    await queryInterface.bulkInsert('achievements', achievements, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('achievements', {}, {});
  }
};

