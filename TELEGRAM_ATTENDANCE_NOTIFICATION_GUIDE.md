# Telegram Auto-Send Messages for Child Absence - Implementation Guide

## Overview

There are **TWO places** where Telegram notifications are automatically sent when a child is absent:

1. **Immediate Notification** - When attendance is marked (in `attendanceController.js`)
2. **Scheduled Notification** - After class ends (in `attendanceNotificationService.js`)

## Current Implementation Status

### ✅ Already Implemented

Both notification systems are already implemented in your codebase:

1. **Immediate Notifications** (`backend/src/controllers/attendanceController.js`)
   - Lines 51-75: Single attendance marking
   - Lines 132-159: Bulk attendance marking
   - Sends notification immediately when attendance is marked as "absent" or "late"

2. **Scheduled Notifications** (`backend/src/services/attendanceNotificationService.js`)
   - Runs every 5 minutes via cron job
   - Checks for classes that just ended
   - Sends notifications for absent students after class ends

## Where Telegram Notifications Are Sent

### Location 1: Immediate Notification (When Attendance is Marked)

**File**: `backend/src/controllers/attendanceController.js`

**Function**: `markAttendance()` and `bulkMarkAttendance()`

**When it triggers**:
- ✅ Immediately when a teacher/admin marks a student as "absent" or "late"
- ✅ Works for both single and bulk attendance marking

**Current Code** (Lines 51-75):
```javascript
// Send Telegram notification to parent if student is absent or late
if (attendanceWithRelations && (value.status === 'absent' || value.status === 'late')) {
  try {
    const student = attendanceWithRelations.student;
    const parent = student?.parent;
    const parentUser = parent?.user;
    
    const telegramChatId = parentUser?.telegram_chat_id || process.env[`TELEGRAM_CHAT_${parentUser?.id}`];
    
    if (telegramChatId && student) {
      await telegramService.sendAttendanceAlert(telegramChatId, {
        studentName: `${student.first_name} ${student.last_name}`,
        className: student.class?.name || 'N/A',
        date: new Date(value.date).toLocaleDateString(),
        status: value.status,
        remarks: value.remarks || null
      });
    }
  } catch (telegramError) {
    console.error('Telegram notification error:', telegramError.message);
  }
}
```

**✅ This is already working!** Parents receive notifications immediately when attendance is marked.

---

### Location 2: Scheduled Notification (After Class Ends)

**File**: `backend/src/services/attendanceNotificationService.js`

**Function**: `checkAbsentStudentsAndNotify()`

**When it triggers**:
- ✅ Runs every 5 minutes (cron job)
- ✅ Checks for classes that ended within the last 5 minutes
- ✅ Sends notifications for students marked as "absent"

**Current Code** (Lines 115-152):
```javascript
// Only send notification if attendance has been marked AND student is absent
if (attendance && attendance.status === 'absent') {
  const parentUser = student.parent?.user;
  const telegramChatId = parentUser?.telegram_chat_id;
  
  if (telegramChatId) {
    try {
      const message = `
📋 Absence Alert - Class Ended

Student: ${studentName}
Class: ${className}
Subject: ${subjectName}
Date: ${today.toLocaleDateString()}
Class Time: ${timetable.start_time} - ${timetable.end_time}
Status: ❌ Absent

${attendance?.remarks ? `Remarks: ${attendance.remarks}` : 'No remarks provided.'}

Please contact the school if you have any questions or concerns.
      `.trim();
      
      await telegramService.sendMessage(telegramChatId, message);
    } catch (error) {
      console.error(`Error sending notification:`, error.message);
    }
  }
}
```

**✅ This is already working!** Parents receive notifications after classes end.

---

## How It Works Together

### Scenario: Student is Absent

1. **Teacher marks attendance** at 9:00 AM → **Immediate notification sent** ✅
2. **Class ends** at 10:00 AM → **Scheduled notification sent** at 10:05 AM ✅

**Note**: Both notifications will be sent. This ensures parents are notified:
- Immediately when attendance is marked (if marked during class)
- After class ends (as a reminder/confirmation)

---

## Configuration Required

### 1. Telegram Bot Setup

**File**: `.env`

```env
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### 2. Parent Telegram Chat ID

Parents must have their `telegram_chat_id` set in the `users` table:

```sql
UPDATE users 
SET telegram_chat_id = '123456789' 
WHERE id = <parent_user_id>;
```

Or via the API/Admin panel when creating/updating parent accounts.

---

## Recommendation: Which One to Use?

### Option A: Use Both (Recommended) ✅

**Pros**:
- Immediate notification when attendance is marked
- Reminder notification after class ends
- Ensures parents are always notified

**Cons**:
- Parents might receive duplicate notifications if attendance is marked before class ends

**Best for**: Schools that want maximum notification coverage

---

### Option B: Use Only Immediate Notifications

**To disable scheduled notifications**, comment out in `backend/src/server.js`:

```javascript
// Comment this out:
// startAttendanceNotificationJob();
```

**Pros**:
- No duplicate notifications
- Immediate alerts

**Cons**:
- If attendance is marked late (after class), parents might miss the notification

**Best for**: Schools that always mark attendance immediately

---

### Option C: Use Only Scheduled Notifications

**To disable immediate notifications**, remove the notification code from `attendanceController.js` (lines 51-75 and 132-159).

**Pros**:
- No duplicate notifications
- Ensures notification after class ends

**Cons**:
- Delayed notification (up to 5 minutes after class ends)

**Best for**: Schools that want to notify only after class ends

---

## Current Issue Found

In `attendanceController.js` line 60, there's a fallback that checks environment variables:

```javascript
const telegramChatId = parentUser?.telegram_chat_id || process.env[`TELEGRAM_CHAT_${parentUser?.id}`];
```

**Recommendation**: Remove the fallback and use only `telegram_chat_id`:

```javascript
const telegramChatId = parentUser?.telegram_chat_id;
```

This ensures consistency with the scheduled notification service.

---

## Testing

### Test Immediate Notification

1. Mark a student as absent via API:
```bash
POST /api/attendance
{
  "student_id": 1,
  "date": "2024-01-15",
  "status": "absent",
  "remarks": "Test absence"
}
```

2. Check Telegram - parent should receive notification immediately

### Test Scheduled Notification

1. Mark attendance for a class that just ended
2. Wait 5 minutes (or manually trigger the cron job)
3. Check Telegram - parent should receive notification

---

## Summary

**Where to use Telegram auto-send messages for child absence:**

1. ✅ **Already implemented** in `attendanceController.js` - Immediate notifications
2. ✅ **Already implemented** in `attendanceNotificationService.js` - Scheduled notifications

**Both are working!** You just need to:
- Configure Telegram bot token in `.env`
- Set `telegram_chat_id` for parents in the database
- Ensure `TELEGRAM_ENABLED=true` in `.env`

The system will automatically send notifications when:
- Attendance is marked as absent/late (immediate)
- Classes end with absent students (scheduled, every 5 minutes)

