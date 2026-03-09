// Configuration for WhatsApp Automated Messaging Bot
require('dotenv').config();

module.exports = {
    // Target phone number (with country code, no +)
    // Set in .env file: TARGET_NUMBER=919876543210
    targetNumber: process.env.TARGET_NUMBER || process.env.GIRLFRIEND_NUMBER || "YOUR_TARGET_PHONE_NUMBER",
    
    // Timing configuration (in 24-hour format)
    timing: {
        // Morning message window (6:30 AM to 8:30 AM)
        morning: {
            startHour: 6,
            startMinute: 30,
            endHour: 8,
            endMinute: 30
        },
        // Night message window (10:00 PM to 12:00 AM)
        night: {
            startHour: 22,
            startMinute: 0,
            endHour: 0,
            endMinute: 0
        },
        // Random daytime message (optional)
        randomDay: {
            enabled: true,
            startHour: 12,
            startMinute: 0,
            endHour: 18,
            endMinute: 0
        }
    },
    
    // Message configuration
    messages: {
        // Paths to message files
        morningFile: './data/morningMessages.json',
        nightFile: './data/nightMessages.json',
        randomFile: './data/randomSmileMessages.json',
        usedFile: './data/usedMessages.json'
    },
    
    // WhatsApp configuration
    whatsapp: {
        // Session file for persistence
        sessionFile: './session.json',
        // Puppeteer options
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    },
    
    // Logging configuration
    logging: {
        level: 'info', // 'debug', 'info', 'warn', 'error'
        logToFile: false,
        logFile: './bot.log'
    }
};