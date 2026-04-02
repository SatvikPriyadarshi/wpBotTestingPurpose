# WhatsApp Automated Messaging Bot

An automated WhatsApp bot for testing cron-based message scheduling with randomized timing and non-repeating message selection.

## Features

- **Scheduled Morning Messages**: Sends messages between 6:30 AM and 8:30 AM (randomized)
- **Scheduled Night Messages**: Sends messages between 10:00 PM and 12:00 AM (randomized)
- **Random Daytime Messages**: Optional random message during the day (12 PM - 6 PM)
- **Non-Repeating Logic**: Messages are never repeated until all are used
- **QR Code Authentication**: Easy WhatsApp Web authentication
- **Cron-Based Scheduling**: Reliable node-cron implementation with timezone support
- **Health Check Endpoint**: HTTP endpoint for monitoring bot status
- **Production Ready**: Error handling, logging, and clean structure

## Installation

1. **Install Node.js** (v14 or higher)
2. **Clone or download** this project
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Configure the bot**:
   - Copy `.env.example` to `.env`
   - Edit `.env` and add the target phone number with country code
   - Example: `TARGET_NUMBER=919876543210` (for India)

## Deployment

### Local Development
Run locally for testing:
```bash
npm start
```

### Production Deployment (Free 24/7)
Deploy to Oracle Cloud Free Tier for completely free 24/7 hosting:

📚 **[Complete Deployment Guide](DEPLOYMENT.md)** - Detailed step-by-step instructions

⚡ **[Quick Start Guide](QUICK-START.md)** - 5-minute fast setup

The deployment includes:
- ✅ Free forever (Oracle Cloud Free Tier)
- ✅ 24/7 uptime with PM2
- ✅ Auto-restart on crash
- ✅ Auto-start on server reboot
- ✅ Persistent WhatsApp session storage
4. **Configure the bot**:
   - Open `config.js` and set your girlfriend's phone number
   - Add more messages to the JSON files if desired

## Usage

1. **Start the bot**:
   ```bash
   npm start
   ```

2. **Authenticate with WhatsApp**:
   - A QR code will appear in the terminal
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices → Link a Device
   - Scan the QR code

3. **The bot will run automatically**:
   - Messages will be sent at randomized times within configured windows
   - All activities are logged in the console with timestamps
   - Used messages are tracked in `data/usedMessages.json`
   - Cron jobs run in IST timezone by default

## File Structure

```
whatsapp-romantic-bot/
├── src/                    # Source code
│   ├── bot.js             # Main bot logic
│   ├── config.js          # Configuration settings
│   ├── messageManager.js  # Message selection and tracking
│   └── scheduler.js       # Cron job scheduling
├── data/                   # Data files
│   ├── morningMessages.json    # 100+ good morning messages
│   ├── nightMessages.json      # 100+ good night messages  
│   ├── randomSmileMessages.json # 190+ random daytime messages
│   └── usedMessages.json       # Tracks used messages
├── tests/                  # Test scripts
│   ├── quickTest.js       # Quick immediate message test
│   └── testSchedule.js    # Scheduled message test
├── index.js               # Entry point
├── package.json           # Dependencies
├── .env                   # Environment variables (create this)
├── .env.example           # Example environment file
└── README.md              # This file
```

## How It Works

1. **Authentication**: Uses WhatsApp Web QR code to connect your account
2. **Scheduling**: Uses node-cron to schedule messages at randomized times within configured windows
3. **Message Selection**: Randomly picks messages from categories and ensures no repeats
4. **Contact Resolution**: Uses `getNumberId()` to properly resolve WhatsApp contact IDs
5. **Tracking**: Maintains a used messages list in JSON format
6. **Fallback**: If all messages are used, reshuffles and starts again

## Important Notes

- This bot uses your personal WhatsApp account
- Messages are sent from your number to the configured target number
- Session data is stored locally and should be kept secure
- This is for testing and educational purposes
- WhatsApp may detect automation - use responsibly and within their terms of service

## Testing

Before running in production, test the bot:

```bash
# Quick test - sends message immediately after connection
npm test

# Scheduled test - tests cron scheduling at specific time
npm run test:schedule
```

Both tests include detailed console logging to verify message delivery.

## Health Check Endpoints

The bot includes HTTP endpoints for monitoring:

### `/health` - Detailed health status
```bash
curl http://localhost:3000/health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "uptimeFormatted": "1h",
  "whatsapp": {
    "connected": true,
    "status": "connected"
  },
  "messages": {
    "morning": { "total": 100, "used": 5, "remaining": 95 },
    "night": { "total": 101, "used": 3, "remaining": 98 },
    "random": { "total": 191, "used": 10, "remaining": 181 }
  }
}
```

### `/status` - Simple status check
```bash
curl http://localhost:3000/status
```

### `/ping` - Minimal ping endpoint
```bash
curl http://localhost:3000/ping
# Returns: pong
```

**Use with UptimeRobot or similar services** to monitor your bot 24/7.

## Troubleshooting

- **QR code not working**: Ensure WhatsApp is updated on your phone
- **Messages not sending**: Check internet connection and phone number format (must include country code)
- **Bot crashes**: Check logs for error messages
- **Session issues**: Delete `.wwebjs_auth/` folder and re-authenticate
- **Wrong timezone**: Update timezone in `.env` file (default: IST)

## License

MIT - Use responsibly and with consent.