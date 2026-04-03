const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');
const fs = require('fs');
const config = require('./config');
const MessageManager = require('./messageManager');
const Scheduler = require('./scheduler');
const HealthCheckServer = require('./healthCheck');

const AUTH_DIR = './auth_info_baileys';

class WhatsAppBot {
    constructor() {
        this.config = config;
        this.messageManager = new MessageManager(config);
        this.scheduler = null;
        this.sock = null;
        this.isReady = false;
        this.healthCheck = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
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

    clearAuthSession() {
        console.log('🗑️ Clearing corrupted auth session...');
        try {
            if (fs.existsSync(AUTH_DIR)) {
                fs.rmSync(AUTH_DIR, { recursive: true, force: true });
                console.log('Auth session cleared. You will need to scan QR code again.');
            }
        } catch (err) {
            console.error('Failed to clear auth session:', err.message);
        }
    }

    async connectToWhatsApp() {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
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
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const reason = lastDisconnect?.error?.message || 'Unknown';
                this.isReady = false;

                console.log(`🔌 Connection closed. Status: ${statusCode}, Reason: ${reason}`);

                if (statusCode === DisconnectReason.loggedOut) {
                    console.log('❌ Logged out. Clearing session — restart to re-scan QR.');
                    this.clearAuthSession();
                    return;
                }

                // Bad MAC / session corruption — clear session and force re-auth
                if (statusCode === DisconnectReason.badSession || statusCode === 500) {
                    console.log('⚠️ Bad session detected. Clearing auth and reconnecting...');
                    this.clearAuthSession();
                    this.reconnectAttempts = 0;
                    setTimeout(() => this.connectToWhatsApp(), 5000);
                    return;
                }

                // Do NOT delete auth here — transient disconnects (515, 408, network) are common.
                // Clearing session after N failures forced unnecessary QR rescans. Only clear on
                // loggedOut, badSession, or explicit Bad MAC recovery paths above.
                this.reconnectAttempts++;
                const cappedAttempt = Math.min(this.reconnectAttempts, 12);
                const delay = Math.min(5000 * cappedAttempt, 120000);
                if (this.reconnectAttempts > this.maxReconnectAttempts) {
                    console.warn(
                        `⚠️ Many reconnect failures (${this.reconnectAttempts}). ` +
                            `Keeping saved session — will retry (network/server blips are normal).`
                    );
                }
                console.log(`🔄 Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts})...`);
                setTimeout(() => this.connectToWhatsApp(), delay);

            } else if (connection === 'open') {
                console.log('\n✅ WhatsApp client is ready!');
                console.log('🤖 Bot is now active and will send messages automatically');
                this.isReady = true;
                this.reconnectAttempts = 0;

                // scheduleDailyMessages now reuses today's times if already set
                this.scheduler.scheduleDailyMessages();

                this.showStats();
            }
        });

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
