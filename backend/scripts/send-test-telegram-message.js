require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const telegramService = require('../src/utils/telegramService');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.argv[2] || process.env.TEST_CHAT_ID;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
  process.exit(1);
}

if (!chatId) {
  console.error('❌ Chat ID required');
  console.log('\nUsage: node scripts/send-test-telegram-message.js YOUR_CHAT_ID');
  console.log('\nTo get your Chat ID:');
  console.log('1. Start a conversation with your bot (@Lyheng_AI_Bot)');
  console.log('2. Send any message to the bot');
  console.log('3. Run: node scripts/get-telegram-chat-id.js YOUR_BOT_TOKEN');
  console.log('\nOr add TEST_CHAT_ID to your .env file');
  process.exit(1);
}

async function sendTestMessage() {
  try {
    console.log('🔍 Testing Telegram message sending...\n');
    console.log(`Bot Token: ${token.substring(0, 10)}...${token.substring(token.length - 5)}`);
    console.log(`Chat ID: ${chatId}\n`);
    
    // Test 1: Direct bot instance
    console.log('📡 Test 1: Using direct bot instance...');
    const bot = new TelegramBot(token, { polling: false });
    
    try {
      const botInfo = await bot.getMe();
      console.log(`✅ Bot connected: @${botInfo.username}\n`);
    } catch (error) {
      console.error(`❌ Bot connection failed: ${error.message}\n`);
      process.exit(1);
    }
    
    // Test 2: Send simple message
    console.log('📤 Test 2: Sending simple test message...');
    try {
      const result = await bot.sendMessage(
        chatId,
        '✅ <b>Test Message</b>\n\nThis is a test message from your School Management System.\n\nIf you received this, your Telegram integration is working correctly!',
        { parse_mode: 'HTML' }
      );
      console.log('✅ Simple message sent successfully!');
      console.log(`   Message ID: ${result.message_id}\n`);
    } catch (error) {
      console.error(`❌ Failed to send simple message: ${error.message}`);
      if (error.response?.body) {
        console.error(`   Error Code: ${error.response.body.error_code}`);
        console.error(`   Description: ${error.response.body.description}`);
        
        if (error.response.body.error_code === 403) {
          console.error('\n   → Bot was blocked by user or chat not found');
          console.error('   → Make sure you have started a conversation with the bot');
        } else if (error.response.body.error_code === 400) {
          console.error('\n   → Invalid chat ID');
          console.error('   → Make sure you have sent at least one message to the bot first');
        }
      }
      process.exit(1);
    }
    
    // Test 3: Using telegramService
    console.log('📤 Test 3: Using telegramService.sendMessage...');
    try {
      const result = await telegramService.sendMessage(
        chatId,
        '✅ <b>Service Test</b>\n\nThis message was sent using telegramService.sendMessage()',
        { parse_mode: 'HTML' }
      );
      if (result) {
        console.log('✅ Service message sent successfully!\n');
      } else {
        console.error('❌ Service returned null (bot not initialized)\n');
      }
    } catch (error) {
      console.error(`❌ Service test failed: ${error.message}\n`);
    }
    
    // Test 4: Using sendAttendanceAlert
    console.log('📤 Test 4: Using telegramService.sendAttendanceAlert...');
    try {
      const result = await telegramService.sendAttendanceAlert(chatId, {
        studentName: 'Test Student',
        className: 'Test Class',
        date: new Date().toLocaleDateString(),
        status: 'absent',
        remarks: 'This is a test notification'
      });
      if (result) {
        console.log('✅ Attendance alert sent successfully!\n');
      } else {
        console.error('❌ Attendance alert returned null\n');
      }
    } catch (error) {
      console.error(`❌ Attendance alert failed: ${error.message}\n`);
    }
    
    console.log('🎉 All tests completed!');
    console.log('\n💡 If all tests passed, your Telegram integration is working correctly.');
    console.log('   You should have received 3-4 messages in Telegram.');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

sendTestMessage();

