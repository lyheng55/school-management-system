# Telegram Bot Setup - Direct Messages to Parents

## Overview

The Telegram bot sends **direct messages** to parents when their child is marked as absent or late. Messages are sent **privately** to each parent's Telegram chat, not in a group.

## How It Works

1. **Teacher marks attendance** → Student marked as "absent" or "late"
2. **System checks** → Does the parent have a Telegram chat ID?
3. **Bot sends direct message** → Private message sent to parent's Telegram chat
4. **Parent receives notification** → Direct message in their Telegram app

## Setup Instructions

### Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the **Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Configure Bot Token

Add to your `.env` file:

```env
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### Step 3: Get Parent Telegram Chat IDs

Each parent needs to:
1. Start a chat with your bot (search for your bot username in Telegram)
2. Send `/start` command to the bot
3. The bot will receive their chat ID

**To get chat ID programmatically**, you can add a simple command handler or use this method:

#### Method 1: Manual Chat ID Collection

1. Add this temporary code to get chat IDs (or use a Telegram bot library with polling):

```javascript
// Temporary code to get chat IDs
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(`Chat ID for ${msg.from.first_name}: ${chatId}`);
  bot.sendMessage(chatId, `Your Chat ID is: ${chatId}`);
});
```

2. Have each parent send a message to the bot
3. Note their chat ID from console logs
4. Update the `users` table with their `telegram_chat_id`

#### Method 2: Use a Telegram Bot with Webhook/Polling

Create a simple endpoint or script that parents can use to register their chat ID.

### Step 4: Update Parent Records

Update the `users` table with each parent's Telegram chat ID:

```sql
UPDATE users 
SET telegram_chat_id = '123456789' 
WHERE id = <parent_user_id>;
```

Or via API when creating/updating parents.

## Message Format

When a child is absent, parents receive this message:

```
📋 Attendance Alert

Student: John Doe
Class: Grade 5A
Date: 1/15/2024
Status: ❌ Absent

Remarks: (if any)

Please contact the school if you have any questions.
```

## Important Notes

### ✅ Direct Messages (Not Group Messages)

- Messages are sent **directly** to each parent's private Telegram chat
- Each parent receives their own private message
- No group chat is involved
- Parents can reply directly to the bot (if you implement reply handling)

### ✅ When Messages Are Sent

- **Immediately** when attendance is marked as "absent" or "late"
- Only if parent has `telegram_chat_id` set in database
- Only if `TELEGRAM_ENABLED=true` in `.env`

### ✅ Privacy

- Each parent only receives notifications about their own child
- Messages are private (direct message, not group)
- No other parents can see the messages

## Testing

### Test the Bot

1. Mark a student as absent via API or UI
2. Check parent's Telegram - they should receive a direct message immediately

### Test Message Format

```bash
# Mark attendance as absent
POST /api/attendance
{
  "student_id": 1,
  "date": "2024-01-15",
  "status": "absent",
  "remarks": "Test absence notification"
}
```

Parent with `telegram_chat_id` set should receive message immediately.

## Troubleshooting

### Bot Not Sending Messages

1. ✅ Check `TELEGRAM_ENABLED=true` in `.env`
2. ✅ Verify `TELEGRAM_BOT_TOKEN` is correct
3. ✅ Ensure parent has `telegram_chat_id` in database
4. ✅ Check server logs for errors
5. ✅ Verify parent hasn't blocked the bot

### Parent Not Receiving Messages

1. ✅ Verify parent's `telegram_chat_id` is correct
2. ✅ Ensure parent has started a chat with the bot (`/start`)
3. ✅ Check if parent has blocked the bot
4. ✅ Verify bot token is valid

### Getting Chat IDs

If you need to collect chat IDs from parents:

1. Enable polling in `telegramService.js` temporarily
2. Add message handler to log chat IDs
3. Have parents send `/start` to bot
4. Collect chat IDs from logs
5. Update database

## Code Location

**Direct message sending happens in:**
- `backend/src/controllers/attendanceController.js` (lines 51-74)
- Uses `telegramService.sendAttendanceAlert()` to send direct messages

**No scheduled jobs** - Messages are sent immediately when attendance is marked.

## Summary

✅ Bot sends **direct private messages** to parents  
✅ Messages sent **immediately** when attendance is marked  
✅ Each parent receives messages about their own child only  
✅ No group chat involved - completely private  

The bot works as a **direct messaging service** - each parent gets their own private notifications!

