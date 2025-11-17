#!/usr/bin/env node

/**
 * Script to get Telegram Chat ID
 * Usage: node scripts/get-telegram-chat-id.js YOUR_BOT_TOKEN
 */

const TelegramBot = require('node-telegram-bot-api');

const botToken = process.argv[2];

if (!botToken) {
  console.error('❌ Error: Bot token required');
  console.log('Usage: node scripts/get-telegram-chat-id.js YOUR_BOT_TOKEN');
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

console.log('🤖 Bot is running...');
console.log('📱 Send a message to your bot to get your Chat ID');
console.log('   (Press Ctrl+C to stop)\n');

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username || msg.chat.first_name || 'User';
  
  console.log('\n✅ Chat ID received!');
  console.log(`   Username: ${username}`);
  console.log(`   Chat ID: ${chatId}`);
  console.log(`\n   Add this to your .env file:`);
  console.log(`   TELEGRAM_CHAT_${msg.from.id}=${chatId}`);
  console.log(`\n   Or update your database:`);
  console.log(`   UPDATE users SET telegram_chat_id = '${chatId}' WHERE id = YOUR_USER_ID;\n`);
  
  // Send confirmation message
  bot.sendMessage(chatId, `✅ Your Chat ID is: ${chatId}\n\nYou can now receive notifications!`);
});

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.message);
  if (error.response?.body?.error_code === 401) {
    console.error('   → Invalid bot token. Please check your TELEGRAM_BOT_TOKEN.');
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping bot...');
  bot.stopPolling();
  process.exit(0);
});

