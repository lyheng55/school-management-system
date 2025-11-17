#!/usr/bin/env node

/**
 * Script to get Telegram Chat ID
 * Usage: node scripts/get-telegram-chat-id.js [YOUR_BOT_TOKEN]
 * 
 * If no token is provided, it will try to read from .env file (TELEGRAM_BOT_TOKEN)
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Try to get token from command line argument first, then from .env file
const botToken = process.argv[2] || process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error('❌ Error: Bot token required');
  console.log('\nUsage options:');
  console.log('  1. Set TELEGRAM_BOT_TOKEN in .env file, then run:');
  console.log('     node scripts/get-telegram-chat-id.js');
  console.log('  2. Or provide token as argument:');
  console.log('     node scripts/get-telegram-chat-id.js YOUR_BOT_TOKEN');
  console.log('\nTo get a bot token:');
  console.log('  1. Open Telegram and search for @BotFather');
  console.log('  2. Send /newbot and follow the instructions');
  console.log('  3. Copy the token provided by BotFather');
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

// Show where token was loaded from
const tokenSource = process.argv[2] ? 'command line argument' : '.env file';
console.log(`✅ Bot token loaded from ${tokenSource}`);
console.log(`🤖 Bot is running...`);
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

