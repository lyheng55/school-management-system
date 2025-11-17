const cron = require('node-cron');
const { Timetable, Attendance, Student, Class, Subject, Parent, User } = require('../models');
const telegramService = require('../utils/telegramService');
const { Op } = require('sequelize');

/**
 * Get day of week name from date
 */
const getDayOfWeek = (date) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

/**
 * Convert time string (HH:MM:SS) to minutes since midnight
 */
const timeToMinutes = (timeString) => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if a class has just ended (within the last check interval)
 */
const hasClassJustEnded = (endTime, checkIntervalMinutes = 5) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const endMinutes = timeToMinutes(endTime);
  
  // Calculate time difference
  let diffMinutes = currentMinutes - endMinutes;
  
  // Handle day wrap-around (if class ended yesterday)
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Add 24 hours in minutes
  }
  
  // Check if class ended within the last checkIntervalMinutes
  return diffMinutes >= 0 && diffMinutes <= checkIntervalMinutes;
};

/**
 * Check for absent students and send notifications
 */
const checkAbsentStudentsAndNotify = async () => {
  try {
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];
    const dayOfWeek = getDayOfWeek(today);
    
    console.log(`[${new Date().toISOString()}] Checking for absent students after class end...`);
    
    // Get all timetables for today's day of week
    const timetables = await Timetable.findAll({
      where: {
        day_of_week: dayOfWeek
      },
      include: [
        { model: Class, as: 'class' },
        { model: Subject, as: 'subject' }
      ]
    });
    
    if (timetables.length === 0) {
      console.log('No classes scheduled for today.');
      return;
    }
    
    // Check each timetable to see if class just ended
    for (const timetable of timetables) {
      if (!hasClassJustEnded(timetable.end_time, 5)) {
        continue; // Class hasn't ended yet or ended too long ago
      }
      
      console.log(`Checking class ${timetable.class?.name || timetable.class_id} - ${timetable.subject?.name || timetable.subject_id} (ended at ${timetable.end_time})`);
      
      // Get all students in this class
      const students = await Student.findAll({
        where: {
          class_id: timetable.class_id,
          status: 'active'
        },
        include: [
          {
            model: Parent,
            as: 'parent',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email', 'telegram_chat_id']
              }
            ]
          }
        ]
      });
      
      if (students.length === 0) {
        continue;
      }
      
      // Check attendance for each student
      for (const student of students) {
        // Check if attendance record exists for today
        const attendance = await Attendance.findOne({
          where: {
            student_id: student.id,
            date: todayDate
          }
        });
        
        // Only send notification if attendance has been marked AND student is absent
        // Don't send if attendance hasn't been marked yet
        if (attendance && attendance.status === 'absent') {
          const parentUser = student.parent?.user;
          const telegramChatId = parentUser?.telegram_chat_id;
          
          if (telegramChatId) {
            try {
              const className = timetable.class?.name || `Class ${timetable.class_id}`;
              const subjectName = timetable.subject?.name || `Subject ${timetable.subject_id}`;
              const studentName = `${student.first_name} ${student.last_name}`;
              
              // Create a more detailed message for class-specific absence
              const message = `
${telegramService.formatBold('📋 Absence Alert - Class Ended')}

${telegramService.formatBold('Student:')} ${studentName}
${telegramService.formatBold('Class:')} ${className}
${telegramService.formatBold('Subject:')} ${subjectName}
${telegramService.formatBold('Date:')} ${today.toLocaleDateString()}
${telegramService.formatBold('Class Time:')} ${timetable.start_time} - ${timetable.end_time}
${telegramService.formatBold('Status:')} ❌ Absent

${attendance?.remarks ? `${telegramService.formatBold('Remarks:')} ${attendance.remarks}` : 'No remarks provided.'}

Please contact the school if you have any questions or concerns.
              `.trim();
              
              await telegramService.sendMessage(telegramChatId, message);
              console.log(`✅ Sent absence notification to parent of ${studentName} (Chat ID: ${telegramChatId})`);
              
              // Add a small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error(`❌ Error sending notification for student ${student.id}:`, error.message);
            }
          } else {
            console.log(`⚠️  Parent of student ${student.first_name} ${student.last_name} does not have Telegram chat ID configured.`);
          }
        }
      }
    }
    
    console.log(`[${new Date().toISOString()}] Finished checking for absent students.`);
  } catch (error) {
    console.error('Error in checkAbsentStudentsAndNotify:', error);
  }
};

/**
 * Start the scheduled job
 * Runs every 5 minutes to check for classes that just ended
 */
const startAttendanceNotificationJob = () => {
  console.log('🕐 Starting attendance notification scheduler...');
  
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    await checkAbsentStudentsAndNotify();
  });
  
  console.log('✅ Attendance notification scheduler started (runs every 5 minutes)');
  
  // Also run immediately on startup (optional, for testing)
  // Uncomment the line below if you want to test immediately
  // checkAbsentStudentsAndNotify();
};

module.exports = {
  startAttendanceNotificationJob,
  checkAbsentStudentsAndNotify
};

