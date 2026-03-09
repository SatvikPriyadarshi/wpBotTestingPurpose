const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const MessageManager = require('./messageManager');
const Scheduler = require('./scheduler');

class WhatsAppBot {
    constructor() {
        this.config = config;
        this.messageManager = new MessageManager(config);
        this.scheduler = null;
        this.client = null;
        this.isReady = false;
    }

    // Initialize the bot
    async initialize() {
        console.log('🚀 Initializing WhatsApp Automated Messaging Bot...');
        console.log('========================================');
        
        // Load messages
        console.log('📝 Loading messages...');
        const messagesLoaded = await this.messageManager.loadMessages();
        if (!messagesLoaded) {
            console.error('❌ Failed to load messages. Exiting...');
            process.exit(1);
        }
        
        // Initialize WhatsApp client
        this.client = new Client({
            authStrategy: new LocalAuth({
                dataPath: './'
            }),
            puppeteer: config.whatsapp.puppeteer
        });
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Initialize scheduler
        this.scheduler = new Scheduler(this, this.messageManager, config);
        
        // Start the client
        console.log('🔗 Connecting to WhatsApp...');
        this.client.initialize();
    }

    // Set up WhatsApp client event handlers
    setupEventHandlers() {
        // QR code generation
        this.client.on('qr', (qr) => {
            console.log('\n📱 Scan this QR code with WhatsApp:');
            console.log('1. Open WhatsApp on your phone');
            console.log('2. Go to Settings → Linked Devices → Link a Device');
            console.log('3. Scan the QR code below:\n');
            qrcode.generate(qr, { small: true });
        });

        // Client ready
        this.client.on('ready', () => {
            console.log('\n✅ WhatsApp client is ready!');
            console.log('🤖 Bot is now active and will send messages automatically');
            this.isReady = true;
            
            // Schedule messages
            this.scheduler.scheduleDailyMessages();
            
            // Show initial stats
            this.showStats();
        });

        // Authentication failure
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
            console.log('Please delete session.json and try again');
        });

        // Disconnected
        this.client.on('disconnected', (reason) => {
            console.log('🔌 Client was logged out:', reason);
            this.isReady = false;
        });

        // Message sent
        this.client.on('message_create', (msg) => {
            // Ignore messages sent by the bot itself
            if (msg.fromMe) {
                console.log(`📤 Message sent to ${msg.to}: ${msg.body.substring(0, 50)}...`);
            }
        });
    }

    // Send a message to the target number
    async sendMessage(text) {
        if (!this.isReady) {
            throw new Error('WhatsApp client is not ready');
        }
        
        try {
            // Get the contact first to ensure proper chat ID (same as working quickTest)
            const contact = await this.client.getNumberId(this.config.targetNumber);
            if (!contact) {
                throw new Error(`Number ${this.config.targetNumber} is not registered on WhatsApp`);
            }
            
            const result = await this.client.sendMessage(contact._serialized, text);
            return result;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    // Send a test message immediately
    async sendTestMessage(category = 'morning') {
        console.log(`Sending test ${category} message...`);
        try {
            const message = this.messageManager.getRandomMessage(category);
            await this.sendMessage(message);
            console.log(`✅ Test ${category} message sent: ${message.substring(0, 50)}...`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send test ${category} message:`, error);
            return false;
        }
    }

    // Show current statistics
    showStats() {
        const stats = this.messageManager.getStats();
        console.log('\n📊 Current Message Statistics:');
        console.log('=============================');
        console.log(`🌅 Morning Messages: ${stats.morning.remaining}/${stats.morning.total} remaining`);
        console.log(`🌙 Night Messages: ${stats.night.remaining}/${stats.night.total} remaining`);
        console.log(`😊 Random Messages: ${stats.random.remaining}/${stats.random.total} remaining`);
        console.log('=============================\n');
    }

    // Graceful shutdown
    async shutdown() {
        console.log('\n🛑 Shutting down bot...');
        
        if (this.scheduler) {
            this.scheduler.stopAllJobs();
        }
        
        if (this.client) {
            await this.client.destroy();
        }
        
        console.log('✅ Bot shutdown complete');
        process.exit(0);
    }
}

// Main execution
const bot = new WhatsAppBot();

// Handle graceful shutdown
process.on('SIGINT', () => bot.shutdown());
process.on('SIGTERM', () => bot.shutdown());

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    bot.shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the bot
bot.initialize().catch(error => {
    console.error('Failed to initialize bot:', error);
    process.exit(1);
});

// Export for testing
module.exports = WhatsAppBot;