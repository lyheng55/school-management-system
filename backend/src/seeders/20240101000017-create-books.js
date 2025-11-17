'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if books already exist
    const existingBooks = await queryInterface.sequelize.query(
      "SELECT id FROM books LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingBooks.length > 0) {
      console.log('Books already exist, skipping...');
      return;
    }
 
    const now = new Date();
    const books = [];
    const categories = ['Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'History', 'Literature', 'Reference'];
    const bookTitles = [
      'Introduction to Mathematics',
      'Science Fundamentals',
      'History of Cambodia',
      'English Grammar Guide',
      'Computer Basics',
      'World Geography',
      'Literature Collection',
      'Dictionary',
      'Encyclopedia',
      'Story Books',
      'Science Experiments',
      'Math Problems',
      'Khmer Literature',
      'Physics Basics',
      'Chemistry Guide'
    ];
    const authors = [
      'Author One',
      'Author Two',
      'Author Three',
      'Author Four',
      'Author Five'
    ];

    // Create books
    bookTitles.forEach((title, idx) => {
      const totalCopies = 3 + (idx % 5); // 3-7 copies per book
      const borrowedCopies = idx % 2; // 0 or 1 borrowed
      const availableCopies = Math.max(0, totalCopies - borrowedCopies); // Ensure non-negative
      
      books.push({
        title: title,
        author: authors[idx % authors.length],
        isbn: `ISBN${String(1000000 + idx).padStart(10, '0')}`,
        category: categories[idx % categories.length],
        publisher: 'School Publishing',
        publication_year: 2020 + (idx % 4),
        total_copies: totalCopies,
        available_copies: availableCopies,
        status: 'available',
        created_at: now,
        updated_at: now
      });
    });

    await queryInterface.bulkInsert('books', books, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('books', {}, {});
  }
};

