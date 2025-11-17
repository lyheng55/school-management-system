const fs = require('fs');
const path = require('path');
const glob = require('glob');

const migrationsDir = path.join(__dirname, '..', 'src', 'migrations');

// Find all migration files
const migrationFiles = glob.sync('*.js', { cwd: migrationsDir });

console.log(`Found ${migrationFiles.length} migration files to check...\n`);

let fixedCount = 0;

migrationFiles.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove CURRENT_TIMESTAMP and CURRENT_DATE defaults
  const patterns = [
    {
      // Match: defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), (with comment)
      pattern: /defaultValue:\s*Sequelize\.literal\(['"]CURRENT_TIMESTAMP['"]\),?\s*\n\s*comment:/g,
      replacement: 'comment:'
    },
    {
      // Match: defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), (without comment)
      pattern: /defaultValue:\s*Sequelize\.literal\(['"]CURRENT_TIMESTAMP['"]\),?\s*\n\s*\}/g,
      replacement: '\n      }'
    },
    {
      // Match: defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), (with comment)
      pattern: /defaultValue:\s*Sequelize\.literal\(['"]CURRENT_TIMESTAMP\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP['"]\),?\s*\n\s*comment:/g,
      replacement: 'comment:'
    },
    {
      // Match: defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), (without comment)
      pattern: /defaultValue:\s*Sequelize\.literal\(['"]CURRENT_TIMESTAMP\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP['"]\),?\s*\n\s*\}/g,
      replacement: '\n      }'
    },
    {
      // Match: defaultValue: Sequelize.literal('CURRENT_DATE'),
      pattern: /defaultValue:\s*Sequelize\.literal\(['"]CURRENT_DATE['"]\),?\s*\n\s*/g,
      replacement: ''
    },
    {
      // Match: DEFAULT CURRENT_TIMESTAMP in SQL (if any)
      pattern: /DEFAULT\s+CURRENT_TIMESTAMP/g,
      replacement: ''
    },
    {
      // Match: DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      pattern: /DEFAULT\s+CURRENT_TIMESTAMP\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP/g,
      replacement: ''
    },
    {
      // Match: DEFAULT CURRENT_DATE
      pattern: /DEFAULT\s+CURRENT_DATE/g,
      replacement: ''
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
console.log('You can now run: npm run migrate');

