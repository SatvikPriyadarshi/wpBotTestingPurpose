// Quick test - sends message immediately
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('../src/config');

async function quickTest() {
    console.log('🧪 Quick Test - Will send message immediately after connecting');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const client = new Client({
        authStrategy: new LocalAuth({
            dataPath: './'
        }),
        puppeteer: config.whatsapp.puppeteer
    });
    
    client.on('qr', (qr) => {
        console.log('\n📱 Scan this QR code with WhatsApp:');
        qrcode.generate(qr, { small: true });
    });
    
    client.on('ready', async () => {
        console.log('\n✅ WhatsApp client is ready!');
        console.log(`📱 Target number: ${config.girlfriendNumber}`);
        console.log(`⏰ Current time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\n`);
        
        try {
            const testMessage = '🧪 Test message from WhatsApp Bot - If you see this, the bot is working! ❤️';
            
            console.log(`📤 Sending test message...`);
            console.log(`💌 Message: "${testMessage}"`);
            
            // Get the contact first to ensure proper chat ID
            const contact = await client.getNumberId(config.girlfriendNumber);
            if (!contact) {
                throw new Error(`Number ${config.girlfriendNumber} is not registered on WhatsApp`);
            }
            
            console.log(`📞 Resolved chat ID: ${contact._serialized}\n`);
            const result = await client.sendMessage(contact._serialized, testMessage);
            
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
                await client.destroy();
                process.exit(0);
            }, 3000);
            
        } catch (error) {
            console.error(`\n❌ ERROR SENDING MESSAGE:`);
            console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.error(error);
            console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
            process.exit(1);
        }
    });
    
    client.on('auth_failure', (msg) => {
        console.error('❌ Authentication failed:', msg);
        process.exit(1);
    });
    
    client.initialize();
}

process.on('SIGINT', () => {
    console.log('\n🛑 Test cancelled');
    process.exit(0);
});

quickTest();
