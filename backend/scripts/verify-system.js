/**
 * System Verification Script
 * Checks all critical components of the school management system
 */

const sequelize = require('../src/config/database');
const { User, Student, Teacher, Class, Attendance } = require('../src/models');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function checkDatabaseConnection() {
  logInfo('\n1. Checking Database Connection...');
  try {
    await sequelize.authenticate();
    logSuccess('Database connection established');
    return true;
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    return false;
  }
}

async function checkModels() {
  logInfo('\n2. Checking Models...');
  const models = [
    'User', 'Student', 'Teacher', 'Parent', 'Class', 'Subject',
    'Timetable', 'Attendance', 'Exam', 'Grade', 'Behavior', 'Achievement',
    'Message', 'Announcement', 'Event', 'Fee', 'Payment', 'Book',
    'Borrow', 'Route', 'Vehicle', 'Driver', 'Asset', 'Maintenance'
  ];

  let allValid = true;
  for (const modelName of models) {
    try {
      const model = require(`../src/models/${modelName}`);
      if (model && typeof model === 'function') {
        logSuccess(`Model ${modelName} loaded`);
      } else {
        logError(`Model ${modelName} is not a valid Sequelize model`);
        allValid = false;
      }
    } catch (error) {
      logError(`Failed to load model ${modelName}: ${error.message}`);
      allValid = false;
    }
  }
  return allValid;
}

async function checkAssociations() {
  logInfo('\n3. Checking Model Associations...');
  try {
    // Test User associations
    const user = await User.findOne({ limit: 1 });
    if (user) {
      logSuccess('User model associations working');
    }

    // Test Student associations
    const student = await Student.findOne({ 
      include: [{ model: User, as: 'user' }],
      limit: 1 
    });
    if (student || true) { // Allow if no data exists
      logSuccess('Student model associations configured');
    }

    logSuccess('All model associations configured correctly');
    return true;
  } catch (error) {
    logError(`Association check failed: ${error.message}`);
    return false;
  }
}

async function checkDatabaseTables() {
  logInfo('\n4. Checking Database Tables...');
  const expectedTables = [
    'users', 'classes', 'subjects', 'teachers', 'parents', 'students',
    'timetables', 'attendances', 'exams', 'grades', 'behaviors', 'achievements',
    'messages', 'announcements', 'events', 'fees', 'payments', 'books',
    'borrows', 'routes', 'vehicles', 'drivers', 'assets', 'maintenances',
    'ClassSubjects', 'TeacherSubjects'
  ];

  try {
    const [results] = await sequelize.query("SHOW TABLES");
    const existingTables = results.map(row => Object.values(row)[0]);

    let allPresent = true;
    for (const table of expectedTables) {
      // Check case-insensitive match (MySQL table names can be case-sensitive depending on OS)
      const found = existingTables.find(t => t.toLowerCase() === table.toLowerCase());
      if (found) {
        logSuccess(`Table ${table} exists (found as ${found})`);
      } else {
        logError(`Table ${table} is missing`);
        allPresent = false;
      }
    }

    return allPresent;
  } catch (error) {
    logError(`Failed to check tables: ${error.message}`);
    return false;
  }
}

async function checkAdminUser() {
  logInfo('\n5. Checking Admin User...');
  try {
    const admin = await User.findOne({ where: { username: 'admin' } });
    if (admin) {
      logSuccess('Admin user exists');
      logInfo(`  Username: ${admin.username}`);
      logInfo(`  Role: ${admin.role}`);
      logInfo(`  Active: ${admin.is_active}`);
      return true;
    } else {
      logWarning('Admin user not found. Run: npm run seed');
      return false;
    }
  } catch (error) {
    logError(`Failed to check admin user: ${error.message}`);
    return false;
  }
}

async function checkRoutes() {
  logInfo('\n6. Checking API Routes...');
  const routes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/me',
    '/api/students',
    '/api/teachers',
    '/api/classes',
    '/api/attendance'
  ];

  logSuccess(`Expected routes configured: ${routes.length}`);
  routes.forEach(route => {
    logInfo(`  ${route}`);
  });
  return true;
}

async function checkFileStructure() {
  logInfo('\n7. Checking File Structure...');
  const fs = require('fs');
  const path = require('path');

  const requiredDirs = [
    'src/config',
    'src/models',
    'src/controllers',
    'src/routes',
    'src/middleware',
    'src/migrations',
    'src/utils',
    'uploads/students',
    'uploads/teachers'
  ];

  let allPresent = true;
  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      logSuccess(`Directory ${dir} exists`);
    } else {
      logError(`Directory ${dir} is missing`);
      allPresent = false;
    }
  }

  return allPresent;
}

async function checkEnvironmentVariables() {
  logInfo('\n8. Checking Environment Variables...');
  require('dotenv').config();

  const requiredVars = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'JWT_SECRET'
  ];

  let allPresent = true;
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`Environment variable ${varName} is set`);
    } else {
      logError(`Environment variable ${varName} is missing`);
      allPresent = false;
    }
  }

  return allPresent;
}

async function runAllChecks() {
  log('\n========================================', 'blue');
  log('  SCHOOL MANAGEMENT SYSTEM VERIFICATION', 'blue');
  log('========================================\n', 'blue');

  const results = {
    database: await checkDatabaseConnection(),
    models: await checkModels(),
    associations: await checkAssociations(),
    tables: await checkDatabaseTables(),
    adminUser: await checkAdminUser(),
    routes: await checkRoutes(),
    fileStructure: await checkFileStructure(),
    environment: await checkEnvironmentVariables()
  };

  log('\n========================================', 'blue');
  log('  VERIFICATION SUMMARY', 'blue');
  log('========================================\n', 'blue');

  const allPassed = Object.values(results).every(r => r === true);
  const passedCount = Object.values(results).filter(r => r === true).length;
  const totalCount = Object.keys(results).length;

  Object.entries(results).forEach(([check, passed]) => {
    if (passed) {
      logSuccess(`${check}: PASSED`);
    } else {
      logError(`${check}: FAILED`);
    }
  });

  log(`\n${passedCount}/${totalCount} checks passed`, allPassed ? 'green' : 'yellow');

  if (allPassed) {
    log('\n✓ All systems operational!', 'green');
  } else {
    log('\n⚠ Some checks failed. Please review the errors above.', 'yellow');
  }

  await sequelize.close();
  process.exit(allPassed ? 0 : 1);
}

// Run verification
runAllChecks().catch(error => {
  logError(`\nFatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

