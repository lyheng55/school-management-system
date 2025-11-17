const fs = require('fs');
const path = require('path');
const glob = require('glob');

const migrationsDir = path.join(__dirname, '..', 'src', 'migrations');
const migrationFiles = glob.sync('*.js', { cwd: migrationsDir });

console.log(`Fixing INTEGER types in ${migrationFiles.length} migration files...\n`);

let fixedCount = 0;

migrationFiles.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix INTEGER to INTEGER.UNSIGNED for foreign keys to users/students tables
  // Pattern: type: Sequelize.INTEGER, (not UNSIGNED) followed by references to users/students
  const patterns = [
    {
      // Match: type: Sequelize.INTEGER, ... references: { model: 'students'
      pattern: /(type:\s*Sequelize\.)INTEGER(,\s*\n\s*allowNull:.*\n\s*references:\s*{\s*\n\s*model:\s*['"]students['"])/g,
      replacement: '$1INTEGER.UNSIGNED$2'
    },
    {
      // Match: type: Sequelize.INTEGER, ... references: { model: 'users'
      pattern: /(type:\s*Sequelize\.)INTEGER(,\s*\n\s*allowNull:.*\n\s*references:\s*{\s*\n\s*model:\s*['"]users['"])/g,
      replacement: '$1INTEGER.UNSIGNED$2'
    },
    {
      // Match: foreign key fields: { type: Sequelize.INTEGER, (simpler pattern)
      pattern: /(student_id|user_id|teacher_id|parent_id|fee_id|exam_id|subject_id|class_id|route_id|vehicle_id|driver_id|book_id|asset_id|recorded_by|entered_by|created_by|marked_by|processed_by|sender_id|receiver_id|class_teacher_id):\s*{\s*\n\s*type:\s*Sequelize\.INTEGER(?!\.UNSIGNED),/g,
      replacement: '$1: {\n        type: Sequelize.INTEGER.UNSIGNED,'
    },
    {
      // Match: id: { type: Sequelize.INTEGER, (for primary keys that should be UNSIGNED)
      pattern: /(id:\s*{\s*\n\s*type:\s*Sequelize\.)INTEGER(?!\.UNSIGNED)(,\s*\n\s*primaryKey:)/g,
      replacement: '$1INTEGER.UNSIGNED$2'
    }
  ];

  patterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} migration files.`);

