# Telegram Message Sending Troubleshooting

## Quick Test

To test if you can send messages to Telegram, follow these steps:

### Step 1: Get Your Chat ID

**Option A: Using the script (Recommended)**
```bash
cd backend
node scripts/get-telegram-chat-id.js 7248437804:AAEb0JhFVyNXJedPvQirNGhgebvvx14jR5M
```
Then send a message to your bot (@Lyheng_AI_Bot) in Telegram. The script will display your Chat ID.

**Option B: Using @userinfobot**
1. Search for `@userinfobot` on Telegram
2. Start a conversation and send `/start`
3. The bot will reply with your Chat ID

**Option C: Using API directly**
1. Start a conversation with your bot (@Lyheng_AI_Bot)
2. Send any message (e.g., `/start`)
3. Visit: `https://api.telegram.org/bot7248437804:AAEb0JhFVyNXJedPvQirNGhgebvvx14jR5M/getUpdates`
4. Look for `"chat":{"id":123456789}` in the response

### Step 2: Test Sending a Message

Once you have your Chat ID, test sending a message:

```bash
cd backend
node scripts/send-test-telegram-message.js YOUR_CHAT_ID
```

Replace `YOUR_CHAT_ID` with the chat ID you got from Step 1.

### Step 3: Restart Your Server

If your server was running when you added the bot token, restart it:

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

You should see: `✅ Telegram Bot initialized successfully`

## Common Issues

### Issue 1: "Telegram bot not initialized"

**Solution:**
- Make sure `TELEGRAM_BOT_TOKEN` is set in your `.env` file
- Restart your server after adding the token
- Check that the token is correct (no extra spaces)

### Issue 2: "Bot was blocked by user or chat not found"

**Solution:**
- Make sure you have started a conversation with the bot
- Send `/start` to your bot first
- Unblock the bot if you previously blocked it

### Issue 3: "Invalid chat ID"

**Solution:**
- Make sure you have sent at least one message to the bot
- Verify the chat ID is correct (should be a number)
- Get a fresh chat ID using the script

### Issue 4: Messages not sending from the application

**Solution:**
1. Check that the user has a `telegram_chat_id` in the database:
   ```sql
   SELECT id, username, telegram_chat_id FROM users WHERE id = YOUR_USER_ID;
   ```

2. Update the user's chat ID:
   ```sql
   UPDATE users SET telegram_chat_id = 'YOUR_CHAT_ID' WHERE id = YOUR_USER_ID;
   ```

3. Verify the bot is initialized (check server logs)

4. Test manually using the test script

## Testing Different Scenarios

### Test 1: Simple Message
```bash
node scripts/send-test-telegram-message.js YOUR_CHAT_ID
```

### Test 2: Attendance Alert
```javascript
// In Node.js console or test file
const telegramService = require('./src/utils/telegramService');
await telegramService.sendAttendanceAlert('YOUR_CHAT_ID', {
  studentName: 'Test Student',
  className: 'Test Class',
  date: new Date().toLocaleDateString(),
  status: 'absent',
  remarks: 'Test notification'
});
```

## Verification Checklist

- [ ] Bot token is in `.env` file
- [ ] Server restarted after adding token
- [ ] Bot shows "initialized successfully" in logs
- [ ] You have your Chat ID
- [ ] You've sent at least one message to the bot
- [ ] Test script sends messages successfully
- [ ] User has `telegram_chat_id` in database (if using app features)

## Still Having Issues?

1. Check server logs for detailed error messages
2. Verify bot token is valid: `https://api.telegram.org/bot7248437804:AAEb0JhFVyNXJedPvQirNGhgebvvx14jR5M/getMe`
3. Test with the provided scripts first before using app features
4. Make sure you're using the correct chat ID (not user ID)

