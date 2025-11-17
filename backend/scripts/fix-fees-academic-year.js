require('dotenv').config();
const sequelize = require('../src/config/database');

async function fixFeesAcademicYear() {
  try {
    console.log('Adding default value to fees.academic_year...');
    
    await sequelize.query(
      "ALTER TABLE fees CHANGE academic_year academic_year VARCHAR(20) NOT NULL DEFAULT '2024-2025'",
      { type: sequelize.QueryTypes.RAW }
    );
    
    console.log('✅ Successfully added default value to fees.academic_year');
    
    // Mark migration as complete
    const results = await sequelize.query(
      "SELECT name FROM SequelizeMeta WHERE name = '20251117172321-add-default-academic-year-to-fees.js'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (!results || results.length === 0) {
      await sequelize.query(
        "INSERT INTO SequelizeMeta (name) VALUES ('20251117172321-add-default-academic-year-to-fees.js')",
        { type: sequelize.QueryTypes.INSERT }
      );
      console.log('✅ Migration marked as complete');
    } else {
      console.log('✅ Migration already recorded');
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

fixFeesAcademicYear();

