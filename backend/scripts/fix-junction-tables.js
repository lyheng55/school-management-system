/**
 * Fix Junction Tables Script
 * Creates ClassSubjects and TeacherSubjects tables if they don't exist
 */

const sequelize = require('../src/config/database');

async function checkAndCreateTables() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Check if tables exist
    const [tables] = await sequelize.query("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);

    if (!tableNames.includes('ClassSubjects')) {
      console.log('Creating ClassSubjects table...');
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS ClassSubjects (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          class_id INT UNSIGNED NOT NULL,
          subject_id INT UNSIGNED NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE KEY idx_class_subjects_unique (class_id, subject_id),
          KEY idx_class_subjects_class_id (class_id),
          KEY idx_class_subjects_subject_id (subject_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ ClassSubjects table created');
    } else {
      console.log('✓ ClassSubjects table already exists');
    }

    if (!tableNames.includes('TeacherSubjects')) {
      console.log('Creating TeacherSubjects table...');
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS TeacherSubjects (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          teacher_id INT UNSIGNED NOT NULL,
          subject_id INT UNSIGNED NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE KEY idx_teacher_subjects_unique (teacher_id, subject_id),
          KEY idx_teacher_subjects_teacher_id (teacher_id),
          KEY idx_teacher_subjects_subject_id (subject_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ TeacherSubjects table created');
    } else {
      console.log('✓ TeacherSubjects table already exists');
    }

    console.log('\n✓ All junction tables verified');
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

checkAndCreateTables();

