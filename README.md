# WhatsApp Automated Messaging Bot

An automated WhatsApp bot for testing cron-based message scheduling with randomized timing and non-repeating message selection.

## Features

- **Scheduled Morning Messages**: Sends messages between 6:30 AM and 8:30 AM (randomized)
- **Scheduled Night Messages**: Sends messages between 10:00 PM and 12:00 AM (randomized)
- **Random Daytime Messages**: Optional random message during the day (12 PM - 6 PM)
- **Non-Repeating Logic**: Messages are never repeated until all are used
- **QR Code Authentication**: Easy WhatsApp Web authentication
- **Cron-Based Scheduling**: Reliable node-cron implementation with timezone support
- **Production Ready**: Error handling, logging, and clean structure

## Installation

1. **Install Node.js** (v14 or higher)
2. **Clone or download** this project
3. **Install dependencies**:
   ```bash
   npm install
   ```
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

## Troubleshooting

- **QR code not working**: Ensure WhatsApp is updated on your phone
- **Messages not sending**: Check internet connection and phone number format (must include country code)
- **Bot crashes**: Check logs for error messages
- **Session issues**: Delete `.wwebjs_auth/` folder and re-authenticate
- **Wrong timezone**: Update timezone in `.env` file (default: IST)

## License

MIT - Use responsibly and with consent.