const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');
const config = require('./config');
const MessageManager = require('./messageManager');
const Scheduler = require('./scheduler');
const HealthCheckServer = require('./healthCheck');

class WhatsAppBot {
    constructor() {
        this.config = config;
        this.messageManager = new MessageManager(config);
        this.scheduler = null;
        this.sock = null;
        this.isReady = false;
        this.healthCheck = null;
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
        
        // Initialize scheduler
        this.scheduler = new Scheduler(this, this.messageManager, config);
        
        // Start health check server
        const healthPort = process.env.PORT || 3000;
        this.healthCheck = new HealthCheckServer(this, healthPort);
        this.healthCheck.start();
        
        // Start WhatsApp connection
        await this.connectToWhatsApp();
    }

    async connectToWhatsApp() {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
        const { version } = await fetchLatestBaileysVersion();

        console.log('🔗 Connecting to WhatsApp servers...');
        console.log(`📱 Using WhatsApp version: ${version.join('.')}`);

        this.sock = makeWASocket({
            version,
            logger: P({ level: 'silent' }),
            printQRInTerminal: false,
            auth: state,
            browser: ['WhatsApp Bot', 'Chrome', '10.0'],
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000,
        });

        // Handle connection updates
        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('\n📱 Scan this QR code with WhatsApp:');
                console.log('1. Open WhatsApp on your phone');
                console.log('2. Go to Settings → Linked Devices → Link a Device');
                console.log('3. Scan the QR code below:\n');
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const reason = lastDisconnect?.error?.message || 'Unknown';
                
                console.log(`🔌 Connection closed. Status: ${statusCode}, Reason: ${reason}`);
                console.log('Reconnecting:', shouldReconnect);
                
                if (shouldReconnect) {
                    setTimeout(() => this.connectToWhatsApp(), 5000);
                } else {
                    console.log('❌ Logged out. Please restart the bot.');
                    this.isReady = false;
                }
            } else if (connection === 'open') {
                console.log('\n✅ WhatsApp client is ready!');
                console.log('🤖 Bot is now active and will send messages automatically');
                this.isReady = true;
                
                // Schedule messages
                this.scheduler.scheduleDailyMessages();
                
                // Show initial stats
                this.showStats();
            }
        });

        // Save credentials whenever they update
        this.sock.ev.on('creds.update', saveCreds);
    }

    // Send a message to the target number with retry logic
    async sendMessage(text, retries = 3) {
        if (!this.isReady) {
            console.error('❌ Cannot send message: WhatsApp client is not ready');
            throw new Error('WhatsApp client is not ready');
        }
        
        const jid = this.config.targetNumber + '@s.whatsapp.net';
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`📤 Attempting to send message (attempt ${attempt}/${retries})...`);
                console.log(`📱 Target: ${this.config.targetNumber}`);
                console.log(`💬 Message preview: ${text.substring(0, 50)}...`);
                
                const result = await this.sock.sendMessage(jid, { text }, {
                    timeout: 30000 // 30 second timeout
                });
                
                console.log(`✅ Message sent successfully on attempt ${attempt}!`);
                console.log(`📊 Message ID: ${result.key.id}`);
                return result;
            } catch (error) {
                console.error(`❌ Send attempt ${attempt} failed:`, error.message);
                
                if (attempt < retries) {
                    const waitTime = attempt * 5000; // 5s, 10s, 15s
                    console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    console.error(`❌ All ${retries} send attempts failed!`);
                    console.error('Full error:', error);
                    throw error;
                }
            }
        }
    }

    // Send a test message immediately
    async sendTestMessage(category = 'morning') {
        console.log(`\n🧪 Testing ${category} message send...`);
        console.log(`⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
        
        try {
            const message = await this.messageManager.getRandomMessage(category);
            console.log(`📝 Selected message: "${message.substring(0, 100)}..."`);
            
            await this.sendMessage(message);
            
            console.log(`✅ ${category} message sent successfully!`);
            console.log(`📊 Stats updated\n`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send ${category} message after all retries`);
            console.error('Error details:', error.message);
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
        
        if (this.healthCheck) {
            this.healthCheck.stop();
        }
        
        if (this.scheduler) {
            this.scheduler.stopAllJobs();
        }
        
        if (this.sock) {
            await this.sock.logout();
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
