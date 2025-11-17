# Attendance Notification System

## Overview

This system automatically sends Telegram notifications to parents when their child is marked absent from a class, **after the class has ended**.

## How It Works

1. **Scheduled Job**: A cron job runs every 5 minutes to check for classes that have just ended
2. **Class Detection**: The system identifies classes scheduled for today that ended within the last 5 minutes
3. **Attendance Check**: For each class that just ended, it checks attendance records for all students in that class
4. **Notification**: If a student is marked as **absent**, it sends a Telegram notification to their parent (if the parent has a Telegram chat ID configured)

## Features

- ✅ Automatic detection of classes that just ended
- ✅ Checks attendance records for absent students
- ✅ Sends detailed Telegram notifications to parents
- ✅ Includes class name, subject, time, and date information
- ✅ Only sends notifications if attendance has been marked
- ✅ Prevents duplicate notifications (only checks classes that ended within last 5 minutes)

## Requirements

1. **Telegram Bot Token**: Must be configured in `.env` file as `TELEGRAM_BOT_TOKEN`
2. **Parent Telegram Chat IDs**: Parents must have their `telegram_chat_id` set in the User model
3. **Timetable Data**: Classes must have timetables configured with `day_of_week`, `start_time`, and `end_time`
4. **Attendance Records**: Attendance must be marked for students (the system only notifies if attendance is marked as absent)

## Configuration

The notification service starts automatically when the server starts. It runs every 5 minutes.

To change the check interval, modify the cron schedule in `backend/src/services/attendanceNotificationService.js`:

```javascript
// Current: Every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  await checkAbsentStudentsAndNotify();
});

// Example: Every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  await checkAbsentStudentsAndNotify();
});
```

## Testing

To manually test the notification service:

```bash
npm run test:attendance-notification
```

This will run the check immediately and show which notifications would be sent.

## Notification Format

The Telegram notification sent to parents includes:

- 📋 Absence Alert - Class Ended
- Student Name
- Class Name
- Subject Name
- Date
- Class Time (start - end)
- Status: ❌ Absent
- Remarks (if any)
- Contact information

## Important Notes

1. **Attendance Must Be Marked**: The system only sends notifications if attendance has been marked AND the student is absent. It will NOT send notifications if attendance hasn't been marked yet.

2. **Time Window**: The system checks for classes that ended within the last 5 minutes. This prevents duplicate notifications while ensuring timely alerts.

3. **Parent Telegram Setup**: Parents must have their Telegram chat ID configured. See `TELEGRAM_SETUP.md` for instructions on how to set this up.

4. **Server Restart**: The scheduler starts automatically when the server starts. If the server restarts, it will continue checking from that point forward.

## Troubleshooting

### Notifications Not Sending

1. Check if Telegram bot token is configured: `TELEGRAM_BOT_TOKEN` in `.env`
2. Verify parent has `telegram_chat_id` set in User model
3. Ensure attendance is marked BEFORE the class ends (or shortly after)
4. Check server logs for error messages
5. Verify timetable has correct `day_of_week`, `start_time`, and `end_time`

### Too Many Notifications

- The system only checks classes that ended within the last 5 minutes
- Each student-class combination is only checked once per day
- If you're getting duplicates, check server restart logs

### Notifications Sent Too Late

- Adjust the cron schedule to run more frequently (e.g., every 2 minutes)
- Or modify the `hasClassJustEnded` function to check a longer time window

## Files

- `backend/src/services/attendanceNotificationService.js` - Main service file
- `backend/src/server.js` - Server startup (starts the scheduler)
- `backend/scripts/test-attendance-notification.js` - Test script
- `backend/src/utils/telegramService.js` - Telegram service utilities

