/**
 * Test script for attendance notification service
 * Run this to manually test the attendance notification functionality
 */

require('dotenv').config();
const { checkAbsentStudentsAndNotify } = require('../src/services/attendanceNotificationService');

console.log('🧪 Testing attendance notification service...\n');

checkAbsentStudentsAndNotify()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

