require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
  process.exit(1);
}

console.log('🔍 Testing Telegram Bot Connection...\n');
console.log(`Token: ${token.substring(0, 10)}...${token.substring(token.length - 5)}\n`);

// Create bot instance
const bot = new TelegramBot(token, { polling: false });

// Test bot connection
async function testBot() {
  try {
    console.log('📡 Connecting to Telegram API...');
    
    // Get bot info
    const botInfo = await bot.getMe();
    
    console.log('\n✅ Bot connection successful!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Bot Information:');
    console.log(`  ID: ${botInfo.id}`);
    console.log(`  Username: @${botInfo.username}`);
    console.log(`  First Name: ${botInfo.first_name}`);
    console.log(`  Can Join Groups: ${botInfo.can_join_groups ? 'Yes' : 'No'}`);
    console.log(`  Can Read All Group Messages: ${botInfo.can_read_all_group_messages ? 'Yes' : 'No'}`);
    console.log(`  Supports Inline Queries: ${botInfo.supports_inline_queries ? 'Yes' : 'No'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Test sending a message (optional - requires chat ID)
    const testChatId = process.env.TEST_CHAT_ID;
    if (testChatId) {
      console.log(`📤 Sending test message to chat ID: ${testChatId}...`);
      try {
        await bot.sendMessage(
          testChatId,
          '✅ <b>Test Message</b>\n\nYour Telegram bot is working correctly!\n\nThis is a test message from your School Management System.',
          { parse_mode: 'HTML' }
        );
        console.log('✅ Test message sent successfully!\n');
      } catch (error) {
        console.log(`⚠️  Could not send test message: ${error.message}`);
        console.log('   (This is normal if you haven\'t set TEST_CHAT_ID or haven\'t started a conversation with the bot)\n');
      }
    } else {
      console.log('💡 Tip: To test sending messages, add TEST_CHAT_ID to your .env file');
      console.log('   You can get your chat ID by:');
      console.log('   1. Starting a conversation with your bot');
      console.log('   2. Running: node scripts/get-telegram-chat-id.js YOUR_BOT_TOKEN\n');
    }
    
    console.log('🎉 Telegram bot is ready to use!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error testing bot:');
    console.error(`   ${error.message}`);
    
    if (error.response) {
      console.error(`   Status Code: ${error.response.statusCode}`);
      console.error(`   Error Code: ${error.response.body?.error_code}`);
      console.error(`   Description: ${error.response.body?.description}`);
      
      if (error.response.body?.error_code === 401) {
        console.error('\n   → Invalid bot token. Please check your TELEGRAM_BOT_TOKEN in .env');
      }
    }
    
    process.exit(1);
  }
}

testBot();

