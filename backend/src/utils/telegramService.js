const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Initialize Telegram Bot
let bot = null;

/**
 * Initialize Telegram Bot
 */
const initializeBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.warn('⚠️  Telegram Bot Token not configured. Telegram notifications disabled.');
    return null;
  }

  try {
    bot = new TelegramBot(token, { polling: false });
    console.log('✅ Telegram Bot initialized successfully');
    return bot;
  } catch (error) {
    console.error('❌ Error initializing Telegram Bot:', error.message);
    return null;
  }
};

// Initialize on module load
if (!bot) {
  bot = initializeBot();
}

/**
 * Re-initialize the bot (useful after updating .env)
 */
const reinitializeBot = () => {
  bot = null;
  return initializeBot();
};

/**
 * Send Telegram message to a chat ID
 * @param {string|number} chatId - Telegram chat ID
 * @param {string} message - Message text (supports HTML formatting)
 * @param {object} options - Additional options (parse_mode, etc.)
 * @returns {Promise<object>} Telegram API response
 */
const sendMessage = async (chatId, message, options = {}) => {
  if (!bot) {
    console.warn('Telegram bot not initialized. Message not sent:', message.substring(0, 50));
    return null;
  }

  if (!chatId) {
    console.warn('No Telegram chat ID provided. Message not sent.');
    return null;
  }

  try {
    const defaultOptions = {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options
    };

    const result = await bot.sendMessage(chatId, message, defaultOptions);
    console.log(`✅ Telegram message sent to chat ${chatId}`);
    return result;
  } catch (error) {
    console.error(`❌ Error sending Telegram message to ${chatId}:`, error.message);
    
    // Handle common errors
    if (error.response?.body?.error_code === 403) {
      console.error('   → Bot was blocked by user or chat not found');
    } else if (error.response?.body?.error_code === 400) {
      console.error('   → Invalid chat ID or message format');
    }
    
    return null;
  }
};

/**
 * Format message with HTML tags for Telegram
 * @param {string} text - Plain text
 * @returns {string} HTML formatted text
 */
const formatBold = (text) => `<b>${escapeHtml(text)}</b>`;
const formatItalic = (text) => `<i>${escapeHtml(text)}</i>`;
const formatCode = (text) => `<code>${escapeHtml(text)}</code>`;
const formatLink = (text, url) => `<a href="${url}">${escapeHtml(text)}</a>`;

/**
 * Escape HTML special characters
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Send attendance alert to parent
 */
const sendAttendanceAlert = async (chatId, studentData) => {
  const { studentName, className, date, status, remarks } = studentData;
  
  const message = `
${formatBold('📋 Attendance Alert')}

${formatBold('Student:')} ${studentName}
${formatBold('Class:')} ${className}
${formatBold('Date:')} ${date}
${formatBold('Status:')} ${status === 'absent' ? '❌ Absent' : status === 'late' ? '⏰ Late' : '✅ Present'}

${remarks ? `${formatBold('Remarks:')} ${remarks}` : ''}

Please contact the school if you have any questions.
  `.trim();

  return await sendMessage(chatId, message);
};

/**
 * Send fee reminder to parent
 */
const sendFeeReminder = async (chatId, feeData) => {
  const { studentName, feeType, amount, dueDate, status } = feeData;
  
  const message = `
${formatBold('💰 Fee Reminder')}

${formatBold('Student:')} ${studentName}
${formatBold('Fee Type:')} ${feeType}
${formatBold('Amount:')} $${amount}
${formatBold('Due Date:')} ${dueDate}
${formatBold('Status:')} ${status === 'overdue' ? '⚠️ Overdue' : '⏳ Pending'}

Please make payment before the due date to avoid late fees.
  `.trim();

  return await sendMessage(chatId, message);
};

/**
 * Send maintenance alert
 */
const sendMaintenanceAlert = async (chatId, maintenanceData) => {
  const { assetName, maintenanceType, scheduledDate, description } = maintenanceData;
  
  const message = `
${formatBold('🔧 Maintenance Alert')}

${formatBold('Asset:')} ${assetName}
${formatBold('Type:')} ${maintenanceType}
${formatBold('Scheduled Date:')} ${scheduledDate}

${description ? `${formatBold('Description:')} ${description}` : ''}

Please ensure the maintenance is completed on time.
  `.trim();

  return await sendMessage(chatId, message);
};

/**
 * Send announcement notification
 */
const sendAnnouncementNotification = async (chatId, announcementData) => {
  const { title, content, priority, targetAudience } = announcementData;
  
  const priorityEmoji = {
    low: '📢',
    medium: '📣',
    high: '🔔',
    urgent: '🚨'
  };

  const message = `
${formatBold(`${priorityEmoji[priority] || '📢'} ${title}`)}

${content}

${formatItalic(`Priority: ${priority} | Audience: ${targetAudience}`)}
  `.trim();

  return await sendMessage(chatId, message);
};

/**
 * Send event reminder
 */
const sendEventReminder = async (chatId, eventData) => {
  const { title, type, date, time, location, description } = eventData;
  
  const typeEmoji = {
    PTM: '👨‍👩‍👧',
    Exam: '📝',
    Holiday: '🎉',
    Sports: '⚽',
    Cultural: '🎭',
    Other: '📅'
  };

  const message = `
${formatBold(`${typeEmoji[type] || '📅'} ${title}`)}

${formatBold('Date:')} ${date}
${formatBold('Time:')} ${time}
${location ? `${formatBold('Location:')} ${location}` : ''}

${description ? `${description}` : ''}

Don't forget to attend!
  `.trim();

  return await sendMessage(chatId, message);
};

/**
 * Send generic notification
 */
const sendNotification = async (chatId, title, content, options = {}) => {
  const message = `
${formatBold(title)}

${content}
  `.trim();

  return await sendMessage(chatId, message, options);
};

module.exports = {
  initializeBot,
  reinitializeBot,
  sendMessage,
  sendAttendanceAlert,
  sendFeeReminder,
  sendMaintenanceAlert,
  sendAnnouncementNotification,
  sendEventReminder,
  sendNotification,
  formatBold,
  formatItalic,
  formatCode,
  formatLink,
  escapeHtml
};

