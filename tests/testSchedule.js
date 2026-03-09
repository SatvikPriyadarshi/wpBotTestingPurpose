// Test script to send a scheduled message - EXACT COPY of quickTest with cron
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const config = require('../src/config');
const MessageManager = require('../src/messageManager');

async function runTest() {
    console.log('🧪 Test Mode: Scheduling message for 15:56 IST');
    console.log('===============================================\n');
    
    // Load messages
    const messageManager = new MessageManager(config);
    const loaded = await messageManager.loadMessages();
    
    if (!loaded) {
        console.error('❌ Failed to load messages');
        return;
    }
    
    // Initialize WhatsApp client
    const client = new Client({
        authStrategy: new LocalAuth({
            dataPath: './'
        }),
        puppeteer: config.whatsapp.puppeteer
    });
    
    // QR code handler
    client.on('qr', (qr) => {
        console.log('\n📱 Scan this QR code with WhatsApp:');
        qrcode.generate(qr, { small: true });
    });
    
    // Ready handler
    client.on('ready', async () => {
        console.log('\n✅ WhatsApp client is ready!');
        console.log(`📱 Target number: ${config.girlfriendNumber}`);
        console.log(`⏰ Current time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\n`);
        
        // Schedule for 15:56 IST
        const cronExpression = '56 15 * * *';
        
        console.log(`📅 Scheduling message for 15:56:00 IST`);
        console.log(`⏰ Cron expression: ${cronExpression}`);
        console.log(`⏳ Waiting for scheduled time...\n`);
        
        const job = cron.schedule(cronExpression, async () => {
            try {
                console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`⏰ TRIGGERED AT: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
                
                const message = await messageManager.getRandomMessage('random');
                
                console.log(`📤 Sending test message...`);
                console.log(`💌 Message: "${message}"`);
                
                // Get the contact first to ensure proper chat ID - EXACT SAME AS QUICKTEST
                const contact = await client.getNumberId(config.girlfriendNumber);
                if (!contact) {
                    throw new Error(`Number ${config.girlfriendNumber} is not registered on WhatsApp`);
                }
                
                console.log(`📞 Resolved chat ID: ${contact._serialized}\n`);
                const result = await client.sendMessage(contact._serialized, message);
                
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`✅ MESSAGE SENT SUCCESSFULLY!`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`📊 Message ID: ${result.id._serialized}`);
                console.log(`📍 Sent to: ${result.to}`);
                console.log(`⏰ Timestamp: ${new Date(result.timestamp * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
                
                console.log(`✅ Check your girlfriend's WhatsApp now!`);
                console.log(`🛑 Stopping bot in 3 seconds...\n`);
                
                setTimeout(async () => {
                    job.stop();
                    await client.destroy();
                    process.exit(0);
                }, 3000);
                
            } catch (error) {
                console.error(`\n❌ ERROR SENDING MESSAGE:`);
                console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.error(error);
                console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });
        
        console.log(`✅ Message scheduled successfully!`);
        console.log(`📍 Will send at: 15:56:00 IST`);
        console.log(`\n💡 Keep this window open and wait...`);
        console.log(`🛑 Press Ctrl+C to cancel\n`);
    });
    
    // Error handlers
    client.on('auth_failure', (msg) => {
        console.error('❌ Authentication failed:', msg);
    });
    
    client.on('disconnected', (reason) => {
        console.log('🔌 Client disconnected:', reason);
    });
    
    // Start client
    client.initialize();
}

// Handle shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Test cancelled by user');
    process.exit(0);
});

// Run the test
runTest().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
