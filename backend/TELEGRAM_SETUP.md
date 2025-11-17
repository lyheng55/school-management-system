# Telegram Notification Setup Guide

This guide will help you set up Telegram notifications for the School Management System.

## Prerequisites

1. A Telegram account
2. Node.js backend with `node-telegram-bot-api` installed

## Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a conversation with BotFather
3. Send the command: `/newbot`
4. Follow the prompts:
   - Choose a name for your bot (e.g., "School Management Bot")
   - Choose a username (e.g., "myschool_bot")
5. BotFather will provide you with a **Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 2: Get Your Telegram Chat ID

### Method 1: Using @userinfobot

1. Search for **@userinfobot** on Telegram
2. Start a conversation and send `/start`
3. The bot will reply with your Chat ID (a number like `123456789`)

### Method 2: Using Your Bot

1. Start a conversation with your newly created bot
2. Send any message (e.g., `/start`)
3. Visit this URL in your browser (replace `YOUR_BOT_TOKEN` with your actual token):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. Look for `"chat":{"id":123456789}` in the response - that's your Chat ID

### Method 3: Using the Setup Script

Run the setup script provided in the backend:

```bash
cd backend
node scripts/get-telegram-chat-id.js YOUR_BOT_TOKEN
```

## Step 3: Configure Environment Variables

Add the following to your `.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ENABLED=true

# Optional: Set chat IDs for specific users (alternative to database)
# Format: TELEGRAM_CHAT_USER_ID=chat_id
# Example: TELEGRAM_CHAT_1=123456789
```

## Step 4: Run Database Migration

Add the `telegram_chat_id` field to the users table:

```bash
cd backend
npm run migrate
```

## Step 5: Link Telegram Chat ID to Users

### Option A: Update via Database

```sql
UPDATE users SET telegram_chat_id = 'YOUR_CHAT_ID' WHERE id = USER_ID;
```

### Option B: Add API Endpoint (Recommended)

Create an endpoint to update Telegram chat ID for authenticated users:

```javascript
// In your user controller or auth controller
exports.updateTelegramChatId = async (req, res) => {
  try {
    const { telegram_chat_id } = req.body;
    
    await User.update(
      { telegram_chat_id },
      { where: { id: req.user.id } }
    );
    
    res.json({
      success: true,
      message: 'Telegram chat ID updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating Telegram chat ID',
      error: error.message
    });
  }
};
```

### Option C: Use Environment Variables

Set chat IDs in `.env` file:
```env
TELEGRAM_CHAT_1=123456789  # For user ID 1
TELEGRAM_CHAT_2=987654321   # For user ID 2
```

## Step 6: Test the Integration

1. Mark a student as absent or late in the attendance system
2. Check your Telegram - you should receive a notification!

## Notification Types

The system sends Telegram notifications for:

1. **Attendance Alerts** - When a student is marked absent or late
2. **Fee Reminders** - When fees are due or overdue (coming soon)
3. **Maintenance Alerts** - When maintenance is scheduled (coming soon)
4. **Announcements** - When new announcements are posted (coming soon)
5. **Event Reminders** - For upcoming events (coming soon)

## Troubleshooting

### Bot Not Responding

1. Check that `TELEGRAM_BOT_TOKEN` is set correctly in `.env`
2. Verify the bot token is valid by visiting:
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getMe
   ```
3. Ensure the bot is not blocked by the user

### Not Receiving Notifications

1. Verify `telegram_chat_id` is set for the user in the database
2. Check server logs for Telegram errors
3. Ensure the user has started a conversation with the bot
4. Verify `TELEGRAM_ENABLED=true` in `.env`

### Error: "Bot was blocked by user"

- The user needs to unblock the bot
- Or start a new conversation with the bot

### Error: "Invalid chat ID"

- Verify the chat ID is correct (should be a number)
- Ensure the user has sent at least one message to the bot

## Security Notes

- **Never commit** your bot token to version control
- Keep your `.env` file secure and never share it
- The bot token gives full control over your bot
- Consider using environment-specific tokens for production

## Advanced Configuration

### Custom Notification Templates

Edit `backend/src/utils/telegramService.js` to customize message formats.

### Disable Notifications Temporarily

Set `TELEGRAM_ENABLED=false` in `.env` to disable all Telegram notifications without removing the integration.

### Multiple Bots

You can use different bots for different notification types by creating multiple bot instances in `telegramService.js`.

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify Telegram Bot API status: https://status.telegram.org/
3. Review Telegram Bot API documentation: https://core.telegram.org/bots/api

